import type { Poly } from '../../econ/core/poly';
import { averageTotalCost, marginalCostPoly, type CostFunction } from '../../econ/models/cost';
import type { CrosshairSeries } from '../../graph';
import { formatNumber } from '../../graph';

/**
 * TC = 10 + 6Q − 1.2Q² + 0.1Q³: U-shaped MC (lowest at Q 4), AVC (lowest at Q 6,
 * the shutdown point) and ATC (lowest near Q 7, the break-even point).
 */
export const DEFAULT_COST: CostFunction = { fixed: 10, linear: 6, quadratic: -1.2, cubic: 0.1 };

/** MC, AVC and ATC as drawable curves, all derived from the one cost function. */
export function costCurves(cost: CostFunction) {
  return {
    mc: marginalCostPoly(cost),
    avc: [cost.linear, cost.quadratic, cost.cubic] as Poly,
    atc: (q: number) => averageTotalCost(cost, q),
  };
}

export function costSeries(cost: CostFunction): CrosshairSeries[] {
  const { mc, avc, atc } = costCurves(cost);
  return [
    { label: 'MC', curve: mc, color: 'var(--supply)' },
    { label: 'ATC', curve: atc, color: 'var(--social)' },
    { label: 'AVC', curve: avc, color: 'var(--social)', dashed: true },
  ];
}

/** The lowest value MC reaches; it must stay at or above zero. */
export function lowestMarginalCost(cost: CostFunction): number {
  return cost.cubic > 0 && cost.quadratic < 0
    ? cost.linear - (cost.quadratic * cost.quadratic) / (3 * cost.cubic)
    : cost.linear;
}

/** "TC = 10 + 6Q − 1.2Q² + 0.1Q³" */
export function costEquation(cost: CostFunction): string {
  const terms: [number, string][] = [
    [cost.linear, 'Q'],
    [cost.quadratic, 'Q²'],
    [cost.cubic, 'Q³'],
  ];
  let text = `TC = ${formatNumber(cost.fixed)}`;
  for (const [coefficient, power] of terms) {
    const magnitude = formatNumber(Math.abs(coefficient), 3);
    if (magnitude === '0') continue;
    text += ` ${coefficient < 0 ? '−' : '+'} ${magnitude === '1' ? '' : magnitude}${power}`;
  }
  return text;
}
