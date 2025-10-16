import React, { useEffect, useState } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { MagnifyingGlass } from 'phosphor-react-native';
import { router } from 'expo-router';
import { API_BASE_URL } from '../../../config/api';
import { useAuth } from '../../../hooks/useAuth';

// Commented out dummy data. Now using API data.
// const conversations = [ ... ];

export default function ChatListScreen() {
  const [query, setQuery] = useState('');
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    // Fetch conversations for the logged-in user (assume CUSTOMER type)
    fetch(`${API_BASE_URL}/chat/conversations?userId=${user.id}&userType=CUSTOMER`)
      .then((res) => res.json())
      .then((data) => setConversations(data))
      .catch(() => setConversations([]))
      .finally(() => setLoading(false));
  }, [user]);

  // Normalize backend conversation shape to UI-friendly fields
  const normalized = conversations.map((c) => {
    const other = c.otherParticipant || {};
    const last = c.lastMessage || c.messages?.[0] || null;
    return {
      id: c.id,
      name: other.name || 'Chat',
      phone: other.phone || '',
      lastMessage: last?.message || '',
      time: last?.timestamp ? new Date(last.timestamp).toLocaleTimeString() : '',
    };
  });

  const filtered = normalized.filter((c) =>
    (c.name || '').toLowerCase().includes(query.toLowerCase())
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
            {loading ? (
              <Typography variant="body" className="text-center mt-8">Loading...</Typography>
            ) : filtered.length === 0 ? (
              <Typography variant="body" className="text-center mt-8">No conversations found.</Typography>
            ) : filtered.map((c) => (
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