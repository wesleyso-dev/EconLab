import { useState } from 'react';
import type { Line } from '../../../econ/core/line';
import type { Market } from '../../../econ/models/market';

/** Both axes of every supply-and-demand graph span 0–12. */
export const DOMAIN = [0, 12] as const;

/** Demand P = 10 − Q and supply P = 1 + 0.8Q: equilibrium at Q = 5, P = 5. */
export const DEFAULT_MARKET: Market = {
  demand: { intercept: 10, slope: -1 },
  supply: { intercept: 1, slope: 0.8 },
};

export interface AxisLabels {
  readonly q: string;
  readonly p: string;
}

export const DEFAULT_LABELS: AxisLabels = { q: 'Quantity', p: 'Price' };

export interface MarketState {
  readonly market: Market;
  readonly setDemand: (demand: Line) => void;
  readonly setSupply: (supply: Line) => void;
  readonly labels: AxisLabels;
  readonly setLabels: (labels: AxisLabels) => void;
  readonly reset: () => void;
}

/** The editable demand and supply curves and axis labels shared by every market page. */
export function useMarket(): MarketState {
  const [market, setMarket] = useState(DEFAULT_MARKET);
  const [labels, setLabels] = useState(DEFAULT_LABELS);
  return {
    market,
    setDemand: (demand) => setMarket((m) => ({ ...m, demand })),
    setSupply: (supply) => setMarket((m) => ({ ...m, supply })),
    labels,
    setLabels,
    reset: () => {
      setMarket(DEFAULT_MARKET);
      setLabels(DEFAULT_LABELS);
    },
  };
}
