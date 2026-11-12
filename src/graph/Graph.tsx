import {
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { Axes } from './Axes';
import { AxisValueChips } from './AxisValueChips';
import { chipWidth, layoutAxisValues, type AxisValueRequest } from './axisValues';
import { GraphContext, type GraphContextValue } from './context';
import { CrosshairMarks, CrosshairTooltip, type CrosshairSeries } from './Crosshair';
import { layoutLabels, type LabelRequest } from './labels';
import { linearScale, type Domain } from './scale';
import styles from './graph.module.css';

export interface GraphProps {
  /** Accessible name, e.g. "Supply and demand with a $3 tax". */
  readonly title: string;
  readonly qDomain: Domain;
  readonly pDomain: Domain;
  readonly qLabel?: string;
  readonly pLabel?: string;
  /** Height as a fraction of width. */
  readonly aspectRatio?: number;
  /** Fixed width in px; by default the graph fills its container. */
  readonly width?: number;
  /** Curves to read out under the pointer. */
  readonly crosshair?: readonly CrosshairSeries[];
  readonly children?: ReactNode;
}

const MARGIN = { top: 28, right: 44, bottom: 44, left: 52 };
const FALLBACK_WIDTH = 640;
const NARROW_WIDTH = 520;

export function Graph({
  title,
  qDomain,
  pDomain,
  qLabel = 'Quantity',
  pLabel = 'Price',
  aspectRatio = 0.72,
  width: fixedWidth,
  crosshair,
  children,
}: GraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<SVGSVGElement | null>(null);
  const measuredWidth = useElementWidth(containerRef, fixedWidth === undefined);
  const width = fixedWidth ?? measuredWidth;
  // Narrow screens get a taller plot so curves aren't squashed.
  const height = Math.round(
    width * (width < NARROW_WIDTH ? Math.max(aspectRatio, 0.95) : aspectRatio),
  );
  const clipId = `clip-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [pointerQ, setPointerQ] = useState<number | null>(null);
  const [labelRequests, registerLabel] = useRegistry<LabelRequest>();
  const [axisValueRequests, registerAxisValue] = useRegistry<AxisValueRequest>();

  // Widen the left margin when a price-axis value (e.g. "ATC 4.39") needs the room.
  let widestPriceValue = 0;
  for (const request of axisValueRequests.values()) {
    if (request.axis === 'p')
      widestPriceValue = Math.max(widestPriceValue, chipWidth(request.text));
  }
  const marginLeft = Math.max(MARGIN.left, widestPriceValue + 6);

  const context = useMemo<GraphContextValue | null>(() => {
    if (width <= 0) return null;
    const plot = {
      left: marginLeft,
      top: MARGIN.top,
      width: Math.max(1, width - marginLeft - MARGIN.right),
      height: Math.max(1, height - MARGIN.top - MARGIN.bottom),
    };
    return {
      q: linearScale(qDomain, [plot.left, plot.left + plot.width]),
      p: linearScale(pDomain, [plot.top + plot.height, plot.top]),
      plot,
      width,
      height,
      clipPath: `url(#${clipId})`,
      svg,
      registerLabel,
      registerAxisValue,
    };
  }, [width, height, marginLeft, qDomain, pDomain, clipId, svg, registerLabel, registerAxisValue]);
  const axisValues = layoutAxisValues(axisValueRequests);

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    if (!context || !crosshair) return;
    const x = event.clientX - event.currentTarget.getBoundingClientRect().left;
    const { left, width: plotWidth } = context.plot;
    setPointerQ(x >= left && x <= left + plotWidth ? context.q.fromPx(x) : null);
  }

  return (
    <div ref={containerRef} className={styles.root}>
      {context && (
        <GraphContext.Provider value={context}>
          <svg
            ref={setSvg}
            className={styles.svg}
            width={width}
            height={height}
            role="img"
            aria-label={title}
            onPointerMove={handlePointerMove}
            onPointerLeave={() => setPointerQ(null)}
          >
            <defs>
              <clipPath id={clipId}>
                <rect
                  x={context.plot.left}
                  y={context.plot.top}
                  width={context.plot.width}
                  height={context.plot.height}
                />
              </clipPath>
            </defs>
            <Axes qLabel={qLabel} pLabel={pLabel} axisValues={axisValues} />
            {children}
            <AxisValueChips values={axisValues} />
            <g aria-hidden="true">
              {layoutLabels(labelRequests).map((label) => (
                <text
                  key={label.id}
                  className={`${styles.curveLabel} ${label.ghost ? styles.ghost : ''}`}
                  x={label.x}
                  y={label.y}
                >
                  {label.text}
                </text>
              ))}
            </g>
            {crosshair && pointerQ !== null && <CrosshairMarks q={pointerQ} series={crosshair} />}
          </svg>
          {crosshair && pointerQ !== null && (
            <CrosshairTooltip q={pointerQ} series={crosshair} qLabel={qLabel} />
          )}
        </GraphContext.Provider>
      )}
    </div>
  );
}

/**
 * A keyed set of requests from child primitives (curve labels, axis values) that the
 * graph lays out together. Re-registering an identical request is a no-op, so
 * children can register from layout effects without causing render loops.
 */
function useRegistry<T>(): [ReadonlyMap<string, T>, (id: string, request: T | null) => void] {
  const [requests, setRequests] = useState<ReadonlyMap<string, T>>(() => new Map());
  const register = useCallback((id: string, request: T | null) => {
    setRequests((previous) => {
      if (request === null) {
        if (!previous.has(id)) return previous;
        const next = new Map(previous);
        next.delete(id);
        return next;
      }
      const existing = previous.get(id);
      if (existing && JSON.stringify(existing) === JSON.stringify(request)) return previous;
      return new Map(previous).set(id, request);
    });
  }, []);
  return [requests, register];
}

/** Tracks an element's content width with ResizeObserver (where available). */
function useElementWidth(ref: RefObject<HTMLElement | null>, enabled: boolean): number {
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!enabled || !element) return;
    if (typeof ResizeObserver === 'undefined') {
      setWidth(element.clientWidth || FALLBACK_WIDTH);
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(Math.floor(entry.contentRect.width));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, enabled]);
  return width;
}
