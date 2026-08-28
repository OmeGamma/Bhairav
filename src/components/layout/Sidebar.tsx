import { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldAlert,
  Search,
  Bell,
  Map,
  Video,
  Users,
  ShieldQuestion,
  FileText,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Shield
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { name: 'Command Center', path: '/command-center', icon: LayoutDashboard },
  { name: 'Security Events', path: '/intelligence/events', icon: ShieldAlert },
  { name: 'Security Monitoring', path: '/security/monitoring', icon: Video },
  { name: 'Security Map', path: '/security/map', icon: Map },
  { name: 'Verification', path: '/verification', icon: Users },
  { name: 'Attention', path: '/attention', icon: Bell },
  { name: 'Ask Bhairav', path: '/ask-bhairav', icon: ShieldQuestion },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();

  const SidebarContent = () => (
    <>
      <div className="h-16 flex items-center px-4 border-b border-[var(--color-bhairav-border)]">
        <div className={cn("flex items-center gap-2.5 overflow-hidden", collapsed && "justify-center")}>
          <div className="relative shrink-0">
            <Shield className="text-[var(--color-bhairav-primary)]" size={collapsed ? 28 : 32} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[var(--color-bhairav-verified)] rounded-full animate-pulse" />
          </div>
          {!collapsed && <span className="text-xl font-bold tracking-widest text-white">BHAIRAV</span>}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-[var(--color-bhairav-primary)]/15 text-[var(--color-bhairav-primary)] shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                  : "text-[var(--color-bhairav-text-muted)] hover:bg-[var(--color-bhairav-surface-hover)] hover:text-[var(--color-bhairav-text)]"
              )}
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[var(--color-bhairav-border)]">
        <button
          onClick={logout}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-[var(--color-bhairav-critical)] hover:bg-[var(--color-bhairav-critical)]/10",
            collapsed && "justify-center"
          )}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-[var(--color-bhairav-surface)] border-r border-[var(--color-bhairav-border)] h-full transition-all duration-300",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] rounded-full flex items-center justify-center text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-primary)] transition-colors z-50 shadow-lg"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[var(--color-bhairav-surface)]/95 backdrop-blur-xl border-b border-[var(--color-bhairav-border)] z-40 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="relative shrink-0">
            <Shield className="text-[var(--color-bhairav-primary)]" size={28} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[var(--color-bhairav-verified)] rounded-full animate-pulse" />
          </div>
          <span className="text-base font-bold tracking-[0.15em] text-white">BHAIRAV</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-[var(--color-bhairav-text-muted)] hover:text-white transition-colors"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-[var(--color-bhairav-surface)] border-r border-[var(--color-bhairav-border)] z-50 transform transition-transform duration-300">
            <SidebarContent />
          </div>
        </>
      )}
    </>
  );
}
