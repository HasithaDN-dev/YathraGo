import { StyleSheet } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <ThemedView className="flex-row gap-2">
        <ThemedText type="title">Driver Resources</ThemedText>
      </ThemedView>
      <ThemedText>Explore tools and features designed specifically for YathraGo drivers.</ThemedText>
      
      <Collapsible title="Driver Dashboard">
        <ThemedText>
          Your main hub includes:{' '}
          <ThemedText type="defaultSemiBold">earnings tracking</ThemedText>,{' '}
          <ThemedText type="defaultSemiBold">ride history</ThemedText>, and{' '}
          <ThemedText type="defaultSemiBold">performance metrics</ThemedText>
        </ThemedText>
        <ThemedText>
          Monitor your daily and weekly performance to maximize your earnings.
        </ThemedText>
      </Collapsible>
      
      <Collapsible title="Navigation & GPS">
        <ThemedText>
          Integrated GPS navigation helps you reach passengers quickly and efficiently.
          Features include real-time traffic updates and optimal route suggestions.
        </ThemedText>
      </Collapsible>
      
      <Collapsible title="Earnings & Payments">
        <ThemedText>
          Track your earnings in real-time. View detailed breakdowns including:{' '}
          <ThemedText type="defaultSemiBold">base fare</ThemedText>,{' '}
          <ThemedText type="defaultSemiBold">distance</ThemedText>, and{' '}
          <ThemedText type="defaultSemiBold">time bonuses</ThemedText>
        </ThemedText>
        <ThemedText className="text-center text-5xl my-5">
          💰
        </ThemedText>
      </Collapsible>
      
      <Collapsible title="Driver Support">
        <ThemedText>
          24/7 support available for drivers. Get help with:{' '}
          <ThemedText type="defaultSemiBold">technical issues</ThemedText>,{' '}
          <ThemedText type="defaultSemiBold">payment questions</ThemedText>, and{' '}
          <ThemedText type="defaultSemiBold">ride disputes</ThemedText>
        </ThemedText>
      </Collapsible>
      
      <Collapsible title="Safety Features">
        <ThemedText>
          Your safety is our priority. Features include emergency assistance,
          real-time location sharing, and driver identity verification.
        </ThemedText>
        <ThemedText className="text-center text-5xl my-5">
          🛡️
        </ThemedText>
      </Collapsible>
      
      <Collapsible title="Driver Training">
        <ThemedText>
          Access training materials and best practices for professional driving.
          Learn about customer service, route optimization, and safety protocols.
        </ThemedText>
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  // Only keep complex positioning that Tailwind can't handle
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
});
