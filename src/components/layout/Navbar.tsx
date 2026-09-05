import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Shield, Search, Sun, Moon, ChevronDown, Sparkles,
  Network, Eye, Camera, FileSearch, HeartPulse, Bell, AlertTriangle,
  LogOut, User, Map, Activity, Menu, X, Command
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../utils/cn';

interface FeatureItem {
  title: string;
  description: string;
  to: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
}

interface FeatureGroup {
  label: string;
  items: FeatureItem[];
}

const FEATURE_GROUPS: FeatureGroup[] = [
  {
    label: 'Video Intelligence (IBVAP)',
    items: [
      { title: 'Security Map', description: 'Geospatial view of cameras, events, and zones', to: '/security/map', icon: Map },
      { title: 'Live Monitoring', description: 'Camera grid, PTZ, and event overlays', to: '/security/monitoring', icon: Camera },
      { title: 'Security Events', description: 'Real-time event feed and incident triage', to: '/intelligence/events', icon: AlertTriangle },
      { title: 'Attention Center', description: 'High-priority alerts and follow-ups', to: '/attention', icon: Bell },
    ],
  },
  {
    label: 'Criminal Network Analysis',
    items: [
      { title: 'Network Intelligence', description: 'Graph-based entity relationship analysis', to: '/network', icon: Network },
      { title: 'Document Verification', description: 'AI-assisted document authenticity', to: '/verification', icon: FileSearch },
      { title: 'Identity History', description: 'Past verifications and reviews', to: '/verification/history', icon: Eye, badge: 'New' },
    ],
  },
  {
    label: 'Personnel & Operations',
    items: [
      { title: 'Personnel Welfare', description: 'Readiness, fatigue, and welfare check-ins', to: '/personnel', icon: HeartPulse },
      { title: 'Evidence & Files', description: 'Intelligence documents, datasets, media and evidence', to: '/evidence', icon: FileSearch },
      { title: 'Investigations', description: 'Manage investigations and linked evidence', to: '/cases', icon: Shield },
      { title: 'Reports', description: 'Generate and review intelligence reports', to: '/reports', icon: FileSearch },
      { title: 'Tasks', description: 'Assigned tasks and operational follow-ups', to: '/tasks', icon: Activity, badge: 'New' },
      { title: 'Notifications', description: 'System and event notifications', to: '/notifications', icon: Bell },
    ],
  },
];

const PRIMARY_LINKS = [
  { to: '/command-center', label: 'Command Center' },
];

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [megaOpen, setMegaOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const megaRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (megaRef.current && !megaRef.current.contains(t)) setMegaOpen(false);
      if (userRef.current && !userRef.current.contains(t)) setUserMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMegaOpen(false);
        setUserMenuOpen(false);
        setSearchOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // Cmd/Ctrl-K to open search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchRef.current?.focus(), 0);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Close mobile on route change
  useEffect(() => {
    setMobileOpen(false);
    setMegaOpen(false);
    setUserMenuOpen(false);
  }, [navigate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/intelligence/search?q=${encodeURIComponent(searchValue.trim())}`);
      setSearchOpen(false);
      setSearchValue('');
    }
  };

  return (
    <header className="sticky top-0 z-[1000]">
      <div className="glass border-b border-[var(--color-bhairav-glass-border)]">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-3">

          {/* LEFT: brand + primary nav */}
          <div className="flex items-center gap-6 min-w-0">
            <Link
              to={isAuthenticated ? '/command-center' : '/'}
              className="flex items-center gap-2.5 group shrink-0"
              aria-label="Bhairav home"
            >
              <div className="relative">
                <Shield className="text-[var(--color-bhairav-primary)] group-hover:scale-105 transition-transform" size={28} />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[var(--color-bhairav-verified)] rounded-full animate-pulse" />
              </div>
              <span className="text-lg font-extrabold tracking-[0.2em] text-[var(--color-bhairav-text)] hidden sm:inline">
                BHAIRAV
              </span>
            </Link>

            {/* Desktop primary nav */}
            {isAuthenticated && (
              <nav className="hidden lg:flex items-center gap-1">
                {PRIMARY_LINKS.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    className={({ isActive }) =>
                      cn(
                        'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'text-[var(--color-bhairav-primary)] bg-[var(--color-bhairav-primary-soft)]'
                          : 'text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-text)] hover:bg-[var(--color-bhairav-surface-hover)]',
                      )
                    }
                  >
                    {l.label}
                  </NavLink>
                ))}

                {/* Features mega-menu trigger */}
                <div className="relative" ref={megaRef}>
                  <button
                    onClick={() => setMegaOpen((o) => !o)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      megaOpen
                        ? 'text-[var(--color-bhairav-primary)] bg-[var(--color-bhairav-primary-soft)]'
                        : 'text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-text)] hover:bg-[var(--color-bhairav-surface-hover)]',
                    )}
                    aria-expanded={megaOpen}
                    aria-haspopup="true"
                  >
                    Features
                    <ChevronDown size={14} className={cn('transition-transform', megaOpen && 'rotate-180')} />
                  </button>

                  {megaOpen && (
                    <div className="absolute left-0 mt-2 w-[min(96vw,900px)] glass-sm p-5 animate-slide-down origin-top-left z-[60]">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {FEATURE_GROUPS.map((group) => (
                          <div key={group.label}>
                            <h4 className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-bhairav-text-muted)] mb-3">
                              {group.label}
                            </h4>
                            <div className="space-y-1">
                              {group.items.map((item) => (
                                <Link
                                  key={item.to}
                                  to={item.to}
                                  onClick={() => setMegaOpen(false)}
                                  className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[var(--color-bhairav-surface-hover)] transition-colors group"
                                >
                                  <div className="shrink-0 w-9 h-9 rounded-md bg-[var(--color-bhairav-primary-soft)] flex items-center justify-center text-[var(--color-bhairav-primary)] group-hover:scale-105 transition-transform">
                                    <item.icon size={18} />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-semibold text-[var(--color-bhairav-text)] truncate">
                                        {item.title}
                                      </p>
                                      {item.badge && (
                                        <span className="text-[9px] uppercase tracking-widest font-bold text-[var(--color-bhairav-primary)] bg-[var(--color-bhairav-primary-soft)] px-1.5 py-0.5 rounded">
                                          {item.badge}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-[var(--color-bhairav-text-muted)] mt-0.5 line-clamp-2">
                                      {item.description}
                                    </p>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-[var(--color-bhairav-border)] mt-4 pt-3 flex items-center justify-between text-xs">
                        <span className="text-[var(--color-bhairav-text-muted)]">
                          Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-bhairav-surface-hover)] border border-[var(--color-bhairav-border)] font-mono">Esc</kbd> to close
                        </span>
                        <Link
                          to="/ask-bhairav"
                          onClick={() => setMegaOpen(false)}
                          className="flex items-center gap-1.5 text-[var(--color-bhairav-primary)] hover:underline font-medium"
                        >
                          <Sparkles size={14} /> Ask BHAIRAV
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <NavLink
                  to="/ask-bhairav"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'text-[var(--color-bhairav-primary)] bg-[var(--color-bhairav-primary-soft)]'
                        : 'text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-text)] hover:bg-[var(--color-bhairav-surface-hover)]',
                    )
                  }
                >
                  <Sparkles size={14} />
                  AI Assistant
                </NavLink>
              </nav>
            )}
          </div>

          {/* RIGHT: search / theme / user / mobile */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">

            {/* Search */}
            {isAuthenticated && (
              <>
                <button
                  onClick={() => {
                    setSearchOpen((o) => !o);
                    setTimeout(() => searchRef.current?.focus(), 0);
                  }}
                  className="p-2 rounded-lg text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-text)] hover:bg-[var(--color-bhairav-surface-hover)] transition-colors"
                  title="Search (Ctrl+K)"
                  aria-label="Open search"
                >
                  <Search size={18} />
                </button>

                {searchOpen && (
                  <div className="absolute top-16 left-0 right-0 px-4 pb-3 animate-slide-down z-40">
                    <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto glass p-1.5 flex items-center gap-2">
                      <Search size={18} className="ml-3 text-[var(--color-bhairav-text-muted)] shrink-0" />
                      <input
                        ref={searchRef}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        placeholder="Search events, persons, vehicles, locations…"
                        className="flex-1 bg-transparent outline-none text-sm py-2 placeholder:text-[var(--color-bhairav-text-muted)] text-[var(--color-bhairav-text)]"
                      />
                      <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] text-[var(--color-bhairav-text-muted)] border border-[var(--color-bhairav-border)] bg-[var(--color-bhairav-surface)] px-1.5 py-0.5 rounded font-mono">
                        <Command size={10} />K
                      </kbd>
                    </form>
                  </div>
                )}
              </>
            )}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-text)] hover:bg-[var(--color-bhairav-surface-hover)] transition-colors"
              title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* User menu / login */}
            {isAuthenticated ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[var(--color-bhairav-surface-hover)] transition-colors"
                  aria-expanded={userMenuOpen}
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--color-bhairav-primary-soft)] flex items-center justify-center text-[var(--color-bhairav-primary)] font-semibold text-xs">
                    {(user?.name || 'O').charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline text-xs font-medium text-[var(--color-bhairav-text)]">
                    {user?.name?.split(' ')[0] || 'Officer'}
                  </span>
                  <ChevronDown size={14} className={cn('hidden md:inline text-[var(--color-bhairav-text-muted)] transition-transform', userMenuOpen && 'rotate-180')} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 glass-sm p-2 animate-slide-down z-[60]">
                    <div className="px-3 py-2.5 mb-1 rounded-md bg-[var(--color-bhairav-surface)]/40">
                      <p className="text-sm font-semibold text-[var(--color-bhairav-text)] truncate">
                        {user?.name || 'Officer'}
                      </p>
                      <p className="text-[10px] text-[var(--color-bhairav-text-muted)] truncate font-mono">
                        {user?.email || '—'}
                      </p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-[var(--color-bhairav-text)] hover:bg-[var(--color-bhairav-surface-hover)] transition-colors"
                    >
                      <User size={15} /> Profile
                    </Link>
                    <Link
                      to="/notifications"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-[var(--color-bhairav-text)] hover:bg-[var(--color-bhairav-surface-hover)] transition-colors"
                    >
                      <Bell size={15} /> Notifications
                    </Link>
                    <div className="my-1 border-t border-[var(--color-bhairav-border)]" />
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-[var(--color-bhairav-critical)] hover:bg-[var(--color-bhairav-critical)]/10 transition-colors"
                    >
                      <LogOut size={15} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-sm font-medium text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-text)] transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-sm font-semibold rounded-lg text-white bg-[var(--color-bhairav-primary)] hover:bg-[var(--color-bhairav-primary-hover)] transition-colors shadow-sm"
                >
                  Get access
                </Link>
              </div>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="lg:hidden p-2 rounded-lg text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-text)] hover:bg-[var(--color-bhairav-surface-hover)] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-[var(--color-bhairav-border)] max-h-[calc(100vh-4rem)] overflow-y-auto scrollbar-themed z-50">
            <div className="px-4 py-3 space-y-1">
              {isAuthenticated ? (
                <>
                  {PRIMARY_LINKS.map((l) => (
                    <NavLink
                      key={l.to}
                      to={l.to}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors',
                          isActive
                            ? 'text-[var(--color-bhairav-primary)] bg-[var(--color-bhairav-primary-soft)]'
                            : 'text-[var(--color-bhairav-text)] hover:bg-[var(--color-bhairav-surface-hover)]',
                        )
                      }
                    >
                      <Activity size={16} /> {l.label}
                    </NavLink>
                  ))}
                  <NavLink
                    to="/ask-bhairav"
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'text-[var(--color-bhairav-primary)] bg-[var(--color-bhairav-primary-soft)]'
                          : 'text-[var(--color-bhairav-text)] hover:bg-[var(--color-bhairav-surface-hover)]',
                      )
                    }
                  >
                    <Sparkles size={16} /> AI Assistant
                  </NavLink>
                  {FEATURE_GROUPS.map((g) => (
                    <div key={g.label} className="pt-3 mt-2 border-t border-[var(--color-bhairav-border)] first:border-t-0 first:pt-0 first:mt-0">
                      <p className="px-3 text-[10px] uppercase tracking-widest font-bold text-[var(--color-bhairav-text-muted)] mb-1.5">
                        {g.label}
                      </p>
                      {g.items.map((item) => (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          className={({ isActive }) =>
                            cn(
                              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                              isActive
                                ? 'text-[var(--color-bhairav-primary)] bg-[var(--color-bhairav-primary-soft)]'
                                : 'text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-text)] hover:bg-[var(--color-bhairav-surface-hover)]',
                            )
                          }
                        >
                          <item.icon size={15} /> {item.title}
                        </NavLink>
                      ))}
                    </div>
                  ))}
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to="/login" className="px-3 py-2.5 text-sm font-medium rounded-lg text-[var(--color-bhairav-text)] hover:bg-[var(--color-bhairav-surface-hover)]">
                    Sign in
                  </Link>
                  <Link to="/register" className="px-3 py-2.5 text-sm font-semibold rounded-lg text-white bg-[var(--color-bhairav-primary)]">
                    Get access
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
