import { useGraph } from './context';
import styles from './graph.module.css';

export interface IntervalProps {
  /** Price at which the interval is drawn. */
  readonly p: number;
  readonly from: number;
  readonly to: number;
  /** Text centered above the interval, e.g. "Shortage 4". */
  readonly label?: string;
}

const CAP = 5;

/** A horizontal quantity gap at one price, such as a shortage under a price ceiling. */
export function Interval({ p, from, to, label }: IntervalProps) {
  const graph = useGraph();
  if (!(Math.abs(to - from) > 1e-9)) return null;
  const x0 = graph.q.toPx(Math.min(from, to));
  const x1 = graph.q.toPx(Math.max(from, to));
  const y = graph.p.toPx(p);

  return (
    <g className={styles.interval} clipPath={graph.clipPath}>
      <line x1={x0} x2={x1} y1={y} y2={y} />
      <line x1={x0} x2={x0} y1={y - CAP} y2={y + CAP} />
      <line x1={x1} x2={x1} y1={y - CAP} y2={y + CAP} />
      {label && (
        <text className={styles.areaLabel} x={(x0 + x1) / 2} y={y - 9} textAnchor="middle">
          {label}
        </text>
      )}
    </g>
  );
}
