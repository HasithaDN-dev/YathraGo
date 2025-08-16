import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'phosphor-react-native';
import { Typography } from '@/components/Typography';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';

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
    <View className="rounded-lg mx-4 mt-2 mb-4 px-4 py-3 flex-row items-center" style={{ backgroundColor: Colors.lightGray }}>
      {showBackButton && (
        <TouchableOpacity
          onPress={handleBackPress}
          className="mr-3"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color={Colors.black} weight="regular" />
        </TouchableOpacity>
      )}
      <Typography variant="headline" className="flex-1 text-center font-bold" style={{ color: Colors.black }}>
        {title}
      </Typography>
    </View>
  );
}; 