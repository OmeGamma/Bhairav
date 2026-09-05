import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../../utils/cn';

interface BackButtonProps {
  className?: string;
  onClick?: () => void;
}

export function BackButton({ className, onClick }: BackButtonProps) {
  const navigate = useNavigate();
  return (
    <div className={cn("mb-6 flex", className)}>
      <button 
        onClick={onClick || (() => navigate(-1))}
        className="flex items-center gap-2 text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-primary)] transition-all px-3 py-1.5 rounded-md hover:bg-[var(--color-bhairav-surface-hover)] group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium text-sm">Back</span>
      </button>
    </div>
  );
}
