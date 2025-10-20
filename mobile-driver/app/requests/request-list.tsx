import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';
import { router } from 'expo-router';
import { driverRequestApi, RequestDetails } from '@/lib/api/driver-request.api';
import { useAuthStore } from '@/lib/stores/auth.store';
import { MapPin, Clock, User, ArrowLeft } from 'phosphor-react-native';

export default function DriverRequestListScreen() {
  const [requests, setRequests] = useState<RequestDetails[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'responded'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthStore();

  const loadRequests = async () => {
    try {
      if (!user?.id) {
        Alert.alert('Error', 'Driver not found');
        return;
      }
      
      const status = filter === 'pending' ? 'PENDING' : undefined;
      const data = await driverRequestApi.getDriverRequests(user.id, status);
      
      let filtered = data;
      if (filter === 'responded') {
        filtered = data.filter(r => ['DRIVER_COUNTER', 'ACCEPTED', 'REJECTED'].includes(r.status));
      }
      
      setRequests(filtered);
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
  }, [filter]);

  const onRefresh = () => {
    setRefreshing(true);
    loadRequests();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#FDC334';
      case 'DRIVER_COUNTER': return '#3B82F6';
      case 'CUSTOMER_COUNTER': return '#8B5CF6';
      case 'ACCEPTED': return '#10B981';
      case 'REJECTED': return '#EF4444';
      default: return '#9CA3AF';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ');
  };

  const FilterTab = ({ label, value }: { label: string; value: typeof filter }) => (
    <TouchableOpacity
      className={`flex-1 py-3 rounded-lg mx-1 ${filter === value ? 'bg-brand-deepNavy' : 'bg-gray-200'}`}
      onPress={() => setFilter(value)}
      activeOpacity={0.8}
    >
      <Typography
        variant="caption-1"
        weight={filter === value ? 'semibold' : 'medium'}
        className={`text-center capitalize ${filter === value ? 'text-white' : 'text-brand-neutralGray'}`}
      >
        {label}
      </Typography>
    </TouchableOpacity>
  );

  const RequestCard = ({ item }: { item: RequestDetails }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push({
          pathname: '/requests/request-detail',
          params: { requestId: item.id }
        })}
      >
        <View className="mx-4 mb-3 p-4 bg-white rounded-lg shadow">
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <User size={16} color="#143373" weight="regular" />
                <Typography variant="title-3" weight="semibold" className="ml-2" style={{ color: '#143373' }}>
                  {item.customerName}
                </Typography>
              </View>
              <Typography variant="footnote" style={{ color: '#6B7280' }}>
                Profile: {item.profileName} ({item.profileType})
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
          
          {item.customerNote && (
            <View className="bg-gray-100 p-2 rounded-lg mb-2">
              <Typography variant="caption-1" style={{ color: '#6B7280', fontStyle: 'italic' }}>
                {item.customerNote}
              </Typography>
            </View>
          )}
          
          <View className="flex-row justify-between items-center pt-2 border-t border-gray-200">
            <View className="flex-row items-center">
              <MapPin size={14} color="#6B7280" weight="regular" />
              <Typography variant="caption-1" className="ml-1" style={{ color: '#6B7280' }}>
                {item.estimatedDistance.toFixed(2)} km
              </Typography>
            </View>
            <View className="flex-row items-center">
              <Clock size={14} color="#6B7280" weight="regular" />
              <Typography variant="caption-1" className="ml-1" style={{ color: '#6B7280' }}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Typography>
            </View>
            <Typography variant="subhead" weight="semibold" className="text-blue-600">
              Rs. {item.currentAmount.toLocaleString()}
            </Typography>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 pt-4 pb-3 bg-white flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          className="mr-3"
        >
          <ArrowLeft size={24} color="#143373" weight="regular" />
        </TouchableOpacity>
        <Typography variant="title-1" weight="bold" style={{ color: '#143373' }}>
          Ride Requests
        </Typography>
      </View>
      
      {/* Filter Tabs */}
      <View className="flex-row px-4 pt-3 pb-2">
        <FilterTab label="All" value="all" />
        <FilterTab label="Pending" value="pending" />
        <FilterTab label="Responded" value="responded" />
      </View>
      
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FDC334" />
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
              colors={['#FDC334']}
            />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-20 px-4">
              <Typography variant="body" className="text-gray-500 text-center">
                No requests found
              </Typography>
              <Typography variant="caption-1" className="text-gray-400 mt-2 text-center">
                {filter === 'pending' 
                  ? 'No pending requests at the moment' 
                  : filter === 'responded'
                  ? 'No responded requests yet'
                  : 'You have no ride requests yet'}
              </Typography>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
