import { describe, expect, it } from 'vitest';
import { compareEquilibria, predictShiftEffects, SHIFTERS, type ShiftDirection } from './shifts';

describe('predictShiftEffects', () => {
  // [supply, demand, price, quantity] — the standard textbook table.
  const table: [ShiftDirection, ShiftDirection, string, string][] = [
    ['none', 'none', 'unchanged', 'unchanged'],
    ['none', 'increase', 'increase', 'increase'],
    ['none', 'decrease', 'decrease', 'decrease'],
    ['increase', 'none', 'decrease', 'increase'],
    ['decrease', 'none', 'increase', 'decrease'],
    ['increase', 'increase', 'indeterminate', 'increase'],
    ['decrease', 'decrease', 'indeterminate', 'decrease'],
    ['increase', 'decrease', 'decrease', 'indeterminate'],
    ['decrease', 'increase', 'increase', 'indeterminate'],
  ];

  it.each(table)('supply %s, demand %s → price %s, quantity %s', (s, d, price, quantity) => {
    expect(predictShiftEffects(s, d)).toEqual({ price, quantity });
  });
});

describe('compareEquilibria', () => {
  it('reports signed changes', () => {
    expect(compareEquilibria({ q: 5, p: 5 }, { q: 6, p: 5 })).toEqual({
      priceChange: 0,
      quantityChange: 1,
      price: 'unchanged',
      quantity: 'increase',
    });
  });
});

describe('SHIFTERS', () => {
  it('has unique ids', () => {
    expect(new Set(SHIFTERS.map((s) => s.id)).size).toBe(SHIFTERS.length);
  });
});
