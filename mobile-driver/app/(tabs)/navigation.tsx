import React, { useEffect, useState, useRef } from 'react';
import { View, Alert, Linking } from 'react-native';
import { Typography } from '@/components/Typography';
import CustomButton from '@/components/ui/CustomButton';
import * as Location from 'expo-location';
import { getTodayRoute, markAttendance, RouteWaypoint, TodayRoute } from '@/lib/api/navigation.api';

// Temporary hardcoded driver ID - replace with actual auth context
const DRIVER_ID = 2;

export default function NavigationScreen() {
  const [routeData, setRouteData] = useState<TodayRoute | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [state, setState] = useState<'idle'|'enroute'|'arrived'|'completed'>('idle');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const locationInterval = useRef<NodeJS.Timeout | null>(null);
  const arrivalThreshold = 0.1; // in km, 100m

  // Fetch today's route from backend
  useEffect(() => {
    const fetchRoute = async () => {
      try {
        setLoading(true);
        setError(null);
        const route = await getTodayRoute(DRIVER_ID);
        
        if (route && route.waypoints.length > 0) {
          setRouteData(route);
          // Find the first incomplete waypoint
          const firstIncomplete = route.waypoints.findIndex(w => !w.isCompleted);
          setCurrentIdx(firstIncomplete >= 0 ? firstIncomplete : 0);
          setState('enroute');
        } else {
          setError('No route assigned for today');
          setState('idle');
        }
      } catch (err) {
        setError('Failed to load route');
        console.error('Error fetching route:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
    return () => {
      if (locationInterval.current) {
        clearInterval(locationInterval.current);
      }
    };
  }, []);

  const advance = () => {
    if (!routeData) return;
    
    if (currentIdx + 1 < routeData.waypoints.length) {
      setCurrentIdx(currentIdx + 1);
      setState('enroute');
    } else {
      setState('completed');
      if (locationInterval.current) {
        clearInterval(locationInterval.current);
      }
    }
  };

  const openInGoogleMaps = async () => {
    if (!routeData) return;
    
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission not granted', 'Enable location to start navigation.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const current = loc.coords;
      const waypoint = routeData.waypoints[currentIdx];
      
      const dest = `${waypoint.lat},${waypoint.lng}`;
      const url = `https://www.google.com/maps/dir/?api=1&origin=${current.latitude},${current.longitude}&destination=${dest}&travelmode=driving`;
      
      setState('enroute');
      Linking.openURL(url);
      startBackgroundArrivalDetection(waypoint);
    } catch {
      Alert.alert('Failed to open Google Maps / get location');
    }
  };

  const startBackgroundArrivalDetection = (waypoint: RouteWaypoint) => {
    if (locationInterval.current) {
      clearInterval(locationInterval.current);
    }
    
    locationInterval.current = setInterval(async () => {
      try {
        const loc = await Location.getCurrentPositionAsync({});
        const dist = calcDistance(
          loc.coords.latitude, 
          loc.coords.longitude, 
          waypoint.lat, 
          waypoint.lng
        );
        
        if (dist < arrivalThreshold) {
          setState('arrived');
          clearInterval(locationInterval.current!);
        }
      } catch (error) {
        console.error('Error checking location:', error);
      }
    }, 5000);
  };

  function calcDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  const markAttendanceForCurrentStop = async () => {
    if (!routeData) return;
    
    const waypoint = routeData.waypoints[currentIdx];
    
    try {
      // Get current location for attendance record
      const loc = await Location.getCurrentPositionAsync({});
      
      const success = await markAttendance({
        driverId: DRIVER_ID,
        childId: waypoint.childId,
        waypointId: waypoint.waypointId,
        type: waypoint.type.toLowerCase() as 'pickup' | 'dropoff',
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        tripId: routeData.routeId,
      });

      if (success) {
        Alert.alert('Success', 'Attendance marked successfully!');
        advance();
      } else {
        Alert.alert('Error', 'Failed to mark attendance. Please try again.');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      Alert.alert('Error', 'Failed to mark attendance. Please try again.');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Typography variant="body">Loading route...</Typography>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center">
        <Typography variant="body" className="text-red-500">{error}</Typography>
        <CustomButton 
          title="Retry" 
          onPress={() => window.location.reload()} 
          size="medium"
          className="mt-4"
        />
      </View>
    );
  }

  if (state === 'completed') {
    return (
      <View className="flex-1 items-center justify-center">
        <Typography variant="title-2" className="text-green-600">Trip Complete!</Typography>
        <Typography variant="body" className="mt-2 text-center">
          All stops have been completed successfully.
        </Typography>
      </View>
    );
  }

  if (!routeData || !routeData.waypoints.length) {
    return (
      <View className="flex-1 items-center justify-center">
        <Typography variant="body">No assigned children or stops for today.</Typography>
      </View>
    );
  }

  const waypoint = routeData.waypoints[currentIdx];
  const progress = `${currentIdx + 1} of ${routeData.waypoints.length}`;

  return (
    <View className="flex-1 bg-white">
      {/* Header with Progress */}
      <View className="bg-white px-6 pt-10 pb-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <Typography variant="headline" weight="semibold" className="text-brand-deepNavy">
            Next Stop
          </Typography>
          <Typography variant="caption-1" className="text-brand-neutralGray">
            {progress}
          </Typography>
        </View>

        {/* Child Information Card */}
        <View className="bg-brand-lightGray rounded-xl p-4 mb-2">
          <Typography variant="caption-1" className="mb-1">Child</Typography>
          <Typography variant="body" weight="bold">{waypoint.childName}</Typography>
          
          <Typography variant="caption-1" className="mt-2 mb-1">Pickup Location</Typography>
          <Typography variant="body">{waypoint.pickupAddress}</Typography>
          
          <Typography variant="caption-1" className="mt-2 mb-1">School</Typography>
          <Typography variant="body">{waypoint.school}</Typography>
          
          <View className="mt-2 flex-row items-center">
            <Typography variant="caption-1" className="mr-2">Type:</Typography>
            <View className={`px-2 py-1 rounded-full ${
              waypoint.type === 'PICKUP' ? 'bg-blue-100' : 'bg-green-100'
            }`}>
              <Typography variant="caption-1" className={
                waypoint.type === 'PICKUP' ? 'text-blue-800' : 'text-green-800'
              }>
                {waypoint.type}
              </Typography>
            </View>
          </View>
        </View>
      </View>

      {/* Action Button */}
      <View className="flex-1 justify-center items-center">
        {state !== 'arrived' ? (
          <CustomButton 
            title="Open in Google Maps" 
            onPress={openInGoogleMaps} 
            size="large"
          />
        ) : (
          <CustomButton 
            title="Mark Attendance" 
            onPress={markAttendanceForCurrentStop} 
            size="large" 
            bgVariant="success"
          />
        )}
      </View>
    </View>
  );
}