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
      <Loader2 className="w-8 h-8 text-[var(--color-bhairav-primary)] animate-spin mb-4" />
      <p className="text-[var(--color-bhairav-text-muted)] text-sm">{message}</p>
    </div>
  );
}
