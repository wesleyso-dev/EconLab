const EPSILON = 1e-12;

/**
 * Real roots of a·x² + b·x + c = 0 in ascending order. Degrades to the linear case
 * when a = 0. Uses the numerically stable form of the quadratic formula.
 */
export function quadraticRoots(a: number, b: number, c: number): number[] {
  if (Math.abs(a) < EPSILON) {
    return Math.abs(b) < EPSILON ? [] : [-c / b];
  }

  let discriminant = b * b - 4 * a * c;
  if (discriminant < 0) {
    // Treat tiny negatives caused by floating-point error as a double root.
    if (discriminant > -EPSILON * (b * b + Math.abs(4 * a * c))) discriminant = 0;
    else return [];
  }

  const q = -0.5 * (b + (b >= 0 ? 1 : -1) * Math.sqrt(discriminant));
  if (q === 0) return [0];
  const roots = [q / a, c / q];
  return roots.sort((x, y) => x - y);
}

/** Largest real root of a·x² + b·x + c = 0, or null if there is none. */
export function largestQuadraticRoot(a: number, b: number, c: number): number | null {
  const roots = quadraticRoots(a, b, c);
  return roots.length === 0 ? null : (roots[roots.length - 1] ?? null);
}

/**
 * Finds a root of `f` in [lo, hi] by bisection. `f(lo)` and `f(hi)` must have
 * opposite signs.
 */
export function bisect(
  f: (x: number) => number,
  lo: number,
  hi: number,
  tolerance = 1e-12,
): number {
  let fLo = f(lo);
  for (let i = 0; i < 200 && hi - lo > tolerance * Math.max(1, Math.abs(hi)); i++) {
    const mid = (lo + hi) / 2;
    const fMid = f(mid);
    if (fMid === 0) return mid;
    if (fMid < 0 === fLo < 0) {
      lo = mid;
      fLo = fMid;
    } else {
      hi = mid;
    }
  }
  return (lo + hi) / 2;
}
