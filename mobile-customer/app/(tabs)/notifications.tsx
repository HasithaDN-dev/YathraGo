import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { 
  MagnifyingGlass,
  CaretUp,
  CaretDown,
  Gear,
  User,
  Warning
} from 'phosphor-react-native';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/ui/Card';
import { useNotificationsStore } from '../../lib/stores/notifications.store';
import { useAuthStore } from '../../lib/stores/auth.store';
import { useProfileStore } from '../../lib/stores/profile.store';
import { ReceiverType } from '../../lib/api/notifications.api';

// Using store's NotificationDto type; no additional UI type needed

export default function NotificationsScreen() {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchInput, setSearchInput] = useState('');
  const [suggestedSenders, setSuggestedSenders] = useState<string[]>([]);
  const [selectedSender, setSelectedSender] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { notifications, loadForTargets, toggleExpanded } = useNotificationsStore();
  const { accessToken } = useAuthStore();
  const { activeProfile, customerProfile } = useProfileStore();

  // Fetch notifications function
  const fetchNotifications = useCallback(async () => {
    if (!accessToken) return;

    const targets: Array<{ userType: ReceiverType; userId: number }> = [];

    // Always include parent customer notifications if available
    if (customerProfile?.customer_id) {
      targets.push({ userType: 'CUSTOMER', userId: customerProfile.customer_id });
    }

    // Add active profile target
    if (activeProfile) {
      // IDs are strings like child-12 or staff-34; extract numeric id
      const match = String(activeProfile.id).match(/(\d+)/);
      const numericId = match ? parseInt(match[1], 10) : undefined;

      if (activeProfile.type === 'child' && numericId) {
        targets.push({ userType: 'CHILD', userId: numericId });
      } else if (activeProfile.type === 'staff' && numericId) {
        targets.push({ userType: 'STAFF', userId: numericId });
      }
    }

    if (targets.length > 0) {
      await loadForTargets(accessToken, targets);
    }
  }, [accessToken, activeProfile, customerProfile?.customer_id, loadForTargets]);

  // Initial load
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Auto-refresh when screen is focused (poll every 5 seconds)
  useFocusEffect(
    useCallback(() => {
      let interval: NodeJS.Timeout | null = null;
      
      // Immediate fetch when screen comes into focus
      fetchNotifications();
      
      // Polling every 5 seconds
      interval = setInterval(() => {
        fetchNotifications();
      }, 5000);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    }, [fetchNotifications])
  );

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, [fetchNotifications]);



  const toggleNotification = (id: string | number) => {
    toggleExpanded(id);
  };

  const getNotificationIcon = (type: string, sender?: string) => {
    switch (type) {
      case 'system':
        return <Gear size={20} color="#8B5CF6" weight="fill" />;
      case 'alert':
        return <Warning size={20} color="#EF4444" weight="fill" />;
      case 'chat':
        return (
          <Image
            source={require('../../assets/images/chat.png')}
            style={{ width: 32, height: 32, borderRadius: 16, resizeMode: 'cover' }}
          />
        );
      case 'other':
        return (
          <Image
            source={require('../../assets/images/notificationBell.png')}
            style={{ width: 32, height: 32, borderRadius: 16, resizeMode: 'cover' }}
          />
        );
      default:
        return <User size={20} color="#F97316" weight="fill" />;
    }
  };

  const getNotificationBackground = (type: string) => {
    switch (type) {
      case 'alert':
        return 'bg-red-500'; // errorRed
      case 'system':
        return 'bg-yellow-400'; // softOrange
      case 'chat':
        return 'bg-blue-400'; // chat blue
      case 'other':
        return 'bg-gray-300'; // lightGray
      default:
        return 'bg-gray-300';
    }
  };

  // Dynamic sender suggestions
  React.useEffect(() => {
    if (searchInput.length === 0) {
      setSuggestedSenders([]);
      setSelectedSender(null);
      return;
    }
    const uniqueSenders = Array.from(new Set(notifications.map(n => n.sender)));
    const filtered = uniqueSenders.filter(sender =>
      sender.toLowerCase().includes(searchInput.toLowerCase())
    );
    setSuggestedSenders(filtered);
    setSelectedSender(null);
  }, [searchInput, notifications]);

  return (
  <SafeAreaView edges={['left','right','bottom']} className="flex-1 bg-gray-100">
      {/* Search/Filter Header (fixed) */}
      <View className="px-4 space-y-6 mt-3">
        {/* Search Section */}
        <Card className="p-0 mb-3">
          <View className="bg-white rounded-xl p-1">
            <View className="flex-row items-center">
              <MagnifyingGlass size={20} color="#000000" weight="regular" />
              <TextInput
                className="flex-1 ml-3 text-black"
                placeholder="Search by person name"
                placeholderTextColor="#9CA3AF"
                value={searchInput}
                onChangeText={setSearchInput}
                autoCorrect={false}
                autoCapitalize="none"
              />
            </View>
            {/* Suggestions dropdown */}
            {searchInput.length > 0 && suggestedSenders.length > 0 && (
              <View className="bg-white border border-gray-200 rounded-lg mt-2 max-h-32">
                {suggestedSenders.map(sender => (
                  <TouchableOpacity
                    key={sender}
                    className="px-3 py-2 hover:bg-gray-100"
                    onPress={() => {
                      setSelectedSender(sender);
                      setSearchInput(sender);
                      setSuggestedSenders([]);
                    }}
                  >
                    <Typography variant="subhead" className="text-black">{sender}</Typography>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </Card>

        {/* Filter Options */}
        <Card className="p-4">
          <View className="flex-row justify-between items-center">
            <View className="flex-row flex-wrap">
              {['All', 'Alerts', 'System', 'Others'].map((filter) => (
                <TouchableOpacity
                  key={filter}
                  className={`px-4 py-2 rounded-full ${selectedFilter === filter ? 'bg-brand-deepNavy' : 'bg-brand-lightGray'}${filter !== 'All' ? ' ml-3' : ''} mb-2`}
                  onPress={() => setSelectedFilter(filter)}
                >
                  <Typography
                    variant="subhead"
                    className={selectedFilter === filter ? 'text-white' : 'text-brand-neutralGray'}
                  >
                    {filter}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Card>
      </View>

      {/* Notifications List (scrollable) */}
      <ScrollView 
        className="flex-1 px-4" 
        contentContainerClassName="space-y-5 pb-6"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        {notifications
          .filter((notification) => {
            if (selectedFilter === 'All') return true;
            if (selectedFilter === 'Alerts') return notification.type === 'alert';
            if (selectedFilter === 'System') return notification.type === 'system';
            if (selectedFilter === 'Others') return notification.type === 'other' || notification.type === 'chat';
            return true;
          })
          .filter((notification) => {
            if (searchInput.length === 0) return true;
            if (selectedSender) return notification.sender === selectedSender;
            return notification.sender.toLowerCase().includes(searchInput.toLowerCase());
          })
          .map((notification) => (
            <Card
              key={notification.id}
              className="p-4 mt-3"
            >
              <View className="flex-row items-start">
                {/* Notification Icon */}
                <View className={`w-10 h-10 rounded-full ${getNotificationBackground(notification.type)} items-center justify-center mr-3`}>
                  {getNotificationIcon(notification.type, notification.sender)}
                </View>

                {/* Notification Content */}
                <View className="flex-1">
                  <View className="flex-row items-start justify-between mb-2">
                    <Typography variant="subhead" weight="bold" className="text-black">
                      {notification.sender}
                    </Typography>
                    <Typography variant="footnote" className="text-gray-500">
                      {notification.time}
                    </Typography>
                  </View>
                  <Typography
                    variant="subhead"
                    className="text-black mb-3"
                    numberOfLines={notification.isExpanded ? undefined : 1}
                  >
                    {notification.message}
                  </Typography>
                  {/* Expand/Collapse Button */}
                  <TouchableOpacity
                    className="self-end"
                    onPress={() => toggleNotification(notification.id)}
                  >
                    {notification.isExpanded ? (
                      <CaretUp size={16} color="#000000" weight="regular" />
                    ) : (
                      <CaretDown size={16} color="#000000" weight="regular" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          ))}
      </ScrollView>
  </SafeAreaView>
  );
}