import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { CaretDown, ArrowsClockwise } from 'phosphor-react-native';
import { Typography } from '@/components/Typography';

interface ProfileCardProps {
  profileName: string;
  fullName: string;
  onPress?: () => void;
  className?: string;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profileName,
  fullName,
  onPress,
  className = ''
}) => {
  return (
    <TouchableOpacity 
      className={`bg-white rounded-2xl p-4 flex-row items-center justify-between ${className}`}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View className="flex-row items-center flex-1">
        {/* Profile Icon */}
        <View className="w-12 h-12 bg-brand-brightOrange rounded-full items-center justify-center mr-3">
          <View className="w-6 h-6 bg-brand-lightNavy rounded-full" />
        </View>
        
        {/* Profile Info */}
        <View className="flex-1">
          <View className="flex-row items-center">
            <Typography variant="subhead" weight="semibold" className="text-black mr-2">
              {profileName}
            </Typography>
            <CaretDown size={16} color="#6b7280" weight="bold" />
          </View>
          <Typography variant="footnote" className="text-brand-neutralGray">
            {fullName}
          </Typography>
        </View>
      </View>
      
      {/* Swirl Icon */}
      <View className="w-8 h-8 bg-brand-deepNavy rounded-full items-center justify-center">
        <ArrowsClockwise size={20} color="#ffffff" weight="fill" />
      </View>
    </TouchableOpacity>
  );
}; 