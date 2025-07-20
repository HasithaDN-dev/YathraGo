import React from 'react';
import { View, ScrollView } from 'react-native';
import { Typography } from '@/components/Typography';
import { Clock, MapPin, Users } from 'phosphor-react-native';

export default function HistoryScreen() {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-white px-6 pt-12 pb-4 border-b border-gray-100">
        <Typography variant="title-1" weight="bold" className="text-brand-deepNavy mb-2">
          Trip History
        </Typography>
        <Typography variant="body" className="text-brand-neutralGray">
          View your past trips and earnings
        </Typography>
      </View>

      <View className="px-6 py-4">
        <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Typography variant="headline" weight="semibold" className="text-brand-deepNavy">
              Today
            </Typography>
            <Typography variant="body" weight="bold" className="text-success">
              Rs. 2,450
            </Typography>
          </View>
          
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Clock size={16} color="#6b7280" weight="regular" />
              <Typography variant="caption-1" className="text-brand-neutralGray ml-1">
                3 trips completed
              </Typography>
            </View>
            <View className="flex-row items-center">
              <Users size={16} color="#6b7280" weight="regular" />
              <Typography variant="caption-1" className="text-brand-neutralGray ml-1">
                8 passengers
              </Typography>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Typography variant="headline" weight="semibold" className="text-brand-deepNavy">
              Yesterday
            </Typography>
            <Typography variant="body" weight="bold" className="text-success">
              Rs. 1,890
            </Typography>
          </View>
          
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Clock size={16} color="#6b7280" weight="regular" />
              <Typography variant="caption-1" className="text-brand-neutralGray ml-1">
                2 trips completed
              </Typography>
            </View>
            <View className="flex-row items-center">
              <Users size={16} color="#6b7280" weight="regular" />
              <Typography variant="caption-1" className="text-brand-neutralGray ml-1">
                6 passengers
              </Typography>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
