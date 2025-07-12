export interface Profile {
  id: string;
  name: string;
  type: 'parent' | 'child';
  avatar?: string;
  age?: number;
  school?: string;
  grade?: string;
  emergencyContact?: string;
  pickupLocations?: PickupLocation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PickupLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

export interface ProfileContextType {
  profiles: Profile[];
  activeProfile: Profile | null;
  parentProfile: Profile | null;
  childProfiles: Profile[];
  isLoading: boolean;
  switchProfile: (profileId: string) => void;
  addChildProfile: (profile: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProfile: (profileId: string, updates: Partial<Profile>) => Promise<void>;
  deleteProfile: (profileId: string) => Promise<void>;
  refreshProfiles: () => Promise<void>;
}
