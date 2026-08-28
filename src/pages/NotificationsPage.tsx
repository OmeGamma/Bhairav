import { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCircle, AlertTriangle, Shield, Clock, ChevronRight } from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { notificationService } from '../services/notificationService';
import type { Notification } from '../types';
import { cn } from '../utils/cn';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch {
      setError('Failed to fetch notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return <LoadingState fullHeight message="Loading notifications..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchNotifications} />;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notification Center</h2>
          <p className="text-[var(--color-bhairav-text-muted)] mt-1">System alerts, updates, and attention items</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] rounded-md text-sm hover:bg-[var(--color-bhairav-surface-hover)] transition-colors"
          >
            <CheckCircle size={16} />
            Mark all as read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-[var(--color-bhairav-border)]">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            "px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
            filter === 'all'
              ? "border-[var(--color-bhairav-primary)] text-[var(--color-bhairav-primary)]"
              : "border-transparent text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-text)]"
          )}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={cn(
            "px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-2",
            filter === 'unread'
              ? "border-[var(--color-bhairav-primary)] text-[var(--color-bhairav-primary)]"
              : "border-transparent text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-text)]"
          )}
        >
          Unread
          {unreadCount > 0 && (
            <span className="bg-[var(--color-bhairav-critical)] text-white text-xs px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notification List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {filteredNotifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No Notifications"
            description={filter === 'unread' ? "You're all caught up. No unread notifications." : "You don't have any notifications yet."}
            className="h-full border border-[var(--color-bhairav-border)] rounded-xl bg-[var(--color-bhairav-surface)]"
          />
        ) : (
          filteredNotifications.map(notification => (
            <div
              key={notification.id}
              onClick={() => !notification.read && handleMarkAsRead(notification.id)}
              className={cn(
                "bg-[var(--color-bhairav-surface)] border p-4 rounded-xl cursor-pointer transition-all flex items-start gap-4 group",
                notification.read
                  ? "border-[var(--color-bhairav-border)] opacity-75"
                  : "border-[var(--color-bhairav-primary)]/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
              )}
            >
              <div className="shrink-0 mt-1">
                {notification.type === 'ALERT' || notification.type === 'CRITICAL' ? (
                  <div className="w-10 h-10 rounded-full bg-[var(--color-bhairav-critical)]/10 flex items-center justify-center border border-[var(--color-bhairav-critical)]/30">
                    <AlertTriangle className="text-[var(--color-bhairav-critical)]" size={18} />
                  </div>
                ) : notification.type === 'INFO' ? (
                  <div className="w-10 h-10 rounded-full bg-[var(--color-bhairav-primary)]/10 flex items-center justify-center border border-[var(--color-bhairav-primary)]/30">
                    <Shield className="text-[var(--color-bhairav-primary)]" size={18} />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[var(--color-bhairav-surface-hover)] flex items-center justify-center border border-[var(--color-bhairav-border)]">
                    <Bell className="text-[var(--color-bhairav-text-muted)] group-hover:text-[var(--color-bhairav-primary)] transition-colors" size={18} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-[var(--color-bhairav-text)] truncate">{notification.title}</h4>
                  <span className="text-xs font-mono text-[var(--color-bhairav-text-muted)] whitespace-nowrap flex items-center gap-1">
                    <Clock size={12} /> {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-bhairav-text-muted)] line-clamp-2">{notification.message}</p>
                <div className="flex items-center gap-3 mt-2">
                  <Badge status={notification.read ? 'neutral' : 'warning'}>{notification.type}</Badge>
                  {!notification.read && (
                    <span className="text-xs font-medium text-[var(--color-bhairav-primary)]">New</span>
                  )}
                </div>
              </div>

              <div className="shrink-0 flex items-center h-full pt-4">
                <ChevronRight size={20} className="text-[var(--color-bhairav-text-muted)] group-hover:text-[var(--color-bhairav-primary)]" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
