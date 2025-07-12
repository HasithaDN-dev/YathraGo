import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Sample rides data - replace with actual data from your API
const ridesData = [
  {
    id: 1,
    type: 'upcoming',
    date: '2025-01-13',
    time: '8:00 AM',
    pickup: 'Home - Colombo 07',
    dropoff: 'International School Colombo',
    driverName: 'Sunil Fernando',
    vehicleNumber: 'CAB-1234',
    fare: 'Rs. 1,200',
    status: 'confirmed',
  },
  {
    id: 2,
    type: 'completed',
    date: '2025-01-12',
    time: '3:30 PM',
    pickup: 'International School Colombo',
    dropoff: 'Home - Colombo 07',
    driverName: 'Sunil Fernando',
    vehicleNumber: 'CAB-1234',
    fare: 'Rs. 1,200',
    status: 'completed',
  },
  {
    id: 3,
    type: 'completed',
    date: '2025-01-12',
    time: '7:45 AM',
    pickup: 'Home - Colombo 07',
    dropoff: 'International School Colombo',
    driverName: 'Kamal Silva',
    vehicleNumber: 'CAB-5678',
    fare: 'Rs. 1,200',
    status: 'completed',
  },
  {
    id: 4,
    type: 'completed',
    date: '2025-01-11',
    time: '3:30 PM',
    pickup: 'International School Colombo',
    dropoff: 'Home - Colombo 07',
    driverName: 'Kamal Silva',
    vehicleNumber: 'CAB-5678',
    fare: 'Rs. 1,200',
    status: 'completed',
  },
];

export default function RidesScreen() {
  const upcomingRides = ridesData.filter(ride => ride.type === 'upcoming');
  const completedRides = ridesData.filter(ride => ride.type === 'completed');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderRideItem = (item: typeof ridesData[0]) => (
    <TouchableOpacity
      key={item.id}
      className="bg-white rounded-lg p-4 mb-3 border border-gray-200"
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800">
            Ride #{item.id}
          </Text>
          <Text className="text-sm text-gray-500">
            {item.date} • {item.time}
          </Text>
        </View>
        <View className={`px-3 py-1 rounded-full ${getStatusColor(item.status)}`}>
          <Text className="text-xs font-medium capitalize">
            {item.status}
          </Text>
        </View>
      </View>

      <View className="space-y-2 mb-3">
        <View className="flex-row">
          <View className="w-3 h-3 bg-green-500 rounded-full mt-1 mr-3" />
          <View className="flex-1">
            <Text className="text-sm text-gray-600">Pickup</Text>
            <Text className="text-base text-gray-800">{item.pickup}</Text>
          </View>
        </View>

        <View className="flex-row">
          <View className="w-3 h-3 bg-red-500 rounded-full mt-1 mr-3" />
          <View className="flex-1">
            <Text className="text-sm text-gray-600">Drop-off</Text>
            <Text className="text-base text-gray-800">{item.dropoff}</Text>
          </View>
        </View>
      </View>

      <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
        <View>
          <Text className="text-sm text-gray-600">Driver: {item.driverName}</Text>
          <Text className="text-sm text-gray-600">Vehicle: {item.vehicleNumber}</Text>
        </View>
        <Text className="text-lg font-bold text-green-600">
          {item.fare}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="bg-white px-6 pt-12 pb-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-800">My Rides</Text>
        <Text className="text-sm text-gray-600 mt-1">
          Upcoming and past bookings
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        {/* Upcoming Rides Section */}
        {upcomingRides.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Upcoming Rides
            </Text>
            {upcomingRides.map((item) => renderRideItem(item))}
          </View>
        )}

        {/* Completed Rides Section */}
        <View>
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Ride History
          </Text>
          {completedRides.map((item) => renderRideItem(item))}
        </View>

        {/* Empty state - uncomment if no rides */}
        {/* 
        {ridesData.length === 0 && (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-500 text-lg mb-2">No rides booked</Text>
            <Text className="text-gray-400 text-center">
              Your ride bookings will appear here
            </Text>
          </View>
        )}
        */}
      </ScrollView>
    </View>
  );
}
