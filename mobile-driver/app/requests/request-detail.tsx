import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';
import { useLocalSearchParams, router } from 'expo-router';
import { driverRequestApi, RequestDetails } from '@/lib/api/driver-request.api';
import { useAuthStore } from '@/lib/stores/auth.store';
import { MapPin, Clock, User, ArrowLeft } from 'phosphor-react-native';

export default function DriverRequestDetailScreen() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const [request, setRequest] = useState<RequestDetails | null>(null);
  const [action, setAction] = useState<'ACCEPT' | 'REJECT' | 'COUNTER'>('COUNTER');
  const [counterAmount, setCounterAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { user } = useAuthStore();

  const loadRequest = async () => {
    try {
      if (!user?.id || !requestId) return;
      const data = await driverRequestApi.getDriverRequests(user.id);
      const found = data.find(r => r.id === parseInt(requestId, 10));
      setRequest(found || null);
    } catch (error) {
      console.error('Load request error:', error);
      Alert.alert('Error', 'Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRespond = async () => {
    if (!request || !user?.id) {
      Alert.alert('Error', 'User information not available');
      return;
    }
    if (action === 'COUNTER' && !counterAmount) {
      Alert.alert('Error', 'Please enter counter amount');
      return;
    }
    
    try {
      setActionLoading(true);
      
      // Use request.driverId instead of user.id to ensure we're using the correct driver ID
      const driverId = request.driverId;
      
      console.log('Responding to request:', {
        requestId: request.id,
        driverId: driverId,
        action,
        amount: action === 'COUNTER' ? parseFloat(counterAmount) : undefined,
      });
      
      await driverRequestApi.respondToRequest({
        requestId: request.id,
        driverId: driverId,
        action,
        amount: action === 'COUNTER' ? parseFloat(counterAmount) : undefined,
        note: note || undefined,
      });
      
      const message = action === 'ACCEPT' ? 'Request accepted!' : 
                     action === 'REJECT' ? 'Request rejected' : 
                     'Counter offer sent!';
      
      Alert.alert('Success', message, [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Handle respond error:', error);
      
      // Handle validation errors from backend (message is an array)
      let errorMsg = 'Failed to respond to request';
      
      if (error.response?.data?.message) {
        const message = error.response.data.message;
        
        // If message is an array (validation errors)
        if (Array.isArray(message)) {
          errorMsg = message.map((err: any) => {
            if (typeof err === 'string') return err;
            if (err.field && err.errors) {
              return `${err.field}: ${err.errors.join(', ')}`;
            }
            return JSON.stringify(err);
          }).join('\n');
        } else {
          // If message is a string
          errorMsg = message;
        }
      }
      
      Alert.alert('Error', errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FDC334" />
        </View>
      </SafeAreaView>
    );
  }

  if (!request) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center px-4">
          <Typography variant="body" className="text-gray-500 text-center">
            Request not found
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

  const canRespond = ['PENDING', 'CUSTOMER_COUNTER'].includes(request.status);

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
          Request Details
        </Typography>
      </View>
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Customer & Profile Info */}
        <View className="mx-4 mt-4 p-5 bg-white rounded-lg shadow">
          <View className="flex-row items-center mb-3">
            <View className="w-12 h-12 bg-gray-200 rounded-full items-center justify-center mr-3">
              <User size={24} color="#143373" weight="regular" />
            </View>
            <View className="flex-1">
              <Typography variant="title-3" weight="semibold" style={{ color: '#143373' }}>
                {request.customerName}
              </Typography>
              <Typography variant="footnote" style={{ color: '#6B7280' }}>
                {request.profileType === 'child' ? 'Child' : 'Staff'}: {request.profileName}
              </Typography>
            </View>
          </View>
        </View>

        {/* Distance & Price Info */}
        <View className="mx-4 mt-3 p-5 bg-white rounded-lg shadow">
          <Typography variant="subhead" weight="semibold" className="mb-3" style={{ color: '#143373' }}>
            Ride Details
          </Typography>
          
          <View className="flex-row justify-between mb-2">
            <Typography variant="footnote" style={{ color: '#6B7280' }}>
              Distance:
            </Typography>
            <Typography variant="footnote" weight="semibold" style={{ color: '#000' }}>
              {request.estimatedDistance.toFixed(2)} km
            </Typography>
          </View>
          
          <View className="flex-row justify-between mb-2">
            <Typography variant="footnote" style={{ color: '#6B7280' }}>
              Estimated Price:
            </Typography>
            <Typography variant="footnote" weight="semibold" style={{ color: '#000' }}>
              Rs. {request.estimatedPrice.toLocaleString()}
            </Typography>
          </View>
          
          <View className="flex-row justify-between pt-3 mt-3 border-t border-gray-200">
            <Typography variant="subhead" style={{ color: '#6B7280' }}>
              Customer Offer:
            </Typography>
            <Typography variant="title-3" weight="bold" className="text-blue-600">
              Rs. {request.currentAmount.toLocaleString()}
            </Typography>
          </View>

          {request.customerNote && (
            <View className="mt-3 bg-gray-100 p-3 rounded-lg">
              <Typography variant="caption-1" weight="semibold" className="mb-1" style={{ color: '#143373' }}>
                Customer Note:
              </Typography>
              <Typography variant="footnote" style={{ color: '#4B5563', fontStyle: 'italic' }}>
                {request.customerNote}
              </Typography>
            </View>
          )}
        </View>

        {/* Route Info */}
        {request.nearestPickupCityName && request.nearestDropCityName && (
          <View className="mx-4 mt-3 p-5 bg-white rounded-lg shadow">
            <Typography variant="subhead" weight="semibold" className="mb-3" style={{ color: '#143373' }}>
              Driver Route
            </Typography>
            <View>
              <View className="flex-row items-start mb-3">
                <View className="mt-1">
                  <MapPin size={16} color="#6B7280" weight="fill" />
                </View>
                <View className="ml-2 flex-1">
                  <Typography variant="caption-1" weight="semibold" style={{ color: '#143373' }}>
                    Nearest City from Pickup:
                  </Typography>
                  <Typography variant="footnote" style={{ color: '#6B7280' }}>
                    {request.nearestPickupCityName}
                  </Typography>
                </View>
              </View>
              
              <View className="flex-row items-start">
                <View className="mt-1">
                  <MapPin size={16} color="#6B7280" weight="fill" />
                </View>
                <View className="ml-2 flex-1">
                  <Typography variant="caption-1" weight="semibold" style={{ color: '#143373' }}>
                    Nearest City from {request.profileType === 'child' ? 'School' : 'Work'}:
                  </Typography>
                  <Typography variant="footnote" style={{ color: '#6B7280' }}>
                    {request.nearestDropCityName}
                  </Typography>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Negotiation History */}
        <View className="mx-4 mt-3 p-5 bg-white rounded-lg shadow">
          <Typography variant="subhead" weight="semibold" className="mb-3" style={{ color: '#143373' }}>
            Negotiation History
          </Typography>
          {request.negotiationHistory.map((item, index) => (
            <View key={index} className="mb-3 pl-3 border-l-4 border-blue-300">
              <View className="flex-row items-center justify-between mb-1">
                <Typography variant="footnote" weight="semibold" className="capitalize" style={{ color: '#143373' }}>
                  {item.offeredBy}
                </Typography>
                <Typography variant="body" weight="semibold" style={{ color: '#000' }}>
                  Rs. {item.amount.toLocaleString()}
                </Typography>
              </View>
              {item.note && (
                <Typography variant="caption-1" className="mb-1" style={{ color: '#6B7280', fontStyle: 'italic' }}>
                  {item.note}
                </Typography>
              )}
              <View className="flex-row items-center">
                <Clock size={12} color="#6B7280" weight="regular" />
                <Typography variant="caption-2" className="ml-1" style={{ color: '#6B7280' }}>
                  {new Date(item.timestamp).toLocaleString()}
                </Typography>
              </View>
            </View>
          ))}
        </View>

        {/* Response Actions */}
        {canRespond && (
          <View className="mx-4 mt-3 p-5 bg-white rounded-lg shadow">
            <Typography variant="subhead" weight="semibold" className="mb-3" style={{ color: '#143373' }}>
              Your Response
            </Typography>
            
            {/* Action Selection */}
            <View className="flex-row mb-3">
              {['ACCEPT', 'COUNTER', 'REJECT'].map((a) => (
                <TouchableOpacity
                  key={a}
                  className={`flex-1 py-2 mx-1 rounded-lg ${action === a ? 'bg-blue-500' : 'bg-gray-200'}`}
                  onPress={() => setAction(a as typeof action)}
                  activeOpacity={0.8}
                >
                  <Typography
                    variant="footnote"
                    weight={action === a ? 'semibold' : 'medium'}
                    className={`text-center capitalize ${action === a ? 'text-white' : 'text-gray-600'}`}
                  >
                    {a.toLowerCase()}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
            
            {action === 'COUNTER' && (
              <View className="mb-3">
                <Typography variant="footnote" className="mb-2" style={{ color: '#000' }}>
                  Your Counter Amount (Rs.):
                </Typography>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3"
                  style={{ backgroundColor: '#f9fafb' }}
                  placeholder="Enter your counter amount"
                  value={counterAmount}
                  onChangeText={setCounterAmount}
                  keyboardType="numeric"
                />
              </View>
            )}
            
            <View className="mb-4">
              <Typography variant="footnote" className="mb-2" style={{ color: '#000' }}>
                Note (Optional):
              </Typography>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3"
                style={{ backgroundColor: '#f9fafb', minHeight: 80, textAlignVertical: 'top' }}
                placeholder="Add your message..."
                value={note}
                onChangeText={setNote}
                multiline
              />
            </View>
            
            <TouchableOpacity
              className={`py-4 rounded-lg ${actionLoading ? 'bg-gray-400' : 'bg-blue-600'}`}
              onPress={handleRespond}
              disabled={actionLoading}
              activeOpacity={0.8}
            >
              <Typography variant="subhead" weight="semibold" className="text-white text-center">
                {actionLoading ? 'Sending...' : `Confirm ${action.charAt(0) + action.slice(1).toLowerCase()}`}
              </Typography>
            </TouchableOpacity>
          </View>
        )}

        {/* Status Messages */}
        {request.status === 'ACCEPTED' && (
          <View className="mx-4 mt-3 p-5 bg-green-100 rounded-lg">
            <Typography variant="subhead" weight="semibold" className="text-center" style={{ color: '#065F46' }}>
              ✓ Request Accepted!
            </Typography>
          </View>
        )}

        {request.status === 'REJECTED' && (
          <View className="mx-4 mt-3 p-5 bg-red-100 rounded-lg">
            <Typography variant="subhead" weight="semibold" className="text-center" style={{ color: '#991B1B' }}>
              ✗ Request Rejected
            </Typography>
          </View>
        )}

        {/* Bottom spacer */}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
