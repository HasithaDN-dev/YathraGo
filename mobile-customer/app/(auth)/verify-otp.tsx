import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Alert, TouchableOpacity } from 'react-native';
import { Typography } from '@/components/Typography';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService } from '../../services/api';
import CustomButton from '../../components/ui/CustomButton';

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
        // New user - go to customer profile setup
        router.replace('/(tabs)'); // You can create a customer-setup screen later
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
        <Typography variant="large-title" weight="bold" className="text-center text-brand-deepNavy mb-2">
          Verify Phone Number
        </Typography>
        <Typography variant="body" className="text-center text-brand-neutralGray mb-2">
          Enter the 6-digit code sent to
        </Typography>
        <Typography variant="body" weight="semibold" className="text-center text-brand-deepNavy">
          {phoneNumber}
        </Typography>
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

        <CustomButton
          title={isLoading ? 'Verifying...' : 'Verify OTP'}
          bgVariant="primary"
          textVariant="white"
          loading={isLoading}
          onPress={handleVerifyOTP}
          fullWidth={true}
          size="large"
        />

        {/* Resend OTP - text button */}
        {canResend ? (
          <View className="items-center mt-4">
            <TouchableOpacity onPress={handleResendOTP}>
              <Typography variant="body" weight="medium" className="text-brand-warmYellow">
                Resend OTP
              </Typography>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="items-center mt-4">
            <Typography variant="body" className="text-brand-neutralGray">
              Resend OTP in {resendTimer}s
            </Typography>
          </View>
        )}

        {/* Change number - text button */}
        <View className="items-center mt-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Typography variant="body" weight="medium" className="text-brand-neutralGray">
              Change Phone Number
            </Typography>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
