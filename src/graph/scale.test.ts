import { describe, expect, it } from 'vitest';
import { formatNumber } from './format';
import { centroid, pathData, sampleCurve, toCurveFn } from './path';
import { linearScale, niceStep, niceTicks, snap } from './scale';

describe('linearScale', () => {
  it('maps data to pixels and back, including inverted ranges', () => {
    const p = linearScale([0, 10], [300, 0]); // price axis: up is smaller y
    expect(p.toPx(0)).toBe(300);
    expect(p.toPx(10)).toBe(0);
    expect(p.fromPx(150)).toBe(5);
  });
});

describe('ticks', () => {
  it('chooses 1-2-5 steps', () => {
    expect(niceStep(10, 5)).toBe(2);
    expect(niceStep(100, 4)).toBe(20);
    expect(niceStep(1, 10)).toBe(0.1);
  });

  it('produces round values without floating-point fuzz', () => {
    expect(niceTicks(0, 12, 6)).toEqual([0, 2, 4, 6, 8, 10, 12]);
    expect(niceTicks(0, 1, 10)).toEqual([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]);
  });

  it('snaps to a step', () => {
    expect(snap(0.30000000000000004, 0.1)).toBe(0.3);
    expect(snap(4.26, 0.5)).toBe(4.5);
  });
});

describe('formatNumber', () => {
  it('trims zeros, uses a true minus sign and never shows -0', () => {
    expect(formatNumber(12.5)).toBe('12.5');
    expect(formatNumber(1234.5678)).toBe('1,234.57');
    expect(formatNumber(-3)).toBe('−3');
    expect(formatNumber(-0.0001)).toBe('0');
    expect(formatNumber(Infinity)).toBe('∞');
  });
});

describe('curve paths', () => {
  const q = linearScale([0, 10], [0, 100]);
  const p = linearScale([0, 10], [100, 0]);

  it('draws straight lines from their endpoints', () => {
    const { fn, straight } = toCurveFn({ intercept: 10, slope: -1 });
    expect(straight).toBe(true);
    expect(pathData(sampleCurve(fn, 0, 10, 1), q, p)).toBe('M0,0L100,100');
  });

  it('splits curves where they are undefined', () => {
    const atc = (x: number) => 4 / x + x; // undefined at 0
    const segments = sampleCurve(atc, 0, 4, 4);
    expect(segments).toHaveLength(1);
    expect(segments[0]?.[0]?.q).toBe(1);
  });

  it('clamps far off-plot values so path coordinates stay bounded', () => {
    const d = pathData(
      [
        [
          { q: 0, p: 1e9 },
          { q: 1, p: 5 },
        ],
      ],
      q,
      p,
    );
    expect(d).toBe('M0,-200L10,50');
  });

  it('finds polygon centroids', () => {
    const c = centroid([
      { q: 0, p: 0 },
      { q: 3, p: 0 },
      { q: 0, p: 3 },
    ]);
    expect(c?.q).toBeCloseTo(1);
    expect(c?.p).toBeCloseTo(1);
  });
});
