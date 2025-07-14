import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChildRegistration } from '../../types/registration.types';
import { FormHeader } from '../../components/ui/FormHeader';
import { CustomInput } from '../../components/ui/CustomInput';
import { CustomButton } from '../../components/ui/CustomButton';
import { ProgressIndicator } from '../../components/ui/ProgressIndicator';
import { ImagePickerField } from '../../components/ui/ImagePickerField';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { ApiService } from '../../services/api';

export default function ChildStep2Screen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    relationship: '',
    parentImageUrl: '',
    parentName: '',
    parentEmail: '',
    parentAddress: '',
    emergencyContact: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const relationshipOptions = [
    { label: 'Mother', value: 'Mother' },
    { label: 'Father', value: 'Father' },
    { label: 'Guardian', value: 'Guardian' },
    { label: 'Grandmother', value: 'Grandmother' },
    { label: 'Grandfather', value: 'Grandfather' },
    { label: 'Other', value: 'Other' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const requiredFields = ['relationship', 'parentName', 'parentEmail', 'parentAddress', 'emergencyContact'];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData].trim()) {
        Alert.alert('Validation Error', `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`);
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.parentEmail)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Get step 1 data

      const step1DataString = await AsyncStorage.getItem('childRegistrationStep1');
      if (!step1DataString) {
        console.log('[FRONTEND] Step 1 data not found in AsyncStorage.');
        Alert.alert('Error', 'Step 1 data not found. Please go back and complete step 1.');
        return;
      }

      const step1Data = JSON.parse(step1DataString);
      console.log('[FRONTEND] Step 1 data loaded:', step1Data);

      // Get customer ID from stored user profile
      const userProfileString = await AsyncStorage.getItem('userProfile');
      const authToken = await AsyncStorage.getItem('authToken');

      if (!userProfileString || !authToken) {
        console.log('[FRONTEND] User profile or auth token not found.');
        Alert.alert('Error', 'User authentication data not found. Please log in again.');
        router.replace('/(auth)/phone-auth');
        return;
      }

      const userProfile = JSON.parse(userProfileString);
      const customerId = userProfile.id || userProfile.customer_id;
      console.log('[FRONTEND] Loaded userProfile:', userProfile);
      console.log('[FRONTEND] Using customerId:', customerId);

      if (!customerId) {
        console.log('[FRONTEND] Customer ID not found in userProfile.');
        Alert.alert('Error', 'Customer ID not found. Please log in again.');
        router.replace('/(auth)/phone-auth');
        return;
      }

      console.log('[FRONTEND] Step 2 formData:', formData);

      // Combine all data
      const completeData: ChildRegistration = {
        customerId,
        ...step1Data,
        ...formData,
      };

      // Trim all string values to remove extra spaces
      Object.keys(completeData).forEach(key => {
        if (typeof completeData[key as keyof ChildRegistration] === 'string') {
          (completeData as any)[key] = (completeData[key as keyof ChildRegistration] as string).trim();
        }
      });

      console.log('[FRONTEND] Complete child data being sent to API:', completeData);

      // Submit to API
      const result = await ApiService.registerChild(authToken, completeData);

      if (result.success) {
        // Mark as registered
        await AsyncStorage.setItem('isRegistered', 'true');
        await AsyncStorage.setItem('registrationType', 'child');
        
        // Clean up temporary data
        await AsyncStorage.removeItem('childRegistrationStep1');
        
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
            <CustomSelect
              label="Relationship"
              value={formData.relationship}
              placeholder="Select relationship"
              options={relationshipOptions}
              onSelect={(value) => handleInputChange('relationship', value)}
              required
            />

            <ImagePickerField
              label="Parent Image"
              value={formData.parentImageUrl}
              onImageSelect={(uri) => handleInputChange('parentImageUrl', uri)}
            />

            <CustomInput
              label="Parent/Guardian Name"
              value={formData.parentName}
              onChangeText={(value) => handleInputChange('parentName', value)}
              placeholder="e.g., John Doe"
              required
            />

            <CustomInput
              label="Parent Email Address"
              value={formData.parentEmail}
              onChangeText={(value) => handleInputChange('parentEmail', value)}
              placeholder="e.g., john.doe@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              required
            />

            <CustomInput
              label="Emergency Contact"
              value={formData.emergencyContact}
              onChangeText={(value) => handleInputChange('emergencyContact', value)}
              placeholder="e.g., +94712345678"
              keyboardType="phone-pad"
              required
            />

            <CustomInput
              label="Parent Address"
              value={formData.parentAddress}
              onChangeText={(value) => handleInputChange('parentAddress', value)}
              placeholder="e.g., 789 Home Ave"
              multiline
              numberOfLines={2}
              required
            />
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View className="px-6 pb-6" style={{ backgroundColor: '#F9FAFB' }}>
        <CustomButton
          title="Continue"
          onPress={handleSubmit}
          loading={isLoading}
        />
      </View>
    </SafeAreaView>
  );
}
