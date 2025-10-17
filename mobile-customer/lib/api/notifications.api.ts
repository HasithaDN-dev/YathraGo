import { API_BASE_URL } from '../../config/api';

export type NotificationType = 'system' | 'alerts' | 'others' | 'alert' | 'other' | 'chat';
export type ReceiverType = 'CUSTOMER' | 'CHILD' | 'STAFF' | 'DRIVER' | 'WEBUSER' | 'VEHICLEOWNER' | 'BACKUPDRIVER';

export interface NotificationDto {
  id: number;
  sender: string;
  message: string;
  type: NotificationType;
  isExpanded: boolean;
  time: string;
  imageUrl?: string | null;
  conversationId?: number | null;
}

export const getNotificationsApi = async (
  token: string,
  receiver: ReceiverType,
  receiverId: number,
  durationMinutes?: number,
): Promise<NotificationDto[]> => {
  const params = new URLSearchParams({
    receiver,
    receiverId: String(receiverId),
  });
  if (durationMinutes) params.set('duration', String(durationMinutes));

  const res = await fetch(`${API_BASE_URL}/notifications?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch notifications: ${res.status}`);
  }
  const data = (await res.json()) as any[];
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
      isExpanded: n.isExpanded,
      time: n.time,
      imageUrl: n.imageUrl ?? null,
      conversationId: n.conversationId ?? null,
    } as NotificationDto;
  });
};

// Update FCM/Expo push token for the logged-in customer
export const updateFcmTokenApi = async (
  token: string,
  customerId: number,
  fcmToken: string,
) => {
  const res = await fetch(`${API_BASE_URL}/notifications/fcm-token/${customerId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ fcmToken }),
  });
  if (!res.ok) {
    throw new Error(`Failed to update FCM token: ${res.status}`);
  }
};
