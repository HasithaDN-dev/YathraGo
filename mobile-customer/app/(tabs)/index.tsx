import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../components/Typography';
import { useAuth } from '../../hooks/useAuth';
import { useProfileStore } from '../../lib/stores/profile.store';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const { user, logout, refreshProfiles } = useAuth();
  const { activeProfile, profiles } = useProfileStore();

  const handleRefresh = async () => {
    await refreshProfiles();
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView className="flex-1 px-6 py-4">
        {/* Header */}
        <View className="mb-6">
          <Typography variant="large-title" weight="bold" className="text-brand-deepNavy mb-2">
            Welcome Back!
          </Typography>
          <Typography variant="body" className="text-brand-neutralGray">
            You're logged in as {user?.phone}
          </Typography>
        </View>

        {/* Current Profile Card */}
        {activeProfile && (
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 bg-brand-navyBlue rounded-full items-center justify-center mr-4">
                <Ionicons 
                  name={activeProfile.type === 'child' ? 'school' : 'briefcase'} 
                  size={24} 
                  color="white" 
                />
              </View>
              <View className="flex-1">
                <Typography variant="title-2" weight="semibold" className="text-brand-deepNavy">
                  {activeProfile.name}
                </Typography>
                <Typography variant="caption-1" className="text-brand-neutralGray capitalize">
                  {activeProfile.type} Profile
                </Typography>
              </View>
            </View>

            {/* Profile Details */}
            <View className="space-y-3">
              {activeProfile.email && (
                <View className="flex-row items-center">
                  <Ionicons name="mail-outline" size={16} color="#6b7280" />
                  <Typography variant="body" className="ml-2 text-brand-neutralGray">
                    {activeProfile.email}
                  </Typography>
                </View>
              )}
              
              {activeProfile.address && (
                <View className="flex-row items-start">
                  <Ionicons name="location-outline" size={16} color="#6b7280" style={{ marginTop: 2 }} />
                  <Typography variant="body" className="ml-2 text-brand-neutralGray flex-1">
                    {activeProfile.address}
                  </Typography>
                </View>
              )}

              {activeProfile.emergencyContact && (
                <View className="flex-row items-center">
                  <Ionicons name="call-outline" size={16} color="#6b7280" />
                  <Typography variant="body" className="ml-2 text-brand-neutralGray">
                    {activeProfile.emergencyContact}
                  </Typography>
                </View>
              )}

              {/* Child-specific info */}
              {activeProfile.type === 'child' && activeProfile.school && (
                <View className="flex-row items-center">
                  <Ionicons name="school-outline" size={16} color="#6b7280" />
                  <Typography variant="body" className="ml-2 text-brand-neutralGray">
                    {activeProfile.school}
                  </Typography>
                </View>
              )}

              {/* Staff-specific info */}
              {activeProfile.type === 'staff' && activeProfile.workLocation && (
                <View className="flex-row items-center">
                  <Ionicons name="business-outline" size={16} color="#6b7280" />
                  <Typography variant="body" className="ml-2 text-brand-neutralGray">
                    {activeProfile.workLocation}
                  </Typography>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Available Profiles */}
        {profiles.length > 1 && (
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
            <Typography variant="title-3" weight="semibold" className="text-brand-deepNavy mb-4">
              Available Profiles ({profiles.length})
            </Typography>
            <View className="space-y-3">
              {profiles.map((profile) => (
                <View 
                  key={profile.id} 
                  className={`flex-row items-center p-3 rounded-lg ${
                    activeProfile?.id === profile.id ? 'bg-brand-navyBlue/10 border border-brand-navyBlue/20' : 'bg-gray-50'
                  }`}
                >
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
                  {activeProfile?.id === profile.id && (
                    <Ionicons name="checkmark-circle" size={20} color="#143373" />
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Actions */}
        <View className="space-y-4 mb-6">
          <TouchableOpacity 
            onPress={handleRefresh}
            className="bg-brand-navyBlue py-4 px-6 rounded-xl flex-row items-center justify-center"
          >
            <Ionicons name="refresh" size={20} color="white" />
            <Typography variant="body" weight="medium" className="text-white ml-2">
              Refresh Profiles
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleLogout}
            className="bg-red-500 py-4 px-6 rounded-xl flex-row items-center justify-center"
          >
            <Ionicons name="log-out-outline" size={20} color="white" />
            <Typography variant="body" weight="medium" className="text-white ml-2">
              Logout
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Debug Info */}
        <View className="bg-gray-100 rounded-xl p-4 mb-6">
          <Typography variant="caption-1" weight="medium" className="text-gray-600 mb-2">
            Debug Information
          </Typography>
          <Typography variant="caption-1" className="text-gray-500">
            User ID: {user?.id}
          </Typography>
          <Typography variant="caption-1" className="text-gray-500">
            Profile Complete: {user?.isProfileComplete ? 'Yes' : 'No'}
          </Typography>
          <Typography variant="caption-1" className="text-gray-500">
            Active Profile: {activeProfile?.id}
          </Typography>
          <Typography variant="caption-1" className="text-gray-500">
            Total Profiles: {profiles.length}
          </Typography>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
