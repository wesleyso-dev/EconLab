import { useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  downloadPng,
  downloadSvg,
  figureFromGraphs,
  formatNumber,
  svgDataUrl,
  type Figure,
} from '../graph';
import { useRegistry } from '../lib/useRegistry';
import { ScenarioContext, type ScenarioRow } from './scenario';
import styles from './ui.module.css';

export interface ModelLayoutProps {
  readonly title: string;
  /** One or two sentences on what the model shows and how to interact with it. */
  readonly intro: ReactNode;
  readonly graph: ReactNode;
  /** Controls and results, shown beside the graph (below it on narrow screens). */
  readonly children: ReactNode;
}

/** A snapshot of the page to compare against: its graph, results and URL state. */
interface Baseline {
  readonly image: string;
  readonly rows: readonly ScenarioRow[];
  readonly search: string;
}

/**
 * The shared page frame for every model: a header, the graph with share and export
 * actions, a side panel, and a comparison with a pinned baseline.
 */
export function ModelLayout({ title, intro, graph, children }: ModelLayoutProps) {
  const graphRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [tables, registerTable] = useRegistry<readonly ScenarioRow[]>();
  const [baseline, setBaseline] = useState<Baseline | null>(null);
  const [status, setStatus] = useState('');
  const current = [...tables.values()].flat();
  const filename = `econlab-${slug(title)}`;

  function figure(): Figure | null {
    return graphRef.current ? figureFromGraphs(graphRef.current) : null;
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setStatus('Link copied.');
    } catch {
      setStatus('Copying failed. Copy the address from the address bar instead.');
    }
  }

  async function exportAs(format: 'svg' | 'png') {
    const result = figure();
    if (!result) return;
    try {
      if (format === 'svg') downloadSvg(result, `${filename}.svg`);
      else await downloadPng(result, `${filename}.png`);
      setStatus(`Downloaded ${format.toUpperCase()}.`);
    } catch {
      setStatus('The download failed. Try SVG instead.');
    }
  }

  function pin() {
    const result = figure();
    if (!result) return;
    setBaseline({ image: svgDataUrl(result.svg), rows: current, search: location.search });
    setStatus('Pinned as baseline. Change the model to compare.');
  }

  return (
    <ScenarioContext.Provider value={registerTable}>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1>{title}</h1>
          <p>{intro}</p>
        </header>
        <div className={styles.layout}>
          <section className={styles.graphCard} aria-label="Graph" ref={graphRef}>
            <div className={styles.toolbar} role="toolbar" aria-label="Share and export">
              <button type="button" onClick={copyLink}>
                Copy link
              </button>
              <button type="button" onClick={() => exportAs('png')}>
                PNG
              </button>
              <button type="button" onClick={() => exportAs('svg')}>
                SVG
              </button>
              <button type="button" onClick={pin}>
                {baseline ? 'Re-pin baseline' : 'Pin as baseline'}
              </button>
            </div>
            <p className={styles.status} role="status">
              {status}
            </p>
            {graph}
          </section>
          <aside className={styles.panel}>{children}</aside>
        </div>
        {baseline && (
          <Comparison
            baseline={baseline}
            current={current}
            onRestore={() => {
              navigate({ search: baseline.search }, { replace: true });
              setStatus('Baseline restored.');
            }}
            onClear={() => {
              setBaseline(null);
              setStatus('');
            }}
          />
        )}
      </div>
    </ScenarioContext.Provider>
  );
}

function Comparison({
  baseline,
  current,
  onRestore,
  onClear,
}: {
  baseline: Baseline;
  current: readonly ScenarioRow[];
  onRestore: () => void;
  onClear: () => void;
}) {
  const before = new Map(baseline.rows.map((row) => [row.label, row]));
  const labels = [
    ...current.map((row) => row.label),
    ...baseline.rows
      .map((row) => row.label)
      .filter((label) => !current.some((r) => r.label === label)),
  ];
  const now = new Map(current.map((row) => [row.label, row]));

  return (
    <section className={styles.comparison} aria-labelledby="comparison-heading">
      <div className={styles.comparisonHeader}>
        <h2 id="comparison-heading">Compared with your baseline</h2>
        <div className={styles.toolbar}>
          <button type="button" onClick={onRestore}>
            Restore baseline
          </button>
          <button type="button" onClick={onClear}>
            Clear
          </button>
        </div>
      </div>
      <div className={styles.comparisonBody}>
        <figure>
          <img src={baseline.image} alt="The graph when the baseline was pinned" />
          <figcaption>Baseline</figcaption>
        </figure>
        <table className={styles.results}>
          <caption>Results for the baseline and the current settings</caption>
          <thead>
            <tr>
              <th scope="col">
                <span className={styles.visuallyHidden}>Measure</span>
              </th>
              <th scope="col">Baseline</th>
              <th scope="col">Current</th>
              <th scope="col">Change</th>
            </tr>
          </thead>
          <tbody>
            {labels.map((label) => {
              const a = before.get(label)?.value ?? null;
              const b = now.get(label)?.value ?? null;
              const tone = now.get(label)?.tone ?? before.get(label)?.tone;
              return (
                <tr key={label}>
                  <th scope="row">
                    {tone && <span className={`${styles.swatch} ${styles[tone]}`} aria-hidden />}
                    {label}
                  </th>
                  <td>{show(a)}</td>
                  <td>{show(b)}</td>
                  <td>{a !== null && b !== null ? signed(b - a) : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** A titled group of controls or results within the side panel. */
export function PanelSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

/** A short explanatory or error message in the side panel. */
export function Notice({ children }: { children: ReactNode }) {
  return (
    <p className={styles.notice} role="status">
      {children}
    </p>
  );
}

function show(value: number | null): string {
  return value === null ? '—' : formatNumber(value);
}

function signed(delta: number): string {
  const text = formatNumber(delta);
  return text === '0' || text.startsWith('−') ? text : `+${text}`;
}

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
