import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, ScrollView, Image, TouchableOpacity, Dimensions, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/ui/Card';
import { Car, Star, ChatsCircle } from 'phosphor-react-native';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useLocalSearchParams, router } from 'expo-router';

/**
 * Transport Overview (Home Cards) – (menu)/(homeCards)/transport_overview
 * - Uses internal tabs: Vehicle | Driver | Route
 * - Header matches other (menu) pages via ScreenHeader
 */
export default function TransportOverviewScreen() {
  const params = useLocalSearchParams<{ tab?: string | string[] }>();
  const pageScrollRef = useRef<ScrollView>(null);
  // Y within ScrollView content (for scrollTo)
  const [imagesOffsetY, setImagesOffsetY] = useState(0);
  const imagesBlockRef = useRef<View>(null);

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

  const DriverCard = () => (
    <Card className="mx-4 mt-4 p-5">
      <View className="items-center mb-4">
        <View className="w-28 h-28 rounded-full bg-gray-200 items-center justify-center">
          <Image source={require('../../../assets/images/profile_Picture.png')} style={{ width: 96, height: 96, borderRadius: 48 }} />
        </View>
      </View>
      <View className="space-y-3">
        <Row label="Full Name" value="Sunil Samarathunga" />
        <Row label="Contact" value="011 23 456898" />
        <Row label="Distance" value="20 km" />
        <Row label="Rating" customValue={<Rating value={4.9} />} />
        <Row
          label="Reviews"
          customValue={
            <TouchableOpacity
              className="flex-row items-center"
              activeOpacity={0.8}
              onPress={() => router.push({ pathname: '/(menu)/(homeCards)/reviews', params: { tab: 'Driver' } })}
            >
              <ChatsCircle size={16} color="#2563eb" />
              <Typography variant="subhead" className="ml-2 text-black">6</Typography>
            </TouchableOpacity>
          }
        />
        <Row label="Completed Rides" value="150" />
      </View>
    </Card>
  );

  const RouteCard = () => (
    <Card className="mx-4 mt-4 p-5">
      <View className="space-y-4">
        <Row label="Start" value="Homagama" />
        <View className="mb-3">
          <Typography variant="subhead" className="text-black">
            Route :
          </Typography>
          <Typography variant="subhead" className="text-brand-neutralGray mt-2">
            Homagama » Kottawa » Pannipitiya » Maharagama » Nugegoda » Kirulapona »
            Thimbirigasyaya » Thummulla » Royal College
          </Typography>
        </View>
        <Row label="End" value="Royal College, Colombo 7" />
      </View>
    </Card>
  );

  const VehicleCard = () => (
    <Card className="mx-4 mt-4 p-5">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1 mr-3">
          <Row label="Model" value="Toyota HIACE" />
          <Row label="Start - Destination" value="Homagama" />
          <Row label="RegNo" value="ABE 3500" />
          <Row label="Estimated arrival time" value="10 min" />
          <Row label="Rating" customValue={<Rating value={4.2} />} />
          <Row
            label="Reviews"
            customValue={
              <TouchableOpacity
                className="flex-row items-center"
                activeOpacity={0.8}
                onPress={() => router.push('/(menu)/(homeCards)/reviews')}
              >
                <ChatsCircle size={16} color="#2563eb" />
                <Typography variant="subhead" className="ml-2 text-black">10</Typography>
              </TouchableOpacity>
            }
          />
          <View className="mt-2">
            <Typography variant="subhead" className="text-black">More Details :</Typography>
            <Typography variant="subhead" className="text-brand-neutralGray mt-1">
              Semi luxury bus with fans, in good and new condition.
            </Typography>
          </View>
          <Row label="Available free seats" value="5" className="mt-2" />
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

        {/* Content */}
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
        {/* Bottom spacer */}
        <View className="h-8" />

      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, customValue, className = '' }: { label: string; value?: string; customValue?: React.ReactNode; className?: string }) {
  return (
    <View className={`py-1 mb-3 ${className}`}>
      <Typography variant="subhead" className="text-black">
        {label} :
      </Typography>
      {customValue ? (
        <View className="mt-1">{customValue}</View>
      ) : (
        <Typography variant="subhead" className="text-brand-neutralGray mt-1">{value}</Typography>
      )}
    </View>
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
