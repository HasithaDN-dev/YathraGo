import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Typography } from '@/components/Typography';

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
          <Typography variant="label-large" className="text-brand-deepNavy">Skip</Typography>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View className="flex-1 items-center justify-center px-6">
        {/* Logo for last screen only */}
        {isLastScreen && (
          <View className="mb-6">
            <Image
              source={require('../assets/images/logo.png')}
              className="w-42 h-42"
              contentFit="contain"
            />
          </View>
        )}

        {/* Image */}
        <View className="w-80 h-80 mb-8">
          <Image
            source={currentItem.image}
            className="w-full h-full rounded-2xl"
            contentFit="contain"
          />
        </View>

        {/* Title */}
        <Typography variant="headline-large" className="text-center mb-4">
          {currentItem.title}
        </Typography>

        {/* Description */}
        <Typography variant="body-medium" className="text-center mb-8 px-4 text-brand-neutralGray">
          {currentItem.description}
        </Typography>

        {/* Progress Dots */}
        <View className="flex-row justify-center mb-4">
          {onboardingData.map((_, index) => (
            <View
              key={index}
              className={`w-2 h-2 rounded-full mx-1 ${
                index === currentIndex ? 'bg-brand-deepNavy' : 'bg-brand-lightGray'
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
          <Typography variant="label-large" className="text-brand-deepNavy">Back</Typography>
        </TouchableOpacity>

        {/* Next/Get Started Button */}
        <TouchableOpacity
          onPress={isLastScreen ? handleGetStarted : handleNext}
          className="bg-brand-deepNavy py-3 px-8 rounded-lg"
        >
          <Typography variant="label-large" className="text-white">
            {currentIndex === 0 ? 'Continue' : isLastScreen ? 'Get Started' : 'Next'}
          </Typography>
        </TouchableOpacity>
      </View>
    </View>
  );
}
