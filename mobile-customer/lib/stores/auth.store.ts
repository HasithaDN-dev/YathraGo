// Manages the core authentication state: token, user object, and status.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../../types/auth.types';
import { saveToken, deleteToken } from '../storage/secure.storage';
import * as SecureStore from 'expo-secure-store';


interface AuthState {
  user: User | null;
  token: string | null;
  status: 'isLoading' | 'isSignedOut' | 'isSignedIn';
  hasHydrated: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  setProfileComplete: () => void;
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
      token: null,
      status: 'isLoading',
      hasHydrated: false,
      login: async (token: string, user: User) => {
        await saveToken(token);
        set({ token, user, status: 'isSignedIn' });
      },
      logout: async () => {
        await deleteToken();
        set({ token: null, user: null, status: 'isSignedOut' });
      },
      setProfileComplete: () => {
        set((state: AuthState) => ({
          user: state.user ? { ...state.user, isProfileComplete: true } : null
        }));
      },
    }),
    {
      name: 'auth-storage',
      storage: zustandSecureStore,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        status: state.status,
        hasHydrated: state.hasHydrated,
        // Do not persist functions
      }),
      onRehydrateStorage: (state: any) => (persistedState: any, error?: unknown) => {
        if (!error) {
          state.setState({ hasHydrated: true });
        } else {
          state.setState({ hasHydrated: true, status: 'isSignedOut', token: null, user: null });
        }
      },
    }
  )
);

// No need for manual hydrate call; Zustand persist handles hydration and sets hasHydrated.