import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface PageShellProps {
  children: ReactNode;
  className?: string;
  /** Use 'wide' for graph/map-heavy pages that benefit from a wider container. */
  width?: 'default' | 'wide' | 'full';
}

const WIDTH: Record<NonNullable<PageShellProps['width']>, string> = {
  default: 'max-w-[1400px]',
  wide: 'max-w-[1600px]',
  full: 'max-w-none',
};

export function PageShell({ children, className, width = 'default' }: PageShellProps) {
  return (
    <div className={cn('w-full mx-auto px-4 sm:px-6 lg:px-8 py-8', WIDTH[width], className)}>
      {children}
    </div>
  );
}

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-[var(--color-bhairav-border)] pb-4 mb-6">
      <div>
        {eyebrow && (
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[var(--color-bhairav-primary)] mb-1.5">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[var(--color-bhairav-text)]">{title}</h1>
        {description && (
          <p className="text-sm text-[var(--color-bhairav-text-muted)] mt-1.5 max-w-2xl">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}
