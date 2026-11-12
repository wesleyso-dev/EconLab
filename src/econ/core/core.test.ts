import { describe, expect, it } from 'vitest';
import {
  intersect,
  lineThroughPoints,
  priceAt,
  quantityAt,
  shiftPrice,
  shiftQuantity,
} from './line';
import { degree, derivative, evaluate, integrate, subtract } from './poly';
import { EMPTY_REGION, polygonArea, regionBetween } from './region';
import { bisect, quadraticRoots } from './roots';

describe('poly', () => {
  it('evaluates, differentiates and integrates', () => {
    const p = [1, -2, 3]; // 1 − 2q + 3q²
    expect(evaluate(p, 2)).toBe(9);
    expect(derivative(p)).toEqual([-2, 6]);
    expect(integrate(p, 0, 2)).toBeCloseTo(2 - 4 + 8);
    expect(subtract([5, 1], [2])).toEqual([3, 1]);
    expect(degree([4, 0, 0])).toBe(0);
    expect(degree([])).toBe(-1);
  });
});

describe('roots', () => {
  it('solves quadratics, including the degenerate linear case', () => {
    expect(quadraticRoots(1, -5, 6)).toEqual([2, 3]);
    expect(quadraticRoots(0, 2, -4)).toEqual([2]);
    expect(quadraticRoots(1, 0, 1)).toEqual([]);
    expect(quadraticRoots(1, 0, 0)).toEqual([0]);
  });

  it('keeps precision when roots differ greatly in size', () => {
    const [small] = quadraticRoots(1, -1e8, 1);
    expect(small).toBeCloseTo(1e-8, 15);
  });

  it('bisects to a root', () => {
    expect(bisect((x) => x * x - 2, 0, 2)).toBeCloseTo(Math.SQRT2, 10);
  });
});

describe('line', () => {
  const demand = { intercept: 10, slope: -1 };
  const supply = { intercept: 0, slope: 1 };

  it('finds intersections', () => {
    expect(intersect(demand, supply)).toEqual({ q: 5, p: 5 });
  });

  it('returns null for parallel lines instead of dividing by zero', () => {
    // Regression: the old backend raised ZeroDivisionError here.
    expect(intersect(demand, { intercept: 4, slope: -1 })).toBeNull();
  });

  it('converts between price and quantity', () => {
    expect(priceAt(demand, 3)).toBe(7);
    expect(quantityAt(demand, 7)).toBe(3);
    expect(quantityAt({ intercept: 4, slope: 0 }, 4)).toBeNull();
  });

  it('builds a line through two points', () => {
    expect(lineThroughPoints({ q: 0, p: 10 }, { q: 10, p: 0 })).toEqual(demand);
    expect(lineThroughPoints({ q: 2, p: 1 }, { q: 2, p: 5 })).toBeNull();
  });

  it('shifts curves right and up', () => {
    const shifted = shiftQuantity(demand, 2);
    expect(quantityAt(shifted, 5)).toBeCloseTo(7);
    expect(shiftPrice(supply, 3)).toEqual({ intercept: 3, slope: 1 });
  });
});

describe('region', () => {
  it('matches the polygon area for straight edges', () => {
    const region = regionBetween([10, -1], [5], 0, 5); // the CS triangle
    expect(region.area).toBeCloseTo(12.5);
    expect(polygonArea(region.polygon)).toBeCloseTo(region.area);
  });

  it('approximates curved regions closely with its polygon', () => {
    const region = regionBetween([0, 0, 1], [0], 0, 3); // ∫ q² = 9
    expect(region.area).toBeCloseTo(9);
    expect(polygonArea(region.polygon)).toBeCloseTo(9, 2);
  });

  it('is empty for an empty interval', () => {
    expect(regionBetween([1], [0], 2, 2)).toBe(EMPTY_REGION);
  });
});
