import { describe, expect, it } from 'vitest';
import { BASIC_MARKET, unwrap } from '../testing';
import { solveExternality } from './externality';
import { solveCompetitiveLaborMarket, solveMonopsony } from './labor';
import { classifyBundle, comparativeAdvantage, maxYAt, opportunityCost, type PPF } from './ppf';

describe('solveExternality', () => {
  it('measures the over-production loss from a negative externality', () => {
    // Regression: the old app reported DWL = 2 here; the correct triangle is 4.
    const outcome = unwrap(solveExternality(BASIC_MARKET, 'negative', { intercept: 4, slope: 0 }));
    expect(outcome.marketOutcome).toEqual({ q: 5, p: 5 });
    expect(outcome.socialOptimum.q).toBeCloseTo(3);
    expect(outcome.socialOptimum.p).toBeCloseTo(7);
    expect(outcome.deadweightLoss.area).toBeCloseTo(4);
    expect(outcome.correctiveAmount).toBeCloseTo(4);
  });

  it('measures the under-production loss from a positive externality', () => {
    // Regression: the old formula gave 0.5 here; the correct triangle is 1.
    const outcome = unwrap(solveExternality(BASIC_MARKET, 'positive', { intercept: 2, slope: 0 }));
    expect(outcome.socialOptimum.q).toBeCloseTo(6);
    expect(outcome.deadweightLoss.area).toBeCloseTo(1);
    expect(outcome.correctiveAmount).toBeCloseTo(2);
  });

  it('has no deadweight loss when there is no externality', () => {
    const outcome = unwrap(solveExternality(BASIC_MARKET, 'negative', { intercept: 0, slope: 0 }));
    expect(outcome.deadweightLoss.area).toBeCloseTo(0);
  });
});

describe('labor markets', () => {
  const labor = { demand: { intercept: 14, slope: -1 }, supply: { intercept: 2, slope: 1 } };

  it('lets a monopsonist hire fewer workers at a lower wage', () => {
    const outcome = unwrap(solveMonopsony(labor));
    expect(outcome.marginalResourceCost).toEqual({ intercept: 2, slope: 2 });
    expect(outcome.quantity).toBeCloseTo(4);
    // Regression: the old app built the supply curve from the wrong input field.
    expect(outcome.wage).toBeCloseTo(6);
    expect(outcome.marginalRevenueProduct).toBeCloseTo(10);
    expect(outcome.competitive).toEqual({ q: 6, p: 8 });
    expect(outcome.deadweightLoss.area).toBeCloseTo(4);
  });

  it('has a wage-taking firm hire where its MRP equals the market wage', () => {
    const outcome = unwrap(
      solveCompetitiveLaborMarket(
        { demand: { intercept: 20, slope: -1 }, supply: { intercept: 2, slope: 1 } },
        { intercept: 30, slope: -2 },
      ),
    );
    expect(outcome.market.equilibrium).toEqual({ q: 9, p: 11 });
    expect(outcome.firm?.quantity).toBeCloseTo(9.5);
  });
});

describe('PPF', () => {
  const linear: PPF = { shape: 'linear', maxX: 10, maxY: 20 };
  const bowed: PPF = { shape: 'bowed', maxX: 10, maxY: 100 };

  it('has constant opportunity cost when linear', () => {
    expect(opportunityCost(linear, 3)).toEqual({ ofX: 2, ofY: 0.5 });
  });

  it('has increasing opportunity cost when bowed', () => {
    expect(maxYAt(bowed, 5)).toBeCloseTo(75);
    expect(opportunityCost(bowed, 5).ofX).toBeCloseTo(10);
    expect(opportunityCost(bowed, 8).ofX).toBeGreaterThan(opportunityCost(bowed, 5).ofX);
  });

  it('classifies bundles', () => {
    expect(classifyBundle(linear, { x: 5, y: 10 })).toBe('efficient');
    expect(classifyBundle(linear, { x: 2, y: 2 })).toBe('inefficient');
    expect(classifyBundle(linear, { x: 8, y: 8 })).toBe('unattainable');
    expect(classifyBundle(linear, { x: 11, y: 0 })).toBe('unattainable');
  });

  it('assigns comparative advantage to the lower opportunity cost producer', () => {
    const b: PPF = { shape: 'linear', maxX: 6, maxY: 6 };
    expect(unwrap(comparativeAdvantage(linear, b))).toEqual({ goodX: 'b', goodY: 'a' });
    expect(comparativeAdvantage(linear, bowed).ok).toBe(false);
  });
});
