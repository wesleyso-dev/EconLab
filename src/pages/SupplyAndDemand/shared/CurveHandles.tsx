import { useState } from 'react';
import { priceAt, type Line } from '../../../econ/core/line';
import { DragHandle } from '../../../graph';
import { DOMAIN } from './useMarket';

export interface CurveHandlesProps {
  /** Used in the handles' accessible names, e.g. "Shift demand". */
  readonly name: string;
  readonly line: Line;
  readonly onChange: (line: Line) => void;
  readonly color: string;
  /** Demand must keep sloping down (-1); supply must keep sloping up (1). */
  readonly slopeSign: -1 | 1;
}

/** Minimum quantity gap between the two handles, so the slope stays well defined. */
const GAP = 1;
const STEP = 0.1;

/**
 * Two handles on a straight curve: the first moves it parallel to itself; the second
 * pivots it around the first, changing its slope. Handle positions are remembered,
 * but kept on the visible part of the curve.
 */
export function CurveHandles({ name, line, onChange, color, slopeSign }: CurveHandlesProps) {
  const [shiftQ, setShiftQ] = useState(3);
  const [rotateQ, setRotateQ] = useState(8);

  const range = visibleRange(line);
  if (!range) return null;
  const [lo, hi] = range;
  const pad = (hi - lo) * 0.05;
  const q0 = clampTo(shiftQ, lo + pad, hi - pad);
  const shiftPoint = { q: q0, p: priceAt(line, q0) };
  const q1 = Math.min(Math.max(rotateQ, q0 + GAP), hi - pad);
  const canRotate = q1 >= q0 + GAP;
  // Keep the pivoted point on the correct side so the slope keeps its sign.
  const pBounds: [number, number] =
    slopeSign < 0 ? [DOMAIN[0], shiftPoint.p - STEP] : [shiftPoint.p + STEP, DOMAIN[1]];

  return (
    <>
      <DragHandle
        label={`Shift ${name}`}
        color={color}
        point={shiftPoint}
        step={STEP}
        onChange={(pt) => {
          setShiftQ(pt.q);
          onChange({ slope: line.slope, intercept: pt.p - line.slope * pt.q });
        }}
      />
      {canRotate && pBounds[0] < pBounds[1] && (
        <DragHandle
          label={`Change ${name} slope`}
          color={color}
          point={{ q: q1, p: priceAt(line, q1) }}
          step={STEP}
          qBounds={[q0 + GAP, DOMAIN[1]]}
          pBounds={pBounds}
          onChange={(pt) => {
            const slope = (pt.p - shiftPoint.p) / (pt.q - shiftPoint.q);
            setRotateQ(pt.q);
            onChange({ slope, intercept: shiftPoint.p - slope * shiftPoint.q });
          }}
        />
      )}
    </>
  );
}

/** The quantities where the line lies inside the plot, or null if it never does. */
function visibleRange(line: Line): [number, number] | null {
  let lo: number = DOMAIN[0];
  let hi: number = DOMAIN[1];
  if (line.slope !== 0) {
    const a = (DOMAIN[0] - line.intercept) / line.slope;
    const b = (DOMAIN[1] - line.intercept) / line.slope;
    lo = Math.max(lo, Math.min(a, b));
    hi = Math.min(hi, Math.max(a, b));
  } else if (line.intercept < DOMAIN[0] || line.intercept > DOMAIN[1]) {
    return null;
  }
  return hi > lo ? [lo, hi] : null;
}

function clampTo(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
