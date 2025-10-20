import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, ActivityIndicator, ScrollView, TextInput, Modal, Platform } from 'react-native';
import { Typography } from '@/components/Typography';
import CustomButton from '@/components/ui/CustomButton';
import { MapPin, X, CheckCircle, MagnifyingGlass, Clock, CaretDown } from 'phosphor-react-native';
import { API_BASE_URL } from '../config/api';
import { tokenService } from '@/lib/services/token.service';
import DateTimePicker from '@react-native-community/datetimepicker';

interface City {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

interface SetupRouteCardProps {
  onRouteSetupComplete: () => void;
}

type RideType = 'School' | 'Work' | 'Both';

export default function SetupRouteCard({ onRouteSetupComplete }: SetupRouteCardProps) {
  const [selectedCities, setSelectedCities] = useState<City[]>([]);
  const [rideType, setRideType] = useState<RideType>('Both');
  const [startTime, setStartTime] = useState<Date>(new Date(new Date().setHours(7, 0, 0, 0)));
  const [endTime, setEndTime] = useState<Date>(new Date(new Date().setHours(17, 0, 0, 0)));
  const [showRideTypeModal, setShowRideTypeModal] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCitySearch, setShowCitySearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<City[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const searchCities = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/cities?q=${encodeURIComponent(query.trim())}`);
      if (response.ok) {
        const cities = await response.json();
        setSearchResults(cities);
      } else {
        setError('Failed to search cities');
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Error searching cities:', err);
      setError('Failed to search cities');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleAddCity = (city: City) => {
    // Don't add duplicate cities
    if (selectedCities.find(c => c.id === city.id)) {
      return;
    }
    setSelectedCities([...selectedCities, city]);
    setShowCitySearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveCity = (cityId: number) => {
    setSelectedCities(selectedCities.filter(c => c.id !== cityId));
  };

  const formatTimeForBackend = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = '00';
    return `${hours}:${minutes}:${seconds}`;
  };

  const handleSaveRoute = async () => {
    if (selectedCities.length < 2) {
      setError('Please select at least 2 cities (start and destination)');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const authenticatedFetch = tokenService.createAuthenticatedFetch();
      const cityIds = selectedCities.map(city => city.id);
      
      const response = await authenticatedFetch(`${API_BASE_URL}/driver/cities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          cityIds,
          rideType,
          usualStartTime: formatTimeForBackend(startTime),
          usualEndTime: formatTimeForBackend(endTime),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Route saved successfully, notify parent component
          onRouteSetupComplete();
        } else {
          setError(result.message || 'Failed to save route');
        }
      } else {
        setError('Failed to save route. Please try again.');
      }
    } catch (err) {
      console.error('Error saving route:', err);
      setError('Failed to save route. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSearchPress = () => {
    setShowCitySearch(true);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      searchCities(text);
    }, 300);
  };

  return (
    <View className="bg-white mx-6 mt-4 rounded-xl p-4 shadow-sm">
      <View className="mb-4">
        <Typography variant="headline" weight="semibold" className="text-brand-deepNavy mb-2">
          Setup Your Route
        </Typography>
        <Typography variant="caption-1" className="text-brand-neutralGray">
          Add cities in the order you'll travel from start to destination
        </Typography>
      </View>

      {/* Ride Type Selection */}
      <View className="mb-4">
        <Typography variant="body" weight="semibold" className="text-brand-deepNavy mb-2">
          Ride Type
        </Typography>
        <TouchableOpacity
          onPress={() => setShowRideTypeModal(true)}
          className="flex-row items-center justify-between bg-white border border-brand-lightGray rounded-lg p-3"
          activeOpacity={0.7}
        >
          <Typography variant="body" className="text-brand-deepNavy">
            {rideType}
          </Typography>
          <CaretDown size={20} color="#143373" weight="bold" />
        </TouchableOpacity>
      </View>

      {/* Time Slots */}
      <View className="mb-4">
        <Typography variant="body" weight="semibold" className="text-brand-deepNavy mb-2">
          Usual Trip Times
        </Typography>
        <View className="flex-row space-x-3">
          {/* Start Time */}
          <View className="flex-1">
            <Typography variant="caption-1" className="text-brand-neutralGray mb-1">
              Start Time
            </Typography>
            <TouchableOpacity
              onPress={() => setShowStartTimePicker(true)}
              className="flex-row items-center bg-white border border-brand-lightGray rounded-lg p-3"
              activeOpacity={0.7}
            >
              <Clock size={20} color="#143373" weight="regular" />
              <Typography variant="body" className="text-brand-deepNavy ml-2">
                {startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </Typography>
            </TouchableOpacity>
          </View>

          {/* End Time */}
          <View className="flex-1">
            <Typography variant="caption-1" className="text-brand-neutralGray mb-1">
              End Time
            </Typography>
            <TouchableOpacity
              onPress={() => setShowEndTimePicker(true)}
              className="flex-row items-center bg-white border border-brand-lightGray rounded-lg p-3"
              activeOpacity={0.7}
            >
              <Clock size={20} color="#143373" weight="regular" />
              <Typography variant="body" className="text-brand-deepNavy ml-2">
                {endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
        <Typography variant="caption-2" className="text-brand-neutralGray mt-1">
          Morning pickup start and evening dropoff completion times
        </Typography>
      </View>

      {/* Selected Cities List */}
      <View className="mb-4">
        {selectedCities.length > 0 ? (
          <View className="space-y-2">
            {selectedCities.map((city, index) => (
              <View
                key={city.id}
                className="flex-row items-center justify-between bg-brand-lightGray p-3 rounded-lg"
              >
                <View className="flex-row items-center flex-1">
                  <View className="bg-brand-deepNavy w-8 h-8 rounded-full items-center justify-center mr-3">
                    <Typography variant="caption-1" weight="bold" className="text-white">
                      {index + 1}
                    </Typography>
                  </View>
                  <View className="flex-1">
                    <Typography variant="body" weight="semibold" className="text-brand-deepNavy">
                      {city.name}
                    </Typography>
                    <Typography variant="caption-2" className="text-brand-neutralGray">
                      {index === 0 ? 'Starting Point' : index === selectedCities.length - 1 ? 'Destination' : 'Waypoint'}
                    </Typography>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemoveCity(city.id)}
                  className="p-2"
                  activeOpacity={0.7}
                >
                  <X size={20} color="#FF6B35" weight="bold" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View className="bg-brand-lightGray p-4 rounded-lg items-center">
            <MapPin size={32} color="#6b7280" weight="regular" />
            <Typography variant="caption-1" className="text-brand-neutralGray mt-2 text-center">
              No cities added yet. Tap "Add City" to begin.
            </Typography>
          </View>
        )}
      </View>

      {/* Error Message */}
      {error && (
        <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <Typography variant="caption-1" className="text-red-600">
            {error}
          </Typography>
        </View>
      )}

      {/* Add City Button */}
      <View className="mb-3">
        <CustomButton
          title="Search & Add City"
          onPress={handleSearchPress}
          bgVariant="outline"
          textVariant="primary"
          size="medium"
          fullWidth
          IconLeft={MagnifyingGlass}
        />
      </View>

      {/* City Search Interface */}
      {showCitySearch && (
        <View className="mb-4 border border-brand-lightGray rounded-lg overflow-hidden">
          {/* Search Input */}
          <View className="p-3 border-b border-brand-lightGray">
            <View className="flex-row items-center bg-gray-50 rounded-lg px-3 py-2">
              <MagnifyingGlass size={20} color="#6b7280" weight="regular" />
              <TextInput
                className="flex-1 ml-2 text-brand-deepNavy"
                placeholder="Type city name to search..."
                placeholderTextColor="#6b7280"
                value={searchQuery}
                onChangeText={handleSearchChange}
                autoFocus
              />
              <TouchableOpacity
                onPress={() => {
                  setShowCitySearch(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="p-1"
              >
                <X size={20} color="#6b7280" weight="bold" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Results */}
          <View className="max-h-[200px]">
            {searching ? (
              <View className="p-4 items-center">
                <ActivityIndicator size="small" color="#143373" />
                <Typography variant="caption-1" className="text-brand-neutralGray mt-2">
                  Searching cities...
                </Typography>
              </View>
            ) : searchResults.length > 0 ? (
              <ScrollView className="p-2">
                {searchResults.map((city) => {
                  const isSelected = selectedCities.find(c => c.id === city.id);
                  return (
                    <TouchableOpacity
                      key={city.id}
                      onPress={() => handleAddCity(city)}
                      className={`p-3 rounded-lg mb-1 ${isSelected ? 'bg-brand-lightGray opacity-50' : 'bg-white'}`}
                      disabled={!!isSelected}
                      activeOpacity={0.7}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center flex-1">
                          <MapPin size={18} color={isSelected ? '#6b7280' : '#143373'} weight="regular" />
                          <Typography 
                            variant="body" 
                            className={`ml-2 ${isSelected ? 'text-brand-neutralGray' : 'text-brand-deepNavy'}`}
                          >
                            {city.name}
                          </Typography>
                        </View>
                        {isSelected && (
                          <CheckCircle size={18} color="#10b981" weight="fill" />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : searchQuery.length >= 2 ? (
              <View className="p-4 items-center">
                <Typography variant="caption-1" className="text-brand-neutralGray text-center">
                  No cities found for "{searchQuery}"
                </Typography>
                <Typography variant="caption-2" className="text-brand-neutralGray text-center mt-1">
                  Try a different search term
                </Typography>
              </View>
            ) : (
              <View className="p-4 items-center">
                <Typography variant="caption-1" className="text-brand-neutralGray text-center">
                  Type at least 2 characters to search cities
                </Typography>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Save Route Button */}
      <CustomButton
        title="Save Route"
        onPress={handleSaveRoute}
        bgVariant="success"
        size="medium"
        fullWidth
        loading={saving}
        disabled={selectedCities.length < 2 || saving}
        IconLeft={selectedCities.length >= 2 ? CheckCircle : undefined}
      />

      {selectedCities.length < 2 && selectedCities.length > 0 && (
        <Typography variant="caption-2" className="text-brand-neutralGray text-center mt-2">
          Add at least {2 - selectedCities.length} more {2 - selectedCities.length === 1 ? 'city' : 'cities'} to save
        </Typography>
      )}

      {/* Ride Type Modal */}
      <Modal
        visible={showRideTypeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRideTypeModal(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPress={() => setShowRideTypeModal(false)}
        >
          <TouchableOpacity activeOpacity={1} className="bg-white rounded-xl p-4 mx-6 w-[80%]">
            <Typography variant="headline" weight="semibold" className="text-brand-deepNavy mb-4">
              Select Ride Type
            </Typography>
            {(['School', 'Work', 'Both'] as RideType[]).map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => {
                  setRideType(type);
                  setShowRideTypeModal(false);
                }}
                className={`p-4 rounded-lg mb-2 ${rideType === type ? 'bg-brand-deepNavy' : 'bg-brand-lightGray'}`}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-between">
                  <Typography 
                    variant="body" 
                    weight="semibold"
                    className={rideType === type ? 'text-white' : 'text-brand-deepNavy'}
                  >
                    {type}
                  </Typography>
                  {rideType === type && (
                    <CheckCircle size={20} color="#ffffff" weight="fill" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Start Time Picker */}
      {showStartTimePicker && (
        <DateTimePicker
          value={startTime}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_event: any, selectedDate?: Date) => {
            setShowStartTimePicker(Platform.OS === 'ios');
            if (selectedDate) {
              setStartTime(selectedDate);
            }
          }}
        />
      )}

      {/* End Time Picker */}
      {showEndTimePicker && (
        <DateTimePicker
          value={endTime}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_event: any, selectedDate?: Date) => {
            setShowEndTimePicker(Platform.OS === 'ios');
            if (selectedDate) {
              setEndTime(selectedDate);
            }
          }}
        />
      )}
    </View>
  );
}

