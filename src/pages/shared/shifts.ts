import { shiftQuantity } from '../../econ/core/line';
import type { Market } from '../../econ/models/market';
import { LABOR_SHIFTERS } from '../../econ/models/labor';
import { SHIFTERS, type Shifter, type ShiftDirection } from '../../econ/models/shifts';

/** Every shifter, product and labor market; ids are unique across both. */
const ALL_SHIFTERS: readonly Shifter[] = [...SHIFTERS, ...LABOR_SHIFTERS];

export const NO_SHIFT = 'none';

/** A chosen shifter (or NO_SHIFT) and how far it moves its curve, in units of quantity. */
export interface ShiftChoice {
  readonly shifterId: string;
  readonly size: number;
}

export function directionOf(shifterId: string): ShiftDirection {
  return ALL_SHIFTERS.find((s) => s.id === shifterId)?.direction ?? 'none';
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

/** The shifter id if it exists for this curve, otherwise NO_SHIFT (e.g. from a bad link). */
export function validShifter(
  shifterId: string,
  curve: 'demand' | 'supply',
  catalog: readonly Shifter[] = SHIFTERS,
): string {
  return catalog.some((s) => s.id === shifterId && s.curve === curve) ? shifterId : NO_SHIFT;
}
