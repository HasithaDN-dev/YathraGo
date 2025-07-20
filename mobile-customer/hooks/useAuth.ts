import { useEffect } from 'react';
import { useAuthStore } from '../lib/stores/auth.store';
import { useProfileStore } from '../lib/stores/profile.store';
import { tokenService } from '../lib/services/token.service';

export function useAuth() {
  const {
    isLoggedIn,
    isProfileComplete,
    hasHydrated,
    accessToken,
    user,
    login,
    logout,
    setProfileComplete,
    updateUser,
  } = useAuthStore();

  const {
    profiles,
    activeProfile,
    isLoading: profilesLoading,
    error: profilesError,
    loadProfiles,
    refreshProfiles,
    clearError,
  } = useProfileStore();

  // Auto-load profiles when user is authenticated and profile is complete
  useEffect(() => {
    if (hasHydrated && isLoggedIn && isProfileComplete && accessToken && profiles.length === 0 && !profilesLoading) {
      loadProfiles(accessToken);
    }
  }, [hasHydrated, isLoggedIn, isProfileComplete, accessToken, profiles.length, profilesLoading]);

  // Validate token on app start
  useEffect(() => {
    if (hasHydrated && isLoggedIn && accessToken) {
      const validateToken = async () => {
        try {
          await tokenService.validateToken(accessToken);
        } catch (error) {
          console.error('Token validation failed:', error);
          // Token is invalid, logout user
          await logout();
        }
      };
      validateToken();
    }
  }, [hasHydrated, isLoggedIn, accessToken]);

  const handleLogin = async (accessToken: string, user: any) => {
    await login(accessToken, user);
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleProfileComplete = (complete: boolean) => {
    setProfileComplete(complete);
  };

  const handleProfileUpdate = (updatedUser: any) => {
    updateUser(updatedUser);
  };

  const handleProfileRefresh = async () => {
    if (accessToken) {
      await refreshProfiles(accessToken);
    }
  };

  return {
    // Auth state
    isLoggedIn,
    isProfileComplete,
    hasHydrated,
    accessToken,
    user,
    
    // Profile state
    profiles,
    activeProfile,
    profilesLoading,
    profilesError,
    
    // Actions
    login: handleLogin,
    logout: handleLogout,
    setProfileComplete: handleProfileComplete,
    updateUser: handleProfileUpdate,
    loadProfiles,
    refreshProfiles: handleProfileRefresh,
    clearError,
    
    // Computed
    isAuthenticated: isLoggedIn && isProfileComplete,
    needsProfileSetup: isLoggedIn && !isProfileComplete,
    isReady: hasHydrated && (isLoggedIn ? isProfileComplete : true),
  };
} 