import React from 'react';
import { View, ScrollView } from 'react-native';
import { Typography } from '@/components/Typography';
import { Bell, Clock, CheckCircle } from 'phosphor-react-native';

export default function NotificationsScreen() {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-white px-6 pt-12 pb-4 border-b border-gray-100">
        <Typography variant="title-1" weight="bold" className="text-brand-deepNavy mb-2">
          Notifications
        </Typography>
        <Typography variant="body" className="text-brand-neutralGray">
          Stay updated with important alerts
        </Typography>
      </View>

      <View className="px-6 py-4">
        <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1">
              <Typography variant="body" weight="semibold" className="text-brand-deepNavy">
                New Trip Assignment
              </Typography>
              <Typography variant="caption-1" className="text-brand-neutralGray">
                You have been assigned to pick up 3 students from Maharagama
              </Typography>
            </View>
            <View className="bg-brand-brightOrange p-2 rounded-full ml-3">
              <Bell size={16} color="#ffffff" weight="regular" />
            </View>
          </View>
          <View className="flex-row items-center">
            <Clock size={14} color="#6b7280" weight="regular" />
            <Typography variant="caption-1" className="text-brand-neutralGray ml-1">
              2 minutes ago
            </Typography>
          </View>
        </View>

        <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1">
              <Typography variant="body" weight="semibold" className="text-brand-deepNavy">
                Trip Completed
              </Typography>
              <Typography variant="caption-1" className="text-brand-neutralGray">
                Successfully completed trip to Royal College
              </Typography>
            </View>
            <View className="bg-success p-2 rounded-full ml-3">
              <CheckCircle size={16} color="#ffffff" weight="regular" />
            </View>
          </View>
          <View className="flex-row items-center">
            <Clock size={14} color="#6b7280" weight="regular" />
            <Typography variant="caption-1" className="text-brand-neutralGray ml-1">
              1 hour ago
            </Typography>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
