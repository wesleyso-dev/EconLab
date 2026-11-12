import { useState } from 'react';
import { shiftQuantity } from '../../../econ/core/line';
import { solveMarket } from '../../../econ/models/market';
import {
  compareEquilibria,
  predictShiftEffects,
  SHIFTERS,
  type Change,
  type Shifter,
  type ShiftDirection,
} from '../../../econ/models/shifts';
import { Area, Curve, formatNumber, Graph, PointMarker } from '../../../graph';
import { ModelLayout, Notice, PanelSection, ResultTable, Select, Slider } from '../../../ui';
import { CurveHandles } from '../shared/CurveHandles';
import { MarketEditor } from '../shared/MarketEditor';
import { SupplyDemandNav } from '../shared/SupplyDemandNav';
import { DOMAIN, useMarket } from '../shared/useMarket';

const NONE = 'none';

export default function Shifts() {
  const state = useMarket();
  const { market, labels } = state;
  const [demandShifterId, setDemandShifterId] = useState('demand-income-up');
  const [supplyShifterId, setSupplyShifterId] = useState(NONE);
  const [demandSize, setDemandSize] = useState(2);
  const [supplySize, setSupplySize] = useState(2);

  const demandShifter = SHIFTERS.find((s) => s.id === demandShifterId);
  const supplyShifter = SHIFTERS.find((s) => s.id === supplyShifterId);
  const demandDirection = demandShifter?.direction ?? 'none';
  const supplyDirection = supplyShifter?.direction ?? 'none';
  const shifted = {
    demand: shiftQuantity(market.demand, sign(demandDirection) * demandSize),
    supply: shiftQuantity(market.supply, sign(supplyDirection) * supplySize),
  };
  const demandMoved = demandDirection !== 'none';
  const supplyMoved = supplyDirection !== 'none';

  const before = solveMarket(market);
  const after = solveMarket(shifted);
  const prediction = predictShiftEffects(supplyDirection, demandDirection);
  const actual =
    before.ok && after.ok
      ? compareEquilibria(before.value.equilibrium, after.value.equilibrium)
      : null;

  const graph = (
    <Graph
      title="Supply and demand before and after a shift"
      qDomain={DOMAIN}
      pDomain={DOMAIN}
      qLabel={labels.q}
      pLabel={labels.p}
      crosshair={[
        { label: demandMoved ? 'D₁' : 'D', curve: market.demand, color: 'var(--demand)' },
        { label: supplyMoved ? 'S₁' : 'S', curve: market.supply, color: 'var(--supply)' },
        ...(demandMoved ? [{ label: 'D₂', curve: shifted.demand, color: 'var(--demand)' }] : []),
        ...(supplyMoved ? [{ label: 'S₂', curve: shifted.supply, color: 'var(--supply)' }] : []),
      ]}
    >
      {after.ok && (
        <>
          <Area region={after.value.consumerSurplus} tone="demand" label="CS" />
          <Area region={after.value.producerSurplus} tone="supply" label="PS" />
        </>
      )}
      <Curve
        curve={market.demand}
        label={demandMoved ? 'D₁' : 'D'}
        color="var(--demand)"
        ghost={demandMoved}
      />
      <Curve
        curve={market.supply}
        label={supplyMoved ? 'S₁' : 'S'}
        color="var(--supply)"
        ghost={supplyMoved}
      />
      {demandMoved && <Curve curve={shifted.demand} label="D₂" color="var(--demand)" />}
      {supplyMoved && <Curve curve={shifted.supply} label="S₂" color="var(--supply)" />}
      {before.ok && (demandMoved || supplyMoved) && (
        <PointMarker
          point={before.value.equilibrium}
          qText={`Q₁ ${formatNumber(before.value.equilibrium.q)}`}
          pText={`P₁ ${formatNumber(before.value.equilibrium.p)}`}
        />
      )}
      {after.ok && (
        <PointMarker
          point={after.value.equilibrium}
          qText={
            demandMoved || supplyMoved
              ? `Q₂ ${formatNumber(after.value.equilibrium.q)}`
              : formatNumber(after.value.equilibrium.q)
          }
          pText={
            demandMoved || supplyMoved
              ? `P₂ ${formatNumber(after.value.equilibrium.p)}`
              : formatNumber(after.value.equilibrium.p)
          }
        />
      )}
      <CurveHandles
        name="demand"
        line={market.demand}
        onChange={state.setDemand}
        color="var(--demand)"
        slopeSign={-1}
      />
      <CurveHandles
        name="supply"
        line={market.supply}
        onChange={state.setSupply}
        color="var(--supply)"
        slopeSign={1}
      />
    </Graph>
  );

  return (
    <>
      <SupplyDemandNav />
      <ModelLayout
        title="Equilibrium and shifts"
        intro="Choose what changes in the market to shift demand or supply, then compare the new equilibrium with the old one. When both curves shift, theory can only predict one of price and quantity; the other depends on which shift is larger."
        graph={graph}
      >
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
          {before.ok && after.ok && actual ? (
            <>
              <ResultTable
                caption="Equilibrium before and after the shift"
                columns={['Before', 'After', 'Change']}
                rows={[
                  {
                    label: 'Price',
                    values: [
                      before.value.equilibrium.p,
                      after.value.equilibrium.p,
                      actual.priceChange,
                    ],
                  },
                  {
                    label: 'Quantity',
                    values: [
                      before.value.equilibrium.q,
                      after.value.equilibrium.q,
                      actual.quantityChange,
                    ],
                  },
                  {
                    label: 'Consumer surplus',
                    tone: 'demand',
                    values: [
                      before.value.consumerSurplus.area,
                      after.value.consumerSurplus.area,
                      after.value.consumerSurplus.area - before.value.consumerSurplus.area,
                    ],
                  },
                  {
                    label: 'Producer surplus',
                    tone: 'supply',
                    values: [
                      before.value.producerSurplus.area,
                      after.value.producerSurplus.area,
                      after.value.producerSurplus.area - before.value.producerSurplus.area,
                    ],
                  },
                ]}
              />
              {(demandMoved || supplyMoved) && (
                <Notice>
                  {describe('Price', prediction.price, actual.price, actual.priceChange)}{' '}
                  {describe(
                    'Quantity',
                    prediction.quantity,
                    actual.quantity,
                    actual.quantityChange,
                  )}
                </Notice>
              )}
            </>
          ) : (
            <Notice>
              {!before.ok
                ? before.error.message
                : !after.ok
                  ? `After the shift: ${after.error.message}`
                  : null}
            </Notice>
          )}
        </PanelSection>
        <MarketEditor state={state} />
      </ModelLayout>
    </>
  );
}

function ShifterSelect({
  label,
  curve,
  value,
  onChange,
}: {
  label: string;
  curve: Shifter['curve'];
  value: string;
  onChange: (id: string) => void;
}) {
  const options = SHIFTERS.filter((s) => s.curve === curve);
  const group = (direction: Shifter['direction']) => (
    <optgroup label={`${curve === 'demand' ? 'Demand' : 'Supply'} ${direction}s`}>
      {options
        .filter((s) => s.direction === direction)
        .map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
    </optgroup>
  );
  return (
    <Select label={label} value={value} onChange={onChange}>
      <option value={NONE}>No change</option>
      {group('increase')}
      {group('decrease')}
    </Select>
  );
}

function sign(direction: ShiftDirection): number {
  return direction === 'increase' ? 1 : direction === 'decrease' ? -1 : 0;
}

const VERBS: Record<Exclude<Change, 'indeterminate'>, string> = {
  increase: 'rises',
  decrease: 'falls',
  unchanged: 'stays the same',
};

/** "Price rises by 0.5." or "Quantity is indeterminate in theory; here it falls by 0.2." */
function describe(name: string, predicted: Change, actual: Change, delta: number): string {
  const amount = actual === 'unchanged' ? '' : ` by ${formatNumber(Math.abs(delta))}`;
  if (predicted !== 'indeterminate') return `${name} ${VERBS[predicted]}${amount}.`;
  const verb = actual === 'indeterminate' ? VERBS.unchanged : VERBS[actual];
  return `${name} could go either way in theory; here it ${verb}${amount} because of the relative sizes of the shifts.`;
}
