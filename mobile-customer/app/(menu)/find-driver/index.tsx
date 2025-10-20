import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { router } from 'expo-router';
import { Car, List, ArrowRight } from 'phosphor-react-native';
import { Colors } from '@/constants/Colors';

export default function FindDriverScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScreenHeader title="Find Driver" showBackButton />
      
      <View className="px-4 pt-4">
        {/* Find New Vehicle Card */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push('/(menu)/(homeCards)/find_vehicle')}
        >
          <Card className="p-5 mb-4">
            <View className="flex-row items-center">
              <View className="w-14 h-14 bg-blue-100 rounded-full items-center justify-center mr-4">
                <Car size={28} color="#3B82F6" weight="regular" />
              </View>
              <View className="flex-1 mr-3">
                <Typography variant="title-3" weight="semibold" className="text-brand-deepNavy mb-1">
                  Find New Vehicle
                </Typography>
                <Typography variant="footnote" className="text-brand-neutralGray">
                  Search for available drivers and vehicles
                </Typography>
              </View>
              <ArrowRight size={24} color={Colors.neutralGray} weight="regular" />
            </View>
          </Card>
        </TouchableOpacity>
        
        {/* View Sent Requests Card */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push('/(menu)/find-driver/request-list')}
        >
          <Card className="p-5">
            <View className="flex-row items-center">
              <View className="w-14 h-14 bg-green-100 rounded-full items-center justify-center mr-4">
                <List size={28} color="#10B981" weight="regular" />
              </View>
              <View className="flex-1 mr-3">
                <Typography variant="title-3" weight="semibold" className="text-brand-deepNavy mb-1">
                  View Sent Requests
                </Typography>
                <Typography variant="footnote" className="text-brand-neutralGray">
                  Check status of your ride requests
                </Typography>
              </View>
              <ArrowRight size={24} color={Colors.neutralGray} weight="regular" />
            </View>
          </Card>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
