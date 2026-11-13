import type { Point } from '../core/line';
import { EMPTY_REGION, regionBetween, type Region } from '../core/region';
import { fail, ok, type Result } from '../core/result';
import {
  averageTotalCost,
  hasRisingMarginalCost,
  minAverageTotalCost,
  minAverageVariableCost,
  quantityWhereMarginalCostEquals,
  totalCost,
  validateCost,
  type CostFunction,
} from './cost';
import { solveMarket, type Market, type MarketOutcome } from './market';

export interface FirmOutcome {
  /** The market price, which the firm takes as given (P = MR). */
  readonly price: number;
  readonly quantity: number;
  /** True when price is below minimum AVC, so the firm produces nothing in the short run. */
  readonly shutDown: boolean;
  readonly totalRevenue: number;
  readonly totalCost: number;
  /** Economic profit; negative for a loss. */
  readonly profit: number;
  /** ATC at the chosen quantity; null when the firm shuts down. */
  readonly averageTotalCost: number | null;
  /** The profit (or loss) rectangle between price and ATC. */
  readonly profitRegion: Region;
  readonly shutdownPoint: Point;
  /** Minimum ATC; null if ATC never reaches a minimum. */
  readonly breakEvenPoint: Point | null;
}

/** A price-taking firm's short-run choice: produce where P = MC, unless P < min AVC. */
export function solveCompetitiveFirm(cost: CostFunction, price: number): Result<FirmOutcome> {
  const costError = validateCost(cost);
  if (costError) return { ok: false, error: costError };
  if (!hasRisingMarginalCost(cost)) {
    return fail('invalid-input', 'Marginal cost must eventually rise for a price-taking firm.');
  }
  if (!(Number.isFinite(price) && price >= 0)) {
    return fail('invalid-input', 'Price must be zero or positive.');
  }

  const shutdownPoint = minAverageVariableCost(cost);
  const breakEvenPoint = minAverageTotalCost(cost);
  const candidate = quantityWhereMarginalCostEquals(cost, price);
  const shutDown = candidate === null || price < shutdownPoint.p;
  const quantity = shutDown || candidate === null ? 0 : candidate;

  const totalCostAtQ = totalCost(cost, quantity);
  const atc = shutDown ? null : averageTotalCost(cost, quantity);
  const profitRegion =
    atc === null
      ? EMPTY_REGION
      : regionBetween([Math.max(price, atc)], [Math.min(price, atc)], 0, quantity);

  return ok({
    price,
    quantity,
    shutDown,
    totalRevenue: price * quantity,
    totalCost: totalCostAtQ,
    profit: price * quantity - totalCostAtQ,
    averageTotalCost: atc,
    profitRegion,
    shutdownPoint,
    breakEvenPoint,
  });
}

export interface PerfectCompetitionOutcome {
  readonly market: MarketOutcome;
  readonly firm: FirmOutcome;
  /** Long-run price: entry and exit drive price to minimum ATC. */
  readonly longRunPrice: number | null;
}

/** The side-by-side market and representative-firm view. */
export function solvePerfectCompetition(
  market: Market,
  cost: CostFunction,
): Result<PerfectCompetitionOutcome> {
  const marketOutcome = solveMarket(market);
  if (!marketOutcome.ok) return marketOutcome;
  const firm = solveCompetitiveFirm(cost, marketOutcome.value.equilibrium.p);
  if (!firm.ok) return firm;
  return ok({
    market: marketOutcome.value,
    firm: firm.value,
    longRunPrice: firm.value.breakEvenPoint?.p ?? null,
  });
}
