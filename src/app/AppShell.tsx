import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { findPage, TOPICS } from './topics';
import styles from './shell.module.css';

/** The header, topic navigation and section tabs around every page. */
export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const match = findPage(pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const title = match ? `${match.page.title} · EconLab` : 'EconLab';

  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <>
      <a className={styles.skipLink} href="#content">
        Skip to content
      </a>
      <header className={styles.header}>
        <div className={styles.bar}>
          <Link to="/" className={styles.brand} onClick={() => setMenuOpen(false)}>
            <Logo />
            <span>EconLab</span>
          </Link>
          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={menuOpen}
            aria-controls="topic-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? 'Close' : 'Models'}
          </button>
          <nav
            id="topic-nav"
            aria-label="Topics"
            className={styles.topics}
            data-open={menuOpen || undefined}
          >
            <ul>
              {TOPICS.map((topic) => {
                const current = match?.topic.id === topic.id;
                return (
                  <li key={topic.id}>
                    <Link
                      to={topic.pages[0]?.path ?? '/'}
                      aria-current={current ? 'true' : undefined}
                      onClick={() => setMenuOpen(false)}
                    >
                      {topic.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <ThemeToggle />
        </div>
        {match && match.topic.pages.length > 1 && (
          <nav aria-label={`${match.topic.label} models`} className={styles.tabs}>
            <ul>
              {match.topic.pages.map((page) => (
                <li key={page.path}>
                  <NavLink to={page.path}>{page.label}</NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>
      <main id="content" tabIndex={-1} className={styles.main}>
        {match?.page.legacy && (
          <div className={styles.legacyNotice} role="note">
            <strong>Being rebuilt.</strong> This model is still the original 2024 version, which
            drew its graphs on a server that is no longer running. It is being rebuilt on
            EconLab&rsquo;s interactive engine.
          </div>
        )}
        {match?.page.legacy ? <div className={styles.legacyBody}>{children}</div> : children}
      </main>
    </>
  );
}
