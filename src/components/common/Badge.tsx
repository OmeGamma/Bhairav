import { cn } from '../../utils/cn';
import type { SecurityStatus } from '../../types';

interface BadgeProps {
  status: SecurityStatus;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export function Badge({ status, children, className, dot = true }: BadgeProps) {
  const statusConfig = {
    critical: "bg-[var(--color-bhairav-critical)]/10 text-[var(--color-bhairav-critical)] border-[var(--color-bhairav-critical)]/20",
    warning: "bg-[var(--color-bhairav-warning)]/10 text-[var(--color-bhairav-warning)] border-[var(--color-bhairav-warning)]/20",
    verified: "bg-[var(--color-bhairav-verified)]/10 text-[var(--color-bhairav-verified)] border-[var(--color-bhairav-verified)]/20",
    neutral: "bg-[var(--color-bhairav-neutral)]/10 text-[var(--color-bhairav-text-muted)] border-[var(--color-bhairav-border)]",
    info: "bg-[var(--color-bhairav-primary)]/10 text-[var(--color-bhairav-primary)] border-[var(--color-bhairav-primary)]/20",
  };

  const dotConfig = {
    critical: "bg-[var(--color-bhairav-critical)]",
    warning: "bg-[var(--color-bhairav-warning)]",
    verified: "bg-[var(--color-bhairav-verified)]",
    neutral: "bg-[var(--color-bhairav-neutral)]",
    info: "bg-[var(--color-bhairav-primary)]",
  };

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border", statusConfig[status], className)}>
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full", dotConfig[status])}></span>}
      {children}
    </span>
  );
}
