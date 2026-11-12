import type { Poly } from './poly';

/** A point in quantity–price space. */
export interface Point {
  readonly q: number;
  readonly p: number;
}

/**
 * A straight curve in inverse form, p(q) = intercept + slope·q, matching how
 * economics graphs are drawn (quantity on x, price on y).
 */
export interface Line {
  readonly intercept: number;
  readonly slope: number;
}

const EPSILON = 1e-12;

export function priceAt(line: Line, q: number): number {
  return line.intercept + line.slope * q;
}

/** Quantity at which the line reaches price `p`; null for a horizontal line. */
export function quantityAt(line: Line, p: number): number | null {
  if (Math.abs(line.slope) < EPSILON) return null;
  return (p - line.intercept) / line.slope;
}

/** Intersection of two lines; null if they are parallel. */
export function intersect(a: Line, b: Line): Point | null {
  const slopeDifference = a.slope - b.slope;
  if (Math.abs(slopeDifference) < EPSILON) return null;
  const q = (b.intercept - a.intercept) / slopeDifference;
  return { q, p: priceAt(a, q) };
}

/** The line through two points; null if they share a quantity (a vertical line). */
export function lineThroughPoints(a: Point, b: Point): Line | null {
  if (Math.abs(b.q - a.q) < EPSILON) return null;
  const slope = (b.p - a.p) / (b.q - a.q);
  return { intercept: a.p - slope * a.q, slope };
}

/** Shifts a curve horizontally: positive `dq` moves it right (an increase). */
export function shiftQuantity(line: Line, dq: number): Line {
  return { intercept: line.intercept - line.slope * dq, slope: line.slope };
}

/** Shifts a curve vertically: positive `dp` moves it up. */
export function shiftPrice(line: Line, dp: number): Line {
  return { intercept: line.intercept + dp, slope: line.slope };
}

export function addLines(a: Line, b: Line): Line {
  return { intercept: a.intercept + b.intercept, slope: a.slope + b.slope };
}

export function horizontalLine(p: number): Line {
  return { intercept: p, slope: 0 };
}

export function toPoly(line: Line): Poly {
  return [line.intercept, line.slope];
}
