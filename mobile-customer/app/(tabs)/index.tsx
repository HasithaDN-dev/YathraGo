import { View, Text, StyleSheet } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <View style={styles.headerImage}>
          <Text className="text-2xl font-bold text-gray-800">🚗 YathraGo</Text>
        </View>
      }>
      
      {/* Welcome Header */}
      <View className="bg-white p-6 mb-4 rounded-lg shadow-sm">
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          Welcome to YathraGo! 🚗
        </Text>
        <Text className="text-gray-600 text-base">
          Your reliable ride-sharing companion
        </Text>
      </View>
      
      {/* Quick Action Cards */}
      <View className="space-y-4 mb-6">
        <View className="bg-blue-500 p-6 rounded-lg shadow-sm">
          <Text className="text-white text-lg font-semibold mb-2">
            � Book a Ride
          </Text>
          <Text className="text-blue-100 text-sm">
            Quick and easy booking process
          </Text>
        </View>
        
        <View className="bg-orange-500 p-6 rounded-lg shadow-sm">
          <Text className="text-white text-lg font-semibold mb-2">
            📍 Track Your Driver
          </Text>
          <Text className="text-orange-100 text-sm">
            Real-time location tracking
          </Text>
        </View>
        
        <View className="bg-green-500 p-6 rounded-lg shadow-sm">
          <Text className="text-white text-lg font-semibold mb-2">
            💳 Secure Payments
          </Text>
          <Text className="text-green-100 text-sm">
            Multiple payment options available
          </Text>
        </View>
      </View>
      
      <ThemedView className="flex-row items-center gap-2">
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView className="gap-2 mb-2">
        <ThemedText type="subtitle">Step 1: Set Your Location</ThemedText>
        <ThemedText>
          Allow location access to find nearby drivers and get accurate pickup times.
        </ThemedText>
      </ThemedView>
      <ThemedView className="gap-2 mb-2">
        <ThemedText type="subtitle">Step 2: Choose Your Ride</ThemedText>
        <ThemedText>
          Select from various vehicle types based on your needs and budget.
        </ThemedText>
      </ThemedView>
      <ThemedView className="gap-2 mb-2">
        <ThemedText type="subtitle">Step 3: Enjoy Your Journey</ThemedText>
        <ThemedText>
          Track your ride in real-time and enjoy a safe, comfortable journey.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  // Only keep complex positioning that Tailwind can't handle
  headerImage: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
