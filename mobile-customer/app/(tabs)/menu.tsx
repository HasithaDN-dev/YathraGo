import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';
import { ProfileSwitcher } from '@/components/ProfileSwitcher';
import { resetAppState, getAppState } from '../../utils/resetAppState';
import { useProfileStore } from '../../lib/stores/profile.store';

export default function MenuScreen() {
  const { activeProfile } = useProfileStore();
  const menuItems = [
    {
      id: '1',
      title: 'Profile Settings',
      description: 'Edit personal information and preferences',
      icon: '👤',
      action: () => console.log('Profile Settings')
    },
    {
      id: '2',
      title: 'Payment Methods',
      description: 'Manage cards and payment options',
      icon: '💳',
      action: () => console.log('Payment Methods')
    },
    {
      id: '3',
      title: 'Saved Places',
      description: 'Home, school, and favorite locations',
      icon: '📍',
      action: () => console.log('Saved Places')
    },
    {
      id: '4',
      title: 'Trip Preferences',
      description: 'Set default options for rides',
      icon: '⚙️',
      action: () => console.log('Trip Preferences')
    },
    {
      id: '5',
      title: 'Safety Settings',
      description: 'Emergency contacts and safety features',
      icon: '🛡️',
      action: () => console.log('Safety Settings'),
      highlight: activeProfile?.type === 'child'
    },
    {
      id: '6',
      title: 'Help & Support',
      description: 'Get help and contact support',
      icon: '❓',
      action: () => console.log('Help & Support')
    },
    {
      id: '7',
      title: 'About YathraGo',
      description: 'App version and information',
      icon: 'ℹ️',
      action: () => console.log('About YathraGo')
    }
  ];

  // Development menu items (only show in development)
  const devMenuItems = __DEV__ ? [
    {
      id: 'dev1',
      title: 'Reset App State',
      description: 'Clear all data and restart as new user',
      icon: '🔄',
      action: resetAppState,
      highlight: true
    },
    {
      id: 'dev2',
      title: 'Debug App State',
      description: 'Log current app state to console',
      icon: '🐛',
      action: getAppState,
      highlight: false
    }
  ] : [];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ProfileSwitcher />
      
      <ScrollView className="flex-1 px-4 py-6">
        <View className="space-y-6">
          {/* Header */}
          <View className="space-y-2">
            <Typography variant="headline-large" className="text-black">
              Menu
            </Typography>
            <Typography variant="body" className="text-brand-neutralGray">
              {activeProfile?.type === 'child' 
                ? `Manage your settings, ${activeProfile.name}`
                : `Settings and preferences for ${activeProfile?.name}`
              }
            </Typography>
          </View>

          {/* Profile Summary */}
          <View className="bg-brand-lightestBlue rounded-2xl p-6 space-y-4">
            <View className="flex-row items-center">
              <View className={`w-16 h-16 rounded-full items-center justify-center ${
                activeProfile?.type === 'parent' ? 'bg-brand-brightOrange' : 'bg-brand-softOrange'
              }`}>
                <Typography variant="subhead" className="text-white">
                  {activeProfile?.name.charAt(0).toUpperCase()}
                </Typography>
              </View>
              <View className="ml-4 flex-1">
                <Typography variant="subhead" className="text-black">
                  {activeProfile?.name}
                </Typography>
                <Typography variant="body" className="text-brand-neutralGray">
                  {activeProfile?.type === 'parent' ? 'Parent Account' : 'Child Account'}
                </Typography>
                {activeProfile?.type === 'child' && activeProfile?.school && (
                  <Typography variant="caption-1" className="text-brand-neutralGray">
                    {activeProfile.school}
                  </Typography>
                )}
              </View>
            </View>
          </View>

          {/* Menu Items */}
          <View className="space-y-2">
            {[...menuItems, ...devMenuItems].map((item) => (
              <TouchableOpacity 
                key={item.id}
                onPress={item.action}
                className={`rounded-2xl p-4 border ${
                  item.highlight 
                    ? 'bg-brand-lightestBlue border-brand-deepNavy' 
                    : 'bg-white border-brand-lightGray'                  }`}
                >
                  <View className="flex-row items-center">
                    <View className={`w-12 h-12 rounded-full items-center justify-center ${
                      item.highlight ? 'bg-brand-brightOrange' : 'bg-brand-lightGray'
                    }`}>
                      <Typography variant="title-1" className="text-white">
                        {item.icon}
                      </Typography>
                    </View>
                    
                    <View className="ml-4 flex-1">
                    <Typography 
                      variant="title-1" 
                      className={item.highlight ? "text-brand-deepNavy" : "text-black"}
                    >
                      {item.title}
                    </Typography>
                    <Typography 
                      variant="body" 
                      className={item.highlight ? "text-black" : "text-brand-neutralGray"}
                    >
                      {item.description}
                    </Typography>
                  </View>
                  
                  <View className="w-6 h-6 items-center justify-center">
                    <Typography variant="tappable" className="text-brand-neutralGray">
                      →
                    </Typography>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Development Tools (Only in dev mode) */}
          {__DEV__ && (
            <View className="mt-6">
              <Typography variant="title-large" className="text-black mb-4">
                Developer Tools
              </Typography>
              
              <View className="space-y-2">
                <TouchableOpacity
                  className="bg-brand-lightGray p-4 rounded-xl"
                  onPress={() => resetAppState()}
                >
                  <View className="flex-row items-center">
                    <View className="w-12 h-12 rounded-full items-center justify-center bg-red-500">
                      <Typography variant="title-1" className="text-white">
                        🔄
                      </Typography>
                    </View>
                    
                    <View className="ml-4 flex-1">
                      <Typography variant="title-1" className="text-black">
                        Reset App State
                      </Typography>
                      <Typography variant="body" className="text-brand-neutralGray">
                        Clear all data and restart as new user
                      </Typography>
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-brand-lightGray p-4 rounded-xl"
                  onPress={() => getAppState()}
                >
                  <View className="flex-row items-center">
                    <View className="w-12 h-12 rounded-full items-center justify-center bg-blue-500">
                      <Typography variant="title-1" className="text-white">
                        🔍
                      </Typography>
                    </View>
                    
                    <View className="ml-4 flex-1">
                      <Typography variant="title-1" className="text-black">
                        Debug App State
                      </Typography>
                      <Typography variant="body" className="text-brand-neutralGray">
                        View current app data
                      </Typography>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* App Version */}
          <View className="items-center pt-4">
            <Typography variant="caption-1" className="text-brand-neutralGray">
              YathraGo v1.0.0
            </Typography>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
