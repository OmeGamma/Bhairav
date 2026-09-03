import { AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface DemoBannerProps {
  className?: string;
  message?: string;
}

export function DemoBanner({ className, message = 'Demo Mode — Data is simulated for prototype demonstration.' }: DemoBannerProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-2 bg-[var(--color-bhairav-ochre)]/10 border-b border-[var(--color-bhairav-ochre)]/30 text-[var(--color-bhairav-ochre)] text-xs font-mono uppercase tracking-widest',
        className
      )}
      role="status"
      aria-label="Demo mode notification"
    >
      <AlertTriangle size={14} className="shrink-0" />
      <span className="font-bold">Demo Mode</span>
      <span className="opacity-80">— {message}</span>
    </div>
  );
}
