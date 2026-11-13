import { useSearchParams } from 'react-router-dom';

type Value = number | string;

/** Decimal places kept for numbers in the URL; enough for any value set by dragging. */
const DIGITS = 4;

/**
 * Page state stored in the URL's query string, so any configuration can be shared or
 * bookmarked. Each key falls back to its default when missing or malformed, and keys
 * equal to their default are left out to keep links short. Updates replace the
 * current history entry rather than adding one per drag step.
 *
 * `defaults` should be a module-level constant: its keys define the state's shape.
 */
export function useUrlState<T extends Record<string, Value>>(
  defaults: T,
): [T, (patch: Partial<T>) => void] {
  const [params, setParams] = useSearchParams();

  const state: Record<string, Value> = {};
  for (const [key, fallback] of Object.entries(defaults)) {
    state[key] = parse(params.get(key), fallback);
  }

  const update = (patch: Partial<T>) => {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        for (const [key, value] of Object.entries(patch)) {
          if (value === undefined || !(key in defaults)) continue;
          const text = format(value);
          if (text === format(defaults[key] as Value)) next.delete(key);
          else next.set(key, text);
        }
        return next;
      },
      { replace: true },
    );
  };

  return [state as T, update];
}

function parse(raw: string | null, fallback: Value): Value {
  if (raw === null) return fallback;
  if (typeof fallback === 'string') return raw;
  const value = Number(raw);
  return raw.trim() !== '' && Number.isFinite(value) ? value : fallback;
}

function format(value: Value): string {
  return typeof value === 'number' ? String(Number(value.toFixed(DIGITS))) : value;
}
