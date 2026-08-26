export function Footer() {
  return (
    <footer className="relative h-12 border-t border-[var(--color-bhairav-border)] bg-[var(--color-bhairav-surface)] flex items-center justify-center overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px bg-gradient-to-r from-transparent via-[var(--color-bhairav-accent)]/40 to-transparent" />

      <p className="text-[11px] sm:text-xs text-[var(--color-bhairav-text-muted)] font-medium tracking-[0.12em] select-none">
        <span className="text-[var(--color-bhairav-text)]/80">
          Bhairav: Shadows and Steel
        </span>
        <span className="mx-2 text-[var(--color-bhairav-text-muted)]/60">•</span>
        <span className="text-[var(--color-bhairav-text-muted)]/85">
          By OmeGamma
        </span>
      </p>
    </footer>
  );
}
