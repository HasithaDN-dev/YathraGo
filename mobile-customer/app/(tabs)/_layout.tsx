import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useProfile } from '@/contexts/ProfileContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { activeProfile } = useProfile();

  // Show different tabs based on profile type
  const getTabTitle = (baseTitle: string) => {
    if (!activeProfile) return baseTitle;
    return activeProfile.type === 'child' 
      ? `${activeProfile.name}'s ${baseTitle}`
      : baseTitle;
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#143373', // brand-deepNavy
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: getTabTitle('Home'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: getTabTitle('History'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="clock" color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: getTabTitle('Alerts'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="bell" color={color} />,
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="menu" color={color} />,
        }}
      />
    </Tabs>
  );
}
