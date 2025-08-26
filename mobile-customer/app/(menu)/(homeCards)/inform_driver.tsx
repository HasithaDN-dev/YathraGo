import React, { useState } from 'react';
import { View, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import CustomButton from '@/components/ui/CustomButton';
import { PaperPlaneRight } from 'phosphor-react-native';

export default function InformDriverScreen() {
  const [description, setDescription] = useState('');

  const handleSend = () => {
    if (description.trim()) {
      console.log('Sending message:', description);
      // Here you would typically send the message to the driver
      // For now, just log it
      setDescription('');
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
            <View className="items-center">
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
