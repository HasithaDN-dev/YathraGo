import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { CaretDown } from 'phosphor-react-native';

const otherIssueCategories = [
  {
    id: '1',
    title: 'Notification Problems',
    solution: (
      <>
        <Typography variant="body" className="mb-2 text-black">Enable notifications in device settings and app permissions.</Typography>
        <Typography variant="body" className="mb-2 text-black">Ensure Do Not Disturb is off and the app is allowed in background.</Typography>
        <Typography variant="footnote" className="text-gray-500">Restart the app after changing notification settings.</Typography>
      </>
    ),
  },
  {
    id: '2',
    title: 'Location/GPS Issues',
    solution: (
      <>
        <Typography variant="body" className="mb-2 text-black">Turn on precise location and grant location permission to the app.</Typography>
        <Typography variant="body" className="mb-2 text-black">Toggle GPS off/on and ensure high-accuracy mode is enabled.</Typography>
        <Typography variant="footnote" className="text-gray-500">Test outdoors for better signal if GPS is inconsistent.</Typography>
      </>
    ),
  },
  {
    id: '3',
    title: 'Account Access Issues',
    solution: (
      <>
        <Typography variant="body" className="mb-2 text-black">Use the correct phone/email and reset your password if needed.</Typography>
        <Typography variant="body" className="mb-2 text-black">Check for typos or caps lock during login.</Typography>
        <Typography variant="footnote" className="text-gray-500">Contact support for locked accounts or verification problems.</Typography>
      </>
    ),
  },
  {
    id: '4',
    title: 'Data Sync Problems',
    solution: (
      <>
        <Typography variant="body" className="mb-2 text-black">Pull-to-refresh the screen or sign out and sign in again.</Typography>
        <Typography variant="body" className="mb-2 text-black">Ensure network connectivity and background data is allowed.</Typography>
        <Typography variant="footnote" className="text-gray-500">If missing data persists, report with screenshots.</Typography>
      </>
    ),
  },
  {
    id: '5',
    title: 'App Crashes',
    solution: (
      <>
        <Typography variant="body" className="mb-2 text-black">Update the app, clear cache/storage, and reboot the device.</Typography>
        <Typography variant="body" className="mb-2 text-black">Reinstall if crashes continue after updates.</Typography>
        <Typography variant="footnote" className="text-gray-500">Share crash steps with support to help us fix it.</Typography>
      </>
    ),
  },
  {
    id: '6',
    title: 'Profile/Settings Issues',
    solution: (
      <>
        <Typography variant="body" className="mb-2 text-black">Verify profile fields and save changes with stable internet.</Typography>
        <Typography variant="body" className="mb-2 text-black">Log out and log in again to sync updated settings.</Typography>
        <Typography variant="footnote" className="text-gray-500">Contact support if settings revert unexpectedly.</Typography>
      </>
    ),
  },
  {
    id: '7',
    title: 'Language/Region Settings',
    solution: (
      <>
        <Typography variant="body" className="mb-2 text-black">Set device language/region correctly and relaunch the app.</Typography>
        <Typography variant="body" className="mb-2 text-black">Some content may be region-specific and not available everywhere.</Typography>
        <Typography variant="footnote" className="text-gray-500">Report incorrect translations via Help & Support.</Typography>
      </>
    ),
  },
];

export default function OtherIssuesScreen() {
  const [expandedId, setExpandedId] = useState<string | null>('1');
  const handleIssuePress = (issueId: string) => {
    setExpandedId(expandedId === issueId ? null : issueId);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Other Issues" showBackButton />

        <Card className="mx-4 mb-8 bg-gray-100 p-6 rounded-2xl shadow-md">
          {otherIssueCategories.map((issue, index) => {
            const expanded = expandedId === issue.id;
            return (
              <View key={issue.id} className={`w-full ${index !== otherIssueCategories.length - 1 ? 'mb-4' : ''}`}>
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
