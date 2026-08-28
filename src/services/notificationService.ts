import { API_BASE_URL } from './apiClient';
import type { Notification } from '../types';

export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    const response = await fetch(`${API_BASE_URL}/notifications/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to fetch notifications');
    }

    return response.json();
  },

  markAsRead: async (notificationId: string): Promise<Notification> => {
    const response = await fetch(`${API_BASE_URL}/notifications/${encodeURIComponent(notificationId)}/read`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to mark notification as read');
    }

    return response.json();
  },

  markAllAsRead: async (): Promise<void> => {
    const notifications = await notificationService.getNotifications();
    const unread = notifications.filter(n => !n.read);
    
    await Promise.all(
      unread.map(n => notificationService.markAsRead(n.id))
    );
  }
};
