import { Tabs } from 'expo-router';
import React from 'react';
import { HapticTab } from '@/components/HapticTab';
import { View } from 'react-native';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useProfile } from '@/contexts/ProfileContext';
import { HouseIcon, ClockIcon, BellIcon, ListIcon, UserIcon, NavigationArrow } from 'phosphor-react-native';

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
        tabBarActiveTintColor: '#143373',
        tabBarInactiveTintColor: '#222',
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '400',
          marginTop: 4,
        },
        tabBarItemStyle: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          height: 95,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarBackground: TabBarBackground,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <HouseIcon size={22} color={color} weight="regular" />,
        }}
      />
      <Tabs.Screen
        name="navigate"
        options={{
          title: 'Navigate',
          tabBarIcon: ({ color }) => <NavigationArrow size={22} color={color} weight="regular" />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <ClockIcon size={22} color={color} weight="regular" />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color }) => <BellIcon size={22} color={color} weight="regular" />,
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color }) => <ListIcon size={22} color={color} weight="regular" />,
        }}
      />
    </Tabs>
  );
}
