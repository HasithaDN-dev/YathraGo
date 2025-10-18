import { create } from 'zustand';
import {
  getNotificationsApi,
  getNotificationsForTargetsApi,
  NotificationDto,
  ReceiverType,
} from '../api/notifications.api';

interface NotificationsState {
  notifications: NotificationDto[];
  isLoading: boolean;
  error?: string;
  // actions
  loadForProfile: (
    token: string,
    userType: ReceiverType,
    userId: number,
  ) => Promise<void>;
  loadForTargets: (
    token: string,
    targets: Array<{ userType: ReceiverType; userId: number }>,
  ) => Promise<void>;
  toggleExpanded: (id: number | string) => void;
  reset: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  isLoading: false,
  error: undefined,

  loadForProfile: async (token, userType, userId) => {
    set({ isLoading: true, error: undefined });
    try {
      const list = await getNotificationsApi(token, userType, userId);
      set({ notifications: list, isLoading: false });
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to load notifications', isLoading: false });
    }
  },

  loadForTargets: async (token, targets) => {
    set({ isLoading: true, error: undefined });
    try {
      const list = await getNotificationsForTargetsApi(token, targets);
      set({ notifications: list, isLoading: false });
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to load notifications', isLoading: false });
    }
  },

  toggleExpanded: (id) => {
    const { notifications } = get();
    set({
      notifications: notifications.map((n) =>
        String(n.id) === String(id) ? { ...n, isExpanded: !n.isExpanded } : n,
      ),
    });
  },

  reset: () => set({ notifications: [], isLoading: false, error: undefined }),
}));
