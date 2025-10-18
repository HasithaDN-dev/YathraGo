import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Star, User } from 'phosphor-react-native';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import { findVehicleApi, VehicleSearchResult } from '@/lib/api/find-vehicle';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FindVehicleScreen() {
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>('');
  const [rating, setRating] = useState(1);
  const [requestedMap, setRequestedMap] = useState<Record<number, boolean>>({});
  const [vehicles, setVehicles] = useState<VehicleSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [profileType, setProfileType] = useState<'child' | 'staff'>('child');
  const [profileId, setProfileId] = useState<number | null>(null);

  // Load customer data on mount
  useEffect(() => {
    loadCustomerData();
  }, []);

  const loadCustomerData = async () => {
    try {
      // Get customer ID from AsyncStorage (adjust key as needed)
      const storedCustomerId = await AsyncStorage.getItem('customerId');
      const storedProfileType = await AsyncStorage.getItem('activeProfileType');
      const storedProfileId = await AsyncStorage.getItem('activeProfileId');

      if (storedCustomerId) {
        setCustomerId(parseInt(storedCustomerId));
      }
      if (storedProfileType === 'child' || storedProfileType === 'staff') {
        setProfileType(storedProfileType);
      }
      if (storedProfileId) {
        setProfileId(parseInt(storedProfileId));
      }
    } catch (error) {
      console.error('Error loading customer data:', error);
      Alert.alert('Error', 'Failed to load customer data');
    }
  };

  const searchVehicles = async () => {
    if (!customerId || !profileId) {
      Alert.alert('Error', 'Customer information is missing');
      return;
    }

    setLoading(true);
    try {
      const results = await findVehicleApi.searchVehicles({
        customerId,
        profileType,
        profileId,
        vehicleType: selectedVehicleType || undefined,
        minRating: rating,
      });
      setVehicles(results);
    } catch (error) {
      console.error('Error searching vehicles:', error);
      Alert.alert('Error', 'Failed to search vehicles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Search vehicles when filters change
  useEffect(() => {
    if (customerId && profileId) {
      searchVehicles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, profileId, selectedVehicleType, rating]);

  const handleRequestVehicle = (vehicleId: number) => {
    setRequestedMap(prev => ({ ...prev, [vehicleId]: true }));
    Alert.alert(
      'Request Sent',
      'Your vehicle request has been sent to the driver.',
      [{ text: 'OK' }]
    );
  };

  const VehicleCard = ({ vehicle }: { vehicle: VehicleSearchResult }) => {
    // Determine vehicle image based on type
    const getVehicleImage = () => {
      if (vehicle.vehicleType.toLowerCase().includes('bus')) {
        return require('../../../assets/images/bus.png');
      }
      return require('../../../assets/images/van.png');
    };

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push({ 
          pathname: '/(menu)/(homeCards)/transport_overview', 
          params: { 
            tab: 'Vehicle',
            driverId: vehicle.driverId 
          } 
        })}
        className="mb-4"
      >
        <Card className="p-4 !bg-brand-deepNavy">
          <View className="flex-row">
            {/* Vehicle Image */}
            <View className="mr-4">
              <Image
                source={getVehicleImage()}
                style={{ width: 80, height: 60, borderRadius: 8 }}
                resizeMode="cover"
              />
            </View>

            {/* Vehicle Details */}
            <View className="flex-1">
              <View className="flex-row items-start justify-between mb-1">
                <Typography variant="title-3" weight="semibold" className="text-white mr-2">
                  {vehicle.vehicleBrand} {vehicle.vehicleModel}
                </Typography>
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={() => handleRequestVehicle(vehicle.vehicleId)}
                  activeOpacity={0.85}
                  className="px-3 py-1.5 rounded-full"
                  style={{ 
                    backgroundColor: requestedMap[vehicle.vehicleId] 
                      ? Colors.successGreen 
                      : Colors.warmYellow 
                  }}
                >
                  <Typography variant="caption-2" weight="semibold" className="text-white">
                    {requestedMap[vehicle.vehicleId] ? 'Requested' : 'Request'}
                  </Typography>
                </TouchableOpacity>
              </View>

              <Typography variant="footnote" className="text-white mb-1">
                Type: {vehicle.vehicleType}
              </Typography>
              <Typography variant="footnote" className="text-white mb-1">
                Available seats: {vehicle.availableSeats}
              </Typography>
              {vehicle.airConditioned && (
                <Typography variant="caption-1" className="text-white mb-1">
                  ✓ Air Conditioned
                </Typography>
              )}
              {vehicle.assistant && (
                <Typography variant="caption-1" className="text-white mb-2">
                  ✓ Assistant Available
                </Typography>
              )}

              {/* Driver Info */}
              <View className="flex-row items-center mb-2">
                <View className="w-7 h-7 bg-yellow-300 rounded-full items-center justify-center mr-2">
                  <User size={16} color="#143373" weight="fill" />
                </View>
                <Typography variant="footnote" className="text-white mr-3">
                  {vehicle.driverName}
                </Typography>
                <View className="flex-row items-center">
                  <Star size={14} color="#f5b301" weight="fill" />
                  <Typography variant="caption-1" className="text-white ml-1">
                    {vehicle.driverRating.toFixed(1)}
                  </Typography>
                </View>
              </View>

              {/* Vehicle Registration and Route */}
              <View className="mt-1">
                <Typography variant="caption-1" className="text-white">
                  Reg: {vehicle.vehicleRegistrationNumber}
                </Typography>
                <View className="flex-row mt-1 items-center">
                  <Typography variant="caption-1" className="text-white font-semibold">
                    {vehicle.startCity}
                  </Typography>
                  <Typography variant="caption-1" className="text-white mx-1">
                    →
                  </Typography>
                  <Typography variant="caption-1" className="text-white font-semibold">
                    {vehicle.endCity}
                  </Typography>
                </View>
                {vehicle.estimatedPickupTime && vehicle.estimatedDropTime && (
                  <Typography variant="caption-1" className="text-white mt-1">
                    Time: {vehicle.estimatedPickupTime} - {vehicle.estimatedDropTime}
                  </Typography>
                )}
                <Typography variant="caption-1" className="text-white mt-1">
                  Distance: {vehicle.distanceFromPickup.toFixed(1)} km from pickup
                </Typography>
              </View>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Header */}
        <ScreenHeader title="Find Vehicle" showBackButton />

        {/* Filter Section */}
        <Card className="mx-4 mb-4 p-4" style={{ backgroundColor: Colors.darkGray }}>
          <View className="flex-row mb-4">
            {/* Vehicle Type Filter */}
            <View className="flex-1 mr-3">
              <Typography variant="footnote" className="text-black mb-2">
                Vehicle Type
              </Typography>
              <View className="border border-gray-300 rounded-lg overflow-hidden">
                <Picker
                  selectedValue={selectedVehicleType}
                  onValueChange={(itemValue) => setSelectedVehicleType(itemValue)}
                  style={{ height: 50 }}
                >
                  <Picker.Item label="All" value="" />
                  <Picker.Item label="Van" value="Van" />
                  <Picker.Item label="Bus" value="Bus" />
                </Picker>
              </View>
            </View>

            {/* Rating Filter */}
            <View className="flex-1">
              <Typography variant="footnote" className="text-black mb-2">
                Min Rating
              </Typography>
              <View className="border border-gray-300 rounded-lg overflow-hidden">
                <Picker
                  selectedValue={rating}
                  onValueChange={(itemValue) => setRating(itemValue)}
                  style={{ height: 50 }}
                >
                  <Picker.Item label="1+ Stars" value={1} />
                  <Picker.Item label="2+ Stars" value={2} />
                  <Picker.Item label="3+ Stars" value={3} />
                  <Picker.Item label="4+ Stars" value={4} />
                  <Picker.Item label="5 Stars" value={5} />
                </Picker>
              </View>
            </View>
          </View>
        </Card>

        {/* Vehicle Listings */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-4 pb-6">
            {loading ? (
              <View className="items-center justify-center py-10">
                <ActivityIndicator size="large" color={Colors.warmYellow} />
                <Typography variant="body" className="text-gray-500 mt-4">
                  Searching for vehicles...
                </Typography>
              </View>
            ) : vehicles.length === 0 ? (
              <View className="items-center justify-center py-10">
                <Typography variant="body" className="text-gray-500">
                  No vehicles found matching your criteria.
                </Typography>
                <Typography variant="caption-1" className="text-gray-400 mt-2 text-center">
                  Try adjusting your filters or check back later.
                </Typography>
              </View>
            ) : (
              vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.vehicleId} vehicle={vehicle} />
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
