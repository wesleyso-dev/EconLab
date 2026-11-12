import { describe, expect, it } from 'vitest';
import { polygonArea } from '../core/region';
import { BASIC_MARKET, unwrap } from '../testing';
import { solveMarket } from './market';
import { solvePriceControl } from './priceControl';
import { solveSubsidy } from './subsidy';
import { solveTax } from './tax';

describe('solveMarket', () => {
  it('finds equilibrium and surplus', () => {
    const outcome = unwrap(solveMarket(BASIC_MARKET));
    expect(outcome.equilibrium).toEqual({ q: 5, p: 5 });
    expect(outcome.consumerSurplus.area).toBeCloseTo(12.5);
    expect(outcome.producerSurplus.area).toBeCloseTo(12.5);
    expect(outcome.totalSurplus).toBeCloseTo(25);
    expect(outcome.deadweightLoss.area).toBe(0);
  });

  it('rejects invalid curves with a message instead of crashing', () => {
    const upwardDemand = { ...BASIC_MARKET, demand: { intercept: 10, slope: 1 } };
    const result = solveMarket(upwardDemand);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('invalid-input');
  });

  it('reports no trade when demand lies below supply', () => {
    const result = solveMarket({ ...BASIC_MARKET, supply: { intercept: 12, slope: 1 } });
    expect(result.ok || result.error.code).toBe('no-trade');
  });
});

describe('solveTax', () => {
  it('splits the tax wedge and computes revenue and deadweight loss', () => {
    const outcome = unwrap(solveTax(BASIC_MARKET, 3));
    expect(outcome.quantity).toBeCloseTo(3.5);
    expect(outcome.buyerPrice).toBeCloseTo(6.5);
    expect(outcome.sellerPrice).toBeCloseTo(3.5);
    expect(outcome.revenue.area).toBeCloseTo(10.5);
    expect(outcome.deadweightLoss.area).toBeCloseTo(2.25);
    expect(outcome.consumerSurplus.area).toBeCloseTo(6.125);
    expect(outcome.producerSurplus.area).toBeCloseTo(6.125);
  });

  it('conserves total surplus: CS + PS + revenue + DWL = original surplus', () => {
    const outcome = unwrap(solveTax(BASIC_MARKET, 3));
    const accounted =
      outcome.consumerSurplus.area +
      outcome.producerSurplus.area +
      outcome.revenue.area +
      outcome.deadweightLoss.area;
    expect(accounted).toBeCloseTo(outcome.before.totalSurplus);
  });

  it('puts more of the burden on the less elastic side', () => {
    const steepDemand = { ...BASIC_MARKET, demand: { intercept: 12, slope: -2 } };
    const outcome = unwrap(solveTax(steepDemand, 3)); // equilibrium (4, 4)
    expect(outcome.quantity).toBeCloseTo(3);
    expect(outcome.consumerBurden).toBeCloseTo(2);
    expect(outcome.producerBurden).toBeCloseTo(1);
    expect(outcome.consumerShare).toBeCloseTo(2 / 3);
  });

  it('eliminates all trade when the tax exceeds the gap between the curves', () => {
    const outcome = unwrap(solveTax(BASIC_MARKET, 12));
    expect(outcome.quantity).toBe(0);
    expect(outcome.revenue.area).toBe(0);
    expect(outcome.deadweightLoss.area).toBeCloseTo(25);
  });

  it('rejects a negative tax', () => {
    expect(solveTax(BASIC_MARKET, -1).ok).toBe(false);
  });
});

describe('solveSubsidy', () => {
  it('raises quantity past the efficient level', () => {
    const outcome = unwrap(solveSubsidy(BASIC_MARKET, 2));
    expect(outcome.quantity).toBeCloseTo(6);
    expect(outcome.sellerPrice).toBeCloseTo(6);
    expect(outcome.buyerPrice).toBeCloseTo(4);
    expect(outcome.cost.area).toBeCloseTo(12);
    expect(outcome.deadweightLoss.area).toBeCloseTo(1);
    expect(outcome.consumerSurplus.area).toBeCloseTo(18);
    expect(outcome.producerSurplus.area).toBeCloseTo(18);
  });

  it('costs more than it creates: CS + PS − cost = original surplus − DWL', () => {
    const outcome = unwrap(solveSubsidy(BASIC_MARKET, 2));
    const net = outcome.consumerSurplus.area + outcome.producerSurplus.area - outcome.cost.area;
    expect(net).toBeCloseTo(outcome.before.totalSurplus - outcome.deadweightLoss.area);
  });
});

describe('solvePriceControl', () => {
  it('creates a shortage under a binding ceiling', () => {
    const outcome = unwrap(solvePriceControl(BASIC_MARKET, 'ceiling', 3));
    expect(outcome.binding).toBe(true);
    expect(outcome.quantityDemanded).toBeCloseTo(7);
    expect(outcome.quantitySupplied).toBeCloseTo(3);
    expect(outcome.quantityTraded).toBeCloseTo(3);
    expect(outcome.shortage).toBeCloseTo(4);
    expect(outcome.surplus).toBe(0);
    expect(outcome.consumerSurplus.area).toBeCloseTo(16.5);
    expect(outcome.producerSurplus.area).toBeCloseTo(4.5);
    expect(outcome.deadweightLoss.area).toBeCloseTo(4);
  });

  it('creates a surplus under a binding floor', () => {
    // Regression: the old app labeled a P = 7 floor "Non-Binding" because the form
    // sent "priceFloor" while the server checked for "Price Floor".
    const outcome = unwrap(solvePriceControl(BASIC_MARKET, 'floor', 7));
    expect(outcome.binding).toBe(true);
    expect(outcome.surplus).toBeCloseTo(4);
    expect(outcome.shortage).toBe(0);
    expect(outcome.consumerSurplus.area).toBeCloseTo(4.5);
    expect(outcome.producerSurplus.area).toBeCloseTo(16.5);
    expect(outcome.deadweightLoss.area).toBeCloseTo(4);
  });

  it('has no effect when non-binding', () => {
    // Regression: the old app reported a shortage of 6 for a ceiling above equilibrium.
    const ceiling = unwrap(solvePriceControl(BASIC_MARKET, 'ceiling', 8));
    const floor = unwrap(solvePriceControl(BASIC_MARKET, 'floor', 4));
    for (const outcome of [ceiling, floor]) {
      expect(outcome.binding).toBe(false);
      expect(outcome.shortage).toBe(0);
      expect(outcome.surplus).toBe(0);
      expect(outcome.quantityTraded).toBeCloseTo(5);
      expect(outcome.deadweightLoss.area).toBe(0);
    }
  });

  it('treats a control exactly at equilibrium as non-binding', () => {
    expect(unwrap(solvePriceControl(BASIC_MARKET, 'ceiling', 5)).binding).toBe(false);
  });
});

describe('supply that meets the quantity axis', () => {
  // Supply P = −2 + Q reaches a price of zero at Q = 2; equilibrium is (6, 4).
  const market = { demand: { intercept: 10, slope: -1 }, supply: { intercept: -2, slope: 1 } };

  it('measures producer surplus down to the axis, not below it', () => {
    const outcome = unwrap(solveMarket(market));
    expect(outcome.equilibrium).toEqual({ q: 6, p: 4 });
    // A 4 × 2 rectangle plus a triangle of 8 above the sloped part.
    expect(outcome.producerSurplus.area).toBeCloseTo(16);
    expect(polygonArea(outcome.producerSurplus.polygon)).toBeCloseTo(16);
  });

  it('keeps the seller price at zero under a very large tax', () => {
    const outcome = unwrap(solveTax(market, 9));
    expect(outcome.quantity).toBeCloseTo(1);
    expect(outcome.sellerPrice).toBeCloseTo(0);
    expect(outcome.buyerPrice).toBeCloseTo(9);
    expect(outcome.producerSurplus.area).toBeCloseTo(0);
  });

  it('rejects markets that would clear at a negative price', () => {
    const result = solveMarket({ ...market, supply: { intercept: -12, slope: 1 } });
    expect(result.ok).toBe(false);
  });
});
