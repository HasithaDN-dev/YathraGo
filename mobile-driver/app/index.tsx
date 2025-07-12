import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthState } from '@/hooks/useAuthState';

export default function IndexScreen() {
  const { isLoading } = useAuthState();

  if (isLoading) {
    return null; // Loading handled by root layout
  }

  // All users see splash screen first for consistent brand experience
  return <Redirect href="/splash" />;
}
