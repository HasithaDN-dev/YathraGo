import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Alert, TouchableOpacity} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Typography } from '@/components/Typography';
import CustomButton from '../../components/ui/CustomButton';
import { PasswordIcon } from 'phosphor-react-native';
import { verifyOtpApi, sendOtpApi } from '../../lib/api/auth.api';
import { getProfilesApi, getRegistrationStatusApi } from '../../lib/api/profile.api';
import { useAuthStore } from '../../lib/stores/auth.store';
import { useProfileStore } from '../../lib/stores/profile.store';

export default function VerifyOTPScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  //Get the login action from our Zustand store.
  const { login, setProfileComplete, setLoading } = useAuthStore();
  const { refreshProfiles } = useProfileStore();

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
  }, [canResend]); // Rerun effect when resend is triggered

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
      
      await login(accessToken, user);
      
      // Check registration status and profiles
      try {
        const [profiles, registrationStatus] = await Promise.all([
          getProfilesApi(accessToken),
          getRegistrationStatusApi(accessToken)
        ]);
        
        console.log('User profiles after login:', profiles);
        console.log('User registration status:', registrationStatus);
        
        // Update registration status in auth store
        const { setRegistrationStatus } = useAuthStore.getState();
        setRegistrationStatus(registrationStatus);
        
        // If user has any profiles (children or staff), they've completed registration
        if (profiles.length > 0) {
          console.log('User has existing profiles, marking profile as complete');
          setProfileComplete(true);
          // Load profiles into profile store
          await refreshProfiles(accessToken);
        } else {
          console.log('User has no profiles, checking registration status');
          
          // Check registration status to determine next step
          if (registrationStatus === 'ACCOUNT_CREATED') {
            console.log('Customer registration completed, user needs to create profiles');
            setProfileComplete(false);
          } else if (registrationStatus === 'HAVING_A_PROFILE') {
            console.log('Having a profile, user needs to navigate to home screen');
            setProfileComplete(true);
          } else if (registrationStatus === 'OTP_VERIFIED') {
            console.log('Only OTP verified, user needs to complete customer registration');
            setProfileComplete(false);
          } else {
            console.log('Unknown registration status:', registrationStatus);
            setProfileComplete(false);
          }
        }
      } catch (profileError) {
        console.log('Error checking user profiles/status:', profileError);
        // If we can't check profiles, assume user needs to complete registration
        // Don't fail the login process - user can still proceed to registration
        setProfileComplete(false);
      } finally {
        setLoading(false); // Clear global loading state only after profile check
      }
      
      // Navigation is handled by root layout on login state change
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid OTP.';
      Alert.alert('Verification Failed', message);
      console.log('OTP verification error:', error);
      // Clear OTP inputs
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      
      // Ensure auth state remains consistent on error
      console.log('OTP verification failed - staying on OTP screen');
    } finally {
      setIsLoading(false);
      // Don't clear global loading here - it was never set for failed OTP
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    setIsLoading(true);
    try {
      await sendOtpApi(phone!);
      Alert.alert('Success', 'A new OTP has been sent.');
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
      const message = error instanceof Error ? error.message : 'Failed to resend OTP.';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 px-6 py-20 justify-start bg-white">
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
