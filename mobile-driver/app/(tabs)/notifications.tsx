import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Sample notification data - replace with actual data from your API
const notificationsData = [
  {
    id: 1,
    type: 'ride_request',
    title: 'New Ride Request',
    message: 'A passenger is requesting a ride from Galle Face to Kandy',
    time: '2 minutes ago',
    isRead: false,
  },
  {
    id: 2,
    type: 'earnings',
    title: 'Weekly Earnings Summary',
    message: 'You earned Rs. 15,750 this week. Keep up the great work!',
    time: '1 hour ago',
    isRead: false,
  },
  {
    id: 3,
    type: 'system',
    title: 'App Update Available',
    message: 'Update to the latest version for improved performance',
    time: '3 hours ago',
    isRead: true,
  },
  {
    id: 4,
    type: 'ride_completed',
    title: 'Trip Completed',
    message: 'You successfully completed a trip to Bandaranaike Airport',
    time: '5 hours ago',
    isRead: true,
  },
  {
    id: 5,
    type: 'promotion',
    title: 'Bonus Opportunity',
    message: 'Complete 5 more rides today to earn a Rs. 500 bonus!',
    time: '1 day ago',
    isRead: true,
  },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState(notificationsData);

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ride_request':
        return '🚗';
      case 'earnings':
        return '💰';
      case 'system':
        return '⚙️';
      case 'ride_completed':
        return '✅';
      case 'promotion':
        return '🎉';
      default:
        return '📱';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'ride_request':
        return 'bg-blue-100 text-blue-800';
      case 'earnings':
        return 'bg-green-100 text-green-800';
      case 'system':
        return 'bg-gray-100 text-gray-800';
      case 'ride_completed':
        return 'bg-green-100 text-green-800';
      case 'promotion':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const renderNotificationItem = (item: typeof notificationsData[0]) => (
    <TouchableOpacity
      key={item.id}
      className={`p-4 border-b border-gray-100 ${!item.isRead ? 'bg-blue-50' : 'bg-white'}`}
      onPress={() => markAsRead(item.id)}
    >
      <View className="flex-row">
        <View className="mr-3 mt-1">
          <Text className="text-xl">{getNotificationIcon(item.type)}</Text>
        </View>
        
        <View className="flex-1">
          <View className="flex-row justify-between items-start mb-1">
            <Text className={`text-base font-semibold ${!item.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
              {item.title}
            </Text>
            {!item.isRead && (
              <View className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-2" />
            )}
          </View>
          
          <Text className={`text-sm mb-2 ${!item.isRead ? 'text-gray-800' : 'text-gray-600'}`}>
            {item.message}
          </Text>
          
          <View className="flex-row justify-between items-center">
            <Text className="text-xs text-gray-500">{item.time}</Text>
            <View className={`px-2 py-1 rounded-full ${getNotificationColor(item.type)}`}>
              <Text className="text-xs font-medium capitalize">
                {item.type.replace('_', ' ')}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="bg-white px-6 pt-12 pb-4 border-b border-gray-200">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-gray-800">Notifications</Text>
            {unreadCount > 0 && (
              <Text className="text-sm text-gray-600 mt-1">
                {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
              </Text>
            )}
          </View>
          
          {unreadCount > 0 && (
            <TouchableOpacity 
              onPress={markAllAsRead}
              className="bg-blue-600 px-4 py-2 rounded-lg"
            >
              <Text className="text-white text-sm font-medium">Mark All Read</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Notifications List */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {notifications.map((item) => renderNotificationItem(item))}
        
        {/* Empty state - uncomment if no notifications */}
        {/* 
        {notifications.length === 0 && (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-500 text-lg mb-2">No notifications</Text>
            <Text className="text-gray-400 text-center">
              You are all caught up!
            </Text>
          </View>
        )}
        */}
      </ScrollView>
    </View>
  );
}
