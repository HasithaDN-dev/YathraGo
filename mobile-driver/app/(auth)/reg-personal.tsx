import React, { useState, useEffect } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);

  // Update store when form fields change
  useEffect(() => {
    updatePersonalInfo({
      firstName,
      lastName,
      dateOfBirth: dob,
      email,
      secondaryPhone,
      city,
      profileImage,
    });
  }, [firstName, lastName, dob, email, secondaryPhone, city, profileImage, updatePersonalInfo]);

  // Sync local state with store data
  useEffect(() => {
    setFirstName(personalInfo.firstName);
    setLastName(personalInfo.lastName);
    setDob(personalInfo.dateOfBirth);
    setEmail(personalInfo.email);
    setSecondaryPhone(personalInfo.secondaryPhone);
    setCity(personalInfo.city);
    setProfileImage(personalInfo.profileImage);
  }, [personalInfo]);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!firstName || !lastName || !dob || !city || !profileImage) {
      Alert.alert('Error', 'Please fill all required fields and select a profile image.');
      return;
    }

    // Data is already saved in store, just navigate to next screen
    router.push('/(auth)/reg-verify');
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
            <Icon name="CaretDown" size={24} color="gray" style={{ position: 'absolute', right: 12, top: 12 }} />
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