import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../../utils/cn';

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
  onClick?: () => void;
}

export function BackButton({ to, label = 'Back', className, onClick }: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
      return;
    }
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-primary)] transition-colors mb-4",
        className,
      )}
    >
      <ArrowLeft size={14} /> {label}
    </button>
  );
}
