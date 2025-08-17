import React from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/ui/Card';

export default function NavigateScreen() {

  return (
    <SafeAreaView edges={['left','right','bottom']} className="flex-1 bg-gray-100">
      <ScrollView className="flex-1 px-4 space-y-6 mt-3">
        {/* Empty Card */}
        <Card className="p-6">
          <View className="items-center justify-center min-h-[600px]">
            <Typography variant="headline" className="text-brand-neutralGray text-center">
              Navigate Screen
            </Typography>
            <Typography variant="body" className="text-brand-neutralGray text-center mt-2">
              Navigation content will be implemented here
            </Typography>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}