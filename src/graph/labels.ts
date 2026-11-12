import type { PlotBox } from './context';

export interface PxPoint {
  readonly x: number;
  readonly y: number;
}

/** A curve's label and the positions it may take, in order of preference. */
export interface LabelRequest {
  readonly text: string;
  readonly candidates: readonly PxPoint[];
  readonly ghost?: boolean;
}

export interface PlacedLabel {
  readonly id: string;
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly ghost?: boolean;
}

interface Box {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
}

/** Approximate advance width of a 13px semibold character. */
const CHAR_WIDTH = 7.5;
const CANDIDATE_SPACING = 22;
const MAX_CANDIDATES = 8;

function boxFor(text: string, { x, y }: PxPoint): Box {
  return { left: x - 2, right: x + text.length * CHAR_WIDTH + 2, top: y - 12, bottom: y + 3 };
}

function overlaps(a: Box, b: Box): boolean {
  return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
}

/**
 * Label positions along a curve, starting at its visible end and stepping back along
 * the curve itself, so a label displaced by a collision stays attached to its line.
 * `points` are the curve's samples in pixels, in order of increasing quantity.
 */
export function labelCandidates(points: readonly PxPoint[], plot: PlotBox): PxPoint[] {
  const bottom = plot.top + plot.height;
  const inside = points.filter(
    (pt) =>
      pt.x >= plot.left && pt.x <= plot.left + plot.width && pt.y >= plot.top && pt.y <= bottom,
  );
  const candidates: PxPoint[] = [];
  let last: PxPoint | null = null;
  for (let i = inside.length - 1; i >= 0 && candidates.length < MAX_CANDIDATES; i--) {
    const pt = inside[i];
    if (!pt) continue;
    if (last && Math.hypot(pt.x - last.x, pt.y - last.y) < CANDIDATE_SPACING) continue;
    last = pt;
    const nearTop = pt.y < plot.top + 14;
    candidates.push({
      x: pt.x + 6,
      y: Math.min(bottom - 4, nearTop ? pt.y + 14 : pt.y - 6),
    });
  }
  return candidates;
}

/**
 * Greedy placement: each label, in order, takes its first candidate that does not
 * overlap a label already placed. If every candidate collides, it keeps its first.
 */
export function layoutLabels(requests: Iterable<[string, LabelRequest]>): PlacedLabel[] {
  const placed: PlacedLabel[] = [];
  const boxes: Box[] = [];
  for (const [id, request] of requests) {
    const first = request.candidates[0];
    if (!first) continue;
    const choice =
      request.candidates.find((c) => !boxes.some((b) => overlaps(b, boxFor(request.text, c)))) ??
      first;
    boxes.push(boxFor(request.text, choice));
    placed.push({ id, text: request.text, x: choice.x, y: choice.y, ghost: request.ghost });
  }
  return placed;
}
