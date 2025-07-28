// Manages the core authentication state for driver app: token, user object, and status.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Driver } from '../../types/driver.types';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  user: Driver | null;
  accessToken: string | null;
  isLoggedIn: boolean;
  isProfileComplete: boolean;
  isDriverRegistered: boolean;
  registrationStatus: string;
  hasHydrated: boolean;
  isLoading: boolean;
  login: (accessToken: string, user: Driver) => Promise<void>;
  logout: () => Promise<void>;
  setProfileComplete: (complete: boolean) => void;
  setDriverRegistered: (registered: boolean) => void;
  setRegistrationStatus: (status: string) => void;
  setHasHydrated: (value: boolean) => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: Driver) => void;
  refreshToken: (newToken: string) => void;
}

// Custom storage adapter for Zustand persist using Expo Secure Store
const zustandSecureStore = {
  getItem: async (name: string) => {
    const value = await SecureStore.getItemAsync(name);
    return value ? JSON.parse(value) : null;
  },
  setItem: async (name: string, value: any) => {
    await SecureStore.setItemAsync(name, JSON.stringify(value));
  },
  removeItem: async (name: string) => {
    await SecureStore.deleteItemAsync(name);
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isLoggedIn: false,
      isProfileComplete: false,
      isDriverRegistered: false,
      registrationStatus: 'OTP_PENDING',
      hasHydrated: false,
      isLoading: false,
      
      login: async (accessToken: string, user: Driver) => {
        await SecureStore.setItemAsync('driver-auth-token', String(accessToken));
        set({ 
          accessToken: String(accessToken), 
          user, 
          isLoggedIn: true,
          isProfileComplete: false // Will be set to true if profile is complete
        });
      },
      
      logout: async () => {
        await SecureStore.deleteItemAsync('driver-auth-token');
        set({ 
          accessToken: null, 
          user: null, 
          isLoggedIn: false, 
          isProfileComplete: false,
          isDriverRegistered: false,
          registrationStatus: 'OTP_PENDING',
          isLoading: false
        });
      },
      
      setProfileComplete: (complete: boolean) => {
        console.log('Auth store: Setting profile complete to:', complete);
        set((state: AuthState) => ({
          isProfileComplete: complete,
          user: state.user ? { ...state.user, isProfileComplete: complete } : null
        }));
        console.log('Auth store: Profile complete set successfully');
      },
      
      setDriverRegistered: (registered: boolean) => {
        set({ isDriverRegistered: registered });
      },

      setRegistrationStatus: (status: string) => {
        set({ registrationStatus: status });
      },
      
      setHasHydrated: (value: boolean) => {
        set({ hasHydrated: value });
      },
      
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
      
      updateUser: (user: Driver) => {
        set((state: AuthState) => ({
          user: { ...user, isProfileComplete: state.isProfileComplete }
        }));
      },
      
      refreshToken: (newToken: string) => {
        set({ accessToken: newToken });
      },
    }),
    {
      name: 'driver-auth-storage',
      storage: zustandSecureStore,
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);
