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
        "inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-text)] bg-transparent hover:bg-[var(--color-bhairav-surface-hover)] border border-transparent hover:border-[var(--color-bhairav-graphite)] rounded-md transition-all mb-4 focus:outline-none focus:ring-1 focus:ring-[var(--color-bhairav-steel)]",
        className
      )}
    >
      <ArrowLeft size={16} />
      {label}
    </button>
  );
}
