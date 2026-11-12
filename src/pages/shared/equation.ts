import type { Line } from '../../../econ/core/line';
import { formatNumber } from '../../../graph';

/** A line as an inverse-curve equation, e.g. "P = 10 − 0.8Q". */
export function equation(line: Line): string {
  const intercept = formatNumber(line.intercept);
  const slope = formatNumber(Math.abs(line.slope));
  if (slope === '0') return `P = ${intercept}`;
  const term = slope === '1' ? 'Q' : `${slope}Q`;
  return `P = ${intercept} ${line.slope < 0 ? '−' : '+'} ${term}`;
}
