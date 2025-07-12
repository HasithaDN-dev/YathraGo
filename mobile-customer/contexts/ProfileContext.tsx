import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Profile, ProfileContextType } from '@/types/profile.types';

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

interface ProfileProviderProps {
  children: ReactNode;
}

export function ProfileProvider({ children }: ProfileProviderProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const saveProfiles = useCallback(async (updatedProfiles: Profile[]) => {
    try {
      await AsyncStorage.setItem('user_profiles', JSON.stringify(updatedProfiles));
      setProfiles(updatedProfiles);
    } catch (error) {
      console.error('Error saving profiles:', error);
    }
  }, []);

  const loadProfiles = useCallback(async () => {
    try {
      setIsLoading(true);
      const storedProfiles = await AsyncStorage.getItem('user_profiles');
      const activeProfileId = await AsyncStorage.getItem('active_profile_id');
      
      if (storedProfiles) {
        const parsedProfiles: Profile[] = JSON.parse(storedProfiles);
        setProfiles(parsedProfiles);
        
        // Set active profile
        if (activeProfileId) {
          const active = parsedProfiles.find(p => p.id === activeProfileId);
          setActiveProfile(active || parsedProfiles[0]);
        } else {
          setActiveProfile(parsedProfiles[0]);
        }
      } else {
        // Create default parent profile if no profiles exist
        const defaultProfile: Profile = {
          id: 'parent_default',
          name: 'Parent',
          type: 'parent',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        const initialProfiles = [defaultProfile];
        await saveProfiles(initialProfiles);
        setActiveProfile(defaultProfile);
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setIsLoading(false);
    }
  }, [saveProfiles]);

  // Load profiles from storage on app start
  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const switchProfile = async (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      setActiveProfile(profile);
      await AsyncStorage.setItem('active_profile_id', profileId);
    }
  };

  const addChildProfile = async (profileData: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProfile: Profile = {
      ...profileData,
      id: `child_${Date.now()}`,
      type: 'child',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const updatedProfiles = [...profiles, newProfile];
    await saveProfiles(updatedProfiles);
  };

  const updateProfile = async (profileId: string, updates: Partial<Profile>) => {
    const updatedProfiles = profiles.map(profile => 
      profile.id === profileId 
        ? { ...profile, ...updates, updatedAt: new Date() }
        : profile
    );
    await saveProfiles(updatedProfiles);
    
    // Update active profile if it was modified
    if (activeProfile?.id === profileId) {
      setActiveProfile(updatedProfiles.find(p => p.id === profileId) || activeProfile);
    }
  };

  const deleteProfile = async (profileId: string) => {
    if (profiles.length <= 1) {
      throw new Error('Cannot delete the last profile');
    }
    
    const updatedProfiles = profiles.filter(p => p.id !== profileId);
    await saveProfiles(updatedProfiles);
    
    // Switch to first profile if active profile was deleted
    if (activeProfile?.id === profileId) {
      setActiveProfile(updatedProfiles[0]);
      await AsyncStorage.setItem('active_profile_id', updatedProfiles[0].id);
    }
  };

  const refreshProfiles = async () => {
    await loadProfiles();
  };

  // Computed values
  const parentProfile = profiles.find(p => p.type === 'parent') || null;
  const childProfiles = profiles.filter(p => p.type === 'child');

  const value: ProfileContextType = {
    profiles,
    activeProfile,
    parentProfile,
    childProfiles,
    isLoading,
    switchProfile,
    addChildProfile,
    updateProfile,
    deleteProfile,
    refreshProfiles,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
