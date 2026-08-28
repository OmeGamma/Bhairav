import { NavLink } from 'react-router-dom';
import { 
  ShieldAlert, LayoutDashboard, Search, Bell, Map, 
  Video, Users, FileText, Settings, ShieldQuestion, LogOut
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { name: 'Command Center', path: '/command-center', icon: LayoutDashboard },
  { name: 'Intelligence Search', path: '/intelligence/search', icon: Search },
  { name: 'Security Events', path: '/intelligence/events', icon: ShieldAlert },
  { name: 'Security Monitoring', path: '/security/monitoring', icon: Video },
  { name: 'Security Map', path: '/security/map', icon: Map },
  { name: 'Verification', path: '/verification', icon: Users },
  { name: 'Attention Center', path: '/attention', icon: Bell },
  { name: 'Ask Bhairav', path: '/ask-bhairav', icon: ShieldQuestion },
  { name: 'Reports', path: '/reports', icon: FileText },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export function Sidebar() {
  const { logout } = useAuth();
  return (
    <aside className="w-64 bg-[var(--color-bhairav-surface)] border-r border-[var(--color-bhairav-border)] h-full flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-[var(--color-bhairav-border)]">
        <h1 className="text-xl font-bold tracking-wider text-[var(--color-bhairav-text)] flex items-center gap-2">
          <ShieldAlert className="text-[var(--color-bhairav-primary)]" size={24} />
          BHAIRAV
        </h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-r-md text-sm font-medium transition-colors border-l-[3px]",
                isActive 
                  ? "border-[var(--color-bhairav-primary)] bg-[var(--color-bhairav-primary)]/10 text-[var(--color-bhairav-text)]" 
                  : "border-transparent text-[var(--color-bhairav-text-muted)] hover:bg-[var(--color-bhairav-surface-hover)] hover:text-[var(--color-bhairav-text)]"
              )
            }
          >
            <item.icon size={18} />
            {item.name}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-[var(--color-bhairav-border)]">
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-[var(--color-bhairav-critical)]/10 text-[var(--color-bhairav-critical)] hover:bg-[var(--color-bhairav-critical)] hover:text-white transition-colors text-sm font-medium"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
