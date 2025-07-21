import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Typography } from '@/components/Typography';
import {
  Car, MapPin, Clock, CurrencyDollar, Star, Bell, Play, Pause, CompassIcon, Calendar,
  User, House, Building, CaretDown, ChatCircle, Megaphone, List, CreditCard, FileText,
  CheckCircle, Clock as ClockIcon, Users,
  ToggleLeftIcon
} from 'phosphor-react-native';
import CustomButton from '@/components/ui/CustomButton';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);
  const [tripStarted, setTripStarted] = useState(false);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [currentTripStatus, setCurrentTripStatus] = useState<'pending' | 'on-the-way' | 'completed'>('pending');

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
  };

  const startTrip = () => {
    setTripStarted(!tripStarted);
    setCurrentTripStatus('on-the-way');
    setIsButtonEnabled(true);
    console.log('Starting trip...');
    // Navigate to navigation tab
    //router.push('/(tabs)/navigation');
  };

  // useEffect(() => {
  //   if (tripStarted) {
  //     setIsOnline(true);
  //   }
  // }, [tripStarted]);

  setTimeout(() => {
    setIsButtonEnabled(false);
    
  }, 6000);

  const viewTrip = () => {
    console.log('Viewing trip...');
  };

  const viewAllStudents = () => {
    console.log('Navigating to all students view...');
    // Navigate to students list screen
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Blue Header with rounded bottom corners */}
      <View className="bg-brand-deepNavy px-6 pt-20 pb-8 rounded-b-3xl">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View className="bg-brand-warmYellow w-10 h-10 rounded-full items-center justify-center mr-3">
              <User size={20} color="#143373" weight="regular" />
            </View>
            <View>
              <Typography variant="headline" weight="bold" className="text-white">
                Welcome Back
              </Typography>
              <Typography variant="body" className="text-white opacity-80">
                Hemal Perera
              </Typography>
            </View>
          </View>
          <View className={`px-3 py-1 rounded-full ${isOnline ? 'bg-success' : 'bg-brand-neutralGray'}`}>
            <Typography variant="caption-1" weight="medium" className="text-white">
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </Typography>
          </View>
        </View>
      </View>


      {/* <View className="mx-6 mt-4 bg-white rounded-xl p-4 shadow-sm">
        <View className="flex-row items-center justify-between mb-3">
          <Typography variant="headline" weight="semibold" className="text-brand-deepNavy">
            Driver Status
          </Typography>
        </View>

        <CustomButton
          title={isOnline ? 'Go Offline' : 'Go Online'}
          onPress={toggleOnlineStatus}
          bgVariant={isOnline ? 'danger' : 'success'}
          size="medium"
          fullWidth
          IconLeft={isOnline ? Pause : Play}
        />
      </View> */}

      {/* Current Trip Section */}
      <View className="bg-white mx-6 mt-4 rounded-xl p-4 shadow-sm">
        <View className="flex-row items-center justify-between mb-4">
          <Typography variant="headline" weight="semibold" className="text-brand-deepNavy">
            Current Trip
          </Typography>
          <TouchableOpacity>
            <Typography variant="body" weight="medium" className="text-brand-brightOrange">
              See More
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Trip Progress Timeline */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1 items-center">
            <View className={`p-2 rounded-full mb-2 ${tripStarted ? 'bg-success' : 'bg-brand-neutralGray'}`}>
              <House size={16} color="#ffffff" weight="regular" />
            </View>
            <Typography variant="caption-1" weight="medium" className="text-brand-deepNavy text-center">
              Start
            </Typography>
            <Typography variant="caption-2" className="text-brand-neutralGray text-center">
              Maharagama Junction
            </Typography>
          </View>

          <View className="flex-1 items-center">
            <View className={`px-3 py-1 rounded-full mb-2 ${currentTripStatus === 'on-the-way' ? 'bg-brand-navyBlue' : 'bg-brand-neutralGray'}`}>
              <Typography variant="caption-1" weight="medium" className="text-white">
                On the Way
              </Typography>
            </View>
            <Typography variant="caption-2" className="text-brand-neutralGray text-center">
              ETA 8:20 AM
            </Typography>
          </View>

          <View className="flex-1 items-center">
            <View className="bg-brand-brightOrange p-2 rounded-full mb-2">
              <Building size={16} color="#ffffff" weight="regular" />
            </View>
            <Typography variant="caption-1" weight="medium" className="text-brand-deepNavy text-center">
              Destination
            </Typography>
            <Typography variant="caption-2" className="text-brand-neutralGray text-center">
              Royal College
            </Typography>
          </View>
        </View>

        {/* Trip Action Buttons */}
        <View className="flex-row gap-3">
          <CustomButton
            title={tripStarted ? "End Trip" : "Start Trip"}
            onPress={startTrip}
            bgVariant={!tripStarted ? "success" : "danger"}
            size="medium"
            fullWidth
            IconLeft={tripStarted ? CheckCircle : Play}
            disabled={isButtonEnabled}
          />

        </View>
      </View>

      {/* Assigned Children Summary Section */}
      <View className="bg-white mx-6 mt-4 rounded-xl p-4 shadow-sm">
        <View className="flex-row items-center justify-between mb-4">
          <Typography variant="headline" weight="semibold" className="text-brand-deepNavy">
            Assigned Students
          </Typography>
          <TouchableOpacity onPress={viewAllStudents}>
            <Typography variant="body" weight="medium" className="text-brand-brightOrange">
              See All Students
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Summary Information */}
        <View className="bg-brand-lightGray rounded-xl p-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Users size={20} color="#143373" weight="regular" />
              <Typography variant="body" weight="semibold" className="text-brand-deepNavy ml-2">
                Today's Students
              </Typography>
            </View>
            <Typography variant="title-2" weight="bold" className="text-brand-deepNavy">
              8 Students
            </Typography>
          </View>

          <View className="flex-row items-center justify-between">
            <View>
              <Typography variant="caption-1" weight="medium" className="text-brand-deepNavy">
                Date
              </Typography>
              <Typography variant="body" className="text-brand-neutralGray">
                October 15, 2025
              </Typography>
            </View>
            <View className="items-end">
              <Typography variant="caption-1" weight="medium" className="text-brand-deepNavy">
                Total Distance
              </Typography>
              <Typography variant="body" className="text-brand-neutralGray">
                12.5 km
              </Typography>
            </View>
          </View>
        </View>
      </View>

      {/* Today's Schedule */}
      <View className="bg-white mx-6 mt-4 rounded-xl p-4 shadow-sm">
        <Typography variant="headline" weight="semibold" className="text-brand-deepNavy mb-4">
          Today's Schedule
        </Typography>

        <View className="space-y-3">
          <View className="flex-row items-center justify-between p-3 bg-brand-lightGray rounded-lg">
            <View className="flex-row items-center">
              <ClockIcon size={20} color="#143373" weight="regular" />
              <View className="ml-3">
                <Typography variant="body" weight="semibold" className="text-brand-deepNavy">
                  7:30 AM - Pickup
                </Typography>
                <Typography variant="caption-1" className="text-brand-neutralGray">
                  Maharagama Junction → Royal College
                </Typography>
              </View>
            </View>
            <View className={`px-2 py-1 rounded-full ${tripStarted ? 'bg-success' : 'bg-brand-neutralGray'}`}>
              <Typography variant="caption-1" weight="medium" className="text-white">
                {tripStarted ? 'Active' : 'Pending'}
              </Typography>
            </View>
          </View>

          <View className="flex-row items-center justify-between p-3 bg-white border border-brand-lightGray rounded-lg">
            <View className="flex-row items-center">
              <ClockIcon size={20} color="#6b7280" weight="regular" />
              <View className="ml-3">
                <Typography variant="body" weight="semibold" className="text-brand-deepNavy">
                  2:30 PM - Drop-off
                </Typography>
                <Typography variant="caption-1" className="text-brand-neutralGray">
                  Royal College → Maharagama Junction
                </Typography>
              </View>
            </View>
            <View className="bg-brand-neutralGray px-2 py-1 rounded-full">
              <Typography variant="caption-1" weight="medium" className="text-white">
                Pending
              </Typography>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="bg-white mx-6 mt-4 rounded-xl p-4 shadow-sm">
        <Typography variant="headline" weight="semibold" className="text-brand-deepNavy mb-4">
          Quick Actions
        </Typography>

        <View className="flex-row gap-3">
          <TouchableOpacity className="flex-1 bg-brand-brightOrange p-4 rounded-xl items-center">
            <Megaphone size={24} color="#ffffff" weight="regular" />
            <Typography variant="caption-1" weight="medium" className="text-white mt-2">
              Inform
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 bg-white border border-brand-brightOrange p-4 rounded-xl items-center">
            <ChatCircle size={24} color="#fdc334" weight="regular" />
            <Typography variant="caption-1" weight="medium" className="text-brand-brightOrange mt-2">
              Message
            </Typography>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Spacing */}
      <View className="h-6" />
    </ScrollView>
  );
}
