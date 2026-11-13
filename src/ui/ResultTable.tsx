import { useId, useLayoutEffect } from 'react';
import type { AreaTone } from '../graph';
import { formatNumber } from '../graph';
import { useScenarioRegistry, type ScenarioRow } from './scenario';
import styles from './ui.module.css';

export interface ResultRow {
  readonly label: string;
  /** One value per column; null renders as a dash. */
  readonly values: readonly (number | null)[];
  /** Matches the shaded region on the graph, shown as a swatch beside the label. */
  readonly tone?: AreaTone;
}

export interface ResultTableProps {
  readonly caption: string;
  readonly columns: readonly string[];
  readonly rows: readonly ResultRow[];
  /**
   * The column that describes the scenario on screen, used when comparing with a
   * pinned baseline. Defaults to the last column (e.g. "With tax").
   */
  readonly current?: number;
}

/** Model results, typically before and after a policy or shift. */
export function ResultTable({ caption, columns, rows, current }: ResultTableProps) {
  const register = useScenarioRegistry();
  const id = useId();
  const column = current ?? columns.length - 1;
  const scenario: ScenarioRow[] = rows.map((row) => ({
    label: row.label,
    value: row.values[column] ?? null,
    tone: row.tone,
  }));
  // Serialized so the effect only re-registers when a value actually changes.
  const scenarioKey = JSON.stringify(scenario);

  useLayoutEffect(() => {
    register(id, JSON.parse(scenarioKey) as ScenarioRow[]);
  }, [id, scenarioKey, register]);
  useLayoutEffect(() => () => register(id, null), [id, register]);

  return (
    <table className={styles.results}>
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">
            <span className={styles.visuallyHidden}>Measure</span>
          </th>
          {columns.map((column) => (
            <th key={column} scope="col">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <th scope="row">
              {row.tone && <span className={`${styles.swatch} ${styles[row.tone]}`} aria-hidden />}
              {row.label}
            </th>
            {row.values.map((value, i) => (
              <td key={columns[i] ?? i}>{value === null ? '—' : formatNumber(value)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
