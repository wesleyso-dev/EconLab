import type { Market } from '../../econ/models/market';
import type { AxisLabels } from '../shared/axisLabels';
import type { Symbols } from '../shared/equation';

/** Labor demand (MRP) W = 10 − L and supply W = 2 + 0.6L: competitive at L 5, W 5. */
export const LABOR_MARKET: Market = {
  demand: { intercept: 10, slope: -1 },
  supply: { intercept: 2, slope: 0.6 },
};

export const LABOR_LABELS: AxisLabels = { q: 'Quantity of labor', p: 'Wage' };
export const LABOR_SYMBOLS: Symbols = { y: 'W', x: 'L' };
export const LABOR_NAMES = ['Labor demand (MRP)', 'Labor supply'] as const;
