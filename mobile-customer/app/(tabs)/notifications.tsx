import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

interface Notification {
  id: string;
  sender: string;
  message: string;
  time: string;
  type: 'alert' | 'system' | 'other';
  isExpanded: boolean;
}

export default function NotificationsScreen() {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchInput, setSearchInput] = useState('');
  const [suggestedSenders, setSuggestedSenders] = useState<string[]>([]);
  const [selectedSender, setSelectedSender] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([
    // System messages (use first card style)
    {
      id: '1',
      sender: 'System',
      message: 'Your payment for July has been processed successfully.',
      time: '2 min ago',
      type: 'system',
      isExpanded: false
    },
    {
      id: '2',
      sender: 'System',
      message: 'A new update is available. Please update your app.',
      time: '10 min ago',
      type: 'system',
      isExpanded: false
    },
    // Alerts (use red warning icon)
    {
      id: '3',
      sender: 'School Admin',
      message: 'School will be closed tomorrow due to weather conditions.',
      time: '1 hour ago',
      type: 'alert',
      isExpanded: false
    },
    {
      id: '4',
      sender: 'Driver',
      message: 'Your pickup is delayed due to traffic.',
      time: '30 min ago',
      type: 'alert',
      isExpanded: false
    },
    // Other (use profile image)
    {
      id: '5',
      sender: 'Kasun Fernando',
      message: 'Can you please confirm the pickup location for today?',
      time: '5 min ago',
      type: 'other',
      isExpanded: false
    },
    {
      id: '6',
      sender: 'Kevin Silva',
      message: 'Thank you for the safe ride!',
      time: '15 min ago',
      type: 'other',
      isExpanded: false
    }
  ]);



  const toggleNotification = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isExpanded: !notification.isExpanded }
          : notification
      )
    );
  };

  const getNotificationIcon = (type: string, sender?: string) => {
    switch (type) {
      case 'system':
        return <Gear size={20} color="#8B5CF6" weight="fill" />;
      case 'alert':
        return <Warning size={20} color="#EF4444" weight="fill" />;
      case 'other':
        return (
          <Image
            source={require('../../assets/images/profile_Picture.png')}
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
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView className="flex-1 px-4 space-y-6">
        {/* Search/Filter Section */}
        <Card className="p-0 mb-2">
          <View className="bg-white rounded-xl p-3">
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
            <View className="flex-row">
              {['All', 'Alerts', 'System', 'Others'].map((filter) => (
                <TouchableOpacity
                  key={filter}
                  className={`px-4 py-2 rounded-full ${selectedFilter === filter ? 'bg-brand-deepNavy' : 'bg-brand-lightGray'}${filter !== 'All' ? ' ml-3' : ''}`}
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
            
            {/* <TouchableOpacity>
              <Typography variant="subhead" className="text-brand-brightOrange">
                Mark all read
              </Typography>
            </TouchableOpacity> */}
          </View>
        </Card>

        {/* Notifications List */}
        <View className="space-y-5">
          {notifications
            .filter((notification) => {
              if (selectedFilter === 'All') return true;
              if (selectedFilter === 'Alerts') return notification.type === 'alert';
              if (selectedFilter === 'System') return notification.type === 'system';
              if (selectedFilter === 'Others') return notification.type === 'other';
              return true;
            })
            .filter((notification) => {
              if (searchInput.length === 0) return true;
              if (selectedSender) return notification.sender === selectedSender;
              return notification.sender.toLowerCase().includes(searchInput.toLowerCase());
            })
            .map((notification, idx) => (
              <Card
                key={notification.id}
                className="p-4 mt-2"
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}