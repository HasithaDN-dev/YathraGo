import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, ScrollView, Image, TouchableOpacity, Dimensions, NativeScrollEvent, NativeSyntheticEvent, ActivityIndicator, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/ui/Card';
import { Car, Star, ChatsCircle, ArrowLeftIcon } from 'phosphor-react-native';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useLocalSearchParams, router } from 'expo-router';
import { findVehicleApi, VehicleDetails } from '@/lib/api/find-vehicle';
import { Colors } from '@/constants/Colors';
import { driverRequestApi } from '@/lib/api/driver-request.api';
import { useProfileStore } from '@/lib/stores/profile.store';

/**
 * Transport Overview (Home Cards) – (menu)/(homeCards)/transport_overview
 * - Uses internal tabs: Vehicle | Driver | Route
 * - Header matches other (menu) pages via ScreenHeader
 */
export default function TransportOverviewScreen() {
  const params = useLocalSearchParams<{ tab?: string | string[]; driverId?: string | string[]; vehicleId?: string | string[] }>();
  const pageScrollRef = useRef<ScrollView>(null);
  // Y within ScrollView content (for scrollTo)
  const [imagesOffsetY, setImagesOffsetY] = useState(0);
  const imagesBlockRef = useRef<View>(null);
  
  // Data state
  const [vehicleDetails, setVehicleDetails] = useState<VehicleDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Request state
  const [offeredAmount, setOfferedAmount] = useState<string>('');
  const [customerNote, setCustomerNote] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const { customerProfile, activeProfile } = useProfileStore();

  // Calculate estimated distance and price
  const estimatedDistance = useMemo(() => {
    if (!vehicleDetails?.distanceFromPickup || !vehicleDetails?.distanceFromDrop) {
      return 0;
    }
    // Total distance = pickup distance + drop distance (round trip)
    return vehicleDetails.distanceFromPickup + vehicleDetails.distanceFromDrop;
  }, [vehicleDetails]);

  const estimatedPrice = useMemo(() => {
    if (estimatedDistance === 0) return 0;
    // Rs. 15 per km per day × 26 working days
    return estimatedDistance * 15 * 26;
  }, [estimatedDistance]);

  type Tab = 'Vehicle' | 'Driver' | 'Route';
  const tabs: Tab[] = useMemo(() => ['Vehicle', 'Driver', 'Route'], []);

  const toTab = (raw?: string | string[]) => {
    const v = Array.isArray(raw) ? raw[0] : raw;
    switch ((v || '').toString().toLowerCase()) {
      case 'vehicle':
        return 'Vehicle' as const;
      case 'driver':
        return 'Driver' as const;
      case 'route':
        return 'Route' as const;
      default:
        return undefined;
    }
  };
  const initial = toTab(params.tab) ?? 'Driver';
  const [activeTab, setActiveTab] = useState<Tab>(initial as Tab);

  const activeIndexRef = useRef<number>(tabs.indexOf(initial as Tab));
  useEffect(() => {
    activeIndexRef.current = tabs.indexOf(activeTab);
  }, [activeTab, tabs]);

  useEffect(() => {
    const next = toTab(params.tab);
    if (next && next !== activeTab) setActiveTab(next as Tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.tab]);

  // Fetch vehicle details when driverId is available
  useEffect(() => {
    const fetchDetails = async () => {
      const driverIdParam = Array.isArray(params.driverId) ? params.driverId[0] : params.driverId;
      
      if (!driverIdParam) {
        setError('No driver ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const driverId = parseInt(driverIdParam, 10);
        const details = await findVehicleApi.getVehicleDetails(driverId);
        setVehicleDetails(details);
      } catch (err) {
        console.error('Error fetching vehicle details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load vehicle details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [params.driverId]);

  const handleSendRequest = async () => {
    try {
      if (!customerProfile || !activeProfile) {
        Alert.alert('Error', 'Profile not found');
        return;
      }

      if (!vehicleDetails) {
        Alert.alert('Error', 'Vehicle details not loaded');
        return;
      }

      const driverIdParam = Array.isArray(params.driverId) ? params.driverId[0] : params.driverId;
      const vehicleIdParam = Array.isArray(params.vehicleId) ? params.vehicleId[0] : params.vehicleId;
      
      if (!driverIdParam || !vehicleIdParam) {
        Alert.alert('Error', 'Missing driver or vehicle information');
        return;
      }

      setIsSending(true);

      const profileType = activeProfile.type as 'child' | 'staff';
      const profileIdStr = activeProfile.id.replace(`${profileType}-`, '');
      const profileId = parseInt(profileIdStr, 10);

      await driverRequestApi.createRequest({
        customerId: customerProfile.customer_id,
        profileType,
        profileId,
        driverId: parseInt(driverIdParam, 10),
        vehicleId: parseInt(vehicleIdParam, 10),
        offeredAmount: offeredAmount ? parseFloat(offeredAmount) : undefined,
        customerNote: customerNote || undefined,
      });

      Alert.alert('Success', 'Ride request sent to driver!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to send request');
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  // tab change by delta removed (swipe disabled)


  const TabButton = ({ label }: { label: Tab }) => (
    <TouchableOpacity
      className={`flex-1 items-center pb-2 ${activeTab === label ? 'border-b-4 border-yellow-400' : ''}`}
      onPress={() => setActiveTab(label)}
      activeOpacity={0.8}
    >
      <Typography variant="subhead" className="text-black">{label}</Typography>
    </TouchableOpacity>
  );

  const scrollToPhotos = () => {
    const doScroll = () => pageScrollRef.current?.scrollTo({ y: Math.max(imagesOffsetY - 16, 0), animated: true });
    if (activeTab !== 'Vehicle') {
      setActiveTab('Vehicle');
      setTimeout(doScroll, 50);
    } else {
      doScroll();
    }
  };

  const DriverCard = () => {
    if (!vehicleDetails) return null;
    
    return (
      <Card className="mx-4 mt-4 p-5">
        <View className="items-center mb-4">
          <View className="w-28 h-28 rounded-full bg-gray-200 items-center justify-center">
            {vehicleDetails.driverProfileImage ? (
              <Image 
                source={{ uri: vehicleDetails.driverProfileImage }} 
                style={{ width: 96, height: 96, borderRadius: 48 }} 
              />
            ) : (
              <Image 
                source={require('../../../assets/images/profile_Picture.png')} 
                style={{ width: 96, height: 96, borderRadius: 48 }} 
              />
            )}
          </View>
        </View>
        <View className="space-y-3">
          <Row label="Full Name" value={vehicleDetails.driverName} />
          <Row label="Contact" value={vehicleDetails.driverPhone} />
          <Row label="Rating" customValue={<Rating value={vehicleDetails.driverRating} />} />
          <Row
            label="Reviews"
            customValue={
              <View className="relative w-full">
                <View className="flex-row items-center">
                  <ChatsCircle size={16} color="#2563eb" />
                  <Typography variant="subhead" className="ml-2 text-brand-deepNavy">
                    {vehicleDetails.driverReviewsCount}
                  </Typography>
                </View>
                <View className="absolute inset-0 items-center justify-center">
                  <ArrowLeftIcon size={16} color="#000000" weight="regular" style={{ transform: [{ rotate: '180deg' }] }} />
                </View>
              </View>
            }
            labelClassName="text-brand-deepNavy"
            onPress={() => router.push({ pathname: '/(menu)/(homeCards)/reviews', params: { tab: 'Driver' } })}
          />
          <Row label="Completed Rides" value={vehicleDetails.driverCompletedRides.toString()} />
        </View>
      </Card>
    );
  };

  const RouteCard = () => {
    if (!vehicleDetails) return null;
    
    return (
      <Card className="mx-4 mt-4 p-5">
        <View className="space-y-4">
          <Row label="Start" value={vehicleDetails.startCity} />
          <View className="mb-3">
            <Typography variant="subhead" className="text-black">
              Route :
            </Typography>
            <Typography variant="subhead" className="text-brand-neutralGray mt-2">
              {vehicleDetails.routeCities.join(' » ')}
            </Typography>
          </View>
          <Row label="End" value={vehicleDetails.endCity} />
          <Row label="Ride Type" value={vehicleDetails.rideType} />
          {vehicleDetails.usualStartTime && vehicleDetails.usualEndTime && (
            <Row label="Usual Time" value={`${vehicleDetails.usualStartTime} - ${vehicleDetails.usualEndTime}`} />
          )}
        </View>
      </Card>
    );
  };

  const VehicleCard = () => {
    if (!vehicleDetails) return null;
    
    return (
      <Card className="mx-4 mt-4 p-5">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 mr-3">
            <Row label="Model" value={`${vehicleDetails.vehicleBrand} ${vehicleDetails.vehicleModel}`} />
            <Row label="Type" value={vehicleDetails.vehicleType} />
            <Row label="Reg No" value={vehicleDetails.vehicleRegistrationNumber} />
            <Row label="Color" value={vehicleDetails.vehicleColor} />
            <Row label="Air Conditioned" value={vehicleDetails.airConditioned ? 'Yes' : 'No'} />
            <Row label="Assistant Available" value={vehicleDetails.assistant ? 'Yes' : 'No'} />
            <Row label="Available Seats" value={vehicleDetails.availableSeats.toString()} />
            <Row label="Rating" customValue={<Rating value={vehicleDetails.vehicleRating} />} />
            <Row
              label="Reviews"
              customValue={
                <View className="w-full flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <ChatsCircle size={16} color="#2563eb" />
                    <Typography variant="subhead" className="ml-2 text-brand-deepNavy">
                      {vehicleDetails.vehicleReviewsCount}
                    </Typography>
                  </View>
                  <ArrowLeftIcon size={16} color="#000000" weight="regular" style={{ transform: [{ rotate: '180deg' }] }} />
                </View>
              }
              labelClassName="text-brand-deepNavy"
              onPress={() => router.push({ pathname: '/(menu)/(homeCards)/reviews', params: { tab: 'Vehicle' } })}
            />
            {vehicleDetails.vehicleDescription && (
              <View className="mt-2">
                <Typography variant="subhead" className="text-black">Description :</Typography>
                <Typography variant="subhead" className="text-brand-neutralGray mt-1">
                  {vehicleDetails.vehicleDescription}
                </Typography>
              </View>
            )}
          </View>
          <TouchableOpacity accessibilityRole="button" onPress={scrollToPhotos} activeOpacity={0.8}>
            <View className="w-32 h-32 rounded-full bg-gray-100 items-center justify-center">
              <Car size={80} color="#143373" weight="fill" />
            </View>
            <Typography variant="footnote" className="text-center mt-2 text-brand-neutralGray">View photos</Typography>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  const ImagesCard = () => {
    const screenWidth = Dimensions.get('window').width;
    const slideWidth = screenWidth - 32; // account for Card mx-4
    const slideHeight = 240;
    const scrollRef = useRef<ScrollView>(null);
    const [index, setIndex] = useState(0);

    const IMAGES: { src: any; label: string }[] = [
      { src: require('../../../assets/images/preview1.png'), label: 'Front' },
      { src: require('../../../assets/images/preview2.png'), label: 'Side' },
      { src: require('../../../assets/images/preview3.png'), label: 'Inside' },
      { src: require('../../../assets/images/preview6.png'), label: 'Rear' },
    ];

    const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, layoutMeasurement } = e.nativeEvent;
      const i = Math.round(contentOffset.x / layoutMeasurement.width);
      setIndex(i);
    };

    return (
      <Card className="mx-4 mt-4 p-5">
        <Typography variant="subhead" className="text-black mb-3">Vehicle Photos</Typography>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumEnd}
          decelerationRate="fast"
          bounces={false}
          overScrollMode="never"
          nestedScrollEnabled
          scrollEventThrottle={16}
          removeClippedSubviews
          style={{ width: slideWidth }}
        >
          {IMAGES.map((img, i) => (
            <View key={i} style={{ width: slideWidth }}>
              <Image source={img.src} style={{ width: slideWidth, height: slideHeight, borderRadius: 12 }} resizeMode="cover" />
              <Typography variant="footnote" className="text-center mt-2 text-brand-neutralGray">{img.label}</Typography>
            </View>
          ))}
        </ScrollView>
        <View className="flex-row justify-center mt-3">
          {IMAGES.map((_, i) => (
            <View key={i} className={`mx-1 rounded-full ${i === index ? 'bg-[#143373]' : 'bg-gray-300'}`} style={{ width: 8, height: 8 }} />
          ))}
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView ref={pageScrollRef} className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ScreenHeader title="Transport Overview" showBackButton />

        {/* Tabs */}
        <View className="flex-row px-4 mt-3">
          <TabButton label="Vehicle" />
          <TabButton label="Driver" />
          <TabButton label="Route" />
        </View>

        {/* Loading State */}
        {loading && (
          <View className="items-center justify-center py-20">
            <ActivityIndicator size="large" color={Colors.warmYellow} />
            <Typography variant="body" className="text-gray-500 mt-4">
              Loading vehicle details...
            </Typography>
          </View>
        )}

        {/* Error State */}
        {error && !loading && (
          <View className="items-center justify-center py-20 px-4">
            <Typography variant="body" className="text-red-500 text-center mb-4">
              {error}
            </Typography>
            <TouchableOpacity
              className="px-6 py-3 bg-brand-deepNavy rounded-lg"
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Typography variant="subhead" className="text-white">
                Go Back
              </Typography>
            </TouchableOpacity>
          </View>
        )}

        {/* Content */}
        {!loading && !error && vehicleDetails && (
          <>
            {activeTab === 'Driver' && <DriverCard />}
            {activeTab === 'Route' && <RouteCard />}
            {activeTab === 'Vehicle' && (
              <>
                <VehicleCard />
                {/* Measure the top of the images block to avoid capturing swipes over it */}
                <View
                  ref={imagesBlockRef}
                  onLayout={(e) => {
                    setImagesOffsetY(e.nativeEvent.layout.y);
                    // Absolute Y measurement removed (swipe disabled)
                  }}
                >
                  <ImagesCard />
                </View>
              </>
            )}

            {/* Send Request Section */}
            <Card className="mx-4 mt-4 p-5">
              <Typography variant="headline" weight="semibold" className="text-brand-deepNavy mb-4">
                Send Ride Request
              </Typography>
              
              {/* Show estimates if available */}
              {estimatedDistance > 0 && estimatedPrice > 0 ? (
                <View className="mb-4 bg-blue-50 p-4 rounded-lg">
                  <View className="flex-row justify-between mb-2">
                    <Typography variant="subhead" className="text-gray-700">
                      Estimated Distance:
                    </Typography>
                    <Typography variant="subhead" weight="semibold" className="text-black">
                      {estimatedDistance.toFixed(2)} km
                    </Typography>
                  </View>
                  
                  <View className="flex-row justify-between">
                    <Typography variant="subhead" className="text-gray-700">
                      Estimated Monthly Price:
                    </Typography>
                    <Typography variant="title-3" weight="semibold" className="text-blue-600">
                      Rs. {estimatedPrice.toLocaleString()}
                    </Typography>
                  </View>
                </View>
              ) : (
                <View className="mb-4 bg-yellow-50 p-3 rounded-lg">
                  <Typography variant="footnote" className="text-gray-600 text-center">
                    ℹ️ Distance and price will be calculated based on your location
                  </Typography>
                </View>
              )}
              
              <View className="mb-4">
                <Typography variant="subhead" className="text-black mb-2">
                  Your Offer (Rs.):
                </Typography>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3"
                  style={{ backgroundColor: '#f9fafb' }}
                  placeholder="Enter your offer amount (optional)"
                  value={offeredAmount}
                  onChangeText={setOfferedAmount}
                  keyboardType="numeric"
                />
                <Typography variant="caption-1" className="text-gray-500 mt-1">
                  Leave empty to use the system-calculated estimate
                </Typography>
              </View>
              
              <View className="mb-4">
                <Typography variant="subhead" className="text-black mb-2">
                  Note for Driver (Optional):
                </Typography>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3"
                  style={{ backgroundColor: '#f9fafb', minHeight: 80, textAlignVertical: 'top' }}
                  placeholder="Add any special requests..."
                  value={customerNote}
                  onChangeText={setCustomerNote}
                  multiline
                  numberOfLines={3}
                />
              </View>
              
              <TouchableOpacity
                className={`py-4 rounded-lg ${isSending ? 'bg-gray-400' : 'bg-brand-deepNavy'}`}
                onPress={handleSendRequest}
                disabled={isSending}
                activeOpacity={0.8}
              >
                <Typography variant="subhead" weight="semibold" className="text-white text-center">
                  {isSending ? 'Sending...' : 'Send Request'}
                </Typography>
              </TouchableOpacity>
            </Card>
          </>
        )}
        {/* Bottom spacer */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, customValue, className = '', onPress, labelClassName = '' }: { label: string; value?: string; customValue?: React.ReactNode; className?: string; onPress?: () => void; labelClassName?: string }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={!onPress}
      onPress={onPress}
      className={`py-1 mb-3 ${className}`}
    >
  <Typography variant="subhead" className={labelClassName || 'text-black'}>
        {label} :
      </Typography>
      {customValue ? (
        <View className="mt-1 w-full">{customValue}</View>
      ) : (
        <Typography variant="subhead" className="text-brand-neutralGray mt-1">{value}</Typography>
      )}
    </TouchableOpacity>
  );
}

function Rating({ value }: { value: number }) {
  return (
    <View className="flex-row items-center">
      <Typography variant="subhead" className="text-black mr-1">{value}</Typography>
      <Star size={14} color="#f5b301" weight="fill" />
    </View>
  );
}
