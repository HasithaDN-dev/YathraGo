// mobile-driver/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService } from '../services/api';

interface User {
  id?: number;
  phone: string;
  userType: string;
  isVerified: boolean;
  isNewUser: boolean;
  registrationStatus?: string;
}

interface Profile {
  driver_id: number;
  name: string;
  phone: string;
  email?: string;
  status: string;
  registrationStatus: string;
  NIC?: string;
  address?: string;
  date_of_birth?: string;
  gender?: string;
  profile_picture_url?: string;
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const response = await ApiService.validateToken(token);
        setIsAuthenticated(true);
        setUser(response.user);
        
        // Get full profile
        const profileResponse = await ApiService.getProfile(token);
        setProfile(profileResponse.profile);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await AsyncStorage.multiRemove(['authToken', 'userProfile']);
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async (phone: string) => {
    setError(null);
    setLoading(true);
    try {
      const response = await ApiService.sendDriverOtp(phone);
      setLoading(false);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send OTP';
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  };

  const verifyOtp = async (phone: string, otp: string) => {
    setError(null);
    setLoading(true);
    try {
      const response = await ApiService.verifyDriverOtp(phone, otp);
      
      // Store token and user data
      await AsyncStorage.setItem('authToken', response.accessToken);
      await AsyncStorage.setItem('userProfile', JSON.stringify(response.user));
      
      setIsAuthenticated(true);
      setUser(response.user);
      setProfile(response.profile);
      setLoading(false);
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid OTP';
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        await ApiService.logout(token);
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      await AsyncStorage.multiRemove(['authToken', 'userProfile']);
      setIsAuthenticated(false);
      setUser(null);
      setProfile(null);
      setLoading(false);
    }
  };

  const checkRegistrationStatus = async (phone: string) => {
    // Registration status will be determined by the driver module
    // after OTP verification, so no need for separate check
    return { exists: false, registrationStatus: 'NEW' };
  };

  const refreshProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const profileResponse = await ApiService.getProfile(token);
        setProfile(profileResponse.profile);
        setUser(profileResponse.user);
      }
    } catch (error) {
      console.error('Profile refresh failed:', error);
    }
  };

  return {
    isAuthenticated,
    user,
    profile,
    loading,
    error,
    sendOtp,
    verifyOtp,
    logout,
    checkRegistrationStatus,
    refreshProfile,
    clearError: () => setError(null),
  };
};
