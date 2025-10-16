import React from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { StatusBar } from 'expo-status-bar';
import { useDriverStore } from '../../lib/stores/driver.store';

const IdCardPlaceholder = ({ onPress, imageUri }: { onPress: () => void; imageUri?: string | null }) => (
  <View className="w-full h-48 bg-brand-lightGray rounded-lg border-2 border-dashed border-gray-300 overflow-hidden">
    {imageUri ? (
      <Image source={{ uri: imageUri }} className="w-full h-full" resizeMode="cover" />
    ) : (
      <View className="items-center justify-center flex-1">
        <Icon name="User" size={48} color="#A0A0A0" />
        <View className="w-3/4 h-2 bg-gray-300 rounded-full my-2" />
        <View className="w-1/2 h-2 bg-gray-300 rounded-full" />
      </View>
    )}
    <TouchableOpacity onPress={onPress} className="absolute bottom-2 right-2 bg-brand-goldenYellow p-2 rounded-full">
      <Icon name="Camera" size={24} color="white" />
    </TouchableOpacity>
  </View>
);

export default function RegIdScreen() {
  const router = useRouter();
  const { idVerification } = useDriverStore();
  const { frontImage, backImage } = idVerification;

  const handleVerify = () => {
    if (frontImage && backImage) {
      // Data is already saved in store, just navigate to next screen
      router.push('/(registration)/ownership');
    } else {
      Alert.alert('Error', 'Please upload both front and back images of your ID.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <View className="px-4 py-8 items-center bg-brand-brightOrange">
        <Text className="text-xl font-bold text-white">Take a photo of your ID</Text>
      </View>
      <View className="flex-1 p-6">
        <Text className="text-base text-brand-neutralGray text-center mb-2">
          Take clear photos of the front and back of your government issued ID
        </Text>
        <Text className="text-base text-brand-neutralGray text-center mb-8">
          If you have questions, please visit our <Text className="font-bold text-brand-deepNavy">Help Center</Text>
        </Text>

        <View className="mb-6">
          <Text className="text-lg font-semibold mb-2">Front</Text>
          <IdCardPlaceholder
            imageUri={frontImage?.uri}
            onPress={() => router.push({ pathname: '/(registration)/reg-uploadId', params: { side: 'front' } })}
          />
        </View>

        <View>
          <Text className="text-lg font-semibold mb-2">Back</Text>
          <IdCardPlaceholder
            imageUri={backImage?.uri}
            onPress={() => router.push({ pathname: '/(registration)/reg-uploadId', params: { side: 'back' } })}
          />
        </View>
      </View>
      <View className="p-6">
        <TouchableOpacity
          className={`py-4 rounded-lg items-center ${frontImage && backImage ? 'bg-brand-goldenYellow' : 'bg-gray-300'}`}
          onPress={handleVerify}
          disabled={!frontImage || !backImage}
        >
          <Text className="text-white text-lg font-bold">Verify</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
