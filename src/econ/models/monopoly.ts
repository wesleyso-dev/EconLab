import { priceAt, toPoly, type Line, type Point } from '../core/line';
import { EMPTY_REGION, regionBetween, type Region } from '../core/region';
import { allFinite, fail, ok, type Result } from '../core/result';
import { largestQuadraticRoot } from '../core/roots';
import {
  averageTotalCost,
  averageVariableCost,
  marginalCost,
  marginalCostPoly,
  totalCost,
  validateCost,
  type CostFunction,
} from './cost';

export interface MonopolyOutcome {
  /** True when the monopolist cannot cover variable cost and produces nothing. */
  readonly shutDown: boolean;
  readonly quantity: number;
  /** Price from the demand curve at the profit-maximizing quantity. */
  readonly price: number;
  readonly marginalRevenue: Line;
  readonly marginalCost: number;
  readonly totalRevenue: number;
  readonly totalCost: number;
  readonly profit: number;
  readonly profitRegion: Region;
  readonly consumerSurplus: Region;
  /** Revenue minus variable cost: the area between price and MC. */
  readonly producerSurplus: Region;
  /** Lost surplus relative to the competitive (P = MC) outcome. */
  readonly deadweightLoss: Region;
  /** The allocatively efficient outcome where demand meets MC. */
  readonly competitive: Point | null;
  /** Where MR = 0. Demand is elastic at smaller quantities, inelastic at larger ones. */
  readonly unitElastic: Point;
}

/** A single-price monopolist facing linear demand: produce where MR = MC. */
export function solveMonopoly(demand: Line, cost: CostFunction): Result<MonopolyOutcome> {
  if (!allFinite(demand.intercept, demand.slope)) {
    return fail('invalid-input', 'Demand parameters must be finite numbers.');
  }
  if (!(demand.slope < 0)) return fail('invalid-input', 'Demand must slope downward.');
  if (!(demand.intercept > 0)) {
    return fail('invalid-input', 'Demand must start above a price of zero.');
  }
  const costError = validateCost(cost);
  if (costError) return { ok: false, error: costError };

  const { intercept: a, slope: b } = demand;
  const marginalRevenue: Line = { intercept: a, slope: 2 * b };

  // MR = MC:  3·cubic·q² + (2·quadratic − 2b)·q + (linear − a) = 0
  const candidate = largestQuadraticRoot(
    3 * cost.cubic,
    2 * cost.quadratic - 2 * b,
    cost.linear - a,
  );
  // Competitive benchmark, P = MC:  3·cubic·q² + (2·quadratic − b)·q + (linear − a) = 0
  const competitiveQ = largestQuadraticRoot(
    3 * cost.cubic,
    2 * cost.quadratic - b,
    cost.linear - a,
  );
  const competitive =
    competitiveQ !== null && competitiveQ > 0
      ? { q: competitiveQ, p: priceAt(demand, competitiveQ) }
      : null;

  const shutDown =
    candidate === null ||
    candidate <= 0 ||
    priceAt(demand, candidate) < averageVariableCost(cost, candidate);
  const quantity = shutDown || candidate === null ? 0 : candidate;
  const price = priceAt(demand, quantity);
  const totalCostAtQ = totalCost(cost, quantity);
  const mc = marginalCostPoly(cost);
  const atc = averageTotalCost(cost, quantity);

  return ok({
    shutDown,
    quantity,
    price,
    marginalRevenue,
    marginalCost: marginalCost(cost, quantity),
    totalRevenue: price * quantity,
    totalCost: totalCostAtQ,
    profit: price * quantity - totalCostAtQ,
    profitRegion: shutDown
      ? EMPTY_REGION
      : regionBetween([Math.max(price, atc)], [Math.min(price, atc)], 0, quantity),
    consumerSurplus: regionBetween(toPoly(demand), [price], 0, quantity),
    producerSurplus: regionBetween([price], mc, 0, quantity),
    deadweightLoss: competitive
      ? regionBetween(toPoly(demand), mc, quantity, competitive.q)
      : EMPTY_REGION,
    competitive,
    unitElastic: { q: -a / (2 * b), p: a / 2 },
  });
}
