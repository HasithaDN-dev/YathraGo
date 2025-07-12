import React, { useEffect, useCallback, useRef } from 'react';
import { View, Animated } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as ExpSplashScreen from 'expo-splash-screen';
import { useAuthState } from '@/hooks/useAuthState';

// Prevent splash screen from auto-hiding
ExpSplashScreen.preventAutoHideAsync();

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthState();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.1)).current;

  const handleNavigation = useCallback(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    } else {
      // All unauthenticated users go through onboarding for consistent experience
      router.replace('./onboarding');
    }
  }, [router, isAuthenticated]);

  useEffect(() => {
    // Hide the default Expo splash screen
    ExpSplashScreen.hideAsync();

    // Start animations immediately
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      })
    ]).start();

    // Auto navigate after 3 seconds
    const navTimer = setTimeout(() => {
      handleNavigation();
    }, 3000);

    return () => {
      clearTimeout(navTimer);
    };
  }, [fadeAnim, scaleAnim, handleNavigation]);

  return (
    <View className="flex-1 bg-white items-center justify-center">
      <StatusBar style="dark" />
      
      {/* Logo with animations */}
      <Animated.View 
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }}
        className="items-center justify-center"
      >
        <Image
          source={require('../assets/images/logo.png')}
          className="w-80 h-80"
          contentFit="contain"
        />
      </Animated.View>
    </View>
  );
}
