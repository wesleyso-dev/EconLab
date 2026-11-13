// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { figureFromGraphs } from '../graph';
import Monopoly from '../pages/Monopoly/Monopoly';
import Tax from '../pages/SupplyAndDemand/Tax/Tax';

afterEach(cleanup);

/** Shows the current query string so tests can check what a shared link would hold. */
function Search() {
  return <output data-testid="search">{useLocation().search}</output>;
}

function renderAt(path: string, page = <Tax />) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      {page}
      <Search />
    </MemoryRouter>,
  );
}

const search = () => screen.getByTestId('search').textContent;

function row(label: string, table?: HTMLElement): string[] {
  const scope = table ? within(table) : screen;
  const tr = scope.getAllByRole('rowheader', { name: label })[0]?.closest('tr');
  if (!tr) throw new Error(`No row for ${label}`);
  return within(tr)
    .getAllByRole('cell')
    .map((cell) => cell.textContent ?? '');
}

describe('share links', () => {
  it('opens a page with the settings in its link', () => {
    // Demand P = 12 − Q with a tax of 3: Q = (12 − 1 − 3) / 1.8 = 4.44.
    renderAt('/supply-and-demand/tax?tax=3&d0=12');
    expect(screen.getByRole('slider', { name: /Tax per unit/ })).toHaveProperty('value', '3');
    expect(row('Quantity')).toEqual(['6.11', '4.44']);
  });

  it('writes changes into the link and leaves defaults out', () => {
    renderAt('/supply-and-demand/tax');
    expect(search()).toBe('');
    fireEvent.change(screen.getByRole('slider', { name: /Tax per unit/ }), {
      target: { value: '4.5' },
    });
    expect(search()).toBe('?tax=4.5');
    fireEvent.change(screen.getByRole('slider', { name: /Tax per unit/ }), {
      target: { value: '2' },
    });
    expect(search()).toBe('');
  });

  it('ignores malformed values', () => {
    renderAt('/supply-and-demand/tax?tax=abc&d1=');
    expect(row('Quantity')).toEqual(['5', '3.89']);
  });

  it('keeps cost functions and text in the link', () => {
    renderAt('/monopoly?cf=30&shade=welfare&xl=Widgets', <Monopoly />);
    expect(row('Profit')[0]).toBe('−7.45');
    expect(screen.getByRole('radio', { name: 'Welfare' })).toHaveProperty('checked', true);
    expect(screen.getByRole('img', { name: /Monopoly/ }).textContent).toContain('Widgets');
  });

  it('copies the link', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
    renderAt('/supply-and-demand/tax');
    fireEvent.click(screen.getByRole('button', { name: 'Copy link' }));
    await waitFor(() => expect(screen.getByText('Link copied.')).toBeTruthy());
    expect(writeText).toHaveBeenCalledWith(window.location.href);
    vi.unstubAllGlobals();
  });
});

describe('export', () => {
  it('produces a standalone SVG without interactive parts or class names', () => {
    const { container } = renderAt('/supply-and-demand/tax');
    const figure = figureFromGraphs(container);
    expect(figure).not.toBeNull();
    const svg = figure?.svg ?? '';
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('S + t');
    expect(svg).not.toContain('data-export');
    expect(svg).not.toContain('class=');
    expect(svg).not.toContain('role="button"');
  });
});

describe('scenario comparison', () => {
  it('compares the current settings with a pinned baseline', () => {
    renderAt('/supply-and-demand/tax');
    expect(screen.queryByRole('heading', { name: /baseline/ })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Pin as baseline' }));

    fireEvent.change(screen.getByRole('slider', { name: /Tax per unit/ }), {
      target: { value: '4' },
    });
    const comparison = screen
      .getByRole('heading', { name: 'Compared with your baseline' })
      .closest('section') as HTMLElement;
    // Tax 2 → 4: Q 3.89 → 2.78; DWL 1.11 → 4.44.
    expect(row('Quantity', comparison)).toEqual(['3.89', '2.78', '−1.11']);
    expect(row('Deadweight loss', comparison)).toEqual(['1.11', '4.44', '+3.33']);
    expect(within(comparison).getByRole('img').getAttribute('src')).toMatch(
      /^data:image\/svg\+xml/,
    );
  });

  it('restores and clears the baseline', () => {
    renderAt('/supply-and-demand/tax?tax=3');
    fireEvent.click(screen.getByRole('button', { name: 'Pin as baseline' }));
    fireEvent.change(screen.getByRole('slider', { name: /Tax per unit/ }), {
      target: { value: '5' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Restore baseline' }));
    expect(search()).toBe('?tax=3');
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.queryByRole('heading', { name: /baseline/ })).toBeNull();
  });
});
