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
  Trash2,
  Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';

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
  const [backups, setBackups] = useState<any[]>([]);
  const [isBackupsLoading, setIsBackupsLoading] = useState(false);
  const navigate = useNavigate();

  const fetchBackups = async () => {
    setIsBackupsLoading(true);
    try {
      const res = await apiClient.get<any[]>('/api/backups');
      if (res.ok && res.data) setBackups(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsBackupsLoading(false);
    }
  };

  const deleteBackup = async (filename: string) => {
    if (confirm(`PERMANENT DELETE\n\nAre you sure you want to delete backup file: ${filename}?`)) {
      try {
        const res = await apiClient.delete(`/api/backups/${filename}`);
        if (res.ok) {
          fetchBackups();
        } else {
          alert(`Failed to delete backup: ${res.error}`);
        }
      } catch (err) {
        alert('Error deleting backup.');
      }
    }
  };

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
    fetchBackups();
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

        {/* External Notifications */}
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
            <Bell className="w-5 h-5 mr-2" /> External Notifications
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Telegram Alerts</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Status: {systemStatus?.telegram || 'Unknown'}</p>
              </div>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/system/test-telegram', { method: 'POST' });
                    const data = await res.json();
                    alert(`Telegram Test: ${data.status}`);
                  } catch(e) {
                    alert('Error testing telegram');
                  }
                }}
                className="px-4 py-2 bg-light-accent text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
              >
                TEST TELEGRAM
              </button>
            </div>
          </div>
        </div>

        {/* Storage */}
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
            <HardDrive className="w-5 h-5 mr-2" /> Storage (7-Day Retention)
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Media Expiration Policy</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">All media auto-expires after 7 days</p>
              </div>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/admin/storage/cleanup', { method: 'POST' });
                    const data = await res.json();
                    alert(`Cleanup Complete: ${data.result.deleted} deleted, ${data.result.failed} failed.`);
                  } catch(e) {
                    alert('Error running cleanup');
                  }
                }}
                className="px-4 py-2 border border-red-500 text-red-500 rounded-md text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                RUN CLEANUP NOW
              </button>
            </div>
          </div>
        </div>

        {/* Data Backup & Recovery */}
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
            <Database className="w-5 h-5 mr-2" /> Data Backup & Recovery
          </h2>
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage database backups. These are system snapshots separate from the live database.
            </p>

            <div className="min-w-0 overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-md">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-500 font-medium">Backup File</th>
                    <th className="px-4 py-2 text-left text-gray-500 font-medium">Created At</th>
                    <th className="px-4 py-2 text-left text-gray-500 font-medium">Size</th>
                    <th className="px-4 py-2 text-right text-gray-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {isBackupsLoading ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-4 text-center text-gray-500">Loading backups...</td>
                    </tr>
                  ) : backups.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-4 text-center text-gray-500">No backup files found.</td>
                    </tr>
                  ) : (
                    backups.map((b) => (
                      <tr key={b.name} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{b.name}</td>
                        <td className="px-4 py-3 text-gray-500">{new Date(b.created_at).toLocaleString()}</td>
                        <td className="px-4 py-3 text-gray-500">{(b.size / 1024 / 1024).toFixed(2)} MB</td>
                        <td className="px-4 py-3 flex justify-end gap-2">
                          <a
                            href={`/api/backups/${b.name}/download`}
                            download
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                            title="Download Backup"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => deleteBackup(b.name)}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                            title="Permanently Delete Backup"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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
              <p className="text-xs text-gray-500 dark:text-gray-400">Monitor system health and configuration</p>
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
                 { key: 'database', label: 'MongoDB', icon: Database },
                 { key: 'cloudinary', label: 'Cloudinary', icon: HardDrive },
                 { key: 'yolo', label: 'YOLO', icon: Cpu },
                 { key: 'video_intelligence', label: 'Video Intelligence', icon: Video },
                 { key: 'telegram', label: 'Telegram', icon: Bell },
               ].map(({ key, label, icon: Icon }) => {
                 const status = typeof systemStatus[key] === 'string' ? systemStatus[key] : (systemStatus[key]?.status || 'UNKNOWN');
                const isHealthy = status === 'CONNECTED' || status === 'READY' || status === 'CONFIGURED' || status === 'operational' || status === 'healthy';
                const statusColor = isHealthy ? 'text-green-600 dark:text-green-400' : (status === 'DISABLED' ? 'text-gray-500' : 'text-red-600 dark:text-red-400');
                const bgColor = isHealthy ? 'bg-green-100 dark:bg-green-900/20' : (status === 'DISABLED' ? 'bg-gray-100 dark:bg-gray-800' : 'bg-red-100 dark:bg-red-900/20');
                return (
                  <div key={key} className={`p-3 rounded-md border ${bgColor} ${statusColor} flex items-center gap-3`}>
                    <Icon className="w-5 h-5" />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider">{label}</p>
                      <p className="text-sm font-bold capitalize">{status}</p>
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