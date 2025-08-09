// This file is a copy of add_complaint_inquiries.tsx with all 'complaint' replaced by 'complain'.
// Please update imports in other files to use this new file.

// ...existing code...
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { CustomInput } from '@/components/ui/CustomInput';
import CustomButton from '@/components/ui/CustomButton';

import { useLocalSearchParams } from 'expo-router';

export default function AddComplaintInquiriesScreen() {
  const params = useLocalSearchParams();
  const initialTab = params.type === 'Complains' ? 'Complains' : params.type === 'Inquiries' ? 'Inquiries' : 'Inquiries';
  const [activeTab, setActiveTab] = useState<'Complains' | 'Inquiries'>(initialTab);

  // If the param changes while the screen is mounted, update the tab
  useEffect(() => {
    if (params.type === 'Complains' || params.type === 'Inquiries') {
      setActiveTab(params.type as 'Complains' | 'Inquiries');
    }
  }, [params.type]);
  const [mobileNumber, setMobileNumber] = useState('');
  const [description, setDescription] = useState('');
  const [mobileNumberError, setMobileNumberError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');

  // Accept 9 digits (without leading 0) or 10 digits (with leading 0)
  const validatePhoneNumber = (phone: string) => {
    const phone9Digits = /^[1-9][0-9]{8}$/;
    const phone10Digits = /^0[1-9][0-9]{8}$/;
    return phone9Digits.test(phone) || phone10Digits.test(phone);
  };

  const handleMobileNumberChange = (value: string) => {
    // Remove all non-digits and limit to 10 digits
    const cleaned = value.replace(/\D/g, '').substring(0, 10);
    setMobileNumber(cleaned);
    setMobileNumberError('');
  };

  const handleSubmit = () => {
    let valid = true;
    if (!mobileNumber.trim()) {
      setMobileNumberError('Mobile number is required');
      valid = false;
    } else if (!validatePhoneNumber(mobileNumber)) {
      setMobileNumberError('Please enter a valid Sri Lankan phone number (9 or 10 digits, e.g., 0712345678)');
      valid = false;
    }
    if (!description.trim()) {
      setDescriptionError('Description is required');
      valid = false;
    } else {
      setDescriptionError('');
    }
    if (!valid) return;
    // Handle submit logic
    console.log('Submitting:', { type: activeTab, mobileNumber, description });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ScreenHeader title="Complaint and Inquiries" showBackButton />

        {/* Tabs */}
        <View className="flex-row border-b border-gray-200 mb-6 mt-3 mx-4">
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
            <Typography variant="subhead" className="text-black">
              Inquiries
            </Typography>
          </TouchableOpacity>
        </View>

        {/* New Inquiry Form */}
        <Card className="mx-4 mb-8 bg-gray-100 p-6 rounded-2xl shadow-md">
          {/* Title */}
          <Typography variant="headline" className="text-black text-center mb-6">
            {activeTab === 'Complains' ? 'New Complain' : 'New Inquiry'}
          </Typography>

          {/* Mobile Number Field */}
          <View className="mb-6">
            <View className="flex-row items-center mb-2">
              {/* <Typography variant="subhead" className="text-black">
                Mobile :
              </Typography> */}
            </View>
            <CustomInput
              label="Mobile :"
              variant="subhead"
              value={mobileNumber}
            onChangeText={handleMobileNumberChange}
              placeholder="Enter mobile number"
              className="bg-white rounded-xl shadow-sm"
              keyboardType="phone-pad"
            error={mobileNumberError}
            />
          </View>

          {/* Description Field */}
          <View className="mb-8">
            <View className="flex-row items-center mb-2">
              <Typography variant="subhead" className="text-black">
                Description :
              </Typography>
            </View>
            <View className="bg-white rounded-xl shadow-sm border border-gray-300 p-4 min-h-[320px]">
              <TextInput
                value={description}
                onChangeText={text => {
                  setDescription(text);
                  if (descriptionError && text.trim()) setDescriptionError('');
                }}
                placeholder="Describe your problem very cleary..."
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="top"
                className="text-black text-base"
                style={{ fontFamily: 'Figtree-Regular' }}
              />
            </View>
            {descriptionError ? (
              <Typography variant="footnote" className="text-red-500 mt-1">
                {descriptionError}
              </Typography>
            ) : null}
          </View>

          {/* Submit Button */}
          <CustomButton
            title={activeTab === 'Complains' ? "Submit Complain" : "Submit Inquiry"}
            onPress={handleSubmit}
            bgVariant="primary"
            className="self-center w-full max-w-xs"
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
} 