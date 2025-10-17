import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useAuthStore } from '../lib/stores/auth.store';
import { useProfileStore } from '../lib/stores/profile.store';
import { updateFcmTokenApi } from '../lib/api/notifications.api';

export function useRegisterPushToken() {
  const { accessToken } = useAuthStore();
  const { customerProfile } = useProfileStore();

  useEffect(() => {
    async function register() {
      if (!accessToken || !customerProfile?.customer_id) return;
      if (!Device.isDevice) return;
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return;
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      // Send to backend
      try {
        await updateFcmTokenApi(accessToken, customerProfile.customer_id, token);
      } catch (e) {
        // Optionally handle error
        console.warn('Failed to update FCM token in backend:', e);
      }
    }
    register();
  }, [accessToken, customerProfile?.customer_id]);
}
