import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Broadcast, 
  ChatCircle, 
  ArrowRight,
  Info 
} from 'phosphor-react-native';
import { Typography } from '@/components/Typography';
import { Header } from '@/components/ui/Header';
import { Card } from '@/components/ui/Card';
import { RideStatus } from '@/components/ui/RideStatus';
import { DriverVehicleCard } from '@/components/ui/DriverVehicleCard';
import { PaymentSection } from '@/components/ui/PaymentSection';
import CustomButton from '@/components/ui/CustomButton';

export default function StaffHomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Header Component */}
      <Header
        profileName="My Elder Son"
        fullName="Supun Thilina"
        onProfilePress={() => console.log('Profile selection pressed')}
        onRefreshPress={() => console.log('Refresh pressed')}
      />
      
      <ScrollView className="flex-1 px-4 space-y-6">
        {/* Current Ride Section */}
        <Card className="mb-3">
          <View className="flex-row items-center justify-between mb-4">
            <Typography variant="title-3" weight="semibold" className="text-black">
              Current Ride
            </Typography>
            <TouchableOpacity 
              className="flex-row items-center"
              onPress={() => console.log('See more pressed')}
              activeOpacity={0.8}
            >
              <Typography variant="subhead" weight="medium" className="text-brand-deepNavy mr-1">
                See More
              </Typography>
              <ArrowRight size={16} color="#143373" weight="regular" />
            </TouchableOpacity>
          </View>
          
          <RideStatus
            status="Picked Up"
            pickupLocation="Maharagama Junction"
            destination="Royal College"
            eta="ETA 08:20"
          />
        </Card>
        
        {/* Driver & Vehicle Section */}
        <Card className="mb-3">
          <View className="flex-row items-center justify-between mb-4">
            <Typography variant="title-3" weight="semibold" className="text-black">
              Driver & Vehicle
            </Typography>
            <TouchableOpacity 
              className="flex-row items-center"
              onPress={() => console.log('See info pressed')}
              activeOpacity={0.8}
            >
              <Typography variant="subhead" weight="medium" className="text-brand-deepNavy mr-1">
                See Info
              </Typography>
              <Info size={16} color="#143373" weight="regular" />
            </TouchableOpacity>
          </View>
          
          {/* Driver and Vehicle Cards */}
          <View className="flex-row gap-x-6 mb-4">
            <DriverVehicleCard
              type="driver"
              name="Hemal Perera"
              subtitle="Driver"
              rating={4.9}
            />
            <DriverVehicleCard
              type="vehicle"
              name="WP-5562"
              subtitle="Toyota HIACE"
            />
          </View>
          
          {/* Action Buttons */}
          <View className="flex-row justify-center items-center">
            <CustomButton
              title="Inform"
              bgVariant="secondary"
              textVariant="white"
              size="medium"
              IconLeft={Broadcast}
              className="mx-2 w-[180px]"
              onPress={() => console.log('Inform pressed')}
            />
            <CustomButton
              title="Message"
              bgVariant="outline"
              textVariant="primary"
              size="medium"
              IconLeft={ChatCircle}
              className="w-[180px]"
              onPress={() => console.log('Message pressed')}
            />
          </View>
        </Card>
        
        {/* Payment Section */}
        <Card>
          <PaymentSection
            daysInMonth={25}
            totalPayable="Rs. 12000.45"
            dueDate="25 Oct 2025"
            onSummaryPress={() => console.log('Summary pressed')}
            onPayNowPress={() => console.log('Pay now pressed')}
            onHistoryPress={() => console.log('Payment history pressed')}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
