import React from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import CustomButton from '@/components/ui/CustomButton';
import { CreditCard } from 'phosphor-react-native';

export default function PaymentSummaryScreen() {
  const handlePay = () => {
    console.log('Pay button pressed');
    // Handle payment logic here
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ScreenHeader title="Payment Summary" showBackButton />

        {/* Payment Details Card */}
        <View className="px-4 mt-4">
          <Card className="p-6">
            {/* Payment Details */}
            <View className="mb-8">
              {/* Last Bill */}
              <View className="flex-row justify-between items-center mb-4">
                <Typography variant="subhead" className="text-black">
                  Last Bill :
                </Typography>
                <Typography variant="subhead" weight="semibold" className="text-black">
                  Rs. 8730.00
                </Typography>
              </View>

              {/* Last Payment */}
              <View className="flex-row justify-between items-center mb-4">
                <Typography variant="subhead" className="text-black">
                  Last Payment :
                </Typography>
                <Typography variant="subhead" weight="semibold" className="text-black">
                  Rs. 8500.00
                </Typography>
              </View>

              {/* Total Payable */}
              <View className="flex-row justify-between items-center mb-6">
                <Typography variant="subhead" className="text-black">
                  Total Payable :
                </Typography>
                <Typography variant="subhead" weight="semibold" className="text-black">
                  Rs. 8230.00
                </Typography>
              </View>
            </View>

            {/* Pay Button */}
            <View className="items-center">
              <CustomButton
                title="Pay"
                bgVariant="primary"
                textVariant="white"
                size="large"
                IconLeft={CreditCard}
                className="w-full max-w-[200px]"
                onPress={handlePay}
              />
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
