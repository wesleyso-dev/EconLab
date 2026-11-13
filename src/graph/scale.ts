export type Domain = readonly [number, number];

/** A linear map between data values and pixels. */
export interface Scale {
  readonly domain: Domain;
  readonly range: Domain;
  toPx(value: number): number;
  fromPx(px: number): number;
}

export function linearScale(domain: Domain, range: Domain): Scale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const k = (r1 - r0) / (d1 - d0);
  return {
    domain,
    range,
    toPx: (value) => r0 + (value - d0) * k,
    fromPx: (px) => d0 + (px - r0) / k,
  };
}

/** A "nice" step (1, 2 or 5 × 10ⁿ) giving roughly `target` intervals over `span`. */
export function niceStep(span: number, target: number): number {
  const raw = span / Math.max(1, target);
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const normalized = raw / magnitude;
  const factor = normalized < 1.5 ? 1 : normalized < 3 ? 2 : normalized < 7 ? 5 : 10;
  return factor * magnitude;
}

/** Evenly spaced round tick values covering [min, max]. */
export function niceTicks(min: number, max: number, target = 5): number[] {
  if (!(max > min)) return [min];
  const step = niceStep(max - min, target);
  const ticks: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-9; v += step) {
    ticks.push(roundTo(v, step));
  }
  return ticks;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Rounds `value` to the nearest multiple of `step`, without floating-point fuzz. */
export function snap(value: number, step: number): number {
  return roundTo(Math.round(value / step) * step, step);
}

function roundTo(value: number, step: number): number {
  const decimals = Math.max(0, -Math.floor(Math.log10(step)) + 1);
  return Number(value.toFixed(decimals));
}
