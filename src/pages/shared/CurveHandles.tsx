import { useState } from 'react';
import { priceAt, type Line } from '../../econ/core/line';
import { DragHandle } from '../../graph';

export interface CurveHandlesProps {
  /** Used in the handles' accessible names, e.g. "Shift demand". */
  readonly name: string;
  readonly line: Line;
  readonly onChange: (line: Line) => void;
  readonly color: string;
  /** Demand must keep sloping down (-1); supply must keep sloping up (1). */
  readonly slopeSign: -1 | 1;
  /** The graph's domain, shared by both axes. */
  readonly domain: readonly [number, number];
}

/** Minimum quantity gap between the two handles, so the slope stays well defined. */
const GAP = 1;
const STEP = 0.1;

/**
 * Two handles on a straight curve: the first moves it parallel to itself; the second
 * pivots it around the first, changing its slope. Handle positions are remembered,
 * but kept on the visible part of the curve.
 */
export function CurveHandles({
  name,
  line,
  onChange,
  color,
  slopeSign,
  domain,
}: CurveHandlesProps) {
  const [shiftQ, setShiftQ] = useState(3);
  const [rotateQ, setRotateQ] = useState(8);

  const range = visibleRange(line, domain);
  if (!range) return null;
  const [lo, hi] = range;
  const pad = (hi - lo) * 0.05;
  const q0 = clampTo(shiftQ, lo + pad, hi - pad);
  const shiftPoint = { q: q0, p: priceAt(line, q0) };
  const q1 = Math.min(Math.max(rotateQ, q0 + GAP), hi - pad);
  const canRotate = q1 >= q0 + GAP;
  // Keep the pivoted point on the correct side so the slope keeps its sign.
  const pBounds: [number, number] =
    slopeSign < 0 ? [domain[0], shiftPoint.p - STEP] : [shiftPoint.p + STEP, domain[1]];

  return (
    <>
      <DragHandle
        label={`Shift ${name}`}
        color={color}
        point={shiftPoint}
        step={STEP}
        onChange={(pt) => {
          setShiftQ(pt.q);
          onChange({ slope: line.slope, intercept: pt.p - line.slope * pt.q });
        }}
      />
      {canRotate && pBounds[0] < pBounds[1] && (
        <DragHandle
          label={`Change ${name} slope`}
          color={color}
          point={{ q: q1, p: priceAt(line, q1) }}
          step={STEP}
          qBounds={[q0 + GAP, domain[1]]}
          pBounds={pBounds}
          onChange={(pt) => {
            const slope = (pt.p - shiftPoint.p) / (pt.q - shiftPoint.q);
            setRotateQ(pt.q);
            onChange({ slope, intercept: shiftPoint.p - slope * shiftPoint.q });
          }}
        />
      )}
    </>
  );
}

/** The quantities where the line lies inside the plot, or null if it never does. */
function visibleRange(line: Line, domain: readonly [number, number]): [number, number] | null {
  let lo = domain[0];
  let hi = domain[1];
  if (line.slope !== 0) {
    const a = (domain[0] - line.intercept) / line.slope;
    const b = (domain[1] - line.intercept) / line.slope;
    lo = Math.max(lo, Math.min(a, b));
    hi = Math.min(hi, Math.max(a, b));
  } else if (line.intercept < domain[0] || line.intercept > domain[1]) {
    return null;
  }
  return hi > lo ? [lo, hi] : null;
}

function clampTo(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
