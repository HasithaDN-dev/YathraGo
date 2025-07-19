import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Typography } from '@/components/Typography';
import { ArrowLeft } from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import VehicleCard from '@/components/vehicle/VehicleCard';

interface Vehicle {
  id: string;
  vehicleId: string;
  model: string;
  assignedDriver: string;
  status: 'active' | 'inactive';
  image?: any;
}

// Sample vehicle data with asset images
const sampleVehicles: Vehicle[] = [
  {
    id: '1',
    vehicleId: 'WP CAB 4645',
    model: 'TOYOTA GDH 223 GL',
    assignedDriver: 'Hemal Perera',
    status: 'active',
    image: require('../../assets/images/vehicle1.png'),
  },
  {
    id: '2',
    vehicleId: 'WP FFD 1206',
    model: 'TOYOTA TownACE',
    assignedDriver: 'Wishwa Namal',
    status: 'active',
    image: require('../../assets/images/vehicle1.png'),
  },
  {
    id: '3',
    vehicleId: 'WP ABC 7890',
    model: 'TOYOTA HIACE',
    assignedDriver: 'Unassigned',
    status: 'inactive',
    image: require('../../assets/images/vehicle2.png'),
  },
];

export default function AllVehiclesScreen() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>(sampleVehicles);

  const handleBack = () => {
    router.back();
  };

  const handleViewVehicle = (vehicleId: string) => {
    console.log('View vehicle:', vehicleId);
    // Navigate to vehicle details screen
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-brand-deepNavy px-6 pt-12 pb-4 rounded-b-3xl">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={handleBack} className="mr-4">
            <ArrowLeft size={24} color="#ffffff" weight="regular" />
          </TouchableOpacity>
          <Typography variant="title-1" weight="bold" className="text-white">
            Vehicle List
          </Typography>
        </View>

        {/* Filter Tabs */}
        <View className="flex-row space-x-8">
          {(['all', 'assigned', 'unassigned'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              className="items-center"
            >
              <Typography 
                variant="body" 
                weight="medium" 
                className={`text-white capitalize ${filter === 'all' ? 'opacity-100' : 'opacity-70'}`}
              >
                {filter}
              </Typography>
              {filter === 'all' && (
                <View className="w-8 h-1 bg-brand-brightOrange rounded-full mt-1" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Vehicle List */}
      <ScrollView className="flex-1 px-6 py-4">
        {vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            onViewMore={() => handleViewVehicle(vehicle.id)}
          />
        ))}

        {/* Bottom Spacing for Tab Bar */}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
} 