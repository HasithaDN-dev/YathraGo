import { View, ScrollView } from 'react-native';
import { Typography } from '@/components/Typography';


export default function HomeScreen() {
  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-success p-6 pt-12">
        <Typography variant="display-large" className="text-white text-center font-bold">🚗 YathraGo Driver</Typography>
        <Typography variant="body-medium" className="text-green-100 text-center mt-2">Professional Ride Service Platform</Typography>
      </View>
      
      {/* YathraGo Driver Welcome Section */}
      <View className="flex-1 items-center justify-center bg-white p-6 mb-4 rounded-lg shadow-sm">
        <Typography variant="display-large" className="text-green-600 font-bold mb-4">🚗 YathraGo Driver</Typography>
        <View className="bg-brand-successGreen p-6 rounded-lg shadow-lg w-full">
          <Typography variant="title-large" className="text-white text-center font-semibold">Professional Ride Service Platform</Typography>
        </View>
        <Typography variant="body-medium" className="text-gray-600 text-center mt-4">Start earning with Sri Lanka&apos;s trusted ride-sharing platform</Typography>
      </View>
      
      {/* Driver Action Cards */}
      <View className="space-y-4 mb-6">
        <View className="bg-brand-successGreen p-6 rounded-lg shadow-sm">
          <Typography variant="title-large" className="text-white font-bold mb-2">� Go Online</Typography>
          <Typography variant="body-small" className="text-green-100">Start receiving ride requests</Typography>
        </View>
        
        <View className="bg-brand-deepNavy p-6 rounded-lg shadow-sm">
          <Typography variant="title-large" className="text-white font-bold mb-2">📊 View Earnings</Typography>
          <Typography variant="body-small" className="text-brand-lightNavy">Track your daily and weekly income</Typography>
        </View>
        
        <View className="bg-brand-brightOrange p-6 rounded-lg shadow-sm">
          <Typography variant="title-large" className="text-white font-bold mb-2">🗺️ Navigation</Typography>
          <Typography variant="body-small" className="text-orange-100">GPS guidance to passenger locations</Typography>
        </View>
      </View>

      <View className="flex-row items-center gap-2">
        <Typography variant="headline-large" className="font-bold">Driver Hub</Typography>
      </View>
      
      <View className="gap-2 mb-2">
        <Typography variant="title-medium" className="font-semibold">Step 1: Go Online</Typography>
        <Typography variant="body-medium">Toggle your availability to start receiving ride requests from passengers in your area.</Typography>
      </View>
      
      <View className="gap-2 mb-2">
        <Typography variant="title-medium" className="font-semibold">Step 2: Accept Rides</Typography>
        <Typography variant="body-medium">Review ride details and accept requests that match your preferences and location.</Typography>
      </View>
      
      <View className="gap-2 mb-2">
        <Typography variant="title-medium" className="font-semibold">Step 3: Navigate & Complete</Typography>
        <Typography variant="body-medium">Use built-in navigation to reach passengers and complete rides safely and efficiently.</Typography>
      </View>
    </ScrollView>
  );
}
