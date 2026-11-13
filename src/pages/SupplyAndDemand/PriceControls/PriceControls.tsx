import { useUrlState } from '../../../app/useUrlState';
import { horizontalLine } from '../../../econ/core/line';
import { solvePriceControl, type PriceControlKind } from '../../../econ/models/priceControl';
import {
  Area,
  Curve,
  DragHandle,
  formatNumber,
  Graph,
  Interval,
  PointMarker,
} from '../../../graph';
import { ModelLayout, Notice, PanelSection, ResultTable, Segmented, Slider } from '../../../ui';
import { CurveHandles } from '../../shared/CurveHandles';
import { MarketEditor } from '../shared/MarketEditor';
import { marketSeries } from '../shared/series';
import { DOMAIN, useMarket } from '../shared/useMarket';

const NAMES: Record<PriceControlKind, string> = { ceiling: 'Price ceiling', floor: 'Price floor' };
/** Where the control line's drag handle sits. */
const HANDLE_Q = DOMAIN[1] - 0.6;

/** Each kind keeps its own price, so switching back and forth doesn't lose either. */
const PAGE_DEFAULTS = { kind: 'ceiling', ceiling: 3.5, floor: 7 };

export default function PriceControls() {
  const state = useMarket();
  const { market, labels } = state;
  const [page, update] = useUrlState(PAGE_DEFAULTS);
  const kind: PriceControlKind = page.kind === 'floor' ? 'floor' : 'ceiling';
  const setKind = (value: PriceControlKind) => update({ kind: value });
  const price = page[kind];
  const setPrice = (value: number) => update({ [kind]: value });

  const result = solvePriceControl(market, kind, price);
  const outcome = result.ok ? result.value : null;
  const name = NAMES[kind];

  const graph = (
    <Graph
      title={`Supply and demand with a ${name.toLowerCase()} at ${formatNumber(price)}`}
      qDomain={DOMAIN}
      pDomain={DOMAIN}
      qLabel={labels.q}
      pLabel={labels.p}
      crosshair={marketSeries(market)}
    >
      {outcome && (
        <>
          <Area region={outcome.consumerSurplus} tone="demand" label="CS" />
          <Area region={outcome.producerSurplus} tone="supply" label="PS" />
          <Area region={outcome.deadweightLoss} tone="neutral" label="DWL" />
        </>
      )}
      <Curve curve={market.demand} label="D" color="var(--demand)" />
      <Curve curve={market.supply} label="S" color="var(--supply)" />
      <Curve
        curve={horizontalLine(price)}
        label={kind === 'ceiling' ? 'Ceiling' : 'Floor'}
        color="var(--ink-2)"
      />
      {outcome &&
        (outcome.binding ? (
          <>
            <Interval
              p={price}
              from={outcome.quantitySupplied}
              to={outcome.quantityDemanded}
              label={
                outcome.shortage > 0
                  ? `Shortage ${formatNumber(outcome.shortage)}`
                  : `Surplus ${formatNumber(outcome.surplus)}`
              }
            />
            <PointMarker
              point={{ q: outcome.quantitySupplied, p: price }}
              qText={`Qs ${formatNumber(outcome.quantitySupplied)}`}
              pText={formatNumber(price)}
            />
            <PointMarker
              point={{ q: outcome.quantityDemanded, p: price }}
              qText={`Qd ${formatNumber(outcome.quantityDemanded)}`}
            />
          </>
        ) : (
          <PointMarker
            point={outcome.before.equilibrium}
            qText={formatNumber(outcome.before.equilibrium.q)}
            pText={formatNumber(outcome.before.equilibrium.p)}
          />
        ))}
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
      <DragHandle
        label={`Move ${name.toLowerCase()}`}
        color="var(--ink-2)"
        point={{ q: HANDLE_Q, p: price }}
        axis="p"
        step={0.1}
        onChange={(pt) => setPrice(pt.p)}
      />
    </Graph>
  );

  return (
    <>
      <ModelLayout
        title="Price controls"
        intro="A price ceiling below equilibrium causes a shortage; a price floor above it causes a surplus. Either way fewer units trade, and the lost trades are the deadweight loss. Drag the control line or the curves."
        graph={graph}
      >
        <PanelSection title="Policy">
          <Segmented
            label="Type"
            value={kind}
            onChange={setKind}
            options={[
              { value: 'ceiling', label: 'Ceiling' },
              { value: 'floor', label: 'Floor' },
            ]}
          />
          <Slider
            label={`${name} price`}
            value={price}
            onChange={setPrice}
            min={DOMAIN[0]}
            max={DOMAIN[1]}
            step={0.1}
          />
        </PanelSection>
        <PanelSection title="Results">
          {outcome ? (
            <>
              <ResultTable
                caption={`Market outcome without and with the ${name.toLowerCase()}`}
                columns={['No control', `With ${kind}`]}
                rows={[
                  { label: 'Price', values: [outcome.before.equilibrium.p, outcome.marketPrice] },
                  {
                    label: 'Quantity traded',
                    values: [outcome.before.equilibrium.q, outcome.quantityTraded],
                  },
                  {
                    label: 'Quantity demanded',
                    values: [outcome.before.equilibrium.q, outcome.quantityDemanded],
                  },
                  {
                    label: 'Quantity supplied',
                    values: [outcome.before.equilibrium.q, outcome.quantitySupplied],
                  },
                  {
                    label: kind === 'ceiling' ? 'Shortage' : 'Surplus',
                    values: [0, kind === 'ceiling' ? outcome.shortage : outcome.surplus],
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
                  {
                    label: 'Deadweight loss',
                    tone: 'neutral',
                    values: [0, outcome.deadweightLoss.area],
                  },
                ]}
              />
              <Notice>
                {outcome.binding
                  ? 'Surplus assumes the units that do trade go to the buyers who value them most; real rationing usually loses more.'
                  : `The ${name.toLowerCase()} is ${kind === 'ceiling' ? 'above' : 'below'} the equilibrium price of ${formatNumber(outcome.before.equilibrium.p)}, so it is not binding and the market clears as usual.`}
              </Notice>
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
