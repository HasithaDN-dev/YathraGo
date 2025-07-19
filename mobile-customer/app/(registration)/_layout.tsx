import { Stack } from 'expo-router';
import React from 'react';

export default function RegistrationLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="customer-register"
        options={{
          title: 'Customer Registration'
        }}
      />
      <Stack.Screen
        name="registration-type"
        options={{
          title: 'Select Registration Type'
        }}
      />
      <Stack.Screen
        name="staff-passenger"
        options={{
          title: 'Staff Passenger Registration'
        }}
      />
      <Stack.Screen
        name="child-registration"
        options={{
          title: 'Child Registration'
        }}
      />
    </Stack>
  );
}