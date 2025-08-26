import { Tabs, useNavigation } from 'expo-router';
import React, { useLayoutEffect } from 'react';
import { HapticTab } from '@/components/HapticTab';
import { View } from 'react-native';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Slot } from 'expo-router';
import { HouseIcon, ClockIcon, BellIcon, ListIcon, NavigationArrowIcon } from 'phosphor-react-native';

export default function MenuTabLayout() {
  const colorScheme = useColorScheme();
  const navigation = useNavigation();

  // Hide the stack header (black bar) for all screens in this layout
  useLayoutEffect(() => {
    navigation.setOptions?.({ headerShown: false });
  }, [navigation]);

  // Use <Slot /> to render the child screen content directly
  // This will show the profile screen without any tab bar or icon
  // Remove the <Tabs> component entirely
  // Import Slot from expo-router
  // import { Slot } from 'expo-router';
  return (
    <View style={{ flex: 1 }}>
      {/* Render child screens directly */}
      <Slot />
    </View>
  );
}
