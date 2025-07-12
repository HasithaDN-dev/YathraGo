import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="phone-input" />
      <Stack.Screen name="otp-verification" />
    </Stack>
  );
}
