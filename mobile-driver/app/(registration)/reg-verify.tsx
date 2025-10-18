import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { StatusBar } from 'expo-status-bar';

export default function RegVerifyScreen() {
  const router = useRouter();

  const handleVerify = () => {
    
    router.push('/(registration)/reg-id');
  };  

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <View className="px-4 py-8 items-center bg-brand-brightOrange">
        <Text className="text-xl font-bold text-white">Verify ID</Text>
      </View>
      <View className="flex-1 items-center justify-center px-6">
        <Icon name="User" size={128} color="#A0A0A0" weight="light" />
        <Text className="text-2xl font-bold mt-6 mb-4 text-center">Let's Verify Your Identity</Text>
        <Text className="text-base text-brand-neutralGray text-center mb-4 leading-6">
          To create your account, we need to make sure it's really you. Since we're a transportation service, complying with our security and <Text className="font-bold">privacy policies</Text> is essential.
        </Text>
        <Text className="text-base text-brand-neutralGray text-center leading-6">
          Just follow a few quick steps to help us keep the platform safe for you and everyone else.
        </Text>
      </View>
      <View className="p-6">
        <TouchableOpacity className="bg-brand-goldenYellow py-4 rounded-lg items-center" onPress={handleVerify}>
          <Text className="text-white text-lg font-bold">Verify</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}