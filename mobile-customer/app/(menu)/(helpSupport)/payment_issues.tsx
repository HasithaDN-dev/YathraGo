import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { CaretDown } from 'phosphor-react-native';

const paymentIssueCategories = [
  {
    id: '1',
    title: 'Payment Declined',
    solution: (
      <>
        <Typography variant="body" className="mb-2 text-black">Confirm your card details (number, expiry, CVV) are correct and try again.</Typography>
        <Typography variant="body" className="mb-2 text-black">Ensure you have sufficient funds and international/online payments are enabled.</Typography>
        <Typography variant="footnote" className="text-gray-500">If the issue persists, contact your bank or try another method.</Typography>
      </>
    ),
  },
  {
    id: '2',
    title: 'Card Verification Failed',
    solution: (
      <>
        <Typography variant="body" className="mb-2 text-black">Use a card that supports 3D Secure/OTP where required.</Typography>
        <Typography variant="body" className="mb-2 text-black">Double-check OTP codes, and avoid auto-filled outdated details.</Typography>
        <Typography variant="footnote" className="text-gray-500">Retry verification after a few minutes if you received many OTPs.</Typography>
      </>
    ),
  },
  {
    id: '3',
    title: 'Refund Delays',
    solution: (
      <>
        <Typography variant="body" className="mb-2 text-black">Refunds may take 3–7 business days depending on your bank.</Typography>
        <Typography variant="body" className="mb-2 text-black">Check your email for refund confirmation and transaction IDs.</Typography>
        <Typography variant="footnote" className="text-gray-500">Contact support with your order ID if you don’t see funds after 7 days.</Typography>
      </>
    ),
  },
  {
    id: '4',
    title: 'Duplicate Charges',
    solution: (
      <>
        <Typography variant="body" className="mb-2 text-black">Sometimes pending holds appear as duplicates and drop off automatically.</Typography>
        <Typography variant="body" className="mb-2 text-black">Verify in your bank app: settled vs pending transactions.</Typography>
        <Typography variant="footnote" className="text-gray-500">Share screenshots with support if duplicates are settled.</Typography>
      </>
    ),
  },
  {
    id: '5',
    title: 'Payment Method Not Showing',
    solution: (
      <>
        <Typography variant="body" className="mb-2 text-black">Update the app to the latest version to see all supported methods.</Typography>
        <Typography variant="body" className="mb-2 text-black">Region or account type may limit available options.</Typography>
        <Typography variant="footnote" className="text-gray-500">Contact support to request enabling a specific method.</Typography>
      </>
    ),
  },
  {
    id: '6',
    title: 'Invoice/Receipt Issues',
    solution: (
      <>
        <Typography variant="body" className="mb-2 text-black">Check your email spam folder for receipts.</Typography>
        <Typography variant="body" className="mb-2 text-black">Verify your email in Profile → Settings → Contact details.</Typography>
        <Typography variant="footnote" className="text-gray-500">Support can resend invoices upon request.</Typography>
      </>
    ),
  },
  {
    id: '7',
    title: 'Subscription/Billing Concerns',
    solution: (
      <>
        <Typography variant="body" className="mb-2 text-black">Ensure your subscription is active and payment profile is valid.</Typography>
        <Typography variant="body" className="mb-2 text-black">For cancellations, check renewal dates and grace periods.</Typography>
        <Typography variant="footnote" className="text-gray-500">Contact support for prorated billing questions.</Typography>
      </>
    ),
  },
];

export default function PaymentIssuesScreen() {
  const [expandedId, setExpandedId] = useState<string | null>('1');
  const handleIssuePress = (issueId: string) => {
    setExpandedId(expandedId === issueId ? null : issueId);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Payment Issues" showBackButton />

        <Card className="mx-4 mb-8 bg-gray-100 p-6 rounded-2xl shadow-md">
          {paymentIssueCategories.map((issue, index) => {
            const expanded = expandedId === issue.id;
            return (
              <View key={issue.id} className={`w-full ${index !== paymentIssueCategories.length - 1 ? 'mb-4' : ''}`}>
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
