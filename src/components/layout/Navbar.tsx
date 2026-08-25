import { Search, Bell, Mic, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Navbar() {
  return (
    <header className="h-16 bg-[var(--color-bhairav-surface)] border-b border-[var(--color-bhairav-border)] flex items-center justify-between px-6">
      
      {/* Global Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-bhairav-text-muted)] group-focus-within:text-[var(--color-bhairav-primary)] transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search anything in Bhairav..." 
            className="w-full bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-border)] text-sm rounded-md pl-10 pr-4 py-2 focus:outline-none focus:border-[var(--color-bhairav-primary)] focus:ring-1 focus:ring-[var(--color-bhairav-primary)] transition-all"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 ml-4">
        <button className="p-2 text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-primary)] transition-colors relative" title="Attention Center">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-bhairav-critical)] rounded-full border border-[var(--color-bhairav-surface)]"></span>
        </button>
        
        <Link to="/ask-bhairav" className="p-2 text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-primary)] transition-colors" title="Ask Bhairav">
          <Mic size={20} />
        </Link>
        
        <div className="h-8 w-px bg-[var(--color-bhairav-border)] mx-2"></div>
        
        <button className="flex items-center gap-2 text-sm font-medium text-[var(--color-bhairav-text)] hover:text-[var(--color-bhairav-primary)] transition-colors">
          <UserCircle size={24} />
          <span>Officer</span>
        </button>
      </div>
    </header>
  );
}
