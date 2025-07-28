import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import React, { useEffect } from 'react';
import { Stack, SplashScreen } from 'expo-router';
import { useAuthStore } from '../lib/stores/auth.store';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';
import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const {
    isLoggedIn,
    isProfileComplete,
    isDriverRegistered,
    registrationStatus,
    hasHydrated,
    isLoading,
  } = useAuthStore();
  
  // Optimize font loading - load only essential fonts first
  const [loaded, error] = useFonts({
    'Figtree-Regular': require('../assets/fonts/Figtree-Regular.ttf'),
    'Figtree-Medium': require('../assets/fonts/Figtree-Medium.ttf'),
    // Load heavy fonts after initial render
    'Figtree-SemiBold': require('../assets/fonts/Figtree-SemiBold.ttf'),
    'Figtree-Bold': require('../assets/fonts/Figtree-Bold.ttf'),
  });

  // Debug hydration and font loading
  console.log('RootLayout hydration/font:', { loaded, error, hasHydrated, isLoggedIn, isProfileComplete, isDriverRegistered, registrationStatus });
  console.log('RootLayout route guards:', {
    authGuard: !isLoggedIn,
    registrationGuard: isLoggedIn && (registrationStatus === 'OTP_PENDING' || registrationStatus === 'OTP_VERIFIED'),
    tabsGuard: isLoggedIn && registrationStatus === 'ACCOUNT_CREATED'
  });

  useEffect(() => {
    // Hide splash screen as soon as fonts are loaded and hydration is complete
    if ((loaded || error) && hasHydrated) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error, hasHydrated]);

  // Show splash screen until everything is ready
  if ((!loaded && !error) || !hasHydrated || isLoading) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Protected routes - only accessible when authenticated and has complete profile */}
        <Stack.Protected guard={isLoggedIn && registrationStatus === 'ACCOUNT_CREATED'}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="vehicle-list" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
        </Stack.Protected>

        {/* Auth routes - accessible to both authenticated and unauthenticated users */}
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />

        {/* Unauthenticated user routes */}


        {/* Success screen - accessible to all users */}
        <Stack.Screen name="success" options={{ headerShown: false }} />

        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}