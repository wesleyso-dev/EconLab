import type { Point } from '../core/line';
import type { Poly } from '../core/poly';
import { evaluate } from '../core/poly';
import { allFinite, modelError, type ModelError } from '../core/result';
import { bisect, largestQuadraticRoot } from '../core/roots';

/**
 * A firm's short-run total cost, TC(q) = fixed + linear·q + quadratic·q² + cubic·q³.
 *
 * MC, ATC and AVC are all derived from this one function, so they are always
 * consistent: MC passes through the minimum of both AVC and ATC. A negative
 * `quadratic` with a positive `cubic` gives the textbook U-shaped curves.
 */
export interface CostFunction {
  readonly fixed: number;
  readonly linear: number;
  readonly quadratic: number;
  readonly cubic: number;
}

export function validateCost(cost: CostFunction): ModelError | null {
  const { fixed, linear, quadratic, cubic } = cost;
  if (!allFinite(fixed, linear, quadratic, cubic)) {
    return modelError('invalid-input', 'Cost parameters must be finite numbers.');
  }
  if (fixed < 0) return modelError('invalid-input', 'Fixed cost cannot be negative.');
  if (cubic < 0 || (cubic === 0 && quadratic < 0)) {
    return modelError('invalid-input', 'Marginal cost must not fall forever.');
  }
  const lowestMarginalCost =
    cubic > 0 && quadratic < 0 ? linear - (quadratic * quadratic) / (3 * cubic) : linear;
  if (lowestMarginalCost < 0) {
    return modelError('invalid-input', 'Marginal cost cannot be negative.');
  }
  return null;
}

/** True when MC eventually rises, so a price-taking firm has a finite output. */
export function hasRisingMarginalCost(cost: CostFunction): boolean {
  return cost.cubic > 0 || cost.quadratic > 0;
}

export function marginalCostPoly(cost: CostFunction): Poly {
  return [cost.linear, 2 * cost.quadratic, 3 * cost.cubic];
}

export function variableCost(cost: CostFunction, q: number): number {
  return evaluate([0, cost.linear, cost.quadratic, cost.cubic], q);
}

export function totalCost(cost: CostFunction, q: number): number {
  return cost.fixed + variableCost(cost, q);
}

export function marginalCost(cost: CostFunction, q: number): number {
  return evaluate(marginalCostPoly(cost), q);
}

/** AVC(q); at q = 0 this is the limit, which equals MC(0). */
export function averageVariableCost(cost: CostFunction, q: number): number {
  return evaluate([cost.linear, cost.quadratic, cost.cubic], q);
}

/** ATC(q); infinite at q = 0 when there is a fixed cost. */
export function averageTotalCost(cost: CostFunction, q: number): number {
  if (q <= 0) return cost.fixed > 0 ? Infinity : averageVariableCost(cost, 0);
  return cost.fixed / q + averageVariableCost(cost, q);
}

/** Minimum of AVC: the short-run shutdown point. */
export function minAverageVariableCost(cost: CostFunction): Point {
  const q = cost.cubic > 0 && cost.quadratic < 0 ? -cost.quadratic / (2 * cost.cubic) : 0;
  return { q, p: averageVariableCost(cost, q) };
}

/**
 * Minimum of ATC: the break-even point, and the long-run competitive price.
 * Null when ATC falls forever (no fixed cost limit is reached).
 */
export function minAverageTotalCost(cost: CostFunction): Point | null {
  if (cost.fixed === 0) return minAverageVariableCost(cost);
  if (!hasRisingMarginalCost(cost)) return null;

  // ATC'(q) = 0  ⇔  2·cubic·q³ + quadratic·q² − fixed = 0, which has one positive root.
  const g = (q: number) => 2 * cost.cubic * q ** 3 + cost.quadratic * q ** 2 - cost.fixed;
  let hi = 1;
  while (g(hi) <= 0) hi *= 2;
  const q = bisect(g, 0, hi);
  return { q, p: averageTotalCost(cost, q) };
}

/** The largest quantity at which MC = `value` (on MC's rising portion), or null. */
export function quantityWhereMarginalCostEquals(cost: CostFunction, value: number): number | null {
  // 3·cubic·q² + 2·quadratic·q + (linear − value) = 0
  const q = largestQuadraticRoot(3 * cost.cubic, 2 * cost.quadratic, cost.linear - value);
  return q !== null && q >= 0 ? q : null;
}
