// This component acts as the header for the main app, allowing profile switching.

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Image } from 'react-native';
import { useProfileStore } from '../lib/stores/profile.store';
import { useAuthStore } from '../lib/stores/auth.store';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from './Typography';

const ProfileSwitcher: React.FC = () => {
  const { profiles, activeProfile, setActiveProfile, setDefaultProfile, isLoading } = useProfileStore();
  const { logout } = useAuthStore();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const getProfileIcon = (type: 'child' | 'staff') => {
    return type === 'child' ? 'school' : 'briefcase';
  };

  const getProfileColor = (type: 'child' | 'staff') => {
    return type === 'child' ? '#4F46E5' : '#059669';
  };

  const handleProfileSelect = async (profile: any) => {
    setActiveProfile(profile.id);
    await setDefaultProfile(profile.id);
    setIsModalVisible(false);
  };

  if (isLoading) {
    return (
      <View className="flex-row items-center justify-between p-4 bg-white border-b border-gray-200">
        <View className="flex-row items-center space-x-3">
          <View className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
          <View className="flex-1">
            <View className="h-4 bg-gray-200 rounded animate-pulse mb-1" />
            <View className="h-3 bg-gray-200 rounded animate-pulse w-20" />
          </View>
        </View>
        <View className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
      </View>
    );
  }

  if (!activeProfile) {
    return null;
  }

  return (
    <View className="flex-row items-center justify-between p-4 bg-white border-b border-gray-200">
      <TouchableOpacity
        onPress={() => setIsModalVisible(true)}
        className="flex-row items-center space-x-3 flex-1"
      >
        {/* Optimized image loading with fallback */}
        <View className="relative">
          {activeProfile.profileImageUrl ? (
            <Image
              source={{ uri: activeProfile.profileImageUrl }}
              className="w-10 h-10 rounded-full"
              defaultSource={require('../assets/images/default-avatar.png')}
              loadingIndicatorSource={require('../assets/images/loading-avatar.png')}
            />
          ) : (
            <View 
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: getProfileColor(activeProfile.type) }}
            >
              <Ionicons 
                name={getProfileIcon(activeProfile.type)} 
                size={20} 
                color="white" 
              />
          </View>
          )}
          
          {/* Active indicator */}
          <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        </View>

        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900">
            {activeProfile.name}
          </Text>
          <Text className="text-sm text-gray-500 capitalize">
            {activeProfile.type} Profile
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsModalVisible(true)}>
        <Ionicons name="chevron-down" size={24} color="#6B7280" />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black bg-opacity-50"
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center px-4">
            <View className="bg-white rounded-lg w-full max-w-sm max-h-96">
              <View className="p-4 border-b border-gray-200">
                <Text className="text-lg font-semibold text-gray-900">
                  Select Profile
                </Text>
              </View>
              
              <ScrollView className="max-h-64">
                {profiles.map((profile) => (
                  <TouchableOpacity
                    key={profile.id}
                    onPress={() => handleProfileSelect(profile)}
                    className={`flex-row items-center p-4 border-b border-gray-100 ${
                      activeProfile.id === profile.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    {/* Optimized image loading with fallback */}
                    <View className="relative mr-3">
                      {profile.profileImageUrl ? (
                        <Image
                          source={{ uri: profile.profileImageUrl }}
                          className="w-12 h-12 rounded-full"
                          defaultSource={require('../assets/images/default-avatar.png')}
                          loadingIndicatorSource={require('../assets/images/loading-avatar.png')}
                        />
                      ) : (
                        <View 
                          className="w-12 h-12 rounded-full items-center justify-center"
                          style={{ backgroundColor: getProfileColor(profile.type) }}
                        >
                          <Ionicons 
                            name={getProfileIcon(profile.type)} 
                            size={24} 
                            color="white" 
                          />
                        </View>
                      )}
                      
                      {/* Active indicator */}
                      {activeProfile.id === profile.id && (
                        <View className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white items-center justify-center">
                          <Ionicons name="checkmark" size={12} color="white" />
                        </View>
                      )}
                    </View>

                    <View className="flex-1">
                      <Text className="text-base font-medium text-gray-900">
                        {profile.name}
                      </Text>
                      <Text className="text-sm text-gray-500 capitalize">
                        {profile.type} Profile
                      </Text>
                  </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default ProfileSwitcher;