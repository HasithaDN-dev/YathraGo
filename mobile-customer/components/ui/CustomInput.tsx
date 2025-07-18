import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface CustomInputProps extends TextInputProps {
  label: string;
  required?: boolean;
  error?: string;
}

export function CustomInput({ 
  label, 
  required = false, 
  error, 
  className = '',
  ...props 
}: CustomInputProps) {
  return (
    <View className="mb-4">
      <Text 
        className="text-sm font-medium text-gray-700 mb-2"
        style={{ fontFamily: 'Figtree-Medium' }}
      >
        {label} {required && <Text className="text-red-500">*</Text>}
      </Text>
      <TextInput
        className={`border border-gray-300 rounded-lg px-4 py-3 text-base bg-white ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        style={{ 
          fontFamily: 'Figtree-Regular',
          fontSize: 16,
          color: '#000000'
        }}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {error && (
        <Text 
          className="text-red-500 text-sm mt-1"
          style={{ fontFamily: 'Figtree-Regular' }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}
