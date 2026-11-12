const formatters = new Map<number, Intl.NumberFormat>();

/** Formats a value for display: up to `maxDigits` decimals, trailing zeros trimmed. */
export function formatNumber(value: number, maxDigits = 2): string {
  if (value === Infinity) return '∞';
  if (value === -Infinity) return '−∞';
  if (Number.isNaN(value)) return '—';
  let formatter = formatters.get(maxDigits);
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: maxDigits });
    formatters.set(maxDigits, formatter);
  }
  // Avoid displaying "-0" for tiny negative rounding noise.
  const text = formatter.format(value);
  return text === '-0' ? '0' : text.replace('-', '−');
}
