// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { AppRoutes } from '../App';
import { TOPICS } from './topics';

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute('data-theme');
  localStorage.clear();
});

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  );
}

describe('routes', () => {
  const pages = TOPICS.flatMap((topic) => topic.pages.map((page) => ({ topic, page })));

  it.each(pages.map(({ page, topic }) => [page.path, page, topic] as const))(
    '%s renders its model with the right title and navigation',
    (_path, page, topic) => {
      renderAt(page.path);
      expect(screen.queryByText('Page not found')).toBeNull();
      expect(document.title).toBe(`${page.title} · EconLab`);
      const nav = screen.getByRole('navigation', { name: 'Topics' });
      expect(nav.querySelector('[aria-current]')?.textContent).toBe(topic.label);
      expect(screen.queryByText('Being rebuilt.') !== null).toBe(page.legacy === true);
    },
  );

  it('opens a topic at its first model', () => {
    renderAt('/ppf');
    expect(document.title).toBe('Bowed-out PPF · EconLab');
  });

  it('shows section tabs only for topics with several models', () => {
    renderAt('/supply-and-demand/tax');
    const tabs = screen.getByRole('navigation', { name: 'Supply & Demand models' });
    expect(tabs.querySelector('[aria-current="page"]')?.textContent).toBe('Tax');
    cleanup();
    renderAt('/monopoly');
    expect(screen.queryByRole('navigation', { name: /models$/ })).toBeNull();
  });

  it('shows a not-found page for unknown paths', () => {
    renderAt('/nowhere');
    expect(screen.getByText('Page not found')).toBeTruthy();
    expect(document.title).toBe('EconLab');
  });

  it('renders the home page with every topic', () => {
    renderAt('/');
    for (const topic of TOPICS) {
      expect(screen.getByRole('heading', { name: topic.label })).toBeTruthy();
    }
    expect(screen.getByRole('img', { name: 'Interactive supply and demand graph' })).toBeTruthy();
  });
});

describe('shell controls', () => {
  it('cycles the theme and remembers explicit choices', () => {
    renderAt('/');
    const button = () => screen.getByRole('button', { name: /^Theme:/ });
    fireEvent.click(button());
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('econlab-theme')).toBe('light');
    fireEvent.click(button());
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    fireEvent.click(button());
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    expect(localStorage.getItem('econlab-theme')).toBeNull();
  });

  it('opens and closes the topic menu', () => {
    renderAt('/');
    const menu = screen.getByRole('button', { name: 'Models' });
    expect(menu.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(menu);
    expect(menu.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(
      within(screen.getByRole('navigation', { name: 'Topics' })).getByRole('link', {
        name: 'Monopoly',
      }),
    );
    expect(screen.getByRole('button', { name: 'Models' }).getAttribute('aria-expanded')).toBe(
      'false',
    );
  });
});
