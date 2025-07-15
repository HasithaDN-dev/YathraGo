import { Stack } from 'expo-router';

export default function RegistrationLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="customer-register" />
      <Stack.Screen name="registration-type" />
      <Stack.Screen name="staff-passenger" />
      <Stack.Screen name="child-registration" />
      <Stack.Screen name="staff-step1" />
      <Stack.Screen name="staff-step2" />
      <Stack.Screen name="child-step1" />
      <Stack.Screen name="child-step2" />
    </Stack>
  );
}
