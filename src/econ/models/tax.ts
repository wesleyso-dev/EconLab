import { priceAt } from '../core/line';
import { regionBetween, type Region } from '../core/region';
import { fail, ok, type Result } from '../core/result';
import { solveMarket, welfareAt, type Market, type MarketOutcome, type Welfare } from './market';

export interface TaxOutcome extends Welfare {
  readonly before: MarketOutcome;
  readonly tax: number;
  readonly quantity: number;
  /** Price buyers pay, including the tax. */
  readonly buyerPrice: number;
  /** Price sellers keep after paying the tax. */
  readonly sellerPrice: number;
  readonly revenue: Region;
  /** Per-unit burden borne by each side, relative to the pre-tax price. */
  readonly consumerBurden: number;
  readonly producerBurden: number;
  /** Fraction of the tax borne by consumers, in [0, 1]. */
  readonly consumerShare: number;
}

/**
 * A per-unit tax. The economic outcome is the same whether the law places it on
 * buyers or sellers: it drives a wedge of size `tax` between the two prices.
 * A tax large enough to eliminate all trade yields quantity 0.
 */
export function solveTax(market: Market, tax: number): Result<TaxOutcome> {
  if (!(Number.isFinite(tax) && tax >= 0)) {
    return fail('invalid-input', 'The tax must be zero or positive.');
  }
  const before = solveMarket(market);
  if (!before.ok) return before;

  const { demand, supply } = market;
  // Solve demand(q) - supply(q) = tax.
  const quantity = Math.max(
    0,
    (demand.intercept - supply.intercept - tax) / (supply.slope - demand.slope),
  );
  const buyerPrice = priceAt(demand, quantity);
  const sellerPrice = buyerPrice - tax;
  const p0 = before.value.equilibrium.p;

  return ok({
    before: before.value,
    tax,
    quantity,
    buyerPrice,
    sellerPrice,
    ...welfareAt(market, quantity, buyerPrice, sellerPrice),
    revenue: regionBetween([buyerPrice], [sellerPrice], 0, quantity),
    consumerBurden: buyerPrice - p0,
    producerBurden: p0 - sellerPrice,
    consumerShare: tax === 0 ? 0 : (buyerPrice - p0) / tax,
  });
}
