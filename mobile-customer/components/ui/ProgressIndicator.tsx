import React from 'react';
import { View } from 'react-native';
import { Colors } from '../../constants/Colors';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function ProgressIndicator({ 
  currentStep, 
  totalSteps, 
  className = '' 
}: ProgressIndicatorProps) {
  return (
    <View className={`flex-row ${className}`}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <View
          key={index}
          className={`flex-1 h-2 mx-1 rounded-full ${
            index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
          }`}
          style={{
            backgroundColor: index < currentStep ? Colors.tabIconSelected : '#E5E7EB'
          }}
        />
      ))}
    </View>
  );
}
