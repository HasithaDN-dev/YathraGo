



import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/ui/Card';
import { PencilSimple, Trash } from 'phosphor-react-native';
import { ScreenHeader } from '@/components/ui/ScreenHeader';


type ProfileField = 'fullName' | 'phone' | 'email' | 'address' | 'emergencyContact';
interface ProfileFields {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
}
interface EditingState {
  fullName: boolean;
  phone: boolean;
  email: boolean;
  address: boolean;
  emergencyContact: boolean;
}

export default function ProfileScreen() {
  const [fields, setFields] = useState<ProfileFields>({
    fullName: 'Kasun Mendis',
    phone: '070 - 19784521',
    email: 'kasunmenda342@gmail.com',
    address: '123 Main St',
    emergencyContact: '0771234567',
  });
  const [editing, setEditing] = useState<EditingState>({
    fullName: false,
    phone: false,
    email: false,
    address: false,
    emergencyContact: false,
  });

  const handleEdit = (field: ProfileField) => setEditing((prev) => ({ ...prev, [field]: true }));
  const handleSave = (field: ProfileField) => setEditing((prev) => ({ ...prev, [field]: false }));
  const handleChange = (field: ProfileField, value: string) => setFields((prev) => ({ ...prev, [field]: value }));

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
            <Image
              source={require('../../assets/images/profile_Picture.png')}
              style={{ width: 96, height: 96, borderRadius: 48, resizeMode: 'cover' }}
            />
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
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Typography variant="caption-1" className="text-gray-600 mb-1">
                    Full Name
                  </Typography>
                  {editing.fullName ? (
                    <TextInput
                      value={fields.fullName}
                      onChangeText={(text) => handleChange('fullName', text)}
                      className="border border-brand-lightGray rounded-lg px-3 py-2 text-black"
                      autoFocus
                      onBlur={() => handleSave('fullName')}
                    />
                  ) : (
                    <Typography variant="body" className="text-black">
                      {fields.fullName}
                    </Typography>
                  )}
                </View>
                <TouchableOpacity onPress={() => handleEdit('fullName')}>
                  <PencilSimple size={20} color="#000000" weight="regular" />
                </TouchableOpacity>
              </View>
            </Card>
            {/* Phone Number Card */}
            <Card className="mb-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Typography variant="caption-1" className="text-gray-600 mb-1">
                    Phone Number
                  </Typography>
                  {editing.phone ? (
                    <TextInput
                      value={fields.phone}
                      onChangeText={(text) => handleChange('phone', text)}
                      className="border border-brand-lightGray rounded-lg px-3 py-2 text-black"
                      keyboardType="phone-pad"
                      autoFocus
                      onBlur={() => handleSave('phone')}
                    />
                  ) : (
                    <Typography variant="body" className="text-black">
                      {fields.phone}
                    </Typography>
                  )}
                </View>
                <TouchableOpacity onPress={() => handleEdit('phone')}>
                  <PencilSimple size={20} color="#000000" weight="regular" />
                </TouchableOpacity>
              </View>
            </Card>
            {/* Email Card */}
            <Card className="mb-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Typography variant="caption-1" className="text-gray-600 mb-1">
                    Email
                  </Typography>
                  {editing.email ? (
                    <TextInput
                      value={fields.email}
                      onChangeText={(text) => handleChange('email', text)}
                      className="border border-brand-lightGray rounded-lg px-3 py-2 text-black"
                      keyboardType="email-address"
                      autoFocus
                      onBlur={() => handleSave('email')}
                    />
                  ) : (
                    <Typography variant="body" className="text-black">
                      {fields.email}
                    </Typography>
                  )}
                </View>
                <TouchableOpacity onPress={() => handleEdit('email')}>
                  <PencilSimple size={20} color="#000000" weight="regular" />
                </TouchableOpacity>
              </View>
            </Card>
            {/* Address Card */}
            <Card className="mb-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Typography variant="caption-1" className="text-gray-600 mb-1">
                    Address
                  </Typography>
                  {editing.address ? (
                    <TextInput
                      value={fields.address}
                      onChangeText={(text) => handleChange('address', text)}
                      className="border border-brand-lightGray rounded-lg px-3 py-2 text-black"
                      autoFocus
                      onBlur={() => handleSave('address')}
                    />
                  ) : (
                    <Typography variant="body" className="text-black">
                      {fields.address}
                    </Typography>
                  )}
                </View>
                <TouchableOpacity onPress={() => handleEdit('address')}>
                  <PencilSimple size={20} color="#000000" weight="regular" />
                </TouchableOpacity>
              </View>
            </Card>
            {/* Emergency Contact Card */}
            <Card className="mb-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Typography variant="caption-1" className="text-gray-600 mb-1">
                    Emergency Contact
                  </Typography>
                  {editing.emergencyContact ? (
                    <TextInput
                      value={fields.emergencyContact}
                      onChangeText={(text) => handleChange('emergencyContact', text)}
                      className="border border-brand-lightGray rounded-lg px-3 py-2 text-black"
                      keyboardType="phone-pad"
                      autoFocus
                      onBlur={() => handleSave('emergencyContact')}
                    />
                  ) : (
                    <Typography variant="body" className="text-black">
                      {fields.emergencyContact}
                    </Typography>
                  )}
                </View>
                <TouchableOpacity onPress={() => handleEdit('emergencyContact')}>
                  <PencilSimple size={20} color="#000000" weight="regular" />
                </TouchableOpacity>
              </View>
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