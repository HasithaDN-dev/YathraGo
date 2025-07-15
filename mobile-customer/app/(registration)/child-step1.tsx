import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FormHeader } from '../../components/ui/FormHeader';
import { CustomInput } from '../../components/ui/CustomInput';
import { CustomButton } from '../../components/ui/CustomButton';
import { ProgressIndicator } from '../../components/ui/ProgressIndicator';
import { ImagePickerField } from '../../components/ui/ImagePickerField';

export default function ChildStep1Screen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    childName: '',
    nearbyCity: '',
    schoolLocation: '',
    school: '',
    pickUpAddress: '',
    childImageUrl: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const requiredFields = ['childName', 'nearbyCity', 'schoolLocation', 'school', 'pickUpAddress'];
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
      console.log('[FRONTEND] Step 1 formData:', formData);
      await AsyncStorage.setItem('childRegistrationStep1', JSON.stringify(formData));
      console.log('[FRONTEND] Step 1 data saved to AsyncStorage.');
      router.push('./child-step2');
    } catch (e) {
      console.log('[FRONTEND] Error saving step 1 data:', e);
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
              label="Child Name"
              value={formData.childName}
              onChangeText={(value) => handleInputChange('childName', value)}
              placeholder="e.g., Jane Doe"
              required
            />

            <CustomInput
              label="Nearby City"
              value={formData.nearbyCity}
              onChangeText={(value) => handleInputChange('nearbyCity', value)}
              placeholder="e.g., Colombo"
              required
            />

            <CustomInput
              label="School Location"
              value={formData.schoolLocation}
              onChangeText={(value) => handleInputChange('schoolLocation', value)}
              placeholder="e.g., Colombo 7"
              required
            />

            <CustomInput
              label="School Name"
              value={formData.school}
              onChangeText={(value) => handleInputChange('school', value)}
              placeholder="e.g., Royal College"
              required
            />

            <CustomInput
              label="Pick Up Address"
              value={formData.pickUpAddress}
              onChangeText={(value) => handleInputChange('pickUpAddress', value)}
              placeholder="e.g., 123 School Lane"
              multiline
              numberOfLines={2}
              required
            />

            <ImagePickerField
              label="Child Photo URL"
              value={formData.childImageUrl}
              onImageSelect={(uri) => handleInputChange('childImageUrl', uri)}
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
