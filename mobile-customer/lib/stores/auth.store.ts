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
  isProfileCreated: boolean;
  hasHydrated: boolean;
  login: (accessToken: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  setProfileComplete: () => void;
  setProfileCreated: (created: boolean) => void;
  setHasHydrated: (value: boolean) => void;
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
      hasHydrated: false,
      isProfileCreated: false,
      login: async (accessToken: string, user: User) => {
        await SecureStore.setItemAsync('user-auth-token', String(accessToken));
        set({ accessToken: String(accessToken), user, isLoggedIn: true });
      },
      logout: async () => {
        await SecureStore.deleteItemAsync('user-auth-token');
        set({ accessToken: null, user: null, isLoggedIn: false, isProfileCreated: false });
      },
      setProfileComplete: () => {
        set((state: AuthState) => ({
          user: state.user ? { ...state.user, isProfileComplete: true } : null
        }));
      },
      setProfileCreated: (created: boolean) => {
        set({ isProfileCreated: created });
      },
      setHasHydrated: (value: boolean) => {
        set({ hasHydrated: value });
      },
    }),
    {
      name: 'auth-storage',
      storage: zustandSecureStore,
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isLoggedIn: state.isLoggedIn,
        hasHydrated: state.hasHydrated,
        // Do not persist functions
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

// No need for manual hydrate call; Zustand persist handles hydration and sets hasHydrated.