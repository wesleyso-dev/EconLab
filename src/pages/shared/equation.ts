import type { Line } from '../../econ/core/line';
import { formatNumber } from '../../graph';

/** Variable letters for an equation, e.g. price and quantity or wage and labor. */
export interface Symbols {
  readonly y: string;
  readonly x: string;
}

/** A line as an inverse-curve equation, e.g. "P = 10 − 0.8Q". */
export function equation(line: Line, { y, x }: Symbols = { y: 'P', x: 'Q' }): string {
  const intercept = formatNumber(line.intercept);
  const slope = formatNumber(Math.abs(line.slope));
  if (slope === '0') return `${y} = ${intercept}`;
  const term = slope === '1' ? x : `${slope}${x}`;
  return `${y} = ${intercept} ${line.slope < 0 ? '−' : '+'} ${term}`;
}
