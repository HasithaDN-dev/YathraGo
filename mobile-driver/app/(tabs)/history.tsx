import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Sample history data - replace with actual data from your API
const historyData = [
  {
    id: 1,
    date: '2025-01-12',
    time: '10:30 AM',
    pickup: 'Colombo Fort Railway Station',
    dropoff: 'Bandaranaike International Airport',
    distance: '32.5 km',
    duration: '45 min',
    fare: 'Rs. 2,500',
    status: 'completed',
  },
  {
    id: 2,
    date: '2025-01-11',
    time: '3:15 PM',
    pickup: 'Galle Face Green',
    dropoff: 'Independence Square',
    distance: '8.2 km',
    duration: '25 min',
    fare: 'Rs. 850',
    status: 'completed',
  },
  {
    id: 3,
    date: '2025-01-11',
    time: '9:45 AM',
    pickup: 'Kandy City Center',
    dropoff: 'Temple of Tooth',
    distance: '3.1 km',
    duration: '12 min',
    fare: 'Rs. 450',
    status: 'completed',
  },
];

export default function HistoryScreen() {
  const renderHistoryItem = (item: typeof historyData[0]) => (
    <TouchableOpacity
      key={item.id}
      className="bg-white rounded-lg p-4 mb-3 border border-gray-200"
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800">
            Trip #{item.id}
          </Text>
          <Text className="text-sm text-gray-500">
            {item.date} • {item.time}
          </Text>
        </View>
        <View className="bg-green-100 px-3 py-1 rounded-full">
          <Text className="text-green-700 text-xs font-medium capitalize">
            {item.status}
          </Text>
        </View>
      </View>

      <View className="space-y-2">
        <View className="flex-row">
          <View className="w-3 h-3 bg-blue-500 rounded-full mt-1 mr-3" />
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

      <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-100">
        <View className="flex-row space-x-4">
          <Text className="text-sm text-gray-600">
            {item.distance} • {item.duration}
          </Text>
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
        <Text className="text-2xl font-bold text-gray-800">Trip History</Text>
        <Text className="text-sm text-gray-600 mt-1">
          Your completed rides
        </Text>
      </View>

      {/* History List */}
      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        {historyData.map((item) => renderHistoryItem(item))}
        
        {/* Empty state - uncomment if no history */}
        {/* 
        <View className="flex-1 items-center justify-center py-20">
          <Text className="text-gray-500 text-lg mb-2">No trips yet</Text>
          <Text className="text-gray-400 text-center">
            Your completed rides will appear here
          </Text>
        </View>
        */}
      </ScrollView>
    </View>
  );
}
