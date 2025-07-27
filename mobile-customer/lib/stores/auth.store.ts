// Manages the core authentication state: token, user object, and status.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../../types/customer.types';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoggedIn: boolean;
  isProfileComplete: boolean;
  isCustomerRegistered: boolean;
  registrationStatus: string; // Add registration status tracking
  hasHydrated: boolean;
  isLoading: boolean;
  login: (accessToken: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  setProfileComplete: (complete: boolean) => void;
  setCustomerRegistered: (registered: boolean) => void;
  setRegistrationStatus: (status: string) => void; // Add method to update status
  setHasHydrated: (value: boolean) => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: User) => void;
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
      isCustomerRegistered: false,
      registrationStatus: 'OTP_PENDING',
      hasHydrated: false,
      isLoading: false,
      
      login: async (accessToken: string, user: User) => {
        await SecureStore.setItemAsync('user-auth-token', String(accessToken));
        set({ 
          accessToken: String(accessToken), 
          user, 
          isLoggedIn: true,
          isProfileComplete: false // Will be set to true if profiles are found
        });
      },
      
      logout: async () => {
        await SecureStore.deleteItemAsync('user-auth-token');
        set({ 
          accessToken: null, 
          user: null, 
          isLoggedIn: false, 
          isProfileComplete: false,
          isCustomerRegistered: false,
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
      
      setCustomerRegistered: (registered: boolean) => {
        set({ isCustomerRegistered: registered });
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
      
      updateUser: (user: User) => {
        set((state: AuthState) => ({
          user: { ...user, isProfileComplete: state.isProfileComplete }
        }));
      },
      
      refreshToken: (newToken: string) => {
        set({ accessToken: newToken });
      },
    }),
    {
      name: 'auth-storage',
      storage: zustandSecureStore,
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isLoggedIn: state.isLoggedIn,
        isProfileComplete: state.isProfileComplete,
        isCustomerRegistered: state.isCustomerRegistered,
        hasHydrated: state.hasHydrated,
      }),
      onRehydrateStorage: (state: any) => (persistedState: any, error?: unknown) => {
        if (!error) {
          console.log('[Zustand] Hydration complete', persistedState);
          state.setHasHydrated(true);
        } else {
          console.error('[Zustand] Hydration error:', error);
          state.setHasHydrated(true);
          state.logout && state.logout();
        }
      },
    }
  )
);