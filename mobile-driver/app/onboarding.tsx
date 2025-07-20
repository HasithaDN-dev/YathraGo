import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Typography } from '@/components/Typography';
import CustomButton from '@/components/ui/CustomButton';

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

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Navigate to phone auth after completing onboarding
      router.replace('/(auth)/phone-auth');
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)/phone-auth');
  };

  const handleGetStarted = () => {
    router.replace('/(auth)/phone-auth');
  };

  const isLastScreen = currentIndex === onboardingData.length - 1;

  return (
    <View className="flex-1 flex-col justify-between bg-white px-8 py-16">
      <StatusBar style="dark" />

      {/* Skip Button */}
      <View className="flex-row justify-end mb-4 mt-6">
        <TouchableOpacity onPress={handleSkip}>
          <Typography variant="tappable" className="text-brand-warmYellow">Skip</Typography>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View className="flex-1 items-center justify-center py-6">

        {/* Image */}
        <View className="mb-8 w-[288px] h-[288px] items-center justify-center overflow-hidden self-center" >
          <Image
            source={currentItem.image}
            style={{ width: 288, height: 288, borderRadius: 24 }}
            contentFit='contain'
          />
        </View>

        {/* Title */}
        <Typography variant="title-1" className="text-center mb-4">
          {currentItem.title}
        </Typography>

        {/* Description */}
        <Typography variant="body" className="text-center mb-8 px-4 text-brand-neutralGray">
          {currentItem.description}
        </Typography>

        {/* Progress Dots */}
        <View className="flex-row justify-center mb-16">
          {onboardingData.map((_, index) => (
            <View
              key={index}
              className={`w-2 h-2 rounded-full mx-1 ${index === currentIndex ? 'bg-brand-brightOrange' : 'bg-brand-lightGray'
                }`}
            />
          ))}
        </View>
      </View>

      {/* Bottom Navigation - Moved up */}
      <View className="flex-row justify-between items-center w-full px-0">
        {/* Back Button */}
        <TouchableOpacity
          onPress={handleBack}
          className={`py-3 px-6 ${currentIndex === 0 ? 'opacity-0' : 'opacity-100'}`}
          disabled={currentIndex === 0}
        >
          <Typography variant="tappable" className="text-brand-navyBlue">Back</Typography>
        </TouchableOpacity>

        {/* Next/Get Started Button */}
        <CustomButton
          title={isLastScreen ? 'Get Started' : 'Next'}
          onPress={isLastScreen ? handleGetStarted : handleNext}
          size="large"
          fullWidth={false}
        />
      </View>
    </View>
  );
}