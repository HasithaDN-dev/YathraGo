import { Stack } from 'expo-router';
import React from 'react';

export default function RegistrationLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="customer-register"
        options={{
          headerShown: false,
          title: 'Customer Registration'
        }}
      />
      <Stack.Screen
        name="registration-type"
        options={{
          headerShown: false,
          title: 'Select Registration Type'
        }}
      />
      <Stack.Screen
        name="staff-passenger"
        options={{
          headerShown: false,
          title: 'Staff Passenger Registration'
        }}
      />
      <Stack.Screen
        name="child-registration"
        options={{
          headerShown: false,
          title: 'Child Registration'
        }}
      />
    </Stack>
  );
}