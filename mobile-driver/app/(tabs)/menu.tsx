import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Typography } from '@/components/Typography';
import {
  User,
  Gear,
  Question,
  Shield,
  SignOut,
  Car,
  Wallet,
  ChartLine,
  Calendar
} from 'phosphor-react-native';
import { useRouter } from 'expo-router';

export default function MenuScreen() {
  const router = useRouter();

  const handleVehicleDetails = () => {
    router.push('/vehicle-list/all-vehicles');
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-white px-6 pt-12 pb-4 border-b border-gray-100">
        <Typography variant="title-1" weight="bold" className="text-brand-deepNavy mb-2">
          Menu
        </Typography>
        <Typography variant="body" className="text-brand-neutralGray">
          Manage your account and settings
        </Typography>
      </View>

      <View className="px-6 py-4">
        {/* Profile Section */}
        <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <View className="flex-row items-center">
            <View className="bg-brand-warmYellow w-16 h-16 rounded-full items-center justify-center mr-4">
              <User size={32} color="#143373" weight="regular" />
            </View>
            <View className="flex-1">
              <Typography variant="headline" weight="semibold" className="text-brand-deepNavy">
                Hemal Perera
              </Typography>
              <Typography variant="body" className="text-brand-neutralGray">
                Professional Driver
              </Typography>
            </View>
          </View>
        </View>

        {/* Menu Options */}
        <View className="bg-white rounded-xl shadow-sm overflow-hidden">
          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100" onPress={handleVehicleDetails}>
            <Car size={24} color="#143373" weight="regular" />
            <Typography variant="body" weight="medium" className="text-brand-deepNavy ml-4 flex-1">
              Vehicle Details
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
            <Wallet size={24} color="#143373" weight="regular" />
            <Typography variant="body" weight="medium" className="text-brand-deepNavy ml-4 flex-1">
              Earnings & Payments
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
            <ChartLine size={24} color="#143373" weight="regular" />
            <Typography variant="body" weight="medium" className="text-brand-deepNavy ml-4 flex-1">
              Performance Stats
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
            <Calendar size={24} color="#143373" weight="regular" />
            <Typography variant="body" weight="medium" className="text-brand-deepNavy ml-4 flex-1">
              Schedule
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
            <Gear size={24} color="#143373" weight="regular" />
            <Typography variant="body" weight="medium" className="text-brand-deepNavy ml-4 flex-1">
              Settings
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
            <Shield size={24} color="#143373" weight="regular" />
            <Typography variant="body" weight="medium" className="text-brand-deepNavy ml-4 flex-1">
              Privacy & Security
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
            <Question size={24} color="#143373" weight="regular" />
            <Typography variant="body" weight="medium" className="text-brand-deepNavy ml-4 flex-1">
              Help & Support
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4">
            <SignOut size={24} color="#ef4444" weight="regular" />
            <Typography variant="body" weight="medium" className="text-danger ml-4 flex-1">
              Sign Out
            </Typography>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
