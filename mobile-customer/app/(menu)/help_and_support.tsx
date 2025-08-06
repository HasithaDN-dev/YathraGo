import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ArrowRight } from 'phosphor-react-native';
import { router } from 'expo-router';

const supportOptions = [
  { id: '1', title: 'App Issues' },
  { id: '2', title: 'Payment Issues' },
  { id: '3', title: 'Other Issues' },
  { id: '4', title: 'Support' },
];

export default function HelpAndSupportScreen() {
  const handleOptionPress = (optionId: string) => {
    if (optionId === '1') {
      router.push('/(menu)/app_issues');
    } else {
      // Handle navigation to other support options if needed
      console.log('Navigating to:', optionId);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ScreenHeader title="Help and Support" showBackButton />

        {/* Support Options Card */}
        <Card className="mx-4 mb-8 bg-gray-100 p-6 rounded-2xl shadow-md">
          {supportOptions.map((option, index) => (
            <TouchableOpacity
              key={option.id}
              className={`flex-row items-center justify-between bg-white rounded-xl px-4 py-4 shadow-sm ${
                index !== supportOptions.length - 1 ? 'mb-4' : ''
              }`}
              activeOpacity={0.8}
              onPress={() => handleOptionPress(option.id)}
            >
              <Typography variant="subhead" className="text-black">
                {option.title}
              </Typography>
              <ArrowRight size={20} color="#222" weight="regular" />
            </TouchableOpacity>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
} 