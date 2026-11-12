import type { AreaTone } from '../graph';
import { formatNumber } from '../graph';
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
}

/** Model results, typically before and after a policy or shift. */
export function ResultTable({ caption, columns, rows }: ResultTableProps) {
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
