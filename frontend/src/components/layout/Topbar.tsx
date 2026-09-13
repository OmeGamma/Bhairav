import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Sun, Moon, ChevronDown, Check, CheckCheck, LogOut, User, Settings as SettingsIcon, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import type { Notification } from '../contexts/NotificationContext';

function useOnClickOutside(ref: React.RefObject<HTMLElement | null>, handler: (event: MouseEvent | TouchEvent) => void) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handlerRef.current(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref]);
}

const Topbar: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    const saved = localStorage.getItem('bhairav-theme');
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved as 'light' | 'dark' | 'system';
    }
    return 'dark';
  });
  
  const [scope, setScope] = useState('India');
  const [isScopeOpen, setIsScopeOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const scopeRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(notifRef, () => setShowNotifications(false));
  useOnClickOutside(profileRef, () => setIsProfileOpen(false));

  const navigate = useNavigate();
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
    localStorage.setItem('bhairav-theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsScopeOpen(false);
        setShowNotifications(false);
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => {
      if (prev === 'dark') return 'light';
      if (prev === 'light') return 'system';
      return 'dark';
    });
  };

  const handleLogout = () => {
    // Clear tokens/auth logic here if applicable
    navigate('/login');
  };

  const scopes = ['World', 'India', 'State', 'District', 'City', 'Custom Area'];
  const unreadCount = notifications.filter((n: Notification) => !n.read).length;

  return (
    <header className="relative z-40 flex min-h-16 w-full flex-wrap items-center justify-between gap-3 px-4 py-3 bg-light-card dark:bg-dark-card border-b border-light-border dark:border-dark-border sm:px-6 transition-colors duration-200">
      <div className="flex min-w-0 flex-1 items-center px-2 md:px-4">
        <Shield className="w-8 h-8 text-light-accent dark:text-dark-accent mr-3" />
        <span className="text-xl font-bold tracking-wider text-gray-900 dark:text-white">BHAIRAV</span>
      </div>

      <div className="flex w-full min-w-0 items-center justify-end gap-3 sm:w-auto sm:space-x-6">


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
            <div className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] rounded-md shadow-xl bg-light-card dark:bg-dark-card ring-1 ring-black ring-opacity-5 z-50 border border-light-border dark:border-dark-border">
              <div className="p-3 flex items-center justify-between border-b border-light-border dark:border-dark-border">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Alerts</h3>
                <button onClick={markAllAsRead} className="text-xs text-light-accent dark:text-dark-accent hover:underline flex items-center focus:outline-none">
                  <CheckCheck className="w-3 h-3 mr-1" /> Mark all read
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.filter((n: Notification) => !n.read).length === 0 && (
                  <p className="p-4 text-sm text-gray-500 text-center">No unread alerts</p>
                )}
                {notifications.filter((n: Notification) => !n.read).map((n: Notification) => (
                  <div
                    key={n.id}
                    className="p-4 border-b border-light-border dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
                    onClick={() => { setShowNotifications(false); n.case_id && navigate(`/cases/${n.case_id}`); }}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{n.title}</p>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 tracking-wide">
                          UNREAD
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3 line-clamp-2">{n.description}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          {new Date(n.timestamp || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          <span className="mx-1.5 opacity-50">•</span>
                          {new Date(n.timestamp || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </p>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(n.id);
                          }} 
                          className="text-xs font-semibold text-light-accent dark:text-dark-accent opacity-0 group-hover:opacity-100 transition-opacity hover:underline focus:outline-none"
                        >
                          MARK AS READ
                        </button>
                      </div>
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
            <div className="absolute right-0 top-full mt-2 w-48 max-w-[calc(100vw-2rem)] rounded-md shadow-xl bg-light-card dark:bg-dark-card ring-1 ring-black ring-opacity-5 z-50 border border-light-border dark:border-dark-border overflow-hidden">
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

