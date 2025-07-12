import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

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
      // Navigate to main app after last screen
      router.replace('/(tabs)');
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  const handleGetStarted = () => {
    router.replace('./auth/phone-input');
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
        <View className="flex-row justify-center mb-24">
          {onboardingData.map((_, index) => (
            <View
              key={index}
              className={`w-2 h-2 rounded-full mx-1 ${
                index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
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
            <Text className="text-blue-600 text-base font-semibold">Back</Text>
          </TouchableOpacity>

          {/* Next/Get Started Button */}
          <TouchableOpacity
            onPress={isLastScreen ? handleGetStarted : handleNext}
            className="bg-blue-600 py-3 px-8 rounded-lg"
          >
            <Text className="text-white text-base font-semibold">
              {isLastScreen ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
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
