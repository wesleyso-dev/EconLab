import { intersect, toPoly, type Line, type Point } from '../core/line';
import { EMPTY_REGION, regionBetween, type Region } from '../core/region';
import { allFinite, fail, modelError, ok, type ModelError, type Result } from '../core/result';

/** A competitive market with linear demand and supply, in inverse form p(q). */
export interface Market {
  readonly demand: Line;
  readonly supply: Line;
}

export interface Welfare {
  readonly consumerSurplus: Region;
  readonly producerSurplus: Region;
  /** Surplus lost relative to the competitive equilibrium. */
  readonly deadweightLoss: Region;
}

export interface MarketOutcome extends Welfare {
  readonly equilibrium: Point;
  readonly totalSurplus: number;
}

export function validateMarket(market: Market): ModelError | null {
  const { demand, supply } = market;
  if (!allFinite(demand.intercept, demand.slope, supply.intercept, supply.slope)) {
    return modelError('invalid-input', 'Curve parameters must be finite numbers.');
  }
  if (!(demand.slope < 0)) return modelError('invalid-input', 'Demand must slope downward.');
  if (!(supply.slope > 0)) return modelError('invalid-input', 'Supply must slope upward.');
  if (!(demand.intercept > 0)) {
    return modelError('invalid-input', 'Demand must start above a price of zero.');
  }
  if (supply.intercept < 0) {
    return modelError('invalid-input', 'Supply cannot start below a price of zero.');
  }
  if (demand.intercept <= supply.intercept) {
    return modelError(
      'no-trade',
      "Buyers' highest willingness to pay is below sellers' lowest cost, so nothing is traded.",
    );
  }
  return null;
}

/** The competitive equilibrium and its consumer and producer surplus. */
export function solveMarket(market: Market): Result<MarketOutcome> {
  const error = validateMarket(market);
  if (error) return { ok: false, error };

  const equilibrium = intersect(market.demand, market.supply);
  if (!equilibrium) return fail('invalid-input', 'Demand and supply never intersect.');

  const welfare = welfareAt(market, equilibrium.q, equilibrium.p, equilibrium.p);
  return ok({
    equilibrium,
    ...welfare,
    totalSurplus: welfare.consumerSurplus.area + welfare.producerSurplus.area,
  });
}

/**
 * Welfare when `quantity` units trade, buyers pay `buyerPrice` and sellers receive
 * `sellerPrice` (the two differ under a tax or subsidy). Assumes the units go to the
 * buyers who value them most and come from the lowest-cost sellers.
 */
export function welfareAt(
  market: Market,
  quantity: number,
  buyerPrice: number,
  sellerPrice: number,
): Welfare {
  const demand = toPoly(market.demand);
  const supply = toPoly(market.supply);
  const equilibrium = intersect(market.demand, market.supply);
  const efficientQuantity = equilibrium ? equilibrium.q : quantity;

  let deadweightLoss = EMPTY_REGION;
  if (quantity < efficientQuantity) {
    deadweightLoss = regionBetween(demand, supply, quantity, efficientQuantity);
  } else if (quantity > efficientQuantity) {
    deadweightLoss = regionBetween(supply, demand, efficientQuantity, quantity);
  }

  return {
    consumerSurplus: regionBetween(demand, [buyerPrice], 0, quantity),
    producerSurplus: regionBetween([sellerPrice], supply, 0, quantity),
    deadweightLoss,
  };
}
