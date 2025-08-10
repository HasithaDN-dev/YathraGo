import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { HapticTab } from '@/components/HapticTab';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { HouseIcon, ClockIcon, BellIcon, ListIcon, NavigationArrowIcon } from 'phosphor-react-native';
import { Header } from '@/components/ui/Header';

// Profile data
const profiles = [
  {
    id: '1',
    name: 'My Elder Son',
    fullName: 'Supun Thilina',
    type: 'child' as const
  },
  {
    id: '2',
    name: 'Kevin',
    fullName: 'Kevin Silva',
    type: 'child' as const
  },
  {
    id: '3',
    name: 'My',
    fullName: 'My Account',
    type: 'parent' as const
  }
];

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [selectedProfile, setSelectedProfile] = useState(profiles[0]);

  const handleProfileSelect = (profile: typeof profiles[0]) => {
    setSelectedProfile(profile);
    console.log('Profile selected:', profile.name);
  };

  const handleRefresh = () => {
    console.log('Refresh pressed');
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Header Component - Shared across all tabs, now below the device header */}
      <SafeAreaView edges={["top"]} className="bg-gray-100">
        <Header
          profiles={profiles}
          selectedProfile={selectedProfile}
          onProfileSelect={handleProfileSelect}
          onRefreshPress={handleRefresh}
        />
      </SafeAreaView>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#143373',
          tabBarInactiveTintColor: '#222',
          headerShown: false,
          tabBarButton: HapticTab,
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
            tabBarIcon: ({ color }) => <NavigationArrowIcon size={22} color={color} weight="regular" />,
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
    </View>
  );
}
