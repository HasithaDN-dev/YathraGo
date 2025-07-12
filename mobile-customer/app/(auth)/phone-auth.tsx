import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function PhoneAuthScreen() {
  const router = useRouter();
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
      // TODO: Replace with your actual API call
      const response = await fetch('YOUR_API_ENDPOINT/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Navigate to OTP verification screen  
        router.push('/onboarding'); // Temporary navigation - will be updated when routes are properly configured
      } else {
        Alert.alert('Error', data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
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
          Enter your phone number to book your ride
        </Text>
      </View>

      <View className="space-y-4">
        <View>
          <Text className="text-sm font-medium text-black mb-2">Phone Number</Text>
          <TextInput
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg"
            placeholder="+94 77 123 4567"
            value={phoneNumber}
            onChangeText={handlePhoneChange}
            keyboardType="phone-pad"
            maxLength={13}
          />
          <Text className="text-xs text-brand-neutralGray mt-1">
            We&apos;ll send you a verification code
          </Text>
        </View>

        <TouchableOpacity
          className={`w-full py-4 rounded-lg mt-6 ${isLoading ? 'bg-brand-lightGray' : 'bg-brand-deepNavy'}`}
          onPress={handleSendOTP}
          disabled={isLoading}
        >
          <Text className="text-white text-center font-semibold text-lg">
            {isLoading ? 'Sending OTP...' : 'Send OTP'}
          </Text>
        </TouchableOpacity>

        <View className="mt-6">
          <Text className="text-xs text-center text-brand-neutralGray">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </View>
  );
}
