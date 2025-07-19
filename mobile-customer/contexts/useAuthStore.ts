import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  checkAuthState: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  loading: true,

  checkAuthState: async () => {
    set({ loading: true });
    try {
      const token = await SecureStore.getItemAsync('authToken');
      const userProfile = await SecureStore.getItemAsync('userProfile');
      if (token && userProfile) {
        set({ isAuthenticated: true, user: JSON.parse(userProfile) });
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      set({ loading: false });
    }
  },

  login: async (token, userData) => {
    try {
      await SecureStore.setItemAsync('authToken', token);
      await SecureStore.setItemAsync('userProfile', JSON.stringify(userData));
      set({ isAuthenticated: true, user: userData });
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('userProfile');
      set({ isAuthenticated: false, user: null });
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  },

  updateUser: async (userData) => {
    const { user } = get();
    if (user) {
      const updatedUser = { ...user, ...userData };
      await SecureStore.setItemAsync('userProfile', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    }
  },
}));

// Optionally, call checkAuthState on app start (e.g., in your App.tsx or _layout.tsx)
