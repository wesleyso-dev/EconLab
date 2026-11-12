// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import Monopoly from './Monopoly/Monopoly';
import PerfectCompetition from './PerfectCompetition/PerfectCompetition';

afterEach(cleanup);

// Both pages use TC = 10 + 6Q − 1.2Q² + 0.1Q³. Expected values were computed
// independently of the engine.
function renderPage(page: ReactElement) {
  return render(<MemoryRouter>{page}</MemoryRouter>);
}

function row(label: string): string[] {
  const tr = screen.getByRole('rowheader', { name: label }).closest('tr');
  if (!tr) throw new Error(`No row for ${label}`);
  return within(tr)
    .getAllByRole('cell')
    .map((cell) => cell.textContent ?? '');
}

function graphText(container: HTMLElement): string {
  return Array.from(container.querySelectorAll('svg'))
    .map((svg) => svg.textContent)
    .join(' ');
}

describe('Monopoly page', () => {
  it('produces where MR = MC and compares with pricing at MC', () => {
    renderPage(<Monopoly />);
    // Demand P = 12 − Q.
    expect(row('Quantity')).toEqual(['5.19', '7.38']);
    expect(row('Price')).toEqual(['6.81', '4.62']);
    expect(row('Marginal cost')).toEqual(['1.62', '4.62']);
    expect(row('Average total cost')).toEqual(['4.39', '3.95']);
    expect(row('Consumer surplus')).toEqual(['13.46', '27.21']);
    expect(row('Profit')).toEqual(['12.55', '5']);
    expect(row('Deadweight loss')).toEqual(['6.2', '0']);
  });

  it('explains elasticity and the markup', () => {
    renderPage(<Monopoly />);
    expect(screen.getByText(/elastic below Q 6/)).toBeTruthy();
    expect(screen.getByText(/charges 5.19 above marginal cost/)).toBeTruthy();
  });

  it('switches between profit and welfare shading', () => {
    const { container } = renderPage(<Monopoly />);
    expect(graphText(container)).toContain('Profit');
    expect(graphText(container)).not.toContain('DWL');
    fireEvent.click(screen.getByRole('radio', { name: 'Welfare' }));
    expect(graphText(container)).toContain('DWL');
    expect(graphText(container)).toContain('Qc 7.38');
  });

  it('reports a loss when fixed cost is high', () => {
    renderPage(<Monopoly />);
    fireEvent.change(screen.getByRole('slider', { name: /Fixed cost/ }), {
      target: { value: '30' },
    });
    expect(row('Profit')[0]).toBe('−7.45');
    expect(screen.getByText(/makes a loss but still covers its variable cost/)).toBeTruthy();
  });

  it('shuts down when no price covers variable cost', () => {
    renderPage(<Monopoly />);
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Q term' }), {
      target: { value: '13' },
    });
    expect(screen.getByText(/the monopolist shuts down/)).toBeTruthy();
  });

  it('raises all costs with the cost handle', () => {
    renderPage(<Monopoly />);
    fireEvent.keyDown(screen.getByRole('button', { name: /^Shift costs/ }), { key: 'ArrowUp' });
    expect(screen.getByText('TC = 10 + 6.1Q − 1.2Q² + 0.1Q³')).toBeTruthy();
  });
});

describe('Perfect competition page', () => {
  it('links the market price to the firm and shows the long run', () => {
    renderPage(<PerfectCompetition />);
    // Market equilibrium P = 5; the firm produces where MC = 5. Long run: min ATC 3.93.
    expect(row('Market price')).toEqual(['5', '3.93']);
    expect(row('Market quantity')).toEqual(['5', '6.07']);
    expect(row('Firm output')).toEqual(['7.56', '7.02']);
    expect(row('Average total cost')).toEqual(['3.97', '3.93']);
    expect(row('Firm profit')).toEqual(['7.82', '0']);
    expect(screen.getByText(/attracts new firms/)).toBeTruthy();
  });

  it('draws long-run supply when asked', () => {
    const { container } = renderPage(<PerfectCompetition />);
    expect(graphText(container)).not.toContain('S′');
    fireEvent.click(screen.getByRole('radio', { name: 'Long run' }));
    expect(graphText(container)).toContain('S′');
    expect(graphText(container)).toContain('P 3.93');
  });

  it('shows losses after demand falls', () => {
    renderPage(<PerfectCompetition />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Demand shifter' }), {
      target: { value: 'demand-income-down' },
    });
    fireEvent.change(screen.getByRole('slider', { name: /Demand shift size/ }), {
      target: { value: '4' },
    });
    // Demand P = 6 − Q gives a market price of 3.22: above min AVC 2.4, below min ATC.
    expect(row('Market price')[0]).toBe('3.22');
    expect(screen.getByText(/make a loss but cover their variable cost/)).toBeTruthy();
  });

  it('shuts firms down when price is below minimum AVC', () => {
    renderPage(<PerfectCompetition />);
    fireEvent.change(screen.getAllByRole('spinbutton', { name: 'Intercept' })[0]!, {
      target: { value: '3' },
    });
    expect(row('Firm output')[0]).toBe('0');
    expect(screen.getByText(/every firm leaves this market/)).toBeTruthy();
  });
});
