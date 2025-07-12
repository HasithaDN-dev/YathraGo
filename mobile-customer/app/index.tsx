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
        // Check if user has seen onboarding
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        
        // Check if user is authenticated
        const authToken = await AsyncStorage.getItem('authToken');
        const isAuthenticated = !!authToken;

        // For testing the profile system, let's set temporary auth
        if (!authToken) {
          await AsyncStorage.setItem('authToken', 'demo_token');
          await AsyncStorage.setItem('hasSeenOnboarding', 'true');
        }

        // Hide splash screen
        await SplashScreen.hideAsync();

        if (!hasSeenOnboarding) {
          // First time user - show welcome then onboarding
          router.replace('/welcome');
        } else if (!isAuthenticated) {
          // User has seen onboarding but not authenticated
          router.replace('/onboarding'); // Will navigate to auth after onboarding
        } else {
          // User is authenticated - go to main app
          router.replace('/(tabs)');
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
        await SplashScreen.hideAsync();
        router.replace('/welcome');
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
