import { useState, useCallback } from 'react';
import { NotificationDto, ReceiverType } from '../api/notifications.api';

// Simple local store hook to satisfy UI. This does not call network.
export function useNotificationsStore() {
  const [notifications, setNotifications] = useState<NotificationDto[]>([
    {
      id: 1,
      sender: 'System',
      message: 'Welcome to YathraGo — notifications are working!',
      type: 'system',
      isExpanded: false,
      time: 'Just now',
    },
    {
      id: 2,
      sender: 'Admin',
      message: 'Service maintenance at 10:00 PM tonight.',
      type: 'alert',
      isExpanded: false,
      time: '5 min ago',
    },
    {
      id: 3,
      sender: 'Support',
      message: 'Your document review is complete.',
      type: 'other',
      isExpanded: false,
      time: '1 hour ago',
    },
  ]);

  const loadForTargets = useCallback(async (_accessToken: string, _targets: { userType: ReceiverType; userId: number }[]) => {
    // No-op for now; UI reads from local placeholder notifications
    return;
  }, []);

  const toggleExpanded = useCallback((id: string | number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isExpanded: !n.isExpanded } : n)));
  }, []);

  return { notifications, loadForTargets, toggleExpanded };
}
