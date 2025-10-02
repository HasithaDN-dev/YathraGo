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

// Get Google Maps API key from environment
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

// Default location (Colombo, Sri Lanka)
const DEFAULT_REGION: MapRegion = {
  latitude: 6.9271,
  longitude: 79.8612,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// Cache for storing recent search results (in-memory cache)
interface SearchCache {
  [key: string]: {
    results: GooglePlace[];
    timestamp: number;
  };
}

const searchCache: SearchCache = {};
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes cache

// Rate limiting to prevent excessive API calls
let lastApiCallTime = 0;
const MIN_API_CALL_INTERVAL = 1000; // Minimum 1 second between API calls

// Helper function to enhance query with Sri Lankan context
const enhanceQueryForSriLanka = (query: string): string => {
  const queryLower = query.toLowerCase().trim();
  
  // Common abbreviations and local terms
  const localEnhancements: { [key: string]: string } = {
    'uni': 'university',
    'univ': 'university',
    'temple': 'temple sri lanka',
    'hospital': 'hospital sri lanka',
    'station': 'railway station sri lanka',
    'airport': 'airport sri lanka',
    'beach': 'beach sri lanka',
    'park': 'park sri lanka'
  };
  
  for (const [abbrev, full] of Object.entries(localEnhancements)) {
    if (queryLower.includes(abbrev)) {
      return queryLower.replace(abbrev, full);
    }
  }
  
  return query;
};

// Helper function to check and manage cache
const getCachedResults = (query: string): GooglePlace[] | null => {
  const cacheKey = query.toLowerCase().trim();
  const cached = searchCache[cacheKey];
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`Cache hit for: "${query}"`);
    return cached.results;
  }
  
  return null;
};

const setCachedResults = (query: string, results: GooglePlace[]): void => {
  const cacheKey = query.toLowerCase().trim();
  searchCache[cacheKey] = {
    results,
    timestamp: Date.now(),
  };
  
  // Clean old cache entries (keep cache size manageable)
  const now = Date.now();
  Object.keys(searchCache).forEach(key => {
    if (now - searchCache[key].timestamp > CACHE_DURATION) {
      delete searchCache[key];
    }
  });
};

// Google Places API search function with multiple fallback strategies
const searchGooglePlaces = async (query: string): Promise<GooglePlace[]> => {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key not found. Please check your .env configuration.');
    return [];
  }

  // Check cache first
  const cachedResults = getCachedResults(query);
  if (cachedResults) {
    return cachedResults;
  }

  try {
    // Strategy 1: Try exact query first (country restricted)
    let results = await searchWithStrategy(query, 'exact');
    if (results.length > 0) {
      setCachedResults(query, results);
      return results;
    }

    // Strategy 2: Try with major city context for better local results
    const queryLower = query.toLowerCase();
    const hasCityContext = queryLower.includes('colombo') || queryLower.includes('kandy') || 
                          queryLower.includes('galle') || queryLower.includes('jaffna') || 
                          queryLower.includes('negombo') || queryLower.includes('matara');
    
    if (!hasCityContext) {
      results = await searchWithStrategy(`${query} Colombo`, 'with_city');
      if (results.length > 0) {
        setCachedResults(query, results);
        return results;
      }
    }

    // Strategy 3: Try broader search within Sri Lanka
    results = await searchWithStrategy(query, 'broad');
    if (results.length > 0) {
      setCachedResults(query, results);
      return results;
    }

    // Strategy 5: Fallback to popular Sri Lankan locations
    results = getPopularSriLankanLocations(query);
    if (results.length > 0) {
      console.log(`Fallback search found ${results.length} popular locations`);
      // Cache fallback results too
      setCachedResults(query, results);
      return results;
    }

    console.log('No results found for any search strategy:', query);
    // Cache empty results to avoid repeated API calls for same failed query
    setCachedResults(query, []);
    return [];
  } catch (error) {
    console.error('Places API request failed:', error);
    throw error;
  }
};

// Individual search strategy implementation using New Places API
const searchWithStrategy = async (query: string, strategy: string): Promise<GooglePlace[]> => {
  // Rate limiting: ensure minimum interval between API calls
  const now = Date.now();
  if (now - lastApiCallTime < MIN_API_CALL_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_API_CALL_INTERVAL - (now - lastApiCallTime)));
  }
  lastApiCallTime = Date.now();
  
  try {
    // Enhance query with Sri Lankan context for better results
    const enhancedQuery = enhanceQueryForSriLanka(query);
    
    // Use New Places API Text Search with locationRestriction
    const requestBody: any = {
      textQuery: enhancedQuery,
      maxResultCount: 15,
      regionCode: 'LK', // Sri Lanka region code
      languageCode: 'en'
    };

    // Add location restriction with strategy-based boundaries within Sri Lanka
    if (strategy === 'exact') {
      // Focus on Colombo metropolitan area for exact matches
      requestBody.locationRestriction = {
        rectangle: {
          low: {
            latitude: 6.7500,   // South of Colombo metro
            longitude: 79.7000  // West of Colombo metro
          },
          high: {
            latitude: 7.1500,   // North of Colombo metro
            longitude: 80.1000  // East of Colombo metro
          }
        }
      };
    } else if (strategy === 'with_city') {
      // Focus on Western Province for city context searches
      requestBody.locationRestriction = {
        rectangle: {
          low: {
            latitude: 6.4000,   // Southern Western Province
            longitude: 79.6000  // Western boundary
          },
          high: {
            latitude: 7.4000,   // Northern Western Province  
            longitude: 80.2000  // Eastern boundary
          }
        }
      };
    } else if (strategy === 'broad') {
      // Cover entire Sri Lanka for broad searches
      requestBody.locationRestriction = {
        rectangle: {
          low: {
            latitude: 5.9167,   // Southern boundary of Sri Lanka
            longitude: 79.6523  // Western boundary of Sri Lanka
          },
          high: {
            latitude: 9.8312,   // Northern boundary of Sri Lanka  
            longitude: 81.8812  // Eastern boundary of Sri Lanka
          }
        }
      };
    }

    console.log(`Trying ${strategy} search for: "${enhancedQuery}" (original: "${query}") - New API with Sri Lanka restriction`);
    
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key not found');
    }
    
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (data.places && data.places.length > 0) {
      console.log(`${strategy} search found ${data.places.length} results - New API`);
      return data.places.map((place: any): GooglePlace => ({
        place_id: place.id,
        formatted_address: place.formattedAddress || place.shortFormattedAddress || 'Address not available',
        name: place.displayName?.text || 'Unknown place',
        geometry: {
          location: {
            lat: place.location?.latitude || 0,
            lng: place.location?.longitude || 0,
          },
        },
        types: place.types || [],
        vicinity: extractVicinity(place.formattedAddress || place.shortFormattedAddress || ''),
      }));
    } else {
      console.log(`${strategy} search - No results from New API:`, data.error || 'No places found');
      return [];
    }
  } catch (error) {
    console.log(`${strategy} search failed (New API):`, error);
    return [];
  }
};

// Helper function to extract vicinity from formatted address
const extractVicinity = (formattedAddress: string): string => {
  const parts = formattedAddress.split(',');
  return parts.length > 1 ? parts[1].trim() : parts[0].trim();
};

// Expanded popular locations to reduce API dependency
const getPopularSriLankanLocations = (query: string): GooglePlace[] => {
  const popularPlaces: GooglePlace[] = [
    // Universities & Education
    {
      place_id: 'popular_1',
      formatted_address: 'University of Colombo, College House, Colombo 00300, Sri Lanka',
      name: 'University of Colombo',
      geometry: { location: { lat: 6.9022, lng: 79.8607 } },
      types: ['university', 'establishment'],
      vicinity: 'Cinnamon Gardens'
    },
    {
      place_id: 'popular_9',
      formatted_address: 'University of Peradeniya, Peradeniya 20400, Sri Lanka',
      name: 'University of Peradeniya',
      geometry: { location: { lat: 7.2572, lng: 80.5970 } },
      types: ['university', 'establishment'],
      vicinity: 'Peradeniya'
    },
    {
      place_id: 'popular_10',
      formatted_address: 'University of Moratuwa, Bandaranayake Mawatha, Moratuwa 10400, Sri Lanka',
      name: 'University of Moratuwa',
      geometry: { location: { lat: 6.7956, lng: 79.9006 } },
      types: ['university', 'establishment'],
      vicinity: 'Moratuwa'
    },
    // Major Cities & Areas
    {
      place_id: 'popular_4',
      formatted_address: 'Kandy City Centre, Kandy 20000, Sri Lanka',
      name: 'Kandy City Centre',
      geometry: { location: { lat: 7.2906, lng: 80.6337 } },
      types: ['locality', 'political'],
      vicinity: 'Kandy'
    },
    {
      place_id: 'popular_11',
      formatted_address: 'Negombo, Sri Lanka',
      name: 'Negombo',
      geometry: { location: { lat: 7.2084, lng: 79.8358 } },
      types: ['locality', 'political'],
      vicinity: 'Negombo'
    },
    {
      place_id: 'popular_12',
      formatted_address: 'Anuradhapura, Sri Lanka',
      name: 'Anuradhapura',
      geometry: { location: { lat: 8.3114, lng: 80.4037 } },
      types: ['locality', 'political'],
      vicinity: 'Anuradhapura'
    },
    {
      place_id: 'popular_13',
      formatted_address: 'Trincomalee, Sri Lanka',
      name: 'Trincomalee',
      geometry: { location: { lat: 8.5874, lng: 81.2152 } },
      types: ['locality', 'political'],
      vicinity: 'Trincomalee'
    },
    // Tourist Attractions
    {
      place_id: 'popular_2',
      formatted_address: 'Galle Face Green, Colombo 00300, Sri Lanka',
      name: 'Galle Face Green',
      geometry: { location: { lat: 6.9218, lng: 79.8438 } },
      types: ['park', 'tourist_attraction'],
      vicinity: 'Colombo 03'
    },
    {
      place_id: 'popular_3',
      formatted_address: 'Independence Memorial Hall, Independence Avenue, Colombo 00700, Sri Lanka',
      name: 'Independence Memorial Hall',
      geometry: { location: { lat: 6.9034, lng: 79.8684 } },
      types: ['tourist_attraction', 'establishment'],
      vicinity: 'Cinnamon Gardens'
    },
    {
      place_id: 'popular_5',
      formatted_address: 'Temple of the Sacred Tooth Relic, Sri Dalada Veediya, Kandy 20000, Sri Lanka',
      name: 'Temple of the Sacred Tooth Relic',
      geometry: { location: { lat: 7.2940, lng: 80.6414 } },
      types: ['hindu_temple', 'tourist_attraction'],
      vicinity: 'Kandy'
    },
    {
      place_id: 'popular_6',
      formatted_address: 'Galle Fort, Galle 80000, Sri Lanka',
      name: 'Galle Fort',
      geometry: { location: { lat: 6.0367, lng: 80.2179 } },
      types: ['tourist_attraction', 'establishment'],
      vicinity: 'Galle'
    },
    // Transportation Hubs
    {
      place_id: 'popular_7',
      formatted_address: 'Colombo Fort Railway Station, Olcott Mawatha, Colombo 01000, Sri Lanka',
      name: 'Colombo Fort Railway Station',
      geometry: { location: { lat: 6.9344, lng: 79.8428 } },
      types: ['transit_station', 'establishment'],
      vicinity: 'Fort'
    },
    {
      place_id: 'popular_8',
      formatted_address: 'Bandaranaike International Airport, Katunayake 11400, Sri Lanka',
      name: 'Bandaranaike International Airport',
      geometry: { location: { lat: 7.1808, lng: 79.8841 } },
      types: ['airport', 'establishment'],
      vicinity: 'Katunayake'
    },
    {
      place_id: 'popular_14',
      formatted_address: 'Kandy Railway Station, Station Road, Kandy 20000, Sri Lanka',
      name: 'Kandy Railway Station',
      geometry: { location: { lat: 7.2935, lng: 80.6350 } },
      types: ['transit_station', 'establishment'],
      vicinity: 'Kandy'
    },
    // Popular Colombo Areas
    {
      place_id: 'popular_15',
      formatted_address: 'Rajagiriya, Sri Lanka',
      name: 'Rajagiriya',
      geometry: { location: { lat: 6.9068, lng: 79.8912 } },
      types: ['sublocality', 'political'],
      vicinity: 'Rajagiriya'
    },
    {
      place_id: 'popular_16',
      formatted_address: 'Maharagama, Sri Lanka',
      name: 'Maharagama',
      geometry: { location: { lat: 6.8482, lng: 79.9267 } },
      types: ['sublocality', 'political'],
      vicinity: 'Maharagama'
    },
    {
      place_id: 'popular_17',
      formatted_address: 'Nugegoda, Sri Lanka',
      name: 'Nugegoda',
      geometry: { location: { lat: 6.8649, lng: 79.8997 } },
      types: ['sublocality', 'political'],
      vicinity: 'Nugegoda'
    },
    // Additional major Sri Lankan cities and locations
    {
      place_id: 'popular_18',
      formatted_address: 'Matara, Sri Lanka',
      name: 'Matara',
      geometry: { location: { lat: 5.9549, lng: 80.5550 } },
      types: ['locality', 'political'],
      vicinity: 'Matara'
    },
    {
      place_id: 'popular_19',
      formatted_address: 'Jaffna, Sri Lanka',
      name: 'Jaffna',
      geometry: { location: { lat: 9.6615, lng: 80.0255 } },
      types: ['locality', 'political'],
      vicinity: 'Jaffna'
    },
    {
      place_id: 'popular_20',
      formatted_address: 'Batticaloa, Sri Lanka',
      name: 'Batticaloa',
      geometry: { location: { lat: 7.7172, lng: 81.6747 } },
      types: ['locality', 'political'],
      vicinity: 'Batticaloa'
    },
    {
      place_id: 'popular_21',
      formatted_address: 'Kurunegala, Sri Lanka',
      name: 'Kurunegala',
      geometry: { location: { lat: 7.4818, lng: 80.3609 } },
      types: ['locality', 'political'],
      vicinity: 'Kurunegala'
    },
    {
      place_id: 'popular_22',
      formatted_address: 'Ratnapura, Sri Lanka',
      name: 'Ratnapura',
      geometry: { location: { lat: 6.6828, lng: 80.4126 } },
      types: ['locality', 'political'],
      vicinity: 'Ratnapura'
    },
    {
      place_id: 'popular_23',
      formatted_address: 'Badulla, Sri Lanka',
      name: 'Badulla',
      geometry: { location: { lat: 6.9934, lng: 81.0550 } },
      types: ['locality', 'political'],
      vicinity: 'Badulla'
    },
    {
      place_id: 'popular_24',
      formatted_address: 'Kegalle, Sri Lanka',
      name: 'Kegalle',
      geometry: { location: { lat: 7.2513, lng: 80.3464 } },
      types: ['locality', 'political'],
      vicinity: 'Kegalle'
    },
    {
      place_id: 'popular_25',
      formatted_address: 'Matale, Sri Lanka',
      name: 'Matale',
      geometry: { location: { lat: 7.4675, lng: 80.6234 } },
      types: ['locality', 'political'],
      vicinity: 'Matale'
    }
  ];

  const queryLower = query.toLowerCase();
  return popularPlaces.filter(place => 
    place.name.toLowerCase().includes(queryLower) ||
    place.vicinity?.toLowerCase().includes(queryLower) ||
    place.formatted_address.toLowerCase().includes(queryLower)
  );
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
  const [userAddress, setUserAddress] = useState('');
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
        setUserAddress(initialLocation.address);
      } else {
        // Reset to search step when modal opens for new location
        setCurrentStep('search');
        setSearchQuery('');
        setSearchResults([]);
        setUserAddress('');
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

    // Only search if query is at least 2 characters to reduce API calls
    if (query.trim().length < 2) {
      return;
    }

    searchTimeout.current = setTimeout(() => {
      performSearch(query);
    }, 3000); // Increased from 300ms to 3000ms to reduce API calls
  };

  const performSearch = async (query: string) => {
    try {
      setIsSearching(true);
      
      if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
        // Show fallback message when API key is not configured
        Alert.alert(
          'API Key Required', 
          'Please configure your Google Maps API key in the .env file to enable location search.'
        );
        setSearchResults([]);
        return;
      }

      const results = await searchGooglePlaces(query);
      setSearchResults(results);
      
      // Only show alert for very short queries or obvious typos
      if (results.length === 0 && query.length >= 3) {
        console.log(`No results found for: "${query}"`);
        // Don't show alert, just clear results - user can try different terms
      }
    } catch (error) {
      console.log('Search error:', error);
      // Only show error alert for network issues, not for no results
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!errorMessage.includes('ZERO_RESULTS') && !errorMessage.includes('No results')) {
        Alert.alert('Search Error', 'Please check your internet connection and try again.');
      }
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };



  const handleSearchResultSelect = (place: GooglePlace) => {
    const newRegion: MapRegion = {
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    
    setRegion(newRegion);
    setCurrentStep('map');
    
    // Set initial location data
    const location: LocationDetails = {
      name: place.name,
      address: place.formatted_address,
      coordinates: {
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
      },
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
          
          // Update selected location
          setSelectedLocation({
            name: address.name || 'Selected Location',
            address: fullAddress,
            coordinates: {
              latitude: newRegion.latitude,
              longitude: newRegion.longitude,
            },
          });
        }
      } catch (error) {
        console.log('Reverse geocoding error:', error);
        const fallbackAddress = `${newRegion.latitude.toFixed(6)}, ${newRegion.longitude.toFixed(6)}`;
        
        setSelectedLocation({
          name: 'Selected Location',
          address: fallbackAddress,
          coordinates: {
            latitude: newRegion.latitude,
            longitude: newRegion.longitude,
          },
        });
      }
    }, 2000); // Increased from 1000ms to 2000ms to reduce reverse geocoding calls
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
      // Pre-fill the address field with selected address
      if (!userAddress) {
        setUserAddress(selectedLocation.address);
      }
    } else {
      Alert.alert('Error', 'Please select a location on the map');
    }
  };

  const handleFinalConfirm = () => {
    if (selectedLocation && userAddress.trim()) {
      const finalLocation: LocationDetails = {
        ...selectedLocation,
        address: userAddress, // Use typed address as primary address
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
      <View style={styles.searchResultMeta}>
        {item.types.includes('locality') && (
          <Text style={styles.searchResultType}>City</Text>
        )}
        {item.types.includes('establishment') && (
          <Text style={styles.searchResultType}>Place</Text>
        )}
        {item.types.includes('route') && (
          <Text style={styles.searchResultType}>Road</Text>
        )}
      </View>
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
                  {selectedLocation?.address || 'Getting address...'}
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
              {selectedLocation?.address}
            </Typography>
          </View>
        </View>

        {/* Address Input */}
        <View style={styles.addressInputContainer}>
          <Typography variant="subhead" weight="medium" style={styles.addressLabel}>
            Address
          </Typography>
          <TextInput
            value={userAddress}
            onChangeText={setUserAddress}
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
            { backgroundColor: userAddress.trim() ? '#4285f4' : '#ccc' }
          ]}
          disabled={!userAddress.trim()}
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
  searchResultMeta: {
    alignItems: 'flex-end',
  },
  searchResultType: {
    color: '#4285f4',
    fontSize: 10,
    fontWeight: '500',
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
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
