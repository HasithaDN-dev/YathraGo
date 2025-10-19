import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { HouseIcon, ClockIcon, BellIcon, ListIcon, NavigationArrowIcon as NavigationIcon } from 'phosphor-react-native';
import TabBarBackground from '@/components/ui/TabBarBackground';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#000000', // Black
        tabBarInactiveTintColor: '#000000', // Black
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#F3F4F6', // Light Gray
          borderTopWidth: 0, // Removes top border
        },
        tabBarLabelStyle: {
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <HouseIcon size={28} color={color} weight={focused ? 'fill' : 'regular'} />
          ),
        }}
      />
      <Tabs.Screen
        name="navigation"
        options={{
          title: 'Navigation',
          tabBarIcon: ({ color }) => <NavigationIcon size={28} color={color} weight="fill" />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <ClockIcon size={28} color={color} weight={focused ? 'fill' : 'regular'} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color, focused }) => (
            <BellIcon size={28} color={color} weight={focused ? 'fill' : 'regular'} />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color, focused }) => (
            <ListIcon size={28} color={color} weight={focused ? 'fill' : 'regular'} />
          ),
        }}
      />
      {/* Hide chat screens from top-level tab bar; they remain routable under /(tabs)/chat/* */}
      <Tabs.Screen
        name="chat/chat_list"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="chat/chat_room"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="current-students"
        options={{
          href: null, // This hides it from the tab bar
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          href: null, // This hides it from the tab bar
        }}
      />
    </Tabs>
  );
}
