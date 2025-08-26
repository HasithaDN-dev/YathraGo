import React from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/Typography';

const policyPoints: string[] = [
  'We collect personal information such as name, email address, phone number, occupation, and location details to provide and improve our transport services.',
  'Route plans, vehicle details (for staff/service providers), and identification information may be required for service verification and safety purposes.',
  'Location data is collected via GPS and network signals to enable accurate pick‑up and drop‑off, optimize routes, and ensure service quality.',
  'Usage data (including device information, access times, and app usage patterns) may be collected automatically to enhance app performance and user experience.',
  'We may use your information for promotional activities (e.g., SMS or email campaigns) only with your explicit consent. You can opt out at any time.',
  'Your personal data will not be sold, rented, or leased to third parties.',
  'Data may be shared with trusted partners or contractors solely to deliver and improve our services. These parties are required to maintain confidentiality.',
  'We retain data only as long as necessary for the purposes described and to comply with legal obligations.',
  'You may request access, correction, or deletion of your personal data via Settings → Privacy or by contacting support.',
];

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Privacy Policy" showBackButton />

        {/* Privacy content card with its own scroll */}
        <View className="px-4 pb-8">
          <Card className="bg-gray-100 p-4 rounded-2xl">
            <ScrollView className="max-h-[520px]" showsVerticalScrollIndicator>
              <View className="space-y-3">
                {policyPoints.map((text, idx) => (
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
