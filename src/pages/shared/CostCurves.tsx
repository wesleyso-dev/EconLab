import { minAverageVariableCost, type CostFunction } from '../../econ/models/cost';
import { Curve, DragHandle } from '../../graph';
import { costCurves, lowestMarginalCost } from './cost';

/** MC, ATC and AVC, directly labeled. */
export function CostCurves({ cost }: { cost: CostFunction }) {
  const { mc, avc, atc } = costCurves(cost);
  return (
    <>
      <Curve curve={avc} label="AVC" color="var(--social)" dashed />
      <Curve curve={atc} label="ATC" color="var(--social)" />
      <Curve curve={mc} label="MC" color="var(--supply)" />
    </>
  );
}

/**
 * A handle at the bottom of AVC (where MC crosses it) that raises or lowers every
 * unit's cost, moving MC, AVC and ATC together. MC is kept from going negative.
 */
export function CostHandle({
  cost,
  onChange,
  domain,
}: {
  cost: CostFunction;
  onChange: (cost: CostFunction) => void;
  domain: readonly [number, number];
}) {
  const point = minAverageVariableCost(cost);
  // Rounded up to the step, so snapping can never push MC below zero.
  const floor = Math.ceil((point.p - lowestMarginalCost(cost)) * 10) / 10;
  return (
    <DragHandle
      label="Shift costs"
      color="var(--supply)"
      point={point}
      axis="p"
      step={0.1}
      pBounds={[Math.max(domain[0], floor), domain[1]]}
      onChange={(pt) => onChange({ ...cost, linear: cost.linear + (pt.p - point.p) })}
    />
  );
}
