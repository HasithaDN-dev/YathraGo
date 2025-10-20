import { Stack } from 'expo-router';

export default function RequestsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="request-list"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="request-detail"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
