import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface LoadingStateProps {
  message?: string;
  className?: string;
  fullHeight?: boolean;
}

export function LoadingState({ message = 'Loading...', className, fullHeight = false }: LoadingStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8", fullHeight ? "min-h-[400px] h-full" : "", className)}>
      <div className="relative mb-4 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[var(--color-bhairav-primary)]/20 animate-spin absolute" />
        <Loader2 className="w-6 h-6 text-[var(--color-bhairav-primary)] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }} />
      </div>
      <p className="text-[10px] text-[var(--color-bhairav-text-muted)] uppercase tracking-widest font-bold">{message}</p>
    </div>
  );
}
