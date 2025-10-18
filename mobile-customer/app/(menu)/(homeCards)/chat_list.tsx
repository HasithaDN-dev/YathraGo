import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Typography } from '@/components/Typography';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { MagnifyingGlass } from 'phosphor-react-native';
import { router } from 'expo-router';
import { API_BASE_URL } from '../../../config/api';
import { useAuth } from '../../../hooks/useAuth';

// Commented out dummy data. Now using API data.
// const conversations = [ ... ];

interface ConversationItem {
  id: number;
  name: string;
  phone: string;
  lastMessage: string;
  time: string;
  timestamp: string;
  unreadCount: number;
}

export default function ChatListScreen() {
  const [query, setQuery] = useState('');
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  // Fetch conversations function
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE_URL}/chat/conversations?userId=${user.id}&userType=CUSTOMER`);
      const data = await res.json();
      
      // Transform and calculate unread counts
      const transformed: ConversationItem[] = data.map((c: any) => {
        const other = c.otherParticipant || {};
        const messages = c.messages || [];
        const lastMsg = messages[0] || null; // Messages come in DESC order from backend
        
        // Count unread messages (messages not sent by me and not seen)
        const unreadCount = messages.filter((msg: any) => 
          msg.senderId !== Number(user.id) && 
          msg.senderType !== 'CUSTOMER' && 
          msg.seen === false
        ).length;
        
        return {
          id: c.id,
          name: other.name || 'Chat',
          phone: other.phone || '',
          lastMessage: lastMsg?.message || (lastMsg?.imageUrl ? '📷 Image' : ''),
          time: lastMsg?.timestamp ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          timestamp: lastMsg?.timestamp || c.updatedAt || '',
          unreadCount,
        };
      });
      
      // Sort by latest message timestamp (most recent first)
      const sorted = transformed.sort((a, b) => {
        if (!a.timestamp) return 1;
        if (!b.timestamp) return -1;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
      
      setConversations(sorted);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      setConversations([]);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchConversations().finally(() => setLoading(false));
  }, [user, fetchConversations]);

  // Auto-refresh when screen is focused (poll every 5 seconds)
  useFocusEffect(
    useCallback(() => {
      let interval: NodeJS.Timeout;
      
      // Immediate fetch when screen comes into focus
      fetchConversations();
      
      // Set up polling every 5 seconds
      interval = setInterval(() => {
        fetchConversations();
      }, 5000);

      return () => {
        if (interval) clearInterval(interval);
      };
    }, [fetchConversations])
  );

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchConversations();
    setRefreshing(false);
  }, [fetchConversations]);

  // Normalize backend conversation shape to UI-friendly fields
  const filtered = conversations.filter((c) =>
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
        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#143373']}
              tintColor="#143373"
            />
          }
        >
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
                    {c.unreadCount > 0 && (
                      <View className="bg-blue-500 rounded-full min-w-[20px] h-5 items-center justify-center px-1.5 mt-1">
                        <Typography variant="caption-2" className="text-white font-bold" style={{ fontSize: 11 }}>
                          {c.unreadCount > 99 ? '99+' : c.unreadCount}
                        </Typography>
                      </View>
                    )}
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