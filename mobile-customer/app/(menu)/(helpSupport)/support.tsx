import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { CaretDown } from 'phosphor-react-native';

const supportCategories = [
  {
    id: '1',
    title: 'Contact Support',
    solution: (
      <>
        <Typography variant="body" className="mb-2 text-black">Reach us via email: support@yathrago.example</Typography>
        <Typography variant="body" className="mb-2 text-black">Hotline: +94 11 123 4567 (9 AM – 6 PM)</Typography>
        <Typography variant="footnote" className="text-gray-500">We typically respond within 24–48 hours.</Typography>
      </>
    ),
  },
  {
    id: '2',
    title: 'Report a Problem',
    solution: (
      <>
        <Typography variant="body" className="mb-2 text-black">Provide clear steps to reproduce, screenshots, and your device info.</Typography>
        <Typography variant="body" className="mb-2 text-black">Use the in-app forms to submit complains/inquiries for faster tracking.</Typography>
        <Typography variant="footnote" className="text-gray-500">Sensitive data should not be shared in screenshots.</Typography>
      </>
    ),
  },
  {
    id: '3',
    title: 'Account & Data Requests',
    solution: (
      <>
        <Typography variant="body" className="mb-2 text-black">Request data export or account deletion via Settings → Privacy.</Typography>
        <Typography variant="body" className="mb-2 text-black">We follow standard verification before processing requests.</Typography>
        <Typography variant="footnote" className="text-gray-500">Processing may take up to 30 days as per policy.</Typography>
      </>
    ),
  },
  {
    id: '4',
    title: 'FAQs & Guides',
    solution: (
      <>
        <Typography variant="body" className="mb-2 text-black">Check our User Manual and Get Started guides for quick help.</Typography>
        <Typography variant="body" className="mb-2 text-black">Search common topics: payments, registration, trips, safety.</Typography>
        <Typography variant="footnote" className="text-gray-500">Guides are updated regularly with new features.</Typography>
      </>
    ),
  },
  {
    id: '5',
    title: 'Community & Feedback',
    solution: (
      <>
        <Typography variant="body" className="mb-2 text-black">Join our community channels to share suggestions.</Typography>
        <Typography variant="body" className="mb-2 text-black">Vote on feature requests to help prioritize improvements.</Typography>
        <Typography variant="footnote" className="text-gray-500">Constructive feedback helps us build better experiences.</Typography>
      </>
    ),
  },
  {
    id: '6',
    title: 'Safety & Security',
    solution: (
      <>
        <Typography variant="body" className="mb-2 text-black">For urgent safety concerns, use in-app emergency options.</Typography>
        <Typography variant="body" className="mb-2 text-black">Never share passwords or OTPs with anyone.</Typography>
        <Typography variant="footnote" className="text-gray-500">Report suspicious activity immediately.</Typography>
      </>
    ),
  },
];

export default function SupportScreen() {
  const [expandedId, setExpandedId] = useState<string | null>('1');
  const handleIssuePress = (issueId: string) => {
    setExpandedId(expandedId === issueId ? null : issueId);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Support" showBackButton />

        <Card className="mx-4 mb-8 bg-gray-100 p-6 rounded-2xl shadow-md">
          {supportCategories.map((issue, index) => {
            const expanded = expandedId === issue.id;
            return (
              <View key={issue.id} className={`w-full ${index !== supportCategories.length - 1 ? 'mb-4' : ''}`}>
                <TouchableOpacity
                  className={`flex-row items-center justify-between bg-white rounded-xl px-4 py-4 shadow-sm`}
                  activeOpacity={0.8}
                  onPress={() => handleIssuePress(issue.id)}
                >
                  <Typography variant="subhead" className="text-black">
                    {issue.title}
                  </Typography>
                  <CaretDown size={20} color="#222" weight="regular" style={{ transform: expanded ? [{ rotate: '180deg' }] : [] }} />
                </TouchableOpacity>
                {expanded && (
                  <View className="bg-white rounded-xl px-4 py-4 mt-2 shadow-sm border border-gray-200">
                    {issue.solution}
                    <Typography variant="footnote" className="text-blue-500 mt-2 self-end">more . . .</Typography>
                  </View>
                )}
              </View>
            );
          })}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
