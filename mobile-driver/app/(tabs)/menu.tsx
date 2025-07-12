import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MenuScreen() {
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all stored data
              await AsyncStorage.multiRemove(['authToken', 'userProfile']);
              // Navigate back to welcome screen
              router.replace('/welcome');
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      title: 'Profile',
      subtitle: 'View and edit your profile',
      icon: '👤',
      onPress: () => {
        // TODO: Navigate to profile screen
        Alert.alert('Coming Soon', 'Profile screen will be available soon');
      },
    },
    {
      title: 'Earnings',
      subtitle: 'View your earnings and reports',
      icon: '💰',
      onPress: () => {
        // TODO: Navigate to earnings screen
        Alert.alert('Coming Soon', 'Earnings screen will be available soon');
      },
    },
    {
      title: 'Vehicle Details',
      subtitle: 'Manage your vehicle information',
      icon: '🚗',
      onPress: () => {
        // TODO: Navigate to vehicle details screen
        Alert.alert('Coming Soon', 'Vehicle details screen will be available soon');
      },
    },
    {
      title: 'Documents',
      subtitle: 'Upload and manage documents',
      icon: '📄',
      onPress: () => {
        // TODO: Navigate to documents screen
        Alert.alert('Coming Soon', 'Documents screen will be available soon');
      },
    },
    {
      title: 'Settings',
      subtitle: 'App preferences and settings',
      icon: '⚙️',
      onPress: () => {
        // TODO: Navigate to settings screen
        Alert.alert('Coming Soon', 'Settings screen will be available soon');
      },
    },
    {
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: '❓',
      onPress: () => {
        // TODO: Navigate to help screen
        Alert.alert('Coming Soon', 'Help & Support screen will be available soon');
      },
    },
    {
      title: 'Privacy Policy',
      subtitle: 'Read our privacy policy',
      icon: '🔒',
      onPress: () => {
        // TODO: Navigate to privacy policy screen
        Alert.alert('Coming Soon', 'Privacy Policy screen will be available soon');
      },
    },
    {
      title: 'Terms of Service',
      subtitle: 'Read our terms of service',
      icon: '📋',
      onPress: () => {
        // TODO: Navigate to terms screen
        Alert.alert('Coming Soon', 'Terms of Service screen will be available soon');
      },
    },
  ];

  const renderMenuItem = (item: typeof menuItems[0], index: number) => (
    <TouchableOpacity
      key={index}
      className="bg-white p-4 border-b border-gray-100 flex-row items-center"
      onPress={item.onPress}
    >
      <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-4">
        <Text className="text-lg">{item.icon}</Text>
      </View>
      
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-800 mb-1">
          {item.title}
        </Text>
        <Text className="text-sm text-gray-600">
          {item.subtitle}
        </Text>
      </View>
      
      <View className="ml-2">
        <Text className="text-gray-400 text-lg">›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="bg-white px-6 pt-12 pb-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-800">Menu</Text>
        <Text className="text-sm text-gray-600 mt-1">
          Manage your account and preferences
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-lg border border-gray-200">
          <View className="flex-row items-center">
            <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mr-4">
              <Text className="text-2xl">👨‍💼</Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-800">Driver Name</Text>
              <Text className="text-sm text-gray-600">+94 77 123 4567</Text>
              <View className="flex-row items-center mt-1">
                <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                <Text className="text-sm text-green-600">Online</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View className="mt-4">
          {menuItems.map((item, index) => renderMenuItem(item, index))}
        </View>

        {/* Logout Button */}
        <View className="p-4">
          <TouchableOpacity
            className="bg-red-600 py-4 rounded-lg"
            onPress={handleLogout}
          >
            <Text className="text-white text-center font-semibold text-lg">
              Logout
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View className="items-center pb-8 pt-4">
          <Text className="text-xs text-gray-500">YathraGo Driver v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}
