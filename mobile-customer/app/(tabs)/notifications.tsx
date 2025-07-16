import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';
import { ProfileSwitcher } from '@/components/ProfileSwitcher';
import { useProfile } from '@/contexts/ProfileContext';

export default function NotificationsScreen() {
  const { activeProfile } = useProfile();

  // Mock notifications data
  const mockNotifications = [
    {
      id: '1',
      title: 'Trip Reminder',
      message: 'Your ride to school is scheduled in 30 minutes',
      time: '2 hours ago',
      type: 'reminder',
      read: false
    },
    {
      id: '2',
      title: 'Driver Assigned',
      message: 'John has been assigned as your driver for today&apos;s trip',
      time: '1 day ago',
      type: 'info',
      read: true
    },
    {
      id: '3',
      title: 'Payment Successful',
      message: 'Payment of $12.50 for your last trip has been processed',
      time: '2 days ago',
      type: 'success',
      read: true
    },
    {
      id: '4',
      title: 'Trip Cancelled',
      message: 'Your scheduled trip to the library has been cancelled',
      time: '3 days ago',
      type: 'warning',
      read: true
    }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reminder':
        return '⏰';
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      default:
        return '📱';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'reminder':
        return 'bg-brand-brightOrange';
      case 'info':
        return 'bg-brand-deepNavy';
      case 'success':
        return 'bg-success';
      case 'warning':
        return 'bg-warning';
      default:
        return 'bg-brand-neutralGray';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ProfileSwitcher />
      
      <ScrollView className="flex-1 px-4 py-6">
        <View className="space-y-6">
          {/* Header */}
          <View className="space-y-2">
            <Typography level="title-1" className="text-black">
              Notifications
            </Typography>
            <Typography level="body" className="text-brand-neutralGray">
              {activeProfile?.type === 'child' 
                ? `Stay updated on your trips, ${activeProfile.name}`
                : `Updates for ${activeProfile?.name}&apos;s activities`
              }
            </Typography>
          </View>

          {/* Filter Options */}
          <View className="flex-row justify-between items-center">
            <View className="flex-row">
              <TouchableOpacity className="bg-brand-deepNavy px-4 py-2 rounded-full">
                <Typography level="subhead" className="text-white">
                  All
                </Typography>
              </TouchableOpacity>
              <TouchableOpacity className="ml-3 bg-brand-lightGray px-4 py-2 rounded-full">
                <Typography level="subhead" className="text-brand-neutralGray">
                  Unread
                </Typography>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity>
              <Typography level="subhead" className="text-brand-brightOrange">
                Mark all read
              </Typography>
            </TouchableOpacity>
          </View>

          {/* Notifications List */}
          <View className="space-y-3">
            {mockNotifications.map((notification) => (
              <TouchableOpacity 
                key={notification.id}
                className={`rounded-2xl p-4 border ${
                  notification.read 
                    ? 'bg-white border-brand-lightGray' 
                    : 'bg-brand-lightestBlue border-brand-deepNavy'
                }`}
              >
                <View className="flex-row">
                  {/* Notification Icon */}
                  <View className={`w-10 h-10 rounded-full ${getNotificationColor(notification.type)} items-center justify-center`}>
                    <Typography level="subhead" className="text-white">
                      {getNotificationIcon(notification.type)}
                    </Typography>
                  </View>

                  {/* Notification Content */}
                  <View className="ml-4 flex-1 space-y-1">
                    <View className="flex-row justify-between items-start">
                      <Typography 
                        level="callout" 
                        className={notification.read ? "text-black" : "text-brand-deepNavy"}
                      >
                        {notification.title}
                      </Typography>
                      <Typography level="caption-1" className="text-brand-neutralGray">
                        {notification.time}
                      </Typography>
                    </View>
                    
                    <Typography 
                      level="body" 
                      className={notification.read ? "text-brand-neutralGray" : "text-black"}
                    >
                      {notification.message}
                    </Typography>

                    {/* Unread Indicator */}
                    {!notification.read && (
                      <View className="flex-row items-center pt-2">
                        <View className="w-2 h-2 bg-brand-brightOrange rounded-full" />
                        <View className="ml-2">
                          <Typography level="caption-1" className="text-brand-brightOrange">
                            New
                          </Typography>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Empty State */}
          {mockNotifications.length === 0 && (
            <View className="bg-brand-lightGray rounded-2xl p-8 items-center space-y-3">
              <Typography level="headline" className="text-brand-neutralGray">
                No notifications
              </Typography>
              <Typography level="body" className="text-brand-neutralGray text-center">
                {activeProfile?.type === 'child' 
                  ? "You&apos;ll receive updates about your trips here"
                  : "Notifications about family trips will appear here"
                }
              </Typography>
            </View>
          )}

          {/* Notification Settings */}
          <View className="bg-brand-lightestBlue rounded-2xl p-4 space-y-3">
            <Typography level="headline" className="text-black">
              Notification Settings
            </Typography>
            <Typography level="body" className="text-brand-neutralGray">
              Customize when and how you receive notifications for trips and updates.
            </Typography>
            <TouchableOpacity className="bg-brand-deepNavy rounded-xl p-3 items-center">
              <Typography level="subhead" className="text-white">
                Manage Settings
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
