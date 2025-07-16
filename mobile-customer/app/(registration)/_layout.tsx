import { Stack } from 'expo-router';

export default function RegistrationLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="customer-register" />
      <Stack.Screen name="registration-type" />
      <Stack.Screen name="staff-passenger" />
      <Stack.Screen name="child-registration" />
    </Stack>
  );
}
