import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Modal,
  Text,
  TouchableOpacity,
  Dimensions,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, MagnifyingGlass, MapPin, CheckCircle } from 'phosphor-react-native';
import { Typography } from './Typography';
import { LocationDetails, LocationPickerProps, MapRegion, GooglePlace } from '../types/location.types';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

// Default location (Colombo, Sri Lanka)
const DEFAULT_REGION: MapRegion = {
  latitude: 6.9271,
  longitude: 79.8612,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export const GoogleMapPicker: React.FC<LocationPickerProps> = ({
  initialLocation,
  onLocationSelect,
  title = 'Select Location',
  placeholder = 'Search for a location',
  isVisible,
  onClose,
}) => {
  const [region, setRegion] = useState<MapRegion>(DEFAULT_REGION);
  const [selectedLocation, setSelectedLocation] = useState<LocationDetails | null>(initialLocation || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GooglePlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef<MapView>(null);
  const searchTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isVisible) {
      requestLocationPermission();
      if (initialLocation) {
        const newRegion: MapRegion = {
          latitude: initialLocation.coordinates.latitude,
          longitude: initialLocation.coordinates.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setRegion(newRegion);
        setSelectedLocation(initialLocation);
      }
    }
  }, [isVisible, initialLocation]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        getCurrentLocation();
      }
    } catch (error) {
      console.log('Location permission error:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const location = await Location.getCurrentPositionAsync({});
      const newRegion: MapRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);
    } catch (error) {
      console.log('Get current location error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowSearchResults(true);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (query.trim().length === 0) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    searchTimeout.current = setTimeout(() => {
      performSearch(query);
    }, 500);
  };

  const performSearch = async (query: string) => {
    try {
      setIsSearching(true);
      // In a real implementation, you would use Google Places API
      // For now, we'll use a mock search that suggests some common Sri Lankan locations
      const mockResults = mockSearchResults(query);
      setSearchResults(mockResults);
    } catch (error) {
      console.log('Search error:', error);
      Alert.alert('Error', 'Failed to search locations');
    } finally {
      setIsSearching(false);
    }
  };

  const mockSearchResults = (query: string): GooglePlace[] => {
    const mockPlaces: GooglePlace[] = [
      {
        place_id: '1',
        formatted_address: 'Galle Road, Colombo 03, Sri Lanka',
        name: 'Galle Road',
        geometry: { location: { lat: 6.9147, lng: 79.8437 } }
      },
      {
        place_id: '2',
        formatted_address: 'Independence Square, Colombo 07, Sri Lanka',
        name: 'Independence Square',
        geometry: { location: { lat: 6.9034, lng: 79.8684 } }
      },
      {
        place_id: '3',
        formatted_address: 'Maradana Station, Colombo 10, Sri Lanka',
        name: 'Maradana Railway Station',
        geometry: { location: { lat: 6.9298, lng: 79.8737 } }
      },
      {
        place_id: '4',
        formatted_address: 'Rajagiriya, Sri Lanka',
        name: 'Rajagiriya Junction',
        geometry: { location: { lat: 6.9068, lng: 79.8912 } }
      },
      {
        place_id: '5',
        formatted_address: 'Maharagama, Sri Lanka',
        name: 'Maharagama Junction',
        geometry: { location: { lat: 6.8482, lng: 79.9267 } }
      }
    ];

    return mockPlaces.filter(place => 
      place.name.toLowerCase().includes(query.toLowerCase()) ||
      place.formatted_address.toLowerCase().includes(query.toLowerCase())
    );
  };

  const handleMapPress = async (event: any) => {
    const { coordinate } = event.nativeEvent;
    
    try {
      // Reverse geocoding to get address from coordinates
      const addresses = await Location.reverseGeocodeAsync({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
      });

      if (addresses.length > 0) {
        const address = addresses[0];
        const fullAddress = `${address.name ? address.name + ', ' : ''}${address.street ? address.street + ', ' : ''}${address.city || ''}, ${address.country || ''}`;
        
        const location: LocationDetails = {
          name: address.name || 'Selected Location',
          address: fullAddress,
          coordinates: {
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
          },
        };

        setSelectedLocation(location);
      }
    } catch (error) {
      console.log('Reverse geocoding error:', error);
      // Fallback to coordinates-based location
      const location: LocationDetails = {
        name: 'Selected Location',
        address: `${coordinate.latitude.toFixed(6)}, ${coordinate.longitude.toFixed(6)}`,
        coordinates: {
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
        },
      };
      setSelectedLocation(location);
    }
  };

  const handleSearchResultSelect = (place: GooglePlace) => {
    const location: LocationDetails = {
      name: place.name,
      address: place.formatted_address,
      coordinates: {
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
      },
      placeId: place.place_id,
    };

    setSelectedLocation(location);
    setSearchQuery(place.name);
    setShowSearchResults(false);

    // Animate map to selected location
    const newRegion: MapRegion = {
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 1000);
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
      onClose();
    } else {
      Alert.alert('Error', 'Please select a location first');
    }
  };

  const renderSearchResult = ({ item }: { item: GooglePlace }) => (
    <TouchableOpacity
      onPress={() => handleSearchResultSelect(item)}
      className="p-4 border-b border-gray-100 flex-row items-center"
    >
      <MapPin size={20} color="#6b7280" className="mr-3" />
      <View className="flex-1">
        <Typography variant="subhead" weight="medium" className="text-gray-900">
          {item.name}
        </Typography>
        <Typography variant="caption-1" className="text-gray-500 mt-1">
          {item.formatted_address}
        </Typography>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal visible={isVisible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="bg-white px-4 py-3 border-b border-gray-100">
          <View className="flex-row items-center justify-between">
            <Typography variant="title-1" weight="semibold" className="text-gray-900">
              {title}
            </Typography>
            <TouchableOpacity onPress={onClose} className="p-2">
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View className="bg-white px-4 py-3 border-b border-gray-100">
          <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
            <MagnifyingGlass size={20} color="#6b7280" className="mr-2" />
            <TextInput
              placeholder={placeholder}
              value={searchQuery}
              onChangeText={handleSearch}
              className="flex-1 text-base"
              style={{ fontFamily: 'System' }}
            />
            {isSearching && <ActivityIndicator size="small" color="#6b7280" />}
          </View>
        </View>

        {/* Map or Search Results */}
        <View className="flex-1 relative">
          {showSearchResults && searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.place_id}
              className="bg-white"
            />
          ) : (
            <>
              <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={{ flex: 1 }}
                region={region}
                onPress={handleMapPress}
                showsUserLocation
                showsMyLocationButton
              >
                {selectedLocation && (
                  <Marker
                    coordinate={selectedLocation.coordinates}
                    title={selectedLocation.name}
                    description={selectedLocation.address}
                  />
                )}
              </MapView>
              
              {/* Loading overlay */}
              {isLoading && (
                <View className="absolute inset-0 bg-black bg-opacity-20 items-center justify-center">
                  <View className="bg-white rounded-lg p-4 items-center">
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Typography variant="body" className="mt-2">
                      Getting your location...
                    </Typography>
                  </View>
                </View>
              )}
            </>
          )}
        </View>

        {/* Selected Location Info */}
        {selectedLocation && !showSearchResults && (
          <View className="bg-white border-t border-gray-100 p-4">
            <View className="flex-row items-start">
              <MapPin size={20} color="#3b82f6" className="mr-3 mt-1" />
              <View className="flex-1">
                <Typography variant="subhead" weight="semibold" className="text-gray-900">
                  {selectedLocation.name}
                </Typography>
                <Typography variant="caption-1" className="text-gray-500 mt-1">
                  {selectedLocation.address}
                </Typography>
              </View>
              <CheckCircle size={20} color="#10b981" />
            </View>
          </View>
        )}

        {/* Confirm Button */}
        <View className="bg-white px-4 pb-4 border-t border-gray-100">
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={!selectedLocation}
            className={`py-4 px-6 rounded-lg items-center ${
              selectedLocation ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <Typography 
              variant="subhead" 
              weight="semibold" 
              className={selectedLocation ? 'text-white' : 'text-gray-500'}
            >
              Confirm Location
            </Typography>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};
