import { create } from 'zustand';
import { getNotificationsApi, NotificationDto, ReceiverType } from '../api/notifications.api';

interface NotificationsState {
  notifications: NotificationDto[];
  isLoading: boolean;
  error?: string;
  // actions
  loadForProfile: (
    token: string,
    receiver: ReceiverType,
    receiverId: number,
    durationMinutes?: number,
  ) => Promise<void>;
  toggleExpanded: (id: number | string) => void;
  reset: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  isLoading: false,
  error: undefined,

  loadForProfile: async (token, receiver, receiverId, durationMinutes) => {
    set({ isLoading: true, error: undefined });
    try {
      const list = await getNotificationsApi(token, receiver, receiverId, durationMinutes);
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
