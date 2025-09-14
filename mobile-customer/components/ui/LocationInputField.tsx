import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MapPin, CaretRight } from 'phosphor-react-native';
import { Typography } from '../Typography';
import { LocationDetails } from '../../types/location.types';

interface LocationInputFieldProps {
  label: string;
  placeholder: string;
  value?: LocationDetails | null;
  onPress: () => void;
  required?: boolean;
  error?: string;
}

export const LocationInputField: React.FC<LocationInputFieldProps> = ({
  label,
  placeholder,
  value,
  onPress,
  required = false,
  error,
}) => {
  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-700 mb-2">
        {label} {required && <Text className="text-red-500">*</Text>}
      </Text>
      
      <TouchableOpacity
        onPress={onPress}
        className={`border rounded-lg p-4 flex-row items-center ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
        }`}
      >
        <View className="mr-3">
          <MapPin 
            size={20} 
            color={value ? '#3b82f6' : '#9ca3af'} 
          />
        </View>
        
        <View className="flex-1">
          {value ? (
            <>
              <Typography variant="subhead" weight="medium" className="text-gray-900">
                {value.name}
              </Typography>
              <Typography variant="caption-1" className="text-gray-500 mt-1" numberOfLines={2}>
                {value.address}
              </Typography>
            </>
          ) : (
            <Typography variant="subhead" className="text-gray-500">
              {placeholder}
            </Typography>
          )}
        </View>
        
        <CaretRight size={16} color="#9ca3af" />
      </TouchableOpacity>
      
      {error && (
        <Text className="text-red-500 text-sm mt-1">
          {error}
        </Text>
      )}
    </View>
  );
};
