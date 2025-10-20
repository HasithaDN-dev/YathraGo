import { useState, useCallback } from 'react';
import axios from 'axios';
import { tokenService } from '../services/token.service';
import { NotificationDto, ReceiverType } from '../api/notifications.api';

const SERVER_BASE =
  process.env.EXPO_PUBLIC_API_URL || process.env.SERVER_BASE_URL || 'http://localhost:3000';

export function useNotificationsStore() {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);

  /**
   * Load notifications for given targets. Each target is { userType, userId }.
   * This will fetch GET /notifications?userType=...&userId=... and merge results.
   */
  const loadForTargets = useCallback(async (accessToken: string | undefined | null, targets: { userType: ReceiverType; userId: number }[]) => {
    try {
      if (!targets || targets.length === 0) return;

      const token = accessToken || (await tokenService.getToken());
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };

      const all: NotificationDto[] = [];

      // Fetch notifications for each target in parallel
      const promises = targets.map((t) =>
        axios.get(`${SERVER_BASE}/notifications`, { params: { userType: t.userType, userId: t.userId }, headers }).then((res) => res.data).catch((err) => {
          console.error('Failed to load notifications for', t, err?.response?.data || err.message || err);
          return null;
        })
      );

      const results = await Promise.all(promises);

      for (const r of results) {
        if (!r || !r.notifications) continue;
        for (const n of r.notifications) {
          // Normalize shape
          all.push({
            id: n.id,
            sender: n.sender,
            message: n.message,
            type: (String(n.type) || '').toLowerCase(),
            isExpanded: Boolean(n.isExpanded),
            time: n.time || '',
          });
        }
      }

      // Dedupe by id (keep first occurrence) and sort by id desc for newest-first
      const map = new Map<string | number, NotificationDto>();
      for (const item of all) {
        map.set(item.id, item);
      }

      const merged = Array.from(map.values()).sort((a, b) => {
        const ai = typeof a.id === 'number' ? a.id : parseInt(String(a.id), 10) || 0;
        const bi = typeof b.id === 'number' ? b.id : parseInt(String(b.id), 10) || 0;
        return bi - ai;
      });

      setNotifications(merged);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }, []);

  const toggleExpanded = useCallback((id: string | number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isExpanded: !n.isExpanded } : n)));
  }, []);

  return { notifications, loadForTargets, toggleExpanded };
}
