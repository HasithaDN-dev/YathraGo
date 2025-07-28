import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Alert, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Typography } from '@/components/Typography';
import CustomButton from '../../components/ui/CustomButton';
import { PasswordIcon } from 'phosphor-react-native';
import { verifyOtpApi, sendOtpApi } from '../../lib/api/auth.api';
import { getDriverProfileApi, getDriverRegistrationStatusApi } from '../../lib/api/profile.api';
import { useAuthStore } from '../../lib/stores/auth.store';
import { useDriverStore } from '../../lib/stores/driver.store';
import { Driver, DriverRegistrationStatus } from '../../types/driver.types';

export default function VerifyOTPScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Get the login action from our Zustand store
  const { login, setProfileComplete, setLoading } = useAuthStore();
  const { loadProfile } = useDriverStore();

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timerInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerInterval);
  }, [canResend]);

  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
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
      Alert.alert('Error', 'Please enter the complete 6-digit OTP.');
      return;
    }

    console.log('Starting OTP verification for:', phone);
    setIsLoading(true);
    try {
      const { accessToken, user } = await verifyOtpApi(phone!, otpCode);
      
      // Only set global loading after successful OTP verification
      setLoading(true);
      
        // Create a proper Driver object from auth response
        const driverUser: Driver = {
          id: user.id,
          name: '', // Will be filled during registration
          phone: user.phone,
          email: '',
          address: '',
          profileImageUrl: '',
          emergencyContact: '',
          status: 'ACTIVE',
          registrationStatus: user.registrationStatus as DriverRegistrationStatus || 'OTP_VERIFIED',
          isProfileComplete: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await login(accessToken, driverUser);
      
      // Check if user has already completed driver registration
      try {
        const [profile, registrationStatus] = await Promise.all([
          getDriverProfileApi(accessToken),
          getDriverRegistrationStatusApi(accessToken)
        ]);
        
        console.log('User profile after login:', profile);
        console.log('User registration status:', registrationStatus);
        
        // Update registration status in auth store
        const { setRegistrationStatus } = useAuthStore.getState();
        setRegistrationStatus(registrationStatus);
        
        // Determine navigation based on registration status
        if (registrationStatus === 'ACCOUNT_CREATED') {
          console.log('Account is completely created, navigating to home');
          setProfileComplete(true);
          // Load profile into profile store
          await loadProfile(accessToken);
          // Navigation to home will be handled by root layout
        } else if (registrationStatus === 'OTP_VERIFIED') {
          console.log('Account not completely created, navigating to registration screens');
          setProfileComplete(false);
          // Navigation to registration screens will be handled by root layout
        } else {
          console.log('Unknown registration status:', registrationStatus);
          setProfileComplete(false);
        }
      } catch (profileError) {
        console.log('Error checking user profile/status:', profileError);
        // If we can't check profile, assume user needs to complete registration
        setProfileComplete(false);
      } finally {
        setLoading(false); // Clear global loading state only after profile check
      }
      
      // Navigation is handled by root layout based on isProfileComplete and registrationStatus
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
      await sendOtpApi(phone!);
      
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
          {phone}
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
