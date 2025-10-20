import React, { useState } from 'react';
import { View, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import CustomButton from '@/components/ui/CustomButton';
import { PaperPlaneRight } from 'phosphor-react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useProfileStore } from '@/lib/stores/profile.store';
import { API_BASE_URL } from '@/config/api';

export default function InformDriverScreen() {
  const [description, setDescription] = useState('');
  const { activeProfile, customerProfile } = useProfileStore();
  const params = useLocalSearchParams<{ driverId?: string }>();
  const driverIdParam = Array.isArray(params.driverId) ? params.driverId[0] : params.driverId;

  const handleSend = async () => {
    const text = description.trim();
    if (!text) return;

    // driverId must be provided via route params
    if (!driverIdParam) {
      Alert.alert('No driver selected', 'Cannot inform driver because no driver was specified.');
      return;
    }

    // Resolve sender name: prefer active child profile name, fall back to customer
    let senderName = 'Passenger';
    try {
      if (activeProfile && (activeProfile as any).type === 'child') {
        const m = String((activeProfile as any).id).match(/(\d+)/);
        const cid = m ? parseInt(m[1], 10) : null;
        if (cid) {
          const childFirst = (activeProfile as any).childFirstName || (activeProfile as any).firstName || '';
          const childLast = (activeProfile as any).childLastName || '';
          senderName = `${childFirst} ${childLast}`.trim() || senderName;
        }
      } else if (customerProfile) {
        senderName = `${customerProfile.firstName || ''} ${customerProfile.lastName || ''}`.trim() || senderName;
      }
    } catch {
      // fallback handled by defaults
    }

    const payload = {
      sender: senderName,
      message: text,
      type: 'ALERT',
      receiver: 'DRIVER',
      receiverId: Number(driverIdParam),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text();
        console.error('Failed to send notification:', res.status, txt);
        Alert.alert('Error', 'Failed to send notification to driver.');
        return;
      }
      // Success
      setDescription('');
      Alert.alert('Sent', 'Notification sent to driver');
      // optional: navigate back
      router.back();
    } catch (err) {
      console.error('Error sending notification:', err);
      Alert.alert('Error', 'Network error while sending notification');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ScreenHeader title="Inform" showBackButton />

        {/* Main Content Card */}
        <View className="px-4 mt-4">
          <Card className="p-6">
            {/* Title */}
            <Typography variant="title-3" weight="semibold" className="text-black mb-6 text-center">
              Special Note For Your Driver
            </Typography>

            <Typography variant="subhead" weight="medium" className="text-black mb-3">
              Description
            </Typography>

            {/* Text Input Field */}
            <View className="bg-white border border-gray-200 rounded-lg mb-8">
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Please Enter your note here..."
                placeholderTextColor="#9CA3AF"
                className="p-4 text-black"
                multiline
                numberOfLines={8}
                textAlignVertical="top"
                style={{ textAlignVertical: 'top', height: 200 }}
              />
            </View>

            {/* Send Button */}
            <View className="items-center" style={{ transform: [{ translateX: 50 }] }}>
              <CustomButton
                title="Send"
                bgVariant="primary"
                textVariant="white"
                size="large"
                IconLeft={PaperPlaneRight}
                className="w-full max-w-[200px]"
                onPress={handleSend}
                disabled={!description.trim()}
              />
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
