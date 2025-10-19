import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { router } from 'expo-router';
import { driverRequestApi, RequestDetails } from '@/lib/api/driver-request.api';
import { useProfileStore } from '@/lib/stores/profile.store';
import { MapPin, Clock } from 'phosphor-react-native';
import { Colors } from '@/constants/Colors';

export default function RequestListScreen() {
  const [requests, setRequests] = useState<RequestDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { customerProfile } = useProfileStore();

  const loadRequests = async () => {
    try {
      if (!customerProfile) {
        Alert.alert('Error', 'Profile not found');
        return;
      }
      const data = await driverRequestApi.getCustomerRequests(customerProfile.customer_id);
      setRequests(data);
    } catch (error) {
      console.error('Load requests error:', error);
      Alert.alert('Error', 'Failed to load requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadRequests();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return Colors.warmYellow;
      case 'DRIVER_COUNTER': return '#3B82F6';
      case 'CUSTOMER_COUNTER': return '#8B5CF6';
      case 'ACCEPTED': return Colors.successGreen;
      case 'REJECTED': return '#EF4444';
      default: return Colors.neutralGray;
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ');
  };

  const RequestCard = ({ item }: { item: RequestDetails }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push({
          pathname: '/(menu)/find-driver/request-detail',
          params: { requestId: item.id }
        })}
      >
        <Card className="mx-4 mb-3 p-4">
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-1">
              <Typography variant="title-3" weight="semibold" className="text-brand-deepNavy mb-1">
                {item.driverName}
              </Typography>
              <Typography variant="footnote" className="text-brand-neutralGray">
                {item.vehicleInfo}
              </Typography>
            </View>
            <View
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: getStatusColor(item.status) }}
            >
              <Typography variant="caption-2" weight="semibold" className="text-white">
                {getStatusLabel(item.status)}
              </Typography>
            </View>
          </View>
          
          <Typography variant="footnote" className="text-brand-neutralGray mb-2">
            For: {item.profileName}
          </Typography>
          
          <View className="flex-row justify-between items-center pt-2 border-t border-gray-200">
            <View className="flex-row items-center">
              <MapPin size={14} color={Colors.neutralGray} weight="regular" />
              <Typography variant="caption-1" className="text-brand-neutralGray ml-1">
                {item.estimatedDistance.toFixed(2)} km
              </Typography>
            </View>
            <View className="flex-row items-center">
              <Clock size={14} color={Colors.neutralGray} weight="regular" />
              <Typography variant="caption-1" className="text-brand-neutralGray ml-1">
                {new Date(item.createdAt).toLocaleDateString()}
              </Typography>
            </View>
            <Typography variant="subhead" weight="semibold" className="text-blue-600">
              Rs. {item.currentAmount.toLocaleString()}
            </Typography>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScreenHeader title="Sent Requests" showBackButton />
      
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.warmYellow} />
          <Typography variant="body" className="text-gray-500 mt-4">
            Loading requests...
          </Typography>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <RequestCard item={item} />}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.warmYellow]}
            />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-20 px-4">
              <Typography variant="body" className="text-gray-500 text-center">
                No requests yet
              </Typography>
              <Typography variant="caption-1" className="text-gray-400 mt-2 text-center">
                Start by finding a vehicle and sending a request
              </Typography>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
