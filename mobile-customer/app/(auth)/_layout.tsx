import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="phone-auth" 
        options={{ 
          headerShown: false,
          title: 'Phone Authentication' 
        }} 
      />
      <Stack.Screen 
        name="verify-otp" 
        options={{ 
          headerShown: false,
          title: 'Verify OTP' 
        }} 
      />
    </Stack>
  );
}