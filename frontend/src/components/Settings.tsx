import React, { useState, useEffect } from 'react';
import Layout from './layout/Layout';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Monitor,
  Bell,
  Shield,
  Map,
  User,
  LogOut,
  Activity,
  Database,
  HardDrive,
  Cpu,
  Video,
  Wifi,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Theme = 'dark' | 'light' | 'system';

const Settings: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('bhairav-theme');
    if (saved === 'light') return 'light';
    if (saved === 'dark') return 'dark';
    return 'system';
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const navigate = useNavigate();

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

  const checkSystemStatus = async () => {
    setIsCheckingStatus(true);
    setStatusError(null);
    try {
      const res = await fetch('/api/system/status');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSystemStatus(data);
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Failed to load system status');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div className="flex items-center">
          <SettingsIcon className="w-6 h-6 mr-3 text-light-accent dark:text-dark-accent" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        </div>

        {/* Appearance */}
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Appearance</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme</label>
              <div className="flex gap-3">
                {[
                  { value: 'light', label: 'Light', icon: Sun },
                  { value: 'dark', label: 'Dark', icon: Moon },
                  { value: 'system', label: 'System', icon: Monitor },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value as Theme)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-colors ${
                      theme === value
                        ? 'border-light-accent dark:border-dark-accent bg-light-accent/10 dark:bg-dark-accent/20 text-light-accent dark:text-dark-accent'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Compact Mode</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Reduce spacing and padding</p>
              </div>
              <button
                onClick={() => setCompactMode(!compactMode)}
                className={`w-12 h-6 rounded-full transition-colors ${compactMode ? 'bg-light-accent dark:bg-dark-accent' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${compactMode ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
            <Bell className="w-5 h-5 mr-2" /> Notifications
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Enable Notifications</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Receive alerts for case updates</p>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-12 h-6 rounded-full transition-colors ${notificationsEnabled ? 'bg-light-accent dark:bg-dark-accent' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${notificationsEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Map Configuration */}
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
            <Map className="w-5 h-5 mr-2" /> Map Configuration
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Map Provider</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">MapTiler (configured)</p>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded border border-green-300">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Hotspot Layer</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Show density visualization</p>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded border border-green-300">Enabled</span>
            </div>
          </div>
        </div>

        {/* Account */}
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
            <User className="w-5 h-5 mr-2" /> Account
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Current User</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Officer</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Session</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
            <Shield className="w-5 h-5 mr-2" /> Security
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Session Status</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded border border-green-300">Secure</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">AI Configuration</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Gemini API (fallback: local token-based search)</p>
              </div>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded border border-yellow-300">Fallback Mode</span>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
            <Activity className="w-5 h-5 mr-2" /> System Status
          </h2>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Backend Services</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Monitor system health and latency</p>
            </div>
            <button
              onClick={checkSystemStatus}
              disabled={isCheckingStatus}
              className="px-4 py-2 bg-light-accent dark:bg-dark-accent text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isCheckingStatus ? 'Checking...' : 'Check Status'}
            </button>
          </div>

          {statusError && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-md border border-red-200 dark:border-red-800 text-sm mb-4">
              {statusError}
            </div>
          )}

          {systemStatus && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                 { key: 'database', label: 'Database', icon: Database },
                 { key: 'storage', label: 'Storage', icon: HardDrive },
                 { key: 'ai', label: 'AI', icon: Cpu },
                 { key: 'videoIntelligence', label: 'Video Intelligence', icon: Video },
                 { key: 'notifications', label: 'Notifications', icon: Bell },
                 { key: 'websocket', label: 'WebSocket', icon: Wifi },
               ].map(({ key, label, icon: Icon }) => {
                 const service = systemStatus.components?.[key];
                 const status = service?.status?.toLowerCase() || 'unknown';
                const isHealthy = status === 'healthy' || status === 'operational' || status === 'ok';
                const statusColor = isHealthy ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
                const bgColor = isHealthy ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20';
                return (
                  <div key={key} className={`p-3 rounded-md border ${bgColor} ${statusColor} flex items-center gap-3`}>
                    <Icon className="w-5 h-5" />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider">{label}</p>
                      <p className="text-sm font-bold capitalize">{status}</p>
                      {service?.latency && <p className="text-xs opacity-75">{service.latency}ms</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Settings;