import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BrainCircuit,
  Video,
  Network,
  Map,
  FolderOpen,
  FileText,
  FileSearch,
  Search,
  Bell,
  BarChart,
  Settings,
  Shield,
  Navigation
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Criminal Analyzer', path: '/ai-analyzer', icon: BrainCircuit },
  { name: 'Video Intelligence', path: '/video-intelligence', icon: Video },
  { name: 'Criminal Network', path: '/criminal-network', icon: Network },
  { name: 'Geospatial Intelligence', path: '/geospatial', icon: Map },
  { name: 'Case Files', path: '/cases', icon: FolderOpen },
  { name: 'Video Reports', path: '/video-reports', icon: Video },
  { name: 'Reports', path: '/reports', icon: FileText },
  { name: 'Document Intelligence', path: '/documents', icon: FileSearch },
  { name: 'Bhairav Tracking', path: '/tracking', icon: Navigation },
  { name: 'Alerts', path: '/alerts', icon: Bell },
  { name: 'Analytics', path: '/analytics', icon: BarChart },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const Sidebar: React.FC = () => {
  return (
    <div className="flex w-full flex-col border-b border-light-border bg-light-card dark:border-dark-border dark:bg-dark-card transition-colors duration-200 md:h-screen md:w-64 md:flex-shrink-0 md:border-b-0 md:border-r md:sticky md:top-0">
      <div className="grid grid-cols-2 gap-1 px-3 py-3 sm:grid-cols-4 md:flex md:flex-col md:overflow-y-auto md:py-4 md:space-y-1">
        <nav className="contents">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  clsx(
                    'flex min-h-[44px] flex-1 items-center px-4 py-2.5 rounded-lg text-sm transition-all duration-200 md:min-w-0 group',
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={clsx("w-5 h-5 mr-3 flex-shrink-0 transition-transform duration-200", isActive ? "scale-110" : "group-hover:scale-110")} />
                    <span className="min-w-0 truncate">{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;

