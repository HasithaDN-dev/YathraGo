import { useEffect, useState, useCallback } from 'react';

export interface Notification {
  id: number;
  sender: string;
  message: string;
  type: string;
  receiver: string;
  receiverId: number | null;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
  refresh: () => Promise<void>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export function useNotifications(
  userType: string,
  userId: number,
  pollingInterval = 30000 // 30 seconds
): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications?receiver=${userType}&receiverId=${userId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [userType, userId]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/unread-count?userType=${userType}&userId=${userId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch unread count');
      }

      const data = await response.json();
      setUnreadCount(data.count || 0);
    } catch {
      // Silent fail for unread count
    }
  }, [userType, userId]);

  // Mark notification as read
  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userType, userId }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to mark as read');
      }

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      throw err;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/mark-all-read`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userType, userId }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to mark all as read');
      }

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      throw err;
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: number) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/${notificationId}?userType=${userType}&userId=${userId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      fetchUnreadCount(); // Refresh count
    } catch (err) {
      throw err;
    }
  };

  // Refresh all data
  const refresh = async () => {
    setLoading(true);
    await Promise.all([fetchNotifications(), fetchUnreadCount()]);
  };

  // Poll for new notifications
  useEffect(() => {
    if (!userType || !userId) return;

    fetchNotifications();
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [userType, userId, pollingInterval, fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
  };
}
