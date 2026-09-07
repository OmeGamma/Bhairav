import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Sun, Moon, ChevronDown, Check, CheckCheck, LogOut, User, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import type { Notification } from '../contexts/NotificationContext';

// Hook for click outside
function useOnClickOutside(ref: React.RefObject<HTMLElement | null>, handler: (event: MouseEvent | TouchEvent) => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

const Topbar: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('bhairav-theme') as 'light' | 'dark') || 'dark';
  });
  
  const [scope, setScope] = useState('India');
  const [isScopeOpen, setIsScopeOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const scopeRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(scopeRef, () => setIsScopeOpen(false));
  useOnClickOutside(notifRef, () => setShowNotifications(false));
  useOnClickOutside(profileRef, () => setIsProfileOpen(false));

  const navigate = useNavigate();
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('bhairav-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    // Clear tokens/auth logic here if applicable
    navigate('/login');
  };

  const scopes = ['World', 'India', 'State', 'District', 'City', 'Custom Area'];
  const unreadCount = notifications.filter((n: Notification) => !n.read).length;

  return (
    <header className="h-16 bg-light-card dark:bg-dark-card border-b border-light-border dark:border-dark-border flex items-center justify-between px-6 transition-colors duration-200 z-50 shrink-0">
      <div className="flex-1 flex items-center">
        {/* Global Search */}
        <div className="max-w-md w-full relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-light-border dark:border-dark-border rounded-md leading-5 bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-light-accent dark:focus:ring-dark-accent sm:text-sm transition-colors"
            placeholder="Global Bhairav Search..."
          />
        </div>
      </div>

      <div className="flex items-center space-x-6">
        {/* Scope Selector */}
        <div className="relative" ref={scopeRef}>
          <button 
            onClick={() => setIsScopeOpen(!isScopeOpen)}
            className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-light-accent dark:hover:text-dark-accent focus:outline-none"
          >
            <span className="mr-2">Scope: {scope}</span>
            <ChevronDown className="h-4 w-4" />
          </button>
          {isScopeOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-light-card dark:bg-dark-card ring-1 ring-black ring-opacity-5 z-50 border border-light-border dark:border-dark-border">
              <div className="py-1">
                {scopes.map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      setScope(s);
                      setIsScopeOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-light-accent dark:hover:text-dark-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative text-gray-500 hover:text-light-accent dark:hover:text-dark-accent focus:outline-none"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-96 rounded-md shadow-xl bg-light-card dark:bg-dark-card ring-1 ring-black ring-opacity-5 z-50 border border-light-border dark:border-dark-border">
              <div className="p-3 flex items-center justify-between border-b border-light-border dark:border-dark-border">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Alerts</h3>
                <button onClick={markAllAsRead} className="text-xs text-light-accent dark:text-dark-accent hover:underline flex items-center focus:outline-none">
                  <CheckCheck className="w-3 h-3 mr-1" /> Mark all read
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 && (
                  <p className="p-4 text-sm text-gray-500 text-center">No alerts</p>
                )}
                {notifications.map((n: Notification) => (
                  <div
                    key={n.id}
                    className={`p-3 border-b border-light-border dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${n.read ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1" onClick={() => n.case_id && navigate(`/cases/${n.case_id}`)}>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{n.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(n.timestamp).toLocaleString()}</p>
                      </div>
                      {!n.read && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(n.id);
                          }} 
                          className="ml-2 text-gray-400 hover:text-light-accent dark:hover:text-dark-accent focus:outline-none p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-light-border dark:border-dark-border">
                <button
                  onClick={() => { setShowNotifications(false); navigate('/alerts'); }}
                  className="w-full text-center text-sm text-light-accent dark:text-dark-accent hover:underline py-1 focus:outline-none"
                >
                  View All Alerts
                </button>
              </div>
            </div>
          )}
        </div>

        <button onClick={toggleTheme} className="text-gray-500 hover:text-light-accent dark:hover:text-dark-accent focus:outline-none">
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-3 focus:outline-none"
          >
            <div className="h-8 w-8 rounded-full bg-light-accent dark:bg-dark-accent flex items-center justify-center text-white font-bold shadow-sm">
              O
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Officer</span>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>
          
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-xl bg-light-card dark:bg-dark-card ring-1 ring-black ring-opacity-5 z-50 border border-light-border dark:border-dark-border overflow-hidden">
              <div className="py-1">
                <button 
                  onClick={() => { setIsProfileOpen(false); navigate('/profile'); }}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-light-accent dark:hover:text-dark-accent"
                >
                  <User className="w-4 h-4 mr-2" /> Profile
                </button>
                <button 
                  onClick={() => { setIsProfileOpen(false); navigate('/alerts'); }}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-light-accent dark:hover:text-dark-accent"
                >
                  <Bell className="w-4 h-4 mr-2" /> Alerts
                </button>
                <button 
                  onClick={() => { setIsProfileOpen(false); navigate('/settings'); }}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-light-accent dark:hover:text-dark-accent"
                >
                  <SettingsIcon className="w-4 h-4 mr-2" /> Settings
                </button>
                <button 
                  onClick={() => { setIsProfileOpen(false); toggleTheme(); }}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-light-accent dark:hover:text-dark-accent"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />} 
                  Toggle Theme
                </button>
                <div className="border-t border-light-border dark:border-dark-border my-1" />
                <button 
                  onClick={handleLogout}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
