
import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { Typography } from '../Typography';

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
      <Typography variant="footnote" className="mb-2 font-medium">
        {label} {required && <Text style={{ color: '#ef4444' }}>*</Text>}
      </Typography>
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
