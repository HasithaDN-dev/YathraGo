import { View, Text, ScrollView } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-success p-6 pt-12">
        <Text className="text-white text-3xl font-bold text-center">🚗 YathraGo Driver</Text>
        <Text className="text-green-100 text-center mt-2">Professional Ride Service Platform</Text>
      </View>
      
      {/* YathraGo Driver Welcome Section */}
      <View className="flex-1 items-center justify-center bg-white p-6 mb-4 rounded-lg shadow-sm">
        <Text className="text-3xl font-bold text-green-600 mb-4">
          🚗 YathraGo Driver
        </Text>
        <View className="bg-brand-successGreen p-6 rounded-lg shadow-lg w-full">
          <Text className="text-white text-center text-lg font-semibold">
            Professional Ride Service Platform
          </Text>
        </View>
        <Text className="text-gray-600 text-center mt-4 text-base">
          Start earning with Sri Lanka&apos;s trusted ride-sharing platform
        </Text>
      </View>
      
      {/* Driver Action Cards */}
      <View className="space-y-4 mb-6">
        <View className="bg-brand-successGreen p-6 rounded-lg shadow-sm">
          <Text className="text-white text-xl font-bold mb-2">
            � Go Online
          </Text>
          <Text className="text-green-100 text-sm">
            Start receiving ride requests
          </Text>
        </View>
        
        <View className="bg-brand-deepNavy p-6 rounded-lg shadow-sm">
          <Text className="text-white text-xl font-bold mb-2">
            📊 View Earnings
          </Text>
          <Text className="text-brand-lightNavy text-sm">
            Track your daily and weekly income
          </Text>
        </View>
        
        <View className="bg-brand-brightOrange p-6 rounded-lg shadow-sm">
          <Text className="text-white text-xl font-bold mb-2">
            🗺️ Navigation
          </Text>
          <Text className="text-orange-100 text-sm">
            GPS guidance to passenger locations
          </Text>
        </View>
      </View>

      <ThemedView className="flex-row items-center gap-2">
        <ThemedText type="title">Driver Hub</ThemedText>
      </ThemedView>
      
      <ThemedView className="gap-2 mb-2">
        <ThemedText type="subtitle">Step 1: Go Online</ThemedText>
        <ThemedText>
          Toggle your availability to start receiving ride requests from passengers in your area.
        </ThemedText>
      </ThemedView>
      
      <ThemedView className="gap-2 mb-2">
        <ThemedText type="subtitle">Step 2: Accept Rides</ThemedText>
        <ThemedText>
          Review ride details and accept requests that match your preferences and location.
        </ThemedText>
      </ThemedView>
      
      <ThemedView className="gap-2 mb-2">
        <ThemedText type="subtitle">Step 3: Navigate & Complete</ThemedText>
        <ThemedText>
          Use built-in navigation to reach passengers and complete rides safely and efficiently.
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );
}
