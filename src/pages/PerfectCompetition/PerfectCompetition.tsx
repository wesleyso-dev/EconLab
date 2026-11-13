import { useState } from 'react';
import { horizontalLine, intersect, quantityAt, type Line } from '../../econ/core/line';
import type { CostFunction } from '../../econ/models/cost';
import type { Market } from '../../econ/models/market';
import { solvePerfectCompetition } from '../../econ/models/perfectCompetition';
import { Area, Curve, formatNumber, Graph, PointMarker } from '../../graph';
import { ModelLayout, Notice, PanelSection, ResultTable, Segmented, Slider } from '../../ui';
import { costSeries, DEFAULT_COST } from '../shared/cost';
import { CostCurves, CostHandle } from '../shared/CostCurves';
import { CostEditor } from '../shared/CostEditor';
import { CurveHandles } from '../shared/CurveHandles';
import { ShifterSelect } from '../shared/ShifterSelect';
import { applyShifts, directionOf, NO_SHIFT } from '../shared/shifts';
import { MarketEditor } from '../SupplyAndDemand/shared/MarketEditor';
import { DOMAIN, useMarket } from '../SupplyAndDemand/shared/useMarket';
import styles from './PerfectCompetition.module.css';

type Run = 'short' | 'long';

export default function PerfectCompetition() {
  const state = useMarket();
  const { market: base, labels } = state;
  const [cost, setCost] = useState<CostFunction>(DEFAULT_COST);
  const [run, setRun] = useState<Run>('short');
  const [demandShifterId, setDemandShifterId] = useState(NO_SHIFT);
  const [supplyShifterId, setSupplyShifterId] = useState(NO_SHIFT);
  const [demandSize, setDemandSize] = useState(2);
  const [supplySize, setSupplySize] = useState(2);

  const demandMoved = directionOf(demandShifterId) !== 'none';
  const supplyMoved = directionOf(supplyShifterId) !== 'none';
  const market = applyShifts(
    base,
    { shifterId: demandShifterId, size: demandSize },
    { shifterId: supplyShifterId, size: supplySize },
  );

  const shortRun = solvePerfectCompetition(market, cost);
  const longRunPrice = shortRun.ok ? shortRun.value.longRunPrice : null;
  const longRunMarket = longRunPrice === null ? null : withLongRunSupply(market, longRunPrice);
  const longRun = longRunMarket ? solvePerfectCompetition(longRunMarket, cost) : null;

  const shown = run === 'long' && longRun?.ok ? longRun.value : shortRun.ok ? shortRun.value : null;
  const firm = shown?.firm ?? null;
  const price = shown?.market.equilibrium.p ?? null;

  const marketGraph = (
    <Graph
      title="Market supply and demand"
      qDomain={DOMAIN}
      pDomain={DOMAIN}
      qLabel={`${labels.q} (market)`}
      pLabel={labels.p}
      crosshair={[
        { label: 'Demand', curve: market.demand, color: 'var(--demand)' },
        { label: 'Supply', curve: market.supply, color: 'var(--supply)' },
      ]}
    >
      {run === 'short' && (demandMoved || supplyMoved) && (
        <>
          {demandMoved && <Curve curve={base.demand} label="D₁" color="var(--demand)" ghost />}
          {supplyMoved && <Curve curve={base.supply} label="S₁" color="var(--supply)" ghost />}
        </>
      )}
      <Curve
        curve={market.demand}
        label={run === 'short' && demandMoved ? 'D₂' : 'D'}
        color="var(--demand)"
      />
      <Curve
        curve={market.supply}
        label={run === 'short' && supplyMoved ? 'S₂' : 'S'}
        color="var(--supply)"
        ghost={run === 'long' && longRunMarket !== null}
      />
      {run === 'long' && longRunMarket && (
        <Curve curve={longRunMarket.supply} label="S′" color="var(--supply)" />
      )}
      {shown && (
        <PointMarker
          point={shown.market.equilibrium}
          qText={formatNumber(shown.market.equilibrium.q)}
          pText={`P ${formatNumber(shown.market.equilibrium.p)}`}
        />
      )}
      <CurveHandles
        name="demand"
        line={base.demand}
        onChange={state.setDemand}
        color="var(--demand)"
        slopeSign={-1}
        domain={DOMAIN}
      />
      <CurveHandles
        name="supply"
        line={base.supply}
        onChange={state.setSupply}
        color="var(--supply)"
        slopeSign={1}
        domain={DOMAIN}
      />
    </Graph>
  );

  const priceLine: Line | null = price === null ? null : horizontalLine(price);
  const firmGraph = (
    <Graph
      title="A representative firm's cost curves and the market price"
      qDomain={DOMAIN}
      pDomain={DOMAIN}
      qLabel={`${labels.q} (firm)`}
      pLabel={labels.p}
      crosshair={[
        ...(priceLine ? [{ label: 'P = MR', curve: priceLine, color: 'var(--demand)' }] : []),
        ...costSeries(cost),
      ]}
    >
      {firm && !firm.shutDown && (
        <Area
          region={firm.profitRegion}
          tone={firm.profit >= -1e-9 ? 'social' : 'neutral'}
          label={firm.profit >= -1e-9 ? 'Profit' : 'Loss'}
        />
      )}
      {priceLine && <Curve curve={priceLine} label="P = MR" color="var(--demand)" />}
      <CostCurves cost={cost} />
      {firm && price !== null && !firm.shutDown && (
        <>
          <PointMarker
            point={{ q: firm.quantity, p: price }}
            qText={`q ${formatNumber(firm.quantity)}`}
            pText={`P ${formatNumber(price)}`}
          />
          {firm.averageTotalCost !== null && (
            <PointMarker
              point={{ q: firm.quantity, p: firm.averageTotalCost }}
              pText={`ATC ${formatNumber(firm.averageTotalCost)}`}
              guides={false}
            />
          )}
        </>
      )}
      <CostHandle cost={cost} onChange={setCost} domain={DOMAIN} />
    </Graph>
  );

  const shortFirm = shortRun.ok ? shortRun.value.firm : null;
  const longFirm = longRun?.ok ? longRun.value.firm : null;

  return (
    <>
      <ModelLayout
        title="Perfect competition"
        intro="The market sets the price, and each firm takes it as given, producing where price equals marginal cost. Profits attract new firms and losses drive firms out, so in the long run price settles at the minimum of average total cost."
        graph={
          <div className={styles.pair}>
            <figure>
              <figcaption>Market</figcaption>
              {marketGraph}
            </figure>
            <figure>
              <figcaption>Firm</figcaption>
              {firmGraph}
            </figure>
          </div>
        }
      >
        <PanelSection title="Show">
          <Segmented
            label="Time horizon"
            value={run}
            onChange={setRun}
            options={[
              { value: 'short', label: 'Short run' },
              { value: 'long', label: 'Long run' },
            ]}
          />
        </PanelSection>
        <PanelSection title="What changes">
          <ShifterSelect
            label="Demand shifter"
            curve="demand"
            value={demandShifterId}
            onChange={setDemandShifterId}
          />
          {demandMoved && (
            <Slider
              label="Demand shift size"
              value={demandSize}
              onChange={setDemandSize}
              min={0.5}
              max={4}
              step={0.5}
            />
          )}
          <ShifterSelect
            label="Supply shifter"
            curve="supply"
            value={supplyShifterId}
            onChange={setSupplyShifterId}
          />
          {supplyMoved && (
            <Slider
              label="Supply shift size"
              value={supplySize}
              onChange={setSupplySize}
              min={0.5}
              max={4}
              step={0.5}
            />
          )}
        </PanelSection>
        <PanelSection title="Results">
          {shortRun.ok && shortFirm ? (
            <>
              <ResultTable
                caption="Market and firm in the short run and the long run"
                columns={['Short run', 'Long run']}
                rows={[
                  {
                    label: 'Market price',
                    values: [
                      shortRun.value.market.equilibrium.p,
                      longRun?.ok ? longRun.value.market.equilibrium.p : null,
                    ],
                  },
                  {
                    label: 'Market quantity',
                    values: [
                      shortRun.value.market.equilibrium.q,
                      longRun?.ok ? longRun.value.market.equilibrium.q : null,
                    ],
                  },
                  {
                    label: 'Firm output',
                    values: [shortFirm.quantity, longFirm?.quantity ?? null],
                  },
                  {
                    label: 'Average total cost',
                    values: [shortFirm.averageTotalCost, longFirm?.averageTotalCost ?? null],
                  },
                  {
                    label: 'Firm profit',
                    tone: 'social',
                    values: [shortFirm.profit, longFirm?.profit ?? null],
                  },
                ]}
              />
              <Notice>{explain(shortFirm, longRunPrice, longRunMarket !== null)}</Notice>
            </>
          ) : (
            <Notice>{shortRun.ok ? null : shortRun.error.message}</Notice>
          )}
        </PanelSection>
        <PanelSection title="Firm costs">
          <CostEditor cost={cost} onChange={setCost} />
        </PanelSection>
        <MarketEditor state={state} />
      </ModelLayout>
    </>
  );
}

/**
 * The market after entry or exit: supply keeps its slope but moves until it meets
 * demand at `price`. Null when demand never reaches that price.
 */
function withLongRunSupply(market: Market, price: number): Market | null {
  const q = quantityAt(market.demand, price);
  if (q === null || !(q > 0)) return null;
  const supply = { slope: market.supply.slope, intercept: price - market.supply.slope * q };
  return intersect(market.demand, supply) ? { ...market, supply } : null;
}

function explain(
  firm: { shutDown: boolean; profit: number; shutdownPoint: { p: number } },
  longRunPrice: number | null,
  longRunExists: boolean,
): string {
  const target =
    longRunPrice === null ? '' : ` until price reaches minimum ATC (${formatNumber(longRunPrice)})`;
  if (!longRunExists && longRunPrice !== null) {
    return `Demand never reaches minimum ATC (${formatNumber(longRunPrice)}), so in the long run every firm leaves this market.`;
  }
  if (firm.shutDown) {
    return `Price is below minimum AVC (${formatNumber(firm.shutdownPoint.p)}), so firms shut down in the short run. In the long run, firms exit and supply shifts left${target}.`;
  }
  if (Math.abs(firm.profit) < 0.005) {
    return 'Price equals minimum ATC: firms earn zero economic profit, so no firm wants to enter or leave. This is the long-run equilibrium.';
  }
  if (firm.profit > 0) {
    return `Firms earn economic profit, which attracts new firms. Entry shifts market supply right${target}, where profit is zero.`;
  }
  return `Firms make a loss but cover their variable cost, so they keep producing in the short run. In the long run, firms exit and supply shifts left${target}.`;
}
