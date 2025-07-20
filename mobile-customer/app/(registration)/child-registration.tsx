import React, { useState } from 'react';
import { View, Alert, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomInput } from '../../components/ui/CustomInput';
import { ButtonComponent } from '../../components/ui/ButtonComponent';
import { Typography } from '../../components/Typography';
import { registerChildApi } from '../../lib/api/profile.api';
import { useAuthStore } from '../../lib/stores/auth.store';
import { ChildProfileData } from '../../types/customer.types';

export default function ChildRegistrationScreen() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<ChildProfileData>>({});
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isAddMode = mode === 'add';

  // Get the accessToken and the action to complete the profile from the store.
  const { accessToken, setProfileComplete } = useAuthStore();

  const handleInputChange = (field: keyof ChildProfileData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {

    const requiredFields: (keyof ChildProfileData)[] = [
      'childName',
      'relationship',
      'nearbyCity',
      'schoolLocation',
      'school',
      'pickUpAddress'
    ];

    for (const field of requiredFields) {
      const value = formData[field];
      if (!value || (typeof value === 'string' && !value.trim())) {
        const fieldName = field.replace(/([A-Z])/g, ' $1').toLowerCase();
        Alert.alert('Error', `${fieldName} is required`);
        return false;
      }
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    if (!accessToken) {
      Alert.alert('Error', 'Authentication token not found');
      return;
    }
    setLoading(true);
    try {
      console.log('Child registration: Starting API call...');
      // 1. Call the final registration API function.
      const result = await registerChildApi(accessToken, formData as ChildProfileData);
      console.log('Child registration: API call successful:', result);

      // 2. **CRITICAL STEP**: Update the global state to mark the profile as complete.
      if (!isAddMode) {
        setProfileComplete(true);
        console.log('Child registration: Profile marked as complete');
      }

      // 3. Navigate based on mode
      if (isAddMode) {
        Alert.alert('Success', 'Child profile added successfully!');
        router.back(); // Go back to add profile screen
      } else {
        Alert.alert('Success', 'Child registration completed successfully!');
        // The `app/(app)/_layout.tsx` guard will automatically navigate to main app
      }

    } catch (error) {
      console.error('Child registration error:', error);
      let message = 'Registration failed.';
      
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Handle error objects
        if ('message' in error && typeof error.message === 'string') {
          message = error.message;
        } else {
          message = JSON.stringify(error);
        }
      } else if (typeof error === 'string') {
        message = error;
      }
      
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 bg-bg-light-blue">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={{ marginBottom: 32 }}>
            <Typography
              variant="large-title"
              weight="bold"
              className="text-brand-deepNavy text-center mb-2"
            >
              {isAddMode ? 'Add Child Profile' : 'Child Registration'}
            </Typography>
            <Typography
              variant="body"
              className="text-brand-neutralGray text-center"
            >
              Please provide your child&apos;s school and transport details
            </Typography>
          </View>

          {/* Form */}
          <View style={{ gap: 20, marginBottom: 32 }}>
            <CustomInput
              label="Child Name"
              placeholder="Enter child's full name"
              value={formData.childName || ''}
              onChangeText={(value: string) => handleInputChange('childName', value)}
              required
            />

            <CustomInput
              label="Relationship"
              placeholder="e.g., Father, Mother, Guardian"
              value={formData.relationship || ''}
              onChangeText={(value: string) => handleInputChange('relationship', value)}
              required
            />

            <CustomInput
              label="Nearby City"
              placeholder="Enter nearby city"
              value={formData.nearbyCity || ''}
              onChangeText={(value: string) => handleInputChange('nearbyCity', value)}
              required
            />

            <CustomInput
              label="School Location"
              placeholder="Enter school location/area"
              value={formData.schoolLocation || ''}
              onChangeText={(value: string) => handleInputChange('schoolLocation', value)}
              required
            />

            <CustomInput
              label="School Name"
              placeholder="Enter school name"
              value={formData.school || ''}
              onChangeText={(value: string) => handleInputChange('school', value)}
              required
            />

            <CustomInput
              label="Pickup Address"
              placeholder="Enter pickup address"
              value={formData.pickUpAddress || ''}
              onChangeText={(value: string) => handleInputChange('pickUpAddress', value)}
              multiline
              numberOfLines={3}
              required
            />

            <CustomInput
              label="Child Image URL (Optional)"
              placeholder="Enter child's image URL"
              value={formData.childImageUrl || ''}
              onChangeText={(value: string) => handleInputChange('childImageUrl', value)}
              autoCapitalize="none"
            />
          </View>

          {/* Action Buttons */}
          <View style={{ gap: 12 }}>
            <ButtonComponent
              title={isAddMode ? "Add Child Profile" : "Complete Registration"}
              onPress={handleRegister}
              loading={loading}
              variant="primary"
              size="large"
            />

            <ButtonComponent
              title="Back"
              onPress={handleBack}
              variant="secondary"
              size="large"
            />
          </View>

          {/* Info Text */}
          <View style={{
            backgroundColor: '#f1f5f9',
            padding: 16,
            borderRadius: 12,
            borderLeftWidth: 4,
            borderLeftColor: '#3b82f6',
            marginTop: 20
          }}>
            <Typography
              variant="footnote"
              className="text-slate-600"
            >
              After completing this registration, you will be able to track your child&apos;s school transport and receive notifications about pickup times.
            </Typography>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>

  );
}
