import { useId, useLayoutEffect } from 'react';
import type { Point } from '../econ/core/line';
import { useGraph } from './context';
import styles from './graph.module.css';

export interface PointMarkerProps {
  readonly point: Point;
  /** Text placed on the quantity axis below the point, e.g. "Q* 5". */
  readonly qText?: string;
  /** Text placed on the price axis beside the point, e.g. "P* 5". */
  readonly pText?: string;
  /** Draw dotted drop lines to both axes. */
  readonly guides?: boolean;
}

/**
 * A labeled point, such as an equilibrium, with drop lines to the axes. Its axis
 * values are drawn by the graph, which keeps values from different points apart.
 */
export function PointMarker({ point, qText, pText, guides = true }: PointMarkerProps) {
  const { q, p, plot, registerAxisValue } = useGraph();
  const id = useId();
  const x = q.toPx(point.q);
  const y = p.toPx(point.p);
  const bottom = plot.top + plot.height;
  const inside = x >= plot.left && x <= plot.left + plot.width && y >= plot.top && y <= bottom;
  const qValue = inside && qText ? qText : null;
  const pValue = inside && pText ? pText : null;

  useLayoutEffect(() => {
    registerAxisValue(`${id}q`, qValue === null ? null : { axis: 'q', text: qValue, at: x });
    registerAxisValue(`${id}p`, pValue === null ? null : { axis: 'p', text: pValue, at: y });
  }, [id, qValue, pValue, x, y, registerAxisValue]);
  useLayoutEffect(
    () => () => {
      registerAxisValue(`${id}q`, null);
      registerAxisValue(`${id}p`, null);
    },
    [id, registerAxisValue],
  );

  if (!inside) return null;
  return (
    <g>
      {guides && (
        <>
          <line className={styles.guide} x1={x} x2={x} y1={y} y2={bottom} />
          <line className={styles.guide} x1={plot.left} x2={x} y1={y} y2={y} />
        </>
      )}
      <circle className={styles.point} cx={x} cy={y} r={4} />
    </g>
  );
}
