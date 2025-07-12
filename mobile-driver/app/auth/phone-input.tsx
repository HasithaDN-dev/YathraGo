import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { getApiUrl, API_CONFIG, testConnection } from '../../config/api';

export default function PhoneInputScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed'>('checking');

  useEffect(() => {
    // Test backend connection on component mount
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const isConnected = await testConnection();
      setConnectionStatus(isConnected ? 'connected' : 'failed');
      if (!isConnected) {
        Alert.alert(
          'Connection Error',
          `Cannot connect to backend server at ${API_CONFIG.baseURL}. Please check if the server is running.`,
        );
      }
    } catch (error) {
      console.error('Connection check failed:', error);
      setConnectionStatus('failed');
    }
  };

  const validatePhoneNumber = (phone: string): { isValid: boolean; error?: string } => {
    if (!phone.trim()) {
      return { isValid: false, error: 'Please enter your phone number' };
    }

    // Remove any spaces or special characters except +
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    
    // Check if it starts with +94
    if (cleanPhone.startsWith('+94')) {
      const phoneDigits = cleanPhone.substring(3);
      if (phoneDigits.length !== 9) {
        return { 
          isValid: false, 
          error: 'Phone number must be exactly 9 digits after +94 (e.g., 736554890)' 
        };
      }
      if (!/^[0-9]+$/.test(phoneDigits)) {
        return { isValid: false, error: 'Phone number must contain only digits' };
      }
    } else {
      // If doesn't start with +94, check if it's 9 digits
      const phoneDigits = cleanPhone.startsWith('0') ? cleanPhone.substring(1) : cleanPhone;
      if (phoneDigits.length !== 9) {
        return { 
          isValid: false, 
          error: 'Phone number must be exactly 9 digits (e.g., 736554890)' 
        };
      }
      if (!/^[0-9]+$/.test(phoneDigits)) {
        return { isValid: false, error: 'Phone number must contain only digits' };
      }
    }

    return { isValid: true };
  };

  const formatPhoneNumber = (phone: string): string => {
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    
    if (cleanPhone.startsWith('+94')) {
      return cleanPhone;
    }
    
    const phoneDigits = cleanPhone.startsWith('0') ? cleanPhone.substring(1) : cleanPhone;
    return `+94${phoneDigits}`;
  };

  const handleNext = async () => {
    const validation = validatePhoneNumber(phoneNumber);
    if (!validation.isValid) {
      Alert.alert('Invalid Phone Number', validation.error);
      return;
    }

    if (connectionStatus === 'failed') {
      Alert.alert(
        'Connection Error',
        'Cannot connect to server. Please check your network connection and try again.',
        [
          { text: 'Retry', onPress: checkConnection },
          { text: 'Cancel', style: 'cancel' },
        ],
      );
      return;
    }

    // Format phone number with country code
    const formattedPhone = formatPhoneNumber(phoneNumber);

    setLoading(true);

    try {
      console.log('Sending OTP request to:', getApiUrl(API_CONFIG.endpoints.auth.sendOtp));
      console.log('Request data:', { phone: formattedPhone, userType: 'DRIVER' });

      const response = await fetch(getApiUrl(API_CONFIG.endpoints.auth.sendOtp), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formattedPhone,
          userType: 'DRIVER', // Different from customer - this is DRIVER
        }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok && data.success) {
        // Navigate to OTP verification screen
        router.push({
          pathname: './otp-verification',
          params: {
            phone: formattedPhone,
            isNewUser: data.isNewUser?.toString() || 'false',
          },
        });
      } else {
        Alert.alert('Error', data.error || data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('OTP Send Error:', error);
      Alert.alert(
        'Network Error',
        'Failed to connect to server. Please check your network connection and try again.',
        [
          { text: 'Retry', onPress: () => handleNext() },
          { text: 'Cancel', style: 'cancel' },
        ],
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Header with Logo */}
      <View className="items-center mt-20 mb-12">
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
          Welcome Driver!
        </Text>
        <Text className="text-base text-gray-600 mb-8">
          Join YathraGo as a driver
        </Text>

        {/* Phone Input */}
        <Text className="text-sm text-gray-700 mb-3">
          Enter your phone number
        </Text>
        
        <View className="flex-row items-center border border-gray-300 rounded-lg px-4 py-3 mb-6">
          <Text className="text-base text-gray-700 mr-2">+94</Text>
          <TextInput
            className="flex-1 text-base text-gray-800"
            placeholder="736554890"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={(text) => {
              // Only allow digits and limit to 9 characters
              const cleaned = text.replace(/[^0-9]/g, '');
              if (cleaned.length <= 9) {
                setPhoneNumber(cleaned);
              }
            }}
            maxLength={9}
            editable={!loading}
          />
        </View>

        <Text className="text-xs text-gray-500 mb-8">
          Enter exactly 9 digits (e.g., 736554890). Securing your personal information is our priority.
        </Text>

        {/* Next Button */}
        <TouchableOpacity
          onPress={handleNext}
          disabled={loading}
          className={`py-4 rounded-lg ${loading ? 'bg-gray-400' : 'bg-blue-600'}`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center text-base font-semibold">
              Next
            </Text>
          )}
        </TouchableOpacity>
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
