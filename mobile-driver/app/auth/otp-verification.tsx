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

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus to next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      Alert.alert('Error', 'Please enter complete 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      console.log('Verifying OTP with:', { phone, otp: otpString, userType: 'DRIVER' });
      const response = await fetch(getApiUrl(API_CONFIG.endpoints.auth.verifyOtp), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phone as string,
          otp: otpString,
          userType: 'DRIVER', // Different from customer - this is DRIVER
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
          userType: 'DRIVER', // Different from customer - this is DRIVER
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
      
      {/* Header */}
      <View className="items-center mt-20 mb-8">
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.headerLogo}
          contentFit="contain"
        />
        <Text className="text-lg font-bold text-blue-900 mt-2">YathraGo Driver</Text>
      </View>

      {/* Content */}
      <View className="px-6">
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          Verify Phone Number
        </Text>
        <Text className="text-base text-gray-600 mb-8">
          We&apos;ve sent a 6-digit code to {phone}
        </Text>

        {/* OTP Input */}
        <View className="flex-row justify-between mb-8">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              className="w-12 h-12 border border-gray-300 rounded-lg text-center text-lg font-semibold"
              value={digit}
              onChangeText={(text) => handleOtpChange(text, index)}
              onKeyPress={({ nativeEvent }) => handleBackspace(nativeEvent.key, index)}
              keyboardType="numeric"
              maxLength={1}
              editable={!loading}
            />
          ))}
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          onPress={handleVerifyOtp}
          disabled={loading}
          className={`py-4 rounded-lg mb-6 ${loading ? 'bg-gray-400' : 'bg-blue-600'}`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center text-base font-semibold">
              Verify
            </Text>
          )}
        </TouchableOpacity>

        {/* Resend Section */}
        <View className="items-center">
          <Text className="text-gray-600 mb-2">
            Didn&apos;t receive the code?
          </Text>
          
          {countdown > 0 ? (
            <Text className="text-blue-600 text-base">
              Resend in {countdown}s
            </Text>
          ) : (
            <TouchableOpacity
              onPress={handleResendOtp}
              disabled={resending}
              className="py-2"
            >
              {resending ? (
                <ActivityIndicator size="small" color="#2563eb" />
              ) : (
                <Text className="text-blue-600 text-base font-semibold">
                  Resend Code
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Complex image sizing that needs precise control
  headerLogo: {
    width: 80,
    height: 80,
  },
});
