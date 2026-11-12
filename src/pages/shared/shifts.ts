import { shiftQuantity } from '../../econ/core/line';
import type { Market } from '../../econ/models/market';
import { SHIFTERS, type ShiftDirection } from '../../econ/models/shifts';

export const NO_SHIFT = 'none';

/** A chosen shifter (or NO_SHIFT) and how far it moves its curve, in units of quantity. */
export interface ShiftChoice {
  readonly shifterId: string;
  readonly size: number;
}

export function directionOf(shifterId: string): ShiftDirection {
  return SHIFTERS.find((s) => s.id === shifterId)?.direction ?? 'none';
}

/** The market after each curve moves horizontally by its chosen shift. */
export function applyShifts(market: Market, demand: ShiftChoice, supply: ShiftChoice): Market {
  return {
    demand: shiftQuantity(market.demand, sign(directionOf(demand.shifterId)) * demand.size),
    supply: shiftQuantity(market.supply, sign(directionOf(supply.shifterId)) * supply.size),
  };
}

function sign(direction: ShiftDirection): number {
  return direction === 'increase' ? 1 : direction === 'decrease' ? -1 : 0;
}
