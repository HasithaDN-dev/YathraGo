import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

const onboardingData = [
  {
    id: 1,
    title: "Drive with Yathra Go",
    description: "Earn more. Drive freely. Connect with thousands of passengers every day",
    image: require('../assets/images/preview1.png'),
  },
  {
    id: 2,
    title: "Smart Navigation",
    description: "Get optimized routes with incoming updates to reach faster",
    image: require('../assets/images/preview2.png'),
  },
  {
    id: 3,
    title: "Earn and Track Instantly",
    description: "See your earnings quickly and cash out anytime",
    image: require('../assets/images/preview3.png'),
  },
  {
    id: 4,
    title: "Safety First",
    description: "Live tracking, and trusted passengers for your peace of mind",
    image: require('../assets/images/preview4.png'),
  },
  {
    id: 5,
    title: "Let's Ride Together, Safely",
    description: "Make each journey safe, timely, and reliable for your passengers.",
    image: require('../assets/images/preview5.png'),
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentItem = onboardingData[currentIndex];

  const handleNext = async () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Mark onboarding as seen and navigate to phone auth
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/(tabs)'); // Will be redirected to auth in index.tsx
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/(tabs)'); // Will be redirected to auth in index.tsx
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/(tabs)'); // Will be redirected to auth in index.tsx
  };

  const isLastScreen = currentIndex === onboardingData.length - 1;

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Skip Button */}
      <View className="absolute top-20 right-6 z-10">
        <TouchableOpacity onPress={handleSkip}>
          <Text className="text-blue-600 text-base font-semibold">Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View className="flex-1 items-center justify-center px-6">
        {/* Logo for last screen only */}
        {isLastScreen && (
          <View className="mb-6">
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logoImage}
              contentFit="contain"
            />
          </View>
        )}

        {/* Image */}
        <View className="w-80 h-80 mb-8">
          <Image
            source={currentItem.image}
            style={styles.onboardingImage}
            contentFit="contain"
          />
        </View>

        {/* Title */}
        <Text className="text-2xl font-bold text-gray-800 text-center mb-4">
          {currentItem.title}
        </Text>

        {/* Description */}
        <Text className="text-base text-gray-600 text-center leading-6 mb-8 px-4">
          {currentItem.description}
        </Text>

        {/* Progress Dots */}
        <View className="flex-row justify-center mb-4">
          {onboardingData.map((_, index) => (
            <View
              key={index}
              className={`w-2 h-2 rounded-full mx-1 ${
                index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </View>
      </View>

      {/* Bottom Navigation */}
      <View className="flex-row justify-between items-center px-6 pb-16">
        {/* Back Button */}
        <TouchableOpacity
          onPress={handleBack}
          className={`py-3 px-6 ${currentIndex === 0 ? 'opacity-0' : 'opacity-100'}`}
          disabled={currentIndex === 0}
        >
          <Text className="text-blue-600 text-base font-semibold">Back</Text>
        </TouchableOpacity>

        {/* Next/Get Started Button */}
        <TouchableOpacity
          onPress={isLastScreen ? handleGetStarted : handleNext}
          className="bg-blue-600 py-3 px-8 rounded-lg"
        >
          <Text className="text-white text-base font-semibold">
            {currentIndex === 0 ? 'Continue' : isLastScreen ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Complex image sizing that needs precise control
  onboardingImage: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  // Logo styling for the final screen
  logoImage: {
    width: 170,
    height: 170,
  },
});
