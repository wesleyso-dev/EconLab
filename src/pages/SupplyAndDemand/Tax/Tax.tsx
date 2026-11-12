import { useState } from 'react';
import { shiftPrice } from '../../../econ/core/line';
import { solveTax } from '../../../econ/models/tax';
import { Area, Curve, formatNumber, Graph, PointMarker } from '../../../graph';
import { ModelLayout, Notice, PanelSection, ResultTable, Slider } from '../../../ui';
import { CurveHandles } from '../../shared/CurveHandles';
import { MarketEditor } from '../shared/MarketEditor';
import { marketSeries } from '../shared/series';
import { SupplyDemandNav } from '../shared/SupplyDemandNav';
import { DOMAIN, useMarket } from '../shared/useMarket';

export default function Tax() {
  const state = useMarket();
  const { market, labels } = state;
  const [tax, setTax] = useState(2);

  const result = solveTax(market, tax);
  const outcome = result.ok ? result.value : null;
  const taxedSupply = shiftPrice(market.supply, tax);
  const trades = outcome !== null && outcome.quantity > 0;

  const graph = (
    <Graph
      title={`Supply and demand with a per-unit tax of ${formatNumber(tax)}`}
      qDomain={DOMAIN}
      pDomain={DOMAIN}
      qLabel={labels.q}
      pLabel={labels.p}
      crosshair={[
        ...marketSeries(market),
        ...(tax > 0
          ? [{ label: 'Supply + tax', curve: taxedSupply, color: 'var(--supply)', dashed: true }]
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
      <Curve curve={market.demand} label="D" color="var(--demand)" />
      <Curve curve={market.supply} label="S" color="var(--supply)" />
      {tax > 0 && <Curve curve={taxedSupply} label="S + t" color="var(--supply)" dashed />}
      {outcome && trades && (
        <>
          <PointMarker
            point={{ q: outcome.quantity, p: outcome.buyerPrice }}
            qText={formatNumber(outcome.quantity)}
            pText={
              tax > 0 ? `Pb ${formatNumber(outcome.buyerPrice)}` : formatNumber(outcome.buyerPrice)
            }
          />
          {tax > 0 && (
            <PointMarker
              point={{ q: outcome.quantity, p: outcome.sellerPrice }}
              pText={`Ps ${formatNumber(outcome.sellerPrice)}`}
            />
          )}
        </>
      )}
      <CurveHandles
        name="demand"
        line={market.demand}
        onChange={state.setDemand}
        color="var(--demand)"
        slopeSign={-1}
        domain={DOMAIN}
      />
      <CurveHandles
        name="supply"
        line={market.supply}
        onChange={state.setSupply}
        color="var(--supply)"
        slopeSign={1}
        domain={DOMAIN}
      />
    </Graph>
  );

  return (
    <>
      <SupplyDemandNav />
      <ModelLayout
        title="Per-unit tax"
        intro="A tax drives a wedge between the price buyers pay (Pb) and the price sellers keep (Ps). Fewer units trade, and the surplus from the lost trades is the deadweight loss. Drag the curves to see how elasticity decides who bears the tax."
        graph={graph}
      >
        <PanelSection title="Policy">
          <Slider label="Tax per unit" value={tax} onChange={setTax} min={0} max={8} step={0.1} />
        </PanelSection>
        <PanelSection title="Results">
          {outcome ? (
            <>
              <ResultTable
                caption="Market outcome without and with the tax"
                columns={['No tax', 'With tax']}
                rows={[
                  { label: 'Quantity', values: [outcome.before.equilibrium.q, outcome.quantity] },
                  {
                    label: 'Price buyers pay',
                    values: [outcome.before.equilibrium.p, outcome.buyerPrice],
                  },
                  {
                    label: 'Price sellers keep',
                    values: [outcome.before.equilibrium.p, outcome.sellerPrice],
                  },
                  {
                    label: 'Consumer surplus',
                    tone: 'demand',
                    values: [outcome.before.consumerSurplus.area, outcome.consumerSurplus.area],
                  },
                  {
                    label: 'Producer surplus',
                    tone: 'supply',
                    values: [outcome.before.producerSurplus.area, outcome.producerSurplus.area],
                  },
                  { label: 'Tax revenue', tone: 'social', values: [0, outcome.revenue.area] },
                  {
                    label: 'Deadweight loss',
                    tone: 'neutral',
                    values: [0, outcome.deadweightLoss.area],
                  },
                ]}
              />
              {!trades ? (
                <Notice>
                  The tax is at least as large as the gap between the highest price buyers will pay
                  and the lowest price sellers will accept, so nothing is traded.
                </Notice>
              ) : (
                tax > 0 && (
                  <Notice>
                    Buyers bear {percent(outcome.consumerShare)} of the tax (
                    {formatNumber(outcome.consumerBurden)} per unit) and sellers bear{' '}
                    {percent(1 - outcome.consumerShare)} ({formatNumber(outcome.producerBurden)} per
                    unit). The side with the steeper, less elastic curve bears more.
                  </Notice>
                )
              )}
            </>
          ) : (
            <Notice>{result.ok ? null : result.error.message}</Notice>
          )}
        </PanelSection>
        <MarketEditor state={state} />
      </ModelLayout>
    </>
  );
}

function percent(share: number): string {
  return `${formatNumber(share * 100, 0)}%`;
}
