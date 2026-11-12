import type { Region } from '../econ/core/region';
import { useGraph } from './context';
import { centroid } from './path';
import styles from './graph.module.css';

export type AreaTone = 'demand' | 'supply' | 'social' | 'neutral';

export interface AreaProps {
  readonly region: Region;
  readonly tone: AreaTone;
  /** Short label drawn at the region's centroid when it fits, e.g. "CS". */
  readonly label?: string;
}

/** A shaded region (surplus, deadweight loss, revenue) as a light wash. */
export function Area({ region, tone, label }: AreaProps) {
  const graph = useGraph();
  if (region.polygon.length < 3 || Math.abs(region.area) < 1e-9) return null;

  const points = region.polygon
    .map((pt) => `${graph.q.toPx(pt.q)},${graph.p.toPx(pt.p)}`)
    .join(' ');
  const center = label ? centroid(region.polygon) : null;
  const xs = region.polygon.map((pt) => graph.q.toPx(pt.q));
  const ys = region.polygon.map((pt) => graph.p.toPx(pt.p));
  const fits = Math.max(...xs) - Math.min(...xs) > 28 && Math.max(...ys) - Math.min(...ys) > 16;

  return (
    <g>
      <polygon
        className={`${styles.area} ${styles[tone]}`}
        points={points}
        clipPath={graph.clipPath}
      />
      {center && fits && (
        <text
          className={styles.areaLabel}
          x={graph.q.toPx(center.q)}
          y={graph.p.toPx(center.p) + 4}
          textAnchor="middle"
        >
          {label}
        </text>
      )}
    </g>
  );
}
