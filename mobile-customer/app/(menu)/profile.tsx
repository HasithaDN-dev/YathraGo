import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/ui/Card';
import { PencilSimple, Trash } from 'phosphor-react-native';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import * as ImagePicker from 'expo-image-picker';
import { uploadCustomerProfileImageApi } from '@/lib/api/profile.api';
import { useAuthStore } from '@/lib/stores/auth.store';

type ProfileField = 'fullName' | 'phone' | 'email' | 'address' | 'emergencyContact';
interface ProfileFields {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
}

export default function ProfileScreen() {
  const [fields, setFields] = useState<ProfileFields>({
    fullName: 'Kasun Mendis',
    phone: '070 - 19784521',
    email: 'kasunmenda342@gmail.com',
    address: '123 Main St',
    emergencyContact: '0771234567',
  });

  // Active field to edit; pens show only when this matches the card
  const [activeField, setActiveField] = useState<ProfileField | null>(null);

  // Local profile image preview and upload state
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { accessToken } = useAuthStore();

  const handleEdit = (field: ProfileField) => setActiveField(field);
  const handleSave = () => setActiveField(null);
  const handleChange = (field: ProfileField, value: string) =>
    setFields((prev) => ({ ...prev, [field]: value }));

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
        // Upload immediately and store filename if needed
        const uploadRes = await uploadCustomerProfileImageApi(accessToken, asset.uri);
        console.log('Profile image uploaded:', uploadRes.filename);
        // TODO: Persist filename to user profile via an update endpoint if required
      } catch (err) {
        let msg = 'Failed to upload image.';
        if (err instanceof Error) msg = err.message;
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
            <Typography variant="title-2" className="mt-4 text-black">
              Profile
            </Typography>
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
            {/* Address Card */}
            <Card className="mb-3">
              <TouchableOpacity activeOpacity={0.8} onPress={() => handleEdit('address')}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Typography variant="caption-1" className="text-gray-600 mb-1">
                      Address
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
            {/* Delete Account Button */}
            <TouchableOpacity
              onPress={handleDeleteAccount}
              className="bg-white rounded-lg p-4 shadow-sm"
            >
              <View className="flex-row items-center justify-center">
                <Trash size={20} color="#EF4444" weight="regular" />
                <Typography variant="body" className="text-red-500 font-medium">
                  Delete Account
                </Typography>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}