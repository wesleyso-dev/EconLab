import { quantityAt, type Line } from '../core/line';
import { fail, ok, type Result } from '../core/result';
import { solveMarket, welfareAt, type Market, type MarketOutcome, type Welfare } from './market';

export type PriceControlKind = 'ceiling' | 'floor';

export interface PriceControlOutcome extends Welfare {
  readonly before: MarketOutcome;
  readonly kind: PriceControlKind;
  readonly price: number;
  /** False when the control does not constrain the market (e.g. a ceiling above equilibrium). */
  readonly binding: boolean;
  /** The price that actually prevails. */
  readonly marketPrice: number;
  readonly quantityDemanded: number;
  readonly quantitySupplied: number;
  /** The short side of the market: min(quantity demanded, quantity supplied). */
  readonly quantityTraded: number;
  readonly shortage: number;
  readonly surplus: number;
}

/**
 * A legal maximum (ceiling) or minimum (floor) price. Welfare assumes efficient
 * rationing: the units that do trade go to the buyers who value them most.
 */
export function solvePriceControl(
  market: Market,
  kind: PriceControlKind,
  price: number,
): Result<PriceControlOutcome> {
  if (!(Number.isFinite(price) && price >= 0)) {
    return fail('invalid-input', 'The controlled price must be zero or positive.');
  }
  const before = solveMarket(market);
  if (!before.ok) return before;

  const p0 = before.value.equilibrium.p;
  const binding = kind === 'ceiling' ? price < p0 : price > p0;
  const marketPrice = binding ? price : p0;

  const quantityDemanded = quantityOnCurve(market.demand, marketPrice);
  const quantitySupplied = quantityOnCurve(market.supply, marketPrice);
  const quantityTraded = Math.min(quantityDemanded, quantitySupplied);

  return ok({
    before: before.value,
    kind,
    price,
    binding,
    marketPrice,
    quantityDemanded,
    quantitySupplied,
    quantityTraded,
    shortage: binding ? Math.max(0, quantityDemanded - quantitySupplied) : 0,
    surplus: binding ? Math.max(0, quantitySupplied - quantityDemanded) : 0,
    ...welfareAt(market, quantityTraded, marketPrice, marketPrice),
  });
}

function quantityOnCurve(line: Line, price: number): number {
  return Math.max(0, quantityAt(line, price) ?? 0);
}
