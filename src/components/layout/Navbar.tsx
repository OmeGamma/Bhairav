import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Mic, UserCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Navbar() {
  const [searchValue, setSearchValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus on Ctrl+K or Command+K or '/'
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="h-16 bg-[var(--color-bhairav-surface)] border-b border-[var(--color-bhairav-border)] flex items-center justify-between px-6 z-30">
      
      {/* Global Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative group flex items-center">
          <Search className="absolute left-3 text-[var(--color-bhairav-text-muted)] group-focus-within:text-[var(--color-bhairav-primary)] transition-colors z-10 pointer-events-none" size={18} />
          <input 
            ref={inputRef}
            type="text" 
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                setSearchValue('');
                inputRef.current?.blur(); // Blur on escape to exit search mode
              }
            }}
            placeholder="Search Bhairav..." 
            className="w-full bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-border)] text-sm rounded-md pl-10 pr-16 py-2 focus:outline-none focus:border-[var(--color-bhairav-primary)] focus:ring-1 focus:ring-[var(--color-bhairav-primary)]/50 transition-all text-[var(--color-bhairav-text)] placeholder-[var(--color-bhairav-text-muted)]"
          />
          {!searchValue ? (
            <div className="absolute right-3 text-[10px] font-mono text-[var(--color-bhairav-text-muted)] border border-[var(--color-bhairav-border)] bg-[var(--color-bhairav-surface)] px-1.5 py-0.5 rounded pointer-events-none">
              /
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setSearchValue('');
                inputRef.current?.focus();
              }}
              className="absolute right-3 text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-text)] transition-colors p-1"
              title="Clear search (Esc)"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 ml-4">
        <Link to="/notifications" className="p-2 text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-primary)] transition-colors relative" title="Notification Center">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-bhairav-critical)] rounded-full border border-[var(--color-bhairav-surface)]"></span>
        </Link>
        
        <Link to="/ask-bhairav" className="p-2 text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-primary)] transition-colors" title="Ask Bhairav">
          <Mic size={20} />
        </Link>
        
        <div className="h-8 w-px bg-[var(--color-bhairav-border)] mx-2"></div>
        
        <Link to="/profile" className="flex items-center gap-2 text-sm font-medium text-[var(--color-bhairav-text)] hover:text-[var(--color-bhairav-primary)] transition-colors">
          <UserCircle size={24} />
          <span className="text-xs uppercase tracking-widest font-bold">Officer</span>
        </Link>
      </div>
    </header>
  );
}

