import React, { useState } from 'react';
import { GenderPicker, GenderType } from '../../components/ui/GenderPicker';
import * as ImagePicker from 'expo-image-picker';
import { View, Alert, ScrollView, Image, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomInput } from '../../components/ui/CustomInput';
import { LocationInputField } from '../../components/ui/LocationInputField';
import { ButtonComponent } from '../../components/ui/ButtonComponent';
import { Typography } from '../../components/Typography';
import { registerChildApi, uploadChildProfileImageApi } from '../../lib/api/profile.api';
import { useAuthStore } from '../../lib/stores/auth.store';
import { useProfileStore } from '../../lib/stores/profile.store';
import { ChildProfileData } from '../../types/customer.types';
import { GoogleMapPicker } from '../../components/GoogleMapPicker';
import { LocationDetails } from '../../types/location.types';
// import { Colors } from '@/constants/Colors'; // Ensure this import is correct


export default function ChildRegistrationScreen() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<ChildProfileData & { gender: GenderType }>>({ gender: 'Unspecified' });
  const [childImageUri, setChildImageUri] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isAddMode = mode === 'add';

  // Map picker states
  const [isSchoolMapVisible, setIsSchoolMapVisible] = useState(false);
  const [isPickupMapVisible, setIsPickupMapVisible] = useState(false);

  // Get the accessToken and the action to complete the profile from the store.
  const { accessToken, setProfileComplete } = useAuthStore();
  const { refreshProfiles } = useProfileStore();

  const handleInputChange = (field: keyof ChildProfileData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSchoolLocationSelect = (location: LocationDetails) => {
    setFormData(prev => ({
      ...prev,
      schoolLocationDetails: location,
      schoolLocation: location.name,
      school: location.name,
    }));
    setIsSchoolMapVisible(false);
  };

  const handlePickupLocationSelect = (location: LocationDetails) => {
    setFormData(prev => ({
      ...prev,
      pickupLocationDetails: location,
      pickUpAddress: location.address,
    }));
    setIsPickupMapVisible(false);
  };

  const validateForm = (): boolean => {
    // Check basic text fields
    const requiredTextFields: (keyof ChildProfileData)[] = [
      'childFirstName',
      'childLastName',
      'gender',
      'relationship',
      'nearbyCity'
    ];

    for (const field of requiredTextFields) {
      const value = formData[field];
      if (!value || (typeof value === 'string' && !value.trim())) {
        const fieldName = field.replace(/([A-Z])/g, ' $1').toLowerCase();
        Alert.alert('Error', `${fieldName} is required`);
        return false;
      }
    }

    // Check location selections
    if (!formData.schoolLocationDetails) {
      Alert.alert('Error', 'Please select a school location using the map');
      return false;
    }

    if (!formData.pickupLocationDetails) {
      Alert.alert('Error', 'Please select a pickup location using the map');
      return false;
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
    let childImageUrl = formData.childImageUrl;
    try {
      // If a new image is picked (local URI), upload it first
      if (childImageUri && !childImageUri.startsWith('http')) {
        setUploadingImage(true);
        try {
          const uploadRes = await uploadChildProfileImageApi(accessToken, childImageUri);
          childImageUrl = uploadRes.filename;
        } catch (err) {
          let msg = 'Failed to upload image.';
          if (err instanceof Error) msg = err.message;
          Alert.alert('Error', msg);
          setLoading(false);
          setUploadingImage(false);
          return;
        }
        setUploadingImage(false);
      }

      // 1. Call the final registration API function with image filename
      const result = await registerChildApi(accessToken, { ...formData, childImageUrl } as ChildProfileData);
      console.log('Child registration: API call successful:', result);

      // 2. **CRITICAL STEP**: Update the global state to mark the profile as complete.
      if (!isAddMode) {
        setProfileComplete(true);
        console.log('Child registration: Profile marked as complete');
        
        // Refresh profiles to include the newly created profile
        await refreshProfiles(accessToken);
        console.log('Child registration: Profiles refreshed');
      }

      // 3. Navigate based on mode
      if (isAddMode) {
        Alert.alert('Success', 'Child profile added successfully!');
        router.back(); // Go back to add profile screen
      } else {
        Alert.alert('Success', 'Child registration completed successfully!');
        
        // Explicitly navigate to home page after successful registration
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 1000); // Small delay to allow the alert to show
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
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
              label="Child First Name"
              placeholder="Enter child's first name"
              value={formData.childFirstName || ''}
              onChangeText={(value: string) => handleInputChange('childFirstName', value)}
              required
            />
            <CustomInput
              label="Child Last Name"
              placeholder="Enter child's last name"
              value={formData.childLastName || ''}
              onChangeText={(value: string) => handleInputChange('childLastName', value)}
              required
            />
            <GenderPicker
              value={formData.gender as GenderType}
              onChange={(value) => handleInputChange('gender', value)}
              style={{ marginBottom: 8 }}
            />

            <CustomInput
              label="Relationship"
              placeholder="e.g. Son , Daughter"
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

            {/* School Location Picker */}
            <LocationInputField
              label="School Location"
              placeholder="Tap to select school location on map"
              value={formData.schoolLocationDetails}
              onPress={() => setIsSchoolMapVisible(true)}
              required
            />

            {/* Manual School Name Input (optional) */}
            {formData.schoolLocationDetails && (
              <CustomInput
                label="School Name (optional)"
                placeholder="Enter specific school name if different"
                value={formData.school || ''}
                onChangeText={(value: string) => handleInputChange('school', value)}
              />
            )}

            {/* Pickup Location Picker */}
            <LocationInputField
              label="Pickup Location"
              placeholder="Tap to select pickup location on map"
              value={formData.pickupLocationDetails}
              onPress={() => setIsPickupMapVisible(true)}
              required
            />

            {/* Child Image Picker (Optional) */}
            <View>
              <Typography variant="footnote" className="mb-2 font-medium">Child Image (Optional)</Typography>
              {childImageUri ? (
                <Image source={{ uri: childImageUri }} style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 8 }} />
              ) : null}
              <TouchableOpacity
                onPress={async () => {
                  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                  if (permission.status !== 'granted') {
                    Alert.alert('Permission Denied', 'We need media library permissions to select a child image.');
                    return;
                  }
                  const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.7,
                  });
                  if (!result.canceled && result.assets && result.assets.length > 0) {
                    const asset = result.assets[0];
                    // Show preview only, do NOT upload here
                    setChildImageUri(asset.uri);
                  }
                }}
                style={{ backgroundColor: '#e5e7eb', padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 8 }}
                disabled={uploadingImage}
              >
                <Typography variant="body" className="font-medium">{uploadingImage ? 'Uploading...' : (childImageUri ? 'Change Image' : 'Pick Child Image')}</Typography>
              </TouchableOpacity>
            </View>
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

        {/* Google Map Pickers */}
        <GoogleMapPicker
          title="Select School Location"
          placeholder="Search for your child's school..."
          isVisible={isSchoolMapVisible}
          onClose={() => setIsSchoolMapVisible(false)}
          onLocationSelect={handleSchoolLocationSelect}
          initialLocation={formData.schoolLocationDetails}
        />

        <GoogleMapPicker
          title="Select Pickup Location"
          placeholder="Search for pickup location..."
          isVisible={isPickupMapVisible}
          onClose={() => setIsPickupMapVisible(false)}
          onLocationSelect={handlePickupLocationSelect}
          initialLocation={formData.pickupLocationDetails}
        />
      </View>
    </SafeAreaView>

  );
}
