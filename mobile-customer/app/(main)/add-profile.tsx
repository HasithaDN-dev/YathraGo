import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Typography } from '../../components/Typography';
import { useAuth } from '../../hooks/useAuth';
import { useProfileStore } from '../../lib/stores/profile.store';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../../components/ui/CustomButton';

export default function AddProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profiles } = useProfileStore();
  const [isLoading, setIsLoading] = useState(false);

  // Check if user already has a staff profile
  const hasStaffProfile = profiles.some(profile => profile.type === 'staff');

  const handleAddChildProfile = () => {
    router.push('/(registration)/child-registration?mode=add');
  };

  const handleAddStaffProfile = () => {
    if (hasStaffProfile) {
      Alert.alert('Limit Reached', 'You can only have one staff profile per account.');
      return;
    }
    router.push('/(registration)/staff-passenger?mode=add');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView className="flex-1 px-6 py-4">
        {/* Header */}
        <View className="mb-6">
          <Typography variant="large-title" weight="bold" className="text-brand-deepNavy mb-2">
            Add New Profile
          </Typography>
          <Typography variant="body" className="text-brand-neutralGray">
            Choose the type of profile you want to add
          </Typography>
        </View>

        {/* Current Profiles Summary */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <Typography variant="title-3" weight="semibold" className="text-brand-deepNavy mb-4">
            Current Profiles ({profiles.length})
          </Typography>
          <View className="space-y-3">
            {profiles.map((profile) => (
              <View key={profile.id} className="flex-row items-center p-3 rounded-lg bg-gray-50">
                <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                  profile.type === 'child' ? 'bg-yellow-500' : 'bg-green-500'
                }`}>
                  <Ionicons 
                    name={profile.type === 'child' ? 'school' : 'briefcase'} 
                    size={16} 
                    color="white" 
                  />
                </View>
                <View className="flex-1">
                  <Typography variant="body" weight="medium" className="text-brand-deepNavy">
                    {profile.name}
                  </Typography>
                  <Typography variant="caption-1" className="text-brand-neutralGray capitalize">
                    {profile.type}
                  </Typography>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Add Profile Options */}
        <View className="space-y-4 mb-6">
          {/* Add Child Profile */}
          <View className="bg-white rounded-2xl p-6 shadow-sm">
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 bg-yellow-500 rounded-full items-center justify-center mr-4">
                <Ionicons name="school" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Typography variant="title-3" weight="semibold" className="text-brand-deepNavy">
                  Add Child Profile
                </Typography>
                <Typography variant="body" className="text-brand-neutralGray">
                  For school transport services
                </Typography>
              </View>
            </View>
            <CustomButton
              title="Add Child Profile"
              onPress={handleAddChildProfile}
              fullWidth={true}
              size="large"
              className="bg-yellow-500"
            />
          </View>

          {/* Add Staff Profile */}
          <View className="bg-white rounded-2xl p-6 shadow-sm">
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 bg-green-500 rounded-full items-center justify-center mr-4">
                <Ionicons name="briefcase" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Typography variant="title-3" weight="semibold" className="text-brand-deepNavy">
                  Add Staff Profile
                </Typography>
                <Typography variant="body" className="text-brand-neutralGray">
                  For office transport services
                </Typography>
                {hasStaffProfile && (
                  <Typography variant="caption-1" className="text-red-500 mt-1">
                    You already have a staff profile
                  </Typography>
                )}
              </View>
            </View>
            <CustomButton
              title={hasStaffProfile ? "Staff Profile Limit Reached" : "Add Staff Profile"}
              onPress={handleAddStaffProfile}
              fullWidth={true}
              size="large"
              className={hasStaffProfile ? "bg-gray-400" : "bg-green-500"}
              disabled={hasStaffProfile}
            />
          </View>
        </View>

        {/* Back Button */}
        <CustomButton
          title="Back to Home"
          onPress={handleBack}
          fullWidth={true}
          size="large"
          variant="outline"
          className="mb-6"
        />
      </ScrollView>
    </SafeAreaView>
  );
} 