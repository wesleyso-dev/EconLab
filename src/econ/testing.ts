import type { Result } from './core/result';
import type { Market } from './models/market';

/** Demand p = 10 − q, supply p = q. Equilibrium (5, 5); CS = PS = 12.5. */
export const BASIC_MARKET: Market = {
  demand: { intercept: 10, slope: -1 },
  supply: { intercept: 0, slope: 1 },
};

/** Unwraps a successful result in tests, failing loudly otherwise. */
export function unwrap<T>(result: Result<T>): T {
  if (!result.ok) {
    throw new Error(`Expected success, got ${result.error.code}: ${result.error.message}`);
  }
  return result.value;
}
