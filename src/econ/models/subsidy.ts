import { priceAt } from '../core/line';
import { regionBetween, type Region } from '../core/region';
import { fail, ok, type Result } from '../core/result';
import { solveMarket, welfareAt, type Market, type MarketOutcome, type Welfare } from './market';

export interface SubsidyOutcome extends Welfare {
  readonly before: MarketOutcome;
  readonly subsidy: number;
  readonly quantity: number;
  /** Price buyers pay. */
  readonly buyerPrice: number;
  /** Price sellers receive, including the subsidy. */
  readonly sellerPrice: number;
  /** Government spending on the subsidy. */
  readonly cost: Region;
  readonly consumerBenefit: number;
  readonly producerBenefit: number;
}

/** A per-unit subsidy: sellers receive `subsidy` more per unit than buyers pay. */
export function solveSubsidy(market: Market, subsidy: number): Result<SubsidyOutcome> {
  if (!(Number.isFinite(subsidy) && subsidy >= 0)) {
    return fail('invalid-input', 'The subsidy must be zero or positive.');
  }
  const before = solveMarket(market);
  if (!before.ok) return before;

  const { demand, supply } = market;
  // Solve supply(q) - demand(q) = subsidy.
  const quantity = (demand.intercept - supply.intercept + subsidy) / (supply.slope - demand.slope);
  const sellerPrice = priceAt(supply, quantity);
  const buyerPrice = sellerPrice - subsidy;
  const p0 = before.value.equilibrium.p;

  return ok({
    before: before.value,
    subsidy,
    quantity,
    buyerPrice,
    sellerPrice,
    ...welfareAt(market, quantity, buyerPrice, sellerPrice),
    cost: regionBetween([sellerPrice], [buyerPrice], 0, quantity),
    consumerBenefit: p0 - buyerPrice,
    producerBenefit: sellerPrice - p0,
  });
}
