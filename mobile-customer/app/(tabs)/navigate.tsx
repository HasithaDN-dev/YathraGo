import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { NavigationArrow, MapPin, MagnifyingGlass } from 'phosphor-react-native';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/ui/Card';

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

  // Request location permission and get current location
  useEffect(() => {
    getCurrentLocation();
  }, []);

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
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center">
              <MapPin size={20} color="#4285f4" />
            </View>
            <View className="flex-1 ml-3">
              <Typography variant="subhead" weight="medium" className="text-gray-900">
                Ready to Navigate
              </Typography>
              <Typography variant="caption-1" className="text-gray-600 mt-1">
                Tap the search button to find destinations or use the map to explore
              </Typography>
            </View>
          </View>
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

