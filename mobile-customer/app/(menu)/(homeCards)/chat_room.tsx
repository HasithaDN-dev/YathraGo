import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { View, ScrollView, Image, TextInput, TouchableOpacity, Platform, Keyboard, TouchableWithoutFeedback, Text, Linking, Alert, RefreshControl } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Typography } from '@/components/Typography';
import { ArrowLeft, PaperPlaneRight, Camera, Paperclip, Phone } from 'phosphor-react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { API_BASE_URL } from '../../../config/api';
import { useAuth } from '../../../hooks/useAuth';
import * as FileSystem from 'expo-file-system';
import { imageCache } from '../../../utils/imageCache';
import { useProfileStore } from '../../../lib/stores/profile.store';

// Minimal chat message shape for UI bubbles
interface ChatMessage {
  id: string | number;
  text?: string;
  time: string;
  mine?: boolean;
  imageUri?: string;
  seen?: boolean;
  status?: string;
}

export default function ChatRoomScreen() {
  const { id: idParam, name, phone, avatarUri } = useLocalSearchParams<{ id: string; name: string; phone?: string; avatarUri?: string }>();
  const conversationId = Number(idParam);
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<any[]>([]);
  const { activeProfile, customerProfile } = useProfileStore();
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [toolbarHeight, setToolbarHeight] = useState(56);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  // single source of truth for who is acting in the UI (active profile → child/staff, else customer)
  const getCurrentActor = useCallback(() => {
    if (activeProfile) {
      const m = String(activeProfile.id).match(/(\d+)/);
      const numericId = m ? parseInt(m[1], 10) : null;
      if (numericId && activeProfile.type === 'child') return { id: numericId, userType: 'CHILD' };
      if (numericId && activeProfile.type === 'staff') return { id: numericId, userType: 'STAFF' };
    }
    if (customerProfile?.customer_id) return { id: customerProfile.customer_id, userType: 'CUSTOMER' };
    return { id: Number(user?.id), userType: 'CUSTOMER' };
  }, [activeProfile, customerProfile, user]);
  const lastMessageIdRef = useRef<number | null>(null);
  const hasLoadedOnceRef = useRef(false);

  // Cached image component
  const CachedImage = ({ imageUri, style }: { imageUri: string; style: any }) => {
    const [cachedUri, setCachedUri] = useState<string | null>(null);

    useEffect(() => {
      const loadImage = async () => {
        try {
          // If it's already a local URI, use it directly
          if (imageUri.startsWith('file://') || imageUri.startsWith('content://')) {
            setCachedUri(imageUri);
            return;
          }

          // Try to get from cache first
          let cachedImage = await imageCache.getCachedImage(imageUri);
          if (!cachedImage) {
            // If not in cache, download and cache it
            cachedImage = await imageCache.cacheImage(imageUri);
          }
          setCachedUri(cachedImage || imageUri);
        } catch (error) {
          console.error('Error loading cached image:', error);
          setCachedUri(imageUri);
        }
      };

      loadImage();
    }, [imageUri]);

    return (
      <Image
        source={{ uri: cachedUri || imageUri }}
        style={style}
        resizeMode="cover"
      />
    );
  };

  // Fetch messages function
  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      console.warn('[chat_room] fetchMessages called with invalid conversationId:', conversationId, 'idParam:', idParam);
      return;
    }
    try {
      console.log('[chat_room] fetching messages for conversationId:', conversationId);
      const res = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}/messages`);
      console.log('[chat_room] fetch messages status:', res.status);
      if (!res.ok) {
        const txt = await res.text();
        console.error('[chat_room] fetch messages failed:', res.status, txt);
        return;
      }
      const data = await res.json();
      console.log('[chat_room] fetched messages count:', Array.isArray(data) ? data.length : 'non-array', data && data.slice ? data.slice(0,3) : data);
      
      // Check if there are new messages
      const hasNewMessages = data.length > 0 && 
        lastMessageIdRef.current !== null && 
        data[data.length - 1].id !== lastMessageIdRef.current;
      
  setMessages(Array.isArray(data) ? data : []);
      
      // Update last message ID
      if (data.length > 0) {
        lastMessageIdRef.current = data[data.length - 1].id;
      }
      
      // Auto-scroll to bottom if there are new messages
      if (hasNewMessages) {
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  }, [conversationId]);

  // Mark messages as seen
  const markMessagesAsSeen = useCallback(async () => {
    if (!conversationId || !user) return;
    try {
      await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}/mark-seen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: Number(user.id),
          userType: 'CUSTOMER',
        }),
      });
      // Refresh messages to get updated seen status
      await fetchMessages();
    } catch (error) {
      console.error('Failed to mark messages as seen:', error);
    }
  }, [conversationId, user, fetchMessages]);

  // Initial load
  useEffect(() => {
    if (!conversationId) return;
    // Only show loading on the very first load ever
    if (!hasLoadedOnceRef.current) {
      setLoading(true);
      fetchMessages().finally(() => {
        setLoading(false);
        hasLoadedOnceRef.current = true;
      });
    }
  }, [conversationId, fetchMessages]);

  // Auto-refresh when screen is focused (poll every 3 seconds)
  useFocusEffect(
    useCallback(() => {
      let interval: NodeJS.Timeout;
      
      // Immediate fetch when screen comes into focus
      fetchMessages().then(() => {
        // Mark messages as seen after initial fetch
        markMessagesAsSeen();
      });
      
      // Set up polling every 3 seconds
      interval = setInterval(() => {
        fetchMessages();
      }, 3000);

      return () => {
        if (interval) clearInterval(interval);
      };
    }, [fetchMessages, markMessagesAsSeen])
  );

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMessages();
    setRefreshing(false);
  }, [fetchMessages]);

  // Ensure input bar stays above keyboard: hide emoji panel when keyboard opens
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardVisible(true);
      setKeyboardHeight(e.endCoordinates?.height ?? 0);
    });
    const changeSub = Keyboard.addListener('keyboardDidChangeFrame', (e) => {
      setKeyboardVisible((e.endCoordinates?.height ?? 0) > 0);
      setKeyboardHeight(e.endCoordinates?.height ?? 0);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      changeSub.remove();
      hideSub.remove();
    };
  }, []);

  const dial = () => {
    const tel = (phone || '').trim();
    if (!tel) return;
    Linking.openURL(`tel:${tel}`);
  };

  const Header = useMemo(() => (
    <View className="px-4 pt-2 pb-3 bg-white">
      <View className="bg-white rounded-2xl px-3 py-3 shadow-sm flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-2" hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ArrowLeft size={22} color="#000" />
        </TouchableOpacity>
        {/* show avatar passed via route params if available */}
        {avatarUri && avatarUri !== 'null' && avatarUri !== 'undefined' ? (
          <Image source={{ uri: avatarUri }} style={{ width: 36, height: 36, borderRadius: 18, marginRight: 10 }} />
        ) : (
          <Image source={require('../../../assets/images/profile_Picture.png')} style={{ width: 36, height: 36, borderRadius: 18, marginRight: 10 }} />
        )}
        <View className="flex-1">
          <Typography variant="subhead" className="text-black">{name || 'Driver'}</Typography>
          <Typography variant="caption-1" className="text-brand-neutralGray">{''}</Typography>
        </View>
        <TouchableOpacity onPress={dial} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Phone size={22} color="#143373" />
        </TouchableOpacity>
      </View>
    </View>
  ), [name, phone]);

  // Send a message to backend
  const send = async (overrideText?: string) => {
    const textToSend = (overrideText ?? draft).trim();
    if (!textToSend || !user || !conversationId) return;
    setDraft('');
    try {
      const actor = getCurrentActor();
      const res = await fetch(`${API_BASE_URL}/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          senderId: actor.id,
          senderType: actor.userType,
          message: textToSend,
        }),
      });
      if (res.ok) {
        // Re-fetch messages after sending
        await fetchMessages();
      }
    } catch {}
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  };

  const uploadImageToServer = async (imageUri: string): Promise<string | null> => {
    try {
      // Test connectivity first
      console.log('Testing connectivity to:', `${API_BASE_URL}/chat/conversations`);
      try {
        const testResponse = await fetch(`${API_BASE_URL}/chat/conversations?userId=1&userType=CUSTOMER`);
        console.log('Connectivity test status:', testResponse.status);
      } catch (connectError) {
        console.error('Connectivity test failed:', connectError);
        Alert.alert('Network Error', 'Cannot connect to server. Please check your internet connection and make sure the backend server is running.');
        return null;
      }

      // Create FormData properly for React Native
      const formData = new FormData();
      
      // Get file info to determine the correct type
      const filename = imageUri.split('/').pop() || 'image.jpg';
      const fileType = filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
      
      formData.append('file', {
        uri: imageUri,
        type: fileType,
        name: filename,
      } as any);

      console.log('Uploading image:', { imageUri, filename, fileType });
      console.log('API_BASE_URL:', API_BASE_URL);
      console.log('Full upload URL:', `${API_BASE_URL}/chat/upload-image`);

      const response = await fetch(`${API_BASE_URL}/chat/upload-image`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let fetch set it automatically for FormData
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('Upload response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Upload result:', result);
        return result.success ? result.imageUrl : null;
      } else {
        const errorText = await response.text();
        console.error('Upload failed:', response.status, errorText);
        return null;
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      return null;
    }
  };
      


  const sendImageMessage = async (imageUri: string) => {
    if (!user || !conversationId) return;

    let tempMsgId: string | null = null;

    try {
      // Show optimistic UI update
      tempMsgId = String(Date.now());
      const tempMsg: ChatMessage = { 
        id: tempMsgId, 
        imageUri: imageUri, 
        time: 'now', 
        mine: true 
      };
      setMessages((prev) => [...prev, tempMsg]);
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));

      // Upload image to server
      const imageUrl = await uploadImageToServer(imageUri);
      
      if (imageUrl) {
        // Send message with uploaded image URL
        const actor = getCurrentActor();
        const res = await fetch(`${API_BASE_URL}/chat/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId,
            senderId: actor.id,
            senderType: actor.userType,
            message: null,
            imageUrl: imageUrl,
          }),
        });

        if (res.ok) {
          // Re-fetch messages after sending
          await fetchMessages();
        } else {
          // Remove the optimistic update if failed
          if (tempMsgId) {
            setMessages((prev) => prev.filter(msg => msg.id !== tempMsgId));
          }
          Alert.alert('Error', 'Failed to send image');
        }
      } else {
        // Remove the optimistic update if upload failed
        if (tempMsgId) {
          setMessages((prev) => prev.filter(msg => msg.id !== tempMsgId));
        }
        Alert.alert('Error', 'Failed to upload image');
      }
    } catch (error) {
      console.error('Send image error:', error);
      // Remove the optimistic update if failed
      if (tempMsgId) {
        setMessages((prev) => prev.filter(msg => msg.id !== tempMsgId));
      }
      Alert.alert('Error', 'Failed to send image');
    }
  };

  const captureAndSendImage = async () => {
    try {
      Keyboard.dismiss();
      console.log('Requesting camera permissions...');
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      console.log('Camera permission status:', perm.status);
      if (perm.status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is needed to take photos');
        return;
      }
      console.log('Launching camera...');
      const res = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });
      console.log('Camera result:', res);
      if (!res.canceled && res.assets && res.assets.length > 0) {
        const uri = res.assets[0].uri;
        console.log('Image captured, URI:', uri);
        await sendImageMessage(uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to capture image');
    }
  };

  const pickAndSendImage = async () => {
    try {
      Keyboard.dismiss();
      console.log('Requesting media library permissions...');
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('Media library permission status:', perm.status);
      if (perm.status !== 'granted') {
        Alert.alert('Permission Required', 'Photo library permission is needed to select images');
        return;
      }
      console.log('Launching image library...');
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        selectionLimit: 1,
      });
      console.log('Image library result:', res);
      if (!res.canceled && res.assets && res.assets.length > 0) {
        const uri = res.assets[0].uri;
        console.log('Image selected, URI:', uri);
        await sendImageMessage(uri);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const Bubble = ({ m }: { m: ChatMessage }) => {
    // Status indicator component (only for sent messages)
    const StatusIndicator = () => {
      if (!m.mine) return null;
      
      const getStatusIcon = () => {
        if (m.seen || m.status === 'SEEN') {
          // Double check mark (seen)
          return (
            <View className="flex-row ml-1">
              <Text style={{ fontSize: 10, color: '#3B82F6' }}>✓✓</Text>
            </View>
          );
        } else if (m.status === 'DELIVERED') {
          // Double check mark (delivered but not seen)
          return (
            <View className="flex-row ml-1">
              <Text style={{ fontSize: 10, color: '#9CA3AF' }}>✓✓</Text>
            </View>
          );
        } else {
          // Single check mark (sent)
          return (
            <View className="flex-row ml-1">
              <Text style={{ fontSize: 10, color: '#9CA3AF' }}>✓</Text>
            </View>
          );
        }
      };

      return getStatusIcon();
    };

    if (m.imageUri) {
      return (
        <View className={`${m.mine ? 'self-end' : 'self-start'} mb-3`}>
          <CachedImage
            imageUri={m.imageUri}
            style={{ width: 220, height: 160, borderRadius: 12, backgroundColor: '#e5e7eb' }}
          />
          <View className="flex-row items-center mt-1 self-end">
            <Typography variant="caption-2" className="text-brand-neutralGray">{m.time}</Typography>
            <StatusIndicator />
          </View>
        </View>
      );
    }
    const isThumbsUpOnly = (m.text?.trim() ?? '') === '👍';
    if (isThumbsUpOnly) {
      return (
        <View className={`${m.mine ? 'self-end' : 'self-start'} mb-3`}>
          <Text style={{ fontSize: 36, lineHeight: 40 }}>{'👍'}</Text>
          <View className="flex-row items-center mt-1 self-end">
            <Typography variant="caption-2" className="text-brand-neutralGray">{m.time}</Typography>
            <StatusIndicator />
          </View>
        </View>
      );
    }
    return (
      <View
        className={`max-w-[75%] px-3 py-2 mb-3 ${m.mine ? 'self-end bg-yellow-300' : 'self-start bg-brand-lightNavy/20'}`}
        style={{
          borderTopLeftRadius: m.mine ? 16 : 0,
          borderTopRightRadius: m.mine ? 0 : 16,
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
        }}
      >
        <Typography variant="footnote" className="text-black">{m.text}</Typography>
        <View className="flex-row items-center mt-1 self-end">
          <Typography variant="caption-2" className="text-brand-neutralGray">{m.time}</Typography>
          <StatusIndicator />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {Header}
  <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); }}>
        <View className="flex-1">
          <ScrollView
            ref={scrollRef}
            className="flex-1 px-4"
            contentContainerStyle={{
              paddingTop: 8,
              // Avoid double counting safe area when keyboard is open; keep a small buffer
              paddingBottom:
                toolbarHeight +
                (keyboardVisible ? 0 : insets.bottom),
            }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            }
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {loading ? (
              <Typography variant="body" className="text-center mt-8">Loading...</Typography>
            ) : messages.length === 0 ? (
              <Typography variant="body" className="text-center mt-8">No messages.</Typography>
            ) : messages.map((m) => {
              const actor = getCurrentActor();
              const bubble: ChatMessage = {
                id: m.id,
                // mark as mine when the message sender matches the current active actor
                mine: m.senderId === actor.id && m.senderType === actor.userType,
                text: m.message,
                imageUri: m.imageUrl ? `${API_BASE_URL}/${m.imageUrl}` : undefined,
                time: m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                seen: m.seen,
                status: m.status,
              };
              return <Bubble key={m.id} m={bubble} />;
            })}
          </ScrollView>

          {/* Absolute overlay for emoji panel and toolbar */}
          <View
            pointerEvents="box-none"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              // Add a tiny safety offset on Android to counter nav bar overlaps
              bottom:
                (keyboardVisible
                  ? keyboardHeight + Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 0)
                  : 0),
            }}
          >
            {/* Input Toolbar */}
      <SafeAreaView edges={[]}>
              <View
                className={`px-4 pb-0 ${keyboardVisible ? 'mb-1' : 'mb-2'}`}
        style={{ paddingBottom: keyboardVisible ? 0 : Math.max(insets.bottom - 10, 0) }}
                onLayout={(e) => setToolbarHeight(e.nativeEvent.layout.height)}
              >
                <View className="bg-white rounded-full px-3 py-2 flex-row items-center shadow border border-gray-100">
                  {/* Attach (Gallery) */}
                  <TouchableOpacity onPress={pickAndSendImage} className="mr-2" activeOpacity={0.7}>
                    <Paperclip size={22} color="#6b7280" />
                  </TouchableOpacity>

                  {/* Camera */}
                  <TouchableOpacity
                    onPress={captureAndSendImage}
                    className="mr-2"
                    activeOpacity={0.7}
                  >
                    <Camera size={22} color="#6b7280" />
                  </TouchableOpacity>

                  {/* Input */}
                  <View className="flex-1 bg-gray-50 rounded-2xl px-3 py-2" style={{ maxHeight: 120, minHeight: 40 }}>
                    <TextInput
                      value={draft}
                      onChangeText={setDraft}
                      placeholder="Message"
                      placeholderTextColor="#9CA3AF"
                      className="text-black"
                      multiline
                      style={{ maxHeight: 120, lineHeight: 18, ...(Platform.OS === 'android' ? { textAlignVertical: 'center' as const } : {}) }}
                      returnKeyType="send"
                      onSubmitEditing={() => draft.trim() && send()}
                    />
                  </View>

                  {/* Emoji toggle */}
                  <TouchableOpacity
                    onPress={() => send('👍')}
                    className="mx-2"
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 22, lineHeight: 24 }}>{'👍'}</Text>
                  </TouchableOpacity>

                  {/* Send */}
                  <TouchableOpacity onPress={() => send()} className="bg-brand-deepNavy rounded-full w-10 h-10 items-center justify-center" activeOpacity={0.8}>
                    <PaperPlaneRight size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </SafeAreaView>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}