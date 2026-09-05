import os

def main():
    src_dir = r"c:\Users\SHOBHIT\SIH\Bhairav\src"
    topnav_path = os.path.join(src_dir, "components/layout/TopNav.tsx")
    
    topnav_code = """import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, Mic, UserCircle, X, Menu, ChevronDown } from 'lucide-react';
import { BhairavIcon } from '../branding/BhairavIcon';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/cn';

const navItems = [
  { name: 'Command Centre', path: '/command-center' },
  { name: 'Security Intelligence', path: '/security/events' },
  { name: 'Document Verification', path: '/verification' },
  { name: 'Network Intelligence', path: '/network' },
  { name: 'Personnel Welfare', path: '/personnel' },
  { name: 'Maps & Analytics', path: '/security/map' },
  { name: 'AI Assistant', path: '/ask-bhairav' },
];

export function TopNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown & clear search on Escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
        if (document.activeElement === searchInputRef.current) {
          setSearchQuery('');
          searchInputRef.current?.blur();
        }
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-[var(--color-bhairav-slate)]/90 backdrop-blur-xl border-b border-[var(--color-bhairav-graphite)] z-50">
        <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-6 h-full">
            <Link to="/home" className="shrink-0 hover:opacity-80 transition-opacity pt-1">
              <BhairavIcon size={32} />
            </Link>
            
            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1 h-full">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium transition-all",
                      isActive
                        ? "text-[var(--color-bhairav-steel)] bg-[var(--color-bhairav-ink-blue)]/40"
                        : "text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-text)] hover:bg-[var(--color-bhairav-surface-hover)]"
                    )}
                  >
                    {item.name}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Right: Search + Actions */}
          <div className="flex items-center gap-2 sm:gap-3 h-full pt-1">
            {/* Global Search */}
            <div className="hidden md:flex relative items-center">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-bhairav-text-muted)]" size={16} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search Bhairav..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 lg:w-64 pl-9 pr-9 py-1.5 bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-graphite)] rounded-md text-sm focus:outline-none focus:border-[var(--color-bhairav-steel)] focus:ring-1 focus:ring-[var(--color-bhairav-steel)]/50 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-text)] transition-colors"
                  title="Clear search (Esc)"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Notifications */}
            <Link to="/notifications" className="p-2 text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-text)] transition-colors relative" title="Notifications">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-bhairav-critical)] rounded-full border-2 border-[var(--color-bhairav-slate)]" />
            </Link>

            {/* Dropdown Menu */}
            <div className="relative h-full flex items-center" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-md hover:bg-[var(--color-bhairav-surface-hover)] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--color-bhairav-ink-blue)] flex items-center justify-center text-[var(--color-bhairav-text)]">
                  <UserCircle size={18} />
                </div>
                <span className="hidden sm:block text-sm font-medium">{user?.name?.split(' ')[0] || 'Officer'}</span>
                <ChevronDown size={16} className={cn("transition-transform", dropdownOpen && "rotate-180")} />
              </button>

              {/* Dropdown Content */}
              {dropdownOpen && (
                <div className="absolute right-0 top-[60px] w-64 bg-[var(--color-bhairav-slate)] border border-[var(--color-bhairav-graphite)] rounded-lg shadow-2xl z-50">
                  {/* Main Navigation Items */}
                  <div className="p-2 space-y-1">
                    <NavLink to="/command-center" onClick={() => setDropdownOpen(false)} className={({ isActive }) => cn("block px-4 py-2.5 rounded-md text-sm font-medium transition-colors", isActive ? "bg-[var(--color-bhairav-ink-blue)]/40 text-[var(--color-bhairav-steel)]" : "text-[var(--color-bhairav-text)] hover:bg-[var(--color-bhairav-surface-hover)]")}>Command Centre</NavLink>
                    <NavLink to="/ask-bhairav" onClick={() => setDropdownOpen(false)} className={({ isActive }) => cn("block px-4 py-2.5 rounded-md text-sm font-medium transition-colors", isActive ? "bg-[var(--color-bhairav-ink-blue)]/40 text-[var(--color-bhairav-steel)]" : "text-[var(--color-bhairav-text)] hover:bg-[var(--color-bhairav-surface-hover)]")}>AI Assistant</NavLink>
                    <NavLink to="/personnel" onClick={() => setDropdownOpen(false)} className={({ isActive }) => cn("block px-4 py-2.5 rounded-md text-sm font-medium transition-colors", isActive ? "bg-[var(--color-bhairav-ink-blue)]/40 text-[var(--color-bhairav-steel)]" : "text-[var(--color-bhairav-text)] hover:bg-[var(--color-bhairav-surface-hover)]")}>Personnel Welfare</NavLink>
                    <NavLink to="/verification" onClick={() => setDropdownOpen(false)} className={({ isActive }) => cn("block px-4 py-2.5 rounded-md text-sm font-medium transition-colors", isActive ? "bg-[var(--color-bhairav-ink-blue)]/40 text-[var(--color-bhairav-steel)]" : "text-[var(--color-bhairav-text)] hover:bg-[var(--color-bhairav-surface-hover)]")}>Document Verification</NavLink>
                    <NavLink to="/security/events" onClick={() => setDropdownOpen(false)} className={({ isActive }) => cn("block px-4 py-2.5 rounded-md text-sm font-medium transition-colors", isActive ? "bg-[var(--color-bhairav-ink-blue)]/40 text-[var(--color-bhairav-steel)]" : "text-[var(--color-bhairav-text)] hover:bg-[var(--color-bhairav-surface-hover)]")}>Security Intelligence</NavLink>
                    <NavLink to="/security/map" onClick={() => setDropdownOpen(false)} className={({ isActive }) => cn("block px-4 py-2.5 rounded-md text-sm font-medium transition-colors", isActive ? "bg-[var(--color-bhairav-ink-blue)]/40 text-[var(--color-bhairav-steel)]" : "text-[var(--color-bhairav-text)] hover:bg-[var(--color-bhairav-surface-hover)]")}>Maps & Analytics</NavLink>
                  </div>

                  {/* Separator */}
                  <div className="h-px bg-[var(--color-bhairav-graphite)] my-1"></div>

                  {/* User Menu Items */}
                  <div className="p-2 space-y-1">
                    <NavLink to="/profile" onClick={() => setDropdownOpen(false)} className={({ isActive }) => cn("block px-4 py-2.5 rounded-md text-sm font-medium transition-colors", isActive ? "bg-[var(--color-bhairav-ink-blue)]/40 text-[var(--color-bhairav-steel)]" : "text-[var(--color-bhairav-text)] hover:bg-[var(--color-bhairav-surface-hover)]")}>Profile</NavLink>
                    <NavLink to="/settings" onClick={() => setDropdownOpen(false)} className="block px-4 py-2.5 rounded-md text-sm font-medium text-[var(--color-bhairav-text)] hover:bg-[var(--color-bhairav-surface-hover)] transition-colors">Settings</NavLink>
                    <button onClick={() => { logout(); setDropdownOpen(false); }} className="w-full text-left px-4 py-2.5 rounded-md text-sm font-medium text-[var(--color-bhairav-critical)] hover:bg-[var(--color-bhairav-critical)]/10 transition-colors">Logout</button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-[var(--color-bhairav-text-muted)] hover:text-white transition-colors"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="lg:hidden absolute top-16 left-0 right-0 bg-[var(--color-bhairav-slate)] border-b border-[var(--color-bhairav-graphite)] shadow-xl">
            <nav className="p-4 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "block px-4 py-3 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "text-[var(--color-bhairav-steel)] bg-[var(--color-bhairav-ink-blue)]/40"
                        : "text-[var(--color-bhairav-text-muted)] hover:text-white hover:bg-[var(--color-bhairav-surface-hover)]"
                    )}
                  >
                    {item.name}
                  </NavLink>
                );
              })}
              <div className="pt-3 border-t border-[var(--color-bhairav-graphite)] mt-3">
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-[var(--color-bhairav-critical)] hover:bg-[var(--color-bhairav-critical)]/10 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
"""
    with open(topnav_path, 'w', encoding='utf-8') as f:
        f.write(topnav_code)

if __name__ == "__main__":
    main()
