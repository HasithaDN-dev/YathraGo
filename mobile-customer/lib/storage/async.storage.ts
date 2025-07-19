// For NON-SENSITIVE data. Used for storing user preferences.

import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_PROFILE_ID_KEY = 'default-profile-id';

export async function saveDefaultProfileId(profileId: string): Promise<void> {
  try {
    await AsyncStorage.setItem(DEFAULT_PROFILE_ID_KEY, profileId);
  } catch (error) {
    console.error('Failed to save default profile ID', error);
  }
}

export async function getDefaultProfileId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(DEFAULT_PROFILE_ID_KEY);
  } catch (error) {
    console.error('Failed to get default profile ID', error);
    return null;
  }
}