import { useAuthStore } from '../lib/stores/auth.store';
import { useProfileStore } from '../lib/stores/profile.store';

/**
 * Test utility to verify authentication flow
 * This can be used in development to test different states
 */
export class AuthFlowTester {
  static logCurrentState() {
    const authState = useAuthStore.getState();
    const profileState = useProfileStore.getState();

    console.log('=== AUTH FLOW STATE ===');
    console.log('Auth Store:', {
      isLoggedIn: authState.isLoggedIn,
      isProfileComplete: authState.isProfileComplete,
      hasHydrated: authState.hasHydrated,
      hasAccessToken: !!authState.accessToken,
      userId: authState.user?.id,
      userPhone: authState.user?.phone,
    });

    console.log('Profile Store:', {
      profilesCount: profileState.profiles.length,
      activeProfileId: profileState.activeProfile?.id,
      activeProfileName: profileState.activeProfile?.name,
      activeProfileType: profileState.activeProfile?.type,
      isLoading: profileState.isLoading,
      error: profileState.error,
    });

    console.log('Computed States:', {
      isAuthenticated: authState.isLoggedIn && authState.isProfileComplete,
      needsProfileSetup: authState.isLoggedIn && !authState.isProfileComplete,
      isReady: authState.hasHydrated && (authState.isLoggedIn ? authState.isProfileComplete : true),
    });
    console.log('========================');
  }

  static simulateNewUser() {
    const { login, setProfileComplete } = useAuthStore.getState();
    
    // Simulate a new user login
    login('test-token', {
      id: 'test-user-id',
      phone: '+94712345678',
      isProfileComplete: false,
    });
    
    console.log('✅ Simulated new user login');
    this.logCurrentState();
  }

  static simulateExistingUser() {
    const { login, setProfileComplete } = useAuthStore.getState();
    
    // Simulate an existing user login
    login('test-token', {
      id: 'test-user-id',
      phone: '+94712345678',
      isProfileComplete: true,
    });
    
    console.log('✅ Simulated existing user login');
    this.logCurrentState();
  }

  static simulateProfileComplete() {
    const { setProfileComplete } = useAuthStore.getState();
    setProfileComplete(true);
    console.log('✅ Simulated profile completion');
    this.logCurrentState();
  }

  static simulateLogout() {
    const { logout } = useAuthStore.getState();
    logout();
    console.log('✅ Simulated logout');
    this.logCurrentState();
  }

  static simulateProfileLoading() {
    const { loadProfiles } = useProfileStore.getState();
    
    // Simulate loading profiles
    loadProfiles('test-token');
    console.log('✅ Simulated profile loading');
    this.logCurrentState();
  }

  static simulateProfileSwitch(profileId: string) {
    const { setActiveProfile } = useProfileStore.getState();
    setActiveProfile(profileId);
    console.log(`✅ Switched to profile: ${profileId}`);
    this.logCurrentState();
  }

  static runFullFlowTest() {
    console.log('🧪 Running full authentication flow test...');
    
    // Test 1: New user flow
    console.log('\n--- Test 1: New User Flow ---');
    this.simulateNewUser();
    
    // Test 2: Profile completion
    console.log('\n--- Test 2: Profile Completion ---');
    this.simulateProfileComplete();
    
    // Test 3: Profile loading
    console.log('\n--- Test 3: Profile Loading ---');
    this.simulateProfileLoading();
    
    // Test 4: Profile switching
    console.log('\n--- Test 4: Profile Switching ---');
    this.simulateProfileSwitch('test-profile-id');
    
    // Test 5: Logout
    console.log('\n--- Test 5: Logout ---');
    this.simulateLogout();
    
    console.log('\n✅ Full authentication flow test completed!');
  }

  static checkRouteProtection() {
    const authState = useAuthStore.getState();
    
    console.log('🔒 Route Protection Check:');
    console.log('Unauthenticated routes:', !authState.isLoggedIn);
    console.log('Registration routes:', authState.isLoggedIn && !authState.isProfileComplete);
    console.log('Protected routes:', authState.isLoggedIn && authState.isProfileComplete);
  }
}

/**
 * React hook for testing authentication flow in components
 */
export function useAuthFlowTest() {
  return {
    logState: AuthFlowTester.logCurrentState,
    simulateNewUser: AuthFlowTester.simulateNewUser,
    simulateExistingUser: AuthFlowTester.simulateExistingUser,
    simulateProfileComplete: AuthFlowTester.simulateProfileComplete,
    simulateLogout: AuthFlowTester.simulateLogout,
    simulateProfileLoading: AuthFlowTester.simulateProfileLoading,
    simulateProfileSwitch: AuthFlowTester.simulateProfileSwitch,
    runFullTest: AuthFlowTester.runFullFlowTest,
    checkRouteProtection: AuthFlowTester.checkRouteProtection,
  };
} 