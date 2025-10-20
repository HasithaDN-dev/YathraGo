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
import { useAuthStore } from '../../../lib/stores/auth.store';
import { usePassengerStore } from '../../../lib/stores/passenger.store';

interface ConversationItem {
  id: number;
  name: string;
  phone: string;
  lastMessage: string;
  time: string;
  timestamp: string;
  unreadCount: number;
  avatarUri?: string | null;
  childId?: number;
}

export default function ChatListScreen() {
  const [query, setQuery] = useState('');
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthStore();
  const passengerStore = usePassengerStore();

  // Auto-create conversations for all assigned children
  const ensureConversationsExist = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Get all passengers from the store
      const passengers = passengerStore.ids.map((id: number) => passengerStore.byId[id]);
      
      // Create conversations for each child if not exists
      for (const passenger of passengers) {
        if (!passenger?.child?.child_id) continue;
        
        try {
          await fetch(`${API_BASE_URL}/chat/conversations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              participantAId: user.id,
              participantAType: 'DRIVER',
              participantBId: passenger.child.child_id,
              participantBType: 'CHILD',
            }),
          });
        } catch (err) {
          console.error('Failed to create conversation for child:', passenger.child.child_id, err);
        }
      }
    } catch (error) {
      console.error('Failed to ensure conversations exist:', error);
    }
  }, [user, passengerStore]);

  // Fetch conversations function - driver only has one profile (DRIVER)
  const fetchConversations = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      // First ensure all conversations exist
      await ensureConversationsExist();

      const response = await fetch(
        `${API_BASE_URL}/chat/conversations?userId=${user.id}&userType=DRIVER`
      );
      
      if (!response.ok) {
        console.error('Failed to fetch conversations:', response.status);
        setConversations([]);
        return;
      }

      const data = await response.json();

      // Get passenger data for enrichment
      const passengers = passengerStore.ids.map((id: number) => passengerStore.byId[id]);
      const childMap = new Map(
        passengers
          .filter((p: any) => p?.child?.child_id)
          .map((p: any) => [p.child.child_id, p])
      );

      // Transform backend data to UI format
      const transformed: ConversationItem[] = data.map((c: any) => {
        const other = c.otherParticipant || {};
        const messages = c.messages || [];
        const lastMsg = messages[0] || null; // Messages come in DESC order from backend

        // Count unread messages (messages not sent by this driver and not seen)
        const unreadCount = messages.filter((msg: any) =>
          !(msg.senderId === user.id && msg.senderType === 'DRIVER') && !msg.seen
        ).length;

        // Try to get child name from passenger store first, fallback to backend data
        let displayName = other.name || 'Chat';
        let childId: number | undefined = undefined;
        
        if (other.type === 'CHILD' && other.id) {
          childId = other.id;
          const passengerData: any = childMap.get(other.id);
          if (passengerData?.child) {
            const child = passengerData.child;
            displayName = `${child.childFirstName || ''} ${child.childLastName || ''}`.trim() || other.name || 'Student';
          }
        }

        // Determine avatar URL from common fields (fallback to bundled default image)
        const avatarPath = other.profileImage || other.avatarUrl || other.imageUrl || other.avatar || '';
        const avatarUri = avatarPath
          ? avatarPath.startsWith('http')
            ? avatarPath
            : `${API_BASE_URL}/${avatarPath.replace(/^\//, '')}`
          : null;

        // Use child image from passenger store if available
        let finalAvatarUri = avatarUri;
        if (childId) {
          const passengerData: any = childMap.get(childId);
          if (passengerData?.child?.childImageUrl) {
            const childImgPath = passengerData.child.childImageUrl;
            finalAvatarUri = childImgPath.startsWith('http')
              ? childImgPath
              : `${API_BASE_URL}/${childImgPath.replace(/^\//, '')}`;
          }
        }

        return {
          id: c.id,
          name: displayName,
          phone: other.phone || '',
          lastMessage: lastMsg?.message || (lastMsg?.imageUrl ? '📷 Image' : ''),
          time: lastMsg?.timestamp 
            ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            : '',
          timestamp: lastMsg?.timestamp || c.updatedAt || '',
          unreadCount,
          avatarUri: finalAvatarUri,
          childId,
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
  }, [user, ensureConversationsExist, passengerStore.byId, passengerStore.ids]);

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

  // Filter conversations based on search query
  const filtered = conversations.filter((c) =>
    (c.name || '').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        <ScreenHeader title="Chat" showBackButton />

        {/* Search (fixed) */}
        <Card className="mx-4 mb-1 p-0 bg-transparent shadow-none">
          <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-1 shadow-sm">
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
            ) : (
              filtered.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  activeOpacity={0.8}
                  onPress={() => 
                    router.push({
                      pathname: '/(tabs)/chat/chat_room',
                      params: {
                        id: String(c.id),
                        name: c.name,
                        phone: c.phone,
                        avatarUri: c.avatarUri || '',
                        childId: c.childId ? String(c.childId) : '',
                      },
                    })
                  }
                >
                  <View className="bg-white rounded-2xl px-3 py-3 mb-3 shadow-sm flex-row items-center">
                    {c.avatarUri && c.avatarUri !== 'null' && c.avatarUri !== 'undefined' ? (
                      <Image
                        source={{ uri: c.avatarUri }}
                        style={{ width: 44, height: 44, borderRadius: 22, marginRight: 12 }}
                      />
                    ) : (
                      <Image
                        source={require('../../../assets/images/profile_Picture.png')}
                        style={{ width: 44, height: 44, borderRadius: 22, marginRight: 12 }}
                      />
                    )}
                    <View className="flex-1">
                      <Typography variant="subhead" className="text-black">
                        {c.name}
                      </Typography>
                      <Typography variant="caption-1" className="text-gray-500" numberOfLines={1}>
                        {c.lastMessage}
                      </Typography>
                    </View>
                    <View className="items-end ml-2">
                      <Typography variant="caption-1" className="text-gray-500">
                        {c.time}
                      </Typography>
                      {c.unreadCount > 0 && (
                        <View className="bg-blue-500 rounded-full min-w-[20px] h-5 items-center justify-center px-1.5 mt-1">
                          <Typography 
                            variant="caption-2" 
                            className="text-white font-bold" 
                            style={{ fontSize: 11 }}
                          >
                            {c.unreadCount > 99 ? '99+' : c.unreadCount}
                          </Typography>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
