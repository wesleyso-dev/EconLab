import { useId, useLayoutEffect } from 'react';
import { useGraph } from './context';
import { labelCandidates, type LabelRequest } from './labels';
import { pathData, sampleCurve, toCurveFn, type CurveSource } from './path';
import styles from './graph.module.css';

export interface CurveProps {
  readonly curve: CurveSource;
  /** Direct label drawn near the curve's visible end, e.g. "D" or "MC". */
  readonly label?: string;
  /** CSS color, typically a role token such as `var(--demand)`. */
  readonly color: string;
  readonly dashed?: boolean;
  /** De-emphasized, e.g. the "before" curve in a comparison. */
  readonly ghost?: boolean;
  /** Quantity range to draw; defaults to the graph's domain. */
  readonly from?: number;
  readonly to?: number;
}

const CURVED_SAMPLES = 160;
/** Samples used only to find label positions along straight lines. */
const LABEL_SAMPLES = 64;

export function Curve({ curve, label, color, dashed, ghost, from, to }: CurveProps) {
  const graph = useGraph();
  const { registerLabel } = graph;
  const id = useId();
  const { fn, straight } = toCurveFn(curve);
  const q0 = Math.max(from ?? graph.q.domain[0], graph.q.domain[0]);
  const q1 = Math.min(to ?? graph.q.domain[1], graph.q.domain[1]);
  const visible = q1 > q0;

  const segments = visible ? sampleCurve(fn, q0, q1, straight ? 1 : CURVED_SAMPLES) : [];
  const labelPoints =
    visible && label
      ? sampleCurve(fn, q0, q1, straight ? LABEL_SAMPLES : CURVED_SAMPLES)
          .flat()
          .map((pt) => ({ x: graph.q.toPx(pt.q), y: graph.p.toPx(pt.p) }))
      : [];
  const request: LabelRequest | null =
    label && labelPoints.length > 0
      ? { text: label, candidates: labelCandidates(labelPoints, graph.plot), ghost }
      : null;
  // Serialized so the effect only re-registers when the label actually moves.
  const requestKey = request && request.candidates.length > 0 ? JSON.stringify(request) : '';

  useLayoutEffect(() => {
    registerLabel(id, requestKey ? (JSON.parse(requestKey) as LabelRequest) : null);
  }, [id, requestKey, registerLabel]);
  useLayoutEffect(() => () => registerLabel(id, null), [id, registerLabel]);

  if (!visible) return null;
  return (
    <path
      className={`${styles.curve} ${ghost ? styles.ghost : ''}`}
      d={pathData(segments, graph.q, graph.p)}
      clipPath={graph.clipPath}
      style={{ stroke: color }}
      strokeDasharray={dashed ? '6 4' : undefined}
    />
  );
}
