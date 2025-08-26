import { Stack } from 'expo-router';

export default function PersonalLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="personal" />
      <Stack.Screen name="edit-first-name" />
      <Stack.Screen name="edit-last-name" />
      <Stack.Screen name="edit-nic" />
      <Stack.Screen name="edit-address" />
      <Stack.Screen name="edit-gender" />
      <Stack.Screen name="edit-phone-number" />
      <Stack.Screen name="edit-email" />
      <Stack.Screen name="edit-secondary-phone" />
    </Stack>
  );
} 