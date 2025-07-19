// Manages the list of switchable profiles (staff-parent/children) and the active one.
import { create } from 'zustand';
import { Profile, ChildProfile, StaffProfile } from '../../types/customer.types';
import { getProfilesApi } from '../api/profile.api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ProfileState {
  profiles: Profile[];
  activeProfile: Profile | null;
  loadProfiles: (token: string) => Promise<void>;
  setActiveProfile: (profileId: string) => void;
  setDefaultProfile: (profileId: string) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profiles: [],
  activeProfile: null,
  loadProfiles: async (token) => {
    const [parentProfile] = await getProfilesApi(token);
    const defaultProfileId = await AsyncStorage.getItem('default-profile-id');

    // Use type assertions to access children and staffPassenger with correct types
    const parentWithExtras = parentProfile as Profile & {
      children?: ChildProfile[];
      staffPassenger?: StaffProfile;
    };

    let profiles: Profile[] = [];
    if (parentWithExtras) {
      profiles.push({ ...parentWithExtras, type: 'parent' });
      if (Array.isArray(parentWithExtras.children)) {
        profiles = profiles.concat(
          parentWithExtras.children.map((child) => ({
            ...child,
            name: child.childName,
            type: 'child',
          }))
        );
      }
      if (parentWithExtras.staffPassenger) {
        profiles.push({
          ...parentWithExtras.staffPassenger,
          name: 'Staff Passenger', // Or use another relevant field if available
          type: 'staff',
        });
      }
    }

    let profileToActivate: Profile | null = null;
    if (defaultProfileId) {
      profileToActivate = profiles.find(p => p.id === defaultProfileId) || null;
    }
    if (!profileToActivate) {
      profileToActivate = profiles.find(p => p.type === 'parent') || profiles[0] || null;
    }

    set({ profiles, activeProfile: profileToActivate });
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
}));