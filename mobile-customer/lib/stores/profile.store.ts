// Manages the list of switchable profiles (staff-parent/children) and the active one.
import { create } from 'zustand';
import { Profile } from '../../types';
import { getProfilesApi } from '../api/profile.api';
import { saveDefaultProfileId, getDefaultProfileId } from '../storage/async.storage';

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
    const profiles = await getProfilesApi(token);
    const defaultProfileId = await getDefaultProfileId();
    
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
    await saveDefaultProfileId(profileId);
    get().setActiveProfile(profileId); // Update active profile immediately for good UX
  },
}));