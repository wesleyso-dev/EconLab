import { useGraph } from './context';
import { formatNumber } from './format';
import { toCurveFn, type CurveSource } from './path';
import styles from './graph.module.css';

export interface CrosshairSeries {
  readonly label: string;
  readonly curve: CurveSource;
  /** CSS color of the curve, used for the line key and the marker dot. */
  readonly color: string;
  readonly dashed?: boolean;
  /** Restrict the readout to a quantity range (e.g. where the curve is drawn). */
  readonly from?: number;
  readonly to?: number;
}

interface Reading {
  readonly series: CrosshairSeries;
  readonly p: number;
}

function readAt(series: readonly CrosshairSeries[], q: number): Reading[] {
  return series.flatMap((s) => {
    if ((s.from !== undefined && q < s.from) || (s.to !== undefined && q > s.to)) return [];
    const p = toCurveFn(s.curve).fn(q);
    return Number.isFinite(p) ? [{ series: s, p }] : [];
  });
}

/** The vertical hairline and a dot where it crosses each curve. */
export function CrosshairMarks({ q, series }: { q: number; series: readonly CrosshairSeries[] }) {
  const graph = useGraph();
  const x = graph.q.toPx(q);
  const [pMin, pMax] = graph.p.domain;
  return (
    <g className={styles.crosshair} aria-hidden="true" data-export="skip">
      <line
        className={styles.hairline}
        x1={x}
        x2={x}
        y1={graph.plot.top}
        y2={graph.plot.top + graph.plot.height}
      />
      {readAt(series, q)
        .filter((r) => r.p >= pMin && r.p <= pMax)
        .map((r) => (
          <circle
            key={r.series.label}
            className={styles.crosshairDot}
            cx={x}
            cy={graph.p.toPx(r.p)}
            r={4}
            style={{ fill: r.series.color }}
          />
        ))}
    </g>
  );
}

/** One tooltip listing every curve's value at the pointer's quantity. */
export function CrosshairTooltip({
  q,
  series,
  qLabel,
}: {
  q: number;
  series: readonly CrosshairSeries[];
  qLabel: string;
}) {
  const graph = useGraph();
  const x = graph.q.toPx(q);
  const flip = x > graph.plot.left + graph.plot.width * 0.6;
  const readings = readAt(series, q);
  return (
    <div
      className={styles.tooltip}
      style={{
        top: graph.plot.top,
        left: flip ? undefined : x + 12,
        right: flip ? graph.width - x + 12 : undefined,
      }}
      aria-hidden="true"
    >
      <div className={styles.tooltipHeader}>
        {qLabel} <strong>{formatNumber(q)}</strong>
      </div>
      {readings.map((r) => (
        <div key={r.series.label} className={styles.tooltipRow}>
          <svg width="14" height="8" aria-hidden="true">
            <line
              x1="0"
              x2="14"
              y1="4"
              y2="4"
              style={{ stroke: r.series.color }}
              strokeWidth={2}
              strokeDasharray={r.series.dashed ? '4 3' : undefined}
            />
          </svg>
          <strong>{formatNumber(r.p)}</strong>
          <span>{r.series.label}</span>
        </div>
      ))}
    </div>
  );
}
