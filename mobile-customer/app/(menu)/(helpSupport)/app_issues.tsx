import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { CaretDown } from 'phosphor-react-native';



const appIssueCategories = [
  {
    id: '1',
    title: 'Performance Problems',
    solution: (
      <>
        <Typography variant="body" className="mb-2 text-black">Try closing unused apps and background processes. Restart your device. Ensure your app is updated to the latest version.</Typography>
        <Typography variant="footnote" className="text-gray-500">If the problem persists, contact support.</Typography>
      </>
    ),
  },
  {
    id: '2',
    title: 'Connectivity Issues',
    solution: (
      <>
        <Typography variant="body" className="mb-2 text-black">Check Internet Connection</Typography>
        <Typography variant="body" className="mb-2 text-black">• Ensure the device has an active internet connection (Wi-Fi or mobile data).</Typography>
        <Typography variant="body" className="mb-2 text-black">• Try accessing a website or another app to confirm.</Typography>
        <Typography variant="body" className="mb-2 text-black">Restart the App and Device</Typography>
        <Typography variant="body" className="mb-2 text-black">• Close and reopen the app.</Typography>
        <Typography variant="body" className="mb-2 text-black">• Restart the device to clear temporary glitches.</Typography>
        <Typography variant="body" className="mb-2 text-black">Check App Permissions</Typography>
        <Typography variant="body" className="mb-2 text-black">• Ensure the app has permission to access the internet (especially on Android).</Typography>
        <Typography variant="footnote" className="text-gray-500">If you still have issues, contact support.</Typography>
      </>
    ),
  },
  {
    id: '3',
    title: 'UX and UI Flaws',
    solution: (
      <>
        <Typography variant="body" className="mb-2 text-black">Try updating the app to the latest version. If the issue remains, send feedback with screenshots to help us improve the experience.</Typography>
      </>
    ),
  },
  {
    id: '4',
    title: 'Update-Related Bugs',
    solution: (
      <>
        <Typography variant="body" className="mb-2 text-black">Uninstall and reinstall the app. Make sure your device OS is up to date. Report persistent bugs to support.</Typography>
      </>
    ),
  },
  {
    id: '5',
    title: 'Localization/Language Bugs',
    solution: (
      <>
        <Typography variant="body" className="mb-2 text-black">Switch your device language and region settings, then restart the app. If translations are missing or incorrect, let us know via support.</Typography>
      </>
    ),
  },
  {
    id: '6',
    title: 'Security Concerns',
    solution: (
      <>
        <Typography variant="body" className="mb-2 text-black">If you suspect a security issue, immediately change your password and contact support. Do not share sensitive information in the app.</Typography>
      </>
    ),
  },
  {
    id: '7',
    title: 'Security Concerns', // Duplicate as shown in design
    solution: (
      <>
        <Typography variant="body" className="mb-2 text-black">If you suspect a security issue, immediately change your password and contact support. Do not share sensitive information in the app.</Typography>
      </>
    ),
  },
];

export default function AppIssuesScreen() {
  const [expandedId, setExpandedId] = useState<string | null>('2');
  const handleIssuePress = (issueId: string) => {
    setExpandedId(expandedId === issueId ? null : issueId);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ScreenHeader title="App Issues" showBackButton />

        {/* App Issues Categories Card */}
        <Card className="mx-4 mb-8 bg-gray-100 p-6 rounded-2xl shadow-md">
          {appIssueCategories.map((issue, index) => {
            const expanded = expandedId === issue.id;
            return (
              <View key={issue.id} className={`w-full ${index !== appIssueCategories.length - 1 ? 'mb-4' : ''}`}> 
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