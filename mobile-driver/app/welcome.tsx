import React, { useEffect, useCallback, useRef } from 'react';
import { View, Animated } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

// Prevent splash screen from showing immediately
SplashScreen.preventAutoHideAsync().then(() => {
  SplashScreen.hideAsync();
});

export default function WelcomeScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.1)).current;

  const handleNavigation = useCallback(() => {
    router.replace('./onboarding');
  }, [router]);

  useEffect(() => {
    // Immediately hide the default splash screen to prevent it from showing
    SplashScreen.hideAsync();

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

    // Auto navigate to main app after 3 seconds
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
          style={{
            width: 300,
            height: 300,
          }}
          contentFit="contain"
        />
      </Animated.View>
    </View>
  );
}
