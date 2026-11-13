import { useState, type KeyboardEvent, type PointerEvent } from 'react';
import type { Point } from '../econ/core/line';
import { useGraph } from './context';
import { formatNumber } from './format';
import { clamp, niceStep, snap, type Domain } from './scale';
import styles from './graph.module.css';

export interface DragHandleProps {
  readonly point: Point;
  readonly onChange: (point: Point) => void;
  /** Accessible name, e.g. "Shift demand". */
  readonly label: string;
  readonly color: string;
  /** Lock movement to one axis. */
  readonly axis?: 'q' | 'p';
  /** Allowed ranges; default to the graph's domains. */
  readonly qBounds?: Domain;
  readonly pBounds?: Domain;
  /** Snap increment for both pointer and keyboard movement. */
  readonly step?: number;
}

/**
 * A draggable point. Works with mouse, touch and pen (pointer capture keeps the drag
 * going outside the handle) and with the keyboard: arrow keys move one step, and
 * Shift + arrow moves ten.
 */
export function DragHandle({
  point,
  onChange,
  label,
  color,
  axis,
  qBounds,
  pBounds,
  step,
}: DragHandleProps) {
  const graph = useGraph();
  const [dragging, setDragging] = useState(false);
  const qRange = qBounds ?? graph.q.domain;
  const pRange = pBounds ?? graph.p.domain;
  const qStep = step ?? niceStep(graph.q.domain[1] - graph.q.domain[0], 100);
  const pStep = step ?? niceStep(graph.p.domain[1] - graph.p.domain[0], 100);

  function commit(next: Point) {
    const q = axis === 'p' ? point.q : clamp(snap(next.q, qStep), qRange[0], qRange[1]);
    const p = axis === 'q' ? point.p : clamp(snap(next.p, pStep), pRange[0], pRange[1]);
    if (q !== point.q || p !== point.p) onChange({ q, p });
  }

  function toData(event: PointerEvent): Point | null {
    const svg = graph.svg;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    return {
      q: graph.q.fromPx(event.clientX - rect.left),
      p: graph.p.fromPx(event.clientY - rect.top),
    };
  }

  function handlePointerDown(event: PointerEvent<SVGGElement>) {
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDragging(true);
  }

  function handlePointerMove(event: PointerEvent<SVGGElement>) {
    if (!dragging) return;
    const next = toData(event);
    if (next) commit(next);
  }

  function handlePointerUp(event: PointerEvent<SVGGElement>) {
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    setDragging(false);
  }

  function handleKeyDown(event: KeyboardEvent<SVGGElement>) {
    const multiplier = event.shiftKey ? 10 : 1;
    const moves: Record<string, Point> = {
      ArrowRight: { q: point.q + qStep * multiplier, p: point.p },
      ArrowLeft: { q: point.q - qStep * multiplier, p: point.p },
      ArrowUp: { q: point.q, p: point.p + pStep * multiplier },
      ArrowDown: { q: point.q, p: point.p - pStep * multiplier },
    };
    const next = moves[event.key];
    if (!next) return;
    event.preventDefault();
    commit(next);
  }

  const x = graph.q.toPx(point.q);
  const y = graph.p.toPx(point.p);
  const cursor = axis === 'q' ? 'ew-resize' : axis === 'p' ? 'ns-resize' : 'grab';

  return (
    <g
      className={`${styles.handle} ${dragging ? styles.dragging : ''}`}
      data-export="skip"
      style={{ cursor: dragging ? 'grabbing' : cursor, color }}
      tabIndex={0}
      role="button"
      aria-roledescription="draggable point"
      aria-label={`${label}: quantity ${formatNumber(point.q)}, price ${formatNumber(point.p)}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
    >
      <circle className={styles.handleHit} cx={x} cy={y} r={14} />
      <circle className={styles.handleMark} cx={x} cy={y} r={6} />
    </g>
  );
}
