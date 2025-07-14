import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FormHeader } from '../../components/ui/FormHeader';
import { CustomInput } from '../../components/ui/CustomInput';
import { CustomButton } from '../../components/ui/CustomButton';
import { ProgressIndicator } from '../../components/ui/ProgressIndicator';

export default function StaffStep1Screen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nearbyCity: '',
    workLocation: '',
    workAddress: '',
    pickUpLocation: '',
    pickupAddress: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const requiredFields = ['nearbyCity', 'workLocation', 'workAddress', 'pickUpLocation', 'pickupAddress'];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData].trim()) {
        Alert.alert('Validation Error', `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`);
        return false;
      }
    }
    return true;
  };

  const handleNext = async () => {
    if (!validateForm()) return;

    try {
      await AsyncStorage.setItem('staffRegistrationStep1', JSON.stringify(formData));
      router.push('./staff-step2');
    } catch {
      Alert.alert('Error', 'Failed to save data. Please try again.');
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
            currentStep={1} 
            totalSteps={2} 
            className="mb-8" 
          />

          {/* Form Fields */}
          <View className="space-y-4">
            <CustomInput
              label="Nearby City"
              value={formData.nearbyCity}
              onChangeText={(value) => handleInputChange('nearbyCity', value)}
              placeholder="e.g., Colombo"
              required
            />

            <CustomInput
              label="Work Location"
              value={formData.workLocation}
              onChangeText={(value) => handleInputChange('workLocation', value)}
              placeholder="e.g., Company HQ"
              required
            />

            <CustomInput
              label="Work Address"
              value={formData.workAddress}
              onChangeText={(value) => handleInputChange('workAddress', value)}
              placeholder="e.g., 123 Main St"
              multiline
              numberOfLines={2}
              required
            />

            <CustomInput
              label="Pick Up Location"
              value={formData.pickUpLocation}
              onChangeText={(value) => handleInputChange('pickUpLocation', value)}
              placeholder="e.g., Bus Stop"
              required
            />

            <CustomInput
              label="Pickup Address"
              value={formData.pickupAddress}
              onChangeText={(value) => handleInputChange('pickupAddress', value)}
              placeholder="e.g., 456 Side St"
              multiline
              numberOfLines={2}
              required
            />
          </View>
        </View>
      </ScrollView>

      {/* Next Button */}
      <View className="px-6 pb-6" style={{ backgroundColor: '#F9FAFB' }}>
        <CustomButton
          title="Continue"
          onPress={handleNext}
        />
      </View>
    </SafeAreaView>
  );
}
