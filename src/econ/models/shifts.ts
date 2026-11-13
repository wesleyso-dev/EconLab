import type { Point } from '../core/line';

export type ShiftDirection = 'increase' | 'decrease' | 'none';
export type Change = 'increase' | 'decrease' | 'unchanged' | 'indeterminate';

export interface Shifter {
  readonly id: string;
  readonly label: string;
  readonly curve: 'demand' | 'supply';
  readonly direction: Exclude<ShiftDirection, 'none'>;
}

/** Common determinants of demand and supply and the shift each one causes. */
export const SHIFTERS: readonly Shifter[] = [
  {
    id: 'demand-income-up',
    label: 'Higher income (normal good)',
    curve: 'demand',
    direction: 'increase',
  },
  {
    id: 'demand-income-down',
    label: 'Lower income (normal good)',
    curve: 'demand',
    direction: 'decrease',
  },
  {
    id: 'demand-substitute-up',
    label: 'Price of a substitute rises',
    curve: 'demand',
    direction: 'increase',
  },
  {
    id: 'demand-substitute-down',
    label: 'Price of a substitute falls',
    curve: 'demand',
    direction: 'decrease',
  },
  {
    id: 'demand-complement-up',
    label: 'Price of a complement rises',
    curve: 'demand',
    direction: 'decrease',
  },
  {
    id: 'demand-complement-down',
    label: 'Price of a complement falls',
    curve: 'demand',
    direction: 'increase',
  },
  {
    id: 'demand-buyers-up',
    label: 'More buyers in the market',
    curve: 'demand',
    direction: 'increase',
  },
  {
    id: 'demand-buyers-down',
    label: 'Fewer buyers in the market',
    curve: 'demand',
    direction: 'decrease',
  },
  {
    id: 'demand-tastes-up',
    label: 'Tastes shift toward the good',
    curve: 'demand',
    direction: 'increase',
  },
  {
    id: 'demand-tastes-down',
    label: 'Tastes shift away from the good',
    curve: 'demand',
    direction: 'decrease',
  },
  {
    id: 'demand-expect-up',
    label: 'Buyers expect higher future prices',
    curve: 'demand',
    direction: 'increase',
  },
  { id: 'supply-inputs-up', label: 'Input prices rise', curve: 'supply', direction: 'decrease' },
  { id: 'supply-inputs-down', label: 'Input prices fall', curve: 'supply', direction: 'increase' },
  {
    id: 'supply-technology',
    label: 'Better production technology',
    curve: 'supply',
    direction: 'increase',
  },
  {
    id: 'supply-sellers-up',
    label: 'More sellers in the market',
    curve: 'supply',
    direction: 'increase',
  },
  {
    id: 'supply-sellers-down',
    label: 'Fewer sellers in the market',
    curve: 'supply',
    direction: 'decrease',
  },
  { id: 'supply-tax', label: 'Per-unit tax on producers', curve: 'supply', direction: 'decrease' },
  {
    id: 'supply-subsidy',
    label: 'Per-unit subsidy to producers',
    curve: 'supply',
    direction: 'increase',
  },
  {
    id: 'supply-expect-up',
    label: 'Sellers expect higher future prices',
    curve: 'supply',
    direction: 'decrease',
  },
];

const SIGN: Record<ShiftDirection, number> = { increase: 1, decrease: -1, none: 0 };

/**
 * The qualitative effect of shifting demand and/or supply on equilibrium price and
 * quantity. When the two shifts push a variable in opposite directions, the result
 * depends on their relative sizes and is indeterminate.
 */
export function predictShiftEffects(
  supply: ShiftDirection,
  demand: ShiftDirection,
): { price: Change; quantity: Change } {
  const s = SIGN[supply];
  const d = SIGN[demand];
  return {
    // Demand raises price and quantity; supply lowers price and raises quantity.
    price: combine(d, -s),
    quantity: combine(d, s),
  };
}

function combine(a: number, b: number): Change {
  if (a !== 0 && b !== 0 && a !== b) return 'indeterminate';
  const sign = a !== 0 ? a : b;
  return sign > 0 ? 'increase' : sign < 0 ? 'decrease' : 'unchanged';
}

/** Numeric comparison of two equilibria, e.g. before and after a shift. */
export function compareEquilibria(
  before: Point,
  after: Point,
  tolerance = 1e-9,
): { priceChange: number; quantityChange: number; price: Change; quantity: Change } {
  const priceChange = after.p - before.p;
  const quantityChange = after.q - before.q;
  return {
    priceChange,
    quantityChange,
    price: direction(priceChange, tolerance),
    quantity: direction(quantityChange, tolerance),
  };
}

function direction(delta: number, tolerance: number): Change {
  if (Math.abs(delta) <= tolerance) return 'unchanged';
  return delta > 0 ? 'increase' : 'decrease';
}
