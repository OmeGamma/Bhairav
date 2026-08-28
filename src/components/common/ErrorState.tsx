import { AlertOctagon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ title = 'Error', message, onRetry, className }: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center min-h-[300px]", className)}>
      <div className="w-16 h-16 rounded-full bg-[var(--color-bhairav-critical)]/10 border border-[var(--color-bhairav-critical)]/30 flex items-center justify-center mb-6 shadow-sm shadow-[var(--color-bhairav-critical)]/10">
        <AlertOctagon className="w-8 h-8 text-[var(--color-bhairav-critical)] animate-pulse" />
      </div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-bhairav-critical)] mb-2">{title}</h3>
      <p className="text-[10px] text-[var(--color-bhairav-text-muted)] uppercase font-mono tracking-widest max-w-md mb-6">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="bg-[var(--color-bhairav-surface)] hover:bg-[var(--color-bhairav-surface-hover)] border border-[var(--color-bhairav-border)] hover:border-[var(--color-bhairav-primary)] text-[var(--color-bhairav-text)] px-5 py-2.5 rounded-md transition-colors text-[10px] uppercase font-bold tracking-widest"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
