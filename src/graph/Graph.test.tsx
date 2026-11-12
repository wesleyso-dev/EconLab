// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { regionBetween } from '../econ/core/region';
import { Area, Curve, DragHandle, Graph, PointMarker } from './index';

afterEach(cleanup);

// A 600 × 300 graph; with the fixed margins the plot spans x 52–556 and y 28–256.
function renderGraph(children: React.ReactNode) {
  return render(
    <Graph title="Test graph" qDomain={[0, 10]} pDomain={[0, 10]} width={600} aspectRatio={0.5}>
      {children}
    </Graph>,
  );
}

describe('<Graph>', () => {
  it('renders an accessible SVG with axes', () => {
    renderGraph(null);
    const svg = screen.getByRole('img', { name: 'Test graph' });
    expect(svg.getAttribute('width')).toBe('600');
    expect(svg.textContent).toContain('Quantity');
    expect(svg.textContent).toContain('Price');
  });

  it('draws a curve with its direct label', () => {
    const { container } = renderGraph(
      <Curve curve={{ intercept: 10, slope: -1 }} label="D" color="var(--demand)" />,
    );
    const path = container.querySelector('path');
    expect(path?.getAttribute('d')).toBe('M52,28L556,256');
    expect(screen.getByText('D')).toBeTruthy();
  });

  it('shades regions and labels them when they fit', () => {
    const { container } = renderGraph(
      <Area region={regionBetween([10, -1], [5], 0, 5)} tone="demand" label="CS" />,
    );
    expect(container.querySelector('polygon')?.getAttribute('points')).toBe(
      '52,28 304,142 304,142 52,142',
    );
    expect(screen.getByText('CS')).toBeTruthy();
  });

  it('moves colliding curve labels apart along their own curves', () => {
    // Parallel lines one unit apart leave the top edge almost together.
    renderGraph(
      <>
        <Curve curve={{ intercept: 0, slope: 1.2 }} label="S" color="var(--supply)" />
        <Curve curve={{ intercept: 0.4, slope: 1.2 }} label="S + t" color="var(--supply)" />
      </>,
    );
    const s = screen.getByText('S');
    const st = screen.getByText('S + t');
    const dx = Math.abs(Number(s.getAttribute('x')) - Number(st.getAttribute('x')));
    const dy = Math.abs(Number(s.getAttribute('y')) - Number(st.getAttribute('y')));
    expect(dx > 30 || dy > 15).toBe(true);
  });

  it('gives narrow graphs a taller plot', () => {
    render(<Graph title="Narrow" qDomain={[0, 10]} pDomain={[0, 10]} width={360} />);
    const svg = screen.getByRole('img', { name: 'Narrow' });
    expect(Number(svg.getAttribute('height'))).toBeGreaterThanOrEqual(340);
  });

  it('skips empty regions', () => {
    const { container } = renderGraph(
      <Area region={regionBetween([1], [0], 3, 3)} tone="neutral" />,
    );
    expect(container.querySelector('polygon')).toBeNull();
  });

  it('marks points with axis values', () => {
    renderGraph(<PointMarker point={{ q: 5, p: 5 }} qText="Q* 5" pText="P* 5" />);
    expect(screen.getByText('Q* 5')).toBeTruthy();
    expect(screen.getByText('P* 5')).toBeTruthy();
  });

  it('renders nothing for points outside the plot', () => {
    renderGraph(<PointMarker point={{ q: 20, p: 5 }} qText="hidden" />);
    expect(screen.queryByText('hidden')).toBeNull();
  });
});

describe('<DragHandle>', () => {
  function renderHandle(props: Partial<React.ComponentProps<typeof DragHandle>> = {}) {
    const onChange = vi.fn();
    renderGraph(
      <DragHandle
        point={{ q: 5, p: 5 }}
        onChange={onChange}
        label="Shift demand"
        color="var(--demand)"
        step={0.5}
        {...props}
      />,
    );
    return { onChange, handle: screen.getByRole('button', { name: /Shift demand/ }) };
  }

  it('is focusable and describes its position', () => {
    const { handle } = renderHandle();
    expect(handle.getAttribute('tabindex')).toBe('0');
    expect(handle.getAttribute('aria-label')).toBe('Shift demand: quantity 5, price 5');
  });

  it('moves one step per arrow key and ten with Shift', () => {
    const { onChange, handle } = renderHandle();
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith({ q: 5.5, p: 5 });
    fireEvent.keyDown(handle, { key: 'ArrowUp', shiftKey: true });
    expect(onChange).toHaveBeenLastCalledWith({ q: 5, p: 10 });
  });

  it('respects axis locks and bounds', () => {
    const { onChange, handle } = renderHandle({ axis: 'p', pBounds: [0, 6] });
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.keyDown(handle, { key: 'ArrowUp', shiftKey: true });
    expect(onChange).toHaveBeenLastCalledWith({ q: 5, p: 6 });
  });

  it('follows the pointer while dragging', () => {
    const { onChange, handle } = renderHandle();
    fireEvent.pointerDown(handle, { pointerId: 1, clientX: 304, clientY: 142 });
    // x 430 → q 7.5; y 85 → p 7.5 (jsdom places the svg at the viewport origin).
    fireEvent.pointerMove(handle, { pointerId: 1, clientX: 430, clientY: 85 });
    expect(onChange).toHaveBeenLastCalledWith({ q: 7.5, p: 7.5 });
    fireEvent.pointerUp(handle, { pointerId: 1 });
    fireEvent.pointerMove(handle, { pointerId: 1, clientX: 100, clientY: 100 });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

describe('axis values', () => {
  it('spreads close values apart and hides the ticks they cover', () => {
    const { container } = renderGraph(
      <>
        <PointMarker point={{ q: 5, p: 5 }} qText="Q₁ 5" />
        <PointMarker point={{ q: 5.2, p: 6 }} qText="Q₂ 5.2" />
      </>,
    );
    const x = (text: string) => Number(screen.getByText(text).getAttribute('x'));
    // q = 5 sits at x 304; the second value moves right of the first.
    expect(x('Q₁ 5')).toBe(304);
    expect(x('Q₂ 5.2')).toBeGreaterThan(304 + 40);
    // Quantity tick labels sit at y 274; the nudged value now covers the "6" tick.
    const qTicks = Array.from(container.querySelectorAll('text[y="274"]')).map(
      (t) => t.textContent,
    );
    expect(qTicks).toContain('4');
    expect(qTicks).not.toContain('6');
  });
});

describe('left margin', () => {
  it('widens so long price-axis values stay inside the graph', () => {
    const { container } = renderGraph(
      <PointMarker point={{ q: 5, p: 5 }} pText="ATC 12.34" guides={false} />,
    );
    const chip = container.querySelector('rect[rx="3"]');
    expect(Number(chip?.getAttribute('x'))).toBeGreaterThanOrEqual(0);
  });
});
