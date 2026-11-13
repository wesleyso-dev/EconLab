import type { ReactNode } from 'react';
import styles from './ui.module.css';

/** Two captioned graphs side by side (stacked on narrow screens), e.g. market and firm. */
export function GraphPair({
  graphs,
}: {
  graphs: readonly [{ caption: string; graph: ReactNode }, { caption: string; graph: ReactNode }];
}) {
  return (
    <div className={styles.pair}>
      {graphs.map(({ caption, graph }) => (
        <figure key={caption}>
          <figcaption>{caption}</figcaption>
          {graph}
        </figure>
      ))}
    </div>
  );
}
