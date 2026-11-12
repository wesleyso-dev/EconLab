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

/** A labeled point, such as an equilibrium, with drop lines to the axes. */
export function PointMarker({ point, qText, pText, guides = true }: PointMarkerProps) {
  const { q, p, plot } = useGraph();
  const x = q.toPx(point.q);
  const y = p.toPx(point.p);
  const bottom = plot.top + plot.height;
  const inside = x >= plot.left && x <= plot.left + plot.width && y >= plot.top && y <= bottom;
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
      {qText && <AxisValue text={qText} x={x} y={bottom + 18} anchor="middle" />}
      {pText && <AxisValue text={pText} x={plot.left - 8} y={y + 4} anchor="end" />}
    </g>
  );
}

/** Approximate advance width of a 12px semibold digit, for sizing the backing chip. */
const CHAR_WIDTH = 7;

/** An axis value on a surface-colored chip, so it covers any tick label beneath it. */
function AxisValue({
  text,
  x,
  y,
  anchor,
}: {
  text: string;
  x: number;
  y: number;
  anchor: 'middle' | 'end';
}) {
  const width = text.length * CHAR_WIDTH + 10;
  const left = anchor === 'middle' ? x - width / 2 : x - width + 5;
  return (
    <g>
      <rect className={styles.axisChip} x={left} y={y - 12} width={width} height={16} rx={3} />
      <text className={styles.axisValue} x={x} y={y} textAnchor={anchor}>
        {text}
      </text>
    </g>
  );
}
