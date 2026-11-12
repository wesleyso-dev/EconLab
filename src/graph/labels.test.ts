import { describe, expect, it } from 'vitest';
import { labelCandidates, layoutLabels, type LabelRequest } from './labels';

const plot = { left: 0, top: 0, width: 200, height: 200 };

describe('labelCandidates', () => {
  it('starts at the visible end of the curve and steps back along it', () => {
    // A diagonal running up and to the right, partly outside the plot.
    const points = Array.from({ length: 30 }, (_, i) => ({ x: i * 10, y: 250 - i * 10 }));
    const [first, second] = labelCandidates(points, plot);
    expect(first).toEqual({ x: 206, y: 44 }); // last inside point (200, 50), offset up-right
    expect(second?.x).toBeLessThan(first?.x ?? 0);
  });

  it('moves labels below the line where it exits the top edge', () => {
    const [first] = labelCandidates([{ x: 100, y: 5 }], plot);
    expect(first).toEqual({ x: 106, y: 19 });
  });

  it('returns nothing for a curve entirely outside the plot', () => {
    expect(labelCandidates([{ x: 500, y: 500 }], plot)).toEqual([]);
  });
});

describe('layoutLabels', () => {
  const request = (text: string, ...ys: number[]): LabelRequest => ({
    text,
    candidates: ys.map((y) => ({ x: 100, y })),
  });

  it('keeps first choices that do not collide', () => {
    const placed = layoutLabels([
      ['a', request('S', 20)],
      ['b', request('D', 120)],
    ]);
    expect(placed.map((l) => l.y)).toEqual([20, 120]);
  });

  it('moves a colliding label to its next candidate', () => {
    const placed = layoutLabels([
      ['a', request('S', 20)],
      ['b', request('S + t', 24, 60)],
    ]);
    expect(placed[1]).toMatchObject({ id: 'b', y: 60 });
  });

  it('falls back to the first candidate when everything collides', () => {
    const placed = layoutLabels([
      ['a', request('S', 20)],
      ['b', request('S1', 22, 24)],
    ]);
    expect(placed[1]?.y).toBe(22);
  });
});
