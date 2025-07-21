import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import {
  ArrowLeft,
  MapPin,
  User,
  Car,
  CheckCircle,
  XCircle,
} from 'phosphor-react-native';

const historyData = [
  {
    id: 1,
    startTime: '7:10 AM',
    endTime: '8:20 AM',
    duration: '1 hr 10 m',
    startLocation: 'Piliyandala Arpico',
    endLocation: 'Town Hall',
    passengers: '14/15',
    licensePlate: 'YGT-25600',
    vehicleType: 'WP 6783',
    status: 'Completed',
  },
  {
    id: 2,
    startTime: '7:10 AM',
    endTime: '8:20 AM',
    duration: '1 hr 10 m',
    startLocation: 'Piliyandala Arpico',
    endLocation: 'Town Hall',
    passengers: '14/15',
    licensePlate: 'YGT-25600',
    vehicleType: 'WP 6783',
    status: 'Completed',
  },
  {
    id: 3,
    startTime: '7:10 AM',
    endTime: '8:20 AM',
    duration: '1 hr 10 m',
    startLocation: 'Piliyandala Arpico',
    endLocation: 'Town Hall',
    passengers: '14/15',
    licensePlate: 'YGT-25600',
    vehicleType: 'WP 6783',
    status: 'Cancelled',
  },
];

const StatusBadge = ({ status }: { status: string }) => {
  const isCompleted = status === 'Completed';
  return (
    <View
      className={`px-3 py-1 rounded-full ${
        isCompleted ? 'bg-green-100' : 'bg-red-100'
      }`}
    >
      <Text
        className={`text-xs font-medium ${
          isCompleted ? 'text-green-700' : 'text-red-700'
        }`}
      >
        {status}
      </Text>
    </View>
  );
};

export default function HistoryScreen() {
  const renderHistoryItem = (item: typeof historyData[0]) => (
    <View key={item.id} className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-gray-500">Today</Text>
        <StatusBadge status={item.status} />
      </View>

      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-xl font-bold text-gray-800">{item.startTime}</Text>
        <View className="flex-row items-center">
          <View className="h-px flex-1 bg-gray-300" />
          <Text className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mx-2">
            {item.duration}
          </Text>
          <View className="h-px flex-1 bg-gray-300" />
        </View>
        <Text className="text-xl font-bold text-gray-800">{item.endTime}</Text>
      </View>

      <View className="flex-row justify-between mb-4">
        <View className="flex-row items-center">
          <MapPin size={16} color="#4B5563" />
          <Text className="ml-2 text-sm text-gray-600">{item.startLocation}</Text>
        </View>
        <View className="flex-row items-center">
          <MapPin size={16} color="#4B5563" />
          <Text className="ml-2 text-sm text-gray-600">{item.endLocation}</Text>
        </View>

      <View className="flex-row justify-between items-center border-t border-gray-100 pt-4">
        <View className="flex-row items-center space-x-4">
          <View className="flex-row items-center">
            <User size={16} color="#4B5563" />
            <Text className="ml-2 text-sm text-gray-800">{item.passengers}</Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-sm text-gray-500">{item.licensePlate}</Text>
          </View>
        </View>
        <View className="flex-row items-center bg-gray-100 px-2 py-1 rounded-md">
          <Car size={16} color="#4B5563" />
          <Text className="ml-2 text-sm text-gray-800 font-semibold">{item.vehicleType}</Text>
          <View className="bg-yellow-200 ml-2 px-2 rounded-sm">
            <Text className="text-yellow-800 text-xs font-bold">Owned</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-[#F0F2F5]">
      <StatusBar style="light" />
      <View className="bg-[#1E3A8A] pt-12 pb-6 px-4 rounded-b-3xl">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-white text-xl font-bold">Trip History</Text>
            <Text className="text-gray-300 text-sm">Jun 26, 2025</Text>
          </View>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        {historyData.map((item) => renderHistoryItem(item))}
      </ScrollView>
    </View>
  );
}
