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
    isCustomerRegistered,
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
  console.log('RootLayout hydration/font:', { loaded, error, hasHydrated, isLoggedIn, isProfileComplete, isCustomerRegistered });
  console.log('RootLayout route guards:', {
    authGuard: !isLoggedIn,
    registrationGuard: isLoggedIn && !isProfileComplete,
    tabsGuard: isLoggedIn && isProfileComplete
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
        {/* Protected routes - only accessible when authenticated and profile complete */}
        <Stack.Protected guard={isLoggedIn && isProfileComplete}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(main)" options={{ headerShown: false }} />
        </Stack.Protected>

        {/* Registration routes - accessible when authenticated but no profiles created yet */}
        <Stack.Protected guard={isLoggedIn && !isProfileComplete}>
          <Stack.Screen name="(registration)" options={{ headerShown: false }} />
        </Stack.Protected>

        {/* Unauthenticated user routes */}
        <Stack.Protected guard={!isLoggedIn}>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack.Protected>

        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}