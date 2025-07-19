// Manages the list of switchable profiles (staff-parent/children) and the active one.
import { create } from 'zustand';
import { Profile, ChildProfile, StaffProfile } from '../../types/customer.types';
import { getProfilesApi } from '../api/profile.api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from './auth.store';

interface ProfileState {
  profiles: Profile[];
  activeProfile: Profile | null;
  isLoading: boolean;
  error: string | null;
  loadProfiles: (token: string) => Promise<void>;
  setActiveProfile: (profileId: string) => void;
  setDefaultProfile: (profileId: string) => Promise<void>;
  refreshProfiles: (token: string) => Promise<void>;
  clearError: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profiles: [],
  activeProfile: null,
  isLoading: false,
  error: null,
  
  loadProfiles: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const profiles = await getProfilesApi(token);
      const defaultProfileId = await AsyncStorage.getItem('default-profile-id');

      let profileToActivate: Profile | null = null;
      if (defaultProfileId) {
        profileToActivate = profiles.find(p => p.id === defaultProfileId) || null;
      }
      if (!profileToActivate && profiles.length > 0) {
        profileToActivate = profiles[0];
      }

      set({ profiles, activeProfile: profileToActivate, isLoading: false });
      
      // If we have profiles, mark profile as complete
      if (profiles.length > 0) {
        const { setProfileComplete } = useAuthStore.getState();
        setProfileComplete(true);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load profiles';
      set({ error: errorMessage, isLoading: false });
      console.error('Profile loading error:', error);
    }
  },
  
  setActiveProfile: (profileId) => {
    const profile = get().profiles.find(p => p.id === profileId);
    if (profile) {
      set({ activeProfile: profile });
    }
  },
  
  setDefaultProfile: async (profileId) => {
    await AsyncStorage.setItem('default-profile-id', profileId);
    get().setActiveProfile(profileId); // Update active profile immediately for good UX
  },
  
  refreshProfiles: async (token) => {
    await get().loadProfiles(token);
  },
  
  clearError: () => {
    set({ error: null });
  },
}));