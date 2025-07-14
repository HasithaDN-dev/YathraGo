import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService } from '../../services/api';

export default function VerifyOTPScreen() {
  const router = useRouter();
  const { phoneNumber, isNewUser } = useLocalSearchParams<{
    phoneNumber: string;
    isNewUser: string;
  }>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // Start countdown timer
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter complete OTP');
      return;
    }

    setIsLoading(true);
    try {
      const result = await ApiService.verifyCustomerOtp(phoneNumber!, otpCode);

      // Store auth token and user data
      await AsyncStorage.setItem('authToken', result.accessToken);
      await AsyncStorage.setItem('userProfile', JSON.stringify(result.user));
      
      // Navigate based on user status
      if (result.user.isNewUser) {
        // New user - go to registration
        router.replace('/registration-type' as any);
      } else {
        // Existing user - go to main app
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      Alert.alert('Verification Failed', error instanceof Error ? error.message : 'Invalid OTP');
      // Clear OTP inputs
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setIsLoading(true);
    try {
      await ApiService.sendCustomerOtp(phoneNumber!);
      
      Alert.alert('Success', 'OTP sent successfully');
      setCanResend(false);
      setResendTimer(60);
      
      // Restart timer
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Resend OTP error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white px-6 justify-center">
      <StatusBar style="dark" />
      
      <View className="mb-8">
        <Text className="text-3xl font-bold text-center text-gray-800 mb-2">
          Verify Phone Number
        </Text>
        <Text className="text-base text-center text-gray-600 mb-2">
          Enter the 6-digit code sent to
        </Text>
        <Text className="text-base text-center text-gray-800 font-semibold">
          {phoneNumber}
        </Text>
      </View>

      <View className="space-y-6">
        {/* OTP Input */}
        <View className="flex-row justify-center space-x-3">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              className="w-12 h-12 border-2 border-gray-300 rounded-lg text-center text-xl font-bold"
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <TouchableOpacity
          className={`w-full py-4 rounded-lg ${isLoading ? 'bg-gray-400' : 'bg-brand-deepNavy'}`}
          onPress={handleVerifyOTP}
          disabled={isLoading}
        >
          <Text className="text-white text-center font-semibold text-lg">
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </Text>
        </TouchableOpacity>

        {/* Resend OTP */}
        <View className="items-center">
          {canResend ? (
            <TouchableOpacity onPress={handleResendOTP}>
              <Text className="text-brand-deepNavy font-semibold">
                Resend OTP
              </Text>
            </TouchableOpacity>
          ) : (
            <Text className="text-gray-500">
              Resend OTP in {resendTimer}s
            </Text>
          )}
        </View>

        {/* Change number */}
        <TouchableOpacity
          className="w-full py-3"
          onPress={() => router.back()}
        >
          <Text className="text-gray-600 text-center font-semibold">
            Change Phone Number
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
