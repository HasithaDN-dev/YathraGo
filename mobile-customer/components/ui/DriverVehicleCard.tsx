import React from 'react';
import { View, Image } from 'react-native';
import { Star, Truck } from 'phosphor-react-native';
import { Typography } from '@/components/Typography';

interface DriverVehicleCardProps {
  type: 'driver' | 'vehicle';
  name: string;
  subtitle: string;
  rating?: number;
  className?: string;
}

export const DriverVehicleCard: React.FC<DriverVehicleCardProps> = ({
  type,
  name,
  subtitle,
  rating,
  className = ''
}) => {
  return (
    <View className={`bg-brand-deepNavy rounded-2xl p-4 flex-1 ${className}`}> 
      {/* Icon */}
      <View className="w-12 h-12 rounded-full items-center justify-center mb-3 overflow-hidden bg-brand-brightOrange">
        {type === 'driver' ? (
          <Image
            source={require('../../assets/images/profile_Picture.png')}
            style={{ width: 48, height: 48, borderRadius: 24, resizeMode: 'cover' }}
          />
        ) : (
          <Truck size={24} color="#143373" weight="fill" />
        )}
      </View>
      {/* Name */}
      <Typography variant="subhead" weight="semibold" className="text-white mb-1">
        {name}
      </Typography>
      {/* Rating or Vehicle Model */}
      {type === 'driver' && rating ? (
        <View className="flex-row items-center">
          <Star size={16} color="#fdc334" weight="fill" />
          <Typography variant="caption-1" className="text-white ml-1">
            {rating}
          </Typography>
        </View>
      ) : (
        <Typography variant="caption-1" className="text-white">
          {subtitle}
        </Typography>
      )}
    </View>
  );
}; 