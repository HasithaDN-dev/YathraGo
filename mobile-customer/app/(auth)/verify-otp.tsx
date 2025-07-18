import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService } from '../../services/api';
import { PasswordIcon} from 'phosphor-react-native';
import { Typography } from '@/components/Typography';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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
        router.replace('/(registration)/customer-register' as any);
      } else {
        // Existing user - go to main app
        router.replace('/(tabs)' as any);
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
    <View className="flex-1 px-6 py-20 justify-start  bg-white">
      <StatusBar style="dark" />

      <View className="items-center my-8">
        <PasswordIcon color="#143373" weight="duotone" size={150} duotoneColor="#fdc334" duotoneOpacity={0.3} />
      </View>

      {/* Title & Subtitle */}
      <View className="mb-8">
        <Typography variant="large-title" className="text-center mb-4 text-brand-deepNavy">
          Verification Code
        </Typography>
        <Typography variant="body" className="text-center text-brand-neutralGray">
          Enter the 6-digit code we&apos;ve sent to
        </Typography>
        <Typography variant="body" weight="semibold" className="text-center text-brand-deepNavy">
          {phoneNumber}
        </Typography>
      </View>

      {/* OTP Input & Actions */}
      <View className="gap-y-4">
        <View className="flex-row justify-center items-center gap-x-3 mb-1">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              className="w-12 h-14 border-2 border-gray-300 rounded-2xl text-center text-title-3 font-figtree-regular text-black py-0 bg-white focus:border-brand-navyBlue"
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
          title={isLoading ? 'Verifying...' : 'Verify Phone'}
          loading={isLoading}
          onPress={handleVerifyOTP}
          fullWidth={true}
          size="large"
          className="mt-1"
        />

        <View className="mt-1">
          {canResend ? (
            <TouchableOpacity onPress={handleResendOTP}>
              <Typography variant="body" weight="medium" className="text-center text-brand-warmYellow">
                Resend Code
              </Typography>
            </TouchableOpacity>
          ) : (
            <Typography variant="body" className="text-center text-brand-neutralGray">
              Resend code in {resendTimer}s
            </Typography>
          )}
        </View>

        <View className="mt-1">
          <TouchableOpacity onPress={() => router.back()}>
            <Typography variant="body" weight="medium" className="text-center text-brand-neutralGray">
              Change Phone Number
            </Typography>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
