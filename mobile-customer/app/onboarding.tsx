import React, { useState } from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Typography } from '@/components/Typography';

const onboardingData = [
  {
    id: 1,
    title: "What is YathraGo?",
    description: "Your trusted partner for secure and convenient school and staff transportation. Make every journey safe, timely, and reliable for your loved ones and colleagues.",
    image: require('../assets/images/preview1.png'),
  },
  {
    id: 2,
    title: "Child's Safe Journey",
    description: "Effortlessly book school transport, track your child's journey in real-time, and receive instant alerts for boarding and arrival. Your child's safety is our priority.",
    image: require('../assets/images/preview2.png'),
  },
  {
    id: 3,
    title: "Seamless Commutes",
    description: "Book convenient office transport, track your ride's ETA, and get location alarms. Enjoy a stress-free journey to and from work every day.",
    image: require('../assets/images/preview3.png'),
  },
  {
    id: 4,
    title: "Real-time Tracking Safety Features",
    description: "Live tracking of your vehicle, instant notifications for arrivals and departures, direct access to emergency contacts, and the assurance of backup vehicles and drivers for peace of mind on every trip.",
    image: require('../assets/images/preview4.png'),
  },
  {
    id: 5,
    title: "Easy Payments & Support",
    description: "Securely manage payments, view your trip history, provide feedback, and easily communicate with drivers or support staff, all within the app.",
    image: require('../assets/images/preview5.png'),
  },
  {
    id: 6,
    title: "Ready to Simplify Your Commute?",
    description: "Whether it's a safe journey for your child to school or a convenient ride for you to work, YathraGo is here to make transportation easy and reliable.",
    image: require('../assets/images/preview6.png'),
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
              className="w-40 h-40"
              resizeMode="contain"
            />
          </View>
        )}

        {/* Image */}
        <View className="mb-8">
          <Image
            source={currentItem.image}
            className="w-72 h-72 rounded-2xl"
            resizeMode="contain"
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
        <View className="flex-row justify-center mb-24">
          {onboardingData.map((_, index) => (
            <View
              key={index}
              className={`w-2 h-2 rounded-full mx-1 ${
                index === currentIndex ? 'bg-brand-deepNavy' : 'bg-brand-lightGray'
              }`}
            />
          ))}
        </View>

        {/* Bottom Navigation - Moved up */}
        <View className="flex-row justify-between items-center w-full px-0 mt-">
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
              {isLastScreen ? 'Get Started' : 'Next'}
            </Typography>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
