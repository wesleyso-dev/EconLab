import { intersect, priceAt, quantityAt, toPoly, type Line, type Point } from '../core/line';
import { regionBetween, type Region } from '../core/region';
import { allFinite, fail, ok, type Result } from '../core/result';
import { solveMarket, validateMarket, type Market, type MarketOutcome } from './market';
import type { Shifter } from './shifts';

/** A labor market: demand is the marginal revenue product (MRP) of labor, price is the wage. */
export type LaborMarket = Market;

/**
 * What shifts labor demand (the marginal revenue product of labor) and labor supply.
 * Labor demand is derived from the demand for the product workers make.
 */
export const LABOR_SHIFTERS: readonly Shifter[] = [
  {
    id: 'labor-product-price-up',
    label: 'Price of the product rises',
    curve: 'demand',
    direction: 'increase',
  },
  {
    id: 'labor-product-price-down',
    label: 'Price of the product falls',
    curve: 'demand',
    direction: 'decrease',
  },
  {
    id: 'labor-productivity-up',
    label: 'Workers become more productive',
    curve: 'demand',
    direction: 'increase',
  },
  {
    id: 'labor-productivity-down',
    label: 'Workers become less productive',
    curve: 'demand',
    direction: 'decrease',
  },
  {
    id: 'labor-workers-up',
    label: 'More workers enter the market',
    curve: 'supply',
    direction: 'increase',
  },
  {
    id: 'labor-workers-down',
    label: 'Fewer workers in the market',
    curve: 'supply',
    direction: 'decrease',
  },
  {
    id: 'labor-other-wages-up',
    label: 'Wages rise in other occupations',
    curve: 'supply',
    direction: 'decrease',
  },
  {
    id: 'labor-other-wages-down',
    label: 'Wages fall in other occupations',
    curve: 'supply',
    direction: 'increase',
  },
  {
    id: 'labor-licensing',
    label: 'New licensing requirements',
    curve: 'supply',
    direction: 'decrease',
  },
];

export interface CompetitiveLaborOutcome {
  readonly market: MarketOutcome;
  /** A wage-taking firm hires until its MRP equals the market wage (MRC = wage). */
  readonly firm: { readonly wage: number; readonly quantity: number } | null;
}

export function solveCompetitiveLaborMarket(
  market: LaborMarket,
  firmMarginalRevenueProduct?: Line,
): Result<CompetitiveLaborOutcome> {
  const outcome = solveMarket(market);
  if (!outcome.ok) return outcome;
  if (!firmMarginalRevenueProduct) return ok({ market: outcome.value, firm: null });

  const { intercept, slope } = firmMarginalRevenueProduct;
  if (!allFinite(intercept, slope) || !(slope < 0)) {
    return fail('invalid-input', "The firm's MRP curve must slope downward.");
  }
  const wage = outcome.value.equilibrium.p;
  const quantity = Math.max(0, quantityAt(firmMarginalRevenueProduct, wage) ?? 0);
  return ok({ market: outcome.value, firm: { wage, quantity } });
}

export interface MonopsonyOutcome {
  readonly quantity: number;
  /** Wage paid, read off the labor supply curve at the hiring quantity. */
  readonly wage: number;
  /** For linear supply W = c + dL, MRC = c + 2dL. */
  readonly marginalResourceCost: Line;
  /** MRP (= MRC) at the hiring quantity. */
  readonly marginalRevenueProduct: number;
  readonly competitive: Point;
  readonly deadweightLoss: Region;
}

/** A single employer: hires where MRC = MRP and pays the wage on the supply curve. */
export function solveMonopsony(market: LaborMarket): Result<MonopsonyOutcome> {
  const error = validateMarket(market);
  if (error) return { ok: false, error };

  const { demand, supply } = market;
  const marginalResourceCost: Line = { intercept: supply.intercept, slope: 2 * supply.slope };
  const hiring = intersect(marginalResourceCost, demand);
  const competitive = intersect(demand, supply);
  if (!hiring || !competitive) return fail('invalid-input', 'The curves never intersect.');

  return ok({
    quantity: hiring.q,
    wage: priceAt(supply, hiring.q),
    marginalResourceCost,
    marginalRevenueProduct: hiring.p,
    competitive,
    deadweightLoss: regionBetween(toPoly(demand), toPoly(supply), hiring.q, competitive.q),
  });
}
