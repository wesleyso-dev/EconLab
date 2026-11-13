import type { Line } from '../../../econ/core/line';
import type { Market } from '../../../econ/models/market';
import { useUrlState } from '../../../app/useUrlState';
import { DEFAULT_LABELS, type AxisLabels } from '../../shared/axisLabels';

/** Both axes of every supply-and-demand graph span 0–12. */
export const DOMAIN = [0, 12] as const;

/** Demand P = 10 − Q and supply P = 1 + 0.8Q: equilibrium at Q = 5, P = 5. */
export const DEFAULT_MARKET: Market = {
  demand: { intercept: 10, slope: -1 },
  supply: { intercept: 1, slope: 0.8 },
};

export interface MarketState {
  readonly market: Market;
  readonly setDemand: (demand: Line) => void;
  readonly setSupply: (supply: Line) => void;
  readonly labels: AxisLabels;
  readonly setLabels: (labels: AxisLabels) => void;
  readonly reset: () => void;
}

/** URL keys: demand and supply intercept (0) and slope (1), and the axis labels. */
const DEFAULTS = {
  d0: DEFAULT_MARKET.demand.intercept,
  d1: DEFAULT_MARKET.demand.slope,
  s0: DEFAULT_MARKET.supply.intercept,
  s1: DEFAULT_MARKET.supply.slope,
  xl: DEFAULT_LABELS.q,
  yl: DEFAULT_LABELS.p,
};

/**
 * The editable demand and supply curves and axis labels shared by every market page,
 * kept in the URL so the configuration can be shared.
 */
export function useMarket(): MarketState {
  const [state, update] = useUrlState(DEFAULTS);
  return {
    market: {
      demand: { intercept: state.d0, slope: state.d1 },
      supply: { intercept: state.s0, slope: state.s1 },
    },
    setDemand: (demand) => update({ d0: demand.intercept, d1: demand.slope }),
    setSupply: (supply) => update({ s0: supply.intercept, s1: supply.slope }),
    labels: { q: state.xl, p: state.yl },
    setLabels: (labels) => update({ xl: labels.q, yl: labels.p }),
    reset: () => update(DEFAULTS),
  };
}
