import React, { useState } from 'react';
import { View, TextInput, Image, TouchableOpacity, ScrollView, Text, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import * as ImagePicker from 'expo-image-picker';
import { useDriverStore } from '../../lib/stores/driver.store';

export default function RegisterScreen() {
  const router = useRouter();
  const { personalInfo, updatePersonalInfo } = useDriverStore();

  const [firstName, setFirstName] = useState(personalInfo.firstName);
  const [lastName, setLastName] = useState(personalInfo.lastName);
  const [dob, setDob] = useState(personalInfo.dateOfBirth);
  const [email, setEmail] = useState(personalInfo.email);
  const [secondaryPhone, setSecondaryPhone] = useState(personalInfo.secondaryPhone);
  const [city, setCity] = useState(personalInfo.city);
  const [profileImage, setProfileImage] = useState<ImagePicker.ImagePickerAsset | null>(personalInfo.profileImage);
  const [nic, setNic] = useState(personalInfo.nic || '');
  const [gender, setGender] = useState(personalInfo.gender || 'Male');
  const [isLoading, setIsLoading] = useState(false);

  // REMOVED: useEffect auto-save causes issues
  // Data will be saved when user clicks Continue button

  // Sync local state with store data
  // useEffect(() => {
  //   setFirstName(personalInfo.firstName);
  //   setLastName(personalInfo.lastName);
  //   setDob(personalInfo.dateOfBirth);
  //   setEmail(personalInfo.email);
  //   setSecondaryPhone(personalInfo.secondaryPhone);
  //   setCity(personalInfo.city);
  //   setProfileImage(personalInfo.profileImage);
  // }, [personalInfo]);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0]);
      updatePersonalInfo({ profileImage: result.assets[0] });
    }
  };

  const handleSubmit = async () => {
    if (!firstName || !lastName || !dob || !city || !profileImage || !nic || !gender) {
      Alert.alert('Error', 'Please fill all required fields including NIC and gender.');
      return;
    }

    // Save ALL personal info to store before navigating
    updatePersonalInfo({
      firstName,
      lastName,
      dateOfBirth: dob,
      email,
      secondaryPhone,
      city,
      profileImage,
      nic,
      gender,
    });

    // Navigate to next screen
    router.push('/(registration)/reg-verify');
  };
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 py-20 items-center">
        {/* <Image source={require('@/assets/images/logo.png')} className="w-16 h-16 mb-4" resizeMode="contain" /> */}
        <Text className="text-3xl font-bold text-yellow-500 mb-4">Get Started Now</Text>
        <Text className="text-xl font-semibold text-gray-600 mb-10">Personal Information</Text>

        <View className="w-full flex-row justify-between mb-4">
          <View className="w-[48%]">
            <Text className="text-sm font-medium text-gray-600 mb-1">First Name</Text>
            <View className="flex-row items-center w-full border border-gray-300 rounded-lg">
              <Icon name="User" size={20} color="gray" style={{ marginLeft: 12 }} />
              <TextInput
                className="flex-1 px-3 py-3 text-base"
                value={firstName}
                onChangeText={setFirstName}
                placeholder="John"
                placeholderTextColor="#A0A0A0"
              />
            </View>
          </View>
          <View className="w-[48%]">
            <Text className="text-sm font-medium text-gray-600 mb-1">Last Name</Text>
            <View className="flex-row items-center w-full border border-gray-300 rounded-lg">
              <Icon name="User" size={20} color="gray" style={{ marginLeft: 12 }} />
              <TextInput
                className="flex-1 px-3 py-3 text-base"
                value={lastName}
                onChangeText={setLastName}
                placeholder="Doe"
                placeholderTextColor="#A0A0A0"
              />
            </View>
          </View>
        </View>

        <View className="w-full mb-4">
          <Text className="text-sm font-medium text-gray-600 mb-1">Profile Image</Text>
          <TouchableOpacity
            onPress={handlePickImage}
            className="w-full h-36 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 items-center justify-center"
          >
            {profileImage ? (
              <Image source={{ uri: profileImage.uri }} className="w-full h-full rounded-lg" />
            ) : (
              <Icon name="PlusCircle" size={40} color="gray" />
            )}
          </TouchableOpacity>
        </View>

        <View className="w-full mb-4">
          <Text className="text-sm font-medium text-gray-600 mb-1">Date of Birth</Text>
          <TextInput
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
            value={dob}
            onChangeText={setDob}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#A0A0A0"
          />
        </View>

        <View className="w-full mb-4">
          <Text className="text-sm font-medium text-gray-600 mb-1">Email (optional)</Text>
          <TextInput
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
            value={email}
            onChangeText={setEmail}
            placeholder="youremail@example.com"
            keyboardType="email-address"
            placeholderTextColor="#A0A0A0"
          />
        </View>

        <View className="w-full mb-4">
          <Text className="text-sm font-medium text-gray-600 mb-1">Secondary Phone Number (optional)</Text>
          <TextInput
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
            value={secondaryPhone}
            onChangeText={setSecondaryPhone}
            placeholder="+94 "
            keyboardType="phone-pad"
            placeholderTextColor="#A0A0A0"
          />
        </View>

        <View className="w-full mb-6">
          <Text className="text-sm font-medium text-gray-600 mb-1">City</Text>
          <View className="w-full relative">
            <TextInput
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
              value={city}
              onChangeText={setCity}
              placeholder="Select City"
              placeholderTextColor="#A0A0A0"
            />
          </View>
        </View>

        <View className="w-full mb-4">
          <Text className="text-sm font-medium text-gray-600 mb-1">National Identity Card (NIC) *</Text>
          <TextInput
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
            value={nic}
            onChangeText={setNic}
            placeholder="123456789V or 123456789012"
            autoCapitalize="characters"
            maxLength={12}
            placeholderTextColor="#A0A0A0"
          />
        </View>

        <View className="w-full mb-6">
          <Text className="text-sm font-medium text-gray-600 mb-2">Gender *</Text>
          <View className="flex-row justify-between">
            <TouchableOpacity
              className={`flex-1 mr-2 py-3 rounded-lg border ${gender === 'Male' ? 'bg-yellow-500 border-yellow-500' : 'bg-white border-gray-300'}`}
              onPress={() => setGender('Male')}
            >
              <Text className={`text-center font-medium ${gender === 'Male' ? 'text-white' : 'text-gray-700'}`}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 mx-1 py-3 rounded-lg border ${gender === 'Female' ? 'bg-yellow-500 border-yellow-500' : 'bg-white border-gray-300'}`}
              onPress={() => setGender('Female')}
            >
              <Text className={`text-center font-medium ${gender === 'Female' ? 'text-white' : 'text-gray-700'}`}>Female</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 ml-2 py-3 rounded-lg border ${gender === 'Other' ? 'bg-yellow-500 border-yellow-500' : 'bg-white border-gray-300'}`}
              onPress={() => setGender('Other')}
            >
              <Text className={`text-center font-medium ${gender === 'Other' ? 'text-white' : 'text-gray-700'}`}>Other</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          className={`w-full py-4 rounded-lg ${isLoading ? 'bg-yellow-400' : 'bg-yellow-500'}`}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text className="text-white text-center font-bold text-lg">
            {isLoading ? 'Submitting...' : 'Continue'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`w-full py-4 mt-20 rounded-lg ${isLoading ? 'bg-yellow-400' : 'bg-yellow-500'}`}

          disabled={isLoading}
        >
          <Link href={'/phone-auth'}>Back</Link>
        </TouchableOpacity>
        <Link href={'/reg-verify'}>Next</Link>
      </View>
    </ScrollView>
  );
}