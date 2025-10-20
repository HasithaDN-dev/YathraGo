import { Stack } from 'expo-router';

export default function FindDriverLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />
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
