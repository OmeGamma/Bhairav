import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, Mic, UserCircle, X, Menu, Settings, LogOut, Shield, Map, Eye, Search as SearchIcon, HeartPulse, BrainCircuit, Activity } from 'lucide-react';
import { BhairavIcon } from '../branding/BhairavIcon';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/cn';

export function TopNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // Close dropdown on navigation
  useEffect(() => {
    setDropdownOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/intelligence/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const menuItems = [
    { name: 'Command Centre', path: '/command-center', icon: Activity },
    { name: 'AI Assistant', path: '/ask-bhairav', icon: BrainCircuit },
    { name: 'Personnel Welfare', path: '/personnel', icon: HeartPulse },
    { name: 'Document Verification', path: '/verification', icon: Eye },
    { name: 'Security Intelligence', path: '/intelligence/events', icon: Shield },
    { name: 'Maps & Analytics', path: '/security/map', icon: Map },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-[var(--color-bhairav-slate)]/95 backdrop-blur-xl border-b border-[var(--color-bhairav-graphite)] z-50">
        <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
          
          {/* Left: Logo */}
          <div className="flex items-center gap-6">
            <Link to="/home" className="shrink-0 flex items-center gap-3 group">
              <div className="group-hover:scale-105 transition-transform">
                <BhairavIcon size={32} />
              </div>
              <span className="hidden sm:block text-lg font-bold tracking-widest text-[var(--color-bhairav-text)] group-hover:text-white transition-colors">BHAIRAV</span>
            </Link>
          </div>

          {/* Search + Actions */}
          <div className="flex items-center gap-2 md:gap-4 flex-1 justify-end">
            
            {/* Global Search */}
            {user && (
              <form onSubmit={handleSearchSubmit} className="hidden md:flex relative max-w-md w-full lg:w-80 ml-auto mr-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-bhairav-text-muted)]" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Global Search..."
                  className="w-full pl-9 pr-8 py-1.5 bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-graphite)] rounded-md text-sm focus:outline-none focus:border-[var(--color-bhairav-steel)] focus:ring-1 focus:ring-[var(--color-bhairav-steel)]/50 transition-all text-[var(--color-bhairav-text)] placeholder-[var(--color-bhairav-text-muted)]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-bhairav-text-muted)] hover:text-white transition-colors p-1"
                  >
                    <X size={14} />
                  </button>
                )}
              </form>
            )}

            {user ? (
              <>
                <Link to="/ask-bhairav" className="p-2 text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-text)] transition-colors bg-[var(--color-bhairav-surface)] hover:bg-[var(--color-bhairav-surface-hover)] border border-[var(--color-bhairav-graphite)] rounded-md hidden sm:block" title="AI Assistant">
                  <Mic size={18} />
                </Link>

                <Link to="/notifications" className="p-2 text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-text)] transition-colors relative" title="Notifications">
                  <Bell size={20} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-bhairav-critical)] rounded-full border-2 border-[var(--color-bhairav-slate)]" />
                </Link>

                {/* Profile / Menu Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-md hover:bg-[var(--color-bhairav-surface-hover)] transition-colors border border-transparent hover:border-[var(--color-bhairav-graphite)] focus:outline-none focus:ring-1 focus:ring-[var(--color-bhairav-steel)]"
                  >
                    <div className="w-8 h-8 rounded-full bg-[var(--color-bhairav-ink-blue)] flex items-center justify-center text-white">
                      <UserCircle size={18} />
                    </div>
                    <span className="hidden sm:block text-sm font-medium">{user.name?.split(' ')[0] || 'Officer'}</span>
                  </button>

                  {/* Dropdown Content */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-[var(--color-bhairav-border)] bg-[var(--color-bhairav-bg)]/50">
                        <p className="text-sm font-medium text-white">{user.name || 'Bhairav Officer'}</p>
                        <p className="text-xs text-[var(--color-bhairav-text-muted)] truncate">{user.email || 'officer@defence.gov'}</p>
                      </div>
                      
                      <div className="p-2">
                        {menuItems.map((item, idx) => (
                          <Link 
                            key={idx} 
                            to={item.path}
                            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[var(--color-bhairav-text)] hover:text-white hover:bg-[var(--color-bhairav-bg)] transition-colors group"
                          >
                            <item.icon size={16} className="text-[var(--color-bhairav-text-muted)] group-hover:text-[var(--color-bhairav-primary)]" />
                            {item.name}
                          </Link>
                        ))}
                      </div>
                      
                      <div className="border-t border-[var(--color-bhairav-border)] p-2">
                        <Link to="/profile" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[var(--color-bhairav-text)] hover:text-white hover:bg-[var(--color-bhairav-bg)] transition-colors group">
                          <UserCircle size={16} className="text-[var(--color-bhairav-text-muted)] group-hover:text-white" />
                          Profile
                        </Link>
                        <Link to="/settings" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[var(--color-bhairav-text)] hover:text-white hover:bg-[var(--color-bhairav-bg)] transition-colors group">
                          <Settings size={16} className="text-[var(--color-bhairav-text-muted)] group-hover:text-white" />
                          Settings
                        </Link>
                        <button 
                          onClick={() => {
                            setDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[var(--color-bhairav-critical)] hover:bg-[var(--color-bhairav-critical)]/10 transition-colors mt-1"
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-[var(--color-bhairav-text-muted)] hover:text-white transition-colors">
                  Login
                </Link>
                <Link to="/register" className="bg-[var(--color-bhairav-primary)] hover:bg-[var(--color-bhairav-primary-hover)] text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="sm:hidden p-2 text-[var(--color-bhairav-text-muted)] hover:text-white transition-colors"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="sm:hidden absolute top-16 left-0 right-0 bg-[var(--color-bhairav-slate)] border-b border-[var(--color-bhairav-graphite)] shadow-xl animate-in slide-in-from-top-2">
            <div className="p-4">
              {user && (
                <form onSubmit={handleSearchSubmit} className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-bhairav-text-muted)]" size={16} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Bhairav..."
                    className="w-full pl-9 pr-8 py-2 bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-graphite)] rounded-md text-sm focus:outline-none focus:border-[var(--color-bhairav-steel)]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-bhairav-text-muted)] hover:text-white p-1"
                    >
                      <X size={14} />
                    </button>
                  )}
                </form>
              )}
              
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "text-[var(--color-bhairav-steel)] bg-[var(--color-bhairav-ink-blue)]/40"
                        : "text-[var(--color-bhairav-text-muted)] hover:text-white hover:bg-[var(--color-bhairav-surface-hover)]"
                    )}
                  >
                    <item.icon size={18} />
                    {item.name}
                  </NavLink>
                ))}
                
                {user && (
                  <div className="pt-3 border-t border-[var(--color-bhairav-graphite)] mt-3 space-y-1">
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[var(--color-bhairav-text-muted)] hover:text-white hover:bg-[var(--color-bhairav-surface-hover)]">
                      <UserCircle size={18} /> Profile
                    </Link>
                    <button
                      onClick={() => logout()}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[var(--color-bhairav-critical)] hover:bg-[var(--color-bhairav-critical)]/10 transition-colors"
                    >
                      <LogOut size={18} /> Sign Out
                    </button>
                  </div>
                )}
              </nav>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
