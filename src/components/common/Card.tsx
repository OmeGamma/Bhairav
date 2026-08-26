import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
}

export function Card({ children, className, title, action }: CardProps) {
  return (
    <div className={cn("bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] rounded-xl overflow-hidden shadow-md flex flex-col", className)}>
      {(title || action) && (
        <div className="px-5 py-4 border-b border-[var(--color-bhairav-border)] flex items-center justify-between bg-[var(--color-bhairav-surface)]/50">
          {title && <h3 className="font-semibold text-[var(--color-bhairav-text)]">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="flex-1 p-5">
        {children}
      </div>
    </div>
  );
}
