import { describe, expect, it } from 'vitest';
import { priceAt } from '../core/line';
import { BASIC_MARKET, unwrap } from '../testing';
import {
  averageTotalCost,
  averageVariableCost,
  marginalCost,
  minAverageTotalCost,
  minAverageVariableCost,
  validateCost,
  type CostFunction,
} from './cost';
import { solveMonopoly } from './monopoly';
import { solveCompetitiveFirm, solvePerfectCompetition } from './perfectCompetition';

/**
 * TC = 36 + 12q − 3q² + q³/3, so MC = (q − 3)² + 3.
 * Min AVC = 5.25 at q = 4.5 (shutdown); min ATC = 12 at q = 6 (break-even).
 */
const U_SHAPED: CostFunction = { fixed: 36, linear: 12, quadratic: -3, cubic: 1 / 3 };

describe('cost function', () => {
  it('finds the shutdown and break-even points', () => {
    const shutdown = minAverageVariableCost(U_SHAPED);
    expect(shutdown.q).toBeCloseTo(4.5);
    expect(shutdown.p).toBeCloseTo(5.25);
    const breakEven = minAverageTotalCost(U_SHAPED);
    expect(breakEven?.q).toBeCloseTo(6);
    expect(breakEven?.p).toBeCloseTo(12);
  });

  it('has MC passing through the minimum of AVC and ATC', () => {
    const shutdown = minAverageVariableCost(U_SHAPED);
    expect(marginalCost(U_SHAPED, shutdown.q)).toBeCloseTo(
      averageVariableCost(U_SHAPED, shutdown.q),
    );
    const breakEven = minAverageTotalCost(U_SHAPED);
    if (!breakEven) throw new Error('expected a break-even point');
    expect(marginalCost(U_SHAPED, breakEven.q)).toBeCloseTo(
      averageTotalCost(U_SHAPED, breakEven.q),
    );
  });

  it('rejects cost functions with negative marginal cost', () => {
    expect(validateCost({ fixed: 0, linear: 1, quadratic: -3, cubic: 1 / 3 })).not.toBeNull();
    expect(validateCost({ fixed: -1, linear: 1, quadratic: 0, cubic: 0 })).not.toBeNull();
  });
});

describe('solveCompetitiveFirm', () => {
  it('earns positive profit above minimum ATC', () => {
    const firm = unwrap(solveCompetitiveFirm(U_SHAPED, 19)); // MC = 19 at q = 7
    expect(firm.quantity).toBeCloseTo(7);
    expect(firm.profit).toBeCloseTo(137 / 3);
    expect(firm.profitRegion.area).toBeCloseTo(firm.profit);
  });

  it('earns zero profit at minimum ATC (long-run equilibrium)', () => {
    const firm = unwrap(solveCompetitiveFirm(U_SHAPED, 12));
    expect(firm.quantity).toBeCloseTo(6);
    expect(firm.profit).toBeCloseTo(0);
  });

  it('keeps producing at a loss between the shutdown and break-even prices', () => {
    const firm = unwrap(solveCompetitiveFirm(U_SHAPED, 7));
    expect(firm.shutDown).toBe(false);
    expect(firm.quantity).toBeCloseTo(5);
    expect(firm.profit).toBeCloseTo(-83 / 3);
    expect(firm.profit).toBeGreaterThan(-U_SHAPED.fixed); // better than shutting down
  });

  it('shuts down below minimum AVC and loses its fixed cost', () => {
    const firm = unwrap(solveCompetitiveFirm(U_SHAPED, 5));
    expect(firm.shutDown).toBe(true);
    expect(firm.quantity).toBe(0);
    expect(firm.profit).toBeCloseTo(-36);
  });

  it('rejects constant marginal cost, which gives no finite output', () => {
    expect(solveCompetitiveFirm({ fixed: 0, linear: 4, quadratic: 0, cubic: 0 }, 5).ok).toBe(false);
  });
});

describe('solvePerfectCompetition', () => {
  it('uses the market price for the firm, not the market quantity', () => {
    // Regression: the old app reused the market quantity as the firm's quantity.
    const outcome = unwrap(solvePerfectCompetition(BASIC_MARKET, U_SHAPED));
    expect(outcome.firm.price).toBeCloseTo(5);
    expect(outcome.firm.shutDown).toBe(true); // 5 < min AVC of 5.25
    expect(outcome.longRunPrice).toBeCloseTo(12);
  });
});

describe('solveMonopoly', () => {
  const demand = { intercept: 20, slope: -1 };

  it('produces where MR = MC with constant marginal cost', () => {
    const outcome = unwrap(solveMonopoly(demand, { fixed: 0, linear: 4, quadratic: 0, cubic: 0 }));
    expect(outcome.quantity).toBeCloseTo(8);
    expect(outcome.price).toBeCloseTo(12);
    expect(outcome.profit).toBeCloseTo(64);
    expect(outcome.competitive?.q).toBeCloseTo(16);
    expect(outcome.consumerSurplus.area).toBeCloseTo(32);
    expect(outcome.producerSurplus.area).toBeCloseTo(64);
    expect(outcome.deadweightLoss.area).toBeCloseTo(32);
    expect(outcome.unitElastic).toEqual({ q: 10, p: 10 });
  });

  it('derives quantity from MR = MC with rising marginal cost', () => {
    // Regression: the old app hardcoded quantity as 0.71 × the MR intercept.
    const outcome = unwrap(solveMonopoly(demand, { fixed: 0, linear: 2, quadratic: 1, cubic: 0 }));
    expect(outcome.quantity).toBeCloseTo(4.5);
    expect(outcome.price).toBeCloseTo(15.5);
    expect(priceAt(outcome.marginalRevenue, outcome.quantity)).toBeCloseTo(outcome.marginalCost);
    expect(outcome.competitive).toEqual({ q: 6, p: 14 });
    expect(outcome.deadweightLoss.area).toBeCloseTo(3.375);
  });

  it('operates on the elastic part of demand and charges above MC', () => {
    const outcome = unwrap(solveMonopoly(demand, U_SHAPED));
    expect(outcome.shutDown).toBe(false);
    expect(outcome.quantity).toBeLessThan(outcome.unitElastic.q);
    expect(outcome.price).toBeGreaterThan(outcome.marginalCost);
    expect(priceAt(outcome.marginalRevenue, outcome.quantity)).toBeCloseTo(outcome.marginalCost);
  });

  it('can make a loss when fixed cost is high but still covers variable cost', () => {
    const outcome = unwrap(solveMonopoly(demand, { fixed: 80, linear: 4, quadratic: 0, cubic: 0 }));
    expect(outcome.shutDown).toBe(false);
    expect(outcome.profit).toBeCloseTo(-16);
    expect(outcome.profitRegion.area).toBeCloseTo(16);
  });

  it('shuts down when demand is below marginal cost', () => {
    const outcome = unwrap(
      solveMonopoly({ intercept: 3, slope: -1 }, { fixed: 5, linear: 4, quadratic: 0, cubic: 0 }),
    );
    expect(outcome.shutDown).toBe(true);
    expect(outcome.quantity).toBe(0);
    expect(outcome.profit).toBeCloseTo(-5);
  });
});
