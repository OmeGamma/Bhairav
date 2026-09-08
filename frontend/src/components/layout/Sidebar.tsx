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
  Shield
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
  { name: 'Intelligence Search', path: '/search', icon: Search },
  { name: 'Alerts', path: '/alerts', icon: Bell },
  { name: 'Analytics', path: '/analytics', icon: BarChart },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-light-card dark:bg-dark-card border-r border-light-border dark:border-dark-border flex flex-col h-full transition-colors duration-200">
      <div className="h-16 flex items-center px-6 border-b border-light-border dark:border-dark-border">
        <Shield className="w-8 h-8 text-light-accent dark:text-dark-accent mr-3" />
        <span className="text-xl font-bold tracking-wider">BHAIRAV</span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-light-accent/10 dark:bg-dark-accent/20 text-light-accent dark:text-dark-accent'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                  )
                }
              >
                <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;

