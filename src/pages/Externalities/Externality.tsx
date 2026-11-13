import { useUrlState } from '../../app/useUrlState';
import { addLines, priceAt, type Line } from '../../econ/core/line';
import { solveExternality, type ExternalityKind } from '../../econ/models/externality';
import { Area, Curve, DragHandle, formatNumber, Graph, PointMarker } from '../../graph';
import {
  Disclosure,
  ModelLayout,
  Notice,
  NumberField,
  PanelSection,
  ResultTable,
  Slider,
} from '../../ui';
import { CurveHandles } from '../shared/CurveHandles';
import { MarketEditor } from '../SupplyAndDemand/shared/MarketEditor';
import { DOMAIN, useMarket } from '../SupplyAndDemand/shared/useMarket';

/** External cost or benefit per unit: e0 + e1·Q. A constant 2 per unit by default. */
const PAGE_DEFAULTS = { e0: 2, e1: 0 };
/** Where the handle that sizes the externality sits on the social curve. */
const HANDLE_Q = 2;

const TEXT: Record<
  ExternalityKind,
  {
    title: string;
    intro: string;
    effect: string;
    social: string;
    privateCurve: 'supply' | 'demand';
    labels: { demand: string; supply: string; social: string };
    fix: string;
  }
> = {
  negative: {
    title: 'Negative externality',
    intro:
      'When production imposes a cost on people outside the market, such as pollution, sellers ignore it. The market produces more than is socially optimal, where marginal social cost (MSC) meets demand. Drag the MSC handle to change the external cost.',
    effect: 'External cost per unit',
    social: 'MSC',
    privateCurve: 'supply',
    labels: { demand: 'D = MSB', supply: 'S = MPC', social: 'MSC' },
    fix: 'tax',
  },
  positive: {
    title: 'Positive externality',
    intro:
      'When consumption benefits people outside the market, such as vaccinations, buyers ignore that benefit. The market produces less than is socially optimal, where marginal social benefit (MSB) meets supply. Drag the MSB handle to change the external benefit.',
    effect: 'External benefit per unit',
    social: 'MSB',
    privateCurve: 'demand',
    labels: { demand: 'D = MPB', supply: 'S = MSC', social: 'MSB' },
    fix: 'subsidy',
  },
};

export default function Externality({ kind }: { kind: ExternalityKind }) {
  const state = useMarket();
  const { market, labels } = state;
  const [page, update] = useUrlState(PAGE_DEFAULTS);
  const text = TEXT[kind];
  const externality: Line = { intercept: page.e0, slope: page.e1 };
  const privateLine = market[text.privateCurve];
  const socialLine = addLines(privateLine, externality);

  const result = solveExternality(market, kind, externality);
  const outcome = result.ok ? result.value : null;

  // The handle moves the social curve vertically, keeping it on or above the private one.
  const handleBase = priceAt(privateLine, HANDLE_Q) + page.e1 * HANDLE_Q;

  const graph = (
    <Graph
      title={`${text.title}: market and socially optimal output`}
      qDomain={DOMAIN}
      pDomain={DOMAIN}
      qLabel={labels.q}
      pLabel={labels.p}
      crosshair={[
        { label: 'Demand', curve: market.demand, color: 'var(--demand)' },
        { label: 'Supply', curve: market.supply, color: 'var(--supply)' },
        { label: text.social, curve: socialLine, color: 'var(--social)' },
      ]}
    >
      {outcome && <Area region={outcome.deadweightLoss} tone="neutral" label="DWL" />}
      <Curve curve={market.demand} label={text.labels.demand} color="var(--demand)" />
      <Curve curve={market.supply} label={text.labels.supply} color="var(--supply)" />
      <Curve curve={socialLine} label={text.labels.social} color="var(--social)" />
      {outcome && (
        <>
          <PointMarker
            point={outcome.marketOutcome}
            qText={`Qm ${formatNumber(outcome.marketOutcome.q)}`}
            pText={`Pm ${formatNumber(outcome.marketOutcome.p)}`}
          />
          <PointMarker
            point={outcome.socialOptimum}
            qText={`Q* ${formatNumber(outcome.socialOptimum.q)}`}
            pText={`P* ${formatNumber(outcome.socialOptimum.p)}`}
          />
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
      <DragHandle
        label={`Change ${text.effect.toLowerCase()}`}
        color="var(--social)"
        point={{ q: HANDLE_Q, p: priceAt(socialLine, HANDLE_Q) }}
        axis="p"
        step={0.1}
        pBounds={[handleBase, DOMAIN[1]]}
        onChange={(pt) => update({ e0: pt.p - handleBase })}
      />
    </Graph>
  );

  return (
    <ModelLayout title={text.title} intro={text.intro} graph={graph}>
      <PanelSection title="Externality">
        <Slider
          label={text.effect}
          value={page.e0}
          onChange={(e0) => update({ e0 })}
          min={0}
          max={8}
          step={0.1}
        />
        <Disclosure summary="Make it change with quantity">
          <NumberField
            label={`Added per unit of ${labels.q.toLowerCase()}`}
            value={page.e1}
            onChange={(e1) => update({ e1 })}
            step={0.1}
          />
        </Disclosure>
      </PanelSection>
      <PanelSection title="Results">
        {outcome ? (
          <>
            <ResultTable
              caption="The market outcome compared with the social optimum"
              columns={['Market', 'Social optimum']}
              current={0}
              rows={[
                {
                  label: 'Quantity',
                  values: [outcome.marketOutcome.q, outcome.socialOptimum.q],
                },
                { label: 'Price', values: [outcome.marketOutcome.p, outcome.socialOptimum.p] },
                {
                  label: 'Deadweight loss',
                  tone: 'neutral',
                  values: [outcome.deadweightLoss.area, 0],
                },
              ]}
            />
            <Notice>
              {kind === 'negative'
                ? `The market ignores the external cost, so it produces ${formatNumber(outcome.marketOutcome.q)} instead of the socially optimal ${formatNumber(outcome.socialOptimum.q)}.`
                : `The market ignores the external benefit, so it produces ${formatNumber(outcome.marketOutcome.q)} instead of the socially optimal ${formatNumber(outcome.socialOptimum.q)}.`}{' '}
              A per-unit {text.fix} of {formatNumber(outcome.correctiveAmount)}, equal to the
              external {kind === 'negative' ? 'cost' : 'benefit'} at the optimum, would move the
              market there.
            </Notice>
          </>
        ) : (
          <Notice>{result.ok ? null : result.error.message}</Notice>
        )}
      </PanelSection>
      <MarketEditor state={state} />
    </ModelLayout>
  );
}
