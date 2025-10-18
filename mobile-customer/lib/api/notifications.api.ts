import { API_BASE_URL } from '../../config/api';

export type NotificationType = 'system' | 'alerts' | 'others' | 'alert' | 'other' | 'chat';
export type ReceiverType =
  | 'CUSTOMER'
  | 'DRIVER'
  | 'WEBUSER'
  | 'VEHICLEOWNER'
  | 'BACKUPDRIVER'
  | 'CHILD'
  | 'STAFF';

export interface NotificationDto {
  id: number;
  sender: string;
  message: string;
  type: NotificationType;
  isExpanded: boolean;
  time: string;
  createdAt?: string;
  imageUrl?: string | null;
  conversationId?: number | null;
}

export const getNotificationsApi = async (
  token: string,
  userType: ReceiverType,
  userId: number,
): Promise<NotificationDto[]> => {
  const params = new URLSearchParams({
    userType,
    userId: String(userId),
  });

  const res = await fetch(`${API_BASE_URL}/notifications?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch notifications: ${res.status}`);
  }
  const json = await res.json();
  const data: any[] = Array.isArray(json) ? json : json?.notifications ?? [];
  // Normalize type to match UI expected types and preserve 'chat'
  return data.map((n) => {
    let type: NotificationType = 'other';
    const raw = String(n.type ?? '').toLowerCase();
    if (raw === 'system') type = 'system';
    else if (raw === 'alerts' || raw === 'alert') type = 'alert';
    else if (raw === 'chat') type = 'chat';
    else type = 'other';
    return {
      id: n.id,
      sender: n.sender,
      message: n.message,
      type,
      isExpanded: Boolean(n.isExpanded),
      time: n.time ?? '',
      createdAt: n.createdAt ?? n.time ?? undefined,
      imageUrl: n.imageUrl ?? null,
      conversationId: n.conversationId ?? null,
    } as NotificationDto;
  });
};

// Helper: fetch and merge notifications for multiple targets
export const getNotificationsForTargetsApi = async (
  token: string,
  targets: { userType: ReceiverType; userId: number }[],
): Promise<NotificationDto[]> => {
  const results = await Promise.all(targets.map((t) => getNotificationsApi(token, t.userType, t.userId)));
  // Merge, de-duplicate by id, and sort by newest first if time is parsable
  const all = results.flat();
  const map = new Map<number | string, NotificationDto>();
  for (const n of all) {
    map.set(n.id, n);
  }
  const merged = Array.from(map.values());
  // Sort by createdAt (newest first) if available, otherwise by id desc
  merged.sort((a, b) => {
    const ta = a.createdAt ? Date.parse(a.createdAt) : NaN;
    const tb = b.createdAt ? Date.parse(b.createdAt) : NaN;
    if (!isNaN(ta) && !isNaN(tb)) return tb - ta;
    if (!isNaN(ta)) return -1;
    if (!isNaN(tb)) return 1;
    return b.id - a.id;
  });
  return merged;
};

// Update FCM/Expo push token for the logged-in customer
export const updateFcmTokenApi = async (
  token: string,
  userType: ReceiverType,
  userId: number,
  fcmToken: string,
) => {
  const res = await fetch(`${API_BASE_URL}/notifications/fcm-token`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userType, userId, fcmToken }),
  });
  if (!res.ok) {
    throw new Error(`Failed to update FCM token: ${res.status}`);
  }
};
