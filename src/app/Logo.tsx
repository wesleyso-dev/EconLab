/** EconLab's mark: a demand and a supply curve crossing at equilibrium. */
export function Logo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="0.5" y="0.5" width="23" height="23" rx="6" fill="var(--ink)" />
      <path d="M5 6l14 12" stroke="var(--demand)" strokeWidth="2.25" strokeLinecap="round" />
      <path d="M5 18L19 6" stroke="var(--supply)" strokeWidth="2.25" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2" fill="var(--surface)" />
    </svg>
  );
}
