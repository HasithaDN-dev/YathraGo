import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StaffPassengerRegistration } from '../../types/registration.types';
import { FormHeader } from '../../components/ui/FormHeader';
import { CustomInput } from '../../components/ui/CustomInput';
import { ButtonComponent } from '../../components/ui/ButtonComponent';
import { PhoneComponent, validateSriLankanPhone } from '../../components/ui/PhoneComponent';
import { ProgressIndicator } from '../../components/ui/ProgressIndicator';
import { ImagePickerField } from '../../components/ui/ImagePickerField';
import { ApiService } from '../../services/api';

export default function StaffStep2Screen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    profileImageUrl: '',
    emergencyContact: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const requiredFields = ['name', 'email', 'address'];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData].trim()) {
        Alert.alert('Validation Error', `${field} is required`);
        return false;
      }
    }

    // Email validation - more comprehensive
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email.trim())) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }

    // Emergency contact phone validation (if provided)
    if (formData.emergencyContact.trim()) {
      if (!validateSriLankanPhone(formData.emergencyContact.trim())) {
        setPhoneError('Enter a valid Sri Lankan mobile number (e.g., +94 712 345 678)');
        return false;
      }
    }
    setPhoneError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Get step 1 data
      const step1DataString = await AsyncStorage.getItem('staffRegistrationStep1');
      if (!step1DataString) {
        Alert.alert('Error', 'Step 1 data not found. Please go back and complete step 1.');
        return;
      }

      const step1Data = JSON.parse(step1DataString);
      
      // Get customer ID from stored user profile
      const userProfileString = await AsyncStorage.getItem('userProfile');
      const authToken = await AsyncStorage.getItem('authToken');
      
      if (!userProfileString || !authToken) {
        Alert.alert('Error', 'User authentication data not found. Please log in again.');
        router.replace('/(auth)/phone-auth');
        return;
      }

      const userProfile = JSON.parse(userProfileString);
      const customerId = userProfile.id || userProfile.customer_id;

      if (!customerId) {
        Alert.alert('Error', 'Customer ID not found. Please log in again.');
        router.replace('/(auth)/phone-auth');
        return;
      }

      console.log('Step 1 data:', step1Data);
      console.log('Step 2 data (formData):', formData);

      // Combine all data and ensure all fields are properly formatted
      const completeData: StaffPassengerRegistration = {
        customerId: Number(customerId), // Ensure it's a number
        nearbyCity: String(step1Data.nearbyCity || '').trim(),
        workLocation: String(step1Data.workLocation || '').trim(),
        workAddress: String(step1Data.workAddress || '').trim(),
        pickUpLocation: String(step1Data.pickUpLocation || '').trim(),
        pickupAddress: String(step1Data.pickupAddress || '').trim(),
        name: String(formData.name || '').trim(),
        email: String(formData.email || '').trim().toLowerCase(), // Normalize email
        address: String(formData.address || '').trim(),
        profileImageUrl: formData.profileImageUrl ? String(formData.profileImageUrl).trim() : undefined,
        emergencyContact: formData.emergencyContact ? String(formData.emergencyContact).trim() : undefined,
      };

      // Additional validation to ensure no empty strings for required fields
      const requiredFields = ['nearbyCity', 'workLocation', 'workAddress', 'pickUpLocation', 'pickupAddress', 'name', 'email', 'address'];
      for (const field of requiredFields) {
        const value = completeData[field as keyof StaffPassengerRegistration];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          Alert.alert('Validation Error', `${field} cannot be empty`);
          return;
        }
      }

      // Validate email format again before sending
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(completeData.email)) {
        Alert.alert('Validation Error', 'Please enter a valid email address');
        return;
      }

      console.log('Complete data being sent to API:', completeData);
      console.log('CustomerId type:', typeof completeData.customerId);

      // Submit to API
      const result = await ApiService.registerStaffPassenger(authToken, completeData);

      if (result.success) {
        // Mark as registered
        await AsyncStorage.setItem('isRegistered', 'true');
        await AsyncStorage.setItem('registrationType', 'staff');
        
        // Clean up temporary data
        await AsyncStorage.removeItem('staffRegistrationStep1');
        
        Alert.alert('Success', result.message, [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)'),
          },
        ]);
      } else {
        Alert.alert('Registration Failed', result.message || 'Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#F9FAFB' }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-8">
          {/* Header */}
          <FormHeader
            title="Get Started Now"
            subtitle="Personal Information"
            showLogo={true}
          />

          {/* Progress Indicator */}
          <ProgressIndicator 
            currentStep={2} 
            totalSteps={2} 
            className="mb-8" 
          />

          {/* Form Fields */}
          <View className="space-y-4">
            <CustomInput
              label="First Name"
              value={formData.name.split(' ')[0] || ''}
              onChangeText={(value) => {
                const lastName = formData.name.split(' ').slice(1).join(' ');
                handleInputChange('name', lastName ? `${value} ${lastName}` : value);
              }}
              placeholder="e.g., John"
              required
            />

            <CustomInput
              label="Last Name"
              value={formData.name.split(' ').slice(1).join(' ') || ''}
              onChangeText={(value) => {
                const firstName = formData.name.split(' ')[0] || '';
                handleInputChange('name', `${firstName} ${value}`.trim());
              }}
              placeholder="e.g., Doe"
            />

            <ImagePickerField
              label="Profile Image"
              value={formData.profileImageUrl}
              onImageSelect={(uri) => handleInputChange('profileImageUrl', uri)}
            />

            <CustomInput
              label="Email Address"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="e.g., john.doe@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              required
            />

            <PhoneComponent
              label="Emergency Contact (optional)"
              value={formData.emergencyContact}
              onChangeText={(value: string) => handleInputChange('emergencyContact', value)}
              required={false}
              error={phoneError}
              example="e.g., +94 712 345 678"
            />

            <CustomInput
              label="City"
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              placeholder="e.g., Colombo"
              required
            />
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View className="px-6 pb-6" style={{ backgroundColor: '#F9FAFB' }}>
        <ButtonComponent
          title="Continue"
          onPress={handleSubmit}
          loading={isLoading}
        />
      </View>
    </SafeAreaView>
  );
}
