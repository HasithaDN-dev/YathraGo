import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, ScrollView, Image, TextInput, TouchableOpacity, Platform, Keyboard, TouchableWithoutFeedback, Text, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';
import { ArrowLeft, PaperPlaneRight, Camera, Paperclip, Phone } from 'phosphor-react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { API_BASE_URL } from '../../../config/api';
import { useAuth } from '../../../hooks/useAuth';

// Minimal chat message shape for UI bubbles
interface ChatMessage {
  id: string | number;
  text?: string;
  time: string;
  mine?: boolean;
  imageUri?: string;
}

export default function ChatRoomScreen() {
  const { id: idParam, name, phone } = useLocalSearchParams<{ id: string; name: string; phone?: string }>();
  const conversationId = Number(idParam);
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<any[]>([]);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [toolbarHeight, setToolbarHeight] = useState(56);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Fetch messages for this conversation
  useEffect(() => {
    if (!conversationId) return;
    setLoading(true);
    fetch(`${API_BASE_URL}/chat/conversations/${conversationId}/messages`)
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, [conversationId]);

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
        <Image source={require('../../../assets/images/profile_Picture.png')} style={{ width: 36, height: 36, borderRadius: 18, marginRight: 10 }} />
        <View className="flex-1">
          <Typography variant="subhead" className="text-black">{name || 'Driver'}</Typography>
          <Typography variant="caption-1" className="text-brand-neutralGray">{/* last seen placeholder */} </Typography>
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
      const res = await fetch(`${API_BASE_URL}/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          senderId: Number(user.id),
          senderType: 'CUSTOMER',
          message: textToSend,
        }),
      });
      if (res.ok) {
        // Re-fetch messages after sending
        fetch(`${API_BASE_URL}/chat/conversations/${conversationId}/messages`)
          .then((r) => r.json())
          .then((data) => setMessages(data));
      }
    } catch {}
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  };

  const captureAndSendImage = async () => {
    try {
      Keyboard.dismiss();
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (perm.status !== 'granted') {
        return;
      }
      const res = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        const uri = res.assets[0].uri;
        const imgMsg: ChatMessage = { id: String(Date.now()), imageUri: uri, time: 'now', mine: true };
        setMessages((prev) => [...prev, imgMsg]);
        requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
      }
    } catch {
      // no-op
    }
  };

  const pickAndSendImage = async () => {
    try {
      Keyboard.dismiss();
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== 'granted') {
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        selectionLimit: 1,
      } as any);
      if (!res.canceled && res.assets && res.assets.length > 0) {
        const uri = res.assets[0].uri;
        const imgMsg: ChatMessage = { id: String(Date.now()), imageUri: uri, time: 'now', mine: true };
        setMessages((prev) => [...prev, imgMsg]);
        requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
      }
    } catch {
      // no-op
    }
  };

  const Bubble = ({ m }: { m: ChatMessage }) => {
  if (m.imageUri) {
      return (
        <View className={`${m.mine ? 'self-end' : 'self-start'} mb-3`}>
          <Image
            source={{ uri: m.imageUri }}
      style={{ width: 220, height: 160, borderRadius: 0, backgroundColor: '#e5e7eb' }}
            resizeMode="cover"
          />
          <Typography variant="caption-2" className="text-brand-neutralGray mt-1 self-end">{m.time}</Typography>
        </View>
      );
    }
  const isThumbsUpOnly = (m.text?.trim() ?? '') === '👍';
    if (isThumbsUpOnly) {
      return (
        <View className={`${m.mine ? 'self-end' : 'self-start'} mb-3`}>
          <Text style={{ fontSize: 36, lineHeight: 40 }}>{'👍'}</Text>
          <Typography variant="caption-2" className="text-brand-neutralGray mt-1 self-end">{m.time}</Typography>
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
        <Typography variant="caption-2" className="text-brand-neutralGray mt-1 self-end">{m.time}</Typography>
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
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {loading ? (
              <Typography variant="body" className="text-center mt-8">Loading...</Typography>
            ) : messages.length === 0 ? (
              <Typography variant="body" className="text-center mt-8">No messages.</Typography>
            ) : messages.map((m) => {
              const bubble: ChatMessage = {
                id: m.id,
                mine: m.senderId === Number(user?.id) && m.senderType === 'CUSTOMER',
                text: m.message,
                imageUri: m.imageUrl,
                time: m.timestamp ? new Date(m.timestamp).toLocaleTimeString() : '',
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