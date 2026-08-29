import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Search, Bell, Mic, UserCircle, X, Menu } from 'lucide-react';
import { BhairavIcon } from '../branding/BhairavIcon';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/cn';

const navItems = [
  { name: 'Command Center', path: '/command-center' },
  { name: 'Security', path: '/security' },
  { name: 'Verification', path: '/verification' },
  { name: 'Network', path: '/network' },
  { name: 'Tasks', path: '/tasks' },
  { name: 'Personnel', path: '/personnel' },
  { name: 'Ask Bhairav', path: '/ask-bhairav' },
];

export function TopNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-[var(--color-bhairav-slate)]/90 backdrop-blur-xl border-b border-[var(--color-bhairav-graphite)] z-50">
        <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-6">
            <Link to="/command-center" className="shrink-0">
              <BhairavIcon size={32} />
            </Link>
            
            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
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
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Global Search */}
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-bhairav-text-muted)]" size={16} />
              <input
                type="text"
                placeholder="Search Bhairav..."
                className="w-48 lg:w-64 pl-9 pr-4 py-1.5 bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-graphite)] rounded-md text-sm focus:outline-none focus:border-[var(--color-bhairav-steel)] focus:ring-1 focus:ring-[var(--color-bhairav-steel)]/50 transition-all"
              />
            </div>

            {/* Notifications */}
            <Link to="/notifications" className="p-2 text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-text)] transition-colors relative" title="Notifications">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-bhairav-critical)] rounded-full border-2 border-[var(--color-bhairav-slate)]" />
            </Link>

            {/* Ask Bhairav */}
            <Link to="/ask-bhairav" className="p-2 text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-text)] transition-colors" title="Ask Bhairav">
              <Mic size={20} />
            </Link>

            {/* Profile */}
            <Link to="/profile" className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-md hover:bg-[var(--color-bhairav-surface-hover)] transition-colors">
              <div className="w-8 h-8 rounded-full bg-[var(--color-bhairav-ink-blue)] flex items-center justify-center text-[var(--color-bhairav-text)]">
                <UserCircle size={18} />
              </div>
              <span className="hidden sm:block text-sm font-medium">{user?.name?.split(' ')[0] || 'Officer'}</span>
            </Link>

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
