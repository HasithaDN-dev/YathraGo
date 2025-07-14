import { Stack } from 'expo-router';

export default function RegistrationLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="registration-type" />
      <Stack.Screen name="staff-step1" />
      <Stack.Screen name="staff-step2" />
    </Stack>
  );
}
