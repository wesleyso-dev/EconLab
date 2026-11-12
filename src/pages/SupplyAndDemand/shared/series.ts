import type { Market } from '../../../econ/models/market';
import type { CrosshairSeries } from '../../../graph';

/** Crosshair readouts for the market's demand and supply curves. */
export function marketSeries(market: Market): CrosshairSeries[] {
  return [
    { label: 'Demand', curve: market.demand, color: 'var(--demand)' },
    { label: 'Supply', curve: market.supply, color: 'var(--supply)' },
  ];
}
