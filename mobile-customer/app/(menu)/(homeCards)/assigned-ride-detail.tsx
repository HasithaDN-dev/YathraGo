import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useLocalSearchParams, router } from 'expo-router';
import { useAssignedRideStore } from '@/lib/stores/assigned-ride.store';
import { useProfileStore } from '@/lib/stores/profile.store';
import { 
  User, 
  Car, 
  CalendarCheck, 
  MoneyIcon, 
  Phone, 
  Star,
  AirplaneTilt,
  Palette,
  Armchair,
  CheckCircle,
  XCircle
} from 'phosphor-react-native';
import { Colors } from '@/constants/Colors';

export default function AssignedRideDetailScreen() {
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const { assignedRide, isLoading, loadAssignedRide } = useAssignedRideStore();
  const { activeProfile } = useProfileStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    handleRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    if (!activeProfile) return;
    
    setRefreshing(true);
    try {
      const profileIdStr = activeProfile.id.split('-')[1];
      const profileId = parseInt(profileIdStr, 10);
      await loadAssignedRide(activeProfile.type, profileId);
    } catch {
      Alert.alert('Error', 'Failed to refresh assignment details');
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading || refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ScreenHeader title="Assignment Details" showBackButton />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.warmYellow} />
          <Typography variant="body" className="text-gray-500 mt-3">
            Loading assignment details...
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

  if (!assignedRide) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ScreenHeader title="Assignment Details" showBackButton />
        <View className="flex-1 items-center justify-center px-4">
          <Typography variant="body" className="text-gray-500 text-center">
            No active assignment found for this profile
          </Typography>
          <TouchableOpacity
            className="mt-4 bg-brand-warmYellow px-6 py-3 rounded-lg"
            onPress={handleRefresh}
            activeOpacity={0.8}
          >
            <Typography variant="subhead" weight="semibold" className="text-brand-deepNavy">
              Refresh
            </Typography>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const showDriverTab = !tab || tab === 'Driver';
  const showVehicleTab = tab === 'Vehicle';

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScreenHeader title="Assignment Details" showBackButton />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Tab Selector */}
        <View className="flex-row mx-4 mt-4 bg-gray-100 rounded-lg p-1">
          <TouchableOpacity
            className={`flex-1 py-3 rounded-lg ${showDriverTab ? 'bg-white' : ''}`}
            onPress={() => router.setParams({ tab: 'Driver' })}
            activeOpacity={0.8}
          >
            <Typography 
              variant="subhead" 
              weight={showDriverTab ? 'semibold' : 'regular'}
              className={showDriverTab ? 'text-brand-deepNavy text-center' : 'text-brand-neutralGray text-center'}
            >
              Driver
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 rounded-lg ${showVehicleTab ? 'bg-white' : ''}`}
            onPress={() => router.setParams({ tab: 'Vehicle' })}
            activeOpacity={0.8}
          >
            <Typography 
              variant="subhead" 
              weight={showVehicleTab ? 'semibold' : 'regular'}
              className={showVehicleTab ? 'text-brand-deepNavy text-center' : 'text-brand-neutralGray text-center'}
            >
              Vehicle
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Assignment Status */}
        <Card className="mx-4 mt-4 p-5 bg-green-50">
          <View className="flex-row items-center">
            <CheckCircle size={24} color="#22c55e" weight="fill" />
            <Typography variant="subhead" weight="semibold" className="text-green-700 ml-2">
              Active Assignment
            </Typography>
          </View>
        </Card>

        {/* Assignment Details */}
        <Card className="mx-4 mt-3 p-5">
          <Typography variant="subhead" weight="semibold" className="text-brand-deepNavy mb-4">
            Assignment Information
          </Typography>
          
          {assignedRide.assignedDate && (
            <View className="flex-row items-center mb-3 pb-3 border-b border-gray-200">
              <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                <CalendarCheck size={20} color={Colors.deepNavy} weight="regular" />
              </View>
              <View className="flex-1">
                <Typography variant="caption-1" className="text-brand-neutralGray">
                  Assigned Date
                </Typography>
                <Typography variant="subhead" weight="semibold" className="text-black">
                  {new Date(assignedRide.assignedDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </View>
            </View>
          )}
          
          {assignedRide.amount !== null && assignedRide.amount !== undefined && (
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                <MoneyIcon size={20} color="#22c55e" weight="regular" />
              </View>
              <View className="flex-1">
                <Typography variant="caption-1" className="text-brand-neutralGray">
                  Monthly Amount
                </Typography>
                <Typography variant="title-2" weight="bold" className="text-green-600">
                  Rs. {assignedRide.amount.toLocaleString()}
                </Typography>
              </View>
            </View>
          )}
        </Card>

        {/* Driver Details Tab */}
        {showDriverTab && (
          <>
            <Card className="mx-4 mt-3 p-5">
              <Typography variant="subhead" weight="semibold" className="text-brand-deepNavy mb-4">
                Driver Information
              </Typography>
              
              <View className="flex-row items-center mb-4">
                <View className="w-16 h-16 bg-gray-200 rounded-full items-center justify-center mr-4">
                  {assignedRide.driver.profilePictureUrl ? (
                    <View className="w-16 h-16 rounded-full overflow-hidden">
                      {/* Add Image component here if needed */}
                      <User size={32} color={Colors.deepNavy} weight="regular" />
                    </View>
                  ) : (
                    <User size={32} color={Colors.deepNavy} weight="regular" />
                  )}
                </View>
                <View className="flex-1">
                  <Typography variant="title-3" weight="bold" className="text-black">
                    {assignedRide.driver.name}
                  </Typography>
                  <View className="flex-row items-center mt-1">
                    <Star size={16} color={Colors.warmYellow} weight="fill" />
                    <Typography variant="footnote" className="text-brand-neutralGray ml-1">
                      {assignedRide.driver.rating.toFixed(1)} Rating
                    </Typography>
                  </View>
                </View>
              </View>
              
              <View className="flex-row items-center pt-3 border-t border-gray-200">
                <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <Phone size={20} color={Colors.deepNavy} weight="regular" />
                </View>
                <View className="flex-1">
                  <Typography variant="caption-1" className="text-brand-neutralGray">
                    Contact Number
                  </Typography>
                  <Typography variant="subhead" weight="semibold" className="text-black">
                    {assignedRide.driver.phone}
                  </Typography>
                </View>
              </View>
            </Card>
          </>
        )}

        {/* Vehicle Details Tab */}
        {showVehicleTab && assignedRide.vehicle && (
          <>
            <Card className="mx-4 mt-3 p-5">
              <Typography variant="subhead" weight="semibold" className="text-brand-deepNavy mb-4">
                Vehicle Information
              </Typography>
              
              <View className="mb-4">
                <View className="w-16 h-16 bg-gray-200 rounded-lg items-center justify-center mb-3">
                  <Car size={32} color={Colors.deepNavy} weight="regular" />
                </View>
                <Typography variant="title-3" weight="bold" className="text-black mb-1">
                  {assignedRide.vehicle.brand} {assignedRide.vehicle.model}
                </Typography>
                <Typography variant="body" className="text-brand-neutralGray">
                  {assignedRide.vehicle.registrationNumber}
                </Typography>
              </View>
            </Card>

            <Card className="mx-4 mt-3 p-5">
              <Typography variant="subhead" weight="semibold" className="text-brand-deepNavy mb-4">
                Vehicle Specifications
              </Typography>
              
              <View className="flex-row items-center mb-3 pb-3 border-b border-gray-200">
                <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-3">
                  <Car size={20} color="#9333ea" weight="regular" />
                </View>
                <View className="flex-1">
                  <Typography variant="caption-1" className="text-brand-neutralGray">
                    Vehicle Type
                  </Typography>
                  <Typography variant="subhead" weight="semibold" className="text-black capitalize">
                    {assignedRide.vehicle.type}
                  </Typography>
                </View>
              </View>

              <View className="flex-row items-center mb-3 pb-3 border-b border-gray-200">
                <View className="w-10 h-10 bg-pink-100 rounded-full items-center justify-center mr-3">
                  <Palette size={20} color="#ec4899" weight="regular" />
                </View>
                <View className="flex-1">
                  <Typography variant="caption-1" className="text-brand-neutralGray">
                    Color
                  </Typography>
                  <Typography variant="subhead" weight="semibold" className="text-black capitalize">
                    {assignedRide.vehicle.color}
                  </Typography>
                </View>
              </View>

              <View className="flex-row items-center mb-3 pb-3 border-b border-gray-200">
                <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-3">
                  <Armchair size={20} color="#f97316" weight="regular" />
                </View>
                <View className="flex-1">
                  <Typography variant="caption-1" className="text-brand-neutralGray">
                    Seating Capacity
                  </Typography>
                  <Typography variant="subhead" weight="semibold" className="text-black">
                    {assignedRide.vehicle.seats} Seats
                  </Typography>
                </View>
              </View>

              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-cyan-100 rounded-full items-center justify-center mr-3">
                  <AirplaneTilt size={20} color="#06b6d4" weight="regular" />
                </View>
                <View className="flex-1">
                  <Typography variant="caption-1" className="text-brand-neutralGray">
                    Air Conditioning
                  </Typography>
                  <View className="flex-row items-center mt-1">
                    {assignedRide.vehicle.airConditioned ? (
                      <>
                        <CheckCircle size={16} color="#22c55e" weight="fill" />
                        <Typography variant="subhead" weight="semibold" className="text-green-600 ml-1">
                          Available
                        </Typography>
                      </>
                    ) : (
                      <>
                        <XCircle size={16} color="#ef4444" weight="fill" />
                        <Typography variant="subhead" weight="semibold" className="text-red-600 ml-1">
                          Not Available
                        </Typography>
                      </>
                    )}
                  </View>
                </View>
              </View>
            </Card>
          </>
        )}

        {/* Profile Information */}
        <Card className="mx-4 mt-3 p-5">
          <Typography variant="subhead" weight="semibold" className="text-brand-deepNavy mb-3">
            This Assignment Is For
          </Typography>
          <Typography variant="body" className="text-brand-neutralGray">
            {activeProfile?.name}
          </Typography>
        </Card>

        {/* Refresh Button */}
        <View className="mx-4 mt-4 mb-6">
          <TouchableOpacity
            className="bg-brand-warmYellow py-4 rounded-lg"
            onPress={handleRefresh}
            activeOpacity={0.8}
          >
            <Typography variant="subhead" weight="semibold" className="text-brand-deepNavy text-center">
              Refresh Details
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Bottom spacer */}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
