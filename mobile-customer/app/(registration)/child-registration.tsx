import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { View, Alert, ScrollView, Image, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomInput } from '../../components/ui/CustomInput';
import { ButtonComponent } from '../../components/ui/ButtonComponent';
import { Typography } from '../../components/Typography';
import { registerChildApi } from '../../lib/api/profile.api';
import { useAuthStore } from '../../lib/stores/auth.store';
import { ChildProfileData } from '../../types/customer.types';
import { Colors } from '@/constants/Colors'; // Ensure this import is correct


export default function ChildRegistrationScreen() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<ChildProfileData>>({});
  const [childImageUri, setChildImageUri] = useState<string | null>(null);
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ flex: 1, backgroundColor: "white" }}>
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

            {/* Child Image Picker (Optional) */}
            <View>
              <Typography variant="body" className="mb-2 font-medium">Child Image (Optional)</Typography>
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
                    // Show preview
                    setChildImageUri(asset.uri);
                    // Use the filename if available, otherwise generate one
                    const filename = asset.fileName || `child_${Date.now()}.jpg`;
                    setFormData(prev => ({ ...prev, childImageUrl: filename }));
                  }
                }}
                style={{ backgroundColor: '#e5e7eb', padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 8 }}
              >
                <Typography variant="body" className="font-medium">{childImageUri ? 'Change Image' : 'Pick Child Image'}</Typography>
              </TouchableOpacity>
              {formData.childImageUrl ? (
                <Typography variant="subhead" className="text-xs text-green-600">Image selected: {formData.childImageUrl}</Typography>
              ) : null}
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
      </View>
    </SafeAreaView>

  );
}
