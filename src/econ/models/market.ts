import { intersect, toPoly, type Line, type Point } from '../core/line';
import { EMPTY_REGION, joinRegions, regionBetween, type Region } from '../core/region';
import type { Poly } from '../core/poly';
import { allFinite, fail, modelError, ok, type ModelError, type Result } from '../core/result';

/**
 * A competitive market with linear demand and supply, in inverse form p(q). Supply
 * may meet the quantity axis at a positive quantity (a negative intercept): prices
 * cannot fall below zero, so the curve is treated as running along the axis there.
 */
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
  if (demand.intercept <= supply.intercept) {
    return modelError(
      'no-trade',
      "Buyers' highest willingness to pay is below sellers' lowest cost, so nothing is traded.",
    );
  }
  const equilibrium = intersect(demand, supply);
  if (equilibrium && !(equilibrium.p > 0)) {
    return modelError(
      'invalid-input',
      'Even at a price of zero, sellers would supply more than buyers want.',
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
    deadweightLoss = regionAboveSupply(demand, market.supply, quantity, efficientQuantity);
  } else if (quantity > efficientQuantity) {
    deadweightLoss = regionBetween(supply, demand, efficientQuantity, quantity);
  }

  return {
    consumerSurplus: regionBetween(demand, [buyerPrice], 0, quantity),
    producerSurplus: regionAboveSupply([sellerPrice], market.supply, 0, quantity),
    deadweightLoss,
  };
}

/** The region between `upper` and the supply curve, which is floored at a price of zero. */
function regionAboveSupply(upper: Poly, supply: Line, from: number, to: number): Region {
  const kink = supply.intercept < 0 ? -supply.intercept / supply.slope : from;
  if (kink <= from) return regionBetween(upper, toPoly(supply), from, to);
  if (kink >= to) return regionBetween(upper, [0], from, to);
  return joinRegions(
    regionBetween(upper, [0], from, kink),
    regionBetween(upper, toPoly(supply), kink, to),
  );
}
