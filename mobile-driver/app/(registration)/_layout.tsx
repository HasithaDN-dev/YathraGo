import { Stack } from 'expo-router';
import React from 'react';

export default function RegistrationLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="reg-personal"
        options={{
          title: 'Register'
        }}
        />
        <Stack.Screen
          name='reg-verify'
          options={{
            title: 'Verify ID'
          }}
        />
        <Stack.Screen
          name='reg-id'
          options={{
            title:'Take a photo of your ID'
          }}
        />
        <Stack.Screen
          name='reg-uploadId'
          options={{
            title:'Upload ID'
          }}
        />
        <Stack.Screen
          name='ownership'
          options={{
            title:'Vehicle Ownership'
          }}
        />
        <Stack.Screen
          name='vehicle-reg'
          options={{
            title:'Vehicle Registration'
          }}
        />
        <Stack.Screen
          name='vehicle-doc'
          options={{
            title:'Vehicle Documents'
          }}
        />
        <Stack.Screen
          name='success'
          options={{
            title:'Success'
          }}
        />
      </Stack>
  );
}