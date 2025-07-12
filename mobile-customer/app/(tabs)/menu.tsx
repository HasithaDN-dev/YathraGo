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
      title: 'Payment Methods',
      subtitle: 'Manage your payment cards and methods',
      icon: '💳',
      onPress: () => {
        // TODO: Navigate to payment methods screen
        Alert.alert('Coming Soon', 'Payment methods screen will be available soon');
      },
    },
    {
      title: 'Family Members',
      subtitle: 'Add and manage family members',
      icon: '👨‍👩‍👧‍👦',
      onPress: () => {
        // TODO: Navigate to family members screen
        Alert.alert('Coming Soon', 'Family members screen will be available soon');
      },
    },
    {
      title: 'Saved Locations',
      subtitle: 'Manage your home, work and other locations',
      icon: '📍',
      onPress: () => {
        // TODO: Navigate to saved locations screen
        Alert.alert('Coming Soon', 'Saved locations screen will be available soon');
      },
    },
    {
      title: 'Emergency Contacts',
      subtitle: 'Add emergency contacts for safety',
      icon: '🚨',
      onPress: () => {
        // TODO: Navigate to emergency contacts screen
        Alert.alert('Coming Soon', 'Emergency contacts screen will be available soon');
      },
    },
    {
      title: 'Settings',
      subtitle: 'App preferences and notifications',
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
      title: 'Rate Our Service',
      subtitle: 'Share your feedback with us',
      icon: '⭐',
      onPress: () => {
        // TODO: Navigate to rating screen
        Alert.alert('Coming Soon', 'Rating screen will be available soon');
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
            <View className="w-16 h-16 bg-brand-backgroundLight rounded-full items-center justify-center mr-4">
              <Text className="text-2xl">👨‍💼</Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-800">John Doe</Text>
              <Text className="text-sm text-gray-600">+94 77 123 4567</Text>
              <View className="flex-row items-center mt-1">
                <View className="w-2 h-2 bg-brand-successGreen rounded-full mr-2" />
                <Text className="text-sm text-green-600">Active Member</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-lg border border-gray-200">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Quick Actions</Text>
          <View className="flex-row justify-between">
            <TouchableOpacity className="items-center flex-1">
              <View className="w-12 h-12 bg-brand-backgroundLight rounded-full items-center justify-center mb-2">
                <Text className="text-xl">🚗</Text>
              </View>
              <Text className="text-xs text-gray-600 text-center">Book Ride</Text>
            </TouchableOpacity>
            <TouchableOpacity className="items-center flex-1">
              <View className="w-12 h-12 bg-brand-successBg rounded-full items-center justify-center mb-2">
                <Text className="text-xl">💰</Text>
              </View>
              <Text className="text-xs text-gray-600 text-center">Payments</Text>
            </TouchableOpacity>
            <TouchableOpacity className="items-center flex-1">
              <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center mb-2">
                <Text className="text-xl">📞</Text>
              </View>
              <Text className="text-xs text-gray-600 text-center">Support</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Items */}
        <View className="mt-4">
          {menuItems.map((item, index) => renderMenuItem(item, index))}
        </View>

        {/* Logout Button */}
        <View className="p-4">
          <TouchableOpacity
            className="bg-brand-errorRed py-4 rounded-lg"
            onPress={handleLogout}
          >
            <Text className="text-white text-center font-semibold text-lg">
              Logout
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View className="items-center pb-8 pt-4">
          <Text className="text-xs text-gray-500">YathraGo Customer v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}
