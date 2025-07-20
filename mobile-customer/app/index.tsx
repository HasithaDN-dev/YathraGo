import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function IndexScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Development helper: Force reset app state (comment out for production)
        // Uncomment the line below to reset the app to first-time user state
        await AsyncStorage.clear(); // Remove this line when you want to test returning user flow
        
        // Check if user has seen onboarding
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        
        // Check if user is registered (staff or child)
        const isRegistered = await AsyncStorage.getItem('isRegistered');
        
        // Check if user is authenticated
        const authToken = await AsyncStorage.getItem('authToken');
        const isAuthenticated = !!authToken;

        // Hide splash screen
        await SplashScreen.hideAsync();

        if (!hasSeenOnboarding) {
          // First time user - show welcome then onboarding
          router.replace('/splash');
        } else if (!isAuthenticated) {
          // User has seen onboarding but not authenticated
          router.replace('/(auth)/phone-auth');
        } else if (!isRegistered) {
          // User is authenticated but not registered - show customer registration first  
          router.replace('/(registration)/customer-register' as any);
        } else {
          // User is authenticated and registered - go to main app
          router.replace('/(tabs)');
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
        await SplashScreen.hideAsync();
        router.replace('/splash');
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [router]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return null;
}
