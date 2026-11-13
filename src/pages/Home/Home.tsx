import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TOPICS } from '../../app/topics';
import type { Market } from '../../econ/models/market';
import { solveMarket } from '../../econ/models/market';
import { Area, Curve, formatNumber, Graph, PointMarker } from '../../graph';
import { CurveHandles } from '../shared/CurveHandles';
import styles from './Home.module.css';

const DOMAIN = [0, 12] as const;
const START: Market = {
  demand: { intercept: 10, slope: -1 },
  supply: { intercept: 1, slope: 0.8 },
};

export default function Home() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.pitch}>
          <h1>Economics you can drag.</h1>
          <p>
            EconLab is an interactive graphing tool for introductory microeconomics. Move a curve,
            add a tax or a price ceiling, and watch equilibrium, surplus and deadweight loss update
            as you go.
          </p>
          <div className={styles.actions}>
            <Link className={styles.primary} to="/supply-and-demand/shifts">
              Start with supply and demand
            </Link>
            <Link className={styles.secondary} to="/monopoly">
              Try monopoly
            </Link>
          </div>
        </div>
        <HeroGraph />
      </section>

      <section aria-labelledby="models-heading">
        <h2 id="models-heading" className={styles.sectionTitle}>
          Models
        </h2>
        <ul className={styles.topics}>
          {TOPICS.map((topic) => (
            <li key={topic.id} className={styles.topic}>
              <h3>
                <Link to={topic.pages[0]?.path ?? '/'}>{topic.label}</Link>
              </h3>
              <p>{topic.summary}</p>
              <ul className={styles.pages}>
                {topic.pages.map((page) => (
                  <li key={page.path}>
                    <Link to={page.path}>{page.title}</Link>
                    {page.legacy && <span className={styles.badge}>Being rebuilt</span>}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="how-heading" className={styles.how}>
        <h2 id="how-heading" className={styles.sectionTitle}>
          How it works
        </h2>
        <ul>
          <li>
            <h3>Exact, tested math</h3>
            <p>
              Every result comes from a TypeScript economics engine with unit tests. Surplus and
              deadweight loss are exact integrals, so the shaded areas and the numbers always agree.
            </p>
          </li>
          <li>
            <h3>Runs in your browser</h3>
            <p>
              No server and no waiting: graphs are drawn as SVG and recalculate as you drag, with
              the mouse, a finger or the arrow keys.
            </p>
          </li>
          <li>
            <h3>Built to read clearly</h3>
            <p>
              Colors follow economic roles (demand blue, supply and cost orange), every curve is
              labeled directly, and the palette is checked for color-vision deficiencies.
            </p>
          </li>
        </ul>
      </section>
    </div>
  );
}

/** A small live market: drag either curve and the surplus areas follow. */
function HeroGraph() {
  const [market, setMarket] = useState(START);
  const outcome = solveMarket(market);
  return (
    <figure className={styles.heroGraph}>
      <Graph
        title="Interactive supply and demand graph"
        qDomain={DOMAIN}
        pDomain={DOMAIN}
        aspectRatio={0.8}
        crosshair={[
          { label: 'Demand', curve: market.demand, color: 'var(--demand)' },
          { label: 'Supply', curve: market.supply, color: 'var(--supply)' },
        ]}
      >
        {outcome.ok && (
          <>
            <Area region={outcome.value.consumerSurplus} tone="demand" label="CS" />
            <Area region={outcome.value.producerSurplus} tone="supply" label="PS" />
          </>
        )}
        <Curve curve={market.demand} label="D" color="var(--demand)" />
        <Curve curve={market.supply} label="S" color="var(--supply)" />
        {outcome.ok && (
          <PointMarker
            point={outcome.value.equilibrium}
            qText={formatNumber(outcome.value.equilibrium.q)}
            pText={formatNumber(outcome.value.equilibrium.p)}
          />
        )}
        <CurveHandles
          name="demand"
          line={market.demand}
          onChange={(demand) => setMarket((m) => ({ ...m, demand }))}
          color="var(--demand)"
          slopeSign={-1}
          domain={DOMAIN}
        />
        <CurveHandles
          name="supply"
          line={market.supply}
          onChange={(supply) => setMarket((m) => ({ ...m, supply }))}
          color="var(--supply)"
          slopeSign={1}
          domain={DOMAIN}
        />
      </Graph>
      <figcaption>
        {outcome.ok
          ? `Drag the handles. Equilibrium: quantity ${formatNumber(outcome.value.equilibrium.q)}, price ${formatNumber(outcome.value.equilibrium.p)}.`
          : outcome.error.message}
      </figcaption>
    </figure>
  );
}
