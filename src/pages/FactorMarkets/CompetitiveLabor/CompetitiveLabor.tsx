import { useUrlState } from '../../../app/useUrlState';
import { horizontalLine, type Line } from '../../../econ/core/line';
import { LABOR_SHIFTERS, solveCompetitiveLaborMarket } from '../../../econ/models/labor';
import { compareEquilibria, type Change } from '../../../econ/models/shifts';
import { Curve, formatNumber, Graph, PointMarker } from '../../../graph';
import { GraphPair, ModelLayout, Notice, PanelSection, ResultTable, Slider } from '../../../ui';
import { CurveHandles } from '../../shared/CurveHandles';
import { LineFields } from '../../shared/LineFields';
import { ShifterSelect } from '../../shared/ShifterSelect';
import { applyShifts, directionOf, NO_SHIFT, validShifter } from '../../shared/shifts';
import { MarketEditor } from '../../SupplyAndDemand/shared/MarketEditor';
import { DOMAIN, useMarket } from '../../SupplyAndDemand/shared/useMarket';
import { LABOR_LABELS, LABOR_MARKET, LABOR_NAMES, LABOR_SYMBOLS } from '../labor';

/** A single firm's MRP of labor: W = 10 − L, so at a wage of 5 it hires 5 workers. */
const FIRM_MRP: Line = { intercept: 10, slope: -1 };

const PAGE_DEFAULTS = {
  ds: NO_SHIFT,
  ss: NO_SHIFT,
  dz: 2,
  sz: 2,
  f0: FIRM_MRP.intercept,
  f1: FIRM_MRP.slope,
};

export default function CompetitiveLabor() {
  const state = useMarket(LABOR_MARKET, LABOR_LABELS);
  const { market: base, labels } = state;
  const [page, update] = useUrlState(PAGE_DEFAULTS);
  const demandShifterId = validShifter(page.ds, 'demand', LABOR_SHIFTERS);
  const supplyShifterId = validShifter(page.ss, 'supply', LABOR_SHIFTERS);
  const demandMoved = directionOf(demandShifterId) !== 'none';
  const supplyMoved = directionOf(supplyShifterId) !== 'none';
  const firmMrp: Line = { intercept: page.f0, slope: page.f1 };
  const setFirmMrp = (line: Line) => update({ f0: line.intercept, f1: line.slope });

  const market = applyShifts(
    base,
    { shifterId: demandShifterId, size: page.dz },
    { shifterId: supplyShifterId, size: page.sz },
  );
  const before = solveCompetitiveLaborMarket(base, firmMrp);
  const after = solveCompetitiveLaborMarket(market, firmMrp);
  const outcome = after.ok ? after.value : null;
  const wage = outcome?.market.equilibrium.p ?? null;
  const wageLine = wage === null ? null : horizontalLine(wage);

  const marketGraph = (
    <Graph
      title="Labor market supply and demand"
      qDomain={DOMAIN}
      pDomain={DOMAIN}
      qLabel={`${labels.q} (market)`}
      pLabel={labels.p}
      crosshair={[
        { label: 'Labor demand', curve: market.demand, color: 'var(--demand)' },
        { label: 'Labor supply', curve: market.supply, color: 'var(--supply)' },
      ]}
    >
      {demandMoved && <Curve curve={base.demand} label="D₁" color="var(--demand)" ghost />}
      {supplyMoved && <Curve curve={base.supply} label="S₁" color="var(--supply)" ghost />}
      <Curve curve={market.demand} label={demandMoved ? 'D₂' : 'D'} color="var(--demand)" />
      <Curve curve={market.supply} label={supplyMoved ? 'S₂' : 'S'} color="var(--supply)" />
      {outcome && (
        <PointMarker
          point={outcome.market.equilibrium}
          qText={formatNumber(outcome.market.equilibrium.q)}
          pText={`W ${formatNumber(outcome.market.equilibrium.p)}`}
        />
      )}
      <CurveHandles
        name="labor demand"
        line={base.demand}
        onChange={state.setDemand}
        color="var(--demand)"
        slopeSign={-1}
        domain={DOMAIN}
      />
      <CurveHandles
        name="labor supply"
        line={base.supply}
        onChange={state.setSupply}
        color="var(--supply)"
        slopeSign={1}
        domain={DOMAIN}
      />
    </Graph>
  );

  const firmGraph = (
    <Graph
      title="A wage-taking firm's hiring decision"
      qDomain={DOMAIN}
      pDomain={DOMAIN}
      qLabel={`${labels.q} (firm)`}
      pLabel={labels.p}
      crosshair={[
        { label: 'MRP', curve: firmMrp, color: 'var(--demand)' },
        ...(wageLine ? [{ label: 'W = MRC', curve: wageLine, color: 'var(--supply)' }] : []),
      ]}
    >
      {wageLine && <Curve curve={wageLine} label="W = MRC" color="var(--supply)" />}
      <Curve curve={firmMrp} label="MRP" color="var(--demand)" />
      {outcome?.firm && wage !== null && (
        <PointMarker
          point={{ q: outcome.firm.quantity, p: wage }}
          qText={`L ${formatNumber(outcome.firm.quantity)}`}
          pText={`W ${formatNumber(wage)}`}
        />
      )}
      <CurveHandles
        name="the firm's MRP"
        line={firmMrp}
        onChange={setFirmMrp}
        color="var(--demand)"
        slopeSign={-1}
        domain={DOMAIN}
      />
    </Graph>
  );

  const actual =
    before.ok && after.ok
      ? compareEquilibria(before.value.market.equilibrium, after.value.market.equilibrium)
      : null;

  return (
    <ModelLayout
      title="Perfectly competitive labor market"
      intro="The market wage is set where labor supply meets labor demand, the marginal revenue product (MRP) of labor. Each firm is a wage taker: hiring one more worker costs exactly the wage (MRC = W), so it hires until MRP falls to the wage."
      graph={
        <GraphPair
          graphs={[
            { caption: 'Market', graph: marketGraph },
            { caption: 'Firm', graph: firmGraph },
          ]}
        />
      }
    >
      <PanelSection title="What changes">
        <ShifterSelect
          label="Labor demand shifter"
          curve="demand"
          catalog={LABOR_SHIFTERS}
          value={demandShifterId}
          onChange={(id) => update({ ds: id })}
        />
        {demandMoved && (
          <Slider
            label="Demand shift size"
            value={page.dz}
            onChange={(dz) => update({ dz })}
            min={0.5}
            max={4}
            step={0.5}
          />
        )}
        <ShifterSelect
          label="Labor supply shifter"
          curve="supply"
          catalog={LABOR_SHIFTERS}
          value={supplyShifterId}
          onChange={(id) => update({ ss: id })}
        />
        {supplyMoved && (
          <Slider
            label="Supply shift size"
            value={page.sz}
            onChange={(sz) => update({ sz })}
            min={0.5}
            max={4}
            step={0.5}
          />
        )}
      </PanelSection>
      <PanelSection title="Results">
        {before.ok && after.ok && actual ? (
          <>
            <ResultTable
              caption="The labor market and one firm before and after the change"
              columns={['Before', 'After', 'Change']}
              current={1}
              rows={[
                {
                  label: 'Market wage',
                  values: [
                    before.value.market.equilibrium.p,
                    after.value.market.equilibrium.p,
                    actual.priceChange,
                  ],
                },
                {
                  label: 'Market employment',
                  values: [
                    before.value.market.equilibrium.q,
                    after.value.market.equilibrium.q,
                    actual.quantityChange,
                  ],
                },
                {
                  label: 'Workers the firm hires',
                  values: [
                    before.value.firm?.quantity ?? null,
                    after.value.firm?.quantity ?? null,
                    (after.value.firm?.quantity ?? 0) - (before.value.firm?.quantity ?? 0),
                  ],
                },
              ]}
            />
            {(demandMoved || supplyMoved) && (
              <Notice>
                The market wage {VERBS[actual.price]}
                {actual.price === 'unchanged'
                  ? ''
                  : ` by ${formatNumber(Math.abs(actual.priceChange))}`}
                , so each firm moves along its MRP curve to hire{' '}
                {formatNumber(after.value.firm?.quantity ?? 0)} workers.
              </Notice>
            )}
          </>
        ) : (
          <Notice>
            {!before.ok ? before.error.message : !after.ok ? after.error.message : null}
          </Notice>
        )}
      </PanelSection>
      <MarketEditor state={state} names={LABOR_NAMES} symbols={LABOR_SYMBOLS} />
      <PanelSection title="Firm">
        <LineFields
          name="Firm's MRP"
          line={firmMrp}
          onChange={setFirmMrp}
          symbols={LABOR_SYMBOLS}
        />
      </PanelSection>
    </ModelLayout>
  );
}

const VERBS: Record<Change, string> = {
  increase: 'rises',
  decrease: 'falls',
  unchanged: 'stays the same',
  indeterminate: 'changes',
};
