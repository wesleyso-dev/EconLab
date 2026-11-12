import { useState } from 'react';
import SubNavbar from '../../components/SubNavbar/SubNavbar';
import { toPoly, type Line } from '../../econ/core/line';
import { regionBetween } from '../../econ/core/region';
import { averageTotalCost, marginalCost, totalCost } from '../../econ/models/cost';
import { solveMonopoly } from '../../econ/models/monopoly';
import { Area, Curve, formatNumber, Graph, PointMarker } from '../../graph';
import { Button, ModelLayout, Notice, PanelSection, ResultTable, Segmented } from '../../ui';
import { AxisLabelFields } from '../shared/AxisLabelFields';
import { DEFAULT_LABELS } from '../shared/axisLabels';
import { costSeries, DEFAULT_COST } from '../shared/cost';
import { CostCurves, CostHandle } from '../shared/CostCurves';
import { CostEditor } from '../shared/CostEditor';
import { CurveHandles } from '../shared/CurveHandles';
import { LineFields } from '../shared/LineFields';

const DOMAIN = [0, 12] as const;
/** P = 12 − Q, so MR = 12 − 2Q. */
const DEFAULT_DEMAND: Line = { intercept: 12, slope: -1 };

type Shading = 'profit' | 'welfare';

export default function Monopoly() {
  const [demand, setDemand] = useState(DEFAULT_DEMAND);
  const [cost, setCost] = useState(DEFAULT_COST);
  const [labels, setLabels] = useState(DEFAULT_LABELS);
  const [shading, setShading] = useState<Shading>('profit');

  const result = solveMonopoly(demand, cost);
  const outcome = result.ok ? result.value : null;
  const producing = outcome !== null && !outcome.shutDown;
  const marginalRevenue: Line = { intercept: demand.intercept, slope: 2 * demand.slope };
  const atc = outcome && producing ? averageTotalCost(cost, outcome.quantity) : null;

  // The allocatively efficient benchmark, where price equals marginal cost.
  const efficient = outcome?.competitive ?? null;
  const benchmark = efficient && {
    quantity: efficient.q,
    price: efficient.p,
    marginalCost: marginalCost(cost, efficient.q),
    atc: averageTotalCost(cost, efficient.q),
    consumerSurplus: regionBetween(toPoly(demand), [efficient.p], 0, efficient.q).area,
    profit: efficient.p * efficient.q - totalCost(cost, efficient.q),
  };

  const reset = () => {
    setDemand(DEFAULT_DEMAND);
    setCost(DEFAULT_COST);
    setLabels(DEFAULT_LABELS);
  };

  const graph = (
    <Graph
      title="Monopoly: demand, marginal revenue and cost curves"
      qDomain={DOMAIN}
      pDomain={DOMAIN}
      qLabel={labels.q}
      pLabel={labels.p}
      crosshair={[
        { label: 'Demand', curve: demand, color: 'var(--demand)' },
        { label: 'MR', curve: marginalRevenue, color: 'var(--demand)', dashed: true },
        ...costSeries(cost),
      ]}
    >
      {outcome &&
        producing &&
        (shading === 'profit' ? (
          <Area
            region={outcome.profitRegion}
            tone={outcome.profit >= 0 ? 'social' : 'neutral'}
            label={outcome.profit >= 0 ? 'Profit' : 'Loss'}
          />
        ) : (
          <>
            <Area region={outcome.consumerSurplus} tone="demand" label="CS" />
            <Area region={outcome.producerSurplus} tone="supply" label="PS" />
            <Area region={outcome.deadweightLoss} tone="neutral" label="DWL" />
          </>
        ))}
      <Curve curve={demand} label="D" color="var(--demand)" />
      <Curve curve={marginalRevenue} label="MR" color="var(--demand)" dashed />
      <CostCurves cost={cost} />
      {outcome && producing && (
        <>
          <PointMarker
            point={{ q: outcome.quantity, p: outcome.price }}
            qText={`Qm ${formatNumber(outcome.quantity)}`}
            pText={`Pm ${formatNumber(outcome.price)}`}
          />
          <PointMarker point={{ q: outcome.quantity, p: outcome.marginalCost }} guides={false} />
          {shading === 'profit' && atc !== null && (
            <PointMarker
              point={{ q: outcome.quantity, p: atc }}
              pText={`ATC ${formatNumber(atc)}`}
              guides={false}
            />
          )}
          {shading === 'welfare' && efficient && (
            <PointMarker point={efficient} qText={`Qc ${formatNumber(efficient.q)}`} />
          )}
        </>
      )}
      <CurveHandles
        name="demand"
        line={demand}
        onChange={setDemand}
        color="var(--demand)"
        slopeSign={-1}
        domain={DOMAIN}
      />
      <CostHandle cost={cost} onChange={setCost} domain={DOMAIN} />
    </Graph>
  );

  return (
    <>
      <SubNavbar links={['Monopoly']} />
      <ModelLayout
        title="Monopoly"
        intro="A single seller produces where marginal revenue equals marginal cost, then charges the highest price demand allows. It produces less and charges more than a competitive market would, and the lost trades are the deadweight loss. Drag demand, or drag the cost handle to raise or lower costs."
        graph={graph}
      >
        <PanelSection title="Show">
          <Segmented
            label="Shade"
            value={shading}
            onChange={setShading}
            options={[
              { value: 'profit', label: 'Profit' },
              { value: 'welfare', label: 'Welfare' },
            ]}
          />
        </PanelSection>
        <PanelSection title="Results">
          {outcome ? (
            <>
              <ResultTable
                caption="Monopoly outcome compared with pricing at marginal cost"
                columns={['Monopoly', 'If P = MC']}
                rows={[
                  { label: 'Quantity', values: [outcome.quantity, benchmark?.quantity ?? null] },
                  {
                    label: 'Price',
                    values: [producing ? outcome.price : null, benchmark?.price ?? null],
                  },
                  {
                    label: 'Marginal cost',
                    values: [
                      producing ? outcome.marginalCost : null,
                      benchmark?.marginalCost ?? null,
                    ],
                  },
                  { label: 'Average total cost', values: [atc, benchmark?.atc ?? null] },
                  {
                    label: 'Consumer surplus',
                    tone: 'demand',
                    values: [outcome.consumerSurplus.area, benchmark?.consumerSurplus ?? null],
                  },
                  {
                    label: 'Profit',
                    tone: 'social',
                    values: [outcome.profit, benchmark?.profit ?? null],
                  },
                  {
                    label: 'Deadweight loss',
                    tone: 'neutral',
                    values: [outcome.deadweightLoss.area, benchmark ? 0 : null],
                  },
                ]}
              />
              <Notice>
                {producing ? (
                  <>
                    Demand is elastic below Q {formatNumber(outcome.unitElastic.q)}, where MR is
                    positive, and inelastic above it. The monopolist produces in the elastic range
                    and charges {formatNumber(outcome.price - outcome.marginalCost)} above marginal
                    cost.
                    {outcome.profit < 0 &&
                      ' It makes a loss but still covers its variable cost, so it keeps producing in the short run.'}
                  </>
                ) : (
                  'No price covers average variable cost, so the monopolist shuts down and loses its fixed cost.'
                )}
              </Notice>
            </>
          ) : (
            <Notice>{result.ok ? null : result.error.message}</Notice>
          )}
        </PanelSection>
        <PanelSection title="Costs">
          <CostEditor cost={cost} onChange={setCost} />
        </PanelSection>
        <PanelSection title="Demand">
          <LineFields name="Demand" line={demand} onChange={setDemand} />
          <AxisLabelFields labels={labels} onChange={setLabels} />
          <Button onClick={reset}>Reset</Button>
        </PanelSection>
      </ModelLayout>
    </>
  );
}
