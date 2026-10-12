/**
 * The mark: a play triangle and a prompt chevron — the first glyph of each
 * craft. ▶ is what an editor presses; > is where an engineer types.
 */
export default function Mark({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path d="M3 3.5v17l9.2-8.5L3 3.5Z" fill="var(--color-edit)" />
      <path d="M13 4.5 20.5 12 13 19.5" stroke="var(--color-code)" strokeWidth="2.6" strokeLinecap="square" />
    </svg>
  );
}
