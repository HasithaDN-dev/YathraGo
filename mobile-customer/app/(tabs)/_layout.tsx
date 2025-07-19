import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import ProfileSwitcher from '../../components/ProfileSwitcher';
import { ProfileLoading } from '../../components/ProfileLoading';
import { HouseIcon, ClockIcon, BellIcon, ListIcon } from 'phosphor-react-native';
import { useProfileStore } from '../../lib/stores/profile.store';
import { useAuthStore } from '../../lib/stores/auth.store';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { activeProfile, profiles, isLoading, error } = useProfileStore();
  const { accessToken, isProfileComplete } = useAuthStore();

  // Auto-load profiles when user is authenticated
  useEffect(() => {
    if (accessToken && profiles.length === 0 && !isLoading) {
      const { loadProfiles } = useProfileStore.getState();
      loadProfiles(accessToken);
    }
  }, [accessToken, profiles.length, isLoading]);

  // Show loading state while profiles are being loaded
  if (isLoading) {
    return <ProfileLoading />;
  }

  // Show error state if profile loading failed
  if (error) {
    return (
      <ProfileLoading message="Failed to load profiles. Please try again." />
    );
  }

  // Show loading if no active profile is selected
  if (profiles.length > 0 && !activeProfile) {
    return <ProfileLoading message="Selecting profile..." />;
  }

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
        header: () => <ProfileSwitcher />,
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
          tabBarIcon: ({ color }) => <HouseIcon size={28} color={color} weight="fill" />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: getTabTitle('History'),
          tabBarIcon: ({ color }) => <ClockIcon size={28} color={color} weight="fill" />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: getTabTitle('Alerts'),
          tabBarIcon: ({ color }) => <BellIcon size={28} color={color} weight="fill" />,
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color }) => <ListIcon size={28} color={color} weight="fill" />,
        }}
      />
    </Tabs>
  );
}