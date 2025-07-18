import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface ImagePickerFieldProps {
  label: string;
  value?: string;
  onImageSelect: (uri: string) => void;
  required?: boolean;
  className?: string;
}

export function ImagePickerField({ 
  label, 
  value, 
  onImageSelect, 
  required = false,
  className = '' 
}: ImagePickerFieldProps) {
  const handlePress = () => {
    // For now, we'll just show an alert. In a real app, you'd use expo-image-picker
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        { text: 'Camera', onPress: () => handleImagePicker('camera') },
        { text: 'Gallery', onPress: () => handleImagePicker('gallery') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleImagePicker = (source: 'camera' | 'gallery') => {
    // Mock image URL for demo purposes
    const mockImageUrl = `https://example.com/${source}-image.jpg`;
    onImageSelect(mockImageUrl);
  };

  return (
    <View className={`mb-4 ${className}`}>
      <Text 
        className="text-sm font-medium text-gray-700 mb-2"
        style={{ fontFamily: 'Figtree-Medium' }}
      >
        {label} {required && <Text className="text-red-500">*</Text>}
      </Text>
      
      <TouchableOpacity
        onPress={handlePress}
        className="border-2 border-dashed border-gray-300 rounded-lg h-32 items-center justify-center bg-gray-50"
        style={{ borderColor: '#D1D5DB' }}
      >
        <View className="items-center">
          <View 
            className="w-12 h-12 rounded-full items-center justify-center mb-2"
            style={{ backgroundColor: Colors.tabIconSelected }}
          >
            <Ionicons name="camera" size={24} color="white" />
          </View>
          <Text 
            className="text-sm text-gray-600"
            style={{ fontFamily: 'Figtree-Regular' }}
          >
            {value ? 'Change Image' : 'Add Image'}
          </Text>
          {value && (
            <Text 
              className="text-xs text-green-600 mt-1"
              style={{ fontFamily: 'Figtree-Regular' }}
            >
              Image selected
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}
