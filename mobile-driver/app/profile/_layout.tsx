import { Stack } from 'expo-router';
import React from 'react';

export default function ProfileLayout() {
  return (
    
<Stack
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: true,
                gestureDirection: 'horizontal',
            }}
        >
      <Stack.Screen
        name="(personal)"
        options={{
          headerShown: false,
          title: 'Menu'
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          headerShown: false,
          title: 'Profile'
        }}
      />
      <Stack.Screen
        name="earnings"
        options={{
          headerShown: false,
          title: 'Earnings'
        }}
      />
      <Stack.Screen
        name="rides"
        options={{
          headerShown: false,
          title: 'Rides'
        }}
      />
      <Stack.Screen
        name="vehicle-details"
        options={{
          headerShown: false,
          title: 'Vehicle Details'
        }}
      />
      <Stack.Screen
        name="vehicle-issues"
        options={{
          headerShown: false,
          title: 'Vehicle Issues'
        }}
      />
    </Stack>
  );
}
