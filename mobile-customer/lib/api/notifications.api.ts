import { API_BASE_URL } from '../../config/api';

export type NotificationType = 'system' | 'alerts' | 'others' | 'alert' | 'other';
export type ReceiverType = 'CUSTOMER' | 'DRIVER' | 'WEBUSER' | 'VEHICLEOWNER' | 'BACKUPDRIVER';

export interface NotificationDto {
  id: number;
  sender: string;
  message: string;
  type: NotificationType;
  isExpanded: boolean;
  time: string;
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
  const data = (await res.json()) as NotificationDto[];
  // Normalize type to match UI expected types: 'system' | 'alert' | 'other'
  return data.map((n) => ({
    ...n,
    type:
      n.type === 'alerts' || n.type === 'alert'
        ? 'alert'
        : n.type === 'system'
        ? 'system'
        : 'other',
  }));
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
