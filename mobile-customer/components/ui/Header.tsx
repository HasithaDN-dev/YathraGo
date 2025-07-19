import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { CaretDown } from 'phosphor-react-native';
import { Typography } from '@/components/Typography';

interface HeaderProps {
  profileName: string;
  fullName: string;
  onProfilePress?: () => void;
  onRefreshPress?: () => void;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  profileName,
  fullName,
  onProfilePress,
  onRefreshPress,
  className = ''
}) => {
  return (
    <View className={`bg-white rounded-2xl p-4 mx-4 mt-4 mb-6 ${className}`}>
      <View className="flex-row items-center justify-between">
        <TouchableOpacity 
          className="flex-row items-center flex-1"
          onPress={onProfilePress}
          activeOpacity={0.8}
        >
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
        </TouchableOpacity>
        
        {/* Logo Icon (acts as refresh) */}
        <TouchableOpacity 
          className="w-15 h-15 bg-brand-deepNavy rounded-full items-center justify-center"
          onPress={onRefreshPress}
          activeOpacity={0.8}
        >
          <Image
            source={require('../../assets/images/logo.png')}
            style={{ width: 30, height: 30, resizeMode: 'contain' }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}; 