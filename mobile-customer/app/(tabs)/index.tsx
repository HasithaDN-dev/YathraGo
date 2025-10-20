import React, { useEffect } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Broadcast, 
  ChatCircle, 
  ArrowRight,
  Info,
  MagnifyingGlass
} from 'phosphor-react-native';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/ui/Card';
import { RideStatus } from '@/components/ui/RideStatus';
import { DriverVehicleCard } from '@/components/ui/DriverVehicleCard';
import { PaymentSection } from '@/components/ui/PaymentSection';
import CustomButton from '@/components/ui/CustomButton';
import { router } from 'expo-router';
import { useProfileStore } from '@/lib/stores/profile.store';
import { useAuthStore } from '@/lib/stores/auth.store';

export default function HomeScreen() {
  const { activeProfile, loadProfiles } = useProfileStore();
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (accessToken && !activeProfile) {
      loadProfiles(accessToken);
    }
  }, [accessToken, activeProfile, loadProfiles]);

  const openOverview = (tab: 'Driver' | 'Vehicle') => {
    router.push({ pathname: '/(menu)/(homeCards)/transport_overview', params: { tab } });
  };



  const getDestinationName = () => {
    if (!activeProfile) return 'Destination';
    if (activeProfile.type === 'child') {
      return activeProfile.school || 'School';
    }
    return activeProfile.workLocation || 'Work Location';
  };

  const getPickupLocation = () => {
    if (!activeProfile) return 'Pick Up Location';
    if (activeProfile.type === 'child') {
      return activeProfile.pickUpAddress || 'Home';
    }
    return activeProfile.pickupAddress || 'Pick Up Location';
  };

  return (
    <SafeAreaView edges={['left','right','bottom']} className="flex-1 bg-gray-100">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 space-y-6 pb-6 mt-3"
        showsVerticalScrollIndicator={false}
      >
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
            pickupLocation={getPickupLocation()}
            destination={getDestinationName()}
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
            <TouchableOpacity className="flex-1" activeOpacity={0.85} onPress={() => openOverview('Driver')}>
              <DriverVehicleCard
                type="driver"
                name="Hemal Perera"
                subtitle="Driver"
                rating={4.9}
              />
            </TouchableOpacity>
            <TouchableOpacity className="flex-1" activeOpacity={0.85} onPress={() => openOverview('Vehicle')}>
              <DriverVehicleCard
                type="vehicle"
                name="WP-5562"
                subtitle="Toyota HIACE"
              />
            </TouchableOpacity>
          </View>
          
          {/* Action Buttons */}
          <View className="flex-row justify-center items-center">
            <CustomButton
              title="Inform"
              bgVariant="secondary"
              textVariant="white"
              size="medium"
              IconLeft={Broadcast}
              className="mx-2 w-[160px]"
              onPress={() => router.push('/(menu)/(homeCards)/inform_driver')}
            />
            <CustomButton
              title="Message"
              bgVariant="outline"
              textVariant="primary"
              size="medium"
              IconLeft={ChatCircle}
              className="w-[160px]"
              onPress={() => router.push('/(menu)/(homeCards)/chat_list')}
            />
          </View>
        </Card>
        
        {/* Payment Section - Show different payment info based on profile */}
        <Card>
          <PaymentSection
            daysInMonth={25}
            totalPayable={activeProfile?.type === 'child' ? "Rs. 8000.00" : "Rs. 12000.45"}
            dueDate="25 Oct 2025"
            onSummaryPress={() => router.push('/(menu)/(homeCards)/payment_summary')}
            onPayNowPress={() => router.push('/(menu)/(homeCards)/payment')}
            onHistoryPress={() => router.push('/(menu)/(homeCards)/payment_history')}
          />
        </Card>

        {/* Quick Action Cards */}
        <View className="flex-row gap-3">
          {/* Find New Vehicle */}
          <TouchableOpacity
            className="flex-1 bg-brand-deepNavy rounded-2xl p-6 items-center justify-center shadow-sm"
            style={{ aspectRatio: 1 }}
            onPress={() => router.push('/(menu)/(homeCards)/find_vehicle')}
            activeOpacity={0.8}
          >
            <MagnifyingGlass size={32} color="#ffffff" weight="bold" />
            <Typography variant="subhead" weight="semibold" className="text-white text-center mt-3">
              Find New{'\n'}Vehicle
            </Typography>
          </TouchableOpacity>

          {/* View Sent Requests */}
          <TouchableOpacity
            className="flex-1 bg-blue-600 rounded-2xl p-6 items-center justify-center shadow-sm"
            style={{ aspectRatio: 1 }}
            onPress={() => router.push('/(menu)/find-driver/request-list')}
            activeOpacity={0.8}
          >
            <ChatCircle size={32} color="#ffffff" weight="bold" />
            <Typography variant="subhead" weight="semibold" className="text-white text-center mt-3">
              View Sent{'\n'}Requests
            </Typography>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}