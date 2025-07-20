import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { Stack, SplashScreen } from 'expo-router';
import { useAuthStore } from '../lib/stores/auth.store';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuthState } from '@/hooks/useAuthState';
import { RegistrationProvider } from '@/contexts/RegistrationContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const {
    isLoggedIn,
    isProfileCreated,
    hasHydrated,
  } = useAuthStore();
  const [loaded, error] = useFonts({
    'Figtree-Regular': require('../assets/fonts/Figtree-Regular.ttf'),
    'Figtree-Medium': require('../assets/fonts/Figtree-Medium.ttf'),
    'Figtree-SemiBold': require('../assets/fonts/Figtree-SemiBold.ttf'),
    'Figtree-Bold': require('../assets/fonts/Figtree-Bold.ttf'),
  });

  // Debug hydration and font loading
  console.log('RootLayout hydration/font:', { loaded, error, hasHydrated, isLoggedIn, isProfileCreated });

  useEffect(() => {
    if ((loaded || error) && hasHydrated) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error, hasHydrated]);

  if ((!loaded && !error) || isAuthLoading) {
    return null;
  }


  if (!loaded && !error) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RegistrationProvider>
        <Stack>
          {/* Entry point - splash screen accessible to all users */}
          <Stack.Screen name="splash" options={{ headerShown: false }} />

          {/* Protected routes - only accessible when authenticated */}
          <Stack.Protected guard={isAuthenticated === true}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="vehicle-list" options={{ headerShown: false }} />
          </Stack.Protected>

          {/* Unauthenticated user routes */}
          <Stack.Protected guard={isAuthenticated === false}>
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          </Stack.Protected>

          {/* Success screen - accessible to all users */}
          <Stack.Screen name="success" options={{ headerShown: false }} />

          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </RegistrationProvider>
      <Stack>
        {/* Protected routes - only accessible when authenticated */}
        <Stack.Protected guard={isLoggedIn && isProfileCreated}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack.Protected>

        {/* Unauthenticated user routes */}
        <Stack.Protected guard={!isLoggedIn}>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack.Protected>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />

        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
