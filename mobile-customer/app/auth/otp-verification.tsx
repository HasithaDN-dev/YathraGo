import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { getApiUrl, API_CONFIG } from '../../config/api';

export default function OtpVerificationScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60); // 1 minute cooldown from backend
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer for resend (backend has 1 minute cooldown)
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (value: string, index: number) => {
    // Only allow digits
    const numericValue = value.replace(/[^0-9]/g, '');
    
    const newOtp = [...otp];
    newOtp[index] = numericValue;
    setOtp(newOtp);

    // Auto-focus next input
    if (numericValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    // Handle backspace
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const validateOtp = (otpArray: string[]): { isValid: boolean; error?: string } => {
    const otpString = otpArray.join('');
    
    if (otpString.length === 0) {
      return { isValid: false, error: 'Please enter the OTP code' };
    }
    
    if (otpString.length < 6) {
      return { isValid: false, error: 'Please enter complete 6-digit OTP' };
    }
    
    if (!/^[0-9]{6}$/.test(otpString)) {
      return { isValid: false, error: 'OTP must contain only numbers' };
    }
    
    return { isValid: true };
  };

  const handleVerify = async () => {
    const validation = validateOtp(otp);
    if (!validation.isValid) {
      Alert.alert('Invalid OTP', validation.error);
      return;
    }

    const otpString = otp.join('');

    setLoading(true);

    try {
      console.log('Verifying OTP with:', { phone, otp: otpString, userType: 'CUSTOMER' });
      const response = await fetch(getApiUrl(API_CONFIG.endpoints.auth.verifyOtp), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phone as string,
          otp: otpString,
          userType: 'CUSTOMER',
        }),
      });

      console.log('Verify response status:', response.status);
      const data = await response.json();
      console.log('Verify response data:', data);

      // Check if verification was successful
      if (response.ok && data.accessToken) {
        // Store auth token (you can use AsyncStorage if needed)
        // await AsyncStorage.setItem('authToken', data.accessToken);
        
        console.log('OTP verification successful, navigating to main app');
        // Navigate to main app
        router.replace('/(tabs)');
      } else {
        // Handle validation and verification errors
        let errorMessage = data.error || data.message || 'Invalid OTP. Please try again.';
        
        // Customize error messages for better UX
        if (errorMessage.includes('Wrong OTP') || errorMessage.includes('Invalid OTP code')) {
          errorMessage = 'Wrong OTP. Enter the correct OTP';
        } else if (errorMessage.includes('expired')) {
          errorMessage = 'OTP has expired. Please request a new one';
        } else if (errorMessage.includes('Too many failed attempts')) {
          errorMessage = 'Too many failed attempts. Please request a new OTP';
        }
        
        Alert.alert('Verification Failed', errorMessage);
        
        // Clear OTP inputs on error
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
      console.error('OTP Verify Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setResending(true);

    try {
      console.log('Resending OTP to:', phone);
      const response = await fetch(getApiUrl(API_CONFIG.endpoints.auth.sendOtp), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phone as string,
          userType: 'CUSTOMER',
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCountdown(60); // Reset to 1 minute as per backend cooldown
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        Alert.alert('Success', 'OTP sent successfully');
      } else {
        Alert.alert('Error', data.error || data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('OTP Resend Error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Back Button */}
      <TouchableOpacity 
        className="absolute top-12 left-6 z-10"
        onPress={() => router.back()}
      >
        <Text className="text-blue-600 text-base">← Back</Text>
      </TouchableOpacity>

      {/* Header */}
      <View className="items-center mt-20 mb-8">
        <Text className="text-xl font-bold text-gray-800 mb-2">
          Enter verification code
        </Text>
        <Text className="text-sm text-gray-600 text-center px-6">
          We have sent a verification code to{'\n'}
          <Text className="font-semibold">{phone}</Text>
        </Text>
      </View>

      {/* OTP Input */}
      <View className="flex-row justify-center items-center px-6 mb-8">
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            className="w-12 h-12 border border-gray-300 rounded-lg text-center text-lg font-semibold mx-1 bg-gray-50"
            value={digit}
            onChangeText={(value) => handleOtpChange(value, index)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
            keyboardType="number-pad"
            maxLength={1}
            editable={!loading}
          />
        ))}
      </View>

      {/* Verification Image */}
      <View className="items-center mb-8">
        <Image
          source={require('../../assets/images/otpVerification.png')}
          style={styles.verificationImage}
          contentFit="contain"
        />
      </View>

      {/* Verify Button */}
      <View className="px-6 mb-6">
        <TouchableOpacity
          onPress={handleVerify}
          disabled={loading}
          className={`py-4 rounded-lg ${loading ? 'bg-gray-400' : 'bg-blue-600'}`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center text-base font-semibold">
              Verify
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Resend OTP */}
      <View className="items-center">
        <Text className="text-sm text-gray-600 mb-2">
          Didn&apos;t receive the code?
        </Text>
        <TouchableOpacity
          onPress={handleResendOtp}
          disabled={countdown > 0 || resending}
        >
          <Text className={`text-sm font-semibold ${
            countdown > 0 ? 'text-gray-400' : 'text-blue-600'
          }`}>
            {resending ? 'Sending...' : 
             countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Complex image sizing that needs precise control
  verificationImage: {
    width: 200,
    height: 150,
  },
});