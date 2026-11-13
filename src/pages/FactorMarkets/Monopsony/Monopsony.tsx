import { solveMonopsony } from '../../../econ/models/labor';
import { Area, Curve, formatNumber, Graph, PointMarker } from '../../../graph';
import { ModelLayout, Notice, PanelSection, ResultTable } from '../../../ui';
import { CurveHandles } from '../../shared/CurveHandles';
import { MarketEditor } from '../../SupplyAndDemand/shared/MarketEditor';
import { DOMAIN, useMarket } from '../../SupplyAndDemand/shared/useMarket';
import { LABOR_LABELS, LABOR_MARKET, LABOR_NAMES, LABOR_SYMBOLS } from '../labor';

export default function Monopsony() {
  const state = useMarket(LABOR_MARKET, LABOR_LABELS);
  const { market, labels } = state;
  const result = solveMonopsony(market);
  const outcome = result.ok ? result.value : null;
  // MRC = c + 2dL for supply W = c + dL; drawn even when the model can't be solved.
  const marginalResourceCost = {
    intercept: market.supply.intercept,
    slope: 2 * market.supply.slope,
  };

  const graph = (
    <Graph
      title="Monopsony labor market: MRP, labor supply and marginal resource cost"
      qDomain={DOMAIN}
      pDomain={DOMAIN}
      qLabel={labels.q}
      pLabel={labels.p}
      crosshair={[
        { label: 'MRP', curve: market.demand, color: 'var(--demand)' },
        { label: 'Supply', curve: market.supply, color: 'var(--supply)' },
        { label: 'MRC', curve: marginalResourceCost, color: 'var(--supply)', dashed: true },
      ]}
    >
      {outcome && <Area region={outcome.deadweightLoss} tone="neutral" label="DWL" />}
      <Curve curve={market.demand} label="MRP = D" color="var(--demand)" />
      <Curve curve={market.supply} label="S" color="var(--supply)" />
      <Curve curve={marginalResourceCost} label="MRC" color="var(--supply)" dashed />
      {outcome && (
        <>
          <PointMarker
            point={{ q: outcome.quantity, p: outcome.marginalRevenueProduct }}
            pText={`MRP ${formatNumber(outcome.marginalRevenueProduct)}`}
            guides={false}
          />
          <PointMarker
            point={{ q: outcome.quantity, p: outcome.wage }}
            qText={`Lm ${formatNumber(outcome.quantity)}`}
            pText={`Wm ${formatNumber(outcome.wage)}`}
          />
          <PointMarker
            point={outcome.competitive}
            qText={`Lc ${formatNumber(outcome.competitive.q)}`}
            pText={`Wc ${formatNumber(outcome.competitive.p)}`}
          />
        </>
      )}
      <CurveHandles
        name="labor demand"
        line={market.demand}
        onChange={state.setDemand}
        color="var(--demand)"
        slopeSign={-1}
        domain={DOMAIN}
      />
      <CurveHandles
        name="labor supply"
        line={market.supply}
        onChange={state.setSupply}
        color="var(--supply)"
        slopeSign={1}
        domain={DOMAIN}
      />
    </Graph>
  );

  return (
    <ModelLayout
      title="Monopsony"
      intro="A single employer must raise the wage for everyone to hire one more worker, so its marginal resource cost (MRC) lies above labor supply. It hires where MRC equals the marginal revenue product (MRP) and pays the lowest wage workers will accept. Compared with a competitive labor market, fewer workers are hired at a lower wage."
      graph={graph}
    >
      <PanelSection title="Results">
        {outcome ? (
          <>
            <ResultTable
              caption="Monopsony compared with a competitive labor market"
              columns={['Monopsony', 'Competitive']}
              current={0}
              rows={[
                { label: 'Workers hired', values: [outcome.quantity, outcome.competitive.q] },
                { label: 'Wage', values: [outcome.wage, outcome.competitive.p] },
                {
                  label: 'MRP of the last worker',
                  values: [outcome.marginalRevenueProduct, outcome.competitive.p],
                },
                {
                  label: 'Deadweight loss',
                  tone: 'neutral',
                  values: [outcome.deadweightLoss.area, 0],
                },
              ]}
            />
            <Notice>
              The last worker hired adds {formatNumber(outcome.marginalRevenueProduct)} to revenue
              but is paid only {formatNumber(outcome.wage)}. A competitive market would hire{' '}
              {formatNumber(outcome.competitive.q - outcome.quantity)} more workers at a wage{' '}
              {formatNumber(outcome.competitive.p - outcome.wage)} higher.
            </Notice>
          </>
        ) : (
          <Notice>{result.ok ? null : result.error.message}</Notice>
        )}
      </PanelSection>
      <MarketEditor state={state} names={LABOR_NAMES} symbols={LABOR_SYMBOLS} />
    </ModelLayout>
  );
}
