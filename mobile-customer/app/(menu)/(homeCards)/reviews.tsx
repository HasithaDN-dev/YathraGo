import React, { useEffect, useState } from 'react';
import { View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Star, CaretDown, CaretUp } from 'phosphor-react-native';
// removed duplicate import by consolidating above

interface ReviewItem {
  id: string;
  name: string;
  rating: number;
  time?: string;
  text: string;
  expanded?: boolean;
}
// Separate datasets
const vehicleInitialReviews: ReviewItem[] = [
  { id: 'v1', name: 'Amal Jayasekara', rating: 4.6, time: '08:15 am', text: 'Clean vehicle and comfortable seats.', expanded: true },
  { id: 'v2', name: 'Nadeesha Karu', rating: 4.2, time: 'Yesterday', text: 'AC worked well. Smooth ride.' },
  { id: 'v3', name: 'Ishara Gun', rating: 4.9, text: 'Very neat interior. Children loved it.' },
  { id: 'v4', name: 'Dilshan Perera', rating: 4.1, time: 'Tue', text: 'A little noisy, but overall fine.' },
  { id: 'v5', name: 'Thilini Samar', rating: 4.7, time: '05:55 am', text: 'Seat belts all working and in good shape.' },
  { id: 'v6', name: 'Kanishka R', rating: 4.0, time: 'Mon', text: 'Could be cleaner near the windows.' },
  { id: 'v7', name: 'Sanduni P.', rating: 4.8, time: 'Today', text: 'New tires, very stable. Good ride.' },
  { id: 'v8', name: 'Lakmal J', rating: 4.3, time: 'Fri', text: 'Spacious and airy. Good lighting.' },
  { id: 'v9', name: 'Hasara D', rating: 4.5, time: '10:05 am', text: 'Sound system volume at a nice level.' },
  { id: 'v10', name: 'Rashmi F', rating: 4.2, time: 'Yesterday', text: 'No strange smells. Well maintained.' },
  { id: 'v11', name: 'Sumudu K', rating: 4.4, time: 'Wed', text: 'Charging ports were helpful.' },
  { id: 'v12', name: 'Sameera W', rating: 4.6, time: 'Sun', text: 'Overall excellent condition.' },
  { id: 'v13', name: 'Nirmal S', rating: 4.3, time: 'Sat', text: 'Windows clear and seats intact.' },
  { id: 'v14', name: 'Pavithra M', rating: 4.1, time: '09:30 am', text: 'Minor scratches but nothing serious.' },
  { id: 'v15', name: 'Sachini P', rating: 4.5, time: 'Thu', text: 'Seat layout is perfect for kids.' },
];

const driverInitialReviews: ReviewItem[] = [
  { id: 'd1', name: 'Sunil Samarathunga', rating: 4.9, time: '05:15 am', text: 'Very safe driving and courteous.', expanded: true },
  { id: 'd2', name: 'Kamal Perera', rating: 4.5, time: 'Yesterday', text: 'On time and responsive to messages.' },
  { id: 'd3', name: 'Tharindu Silva', rating: 4.7, text: 'Patient with kids and helpful.' },
  { id: 'd4', name: 'Nimal Jayasinghe', rating: 4.4, time: 'Today', text: 'Took best route to avoid traffic.' },
  { id: 'd5', name: 'Amaya Fernando', rating: 4.6, time: '08:42 am', text: 'Polite and professional.' },
  { id: 'd6', name: 'Sajith Kumar', rating: 4.3, time: 'Mon', text: 'Slight delay once, informed ahead.' },
  { id: 'd7', name: 'Dilani Perera', rating: 4.8, time: 'Yesterday', text: 'Smooth driving, no sudden brakes.' },
  { id: 'd8', name: 'Ruwan Weerasinghe', rating: 4.5, time: '07:05 am', text: 'Gave prompt updates.' },
  { id: 'd9', name: 'Shanika De Silva', rating: 4.2, time: 'Fri', text: 'Respectful and friendly.' },
  { id: 'd10', name: 'Nadeesha Karunaratne', rating: 4.1, time: '03/08/2025', text: 'Handled schedule change well.' },
  { id: 'd11', name: 'Ishara Gunasekara', rating: 4.6, time: 'Thu', text: 'Communicative and careful.' },
  { id: 'd12', name: 'Lakmal Jayawardena', rating: 4.7, time: '06:58 am', text: 'Always on time.' },
  { id: 'd13', name: 'Chathura Ranasinghe', rating: 4.4, time: 'Wed', text: 'Professional attitude.' },
  { id: 'd14', name: 'Hasini Abeysekera', rating: 4.8, time: '10:12 am', text: 'Great with kids.' },
  { id: 'd15', name: 'Sachin Pathirana', rating: 4.5, time: '09:30 am', text: 'Reliable and steady.' },
];

export default function ReviewsScreen() {
  type Tab = 'Vehicle' | 'Driver';
  const params = useLocalSearchParams<{ tab?: string | string[] }>();
  const router = useRouter();
  const toTab = (raw?: string | string[]) => {
    const v = Array.isArray(raw) ? raw[0] : raw;
    switch ((v || '').toString().toLowerCase()) {
      case 'vehicle':
        return 'Vehicle' as const;
      case 'driver':
        return 'Driver' as const;
      default:
        return undefined;
    }
  };
  const initialTab = (toTab(params.tab) ?? 'Vehicle') as Tab;
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [vehicleReviews, setVehicleReviews] = useState<ReviewItem[]>(vehicleInitialReviews);
  const [driverReviews, setDriverReviews] = useState<ReviewItem[]>(driverInitialReviews);
  const currentReviews = activeTab === 'Vehicle' ? vehicleReviews : driverReviews;
  const [visibleCount, setVisibleCount] = useState(Math.min(10, currentReviews.length));

  // Reset visible count when switching tabs
  useEffect(() => {
    setVisibleCount(Math.min(10, currentReviews.length));
  }, [activeTab, currentReviews.length]);

  const TabButton = ({ label }: { label: Tab }) => (
    <TouchableOpacity
      className={`flex-1 items-center pb-2 ${activeTab === label ? 'border-b-4 border-yellow-400' : ''}`}
      onPress={() => setActiveTab(label)}
      activeOpacity={0.8}
    >
      <Typography variant="subhead" className="text-black">{label}</Typography>
    </TouchableOpacity>
  );

  const toggle = (id: string) => {
    if (activeTab === 'Vehicle') {
      setVehicleReviews((prev: ReviewItem[]) => prev.map((r: ReviewItem) => (r.id === id ? { ...r, expanded: !r.expanded } : r)));
    } else {
      setDriverReviews((prev: ReviewItem[]) => prev.map((r: ReviewItem) => (r.id === id ? { ...r, expanded: !r.expanded } : r)));
    }
  };

  const RatingRow = ({ value }: { value: number }) => (
    <View className="flex-row items-center">
      <Typography variant="footnote" className="text-black mr-1">{value}</Typography>
      <Star size={14} color="#f5b301" weight="fill" />
    </View>
  );

  const HeaderRow = ({ name, rating, time }: { name: string; rating: number; time?: string }) => (
    <View className="flex-row items-center">
      <Image
        source={require('../../../assets/images/profile_Picture.png')}
        style={{ width: 28, height: 28, borderRadius: 14, marginRight: 10 }}
      />
      <View className="flex-1">
        <Typography variant="subhead" className="text-black">{name}</Typography>
        {time ? (
          <Typography variant="footnote" className="text-brand-neutralGray">{time}</Typography>
        ) : null}
      </View>
      <RatingRow value={rating} />
    </View>
  );

  const ExpandedCard = ({ item }: { item: ReviewItem }) => (
    <Card className="mb-3 p-4">
      <HeaderRow name={item.name} rating={item.rating} time={item.time} />
      <Typography variant="subhead" className="text-brand-neutralGray mt-2">
        {item.text}
      </Typography>
      <View className="items-end mt-2">
        <TouchableOpacity onPress={() => toggle(item.id)}>
          <CaretUp size={18} color="#6b7280" />
        </TouchableOpacity>
      </View>
    </Card>
  );

  const CompactRow = ({ item }: { item: ReviewItem }) => (
    <View className="bg-white rounded-full px-3 py-3 mb-3 shadow flex-row items-center">
      <Image
        source={require('../../../assets/images/profile_Picture.png')}
        style={{ width: 28, height: 28, borderRadius: 14, marginRight: 10 }}
      />
      <View className="flex-1 mr-2">
        <Typography variant="subhead" className="text-black" numberOfLines={1}>{item.name}</Typography>
        <Typography variant="footnote" className="text-brand-neutralGray" numberOfLines={1}>
          {item.text}
        </Typography>
      </View>
      <RatingRow value={item.rating} />
      <TouchableOpacity onPress={() => toggle(item.id)} className="ml-2">
        <CaretDown size={18} color="#6b7280" />
      </TouchableOpacity>
    </View>
  );

  const handleBack = () => {
    // Ensure we return to Transport Overview with the same tab context
    router.replace({ pathname: '/(menu)/(homeCards)/transport_overview', params: { tab: activeTab } });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Reviews" showBackButton onBackPress={handleBack} />

        {/* Tabs */}
        <View className="flex-row px-4 mt-3">
          <TabButton label="Vehicle" />
          <TabButton label="Driver" />
        </View>

        <View className="px-3 pb-8">
          {/* Reviews list (paginated) - per active tab */}
          {currentReviews.slice(0, visibleCount).map((item) => (
            item.expanded ? (
              <ExpandedCard key={item.id} item={item} />
            ) : (
              <CompactRow key={item.id} item={item} />
            )
          ))}

          {/* See more button (only if more remain) */}
      {visibleCount < currentReviews.length ? (
            <View className="items-center mt-2">
              <TouchableOpacity
                activeOpacity={0.8}
                className="bg-gray-100 rounded-full px-5 py-2 shadow"
        onPress={() => setVisibleCount((c) => Math.min(c + 10, currentReviews.length))}
              >
                <Typography variant="footnote" className="text-black">see more ▾</Typography>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}