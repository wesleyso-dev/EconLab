// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import Externality from './Externalities/Externality';
import CompetitiveLabor from './FactorMarkets/CompetitiveLabor/CompetitiveLabor';
import Monopsony from './FactorMarkets/Monopsony/Monopsony';
import PPF from './PPF/PPF';

afterEach(cleanup);

// Expected values were computed by hand, independently of the engine.
function renderAt(page: ReactElement, search = '') {
  return render(<MemoryRouter initialEntries={[`/${search}`]}>{page}</MemoryRouter>);
}

function row(label: string): string[] {
  const tr = screen.getByRole('rowheader', { name: label }).closest('tr');
  if (!tr) throw new Error(`No row for ${label}`);
  return within(tr)
    .getAllByRole('cell')
    .map((cell) => cell.textContent ?? '');
}

describe('Externalities', () => {
  // Demand P = 10 − Q, supply P = 1 + 0.8Q, external effect 2 per unit.
  it('shows over-production with a negative externality', () => {
    renderAt(<Externality kind="negative" />);
    // MSC = 3 + 0.8Q meets demand at Q* = 7 / 1.8 = 3.89, P* = 6.11.
    expect(row('Quantity')).toEqual(['5', '3.89']);
    expect(row('Price')).toEqual(['5', '6.11']);
    expect(row('Deadweight loss')).toEqual(['1.11', '0']);
    expect(screen.getByText(/per-unit tax of 2/)).toBeTruthy();
  });

  it('shows under-production with a positive externality', () => {
    renderAt(<Externality kind="positive" />);
    // MSB = 12 − Q meets supply at Q* = 11 / 1.8 = 6.11, P* = 5.89.
    expect(row('Quantity')).toEqual(['5', '6.11']);
    expect(row('Price')).toEqual(['5', '5.89']);
    expect(row('Deadweight loss')).toEqual(['1.11', '0']);
    expect(screen.getByText(/per-unit subsidy of 2/)).toBeTruthy();
  });

  it('handles an external cost that rises with output', () => {
    renderAt(<Externality kind="negative" />, '?e1=0.5');
    // MSC = 3 + 1.3Q: Q* = 7 / 2.3 = 3.04; tax = 2 + 0.5 · 3.04 = 3.52;
    // DWL = ∫ from 3.04 to 5 of (2.3Q − 7) dQ = 4.4.
    expect(row('Quantity')).toEqual(['5', '3.04']);
    expect(row('Deadweight loss')[0]).toBe('4.4');
    expect(screen.getByText(/per-unit tax of 3.52/)).toBeTruthy();
  });

  it('resizes the externality with its handle', () => {
    renderAt(<Externality kind="negative" />);
    fireEvent.keyDown(screen.getByRole('button', { name: /^Change external cost/ }), {
      key: 'ArrowUp',
      shiftKey: true,
    });
    expect(screen.getByRole('slider', { name: /External cost per unit/ })).toHaveProperty(
      'value',
      '3',
    );
  });
});

describe('Monopsony', () => {
  it('hires where MRC = MRP and pays the supply wage', () => {
    renderAt(<Monopsony />);
    // Supply W = 2 + 0.6L, MRC = 2 + 1.2L, MRP = 10 − L: L = 8 / 2.2 = 3.64.
    expect(row('Workers hired')).toEqual(['3.64', '5']);
    expect(row('Wage')).toEqual(['4.18', '5']);
    expect(row('MRP of the last worker')).toEqual(['6.36', '5']);
    // ∫ from 3.64 to 5 of (8 − 1.6L) dL = 1.49.
    expect(row('Deadweight loss')).toEqual(['1.49', '0']);
    expect(screen.getByText('W = 10 − L')).toBeTruthy();
  });
});

describe('Competitive labor market', () => {
  it('links the market wage to the firm and applies labor shifters', () => {
    renderAt(<CompetitiveLabor />);
    expect(row('Market wage')).toEqual(['5', '5', '0']);
    expect(row('Workers the firm hires')).toEqual(['5', '5', '0']);
    fireEvent.change(screen.getByRole('combobox', { name: 'Labor supply shifter' }), {
      target: { value: 'labor-workers-up' },
    });
    // Supply W = 0.8 + 0.6L meets 10 − L at L = 5.75, W = 4.25.
    expect(row('Market wage')).toEqual(['5', '4.25', '−0.75']);
    expect(row('Market employment')).toEqual(['5', '5.75', '0.75']);
    expect(row('Workers the firm hires')).toEqual(['5', '5.75', '0.75']);
    expect(screen.getByText(/The market wage falls by 0.75/)).toBeTruthy();
  });

  it('offers only labor-market shifters', () => {
    renderAt(<CompetitiveLabor />);
    const select = screen.getByRole('combobox', { name: 'Labor demand shifter' });
    expect(within(select).queryByText('Higher income (normal good)')).toBeNull();
    expect(within(select).getByText('Workers become more productive')).toBeTruthy();
  });
});

describe('PPF', () => {
  it('measures increasing opportunity cost on a bowed frontier', () => {
    renderAt(<PPF shape="bowed" />);
    // y = 10(1 − (x/10)²); at x = 4 the slope is 2 · 10 · 4 / 100 = 0.8.
    expect(row('Cost of 1 Good X (in Good Y)')).toEqual(['0.8']);
    expect(row('Cost of 1 Good Y (in Good X)')).toEqual(['1.25']);
    expect(screen.getByText(/is inefficient/)).toBeTruthy();
  });

  it('classifies production points', () => {
    renderAt(<PPF shape="bowed" />, '?py=8.4');
    expect(screen.getByText(/is efficient/)).toBeTruthy();
    cleanup();
    renderAt(<PPF shape="bowed" />, '?px=6&py=9');
    expect(screen.getByText(/is unattainable/)).toBeTruthy();
  });

  it('finds comparative advantage between two producers', () => {
    renderAt(<PPF shape="linear" />, '?two=yes');
    // A: 10 X or 10 Y (cost of X = 1); B: 8 X or 4 Y (cost of X = 0.5).
    expect(row('Cost of 1 Good X (in Good Y)')).toEqual(['1', '0.5']);
    expect(row('Cost of 1 Good Y (in Good X)')).toEqual(['1', '2']);
    expect(
      screen.getByText(
        /Producer B has the comparative advantage in Good X and producer A in Good Y/,
      ),
    ).toBeTruthy();
  });

  it('moves an intercept with its handle', () => {
    renderAt(<PPF shape="linear" />);
    fireEvent.keyDown(screen.getByRole('button', { name: /^Most Good X for the frontier/ }), {
      key: 'ArrowRight',
    });
    expect(row('Most Good X')).toEqual(['10.5']);
  });
});
