import type { Line, Point } from '../econ/core/line';
import { degree, evaluate, type Poly } from '../econ/core/poly';
import type { Scale } from './scale';

export type CurveFn = (q: number) => number;

/** Anything the graph can draw as a curve p(q). */
export type CurveSource = Line | Poly | CurveFn;

/** Normalizes a curve source to a function, noting whether it is a straight line. */
export function toCurveFn(source: CurveSource): { fn: CurveFn; straight: boolean } {
  if (typeof source === 'function') return { fn: source, straight: false };
  if (Array.isArray(source)) {
    const poly: Poly = source;
    return { fn: (q) => evaluate(poly, q), straight: degree(poly) <= 1 };
  }
  const line = source as Line;
  return { fn: (q) => line.intercept + line.slope * q, straight: true };
}

/**
 * Samples `fn` over [from, to]. Returns one array per continuous segment, splitting
 * wherever the function is undefined (non-finite), e.g. ATC at q = 0.
 */
export function sampleCurve(fn: CurveFn, from: number, to: number, samples: number): Point[][] {
  const segments: Point[][] = [];
  let current: Point[] = [];
  for (let i = 0; i <= samples; i++) {
    const q = from + ((to - from) * i) / samples;
    const p = fn(q);
    if (Number.isFinite(p)) {
      current.push({ q, p });
    } else if (current.length > 0) {
      segments.push(current);
      current = [];
    }
  }
  if (current.length > 0) segments.push(current);
  return segments;
}

/**
 * SVG path data for sampled segments. Pixel values are clamped to a band around the
 * plot so near-vertical curves don't produce enormous coordinates; the plot's clip
 * path hides everything outside it.
 */
export function pathData(segments: readonly (readonly Point[])[], q: Scale, p: Scale): string {
  const [top, bottom] = [Math.min(...p.range), Math.max(...p.range)];
  const band = (bottom - top) * 2;
  return segments
    .filter((segment) => segment.length > 1)
    .map((segment) =>
      segment
        .map((point, i) => {
          const x = q.toPx(point.q);
          const y = Math.min(bottom + band, Math.max(top - band, p.toPx(point.p)));
          return `${i === 0 ? 'M' : 'L'}${round(x)},${round(y)}`;
        })
        .join(''),
    )
    .join('');
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Area-weighted centroid of a polygon, for placing region labels. */
export function centroid(points: readonly Point[]): Point | null {
  let area = 0;
  let cq = 0;
  let cp = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    if (!a || !b) continue;
    const cross = a.q * b.p - b.q * a.p;
    area += cross;
    cq += (a.q + b.q) * cross;
    cp += (a.p + b.p) * cross;
  }
  if (Math.abs(area) < 1e-12) return null;
  return { q: cq / (3 * area), p: cp / (3 * area) };
}
