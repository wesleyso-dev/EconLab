import { allFinite, fail, ok, type Result } from '../core/result';

/**
 * A production possibilities frontier between good X and good Y.
 * - `linear`: constant opportunity cost.
 * - `bowed`: increasing opportunity cost, y = maxY · (1 − (x / maxX)²).
 */
export interface PPF {
  readonly shape: 'linear' | 'bowed';
  readonly maxX: number;
  readonly maxY: number;
}

export interface Bundle {
  readonly x: number;
  readonly y: number;
}

export type BundleStatus = 'efficient' | 'inefficient' | 'unattainable';

function isValid(ppf: PPF): boolean {
  return allFinite(ppf.maxX, ppf.maxY) && ppf.maxX > 0 && ppf.maxY > 0;
}

/** The most Y that can be produced alongside `x` units of X; null outside [0, maxX]. */
export function maxYAt(ppf: PPF, x: number): number | null {
  if (x < 0 || x > ppf.maxX) return null;
  const share = x / ppf.maxX;
  return ppf.shape === 'linear' ? ppf.maxY * (1 - share) : ppf.maxY * (1 - share * share);
}

/**
 * Marginal opportunity cost at `x`: units of Y given up per extra unit of X, and its
 * reciprocal for Y. Constant for a linear PPF, rising in x for a bowed one.
 */
export function opportunityCost(ppf: PPF, x: number): { ofX: number; ofY: number } {
  const ofX = ppf.shape === 'linear' ? ppf.maxY / ppf.maxX : (2 * ppf.maxY * x) / ppf.maxX ** 2;
  return { ofX, ofY: ofX === 0 ? Infinity : 1 / ofX };
}

export function classifyBundle(ppf: PPF, bundle: Bundle, tolerance = 1e-9): BundleStatus {
  if (bundle.x < 0 || bundle.y < 0) return 'unattainable';
  const frontier = maxYAt(ppf, bundle.x);
  if (frontier === null || bundle.y > frontier + tolerance) return 'unattainable';
  return bundle.y >= frontier - tolerance ? 'efficient' : 'inefficient';
}

export type Producer = 'a' | 'b';

/**
 * Which of two producers with linear PPFs has the comparative advantage in each good
 * (the lower opportunity cost). Null when opportunity costs are equal.
 */
export function comparativeAdvantage(
  a: PPF,
  b: PPF,
): Result<{ goodX: Producer | null; goodY: Producer | null }> {
  if (!isValid(a) || !isValid(b) || a.shape !== 'linear' || b.shape !== 'linear') {
    return fail(
      'invalid-input',
      'Comparative advantage needs two linear PPFs with positive intercepts.',
    );
  }
  const costA = a.maxY / a.maxX;
  const costB = b.maxY / b.maxX;
  if (costA === costB) return ok({ goodX: null, goodY: null });
  return costA < costB ? ok({ goodX: 'a', goodY: 'b' }) : ok({ goodX: 'b', goodY: 'a' });
}
