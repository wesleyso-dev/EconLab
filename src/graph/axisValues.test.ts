import { describe, expect, it } from 'vitest';
import { chipWidth, isCovered, layoutAxisValues } from './axisValues';

describe('layoutAxisValues', () => {
  it('leaves chips that do not overlap where they are', () => {
    const placed = layoutAxisValues([
      ['a', { axis: 'q', text: 'Q₁ 2', at: 100 }],
      ['b', { axis: 'q', text: 'Q₂ 8', at: 300 }],
    ]);
    expect(placed.map((c) => c.center)).toEqual([100, 300]);
  });

  it('nudges a close chip just past its neighbor', () => {
    const placed = layoutAxisValues([
      ['b', { axis: 'q', text: 'Q₂ 5.22', at: 112 }],
      ['a', { axis: 'q', text: 'Q₁ 5', at: 100 }],
    ]);
    const [first, second] = placed;
    expect(first?.id).toBe('a');
    expect(first?.center).toBe(100);
    const gap = (second?.center ?? 0) - (second?.width ?? 0) / 2 - (100 + chipWidth('Q₁ 5') / 2);
    expect(gap).toBeCloseTo(3);
  });

  it('stacks price chips vertically and keeps the axes independent', () => {
    const placed = layoutAxisValues([
      ['p1', { axis: 'p', text: 'P₁ 5', at: 200 }],
      ['p2', { axis: 'p', text: 'P₂ 5.1', at: 204 }],
      ['q1', { axis: 'q', text: 'Q 5', at: 202 }],
    ]);
    const byId = Object.fromEntries(placed.map((c) => [c.id, c.center]));
    expect(byId).toEqual({ p1: 200, q1: 202, p2: 219 });
  });
});

describe('isCovered', () => {
  const placed = layoutAxisValues([['a', { axis: 'q', text: 'Qd 6.5', at: 300 }]]);

  it('hides tick labels under or touching a chip', () => {
    expect(isCovered(placed, 'q', 300, '6')).toBe(true);
    expect(isCovered(placed, 'q', 325, '7')).toBe(true);
  });

  it('keeps tick labels clear of chips and on the other axis', () => {
    expect(isCovered(placed, 'q', 360, '8')).toBe(false);
    expect(isCovered(placed, 'p', 300, '6')).toBe(false);
  });
});
