import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Sample notification data - replace with actual data from your API
const notificationsData = [
  {
    id: 1,
    type: 'ride_confirmation',
    title: 'Ride Confirmed',
    message: 'Your ride for tomorrow at 8:00 AM has been confirmed with driver Sunil Fernando',
    time: '10 minutes ago',
    isRead: false,
  },
  {
    id: 2,
    type: 'driver_arrival',
    title: 'Driver Arriving Soon',
    message: 'Your driver is 5 minutes away from pickup location',
    time: '2 hours ago',
    isRead: false,
  },
  {
    id: 3,
    type: 'ride_completed',
    title: 'Ride Completed',
    message: 'Your child has safely reached International School Colombo',
    time: '1 day ago',
    isRead: true,
  },
  {
    id: 4,
    type: 'payment',
    title: 'Payment Successful',
    message: 'Payment of Rs. 1,200 has been processed successfully',
    time: '1 day ago',
    isRead: true,
  },
  {
    id: 5,
    type: 'reminder',
    title: 'Upcoming Ride Reminder',
    message: 'Don&apos;t forget! You have a ride scheduled for tomorrow at 8:00 AM',
    time: '2 days ago',
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
      case 'ride_confirmation':
        return '✅';
      case 'driver_arrival':
        return '🚗';
      case 'ride_completed':
        return '🏁';
      case 'payment':
        return '💳';
      case 'reminder':
        return '⏰';
      default:
        return '📱';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'ride_confirmation':
        return 'bg-green-100 text-green-800';
      case 'driver_arrival':
        return 'bg-blue-100 text-blue-800';
      case 'ride_completed':
        return 'bg-purple-100 text-purple-800';
      case 'payment':
        return 'bg-yellow-100 text-yellow-800';
      case 'reminder':
        return 'bg-orange-100 text-orange-800';
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
