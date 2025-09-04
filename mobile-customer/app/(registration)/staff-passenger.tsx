
import React, { useState } from 'react';
import { View, Alert, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomInput } from '../../components/ui/CustomInput';
import { LocationInputField } from '../../components/ui/LocationInputField';
import { ButtonComponent } from '../../components/ui/ButtonComponent';
import { Typography } from '../../components/Typography';
import { GoogleMapPicker } from '../../components/GoogleMapPicker';
import { registerStaffApi } from '../../lib/api/profile.api';
import { useAuthStore } from '../../lib/stores/auth.store';
import { StaffProfileData } from '../../types/customer.types';
import { LocationDetails } from '../../types/location.types';
import { Colors } from '@/constants/Colors'; // Ensure this import is correct

type LocationPickerType = 'work' | 'pickup' | null;

export default function StaffPassengerScreen() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<StaffProfileData>>({});
  const [workLocationDetails, setWorkLocationDetails] = useState<LocationDetails | null>(null);
  const [pickupLocationDetails, setPickupLocationDetails] = useState<LocationDetails | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationPickerType, setLocationPickerType] = useState<LocationPickerType>(null);
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

  const handleLocationSelect = (location: LocationDetails) => {
    if (locationPickerType === 'work') {
      setWorkLocationDetails(location);
      handleInputChange('workLocation', location.name);
      handleInputChange('workAddress', location.address);
      setFormData(prev => ({
        ...prev,
        workLocationDetails: location
      }));
    } else if (locationPickerType === 'pickup') {
      setPickupLocationDetails(location);
      handleInputChange('pickUpLocation', location.name);
      handleInputChange('pickupAddress', location.address);
      setFormData(prev => ({
        ...prev,
        pickupLocationDetails: location
      }));
    }
    setShowLocationPicker(false);
    setLocationPickerType(null);
  };

  const openLocationPicker = (type: 'work' | 'pickup') => {
    setLocationPickerType(type);
    setShowLocationPicker(true);
  };

  const validateForm = (): boolean => {
    // Check if nearby city is filled
    if (!formData.nearbyCity || !formData.nearbyCity.trim()) {
      Alert.alert('Error', 'Nearby city is required');
      return false;
    }

    // Check if work location is selected
    if (!workLocationDetails) {
      Alert.alert('Error', 'Please select your work location on the map');
      return false;
    }

    // Check if pickup location is selected
    if (!pickupLocationDetails) {
      Alert.alert('Error', 'Please select your pickup location on the map');
      return false;
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
      
      // Prepare the complete form data with location details
      const completeFormData: StaffProfileData = {
        nearbyCity: formData.nearbyCity!,
        workLocation: workLocationDetails!.name,
        workAddress: workLocationDetails!.address,
        pickUpLocation: pickupLocationDetails!.name,
        pickupAddress: pickupLocationDetails!.address,
        workLocationDetails: workLocationDetails!,
        pickupLocationDetails: pickupLocationDetails!,
      };

      // 1. Call the final registration API function.
      const result = await registerStaffApi(accessToken, completeFormData);
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
  <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
    <View className="flex-1 bg-white">
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

          {/* Work Location with Map */}
          <LocationInputField
            label="Work Location"
            placeholder="Tap to select work location on map"
            value={workLocationDetails}
            onPress={() => openLocationPicker('work')}
            required
          />

          {/* Pickup Location with Map */}
          <LocationInputField
            label="Pickup Location"
            placeholder="Tap to select pickup location on map"
            value={pickupLocationDetails}
            onPress={() => openLocationPicker('pickup')}
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

      {/* Google Map Location Picker */}
      <GoogleMapPicker
        isVisible={showLocationPicker}
        onClose={() => {
          setShowLocationPicker(false);
          setLocationPickerType(null);
        }}
        onLocationSelect={handleLocationSelect}
        title={locationPickerType === 'work' ? 'Select Work Location' : 'Select Pickup Location'}
        placeholder={locationPickerType === 'work' ? 'Search for your workplace' : 'Search for pickup location'}
        initialLocation={locationPickerType === 'work' ? workLocationDetails || undefined : pickupLocationDetails || undefined}
      />
    </View>
  </SafeAreaView>
);
}

