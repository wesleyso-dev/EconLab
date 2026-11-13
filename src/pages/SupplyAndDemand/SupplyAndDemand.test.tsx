// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import PriceControls from './PriceControls/PriceControls';
import Shifts from './Shifts/Shifts';
import Subsidy from './Subsidy/Subsidy';
import Tax from './Tax/Tax';

afterEach(cleanup);

// Every page starts from demand P = 10 − Q and supply P = 1 + 0.8Q (equilibrium Q 5, P 5).
function renderPage(page: ReactElement) {
  return render(<MemoryRouter>{page}</MemoryRouter>);
}

/** The cells of a results-table row, e.g. ["5", "3.89"]. */
function row(label: string): string[] {
  const header = screen.getByRole('rowheader', { name: label });
  const tr = header.closest('tr');
  if (!tr) throw new Error(`No row for ${label}`);
  return within(tr)
    .getAllByRole('cell')
    .map((cell) => cell.textContent ?? '');
}

function setSlider(name: RegExp, value: number) {
  fireEvent.change(screen.getByRole('slider', { name }), { target: { value: String(value) } });
}

describe('Tax page', () => {
  it('shows the tax wedge, revenue and deadweight loss', () => {
    renderPage(<Tax />);
    // Q = (10 − 1 − 2) / 1.8 = 3.89; buyers pay 6.11, sellers keep 4.11.
    expect(row('Quantity')).toEqual(['5', '3.89']);
    expect(row('Price buyers pay')).toEqual(['5', '6.11']);
    expect(row('Price sellers keep')).toEqual(['5', '4.11']);
    expect(row('Tax revenue')).toEqual(['0', '7.78']);
    expect(row('Deadweight loss')).toEqual(['0', '1.11']);
    // Demand is steeper than supply, so buyers bear more: 1.11 / 2 = 56%.
    expect(screen.getByText(/Buyers bear 56% of the tax/)).toBeTruthy();
  });

  it('updates when the tax changes', () => {
    renderPage(<Tax />);
    setSlider(/Tax per unit/, 0);
    expect(row('Deadweight loss')).toEqual(['0', '0']);
    setSlider(/Tax per unit/, 6);
    expect(row('Quantity')).toEqual(['5', '1.67']);
  });

  it('reports a tax that stops all trade', () => {
    renderPage(<Tax />);
    fireEvent.change(screen.getAllByRole('spinbutton', { name: 'Intercept' })[0]!, {
      target: { value: '8' },
    });
    setSlider(/Tax per unit/, 8);
    expect(row('Quantity')).toEqual(['3.89', '0']);
    expect(screen.getByText(/nothing is traded/)).toBeTruthy();
  });
});

describe('Subsidy page', () => {
  it('shows the subsidy cost and the overproduction loss', () => {
    renderPage(<Subsidy />);
    // Q = (10 − 1 + 2) / 1.8 = 6.11; buyers pay 3.89, sellers receive 5.89.
    expect(row('Quantity')).toEqual(['5', '6.11']);
    expect(row('Price buyers pay')).toEqual(['5', '3.89']);
    expect(row('Price sellers receive')).toEqual(['5', '5.89']);
    expect(row('Government cost')).toEqual(['0', '12.22']);
    expect(row('Deadweight loss')).toEqual(['0', '1.11']);
  });

  it('switches the shading between surplus and government cost', () => {
    const { container } = renderPage(<Subsidy />);
    const labels = () =>
      Array.from(container.querySelectorAll('svg text')).map((t) => t.textContent);
    expect(labels()).toContain('CS');
    fireEvent.click(screen.getByRole('radio', { name: 'Government cost' }));
    expect(labels()).toContain('Cost');
    expect(labels()).not.toContain('CS');
  });
});

describe('Price controls page', () => {
  it('shows the shortage under a binding ceiling', () => {
    renderPage(<PriceControls />);
    // At 3.5: Qd = 6.5, Qs = 3.125.
    expect(row('Quantity traded')).toEqual(['5', '3.13']);
    expect(row('Shortage')).toEqual(['0', '3.38']);
    expect(screen.getByText('Shortage 3.38')).toBeTruthy();
  });

  it('shows the surplus under a binding floor', () => {
    renderPage(<PriceControls />);
    fireEvent.click(screen.getByRole('radio', { name: 'Floor' }));
    // At 7: Qd = 3, Qs = 7.5.
    expect(row('Quantity traded')).toEqual(['5', '3']);
    expect(row('Surplus')).toEqual(['0', '4.5']);
  });

  it('explains when the control does not bind', () => {
    renderPage(<PriceControls />);
    setSlider(/Price ceiling price/, 8);
    expect(screen.getByText(/not binding/)).toBeTruthy();
    expect(row('Deadweight loss')).toEqual(['0', '0']);
  });

  it('moves the control line with the keyboard', () => {
    renderPage(<PriceControls />);
    const handle = screen.getByRole('button', { name: /Move price ceiling/ });
    fireEvent.keyDown(handle, { key: 'ArrowUp', shiftKey: true });
    expect(screen.getByRole('slider', { name: /Price ceiling price/ })).toHaveProperty(
      'value',
      '4.5',
    );
  });
});

describe('Shifts page', () => {
  it('compares equilibria after a demand increase', () => {
    renderPage(<Shifts />);
    // Higher income shifts demand right by 2: P = 12 − Q, so Q = 6.11 and P = 5.89.
    expect(row('Price')).toEqual(['5', '5.89', '0.89']);
    expect(row('Quantity')).toEqual(['5', '6.11', '1.11']);
    expect(screen.getByText(/Price rises by 0.89. Quantity rises by 1.11./)).toBeTruthy();
  });

  it('explains an indeterminate prediction when both curves shift', () => {
    renderPage(<Shifts />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Supply shifter' }), {
      target: { value: 'supply-inputs-down' },
    });
    // Supply also shifts right by 2, which exactly offsets the price rise.
    expect(row('Price')).toEqual(['5', '5', '0']);
    expect(
      screen.getByText(/Price could go either way in theory; here it stays the same/),
    ).toBeTruthy();
  });

  it('shows no change when nothing shifts', () => {
    renderPage(<Shifts />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Demand shifter' }), {
      target: { value: 'none' },
    });
    expect(row('Quantity')).toEqual(['5', '5', '0']);
  });
});

describe('Curve editing', () => {
  it('edits curves numerically and resets them', () => {
    renderPage(<Tax />);
    fireEvent.change(screen.getAllByRole('spinbutton', { name: 'Intercept' })[0]!, {
      target: { value: '12' },
    });
    expect(screen.getByText('P = 12 − Q')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Reset curves' }));
    expect(screen.getByText('P = 10 − Q')).toBeTruthy();
  });

  it('shifts a curve with its drag handle', () => {
    renderPage(<Tax />);
    fireEvent.keyDown(screen.getByRole('button', { name: /^Shift demand/ }), { key: 'ArrowUp' });
    expect(screen.getByText('P = 10.1 − Q')).toBeTruthy();
  });

  it('shows model errors instead of results', () => {
    renderPage(<Tax />);
    fireEvent.change(screen.getAllByRole('spinbutton', { name: 'Slope' })[0]!, {
      target: { value: '1' },
    });
    expect(screen.getByText('Demand must slope downward.')).toBeTruthy();
  });

  it('keeps custom axis labels', () => {
    const { container } = renderPage(<Tax />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Horizontal axis' }), {
      target: { value: 'Coffee (cups)' },
    });
    expect(container.querySelector('svg')?.textContent).toContain('Coffee (cups)');
  });
});
