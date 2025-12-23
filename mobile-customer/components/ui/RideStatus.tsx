import React from 'react';
import { View } from 'react-native';
import { House, Building } from 'phosphor-react-native';
import { Typography } from '@/components/Typography';
import { StatusBadge } from './StatusBadge';

interface RideStatusProps {
  status: string;
  pickupLocation: string;
  destination: string;
  eta: string;
  className?: string;
}




export const RideStatus: React.FC<RideStatusProps> = ({
  status,
  pickupLocation,
  destination,
  eta,
  className = ''
}) => {
  // Split eta into time and period (e.g., '8:20 AM' => ['8:20', 'AM'])
  let time = eta;
  let period = '';
  if (eta) {
    const match = eta.match(/^(\d{1,2}:\d{2})\s*(AM|PM)$/i);
    if (match) {
      time = match[1];
      period = match[2];
    }
  }
  return (
    <View className={`bg-[#F7F9FB] rounded-2xl px-4 py-3 ${className}`}> 
      {/* Top Row: Status - Line+Badge - ETA */}
      <View className="flex-row items-center mb-1">
        <Typography variant="subhead" weight="bold" className="text-black flex-1">
          {status}
        </Typography>
        <View className="flex-row items-center mx-2 flex-shrink-0">
          <View className="h-0.5 w-4 bg-[#CFE2F8]" />
          <StatusBadge status="On the Way" variant="primary" className="mx-1 bg-[#CFE2F8] text-brand-deepNavy px-3 py-1" />
          <View className="h-0.5 w-4 bg-[#CFE2F8]" />
        </View>
        <Typography variant="subhead" weight="bold" className="text-black flex-1 text-right whitespace-nowrap">
          {time} {period && <Typography variant="subhead" weight="bold" className="text-black inline whitespace-nowrap">{period}</Typography>}
        </Typography>
      </View>
      {/* Bottom Row: Pickup & Destination */}
      <View className="flex-row items-center">
        <View className="flex-1 flex-row items-center">
          <House size={16} color="#6b7280" weight="regular" />
          <Typography variant="footnote" className="text-brand-deepNavy ml-1">
            {pickupLocation}
          </Typography>
        </View>
        <View className="flex-1 flex-row items-center justify-end">
          <Building size={16} color="#6b7280" weight="regular" />
          <Typography variant="footnote" className="text-brand-deepNavy ml-1">
            {destination}
          </Typography>
        </View>
      </View>
    </View>
  );
};