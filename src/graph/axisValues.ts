/**
 * Values marked on an axis, such as "Q* 5" below a point, drawn on a chip that hides
 * the grid beneath. Chips on the same axis are spread apart so none overlap, and tick
 * labels that a chip would partly cover are hidden.
 */
export interface AxisValueRequest {
  readonly axis: 'q' | 'p';
  readonly text: string;
  /** Pixel position along the axis: x for the quantity axis, y for the price axis. */
  readonly at: number;
}

export interface PlacedAxisValue extends AxisValueRequest {
  readonly id: string;
  /** Where the chip's center ends up after spreading, along the same axis. */
  readonly center: number;
  readonly width: number;
}

/** Approximate advance width of a 12px semibold character. */
const CHAR_WIDTH = 7;
const PADDING = 10;
export const CHIP_HEIGHT = 16;
const GAP = 3;

export function chipWidth(text: string): number {
  return text.length * CHAR_WIDTH + PADDING;
}

/**
 * Places chips in order along each axis, nudging each one just far enough past the
 * previous chip to clear it. Chips usually stay on their point; only close ones move.
 */
export function layoutAxisValues(
  requests: Iterable<[string, AxisValueRequest]>,
): PlacedAxisValue[] {
  const sorted = [...requests].sort(([, a], [, b]) => a.at - b.at);
  const placed: PlacedAxisValue[] = [];
  const lastEnd = { q: -Infinity, p: -Infinity };
  for (const [id, request] of sorted) {
    const width = chipWidth(request.text);
    // Quantity chips sit side by side; price chips stack vertically.
    const half = request.axis === 'q' ? width / 2 : CHIP_HEIGHT / 2;
    const center = Math.max(request.at, lastEnd[request.axis] + GAP + half);
    lastEnd[request.axis] = center + half;
    placed.push({ ...request, id, center, width });
  }
  return placed;
}

/** Whether a tick label centered at `at` on `axis` would be covered by a chip. */
export function isCovered(
  placed: readonly PlacedAxisValue[],
  axis: 'q' | 'p',
  at: number,
  tickText: string,
): boolean {
  return placed.some((chip) => {
    if (chip.axis !== axis) return false;
    const reach =
      axis === 'q' ? chip.width / 2 + (tickText.length * CHAR_WIDTH) / 2 : CHIP_HEIGHT - 2;
    return Math.abs(chip.center - at) < reach;
  });
}
