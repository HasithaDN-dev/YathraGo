import * as ImagePicker from 'expo-image-picker';
// ...existing code...
import React, { useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { View, Alert, ScrollView, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ButtonComponent } from '../../components/ui/ButtonComponent';
import { CustomInput } from '../../components/ui/CustomInput';
import { Typography } from '../../components/Typography';
import { completeCustomerProfileApi } from '../../lib/api/profile.api';
import { useAuthStore } from '../../lib/stores/auth.store';
import { CustomerProfileData } from '../../types/customer.types';
import { Colors } from '@/constants/Colors'; // Ensure this import is correct

export default function CustomerRegisterScreen() {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  // Removed uploading state, not needed
  // Pick or take a profile image, and set its filename as profileImageUrl (no upload)
  const handlePickProfileImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permission Denied', 'We need media library permissions to select a profile image.');
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
      setProfileImage(asset.uri);
      // Use the filename if available, otherwise generate one
      const filename = asset.fileName || `profile_${Date.now()}.jpg`;
      setFormData(prev => ({ ...prev, profileImageUrl: filename }));
    }
  };
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CustomerProfileData>>({ gender: 'Unspecified' });

  // Get the accessToken from our global auth store
  const { accessToken, user } = useAuthStore();
  // // Debug: log accessToken to verify it's set
  // console.log('RegisterScreen accessToken:', accessToken);

  // Accept/display as 0xxxxxxxxx, validate as 9/10 digits, convert to +94xxxxxxxxx for API
  const handleEmergencyContactChange = (value: string) => {
    // Remove all non-digits and limit to 10 digits
    const cleaned = value.replace(/\D/g, '').substring(0, 10);
    setFormData(prev => ({
      ...prev,
      emergencyContact: cleaned
    }));
  };

  const validatePhoneNumber = (phone: string) => {
    // Accept 9 digits (without leading 0) or 10 digits (with leading 0)
    const phone9Digits = /^[1-9][0-9]{8}$/;
    const phone10Digits = /^0[1-9][0-9]{8}$/;
    return phone9Digits.test(phone) || phone10Digits.test(phone);
  };

  const convertToApiFormat = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10 && cleaned.startsWith('0')) {
      return '+94' + cleaned.substring(1);
    }
    if (cleaned.length === 9) {
      return '+94' + cleaned;
    }
    return '+94' + cleaned;
  };

  const handleInputChange = (field: keyof CustomerProfileData, value: string) => {
    if (field === 'emergencyContact') {
      handleEmergencyContactChange(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateForm = (): boolean => {
    // Basic validation checks
    if (!formData.firstName?.trim()) {
      Alert.alert('Error', 'First name is required');
      return false;
    }
    if (!formData.lastName?.trim()) {
      Alert.alert('Error', 'Last name is required');
      return false;
    }
    if (!formData.email?.trim()) {
      Alert.alert('Error', 'Email is required');
      return false;
    }
    if (!formData.address?.trim()) {
      Alert.alert('Error', 'Address is required');
      return false;
    }
    if (!formData.emergencyContact?.trim()) {
      Alert.alert('Error', 'Emergency contact is required');
      return false;
    }
    if (!validatePhoneNumber(formData.emergencyContact)) {
      Alert.alert('Error', 'Please enter a valid Sri Lankan phone number (9 or 10 digits, e.g., 0712345678)');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleRegisterAndContinue = async () => {
    if (!validateForm() || !accessToken) {
      Alert.alert('Error', 'Form is invalid or you are not logged in.');
      return;
    }

    setLoading(true);
    try {
      // Add customerId from user to payload
      const payload = { ...formData, customerId: user?.id };
      // Convert emergencyContact to API format
      if (payload.emergencyContact) {
        payload.emergencyContact = convertToApiFormat(payload.emergencyContact);
      }
      console.log('RegisterScreen payload:', payload);
      
      // Call API and get response with registration status
      const response = await completeCustomerProfileApi(accessToken, payload as CustomerProfileData);
      console.log('Customer registration response:', response);
      
      // Update registration status in auth store
      if (response.registrationStatus) {
        const { setRegistrationStatus, setCustomerRegistered } = useAuthStore.getState();
        setRegistrationStatus(response.registrationStatus);
        setCustomerRegistered(true);
        console.log('Updated registration status to:', response.registrationStatus);
      }
      
      // Navigate to the profile type selection
      console.log('Customer registration successful, navigating to registration-type');
      router.push('/(registration)/registration-type');
    } catch (error) {
      let message = 'Registration failed.';
      if (error instanceof Error) {
        if (typeof error.message === 'object') {
          message = JSON.stringify(error.message);
        } else {
          message = error.message;
        }
      }
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ flex: 1 }}>
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
              Complete Your Profile
            </Typography>
            <Typography
              variant="body"
              className="text-brand-neutralGray text-center"
            >
              Please provide your details to continue with registration
            </Typography>
          </View>

          {/* Form */}

          <View style={{ gap: 20, marginBottom: 32 }}>
            <CustomInput
              label="First Name"
              placeholder="Enter your first name"
              value={formData.firstName || ''}
              onChangeText={(value: string) => handleInputChange('firstName', value)}
              required
            />
            <CustomInput
              label="Last Name"
              placeholder="Enter your last name"
              value={formData.lastName || ''}
              onChangeText={(value: string) => handleInputChange('lastName', value)}
              required
            />
            <View>
              <Typography variant="body" className="mb-2 font-medium">Gender</Typography>
              <View style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, marginBottom: 8 }}>
                <Picker
                  selectedValue={formData.gender}
                  onValueChange={(value) => handleInputChange('gender', value)}
                >
                  <Picker.Item label="Select Gender" value="" />
                  <Picker.Item label="Male" value="Male" />
                  <Picker.Item label="Female" value="Female" />
                  <Picker.Item label="Unspecified" value="Unspecified" />
                </Picker>
              </View>
            </View>

            <CustomInput
              label="Email Address"
              placeholder="Enter your email"
              value={formData.email || ''}
              onChangeText={(value: string) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              required
            />

            <CustomInput
              label="Address"
              placeholder="Enter your address"
              value={formData.address || ''}
              onChangeText={(value: string) => handleInputChange('address', value)}
              multiline
              numberOfLines={3}
              required
            />

            <CustomInput
              label="Emergency Contact"
              placeholder="07XXXXXXXX"
              value={formData.emergencyContact || ''}
              onChangeText={(value: string) => handleInputChange('emergencyContact', value)}
              keyboardType="phone-pad"
              maxLength={10}
              required
            />

            <View>
              <Typography variant="body" className="mb-2 font-medium">Profile Image (Optional)</Typography>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 8 }} />
              ) : null}
              <TouchableOpacity onPress={handlePickProfileImage} style={{ backgroundColor: '#e5e7eb', padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 8 }}>
                <Typography variant="body" className="font-medium">{profileImage ? 'Change Image' : 'Pick Profile Image'}</Typography>
              </TouchableOpacity>
            </View>
          </View>

          {/* Register Button */}
          <ButtonComponent
            title="Register and Continue"
            onPress={handleRegisterAndContinue}
            loading={loading}
            variant="primary"
            size="large"
            style={{ marginBottom: 20 }}
          />

          {/* Info Text */}
          <View style={{ 
            backgroundColor: '#f1f5f9', 
            padding: 16, 
            borderRadius: 12,
            borderLeftWidth: 4,
            borderLeftColor: '#3b82f6'
          }}>
            <Typography
              variant="footnote"
              className="text-slate-600"
            >
              After completing your profile, you will be able to choose your registration type and continue with the specific registration process.
            </Typography>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
