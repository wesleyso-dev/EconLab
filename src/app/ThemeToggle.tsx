import { useState } from 'react';
import { applyTheme, readTheme, THEME_CHOICES, type ThemeChoice } from './theme';
import styles from './shell.module.css';

const LABELS: Record<ThemeChoice, string> = { system: 'System', light: 'Light', dark: 'Dark' };

/** Cycles between following the system theme, light and dark. */
export function ThemeToggle() {
  const [choice, setChoice] = useState<ThemeChoice>(readTheme);
  const next =
    THEME_CHOICES[(THEME_CHOICES.indexOf(choice) + 1) % THEME_CHOICES.length] ?? 'system';
  return (
    <button
      type="button"
      className={styles.themeButton}
      aria-label={`Theme: ${LABELS[choice]}. Switch to ${LABELS[next]}.`}
      title={`Theme: ${LABELS[choice]}`}
      onClick={() => {
        applyTheme(next);
        setChoice(next);
      }}
    >
      <ThemeIcon choice={choice} />
      <span className={styles.themeText}>{LABELS[choice]}</span>
    </button>
  );
}

function ThemeIcon({ choice }: { choice: ThemeChoice }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: '0 0 16 16',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    'aria-hidden': true,
  } as const;
  if (choice === 'light') {
    return (
      <svg {...common}>
        <circle cx="8" cy="8" r="3" />
        <path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M3.4 12.6l1-1M11.6 4.4l1-1" />
      </svg>
    );
  }
  if (choice === 'dark') {
    return (
      <svg {...common}>
        <path d="M13 9.5A5.5 5.5 0 1 1 6.5 3a4.5 4.5 0 0 0 6.5 6.5Z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="8" cy="8" r="5.5" />
      <path d="M8 2.5v11" />
      <path d="M8 2.5a5.5 5.5 0 0 1 0 11Z" fill="currentColor" stroke="none" />
    </svg>
  );
}
