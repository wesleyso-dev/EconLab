import { isCovered, type PlacedAxisValue } from './axisValues';
import { useGraph } from './context';
import { formatNumber } from './format';
import { niceStep, niceTicks } from './scale';
import styles from './graph.module.css';

/** Hairline grid, axis baselines, tick labels and axis titles. */
export function Axes({
  qLabel,
  pLabel,
  axisValues,
}: {
  qLabel: string;
  pLabel: string;
  /** Marked values; tick labels they would cover are hidden. */
  axisValues: readonly PlacedAxisValue[];
}) {
  const { q, p, plot } = useGraph();
  const qTicks = niceTicks(q.domain[0], q.domain[1], Math.max(2, Math.round(plot.width / 80)));
  const pTicks = niceTicks(p.domain[0], p.domain[1], Math.max(2, Math.round(plot.height / 56)));
  const qDigits = digitsFor(q.domain);
  const pDigits = digitsFor(p.domain);
  const bottom = plot.top + plot.height;
  const right = plot.left + plot.width;

  return (
    <g className={styles.axes} aria-hidden="true">
      {qTicks.map((t) => (
        <line
          key={`qg${t}`}
          className={styles.grid}
          x1={q.toPx(t)}
          x2={q.toPx(t)}
          y1={plot.top}
          y2={bottom}
        />
      ))}
      {pTicks.map((t) => (
        <line
          key={`pg${t}`}
          className={styles.grid}
          x1={plot.left}
          x2={right}
          y1={p.toPx(t)}
          y2={p.toPx(t)}
        />
      ))}
      <line className={styles.baseline} x1={plot.left} x2={right} y1={bottom} y2={bottom} />
      <line className={styles.baseline} x1={plot.left} x2={plot.left} y1={plot.top} y2={bottom} />
      {qTicks.map((t) => {
        const text = formatNumber(t, qDigits);
        if (isCovered(axisValues, 'q', q.toPx(t), text)) return null;
        return (
          <text
            key={`qt${t}`}
            className={styles.tick}
            x={q.toPx(t)}
            y={bottom + 18}
            textAnchor="middle"
          >
            {text}
          </text>
        );
      })}
      {pTicks.map((t) => {
        const text = formatNumber(t, pDigits);
        if (isCovered(axisValues, 'p', p.toPx(t), text)) return null;
        return (
          <text
            key={`pt${t}`}
            className={styles.tick}
            x={plot.left - 8}
            y={p.toPx(t) + 4}
            textAnchor="end"
          >
            {text}
          </text>
        );
      })}
      <text className={styles.axisTitle} x={right} y={bottom + 38} textAnchor="end">
        {qLabel}
      </text>
      <text className={styles.axisTitle} x={plot.left - 8} y={plot.top - 12} textAnchor="start">
        {pLabel}
      </text>
    </g>
  );
}

function digitsFor(domain: readonly [number, number]): number {
  const step = niceStep(domain[1] - domain[0], 5);
  return Math.max(0, -Math.floor(Math.log10(step)));
}
