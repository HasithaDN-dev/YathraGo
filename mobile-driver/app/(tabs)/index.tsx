import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config/api';
import { View, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { Typography } from '@/components/Typography';
import {
  Car, MapPin, Clock, CurrencyDollar, Star, Bell, Play, Pause, CompassIcon, Calendar,
  User, House, Building, CaretDown, ChatCircle, Megaphone, List, CreditCard, FileText,
  CheckCircle, Clock as ClockIcon, Users,
  ToggleLeftIcon
} from 'phosphor-react-native';
import CustomButton from '@/components/ui/CustomButton';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/lib/stores/auth.store';
import { tokenService } from '@/lib/services/token.service';
import { routeCitiesService } from '@/lib/services/route-cities.service';
import SetupRouteCard from '@/components/SetupRouteCard';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isOnline, setIsOnline] = useState(true);
  const [tripStarted, setTripStarted] = useState(false);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [currentTripStatus, setCurrentTripStatus] = useState<'pending' | 'on-the-way' | 'completed'>('pending');
  const [studentCount, setStudentCount] = useState<number>(0);
  const [driverName, setDriverName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasRouteSetup, setHasRouteSetup] = useState<boolean>(false);
  
  // Route cities state
  const [startCity, setStartCity] = useState<string>('Maharagama Junction');
  const [endCity, setEndCity] = useState<string>('Royal College');
  const [etaMinutes, setEtaMinutes] = useState<number | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);

  useEffect(() => {
    fetchDriverData();
  }, []);

  const fetchDriverData = async () => {
    try {
      setLoading(true);
      const authenticatedFetch = tokenService.createAuthenticatedFetch();
      
      // Fetch driver profile using authenticated endpoint
      const profileResponse = await authenticatedFetch(`${API_BASE_URL}/driver/profile`);
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        const profile = profileData.profile;
        setDriverName(profile.name || user?.name || 'Driver');
        setIsOnline(profile.status === 'ACTIVE');
      } else {
        // Fallback to user from store
        setDriverName(user?.name || 'Driver');
        setIsOnline(user?.status === 'ACTIVE');
      }

      // Check if driver has route setup
      const citiesResponse = await authenticatedFetch(`${API_BASE_URL}/driver/cities`);
      if (citiesResponse.ok) {
        const citiesData = await citiesResponse.json();
        setHasRouteSetup(citiesData.hasRoute || false);

        // If route is setup, fetch route cities with ETA
        if (citiesData.hasRoute) {
          const routeData = await routeCitiesService.getRouteCitiesWithETA();
          if (routeData && routeData.success) {
            setStartCity(routeData.startPoint);
            setEndCity(routeData.endPoint);
            setEtaMinutes(routeData.etaMinutes || null);
            setDistanceKm(routeData.distanceKm || null);
          }
        }
      } else {
        setHasRouteSetup(false);
      }

      // Fetch student count
      const studentsResponse = await authenticatedFetch(`${API_BASE_URL}/driver/child-ride-requests`);
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        setStudentCount(studentsData.length || 0);
      }
    } catch (error) {
      console.error('Error fetching driver data:', error);
      // Fallback to data from auth store
      if (user) {
        setDriverName(user.name || 'Driver');
        setIsOnline(user.status === 'ACTIVE');
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDriverData();
    setRefreshing(false);
  };

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
  };

  const startTrip = () => {
    // Navigate to navigation tab where the actual route will be fetched
    router.push('/(tabs)/navigation');
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
    //console.log('Navigating to all students view...');
    router.push('/(tabs)/current-students');
  };

  const handleRouteSetupComplete = () => {
    // Refresh the screen to show the trip card
    setHasRouteSetup(true);
    fetchDriverData();
  };

  return (
    <ScrollView 
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
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
                {driverName || 'Driver'}
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

      {/* Setup Route Card or Current Trip Section */}
      {!hasRouteSetup ? (
        <SetupRouteCard onRouteSetupComplete={handleRouteSetupComplete} />
      ) : (
        <View className="bg-white mx-6 mt-4 rounded-xl p-4 shadow-sm">
        <View className="flex-row items-center justify-between mb-4">
          <Typography variant="headline" weight="semibold" className="text-brand-deepNavy">
            Current Trip
          </Typography>
          {/* <TouchableOpacity>
            <Typography variant="body" weight="medium" className="text-brand-brightOrange">
              See More
            </Typography>
          </TouchableOpacity> */}
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
            <Typography variant="caption-2" className="text-brand-neutralGray text-center" numberOfLines={2}>
              {startCity}
            </Typography>
          </View>

          <View className="flex-1 items-center">
            <View className={`px-3 py-1 rounded-full mb-2 ${currentTripStatus === 'on-the-way' ? 'bg-brand-navyBlue' : 'bg-brand-neutralGray'}`}>
              <Typography variant="caption-1" weight="medium" className="text-white">
                On the Way
              </Typography>
            </View>
            <Typography variant="caption-2" className="text-brand-neutralGray text-center">
              {etaMinutes ? routeCitiesService.formatETA(etaMinutes) : 'Calculating...'}
            </Typography>
            {distanceKm && (
              <Typography variant="caption-2" className="text-brand-neutralGray text-center">
                {distanceKm} km
              </Typography>
            )}
          </View>

          <View className="flex-1 items-center">
            <View className="bg-brand-brightOrange p-2 rounded-full mb-2">
              <Building size={16} color="#ffffff" weight="regular" />
            </View>
            <Typography variant="caption-1" weight="medium" className="text-brand-deepNavy text-center">
              Destination
            </Typography>
            <Typography variant="caption-2" className="text-brand-neutralGray text-center" numberOfLines={2}>
              {endCity}
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
      )}

      {/* Assigned Children Summary Section */}
      {hasRouteSetup && (
      <View className="bg-white mx-6 mt-4 rounded-xl p-4 shadow-sm">
        <View className="flex-row items-center justify-between mb-4">
          <Typography variant="headline" weight="semibold" className="text-brand-deepNavy">
            Assigned Students
          </Typography>
          <TouchableOpacity onPress={viewAllStudents}>
            <Typography variant="subhead" weight="medium" className="text-brand-warmYellow">
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
              {studentCount} Students
            </Typography>
          </View>

          <View className="flex-row items-center justify-between">
            <View>
              <Typography variant="caption-1" weight="medium" className="text-brand-deepNavy">
                Date
              </Typography>
              <Typography variant="body" className="text-brand-neutralGray">
                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </Typography>
            </View>
            <View className="items-end">
              <Typography variant="caption-1" weight="medium" className="text-brand-deepNavy">
                Total Distance
              </Typography>
              <Typography variant="body" className="text-brand-neutralGray">
                {distanceKm ? `${distanceKm} km` : 'Calculating...'}
              </Typography>
            </View>
          </View>
        </View>
        </View>
      )}

      {/* Today's Schedule */}
      {hasRouteSetup && (
      <View className="bg-white mx-6 mt-4 rounded-xl p-4 shadow-sm">
        <Typography variant="headline" weight="semibold" className="text-brand-deepNavy mb-4">
          Today's Schedule
        </Typography>

        <View className="space-y-3">
          <View className="flex-row items-center justify-between p-3 bg-brand-lightGray rounded-lg">
            <View className="flex-row items-center flex-1">
              <ClockIcon size={20} color="#143373" weight="regular" />
              <View className="ml-3 flex-1">
                <Typography variant="body" weight="semibold" className="text-brand-deepNavy">
                  7:30 AM - Pickup
                </Typography>
                <Typography variant="caption-1" className="text-brand-neutralGray" numberOfLines={1}>
                  {startCity} → {endCity}
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
            <View className="flex-row items-center flex-1">
              <ClockIcon size={20} color="#6b7280" weight="regular" />
              <View className="ml-3 flex-1">
                <Typography variant="body" weight="semibold" className="text-brand-deepNavy">
                  2:30 PM - Drop-off
                </Typography>
                <Typography variant="caption-1" className="text-brand-neutralGray" numberOfLines={1}>
                  {endCity} → {startCity}
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
      )}

      {/* Quick Actions */}
      {hasRouteSetup && (
      <View className="bg-white mx-6 mt-4 rounded-xl p-4 shadow-sm">
        <Typography variant="headline" weight="semibold" className="text-brand-deepNavy mb-4">
          Quick Actions
        </Typography>

        <View className="flex-row gap-3 mb-3">
          <TouchableOpacity
            className="flex-1 bg-brand-brightOrange p-4 rounded-xl items-center"
            onPress={() => router.push('../(homeLinks)/inform')}
            activeOpacity={0.8}
          >
            <Megaphone size={24} color="#ffffff" weight="regular" />
            <Typography variant="caption-1" weight="medium" className="text-white mt-2">
              Inform
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-1 bg-white border border-brand-brightOrange p-4 rounded-xl items-center"
            onPress={() => router.push('/(tabs)/chat/chat_list')}
            activeOpacity={0.8}
          >
            <ChatCircle size={24} color="#fdc334" weight="regular" />
            <Typography variant="caption-1" weight="medium" className="text-brand-brightOrange mt-2">
              Message
            </Typography>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          className="bg-brand-deepNavy p-4 rounded-xl items-center"
          onPress={() => router.push('/(tabs)/attendance')}
          activeOpacity={0.8}
        >
          <CheckCircle size={24} color="#ffffff" weight="regular" />
          <Typography variant="caption-1" weight="medium" className="text-white mt-2">
            Mark Attendance
          </Typography>
        </TouchableOpacity>
        </View>
      )}

      {/* Bottom Spacing */}
      <View className="h-6" />
    </ScrollView>
  );
}
