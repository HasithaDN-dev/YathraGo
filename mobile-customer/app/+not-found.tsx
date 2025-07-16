import { Link, Stack } from 'expo-router';
import { View } from 'react-native';
import { Typography } from '@/components/Typography';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center p-5">
        <Typography level="title-1">This screen does not exist.</Typography>
        <Link href="/" className="mt-4 py-4">
          <Typography level="body" className="text-brand-deepNavy">Go to home screen!</Typography>
        </Link>
      </View>
    </>
  );
}
