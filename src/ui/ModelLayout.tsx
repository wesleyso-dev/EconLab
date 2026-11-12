import type { ReactNode } from 'react';
import styles from './ui.module.css';

export interface ModelLayoutProps {
  readonly title: string;
  /** One or two sentences on what the model shows and how to interact with it. */
  readonly intro: ReactNode;
  readonly graph: ReactNode;
  /** Controls and results, shown beside the graph (below it on narrow screens). */
  readonly children: ReactNode;
}

/** The shared page frame for every model: a header, the graph, and a side panel. */
export function ModelLayout({ title, intro, graph, children }: ModelLayoutProps) {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>{title}</h1>
        <p>{intro}</p>
      </header>
      <div className={styles.layout}>
        <section className={styles.graphCard} aria-label="Graph">
          {graph}
        </section>
        <aside className={styles.panel}>{children}</aside>
      </div>
    </main>
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
