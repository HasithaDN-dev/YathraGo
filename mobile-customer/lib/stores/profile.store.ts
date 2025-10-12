// Manages the list of switchable profiles (staff-parent/children) and the active one.
import { create } from 'zustand';
import { Profile } from '../../types/customer.types';
import { getProfilesApi, clearProfileCache } from '../api/profile.api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from './auth.store';

// Default profile preferences
export enum DefaultProfileOption {
  LAST_USED = 'last_used',
  SPECIFIC_PROFILE = 'specific_profile',
  FIRST_AVAILABLE = 'first_available'
}

interface DefaultProfileSettings {
  option: DefaultProfileOption;
  specificProfileId?: string; // Only used when option is SPECIFIC_PROFILE
}

interface ProfileState {
  profiles: Profile[];
  activeProfile: Profile | null;
  isLoading: boolean;
  error: string | null;
  defaultProfileSettings: DefaultProfileSettings;
  loadProfiles: (token: string) => Promise<void>;
  setActiveProfile: (profileId: string) => void;
  setDefaultProfile: (profileId: string) => Promise<void>;
  refreshProfiles: (token: string) => Promise<void>;
  clearError: () => void;
  addProfile: (profile: Profile) => void;
  removeProfile: (profileId: string) => void;
  // New methods for default profile settings
  setDefaultProfileSettings: (settings: DefaultProfileSettings) => Promise<void>;
  getDefaultProfileSettings: () => Promise<DefaultProfileSettings>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profiles: [],
  activeProfile: null,
  isLoading: false,
  error: null,
  defaultProfileSettings: {
    option: DefaultProfileOption.LAST_USED,
    specificProfileId: undefined,
  },
  
  loadProfiles: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const profiles = await getProfilesApi(token);
      console.log('Loaded profiles:', profiles.map(p => `${p.type}-${p.id}: ${p.firstName} ${p.lastName}`));
      
      // Load default profile settings
      const settings = await get().getDefaultProfileSettings();
      console.log('Default profile settings:', settings);

      let profileToActivate: Profile | null = null;

      switch (settings.option) {
        case DefaultProfileOption.LAST_USED:
          const lastUsedId = await AsyncStorage.getItem('last-used-profile-id');
          if (lastUsedId) {
            profileToActivate = profiles.find(p => p.id === lastUsedId) || null;
            console.log('Found last used profile:', profileToActivate?.firstName, profileToActivate?.lastName);
          }
          break;

        case DefaultProfileOption.SPECIFIC_PROFILE:
          if (settings.specificProfileId) {
            profileToActivate = profiles.find(p => p.id === settings.specificProfileId) || null;
            console.log('Found specific default profile:', profileToActivate?.firstName, profileToActivate?.lastName);
          }
          break;

        case DefaultProfileOption.FIRST_AVAILABLE:
          profileToActivate = profiles.length > 0 ? profiles[0] : null;
          console.log('Using first available profile:', profileToActivate?.firstName, profileToActivate?.lastName);
          break;
      }

      // Fallback to first profile if none found
      if (!profileToActivate && profiles.length > 0) {
        profileToActivate = profiles[0];
        console.log('Fallback to first profile:', profileToActivate);
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
      
      // Update last used profile if the setting is for last used
      const { defaultProfileSettings } = get();
      if (defaultProfileSettings.option === DefaultProfileOption.LAST_USED) {
        AsyncStorage.setItem('last-used-profile-id', profileId);
        console.log('Updated last used profile ID:', profileId);
      }
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

  // Default profile settings management
  setDefaultProfileSettings: async (settings) => {
    await AsyncStorage.setItem('default-profile-settings', JSON.stringify(settings));
    set({ defaultProfileSettings: settings });
    console.log('Updated default profile settings:', settings);
  },

  getDefaultProfileSettings: async () => {
    try {
      const stored = await AsyncStorage.getItem('default-profile-settings');
      if (stored) {
        const settings = JSON.parse(stored);
        set({ defaultProfileSettings: settings });
        return settings;
      }
    } catch (error) {
      console.error('Error loading default profile settings:', error);
    }
    
    // Return default settings
    const defaultSettings: DefaultProfileSettings = {
      option: DefaultProfileOption.LAST_USED,
      specificProfileId: undefined,
    };
    return defaultSettings;
  },
}));