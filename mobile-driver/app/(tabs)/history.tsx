import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Calendar,
} from 'phosphor-react-native';
import { getDriverTripHistory, Trip } from '../../lib/api/trip.api';

// Group trips by date
interface GroupedTrips {
  [date: string]: Trip[];
}

// Format time to 12-hour format
const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

// Format date to readable format
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Check if date is today
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  
  // Check if date is yesterday
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  
  // Otherwise return formatted date
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

// Get full date for header
const getFullDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

// Format duration
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0 && mins > 0) {
    return `${hours} hr ${mins} m`;
  } else if (hours > 0) {
    return `${hours} hr`;
  } else {
    return `${mins} m`;
  }
};

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
  const [trips, setTrips] = useState<Trip[]>([]);
  const [groupedTrips, setGroupedTrips] = useState<GroupedTrips>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentHeaderDate, setCurrentHeaderDate] = useState<string>('');
  const scrollViewRef = useRef<ScrollView>(null);
  const dateHeaderRefs = useRef<{ [key: string]: number }>({});
  
//   // HARDCODED FOR TESTING - Using driver ID 1
//   const driverId = 2;

  // Fetch trip history using authenticated session
  const fetchTripHistory = async () => {
    try {
      setError(null);
      const response = await getDriverTripHistory();
      setTrips(response.trips);
      
      // Group trips by date
      const grouped = response.trips.reduce((acc: GroupedTrips, trip) => {
        const dateKey = new Date(trip.date).toDateString();
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(trip);
        return acc;
      }, {});
      
      setGroupedTrips(grouped);
      
      // Set initial header date
      if (response.trips.length > 0) {
        setCurrentHeaderDate(formatDate(response.trips[0].date));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load trip history');
      console.error('Error loading trip history:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTripHistory();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTripHistory();
  };

  // Handle scroll to update header date
  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    
    // Find which date section we're currently viewing
    const dates = Object.keys(dateHeaderRefs.current).sort((a, b) => {
      return dateHeaderRefs.current[a] - dateHeaderRefs.current[b];
    });
    
    for (let i = dates.length - 1; i >= 0; i--) {
      const dateKey = dates[i];
      const yPosition = dateHeaderRefs.current[dateKey];
      
      if (scrollY >= yPosition - 100) {
        const newHeaderDate = formatDate(new Date(dateKey).toISOString());
        if (newHeaderDate !== currentHeaderDate) {
          setCurrentHeaderDate(newHeaderDate);
        }
        break;
      }
    }
  };

  const renderTripItem = (trip: Trip, index: number) => (
    <View key={trip.tripId} className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
      {/* Time Section */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-xl font-bold text-gray-800">
          {formatTime(trip.startTime)}
        </Text>
        <View className="flex-row items-center flex-1 mx-4">
          <View className="h-px flex-1 bg-gray-300" />
          <View className="bg-blue-100 px-3 py-1 rounded-full mx-2">
            <Text className="text-xs text-blue-700 font-medium">
              {formatDuration(trip.duration)}
            </Text>
          </View>
          <View className="h-px flex-1 bg-gray-300" />
        </View>
        <Text className="text-xl font-bold text-gray-800">
          {formatTime(trip.endTime)}
        </Text>
      </View>

      {/* Location Section */}
      <View className="space-y-3">
        <View className="flex-row items-start">
          <View className="mt-1">
            <MapPin size={18} color="#10B981" weight="fill" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-xs text-gray-500 mb-1">Pick Up</Text>
            <Text className="text-sm text-gray-800 font-medium">
              {trip.pickUp}
            </Text>
          </View>
        </View>

        <View className="flex-row items-start">
          <View className="mt-1">
            <MapPin size={18} color="#EF4444" weight="fill" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-xs text-gray-500 mb-1">Drop Off</Text>
            <Text className="text-sm text-gray-800 font-medium">
              {trip.dropOff}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderDateSection = (dateKey: string, tripsForDate: Trip[]) => (
    <View
      key={dateKey}
      onLayout={(event) => {
        const layout = event.nativeEvent.layout;
        dateHeaderRefs.current[dateKey] = layout.y;
      }}
    >
      {/* Date Header */}
      <View className="flex-row items-center mb-4 mt-2">
        <View className="h-px flex-1 bg-gray-300" />
        <Text className="text-sm font-semibold text-gray-600 px-4">
          {formatDate(new Date(dateKey).toISOString())}
        </Text>
        <View className="h-px flex-1 bg-gray-300" />
      </View>
      
      {/* Trips for this date */}
      {tripsForDate.map((trip, index) => renderTripItem(trip, index))}
    </View>
  );

  // Render loading state
  if (loading) {
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
              <Text className="text-gray-300 text-sm">Loading...</Text>
            </View>
            <View className="w-10" />
          </View>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1E3A8A" />
          <Text className="text-gray-500 mt-4">Loading trip history...</Text>
        </View>
      </View>
    );
  }

  // Render error state
  if (error) {
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
              <Text className="text-gray-300 text-sm">Error</Text>
            </View>
            <View className="w-10" />
          </View>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-500 text-center text-lg font-semibold mb-2">
            {error}
          </Text>
          <TouchableOpacity
            onPress={fetchTripHistory}
            className="bg-blue-600 px-6 py-3 rounded-lg mt-4"
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Render empty state
  if (trips.length === 0) {
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
              <Text className="text-gray-300 text-sm">No trips yet</Text>
            </View>
            <View className="w-10" />
          </View>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <Calendar size={64} color="#9CA3AF" weight="light" />
          <Text className="text-gray-500 text-center text-lg mt-4">
            No trips found
          </Text>
          <Text className="text-gray-400 text-center mt-2">
            Your completed trips will appear here
          </Text>
          <TouchableOpacity
            onPress={onRefresh}
            className="bg-blue-600 px-6 py-3 rounded-lg mt-6"
          >
            <Text className="text-white font-semibold">Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F0F2F5]">
      <StatusBar style="light" />
      {/* Header with dynamic date */}
      <View className="bg-[#1E3A8A] pt-12 pb-6 px-4 rounded-b-3xl">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-white text-xl font-bold">Trip History</Text>
            <Text className="text-gray-300 text-sm">{currentHeaderDate}</Text>
          </View>
          <View className="w-10" />
        </View>
      </View>

      {/* Trip List */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4 py-4"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#1E3A8A"
            colors={['#1E3A8A']}
          />
        }
      >
        {Object.keys(groupedTrips)
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
          .map((dateKey) => renderDateSection(dateKey, groupedTrips[dateKey]))}
        
        {/* Bottom padding */}
        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
