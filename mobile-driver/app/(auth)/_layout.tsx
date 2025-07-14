import { Stack } from 'expo-router';
import React from 'react';
import { IdVerificationProvider } from '@/contexts/IdVerificationContext';

export default function AuthLayout() {
  return (
    <IdVerificationProvider>
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
      <Stack.Screen 
        name="reg-personal"
        options={{
          headerShown: false,
          title: 'Register'
        }}
        />
        <Stack.Screen
          name='reg-verify'
          options={{
            headerShown:false,
            title: 'Verify ID'
          }}
        />
        <Stack.Screen
          name='reg-id'
          options={{
            headerShown:false,
            title:'Take a photo of your ID'
          }}
        />
        <Stack.Screen
          name='reg-uploadId'
          options={{
            headerShown:false,
            title:'Upload ID'
          }}
        />
      </Stack>
    </IdVerificationProvider>
  );
}
