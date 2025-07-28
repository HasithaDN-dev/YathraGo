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
        <Stack.Screen
          name='ownership'
          options={{
            headerShown:false,
            title:'Vehicle Ownership'
          }}
        />
        <Stack.Screen
          name='vehicle-reg'
          options={{
            headerShown:false,
            title:'Vehicle Registration'
          }}
        />
        <Stack.Screen
          name='vehicle-doc'
          options={{
            headerShown:false,
            title:'Vehicle Documents'
          }}
        />
        <Stack.Screen
          name='success'
          options={{
            headerShown:false,
            title:'Success'
          }}
        />
      </Stack>
  );
}
