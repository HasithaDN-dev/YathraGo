import { View, Text, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Icon } from '@/components/ui/Icon';

const OwnershipScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <View className="px-4 py-8 items-center bg-brand-brightOrange flex-row">
        <TouchableOpacity onPress={() => router.back()} className="absolute left-4 z-10">
          <Icon name="ArrowLeft" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white flex-1 text-center">Vehicle Ownership</Text>
      </View>

      <View className="flex-1 justify-center items-center p-6">
        <Image
          source={require('../../assets/images/owner.png')}
          className="w-40 h-42 "
          resizeMode="contain"
        />
      </View>

      <View className="px-6 pb-8">
        <View className="flex-row space-x-4 mb-8">
          <TouchableOpacity className="flex-1 bg-brand-deepNavy py-4 rounded-lg items-center" onPress={() => router.push('/(auth)/vehicle-reg')}>
            <Text className="text-white text-lg font-bold">Own Vehicle</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 border border-brand-lightNavy py-4 rounded-lg items-center" onPress={() => { /* Handle Added by Driver */ }}>
            <Text className="text-brand-deepNavy text-lg font-bold">Added by Driver</Text>
          </TouchableOpacity>
        </View>

        <View className="items-center">
          <View className="w-8 h-8 rounded-full border border-gray-400 justify-center items-center mb-4">
            <Text className="text-gray-400 text-lg font-bold">i</Text>
          </View>
          <Text className="text-center text-brand-neutralGray">
            For your safety and to maintain accurate records, we need to know if the vehicle is personally owned or added by someone else. This helps us prevent unauthorized use and ensures a secure experience for all users.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OwnershipScreen;