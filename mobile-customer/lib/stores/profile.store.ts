// Manages the list of switchable profiles (staff-parent/children) and the active one.
import { create } from 'zustand';
import { Profile, ChildProfile, StaffProfile } from '../../types/customer.types';
import { getProfilesApi, clearProfileCache } from '../api/profile.api';
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
  addProfile: (profile: Profile) => void;
  removeProfile: (profileId: string) => void;
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
      console.log('Loaded profiles:', profiles.map(p => `${p.type}-${p.id}: ${p.firstName} ${p.lastName}`));
      
    const defaultProfileId = await AsyncStorage.getItem('default-profile-id');
    console.log('Stored default profile ID:', defaultProfileId);

    let profileToActivate: Profile | null = null;
    if (defaultProfileId) {
      profileToActivate = profiles.find(p => p.id === defaultProfileId) || null;
      if (!profileToActivate) {
        console.log('Stored profile ID not found, clearing stored ID');
        await AsyncStorage.removeItem('default-profile-id');
      }
    }
      if (!profileToActivate && profiles.length > 0) {
        profileToActivate = profiles[0];
        console.log('Using first profile as default:', profileToActivate);
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
    console.log('Setting active profile with ID:', profileId);
    const profile = get().profiles.find(p => p.id === profileId);
    console.log('Found profile:', profile);
    if (profile) {
      set({ activeProfile: profile });
      console.log('Active profile set to:', profile.type, profile.firstName, profile.lastName);
    } else {
      console.log('Profile not found for ID:', profileId);
    }
  },
  
  setDefaultProfile: async (profileId) => {
    console.log('Setting default profile ID:', profileId);
    await AsyncStorage.setItem('default-profile-id', profileId);
    get().setActiveProfile(profileId); // Update active profile immediately for good UX
  },
  
  refreshProfiles: async (token) => {
    // Clear cache before refreshing to get fresh data
    clearProfileCache();
    await get().loadProfiles(token);
  },
  
  clearError: () => {
    set({ error: null });
  },
  
  addProfile: (profile) => {
    const { profiles } = get();
    set({ profiles: [...profiles, profile] });
    // Clear cache when profiles are modified
    clearProfileCache();
  },
  
  removeProfile: (profileId) => {
    const { profiles, activeProfile } = get();
    const updatedProfiles = profiles.filter(p => p.id !== profileId);
    let newActiveProfile = activeProfile;
    
    // If we're removing the active profile, switch to first available
    if (activeProfile?.id === profileId && updatedProfiles.length > 0) {
      newActiveProfile = updatedProfiles[0];
    }
    
    set({ profiles: updatedProfiles, activeProfile: newActiveProfile });
    // Clear cache when profiles are modified
    clearProfileCache();
  },
}));