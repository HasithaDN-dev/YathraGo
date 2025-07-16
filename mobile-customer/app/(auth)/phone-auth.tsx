import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { Typography } from '@/components/Typography';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PhoneIcon } from 'phosphor-react-native';
import { useAuth } from '../../hooks/useAuth';
import CustomButton from '../../components/ui/CustomButton';
import InputField from '../../components/ui/InputField';

export default function PhoneAuthScreen() {
  const router = useRouter();
  const { sendOtp } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formatPhoneNumber = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    
    // Limit to 10 digits max for display
    if (cleaned.length > 10) {
      return cleaned.substring(0, 10);
    }
    
    return cleaned;
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
  };

  const validatePhoneNumber = (phone: string) => {
    // Sri Lankan phone number validation
    // Accept 9 digits (without leading 0) or 10 digits (with leading 0)
    const phone9Digits = /^[1-9][0-9]{8}$/; // 9 digits without leading 0
    const phone10Digits = /^0[1-9][0-9]{8}$/; // 10 digits with leading 0
    
    return phone9Digits.test(phone) || phone10Digits.test(phone);
  };

  const convertToApiFormat = (phone: string) => {
    // Remove any non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // If 10 digits with leading 0, remove the leading 0
    if (cleaned.length === 10 && cleaned.startsWith('0')) {
      return '+94' + cleaned.substring(1);
    }
    
    // If 9 digits, add +94 prefix
    if (cleaned.length === 9) {
      return '+94' + cleaned;
    }
    
    return '+94' + cleaned;
  };

  const handleSendOTP = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      Alert.alert('Error', 'Please enter a valid Sri Lankan phone number (9 or 10 digits)');
      return;
    }

    // Convert to API format (+94XXXXXXXXX)
    const apiPhoneNumber = convertToApiFormat(phoneNumber);

    setIsLoading(true);
    try {
      // Send OTP using the auth service
      const result = await sendOtp(apiPhoneNumber);
      
      // Navigate to OTP verification screen with the API format phone number
      router.push({
        pathname: '/(auth)/verify-otp',
        params: { 
          phoneNumber: apiPhoneNumber, 
          isNewUser: result.isNewUser || false
        }
      });
    } catch (error) {
      console.error('Send OTP error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white px-6 justify-center">
      <StatusBar style="dark" />
      
      <View className="mb-8">
        <Text style={{ fontFamily: 'Figtree', fontWeight: '700', fontSize: 20 }}>Inter Bold</Text>
        <Text style={{ fontFamily: 'Figtree-Regular', fontWeight: '700' }}>Inter Bold</Text>
        <Text style={{ fontFamily: 'Figtree-Bold', fontWeight: '700' }}>Inter Bold</Text>
        <Text style={{ fontFamily: 'figtree-italic', fontWeight: '700', fontStyle: 'italic' }}>Inter Bold Italic</Text>
        <Text style={{ fontFamily: 'Figtree' }}>Fira Sans Medium Italic</Text>
        <Text className="text-blue-500 text-headline font-bold">
          Hello, Tailwind in Expo!
        </Text>
        <Typography level="large-title" className="text-center text-black mb-2">
          Welcome to YathraGo
        </Typography>
        <Typography level="body" className="text-center text-brand-neutralGray">
          Enter your phone number to continue
        </Typography>
      </View>

      <View className="space-y-4">
        <InputField
          label="Phone Number"
          placeholder="07XXXXXXXX"
          value={phoneNumber}
          onChangeText={handlePhoneChange}
          keyboardType="phone-pad"
          maxLength={10}
          IconLeft={PhoneIcon}
          helperText="We'll send you a verification code"
          variant="outline"
          size="medium"
        />

        <CustomButton
          title={isLoading ? 'Sending Verification Code...' : 'Send Verification Code'}
          bgVariant="primary"
          textVariant="white"
          level="body"
          weight="bold"
          loading={isLoading}
          onPress={handleSendOTP}
          fullWidth={true}
          className="mt-6"
        />

        <View className="mt-6">
          <Typography level="caption-1" className="text-center text-brand-neutralGray">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Typography>
        </View>
      </View>
    </View>
  );
}
