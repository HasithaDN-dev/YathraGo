import React, { useState } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { MagnifyingGlass } from 'phosphor-react-native';
import { router } from 'expo-router';

const conversations = [
  {
    id: '1',
    name: 'Sunil Samarathunga',
    lastMessage: 'Madam, Our vehicle will not come to get …',
    time: '05:15 am',
  phone: '+94710000001',
  },
  {
    id: '2',
    name: 'Kamal Perera',
    lastMessage: 'We will be 10 minutes late today',
  time: 'Yesterday',
  phone: '+94710000002',
  },
  {
    id: '3',
    name: 'Tharindu Silva',
    lastMessage: 'Route updated for tomorrow',
  time: '02/08/2025',
  phone: '+94710000003',
  },
  // Additional dummy data
  {
    id: '4',
    name: 'Nimal Jayasinghe',
    lastMessage: 'Can you confirm the pickup location?',
  time: 'Today',
  phone: '+94710000004',
  },
  {
    id: '5',
    name: 'Amaya Fernando',
    lastMessage: 'Thanks for the update! See you tomorrow.',
  time: '08:42 am',
  phone: '+94710000005',
  },
  {
    id: '6',
    name: 'Sajith Kumar',
    lastMessage: 'We might reach around 7:45.',
  time: 'Mon',
  phone: '+94710000006',
  },
  {
    id: '7',
    name: 'Dilani Perera',
    lastMessage: 'Please share driver contact.',
  time: 'Yesterday',
  phone: '+94710000007',
  },
  {
    id: '8',
    name: 'Ruwan Weerasinghe',
    lastMessage: 'All good. Child picked up safely.',
  time: '07:05 am',
  phone: '+94710000008',
  },
  {
    id: '9',
    name: 'Shanika De Silva',
    lastMessage: 'Could you drop near the side gate?',
  time: 'Fri',
  phone: '+94710000009',
  },
  {
    id: '10',
    name: 'Nadeesha Karunaratne',
    lastMessage: 'I will be on leave tomorrow.',
  time: '03/08/2025',
  phone: '+94710000010',
  },
  {
    id: '11',
    name: 'Ishara Gunasekara',
    lastMessage: 'Payment done. Please confirm.',
  time: 'Thu',
  phone: '+94710000011',
  },
  {
    id: '12',
    name: 'Lakmal Jayawardena',
    lastMessage: 'Traffic is heavy on High Level Road.',
  time: '06:58 am',
  phone: '+94710000012',
  },
  {
    id: '13',
    name: 'Chathura Ranasinghe',
    lastMessage: 'Is the afternoon trip available?',
  time: 'Wed',
  phone: '+94710000013',
  },
  {
    id: '14',
    name: 'Hasini Abeysekera',
    lastMessage: 'Thank you for the quick response.',
  time: '10:12 am',
  phone: '+94710000014',
  },
  {
    id: '15',
    name: 'Harsha Wijeratne',
    lastMessage: 'Please wait 5 minutes. We are coming.',
  time: 'Today',
  phone: '+94710000015',
  },
  {
    id: '16',
    name: 'Tharaka Senanayake',
    lastMessage: 'Can we change the morning stop?',
  time: 'Tue',
  phone: '+94710000016',
  },
  {
    id: '17',
    name: 'Piumi Rodrigo',
    lastMessage: 'Child will be absent next Monday.',
  time: 'Sun',
  phone: '+94710000017',
  },
  {
    id: '18',
    name: 'Sachin Pathirana',
    lastMessage: 'Please share the monthly summary.',
  time: '09:30 am',
  phone: '+94710000018',
  },
];

export default function ChatListScreen() {
  const [query, setQuery] = useState('');

  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        <ScreenHeader title="Chat" showBackButton />

        {/* Search (fixed) */}
        <Card className="mx-4 mb-1 p-0 bg-transparent shadow-none">
          <View className="flex-row items-center bg-brand-lightGray rounded-full px-4 py-1 shadow-sm">
            <MagnifyingGlass size={18} color="#6b7280" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="search all"
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-2 text-black"
              autoCapitalize="none"
            />
          </View>
        </Card>

        {/* Conversation cards (scrollable) */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-4 pb-6">
            {filtered.map((c) => (
              <TouchableOpacity
                key={c.id}
                activeOpacity={0.8}
                onPress={() => router.push({ pathname: '/(menu)/(homeCards)/chat_room', params: { id: c.id, name: c.name, phone: c.phone } })}
              >
                <View className="bg-white rounded-2xl px-3 py-3 mb-3 shadow-sm flex-row items-center">
                  <Image
                    source={require('../../../assets/images/profile_Picture.png')}
                    style={{ width: 36, height: 36, borderRadius: 18, marginRight: 10 }}
                  />
                  <View className="flex-1">
                    <Typography variant="subhead" className="text-black">{c.name}</Typography>
                    <Typography variant="caption-1" className="text-brand-neutralGray" numberOfLines={1}>
                      {c.lastMessage}
                    </Typography>
                  </View>
                  <View className="items-end ml-2">
                    <Typography variant="caption-1" className="text-brand-neutralGray">{c.time}</Typography>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}