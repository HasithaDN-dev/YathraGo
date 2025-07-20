import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Icon } from '@/components/ui/Icon';
import { StatusBar } from 'expo-status-bar';
import { useIdVerification } from '@/contexts/IdVerificationContext';

export default function RegUploadIdScreen() {
  const router = useRouter();
  const { side } = useLocalSearchParams<{ side: 'front' | 'back' }>();
  const { setFrontImage, setBackImage } = useIdVerification();
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);

  const handleImageAction = async (action: 'camera' | 'library') => {
    const permission = action === 'camera' 
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permission.status !== 'granted') {
      Alert.alert('Permission Denied', `Sorry, we need ${action} permissions to make this work!`);
      return;
    }

    const result = action === 'camera'
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 1 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 1 });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleSuccess = () => {
    if (image) {
      if (side === 'front') {
        setFrontImage(image);
      } else {
        setBackImage(image);
      }
      router.back();
    }
  };

  const handleRetake = () => {
    setImage(null);
  };

  const renderInitialState = () => (
    <>
      <View className="flex-1 p-6">
        <View className="mb-6">
          <Text className="text-base text-brand-neutralGray mb-1">Make sure the ID is fully visible – no corners cut off.</Text>
          <Text className="text-base text-brand-neutralGray mb-1">Keep it clear and well-lit – avoid blur or glare.</Text>
          <Text className="text-base text-brand-neutralGray mb-5">Text and photo must be readable – no edits or filters.</Text>
        </View>
        <View className="w-full h-48 bg-brand-lightGray rounded-lg border-2 border-dashed border-gray-300 items-center justify-center">
          <Icon name="User" size={48} color="#A0A0A0" />
        </View>
      </View>
      <View className="p-6 space-y-4">
        <TouchableOpacity className="bg-brand-goldenYellow py-4 rounded-lg items-center" onPress={() => handleImageAction('camera')}>
          <Text className="text-white text-lg font-bold">Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity className="border border-brand-deepNavy py-4 rounded-lg items-center" onPress={() => handleImageAction('library')}>
          <Text className="text-brand-deepNavy text-lg font-bold">Upload Your ID</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderConfirmationState = () => (
    <>
      <View className="flex-1 p-6 items-center justify-center">
        {image && <Image source={{ uri: image.uri }} className="w-full h-48" resizeMode="contain" />}
      </View>
      <View className="p-6 space-y-4">
        <TouchableOpacity className="bg-brand-goldenYellow py-4 rounded-lg items-center" onPress={handleSuccess}>
          <Text className="text-white text-lg font-bold">Success</Text>
        </TouchableOpacity>
        <TouchableOpacity className="border border-brand-deepNavy py-4 rounded-lg items-center" onPress={handleRetake}>
          <Text className="text-brand-deepNavy text-lg font-bold">Retake</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <View className="px-4 py-8 items-center bg-brand-brightOrange flex-row">
        <TouchableOpacity onPress={() => router.back()} className="absolute left-4 z-10">
          <Icon name="ArrowLeft" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white flex-1 text-center">Take a photo of your ID</Text>
      </View>
      {image ? renderConfirmationState() : renderInitialState()}
    </SafeAreaView>
  );
}