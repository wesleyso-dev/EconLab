import { useState } from 'react';
import { shiftPrice } from '../../../econ/core/line';
import { solveSubsidy } from '../../../econ/models/subsidy';
import { Area, Curve, formatNumber, Graph, PointMarker } from '../../../graph';
import { ModelLayout, Notice, PanelSection, ResultTable, Segmented, Slider } from '../../../ui';
import { CurveHandles } from '../../shared/CurveHandles';
import { MarketEditor } from '../shared/MarketEditor';
import { marketSeries } from '../shared/series';
import { DOMAIN, useMarket } from '../shared/useMarket';

type Shading = 'surplus' | 'cost';

export default function Subsidy() {
  const state = useMarket();
  const { market, labels } = state;
  const [subsidy, setSubsidy] = useState(2);
  // The government's cost overlaps both surpluses, so the two views are shaded separately.
  const [shading, setShading] = useState<Shading>('surplus');

  const result = solveSubsidy(market, subsidy);
  const outcome = result.ok ? result.value : null;
  const subsidizedSupply = shiftPrice(market.supply, -subsidy);

  const graph = (
    <Graph
      title={`Supply and demand with a per-unit subsidy of ${formatNumber(subsidy)}`}
      qDomain={DOMAIN}
      pDomain={DOMAIN}
      qLabel={labels.q}
      pLabel={labels.p}
      crosshair={[
        ...marketSeries(market),
        ...(subsidy > 0
          ? [
              {
                label: 'Supply − subsidy',
                curve: subsidizedSupply,
                color: 'var(--supply)',
                dashed: true,
              },
            ]
          : []),
      ]}
    >
      {outcome &&
        (shading === 'surplus' ? (
          <>
            <Area region={outcome.consumerSurplus} tone="demand" label="CS" />
            <Area region={outcome.producerSurplus} tone="supply" label="PS" />
          </>
        ) : (
          <Area region={outcome.cost} tone="social" label="Cost" />
        ))}
      {outcome && <Area region={outcome.deadweightLoss} tone="neutral" label="DWL" />}
      <Curve curve={market.demand} label="D" color="var(--demand)" />
      <Curve curve={market.supply} label="S" color="var(--supply)" />
      {subsidy > 0 && <Curve curve={subsidizedSupply} label="S − s" color="var(--supply)" dashed />}
      {outcome && (
        <>
          <PointMarker
            point={{ q: outcome.quantity, p: outcome.sellerPrice }}
            qText={formatNumber(outcome.quantity)}
            pText={
              subsidy > 0
                ? `Ps ${formatNumber(outcome.sellerPrice)}`
                : formatNumber(outcome.sellerPrice)
            }
          />
          {subsidy > 0 && (
            <PointMarker
              point={{ q: outcome.quantity, p: outcome.buyerPrice }}
              pText={`Pb ${formatNumber(outcome.buyerPrice)}`}
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
      <ModelLayout
        title="Per-unit subsidy"
        intro="A subsidy pays sellers on top of what buyers pay, so sellers receive more (Ps), buyers pay less (Pb), and more units trade than is efficient. The subsidy costs more than the surplus it creates; the difference is the deadweight loss."
        graph={graph}
      >
        <PanelSection title="Policy">
          <Slider
            label="Subsidy per unit"
            value={subsidy}
            onChange={setSubsidy}
            min={0}
            max={6}
            step={0.1}
          />
          <Segmented
            label="Shade"
            value={shading}
            onChange={setShading}
            options={[
              { value: 'surplus', label: 'Surplus' },
              { value: 'cost', label: 'Government cost' },
            ]}
          />
        </PanelSection>
        <PanelSection title="Results">
          {outcome ? (
            <>
              <ResultTable
                caption="Market outcome without and with the subsidy"
                columns={['No subsidy', 'With subsidy']}
                rows={[
                  { label: 'Quantity', values: [outcome.before.equilibrium.q, outcome.quantity] },
                  {
                    label: 'Price buyers pay',
                    values: [outcome.before.equilibrium.p, outcome.buyerPrice],
                  },
                  {
                    label: 'Price sellers receive',
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
                  { label: 'Government cost', tone: 'social', values: [0, outcome.cost.area] },
                  {
                    label: 'Deadweight loss',
                    tone: 'neutral',
                    values: [0, outcome.deadweightLoss.area],
                  },
                ]}
              />
              {subsidy > 0 && (
                <Notice>
                  Buyers gain {formatNumber(outcome.consumerBenefit)} per unit and sellers{' '}
                  {formatNumber(outcome.producerBenefit)} per unit. The side with the steeper, less
                  elastic curve gains more.
                </Notice>
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
