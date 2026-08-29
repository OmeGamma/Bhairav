import type { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center min-h-[300px]", className)}>
      <div className="w-16 h-16 rounded-full bg-[var(--color-bhairav-surface-hover)] border border-[var(--color-bhairav-border)] flex items-center justify-center mb-6 shadow-sm">
        <Icon className="w-8 h-8 text-[var(--color-bhairav-text-muted)] opacity-50" />
      </div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-bhairav-text)] mb-2">{title}</h3>
      <p className="text-[10px] text-[var(--color-bhairav-text-muted)] uppercase tracking-widest font-mono max-w-md mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
