import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { NavigationArrow, MapPin, MagnifyingGlass, Car } from 'phosphor-react-native';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/ui/Card';
import { customerLocationService, DriverLocation, RideStatus } from '@/lib/services/customer-location.service';
import { assignedRideApi, AssignedRideResponse } from '@/lib/api/assigned-ride.api';
import { useProfileStore } from '@/lib/stores/profile.store';

// Default location (Colombo, Sri Lanka)
const DEFAULT_REGION = {
  latitude: 6.9271,
  longitude: 79.8612,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function NavigateScreen() {
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef<MapView>(null);
  
  // Driver tracking state
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [isTrackingDriver, setIsTrackingDriver] = useState(false);
  const [assignedRide, setAssignedRide] = useState<AssignedRideResponse | null>(null);
  const [rideStatus, setRideStatus] = useState<'WAITING' | 'ACTIVE' | 'COMPLETED'>('WAITING');
  
  const { activeProfile } = useProfileStore();

  // Request location permission and get current location on mount
  useEffect(() => {
    getCurrentLocation();
    
    // Cleanup on unmount
    return () => {
      customerLocationService.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Check for assigned ride when active profile changes
  useEffect(() => {
    if (activeProfile) {
      checkForAssignedRide();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfile]);
  
  // Check for assigned ride and start tracking if available
  const checkForAssignedRide = async () => {
    try {
      if (!activeProfile) {
        console.log('📍 No active profile selected');
        return;
      }
      
      console.log('📍 Active profile:', JSON.stringify(activeProfile, null, 2));
      
      let ride: AssignedRideResponse | null = null;
      
      if (activeProfile.type === 'child') {
        // Extract child ID from profile
        // Profile has both 'id' (e.g., "child-14") and 'child_id' (e.g., 14)
        let childId: number;
        
        // First, try to use child_id if it exists (direct numeric ID)
        if ((activeProfile as any).child_id) {
          childId = (activeProfile as any).child_id;
          console.log('📍 Using child_id:', childId);
        } 
        // Otherwise, try to extract number from id string (e.g., "child-14" -> 14)
        else if (activeProfile.id) {
          const idMatch = activeProfile.id.match(/\d+/);
          if (idMatch) {
            childId = parseInt(idMatch[0], 10);
            console.log('📍 Extracted child ID from string:', childId);
          } else {
            console.warn('⚠️ Could not extract numeric ID from:', activeProfile.id);
            return;
          }
        } else {
          console.warn('⚠️ Child profile has no ID');
          return;
        }
        
        if (isNaN(childId)) {
          console.warn('⚠️ Invalid child ID (not a number):', childId);
          return;
        }
        
        console.log('📡 Checking for assigned ride for child ID:', childId);
        ride = await assignedRideApi.getAssignedChildRide(childId);
      } else if (activeProfile.type === 'staff') {
        console.log('📡 Checking for assigned ride for staff');
        ride = await assignedRideApi.getAssignedStaffRide();
      }
      
      if (ride) {
        console.log('✅ Found assigned ride:', ride);
        setAssignedRide(ride);
        await startDriverTracking(ride.driverId.toString());
      } else {
        console.log('ℹ️ No assigned ride found');
      }
    } catch (error: any) {
      console.error('❌ Error checking for assigned ride:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      
      // Don't show error to user if there's just no assigned ride (404)
      // or validation error (likely means profile setup incomplete)
      if (error.response?.status !== 404 && error.response?.status !== 400) {
        // Only show error for unexpected server issues
        console.warn('⚠️ Unexpected error checking for assigned ride');
      }
    }
  };
  
  // Start tracking driver location
  const startDriverTracking = async (routeId: string) => {
    try {
      // Connect to WebSocket server
      await customerLocationService.connect({
        onLocationUpdate: (location) => {
          console.log('📍 Driver location received:', location);
          setDriverLocation(location);
          
          // Auto-zoom to show both user and driver
          if (userLocation) {
            animateToShowBothLocations(
              {
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
              },
              {
                latitude: location.latitude,
                longitude: location.longitude,
              }
            );
          }
        },
        onRideStarted: (status) => {
          console.log('🚗 Ride started:', status);
          setRideStatus('ACTIVE');
          Alert.alert('Ride Started', 'Your driver has started the ride. You can now track their location.');
        },
        onRideEnded: (status) => {
          console.log('🛑 Ride ended:', status);
          setRideStatus('COMPLETED');
          setDriverLocation(null);
          Alert.alert('Ride Completed', 'Your driver has completed the ride.');
        },
        onError: (error) => {
          console.error('❌ Tracking error:', error);
        },
      });
      
      // Subscribe to route updates
      const customerId = activeProfile?.id?.toString() || 'customer';
      const result = await customerLocationService.subscribeToRoute(routeId, customerId);
      
      if (result.success) {
        setIsTrackingDriver(true);
        if (result.isRideActive) {
          setRideStatus('ACTIVE');
        }
        console.log('✅ Started tracking driver');
      }
    } catch (error) {
      console.error('Error starting driver tracking:', error);
      Alert.alert('Tracking Error', 'Could not connect to driver location tracking.');
    }
  };
  
  // Animate map to show both user and driver locations
  const animateToShowBothLocations = (
    userLoc: { latitude: number; longitude: number },
    driverLoc: { latitude: number; longitude: number }
  ) => {
    const minLat = Math.min(userLoc.latitude, driverLoc.latitude);
    const maxLat = Math.max(userLoc.latitude, driverLoc.latitude);
    const minLng = Math.min(userLoc.longitude, driverLoc.longitude);
    const maxLng = Math.max(userLoc.longitude, driverLoc.longitude);
    
    const midLat = (minLat + maxLat) / 2;
    const midLng = (minLng + maxLng) / 2;
    
    const latDelta = (maxLat - minLat) * 1.5; // Add padding
    const lngDelta = (maxLng - minLng) * 1.5;
    
    mapRef.current?.animateToRegion({
      latitude: midLat,
      longitude: midLng,
      latitudeDelta: Math.max(latDelta, 0.01),
      longitudeDelta: Math.max(lngDelta, 0.01),
    }, 1000);
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to show your position on the map.');
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      setUserLocation(location);
      
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);
      
    } catch (error) {
      console.log('Location error:', error);
      Alert.alert('Error', 'Could not get your current location. Showing default location.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMyLocationPress = () => {
    getCurrentLocation();
  };

  return (
    <SafeAreaView edges={['left','right','bottom']} className="flex-1 bg-white">
      <View className="flex-1">
        {/* Search Button - Floating */}
        <TouchableOpacity 
          className="absolute top-4 right-4 z-10 p-2 bg-white rounded-lg shadow-lg"
          onPress={() => Alert.alert('Search', 'Search functionality will be implemented soon')}
        >
          <MagnifyingGlass size={20} color="#6b7280" />
        </TouchableOpacity>

        {/* Map Container */}
        <View className="flex-1 relative">
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={region}
            onRegionChangeComplete={setRegion}
            showsUserLocation
            showsMyLocationButton={false}
            showsCompass
            showsScale
          >
            {/* Custom marker for user location if available */}
            {userLocation && (
              <Marker
                coordinate={{
                  latitude: userLocation.coords.latitude,
                  longitude: userLocation.coords.longitude,
                }}
                title="Your Location"
                description="You are here"
              >
                <View className="w-8 h-8 rounded-full bg-white items-center justify-center shadow-lg">
                  <MapPin size={24} color="#4285f4" weight="fill" />
                </View>
              </Marker>
            )}
            
            {/* Driver location marker */}
            {driverLocation && (
              <Marker
                coordinate={{
                  latitude: driverLocation.latitude,
                  longitude: driverLocation.longitude,
                }}
                title={assignedRide?.driver?.name || "Driver"}
                description="Your driver's location"
                rotation={driverLocation.heading || 0}
              >
                <View className="w-10 h-10 rounded-full bg-green-500 items-center justify-center shadow-lg border-2 border-white">
                  <Car size={24} color="#ffffff" weight="fill" />
                </View>
              </Marker>
            )}
            
            {/* Draw line between user and driver */}
            {userLocation && driverLocation && (
              <Polyline
                coordinates={[
                  {
                    latitude: userLocation.coords.latitude,
                    longitude: userLocation.coords.longitude,
                  },
                  {
                    latitude: driverLocation.latitude,
                    longitude: driverLocation.longitude,
                  },
                ]}
                strokeColor="#4285f4"
                strokeWidth={3}
                lineDashPattern={[10, 5]}
              />
            )}
          </MapView>

          {/* My Location Button */}
          <TouchableOpacity 
            className="absolute bottom-[100px] right-4 w-12 h-12 rounded-full bg-white items-center justify-center shadow-lg"
            onPress={handleMyLocationPress}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#4285f4" />
            ) : (
              <NavigationArrow size={20} color="#4285f4" weight="fill" />
            )}
          </TouchableOpacity>
        </View>

        {/* Bottom Info Card */}
        <Card className="mx-4 mb-4 p-4">
          {isTrackingDriver && assignedRide ? (
            <View>
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 rounded-full bg-green-50 items-center justify-center">
                    <Car size={20} color="#10b981" />
                  </View>
                  <View className="flex-1 ml-3">
                    <Typography variant="subhead" weight="medium" className="text-gray-900">
                      {rideStatus === 'ACTIVE' ? 'Driver on the way' : 'Waiting for driver'}
                    </Typography>
                    <Typography variant="caption-1" className="text-gray-600 mt-1">
                      {assignedRide.driver.name} • {assignedRide.vehicle?.brand} {assignedRide.vehicle?.model}
                    </Typography>
                  </View>
                </View>
                {rideStatus === 'ACTIVE' && (
                  <View className="flex-row items-center">
                    <View className="w-2 h-2 rounded-full bg-green-500 mr-1" />
                    <Typography variant="caption-2" className="text-green-600">
                      Live
                    </Typography>
                  </View>
                )}
              </View>
              {driverLocation && userLocation && (
                <View className="bg-gray-50 rounded-lg p-2">
                  <Typography variant="caption-1" className="text-gray-600 text-center">
                    Tracking driver location in real-time
                  </Typography>
                </View>
              )}
            </View>
          ) : (
            <View>
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center">
                  <MapPin size={20} color="#4285f4" />
                </View>
                <View className="flex-1 ml-3">
                  <Typography variant="subhead" weight="medium" className="text-gray-900">
                    Ready to Navigate
                  </Typography>
                  <Typography variant="caption-1" className="text-gray-600 mt-1">
                    {activeProfile 
                      ? 'When your driver starts their ride, you will see their live location here.'
                      : 'Select a profile to see driver tracking.'}
                  </Typography>
                </View>
              </View>
              {activeProfile && (
                <TouchableOpacity 
                  onPress={checkForAssignedRide}
                  className="mt-3 bg-blue-50 rounded-lg p-2"
                >
                  <Typography variant="caption-1" className="text-blue-600 text-center">
                    Tap to check for assigned driver
                  </Typography>
                </TouchableOpacity>
              )}
            </View>
          )}
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

