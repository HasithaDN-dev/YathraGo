import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { ListBullets, CreditCard, FileText } from 'phosphor-react-native';
import { Typography } from '@/components/Typography';
import CustomButton from './CustomButton';

interface PaymentSectionProps {
  daysInMonth: number;
  totalPayable: string;
  dueDate: string;
  onSummaryPress?: () => void;
  onPayNowPress?: () => void;
  onHistoryPress?: () => void;
  className?: string;
}

export const PaymentSection: React.FC<PaymentSectionProps> = ({
  daysInMonth,
  totalPayable,
  dueDate,
  onSummaryPress,
  onPayNowPress,
  onHistoryPress,
  className = ''
}) => {
  return (
    <View className={`space-y-4 ${className}`}>
      {/* This Month Section */}
      <View className="flex-row items-center justify-between">
        <View>
          <Typography variant="subhead" weight="semibold" className="text-black mb-1">
            This Month
          </Typography>
          <View className="flex-row items-baseline">
            <Typography variant="title-2" weight="bold" className="text-black">
              {daysInMonth}
            </Typography>
            <Typography variant="footnote" className="text-brand-neutralGray ml-1">
              Days
            </Typography>
          </View>
        </View>
        <CustomButton
          title="Summary"
          bgVariant="secondary"
          textVariant="white"
          size="small"
          IconLeft={ListBullets}
          onPress={onSummaryPress}
        />
      </View>
      
      {/* Total Payable Section */}
      <View className="flex-row items-center justify-between">
        <View>
          <Typography variant="subhead" weight="semibold" className="text-black mb-1">
            Total Payable
          </Typography>
          <Typography variant="title-2" weight="bold" className="text-black mb-1">
            {totalPayable}
          </Typography>
          <Typography variant="footnote" className="text-brand-neutralGray">
            Pay before {dueDate}
          </Typography>
        </View>
        <CustomButton
          title="Pay Now"
          bgVariant="secondary"
          textVariant="white"
          size="small"
          IconLeft={CreditCard}
          onPress={onPayNowPress}
        />
      </View>
      
      {/* Payment History Link */}
      <TouchableOpacity 
        className="flex-row items-center justify-center py-2"
        onPress={onHistoryPress}
        activeOpacity={0.8}
      >
        <FileText size={16} color="#143373" weight="regular" />
        <Typography variant="subhead" weight="medium" className="text-brand-deepNavy ml-2">
          Payment History
        </Typography>
      </TouchableOpacity>
    </View>
  );
}; 