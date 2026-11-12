import { useState } from 'react';
import { priceAt, shiftPrice, type Line, type Point } from '../../econ/core/line';
import { solveTax } from '../../econ/models/tax';
import { Area, Curve, DragHandle, formatNumber, Graph, PointMarker } from '../../graph';
import styles from './Playground.module.css';

/**
 * A temporary page that exercises the graph engine end to end: drag the middle
 * handle of a curve to shift it, drag its end handle to rotate it, and adjust the
 * tax. Replaced by the real model pages in Phase 3.
 */

interface CurveState {
  readonly line: Line;
  /** Quantities where the shift and rotate handles sit along the curve. */
  readonly shiftQ: number;
  readonly rotateQ: number;
}

const DOMAIN = [0, 12] as const;

export default function Playground() {
  const [demand, setDemand] = useState<CurveState>({
    line: { intercept: 10, slope: -1 },
    shiftQ: 3,
    rotateQ: 8,
  });
  const [supply, setSupply] = useState<CurveState>({
    line: { intercept: 1, slope: 0.8 },
    shiftQ: 3,
    rotateQ: 9,
  });
  const [tax, setTax] = useState(2);

  const market = { demand: demand.line, supply: supply.line };
  const result = solveTax(market, tax);
  const outcome = result.ok ? result.value : null;
  const taxedSupply = shiftPrice(supply.line, tax);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>Graph engine playground</h1>
        <p>
          Drag a curve&rsquo;s middle handle to shift it, or its end handle to change its slope.
          Handles also move with the arrow keys.
        </p>
      </header>

      <div className={styles.layout}>
        <section className={styles.graphCard} aria-label="Graph">
          <Graph
            title={`Supply and demand with a ${formatNumber(tax)} per-unit tax`}
            qDomain={DOMAIN}
            pDomain={DOMAIN}
            crosshair={[
              { label: 'Demand', curve: demand.line, color: 'var(--demand)' },
              { label: 'Supply', curve: supply.line, color: 'var(--supply)' },
              ...(tax > 0
                ? [
                    {
                      label: 'Supply + tax',
                      curve: taxedSupply,
                      color: 'var(--supply)',
                      dashed: true,
                    },
                  ]
                : []),
            ]}
          >
            {outcome && (
              <>
                <Area region={outcome.consumerSurplus} tone="demand" label="CS" />
                <Area region={outcome.producerSurplus} tone="supply" label="PS" />
                <Area region={outcome.revenue} tone="social" label="Tax" />
                <Area region={outcome.deadweightLoss} tone="neutral" label="DWL" />
              </>
            )}
            <Curve curve={demand.line} label="D" color="var(--demand)" />
            <Curve curve={supply.line} label="S" color="var(--supply)" />
            {tax > 0 && <Curve curve={taxedSupply} label="S + t" color="var(--supply)" dashed />}
            {outcome && outcome.quantity > 0 && (
              <>
                <PointMarker
                  point={{ q: outcome.quantity, p: outcome.buyerPrice }}
                  qText={formatNumber(outcome.quantity)}
                  pText={formatNumber(outcome.buyerPrice)}
                />
                {tax > 0 && (
                  <PointMarker
                    point={{ q: outcome.quantity, p: outcome.sellerPrice }}
                    pText={formatNumber(outcome.sellerPrice)}
                  />
                )}
              </>
            )}
            <CurveHandles name="demand" state={demand} onChange={setDemand} color="var(--demand)" />
            <CurveHandles name="supply" state={supply} onChange={setSupply} color="var(--supply)" />
          </Graph>
        </section>

        <aside className={styles.panel}>
          <label className={styles.slider}>
            <span>
              Per-unit tax <strong>{formatNumber(tax)}</strong>
            </span>
            <input
              type="range"
              min={0}
              max={6}
              step={0.1}
              value={tax}
              onChange={(e) => setTax(Number(e.target.value))}
            />
          </label>

          {outcome ? (
            <dl className={styles.metrics}>
              <Metric label="Quantity" value={outcome.quantity} />
              <Metric label="Buyer price" value={outcome.buyerPrice} />
              <Metric label="Seller price" value={outcome.sellerPrice} />
              <Metric label="Consumer surplus" value={outcome.consumerSurplus.area} />
              <Metric label="Producer surplus" value={outcome.producerSurplus.area} />
              <Metric label="Tax revenue" value={outcome.revenue.area} />
              <Metric label="Deadweight loss" value={outcome.deadweightLoss.area} />
            </dl>
          ) : (
            <p className={styles.error} role="status">
              {result.ok ? null : result.error.message}
            </p>
          )}
        </aside>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{formatNumber(value)}</dd>
    </div>
  );
}

function CurveHandles({
  name,
  state,
  onChange,
  color,
}: {
  name: string;
  state: CurveState;
  onChange: (state: CurveState) => void;
  color: string;
}) {
  const { line, shiftQ, rotateQ } = state;
  const shiftPoint: Point = { q: shiftQ, p: priceAt(line, shiftQ) };
  const rotatePoint: Point = { q: rotateQ, p: priceAt(line, rotateQ) };

  return (
    <>
      <DragHandle
        label={`Shift ${name}`}
        color={color}
        point={shiftPoint}
        step={0.1}
        onChange={(pt) =>
          // Keep the slope; move the curve so it passes through the pointer.
          onChange({
            ...state,
            shiftQ: pt.q,
            line: { slope: line.slope, intercept: pt.p - line.slope * pt.q },
          })
        }
      />
      <DragHandle
        label={`Rotate ${name}`}
        color={color}
        point={rotatePoint}
        step={0.1}
        qBounds={[shiftQ + 0.5, DOMAIN[1]]}
        onChange={(pt) => {
          // Pivot around the shift handle so the curve stays put where the user left it.
          const slope = (pt.p - shiftPoint.p) / (pt.q - shiftPoint.q);
          onChange({
            ...state,
            rotateQ: pt.q,
            line: { slope, intercept: shiftPoint.p - slope * shiftPoint.q },
          });
        }}
      />
    </>
  );
}
