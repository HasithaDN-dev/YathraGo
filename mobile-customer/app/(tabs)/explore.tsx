import React from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';

export default function ExploreScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4 py-6">
        <View className="space-y-6">
          {/* Header */}
          <View className="space-y-2">
            <Typography variant="headline-large" className="text-black">
              Explore
            </Typography>
            <Typography variant="body-medium" className="text-brand-neutralGray">
              Discover new destinations and travel options
            </Typography>
          </View>

          {/* Content sections would go here */}
          <View className="space-y-4">
            <Typography variant="headline-medium" className="text-black">
              Popular Destinations
            </Typography>
            <Typography variant="body-medium" className="text-brand-neutralGray">
              Coming soon...
            </Typography>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}