import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Typography } from './Typography';

interface ProfileLoadingProps {
  message?: string;
}

export function ProfileLoading({ message = 'Loading profiles...' }: ProfileLoadingProps) {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#143373" />
      <Typography variant="body" className="mt-4 text-brand-neutralGray">
        {message}
      </Typography>
    </View>
  );
} 