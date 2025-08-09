import React from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/Typography';

const terms: string[] = [
  'All users and staff must comply with applicable local, state, and national laws, including traffic and data protection regulations, while using the service.',
  'Service providers must ensure their vehicles are properly licensed, insured, and meet all safety and operational standards required by law.',
  'Drivers and staff must not engage in reckless or unsafe behavior, operate vehicles under the influence, or endanger the safety of passengers or the public.',
  'The company acts solely as a facilitator between passengers and drivers; any contract for transport services is between the passenger and the driver.',
  'Users are responsible for the accuracy of information provided and must not use the service for unlawful or unauthorized purposes.',
  'The company may limit, suspend, or terminate access to the service for violations of terms, unsafe conduct, or legal non‑compliance.',
  'Liability for damages caused by users (e.g., damage to vehicles) may result in penalties and compensation claims by the service provider.',
  'The company is not liable for indirect, consequential, or exemplary damages arising from the use of the service, except as required by applicable law.',
];

export default function LegalScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Legal" showBackButton />

        {/* Legal content card with its own scroll */}
        <View className="px-4 pb-8">
          <Card className="bg-gray-100 p-4 rounded-2xl">
            <ScrollView className="max-h-[520px]" showsVerticalScrollIndicator>
              <View className="space-y-3">
                {terms.map((text, idx) => (
                  <View key={idx} className="flex-row items-start">
                    <View className="w-2 h-2 bg-gray-500 rounded-full mt-2 mr-2" />
                    <Typography variant="footnote" className="text-black flex-1">
                      {text}
                    </Typography>
                  </View>
                ))}
              </View>
            </ScrollView>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}