import React, { useEffect, useCallback, useRef } from 'react';
import { View, Animated } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as ExpSplashScreen from 'expo-splash-screen';
import { Typography } from '@/components/Typography';
import { useAuthState } from '@/hooks/useAuthState';

// Prevent splash screen from auto-hiding
ExpSplashScreen.preventAutoHideAsync();

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthState();
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoTranslateY = useRef(new Animated.Value(50)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(30)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const loadingOpacity = useRef(new Animated.Value(0)).current;

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

    // Sequenced animations for a premium feel
    const logoAnimation = Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(logoTranslateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]);

    const textAnimation = Animated.parallel([
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(textTranslateY, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]);

    const taglineAnimation = Animated.timing(taglineOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    });

    const loadingAnimation = Animated.timing(loadingOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    });

    // Start animations in sequence
    logoAnimation.start(() => {
      textAnimation.start(() => {
        taglineAnimation.start(() => {
          loadingAnimation.start();
        });
      });
    });

    // Navigate after optimal timing (2.5 seconds)
    const navTimer = setTimeout(() => {
      handleNavigation();
    }, 2500);

    return () => {
      clearTimeout(navTimer);
    };
  }, [logoOpacity, logoScale, logoTranslateY, textOpacity, textTranslateY, taglineOpacity, loadingOpacity, handleNavigation]);

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      <View className="flex-1 items-center justify-center px-8">
        
        {/* Logo Container */}
        <Animated.View 
          style={{
            opacity: logoOpacity,
            transform: [
              { scale: logoScale },
              { translateY: logoTranslateY }
            ]
          }}
          className="items-center mb-8"
        >
          <View className="bg-white rounded-3xl p-6 shadow-2xl border border-brand-lightGray">
            <Image
              source={require('../assets/images/logo.png')}
              style={{ width: 120, height: 120 }}
              contentFit="contain"
            />
          </View>
        </Animated.View>

        {/* App Name */}
        <Animated.View
          style={{
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }]
          }}
          className="items-center mb-4"
        >
          <Typography variant="large-title" weight="bold" className="text-brand-deepNavy text-center">
            YathraGo
          </Typography>
          <Typography variant="headline" weight="medium" className="text-brand-brightOrange">
            Driver
          </Typography>
        </Animated.View>

        {/* Tagline */}
        <Animated.View
          style={{ opacity: taglineOpacity }}
          className="items-center mb-12"
        >
          <Typography variant="body" className="text-brand-neutralGray text-center leading-6">
            Professional Transport Service Platform
          </Typography>
          <Typography variant="body" weight="medium" className="text-brand-warmYellow text-center mt-2">
            Drive. Earn. Connect.
          </Typography>
        </Animated.View>

        {/* Loading Indicator */}
        <Animated.View
          style={{ opacity: loadingOpacity }}
          className="absolute bottom-20 items-center"
        >
          <View className="w-16 h-1 bg-brand-lightGray rounded-full overflow-hidden">
            <Animated.View 
              className="h-full bg-brand-brightOrange rounded-full"
              style={{
                width: '100%',
                transform: [{
                  translateX: logoOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-64, 0],
                  })
                }]
              }}
            />
          </View>
          <Typography variant="caption-1" className="text-brand-neutralGray mt-3">
            Loading...
          </Typography>
        </Animated.View>

      </View>
    </View>
  );
}
