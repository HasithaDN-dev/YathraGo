import React from 'react';
import { View } from 'react-native';
import { Typography } from '@/components/Typography';

interface StatusBadgeProps {
  status: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  variant = 'primary',
  className = '' 
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-brand-brightOrange text-white';
      case 'success':
        return 'bg-success text-white';
      case 'warning':
        return 'bg-warning text-white';
      default:
        return 'bg-brand-deepNavy text-white';
    }
  };

  return (
    <View className={`px-3 py-1 rounded-full ${getVariantClasses()} ${className}`}>
      <Typography variant="caption-1" weight="medium" className="text-white">
        {status}
      </Typography>
    </View>
  );
}; 