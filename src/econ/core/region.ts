import type { Point } from './line';
import { degree, evaluate, integrate, subtract, type Poly } from './poly';

/**
 * A shaded area on a graph: its exact area (by integration) and a polygon outline
 * for rendering. Both come from the same bounding curves, so the number shown and
 * the region drawn always agree.
 */
export interface Region {
  readonly area: number;
  readonly polygon: readonly Point[];
}

export const EMPTY_REGION: Region = { area: 0, polygon: [] };

/** Samples per curved edge; straight edges need only their endpoints. */
const CURVE_SAMPLES = 48;

/** The region between `upper` and `lower` for q in [from, to]. */
export function regionBetween(upper: Poly, lower: Poly, from: number, to: number): Region {
  if (!(to > from)) return EMPTY_REGION;

  const steps = degree(upper) > 1 || degree(lower) > 1 ? CURVE_SAMPLES : 1;
  const top: Point[] = [];
  const bottom: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const q = from + ((to - from) * i) / steps;
    top.push({ q, p: evaluate(upper, q) });
    bottom.push({ q, p: evaluate(lower, q) });
  }

  return {
    area: integrate(subtract(upper, lower), from, to),
    polygon: [...top, ...bottom.reverse()],
  };
}

/**
 * Joins two regions from `regionBetween` over adjacent quantity ranges (`left` ends
 * where `right` begins) into one region, e.g. when a bounding curve has a kink.
 */
export function joinRegions(left: Region, right: Region): Region {
  if (left.polygon.length === 0) return right;
  if (right.polygon.length === 0) return left;
  // regionBetween outlines are the top edge left to right, then the bottom edge back.
  const split = (r: Region) => [
    r.polygon.slice(0, r.polygon.length / 2),
    r.polygon.slice(r.polygon.length / 2),
  ];
  const [leftTop = [], leftBottom = []] = split(left);
  const [rightTop = [], rightBottom = []] = split(right);
  return {
    area: left.area + right.area,
    polygon: [...leftTop, ...rightTop, ...rightBottom, ...leftBottom],
  };
}

/** Area of a simple polygon (shoelace formula). */
export function polygonArea(points: readonly Point[]): number {
  let twiceArea = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    if (a && b) twiceArea += a.q * b.p - b.q * a.p;
  }
  return Math.abs(twiceArea) / 2;
}
