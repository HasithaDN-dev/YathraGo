
import React, { useState } from 'react';
import { View, Alert, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomInput } from '../../components/ui/CustomInput';
import { ButtonComponent } from '../../components/ui/ButtonComponent';
import { Typography } from '../../components/Typography';
import { registerStaffApi } from '../../lib/api/profile.api';
import { useAuthStore } from '../../lib/stores/auth.store';
import { StaffProfileData } from '../../types/customer.types';

export default function StaffPassengerScreen() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<StaffProfileData>>({});
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isAddMode = mode === 'add';
  
  // Get the accessToken and the action to complete the profile from the global store.
  const { accessToken, setProfileComplete } = useAuthStore();

  const handleInputChange = (field: keyof StaffProfileData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {

    const requiredFields: (keyof StaffProfileData)[] = [
      'nearbyCity',
      'workLocation',
      'workAddress',
      'pickUpLocation',
      'pickupAddress'
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
    if (!validateForm() || !accessToken) {
      Alert.alert('Error', 'Form is invalid or you are not logged in.');
      return;
    }

    setLoading(true);
    try {
      console.log('Staff registration: Starting API call...');
      // 1. Call the final registration API function.
      const result = await registerStaffApi(accessToken, formData as StaffProfileData);
      console.log('Staff registration: API call successful:', result);
      
      // 2. **CRITICAL STEP**: Update the global state to mark the profile as complete.
      if (!isAddMode) {
        setProfileComplete(true);
        console.log('Staff registration: Profile marked as complete');
      }

      // 3. Navigate based on mode
      if (isAddMode) {
        Alert.alert('Success', 'Staff profile added successfully!');
        router.back(); // Go back to add profile screen
      } else {
        Alert.alert('Success', 'Staff passenger registration completed successfully!');
        // The `app/(app)/_layout.tsx` guard will automatically navigate to main app
      }

    } catch (error) {
      console.error('Staff registration error:', error);
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
    <View className="flex-1 bg-brand-lightNavy">
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
            {isAddMode ? 'Add Staff Profile' : 'Staff Passenger Registration'}
          </Typography>
          <Typography
            variant="body"
            className="text-brand-neutralGray text-center"
          >
            Please provide your work and pickup details
          </Typography>
        </View>

        {/* Form */}
        <View style={{ gap: 20, marginBottom: 32 }}>
          <CustomInput
            label="Nearby City"
            placeholder="Enter nearby city"
            value={formData.nearbyCity || ''}
            onChangeText={(value: string) => handleInputChange('nearbyCity', value)}
            required
          />

          <CustomInput
            label="Work Location"
            placeholder="Enter work location name"
            value={formData.workLocation || ''}
            onChangeText={(value: string) => handleInputChange('workLocation', value)}
            required
          />

          <CustomInput
            label="Work Address"
            placeholder="Enter full work address"
            value={formData.workAddress || ''}
            onChangeText={(value: string) => handleInputChange('workAddress', value)}
            multiline
            numberOfLines={3}
            required
          />

          <CustomInput
            label="Pickup Location"
            placeholder="Enter pickup location name"
            value={formData.pickUpLocation || ''}
            onChangeText={(value: string) => handleInputChange('pickUpLocation', value)}
            required
          />

          <CustomInput
            label="Pickup Address"
            placeholder="Enter full pickup address"
            value={formData.pickupAddress || ''}
            onChangeText={(value: string) => handleInputChange('pickupAddress', value)}
            multiline
            numberOfLines={3}
            required
          />
        </View>

        {/* Action Buttons */}
        <View style={{ gap: 12 }}>
          <ButtonComponent
            title={isAddMode ? "Add Staff Profile" : "Complete Registration"}
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
            After completing this registration, you will be able to access staff passenger features and book rides to your work location.
          </Typography>
        </View>
      </ScrollView>
    </View>
  </SafeAreaView>
);
}

