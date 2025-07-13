import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Phone } from 'phosphor-react-native';
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
    
    // Add country code if not present
    if (cleaned.length > 0 && !cleaned.startsWith('94')) {
      return '+94' + cleaned;
    } else if (cleaned.length > 0) {
      return '+' + cleaned;
    }
    return text;
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
  };

  const validatePhoneNumber = (phone: string) => {
    // Sri Lankan phone number validation
    const phoneRegex = /^\+94[0-9]{9}$/;
    return phoneRegex.test(phone);
  };

  const handleSendOTP = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      Alert.alert('Error', 'Please enter a valid Sri Lankan phone number');
      return;
    }

    setIsLoading(true);
    try {
      // Send OTP using the auth service
      const result = await sendOtp(phoneNumber);
      
      // Navigate to OTP verification screen  
      router.push({
        pathname: '/(auth)/verify-otp',
        params: { 
          phoneNumber, 
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
        <Text className="text-3xl font-bold text-center text-black mb-2">
          Welcome to YathraGo
        </Text>
        <Text className="text-base text-center text-brand-neutralGray">
          Enter your phone number to continue
        </Text>
      </View>

      <View className="space-y-4">
        <InputField
          label="Phone Number"
          placeholder="+94 77 123 4567"
          value={phoneNumber}
          onChangeText={handlePhoneChange}
          keyboardType="phone-pad"
          maxLength={13}
          IconLeft={Phone}
          helperText="We'll send you a verification code"
          variant="outline"
          textSize="body-medium"
        />

        <CustomButton
          title="Send OTP"
          bgVariant="primary"
          textVariant="white"
          textSize="body-large"
          loading={isLoading}
          onPress={handleSendOTP}
          fullWidth={true}
          className="mt-6"
        />

        <View className="mt-6">
          <Text className="text-xs text-center text-brand-neutralGray">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </View>
  );
}
