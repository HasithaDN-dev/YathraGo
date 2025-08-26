// This file is a copy of complaint_Inquiries.tsx with all 'complaint' replaced by 'complain'.
// Please update imports in other files to use this new file.

import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { CaretDown, CaretUp, Plus } from 'phosphor-react-native';

const mockComplains = [
  {
    id: '1',
    complainId: '220012345678',
    message: 'Payment system generates wrong messages for me.\nThis issue happens every time I try to pay.\nI have tried restarting the app but it does not help.\nCustomer support was not able to resolve it.\nPlease fix this as soon as possible.',
    date: '2022-07-24',
    time: '02:53 a.m.',
    expanded: false,
  },
  {
    id: '2',
    complainId: '220012345679',
    message: 'App crashes when I try to add a new card.\nI have reinstalled the app multiple times.\nThe crash happens on the payment screen.\nNo error message is shown.\nPlease investigate this bug.',
    date: '2022-07-25',
    time: '10:15 a.m.',
    expanded: false,
  },
  {
    id: '3',
    complainId: '220012345680',
    message: 'Unable to update my profile information.\nThe save button does not work.\nI have tried different devices.\nNo changes are saved.\nThis is affecting my account.',
    date: '2022-07-26',
    time: '04:20 p.m.',
    expanded: false,
  },
  {
    id: '4',
    complainId: '220012345681',
    message: 'Notifications are not working properly.\nI do not receive alerts for new rides.\nPush notifications are enabled in settings.\nOther apps work fine.\nPlease check notification service.',
    date: '2022-07-27',
    time: '09:00 a.m.',
    expanded: false,
  },
  {
    id: '5',
    complainId: '220012345682',
    message: 'Location services are inaccurate.\nThe app shows my location incorrectly.\nGPS is enabled and works in other apps.\nThis causes issues with ride matching.\nPlease improve location accuracy.',
    date: '2022-07-28',
    time: '11:45 a.m.',
    expanded: false,
  },
  {
    id: '6',
    complainId: '220012345683',
    message: 'Unable to receive OTP for login.\nI have checked my phone number.\nNo SMS is received.\nI cannot access my account.\nPlease fix OTP delivery.',
    date: '2022-07-29',
    time: '08:30 a.m.',
    expanded: false,
  },
  {
    id: '7',
    complainId: '220012345684',
    message: 'App freezes on splash screen.\nI have to force close the app.\nThis happens randomly.\nNo error is shown.\nPlease resolve this issue.',
    date: '2022-07-30',
    time: '07:45 p.m.',
    expanded: false,
  },
  {
    id: '8',
    complainId: '220012345685',
    message: 'Cannot add new payment method.\nThe add button does not respond.\nI have tried different cards.\nNo feedback is given.\nPlease fix payment method addition.',
    date: '2022-07-31',
    time: '03:10 p.m.',
    expanded: false,
  },
  {
    id: '9',
    complainId: '220012345686',
    message: 'Push notifications are delayed.\nI receive alerts several hours late.\nThis affects my ability to respond quickly.\nOther apps are timely.\nPlease improve notification speed.',
    date: '2022-08-01',
    time: '06:20 a.m.',
    expanded: false,
  },
  {
    id: '10',
    complainId: '220012345687',
    message: 'Cannot update emergency contact.\nThe field is disabled.\nI need to change my contact info.\nNo option to edit is available.\nPlease enable emergency contact editing.',
    date: '2022-08-02',
    time: '12:00 p.m.',
    expanded: false,
  },
  {
    id: '11',
    complainId: '220012345688',
    message: 'App logs out unexpectedly.\nI am forced to log in again.\nThis happens several times a day.\nNo warning is given.\nPlease fix session management.',
    date: '2022-08-03',
    time: '09:30 a.m.',
    expanded: false,
  },
  {
    id: '12',
    complainId: '220012345689',
    message: 'Cannot access help and support.\nThe help section does not load.\nI need assistance with my account.\nNo contact information is shown.\nPlease fix help and support.',
    date: '2022-08-04',
    time: '05:15 p.m.',
    expanded: false,
  },
];

const mockInquiries = [
  {
    id: '1',
    inquiryId: '330012345678',
    message: 'How do I reset my password?\nI forgot my password and cannot log in.\nIs there a password reset option in the app?\nI tried using the forgot password link but did not receive an email.\nPlease help me regain access.',
    date: '2022-07-24',
    time: '02:53 a.m.',
    expanded: false,
  },
  {
    id: '2',
    inquiryId: '330012345679',
    message: 'Where can I find my transaction history?\nI need to review my past payments.\nIs there a history section in the app?\nI cannot locate it in the menu.\nPlease guide me to transaction history.',
    date: '2022-07-25',
    time: '10:15 a.m.',
    expanded: false,
  },
  {
    id: '3',
    inquiryId: '330012345680',
    message: 'Is there a way to contact support directly?\nI have an urgent issue.\nIs there a chat or call option?\nI could not find support contact details.\nPlease provide support information.',
    date: '2022-07-26',
    time: '04:20 p.m.',
    expanded: false,
  },
  {
    id: '4',
    inquiryId: '330012345681',
    message: 'How do I change my phone number?\nMy old number is no longer active.\nIs there an option to update my phone number?\nI could not find it in profile settings.\nPlease advise on phone number change.',
    date: '2022-07-27',
    time: '09:00 a.m.',
    expanded: false,
  },
  {
    id: '5',
    inquiryId: '330012345682',
    message: 'Can I delete my account?\nI want to remove my data from the app.\nIs there a delete account option?\nWhat is the process for account deletion?\nPlease provide instructions.',
    date: '2022-07-28',
    time: '11:45 a.m.',
    expanded: false,
  },
  {
    id: '6',
    inquiryId: '330012345683',
    message: 'How do I change my email address?\nMy current email is incorrect.\nIs there an edit email option?\nI could not find it in settings.\nPlease help me update my email.',
    date: '2022-07-29',
    time: '08:30 a.m.',
    expanded: false,
  },
  {
    id: '7',
    inquiryId: '330012345684',
    message: 'Can I export my data?\nI want to download my ride history.\nIs there an export feature in the app?\nI could not find any export option.\nPlease let me know how to export data.',
    date: '2022-07-30',
    time: '07:45 p.m.',
    expanded: false,
  },
  {
    id: '8',
    inquiryId: '330012345685',
    message: 'Is there a dark mode available?\nI prefer using dark mode at night.\nIs there a theme switcher in the app?\nI could not find dark mode settings.\nPlease add dark mode feature.',
    date: '2022-07-31',
    time: '03:10 p.m.',
    expanded: false,
  },
  {
    id: '9',
    inquiryId: '330012345686',
    message: 'How do I update my payment method?\nMy card has expired.\nIs there an option to add a new card?\nI could not find payment method settings.\nPlease help me update payment details.',
    date: '2022-08-01',
    time: '06:20 a.m.',
    expanded: false,
  },
  {
    id: '10',
    inquiryId: '330012345687',
    message: 'Can I set up two-factor authentication?\nI want to secure my account.\nIs there a 2FA option in the app?\nI could not find security settings.\nPlease add two-factor authentication.',
    date: '2022-08-02',
    time: '12:00 p.m.',
    expanded: false,
  },
  {
    id: '11',
    inquiryId: '330012345688',
    message: 'How do I change my profile picture?\nMy current photo is outdated.\nIs there an option to upload a new picture?\nI could not find profile picture settings.\nPlease help me update my profile image.',
    date: '2022-08-03',
    time: '09:30 a.m.',
    expanded: false,
  },
  {
    id: '12',
    inquiryId: '330012345689',
    message: 'Can I disable notifications?\nI receive too many alerts.\nIs there a notification settings page?\nI could not find notification controls.\nPlease help me manage notifications.',
    date: '2022-08-04',
    time: '05:15 p.m.',
    expanded: false,
  },
];



export default function ComplainInquiriesScreen() {
  const router = useRouter();
  const [complains, setComplains] = useState(mockComplains);
  const [inquiries, setInquiries] = useState(mockInquiries);
  const [showAllComplains, setShowAllComplains] = useState(false);
  const [showAllInquiries, setShowAllInquiries] = useState(false);
  const [activeTab, setActiveTab] = useState<'Complains' | 'Inquiries'>('Complains');

  const toggleExpand = (id: string) => {
    setComplains((prev) =>
      prev.map((c) => (c.id === id ? { ...c, expanded: !c.expanded } : c))
    );
  };
  const toggleExpandInquiry = (id: string) => {
    setInquiries((prev) =>
      prev.map((c) => (c.id === id ? { ...c, expanded: !c.expanded } : c))
    );
  };

  // Select which array to show
  const itemsToShow = activeTab === 'Complains' ? complains : inquiries;
  const isComplainsTab = activeTab === 'Complains';
  const visibleItems = (isComplainsTab
    ? (showAllComplains ? itemsToShow : itemsToShow.slice(0, 3))
    : (showAllInquiries ? itemsToShow : itemsToShow.slice(0, 3)));

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ScreenHeader title="Complain and Inquiries" showBackButton />

        {/* Tabs */}
        <View className="flex-row border-b border-gray-200 mb-4 mt-3">
          <TouchableOpacity
            className={`flex-1 items-center pb-2 ${activeTab === 'Complains' ? 'border-b-4 border-yellow-400' : ''}`}
            onPress={() => setActiveTab('Complains')}
          >
            <Typography variant="subhead" className="text-black">
              Complains
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 items-center pb-2 ${activeTab === 'Inquiries' ? 'border-b-4 border-yellow-400' : ''}`}
            onPress={() => setActiveTab('Inquiries')}
          >
            <Typography variant="body" className="text-black">
              Inquiries
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Large Scrollable Card for Complaints/Inquiries */}
        <Card className="mb-6 p-2">
          <ScrollView className="max-h-[520px]" showsVerticalScrollIndicator={false}>
            {visibleItems.map((item, idx) => (
              <View key={item.id} style={{ marginBottom: idx === visibleItems.length - 1 ? 0 : 16 }}>
                <Card className="px-4 py-3 shadow-md mt-2">
                  {isComplainsTab ? (
                    <TouchableOpacity
                      className="flex-row items-center justify-between mb-2"
                      onPress={() => toggleExpand(item.id)}
                      activeOpacity={0.8}
                    >
                      <Typography variant="subhead" weight="bold" className="text-black">
                        Complain ID : {'complainId' in item ? item.complainId : ''}
                      </Typography>
                      {item.expanded ? (
                        <CaretUp size={20} color="#222" weight="regular" />
                      ) : (
                        <CaretDown size={20} color="#222" weight="regular" />
                      )}
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      className="flex-row items-center justify-between mb-2"
                      onPress={() => toggleExpandInquiry(item.id)}
                      activeOpacity={0.8}
                    >
                      <Typography variant="subhead" weight="bold" className="text-black">
                        Inquiry ID : {'inquiryId' in item ? item.inquiryId : ''}
                      </Typography>
                      {item.expanded ? (
                        <CaretUp size={20} color="#222" weight="regular" />
                      ) : (
                        <CaretDown size={20} color="#222" weight="regular" />
                      )}
                    </TouchableOpacity>
                  )}
                  <Typography
                    variant="subhead"
                    className="text-black mb-2"
                    numberOfLines={item.expanded ? undefined : 2}
                  >
                    {item.message}
                  </Typography>
                  <View className="flex-row justify-between items-center mt-2">
                    <Typography variant="caption-1" className="text-gray-500">
                      Date : {item.date}
                    </Typography>
                    <Typography variant="caption-1" className="text-gray-500">
                      Time : {item.time}
                    </Typography>
                  </View>
                </Card>
              </View>
            ))}
          </ScrollView>
        </Card>

        {/* See more button for complaints/inquiries only, if more than 3 and not showing all */}
        {isComplainsTab && !showAllComplains && complains.length > 3 && (
          <TouchableOpacity
            className="mt-4 mb-1 self-center px-6 py-2 bg-brand-deepNavy rounded-full"
            onPress={() => setShowAllComplains(true)}
          >
            <Typography variant="subhead" className="text-white">
              see more
            </Typography>
          </TouchableOpacity>
        )}
        {!isComplainsTab && !showAllInquiries && inquiries.length > 3 && (
          <TouchableOpacity
            className="mt-4 mb-1 self-center px-6 py-2 bg-brand-deepNavy rounded-full"
            onPress={() => setShowAllInquiries(true)}
          >
            <Typography variant="subhead" className="text-white">
              see more
            </Typography>
          </TouchableOpacity>
        )}

        {/* Add Complain/Inquiry Card */}
        <TouchableOpacity
          className="mb-8"
          activeOpacity={0.85}
          onPress={() => {
            // Navigate to the correct tab in add_complaint_inquiries
            router.push({
              pathname: '/(menu)/(complainInquiries)/add_complain_inquiries',
              params: {
                type: activeTab === 'Complains' ? 'Complains' : 'Inquiries',
              },
            });
          }}
        >
          <Card className="flex-row items-center justify-between px-4 py-5">
            <Typography variant="subhead" className="text-black">
              {activeTab === 'Complains' ? 'Add Complain' : 'Add Inquiry'}
            </Typography>
            <View className="bg-black rounded-full w-8 h-8 items-center justify-center">
              <Plus size={20} color="#fff" weight="bold" />
            </View>
          </Card>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}