/**
 * A polynomial in q, where `poly[i]` is the coefficient of q^i.
 * Example: [10, -1] is p(q) = 10 - q.
 */
export type Poly = readonly number[];

export function evaluate(poly: Poly, q: number): number {
  let result = 0;
  for (let i = poly.length - 1; i >= 0; i--) {
    result = result * q + (poly[i] ?? 0);
  }
  return result;
}

export function add(a: Poly, b: Poly): Poly {
  const length = Math.max(a.length, b.length);
  return Array.from({ length }, (_, i) => (a[i] ?? 0) + (b[i] ?? 0));
}

export function scale(poly: Poly, factor: number): Poly {
  return poly.map((c) => c * factor);
}

export function subtract(a: Poly, b: Poly): Poly {
  return add(a, scale(b, -1));
}

export function derivative(poly: Poly): Poly {
  return poly.slice(1).map((c, i) => c * (i + 1));
}

/** Definite integral of `poly` from `from` to `to`. */
export function integrate(poly: Poly, from: number, to: number): number {
  const antiderivative = [0, ...poly.map((c, i) => c / (i + 1))];
  return evaluate(antiderivative, to) - evaluate(antiderivative, from);
}

/** Index of the highest non-zero coefficient; -1 for the zero polynomial. */
export function degree(poly: Poly): number {
  for (let i = poly.length - 1; i >= 0; i--) {
    if (poly[i] !== 0) return i;
  }
  return -1;
}
