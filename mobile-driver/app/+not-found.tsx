import { Link, Stack } from 'expo-router';

import { Typography } from '@/components/Typography';
import { View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center p-5">
        <Typography variant="headline-large" weight="bold">This screen does not exist.</Typography>
        <Link href="/" className="mt-4 py-4">
          <Typography variant="body-medium" weight="semibold" className="text-brand-deepNavy">Go to home screen!</Typography>
        </Link>
      </View>
    </>
  );
}
