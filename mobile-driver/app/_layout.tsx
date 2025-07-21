import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {useEffect} from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuthState } from '@/hooks/useAuthState';


SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isAuthLoading } = useAuthState();
  const [loaded, error] = useFonts({
    'Figtree-Regular': require('../assets/fonts/Figtree-Regular.ttf'),
    'Figtree-Medium': require('../assets/fonts/Figtree-Medium.ttf'),
    'Figtree-SemiBold': require('../assets/fonts/Figtree-SemiBold.ttf'),
    'Figtree-Bold': require('../assets/fonts/Figtree-Bold.ttf'),
  });

  useEffect(() => {
    if ((loaded || error) && !isAuthLoading) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error, isAuthLoading]);

  if ((!loaded && !error) || isAuthLoading) {
    return null;
  }

  
  if (!loaded && !error) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Entry point - splash screen accessible to all users */}
        <Stack.Screen name="splash" options={{ headerShown: false }} />

        {/* Protected routes - only accessible when authenticated */}
        <Stack.Protected guard={isAuthenticated === true}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
        </Stack.Protected>

        {/* Unauthenticated user routes */}
        <Stack.Protected guard={isAuthenticated === false}>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          
        </Stack.Protected>

        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
