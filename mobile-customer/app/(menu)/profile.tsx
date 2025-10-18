import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/ui/Card';
import { PencilSimple, Trash, CaretDown } from 'phosphor-react-native';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import * as ImagePicker from 'expo-image-picker';
import { uploadCustomerProfileImageApi, uploadChildProfileImageApi, clearProfileCache } from '@/lib/api/profile.api';
import { API_BASE_URL } from '../../config/api';
import {
  updateCustomerProfileApi,
  updateChildProfileApi,
  updateStaffProfileApi,
} from "@/lib/api/profile-update.api";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useProfileStore } from "../../lib/stores/profile.store";
import { Profile } from "@/types/customer.types";

// Helper to get full image URL from filename
const getImageUrl = (filename: string | null | undefined) => {
  if (!filename) return undefined;
  // If already a full URL, return as is
  if (filename.startsWith('http')) return filename;
  return `${API_BASE_URL}/uploads/${filename}`;
};

type ProfileField = 'fullName' | 'phone' | 'email' | 'address' | 'emergencyContact';
interface ProfileFields {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
}

export default function ProfileScreen() {
  // Get active profile and customer profile from store
  const { activeProfile, refreshProfiles, customerProfile, profiles, setActiveProfile } = useProfileStore();
  const { accessToken } = useAuthStore();

  // Local state for editing
  const [fields, setFields] = useState<ProfileFields>({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
  });
  // Track if any field or image was changed
  const [isEdited, setIsEdited] = useState(false);
  const [newProfileImage, setNewProfileImage] = useState<any>(null); // for new image file

  // Set isEdited to true when any field changes
  const handleFieldChange = (field: keyof ProfileFields, value: string) => {
    setFields((prev) => ({ ...prev, [field]: value }));
    setIsEdited(true);
  };

  // Active field to edit; pens show only when this matches the card
  const [activeField, setActiveField] = useState<ProfileField | null>(null);

  // Local profile image preview and upload state
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Profile selection dropdown state
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Update fields when active profile or customer profile changes
  useEffect(() => {
    if (activeProfile && customerProfile) {
      console.log('Profile - Active profile changed:', {
        id: activeProfile.id,
        type: activeProfile.type,
        firstName: activeProfile.firstName,
        lastName: activeProfile.lastName,
        childFirstName: activeProfile.firstName,
        childLastName: activeProfile.lastName,
        school: activeProfile.school,
        workLocation: activeProfile.workLocation,
        pickUpAddress: activeProfile.pickUpAddress,
        pickupAddress: activeProfile.pickupAddress,
        relationship: activeProfile.relationship
      });

      console.log('Profile - Customer profile:', {
        phone: customerProfile.phone,
        email: customerProfile.email,
        emergencyContact: customerProfile.emergencyContact,
        firstName: customerProfile.firstName,
        lastName: customerProfile.lastName
      });

      // Handle different profile types
      let fullName = '';
      let address = '';

      if (activeProfile.type === 'child') {
        // For child profiles, use child-specific fields if available
        const childFirstName = (activeProfile as any).childFirstName || activeProfile.firstName || '';
        const childLastName = (activeProfile as any).childLastName || activeProfile.lastName || '';
        fullName = `${childFirstName} ${childLastName}`.trim();
        address = activeProfile.pickUpAddress || '';
      } else {
        fullName = `${activeProfile.firstName || ''} ${activeProfile.lastName || ''}`.trim();
        address = activeProfile.pickupAddress || activeProfile.pickUpAddress || '';
      }

      setFields({
        fullName,
        phone: customerProfile.phone || '',
        email: customerProfile.email || '',
        address,
        emergencyContact: customerProfile.emergencyContact || '',
      });

      // Set profile image if available (use customer profile image if no specific profile image)
      const imgUrl =
        getImageUrl(activeProfile.profileImageUrl) ||
        getImageUrl((activeProfile as any).childImageUrl) ||
        getImageUrl(customerProfile.profileImageUrl) ||
        null;
      console.log('Profile - Image URL after refresh:', imgUrl, {
        activeProfileProfileImageUrl: activeProfile.profileImageUrl,
        activeProfileChildImageUrl: (activeProfile as any).childImageUrl,
        customerProfileProfileImageUrl: customerProfile.profileImageUrl
      });
      setProfileImage(imgUrl);
    }
  }, [activeProfile, customerProfile]);

  const handleEdit = (field: ProfileField) => setActiveField(field);
  const handleSave = async () => {
    if (!activeField || !accessToken || !activeProfile || !customerProfile) {
      setActiveField(null);
      return;
    }

    try {
      if (activeField === 'fullName') {
        // Update customer profile with new name
        const [firstName, ...lastNameParts] = fields.fullName.trim().split(' ');
        const lastName = lastNameParts.join(' ');
        
        if (activeProfile.type === 'child') {
          // Update child profile - pass the full ID, the API will extract the numeric part
          await updateChildProfileApi(accessToken, activeProfile.id, {
            childFirstName: firstName,
            childLastName: lastName,
          });
        } else {
          // Update customer profile for staff or general profile
          await updateCustomerProfileApi(accessToken, {
            firstName,
            lastName,
          });
        }
      } else if (activeField === 'phone' || activeField === 'email' || activeField === 'emergencyContact') {
        // Update customer profile fields
        await updateCustomerProfileApi(accessToken, {
          [activeField]: fields[activeField],
        });
      } else if (activeField === 'address') {
        // Update address based on profile type
        if (activeProfile.type === 'child') {
          await updateChildProfileApi(accessToken, activeProfile.id, {
            pickUpAddress: fields.address,
          });
        } else if (activeProfile.type === 'staff') {
          await updateStaffProfileApi(accessToken, {
            pickupAddress: fields.address,
          });
        } else {
          await updateCustomerProfileApi(accessToken, {
            address: fields.address,
          });
        }
      }
      
      // Clear profile cache and refresh profiles after successful update
      clearProfileCache();
      // Refresh profiles in store to get updated data
      if (accessToken) {
        await refreshProfiles(accessToken);
      }
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      
      // Parse error message if it's a JSON string
      let errorMessage = 'Failed to update profile. Please try again.';
      if (error instanceof Error) {
        try {
          const parsedError = JSON.parse(error.message);
          errorMessage = parsedError.message || errorMessage;
        } catch {
          errorMessage = error.message || errorMessage;
        }
      }
      
      Alert.alert('Error', errorMessage);
    }
    
    setActiveField(null);
  };
  
  const handleChange = (field: ProfileField, value: string) =>
    setFields((prev) => ({ ...prev, [field]: value }));

  // Helper functions for profile display
  const getProfileDisplayName = (profile: Profile) => {
    if (profile.type === 'child') {
      // For child profiles, try child-specific fields first, then fall back to general fields
      const childFirstName = (profile as any).childFirstName || profile.firstName || '';
      const childLastName = (profile as any).childLastName || profile.lastName || '';
      return `${childFirstName} ${childLastName}`.trim() || 'Child';
    }
    return `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Staff Passenger';
  };

  const getProfileLabel = (profile: Profile) => {
    if (profile.type === 'child') {
      return profile.relationship || 'Child';
    }
    return 'Staff Passenger';
  };

  const handleProfileSelect = (profile: Profile) => {
    setActiveProfile(profile.id);
    setIsProfileDropdownOpen(false);
  };

  const handlePickAndUploadProfileImage = async () => {
    try {
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
      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      // Show preview immediately
      setProfileImage(asset.uri);

      if (!accessToken) return; // not logged in; preview only

      setUploadingImage(true);
      try {
        // Upload immediately and get the filename
        let uploadRes;
        if (activeProfile?.type === 'child') {
          uploadRes = await uploadChildProfileImageApi(accessToken, asset.uri);
        } else {
          uploadRes = await uploadCustomerProfileImageApi(accessToken, asset.uri);
        }
        console.log('Profile image uploaded:', uploadRes.filename);

        // Update the appropriate profile with the new image URL
        if (activeProfile?.type === 'child') {
          await updateChildProfileApi(accessToken, activeProfile.id, {
            childImageUrl: uploadRes.filename,
          });
        } else {
          await updateCustomerProfileApi(accessToken, {
            profileImageUrl: uploadRes.filename,
          });
        }

        // Clear profile cache and refresh profiles to update the UI with new image
        clearProfileCache();
        if (accessToken) {
          await refreshProfiles(accessToken);
        }
        console.log('Profile image URL updated in database and profile refreshed');
      } catch (err) {
        let msg = 'Failed to upload image.';
        if (err instanceof Error) {
          try {
            const parsedError = JSON.parse(err.message);
            msg = parsedError.message || msg;
          } catch {
            msg = err.message || msg;
          }
        }
        Alert.alert('Error', msg);
      } finally {
        setUploadingImage(false);
      }
    } catch (e) {
      let msg = 'Something went wrong picking the image.';
      if (e instanceof Error) msg = e.message;
      Alert.alert('Error', msg);
    }
  };

  const handleDeleteAccount = () => {
    // Implement delete logic here
    console.log('Delete account pressed');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ScreenHeader title="My Profile" />
        {/* Profile Picture Section */}
        <View className="mx-4 mb-6">
          <View className="bg-gray-100 rounded-lg p-6 items-center">
            <TouchableOpacity onPress={handlePickAndUploadProfileImage} disabled={uploadingImage}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={{ width: 96, height: 96, borderRadius: 48, resizeMode: 'cover' }} />
              ) : (
                <Image
                  source={require('../../assets/images/profile_Picture.png')}
                  style={{ width: 96, height: 96, borderRadius: 48, resizeMode: 'cover' }}
                />
              )}
            </TouchableOpacity>
            {uploadingImage && (
              <View className="mt-2 flex-row items-center">
                <ActivityIndicator size="small" color="#3b82f6" />
                <Typography variant="footnote" className="ml-2 text-gray-600">Uploading...</Typography>
              </View>
            )}
            
            {/* Profile Selection Dropdown */}
            {profiles.length > 1 && (
              <TouchableOpacity 
                className="mt-4 flex-row items-center"
                onPress={() => setIsProfileDropdownOpen(true)}
              >
                <Typography variant="title-2" className="text-black mr-2">
                  {activeProfile ? getProfileDisplayName(activeProfile) : 'Profile'}
                </Typography>
                <CaretDown size={16} color="#6b7280" weight="bold" />
              </TouchableOpacity>
            )}
            
            {activeProfile && (
              <Typography variant="footnote" className="text-gray-600 mt-1">
                {getProfileLabel(activeProfile)}
              </Typography>
            )}
          </View>
        </View>
        {/* Information Cards Container */}
        <View className="mx-4 mb-6">
          <View className="bg-gray-100 rounded-lg p-4">
            {/* Full Name Card */}
            <Card className="mb-3">
              <TouchableOpacity activeOpacity={0.8} onPress={() => handleEdit('fullName')}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Typography variant="caption-1" className="text-gray-600 mb-1">
                      Full Name
                    </Typography>
                    {activeField === 'fullName' ? (
                      <TextInput
                        value={fields.fullName}
                        onChangeText={(text) => handleChange('fullName', text)}
                        className="border border-brand-lightGray rounded-lg px-3 py-2 text-black"
                        autoFocus
                        onBlur={handleSave}
                      />
                    ) : (
                      <Typography variant="body" className="text-black">
                        {fields.fullName}
                      </Typography>
                    )}
                  </View>
                  {activeField === 'fullName' && (
                    <PencilSimple size={20} color="#000000" weight="regular" />
                  )}
                </View>
              </TouchableOpacity>
            </Card>
            {/* Phone Number Card */}
            <Card className="mb-3">
              <TouchableOpacity activeOpacity={0.8} onPress={() => handleEdit('phone')}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Typography variant="caption-1" className="text-gray-600 mb-1">
                      Phone Number
                    </Typography>
                    {activeField === 'phone' ? (
                      <TextInput
                        value={fields.phone}
                        onChangeText={(text) => handleChange('phone', text)}
                        className="border border-brand-lightGray rounded-lg px-3 py-2 text-black"
                        keyboardType="phone-pad"
                        autoFocus
                        onBlur={handleSave}
                      />
                    ) : (
                      <Typography variant="body" className="text-black">
                        {fields.phone}
                      </Typography>
                    )}
                  </View>
                  {activeField === 'phone' && (
                    <PencilSimple size={20} color="#000000" weight="regular" />
                  )}
                </View>
              </TouchableOpacity>
            </Card>
            {/* Email Card */}
            <Card className="mb-3">
              <TouchableOpacity activeOpacity={0.8} onPress={() => handleEdit('email')}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Typography variant="caption-1" className="text-gray-600 mb-1">
                      Email
                    </Typography>
                    {activeField === 'email' ? (
                      <TextInput
                        value={fields.email}
                        onChangeText={(text) => handleChange('email', text)}
                        className="border border-brand-lightGray rounded-lg px-3 py-2 text-black"
                        keyboardType="email-address"
                        autoFocus
                        onBlur={handleSave}
                      />
                    ) : (
                      <Typography variant="body" className="text-black">
                        {fields.email}
                      </Typography>
                    )}
                  </View>
                  {activeField === 'email' && (
                    <PencilSimple size={20} color="#000000" weight="regular" />
                  )}
                </View>
              </TouchableOpacity>
            </Card>
            {/* Address Card - Show different labels based on profile type */}
            <Card className="mb-3">
              <TouchableOpacity activeOpacity={0.8} onPress={() => handleEdit('address')}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Typography variant="caption-1" className="text-gray-600 mb-1">
                      {activeProfile?.type === 'child' ? 'Pickup Address' : 'Address'}
                    </Typography>
                    {activeField === 'address' ? (
                      <TextInput
                        value={fields.address}
                        onChangeText={(text) => handleChange('address', text)}
                        className="border border-brand-lightGray rounded-lg px-3 py-2 text-black"
                        autoFocus
                        onBlur={handleSave}
                      />
                    ) : (
                      <Typography variant="body" className="text-black">
                        {fields.address}
                      </Typography>
                    )}
                  </View>
                  {activeField === 'address' && (
                    <PencilSimple size={20} color="#000000" weight="regular" />
                  )}
                </View>
              </TouchableOpacity>
            </Card>

            {/* Profile-specific additional information */}
            {activeProfile?.type === 'child' && activeProfile.school && (
              <Card className="mb-3">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Typography variant="caption-1" className="text-gray-600 mb-1">
                      School
                    </Typography>
                    <Typography variant="body" className="text-black">
                      {activeProfile.school}
                    </Typography>
                  </View>
                </View>
              </Card>
            )}

            {activeProfile?.type === 'staff' && activeProfile.workLocation && (
              <Card className="mb-3">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Typography variant="caption-1" className="text-gray-600 mb-1">
                      Work Location
                    </Typography>
                    <Typography variant="body" className="text-black">
                      {activeProfile.workLocation}
                    </Typography>
                  </View>
                </View>
              </Card>
            )}
            {/* Emergency Contact Card */}
            <Card className="mb-4">
              <TouchableOpacity activeOpacity={0.8} onPress={() => handleEdit('emergencyContact')}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Typography variant="caption-1" className="text-gray-600 mb-1">
                      Emergency Contact
                    </Typography>
                    {activeField === 'emergencyContact' ? (
                      <TextInput
                        value={fields.emergencyContact}
                        onChangeText={(text) => handleChange('emergencyContact', text)}
                        className="border border-brand-lightGray rounded-lg px-3 py-2 text-black"
                        keyboardType="phone-pad"
                        autoFocus
                        onBlur={handleSave}
                      />
                    ) : (
                      <Typography variant="body" className="text-black">
                        {fields.emergencyContact}
                      </Typography>
                    )}
                  </View>
                  {activeField === 'emergencyContact' && (
                    <PencilSimple size={20} color="#000000" weight="regular" />
                  )}
                </View>
              </TouchableOpacity>
            </Card>
            {/* Update/Delete Account Button */}
            <TouchableOpacity
              onPress={isEdited ? handleSave : handleDeleteAccount}
              className={`rounded-lg p-4 shadow-sm flex-row items-center justify-center ${isEdited ? 'bg-blue-500' : 'bg-white'}`}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center justify-center">
                {isEdited ? (
                  <Typography variant="body" className="text-white font-medium">
                    Update Account
                  </Typography>
                ) : (
                  <>
                    <Trash size={20} color="#EF4444" weight="regular" />
                    <Typography variant="body" className="text-red-500 font-medium">
                      Delete Account
                    </Typography>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Profile Selection Modal */}
      <Modal
        visible={isProfileDropdownOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsProfileDropdownOpen(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black bg-opacity-50"
          activeOpacity={1}
          onPress={() => setIsProfileDropdownOpen(false)}
        >
          <View className="flex-1 justify-center px-4">
            <View className="bg-white rounded-2xl shadow-lg max-h-80">
              <View className="p-4 border-b border-gray-100">
                <Typography variant="title-3" weight="semibold" className="text-black">
                  Select Profile
                </Typography>
              </View>
              <FlatList
                data={profiles}
                renderItem={({ item }) => {
                  const isSelected = item.id === activeProfile?.id;
                  return (
                    <TouchableOpacity
                      className={`p-4 border-b border-gray-100 ${isSelected ? 'bg-brand-lightGray' : 'bg-white'}`}
                      onPress={() => handleProfileSelect(item)}
                      activeOpacity={0.8}
                    >
                      <View className="flex-row items-center">
                        <View className="mr-3">
                          <Image
                            source={
                              getImageUrl(item.profileImageUrl) || getImageUrl((item as any).childImageUrl)
                                ? { uri: getImageUrl(item.profileImageUrl) || getImageUrl((item as any).childImageUrl) }
                                : require('../../assets/images/profile_Picture.png')
                            }
                            style={{ width: 48, height: 48, borderRadius: 24, resizeMode: 'cover' }}
                          />
                        </View>
                        <View className="flex-1">
                          <Typography variant="subhead" weight="semibold" className="text-black">
                            {getProfileDisplayName(item)}
                          </Typography>
                          <Typography variant="footnote" className="text-brand-neutralGray">
                            {getProfileLabel(item)}
                          </Typography>
                        </View>
                        {isSelected && (
                          <View className="w-2 h-2 bg-brand-deepNavy rounded-full" />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                }}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}