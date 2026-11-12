import { createContext, useContext } from 'react';
import type { LabelRequest } from './labels';
import type { Scale } from './scale';

export interface PlotBox {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

export interface GraphContextValue {
  readonly q: Scale;
  readonly p: Scale;
  readonly plot: PlotBox;
  readonly width: number;
  readonly height: number;
  /** `url(#…)` reference that clips marks to the plot area. */
  readonly clipPath: string;
  /** The rendered <svg>, for converting pointer coordinates; null before mount. */
  readonly svg: SVGSVGElement | null;
  /** Curves submit their labels here so the graph can lay them out without overlaps. */
  readonly registerLabel: (id: string, request: LabelRequest | null) => void;
}

export const GraphContext = createContext<GraphContextValue | null>(null);

export function useGraph(): GraphContextValue {
  const value = useContext(GraphContext);
  if (!value) throw new Error('Graph primitives must be rendered inside <Graph>.');
  return value;
}
