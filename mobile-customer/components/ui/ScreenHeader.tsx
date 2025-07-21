import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'phosphor-react-native';
import { Typography } from '@/components/Typography';
import { useRouter } from 'expo-router';

interface ScreenHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  showBackButton = true,
  onBackPress
}) => {
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View className="bg-gray-100 rounded-lg mx-4 mt-2 mb-4 px-4 py-3 flex-row items-center">
      {showBackButton && (
        <TouchableOpacity
          onPress={handleBackPress}
          className="mr-3"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color="#000000" weight="regular" />
        </TouchableOpacity>
      )}
      <Typography variant="headline" className="flex-1 text-center font-bold text-black">
        {title}
      </Typography>
    </View>
  );
}; 