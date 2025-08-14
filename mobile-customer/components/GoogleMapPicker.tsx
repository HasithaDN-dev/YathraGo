import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Modal,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MagnifyingGlass, MapPin, House, NavigationArrow } from 'phosphor-react-native';
import { Typography } from './Typography';
import { LocationDetails, LocationPickerProps, MapRegion, GooglePlace } from '../types/location.types';
import * as Location from 'expo-location';

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
  const [currentStep, setCurrentStep] = useState<'search' | 'map' | 'address'>('search');
  const [region, setRegion] = useState<MapRegion>(DEFAULT_REGION);
  const [selectedLocation, setSelectedLocation] = useState<LocationDetails | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GooglePlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userTypedAddress, setUserTypedAddress] = useState('');
  const [mapSelectedAddress, setMapSelectedAddress] = useState('');
  const mapRef = useRef<MapView>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const requestLocationPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        getCurrentLocation();
      }
    } catch (error) {
      console.log('Location permission error:', error);
    }
  }, []);

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
    } catch (error) {
      console.log('Get current location error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      // If there's already a selected location, go to map step instead of search
      if (initialLocation && (initialLocation.coordinates.latitude !== DEFAULT_REGION.latitude || 
          initialLocation.coordinates.longitude !== DEFAULT_REGION.longitude)) {
        setCurrentStep('map');
        const newRegion: MapRegion = {
          latitude: initialLocation.coordinates.latitude,
          longitude: initialLocation.coordinates.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setRegion(newRegion);
        setSelectedLocation(initialLocation);
        setUserTypedAddress(initialLocation.userTypedAddress || initialLocation.address);
        setMapSelectedAddress(initialLocation.mapSelectedAddress || initialLocation.address);
      } else {
        // Reset to search step when modal opens for new location
        setCurrentStep('search');
        setSearchQuery('');
        setSearchResults([]);
        setUserTypedAddress('');
        setMapSelectedAddress('');
        requestLocationPermission();
      }
    }
  }, [isVisible, initialLocation, requestLocationPermission]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (query.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    searchTimeout.current = setTimeout(() => {
      performSearch(query);
    }, 300);
  };

  const performSearch = async (query: string) => {
    try {
      setIsSearching(true);
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
        geometry: { location: { lat: 6.9147, lng: 79.8437 } },
        types: ['route'],
        vicinity: 'Colombo 03'
      },
      {
        place_id: '2',
        formatted_address: 'Independence Square, Colombo 07, Sri Lanka',
        name: 'Independence Square',
        geometry: { location: { lat: 6.9034, lng: 79.8684 } },
        types: ['tourist_attraction'],
        vicinity: 'Colombo 07'
      },
      {
        place_id: '3',
        formatted_address: 'Maradana Station, Colombo 10, Sri Lanka',
        name: 'Maradana Railway Station',
        geometry: { location: { lat: 6.9298, lng: 79.8737 } },
        types: ['transit_station'],
        vicinity: 'Colombo 10'
      },
      {
        place_id: '4',
        formatted_address: 'Rajagiriya, Sri Lanka',
        name: 'Rajagiriya Junction',
        geometry: { location: { lat: 6.9068, lng: 79.8912 } },
        types: ['sublocality'],
        vicinity: 'Rajagiriya'
      },
      {
        place_id: '5',
        formatted_address: 'Maharagama, Sri Lanka',
        name: 'Maharagama Junction',
        geometry: { location: { lat: 6.8482, lng: 79.9267 } },
        types: ['sublocality'],
        vicinity: 'Maharagama'
      },
      {
        place_id: '6',
        formatted_address: 'Piliyandala, Sri Lanka',
        name: 'Piliyandala',
        geometry: { location: { lat: 6.8013, lng: 79.9219 } },
        types: ['locality'],
        vicinity: 'Piliyandala'
      },
      {
        place_id: '7',
        formatted_address: 'Nugegoda, Sri Lanka',
        name: 'Nugegoda',
        geometry: { location: { lat: 6.8649, lng: 79.8997 } },
        types: ['locality'],
        vicinity: 'Nugegoda'
      },
      {
        place_id: '8',
        formatted_address: 'Kottawa, Sri Lanka',
        name: 'Kottawa',
        geometry: { location: { lat: 6.8147, lng: 79.9733 } },
        types: ['locality'],
        vicinity: 'Kottawa'
      },
      {
        place_id: '9',
        formatted_address: 'Bambalapitiya, Colombo 04, Sri Lanka',
        name: 'Bambalapitiya',
        geometry: { location: { lat: 6.8851, lng: 79.8577 } },
        types: ['sublocality'],
        vicinity: 'Colombo 04'
      },
      {
        place_id: '10',
        formatted_address: 'Wellawatta, Colombo 06, Sri Lanka',
        name: 'Wellawatta',
        geometry: { location: { lat: 6.8776, lng: 79.8615 } },
        types: ['sublocality'],
        vicinity: 'Colombo 06'
      }
    ];

    return mockPlaces.filter(place => 
      place.name.toLowerCase().includes(query.toLowerCase()) ||
      place.formatted_address.toLowerCase().includes(query.toLowerCase()) ||
      (place.vicinity && place.vicinity.toLowerCase().includes(query.toLowerCase()))
    );
  };

  const handleSearchResultSelect = (place: GooglePlace) => {
    const newRegion: MapRegion = {
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    
    setRegion(newRegion);
    setMapSelectedAddress(place.formatted_address);
    setCurrentStep('map');
    
    // Set initial location data
    const location: LocationDetails = {
      name: place.name,
      address: place.formatted_address,
      coordinates: {
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
      },
      placeId: place.place_id,
      mapSelectedAddress: place.formatted_address,
    };
    setSelectedLocation(location);
  };

  const handleMapRegionChange = async (newRegion: MapRegion) => {
    
    // Debounce reverse geocoding
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    searchTimeout.current = setTimeout(async () => {
      try {
        const addresses = await Location.reverseGeocodeAsync({
          latitude: newRegion.latitude,
          longitude: newRegion.longitude,
        });

        if (addresses.length > 0) {
          const address = addresses[0];
          const fullAddress = `${address.name ? address.name + ', ' : ''}${address.street ? address.street + ', ' : ''}${address.city || ''}, ${address.country || ''}`;
          setMapSelectedAddress(fullAddress);
          
          // Update selected location
          setSelectedLocation({
            name: address.name || 'Selected Location',
            address: fullAddress,
            coordinates: {
              latitude: newRegion.latitude,
              longitude: newRegion.longitude,
            },
            mapSelectedAddress: fullAddress,
            userTypedAddress: userTypedAddress,
          });
        }
      } catch (error) {
        console.log('Reverse geocoding error:', error);
        const fallbackAddress = `${newRegion.latitude.toFixed(6)}, ${newRegion.longitude.toFixed(6)}`;
        setMapSelectedAddress(fallbackAddress);
        
        setSelectedLocation({
          name: 'Selected Location',
          address: fallbackAddress,
          coordinates: {
            latitude: newRegion.latitude,
            longitude: newRegion.longitude,
          },
          mapSelectedAddress: fallbackAddress,
          userTypedAddress: userTypedAddress,
        });
      }
    }, 1000);
  };

  const handleSetLocationOnMap = () => {
    setCurrentStep('map');
  };

  const handleCurrentLocationPress = async () => {
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
      setCurrentStep('map');
      mapRef.current?.animateToRegion(newRegion, 1000);
    } catch (error) {
      console.log('Get current location error:', error);
      Alert.alert('Error', 'Could not get your current location');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      setCurrentStep('address');
      // Pre-fill the address field with map-selected address
      if (!userTypedAddress) {
        setUserTypedAddress(mapSelectedAddress);
      }
    } else {
      Alert.alert('Error', 'Please select a location on the map');
    }
  };

  const handleFinalConfirm = () => {
    if (selectedLocation && userTypedAddress.trim()) {
      const finalLocation: LocationDetails = {
        ...selectedLocation,
        address: userTypedAddress, // Use typed address as primary address
        userTypedAddress: userTypedAddress,
        mapSelectedAddress: mapSelectedAddress,
      };
      onLocationSelect(finalLocation);
      onClose();
    } else {
      Alert.alert('Error', 'Please enter a complete address');
    }
  };

  const renderSearchResult = ({ item }: { item: GooglePlace }) => (
    <TouchableOpacity
      onPress={() => handleSearchResultSelect(item)}
      style={styles.searchResultItem}
    >
      <View style={styles.searchResultIcon}>
        <MapPin size={20} color="#6b7280" />
      </View>
      <View style={styles.searchResultContent}>
        <Typography variant="subhead" weight="medium" style={styles.searchResultName}>
          {item.name}
        </Typography>
        <Typography variant="caption-1" style={styles.searchResultAddress}>
          {item.formatted_address}
        </Typography>
        {item.vicinity && (
          <Typography variant="caption-2" style={styles.searchResultVicinity}>
            {item.vicinity}
          </Typography>
        )}
      </View>
      <Text style={styles.searchResultDistance}>100 m</Text>
    </TouchableOpacity>
  );

  // Search Step
  if (currentStep === 'search') {
    return (
      <Modal visible={isVisible} animationType="slide" presentationStyle="fullScreen">
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <ArrowLeft size={24} color="#000" />
            </TouchableOpacity>
            <Typography variant="title-2" weight="semibold" style={styles.headerTitle}>
              {title}
            </Typography>
          </View>

          {/* Current Location Option */}
          <TouchableOpacity 
            onPress={handleCurrentLocationPress}
            style={styles.currentLocationButton}
            disabled={isLoading}
          >
            <View style={styles.currentLocationIcon}>
              <House size={20} color="#4285f4" />
            </View>
            <Typography variant="subhead" style={styles.currentLocationText}>
              Choose Current Location
            </Typography>
            {isLoading && <ActivityIndicator size="small" color="#4285f4" />}
          </TouchableOpacity>

          {/* Set Location on Map Option */}
          <TouchableOpacity 
            onPress={handleSetLocationOnMap}
            style={styles.currentLocationButton}
          >
            <View style={styles.currentLocationIcon}>
              <MapPin size={20} color="#4285f4" />
            </View>
            <Typography variant="subhead" style={styles.currentLocationText}>
              Set location on map
            </Typography>
          </TouchableOpacity>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <MagnifyingGlass size={20} color="#6b7280" />
              <TextInput
                placeholder={placeholder}
                value={searchQuery}
                onChangeText={handleSearch}
                style={styles.searchInput}
                autoFocus
              />
              {isSearching && <ActivityIndicator size="small" color="#6b7280" />}
            </View>
          </View>

          {/* Search Results */}
          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={(item) => item.place_id}
            style={styles.searchResults}
            showsVerticalScrollIndicator={false}
          />
        </SafeAreaView>
      </Modal>
    );
  }

  // Map Step
  if (currentStep === 'map') {
    return (
      <Modal visible={isVisible} animationType="slide" presentationStyle="fullScreen">
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={region}
            onRegionChangeComplete={handleMapRegionChange}
            showsUserLocation
            showsMyLocationButton={false}
          />
          
          {/* Center Pin */}
          <View style={styles.centerMarker}>
            <MapPin size={40} color="#FF0000" weight="fill" />
          </View>

          {/* Current Location Button */}
          <TouchableOpacity 
            style={styles.currentLocationMapButton}
            onPress={handleCurrentLocationPress}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#4285f4" />
            ) : (
              <NavigationArrow size={20} color="#4285f4" weight="fill" />
            )}
          </TouchableOpacity>

          {/* Header */}
          <SafeAreaView style={styles.mapHeader}>
            <View style={styles.mapHeaderContent}>
              <TouchableOpacity onPress={() => setCurrentStep('search')} style={styles.backButton}>
                <ArrowLeft size={24} color="#000" />
              </TouchableOpacity>
              <Typography variant="title-2" weight="semibold" style={styles.headerTitle}>
                {title}
              </Typography>
            </View>
          </SafeAreaView>

          {/* Location Info Card */}
          <View style={styles.locationCard}>
            <View style={styles.locationCardContent}>
              <View style={styles.locationIcon}>
                <MapPin size={20} color="#4285f4" />
              </View>
              <View style={styles.locationInfo}>
                <Typography variant="subhead" weight="semibold" style={styles.locationName}>
                  {selectedLocation?.name || 'Selected Location'}
                </Typography>
                <Typography variant="caption-1" style={styles.locationAddress} numberOfLines={2}>
                  {mapSelectedAddress || 'Getting address...'}
                </Typography>
              </View>
            </View>
            
            <TouchableOpacity
              onPress={handleConfirmLocation}
              style={styles.confirmButton}
              disabled={!selectedLocation}
            >
              <Typography variant="subhead" weight="semibold" style={styles.confirmButtonText}>
                CONFIRM LOCATION
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // Address Input Step
  return (
    <Modal visible={isVisible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setCurrentStep('map')} style={styles.backButton}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Typography variant="title-2" weight="semibold" style={styles.headerTitle}>
            Confirm your location
          </Typography>
        </View>

        {/* Selected Location Display */}
        <View style={styles.selectedLocationCard}>
          <View style={styles.selectedLocationIcon}>
            <MapPin size={24} color="#4285f4" />
          </View>
          <View style={styles.selectedLocationInfo}>
            <Typography variant="subhead" weight="semibold" style={styles.selectedLocationName}>
              {selectedLocation?.name || 'Selected Location'}
            </Typography>
            <Typography variant="caption-1" style={styles.selectedLocationCoords}>
              {mapSelectedAddress}
            </Typography>
          </View>
        </View>

        {/* Address Input */}
        <View style={styles.addressInputContainer}>
          <Typography variant="subhead" weight="medium" style={styles.addressLabel}>
            Address
          </Typography>
          <TextInput
            value={userTypedAddress}
            onChangeText={setUserTypedAddress}
            placeholder="House No, Street, City"
            style={styles.addressInput}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Confirm Button */}
        <TouchableOpacity
          onPress={handleFinalConfirm}
          style={[
            styles.finalConfirmButton,
            { backgroundColor: userTypedAddress.trim() ? '#4285f4' : '#ccc' }
          ]}
          disabled={!userTypedAddress.trim()}
        >
          <Typography variant="subhead" weight="semibold" style={styles.finalConfirmButtonText}>
            CONFIRM ADDRESS
          </Typography>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    color: '#000',
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  currentLocationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  currentLocationText: {
    flex: 1,
    color: '#000',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#000',
  },
  searchResults: {
    flex: 1,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  searchResultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultName: {
    color: '#000',
    marginBottom: 4,
  },
  searchResultAddress: {
    color: '#6b7280',
    marginBottom: 2,
  },
  searchResultVicinity: {
    color: '#9ca3af',
  },
  searchResultDistance: {
    color: '#6b7280',
    fontSize: 12,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  centerMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -40,
    zIndex: 1,
  },
  currentLocationMapButton: {
    position: 'absolute',
    bottom: 180,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 2,
  },
  mapHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    zIndex: 2,
  },
  mapHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  locationCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  locationCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    color: '#000',
    marginBottom: 4,
  },
  locationAddress: {
    color: '#6b7280',
  },
  confirmButton: {
    backgroundColor: '#4285f4',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
  },
  selectedLocationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    marginHorizontal: 16,
    marginVertical: 16,
    padding: 16,
    borderRadius: 12,
  },
  selectedLocationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  selectedLocationInfo: {
    flex: 1,
  },
  selectedLocationName: {
    color: '#000',
    marginBottom: 4,
  },
  selectedLocationCoords: {
    color: '#6b7280',
  },
  addressInputContainer: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  addressLabel: {
    color: '#000',
    marginBottom: 8,
  },
  addressInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
    minHeight: 80,
  },
  finalConfirmButton: {
    marginHorizontal: 16,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  finalConfirmButtonText: {
    color: '#fff',
  },
});
