import { useState, useRef } from 'react';
import { Search, Bell, Mic, UserCircle, X, Menu, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Navbar() {
  const [searchValue, setSearchValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <header className="h-16 bg-[var(--color-bhairav-surface)]/80 backdrop-blur-xl border-b border-[var(--color-bhairav-border)] flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative shrink-0">
            <Shield className="text-[var(--color-bhairav-primary)] group-hover:scale-105 transition-transform" size={28} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[var(--color-bhairav-verified)] rounded-full animate-pulse" />
          </div>
          <span className="text-lg font-bold tracking-[0.2em] text-white">BHAIRAV</span>
        </Link>
      </div>

      <div className="hidden md:flex flex-1 max-w-xl mx-8">
        <div className="relative group w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-bhairav-text-muted)] group-focus-within:text-[var(--color-bhairav-primary)] transition-colors" size={18} />
          <input
            ref={inputRef}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setSearchValue('');
                inputRef.current?.focus();
              }
            }}
            placeholder="Search anything in Bhairav..."
            className="w-full bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-border)] text-sm rounded-lg pl-10 pr-9 py-2 focus:outline-none focus:border-[var(--color-bhairav-primary)] focus:ring-1 focus:ring-[var(--color-bhairav-primary)] transition-all"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => {
                setSearchValue('');
                inputRef.current?.focus();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-text)] transition-colors"
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-3">
        <Link to="/notifications" className="p-2 text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-primary)] transition-colors relative" title="Notification Center">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-bhairav-critical)] rounded-full border-2 border-[var(--color-bhairav-surface)]"></span>
        </Link>
        
        <Link to="/ask-bhairav" className="p-2 text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-primary)] transition-colors" title="Ask Bhairav">
          <Mic size={20} />
        </Link>
        
        <div className="h-8 w-px bg-[var(--color-bhairav-border)] mx-1 sm:mx-2"></div>
        
        <Link to="/profile" className="flex items-center gap-2 text-sm font-medium text-[var(--color-bhairav-text)] hover:text-[var(--color-bhairav-primary)] transition-colors px-2 py-1.5 rounded-lg hover:bg-[var(--color-bhairav-surface-hover)]">
          <UserCircle size={22} />
          <span className="hidden sm:inline">Officer</span>
        </Link>
      </div>
    </header>
  );
}
