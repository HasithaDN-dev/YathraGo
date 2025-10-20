import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useLocalSearchParams, router } from 'expo-router';
import { driverRequestApi, RequestDetails } from '@/lib/api/driver-request.api';
import { useProfileStore } from '@/lib/stores/profile.store';
import { useAssignedRideStore } from '@/lib/stores/assigned-ride.store';
import { MapPin, Clock, User, Check, X } from 'phosphor-react-native';
import { Colors } from '@/constants/Colors';

export default function RequestDetailScreen() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const [request, setRequest] = useState<RequestDetails | null>(null);
  const [counterAmount, setCounterAmount] = useState('');
  const [counterNote, setCounterNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { customerProfile, activeProfile } = useProfileStore();
  const { loadAssignedRide } = useAssignedRideStore();

  const loadRequest = async () => {
    try {
      if (!customerProfile || !requestId) return;
      const data = await driverRequestApi.getCustomerRequests(customerProfile.customer_id);
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

  const handleCounterOffer = async () => {
    if (!request || !customerProfile || !counterAmount) {
      Alert.alert('Error', 'Please enter a counter amount');
      return;
    }
    
    try {
      setActionLoading(true);
      await driverRequestApi.counterOffer({
        requestId: request.id,
        customerId: customerProfile.customer_id,
        amount: parseFloat(counterAmount),
        note: counterNote,
      });
      Alert.alert('Success', 'Counter offer sent!');
      loadRequest();
      setCounterAmount('');
      setCounterNote('');
    } catch (error) {
      Alert.alert('Error', 'Failed to send counter offer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!request || !customerProfile) return;
    
    Alert.alert(
      'Confirm',
      'Are you sure you want to accept this offer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              setActionLoading(true);
              await driverRequestApi.acceptOffer(request.id, customerProfile.customer_id);
              
              // Reload assigned ride for the active profile
              if (activeProfile) {
                const profileIdStr = activeProfile.id.split('-')[1];
                const profileId = parseInt(profileIdStr, 10);
                await loadAssignedRide(activeProfile.type, profileId);
              }
              
              Alert.alert('Success', 'Driver assigned successfully!', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to accept request');
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleReject = async () => {
    if (!request || !customerProfile) return;
    
    Alert.alert(
      'Confirm',
      'Are you sure you want to reject this request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              await driverRequestApi.rejectRequest(request.id, customerProfile.customer_id);
              Alert.alert('Success', 'Request rejected', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to reject request');
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ScreenHeader title="Request Details" showBackButton />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.warmYellow} />
        </View>
      </SafeAreaView>
    );
  }

  if (!request) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ScreenHeader title="Request Details" showBackButton />
        <View className="flex-1 items-center justify-center px-4">
          <Typography variant="body" className="text-gray-500 text-center">
            Request not found
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

  const canRespond = request.status === 'DRIVER_COUNTER';

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScreenHeader title="Request Details" showBackButton />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Driver & Vehicle Info */}
        <Card className="mx-4 mt-4 p-5">
          <View className="flex-row items-center mb-3">
            <View className="w-12 h-12 bg-gray-200 rounded-full items-center justify-center mr-3">
              <User size={24} color={Colors.deepNavy} weight="regular" />
            </View>
            <View className="flex-1">
              <Typography variant="title-3" weight="semibold" className="text-brand-deepNavy">
                {request.driverName}
              </Typography>
              <Typography variant="footnote" className="text-brand-neutralGray">
                {request.vehicleInfo}
              </Typography>
            </View>
          </View>
          <Typography variant="footnote" className="text-brand-neutralGray">
            For: {request.profileName}
          </Typography>
        </Card>

        {/* Distance & Price Info */}
        <Card className="mx-4 mt-3 p-5">
          <Typography variant="subhead" weight="semibold" className="text-brand-deepNavy mb-3">
            Ride Details
          </Typography>
          
          <View className="flex-row justify-between mb-2">
            <Typography variant="footnote" className="text-brand-neutralGray">
              Estimated Distance:
            </Typography>
            <Typography variant="footnote" weight="semibold" className="text-black">
              {request.estimatedDistance.toFixed(2)} km
            </Typography>
          </View>
          
          <View className="flex-row justify-between mb-2">
            <Typography variant="footnote" className="text-brand-neutralGray">
              Estimated Price:
            </Typography>
            <Typography variant="footnote" weight="semibold" className="text-black">
              Rs. {request.estimatedPrice.toLocaleString()}
            </Typography>
          </View>
          
          <View className="flex-row justify-between pt-3 mt-3 border-t border-gray-200">
            <Typography variant="subhead" className="text-brand-neutralGray">
              Current Offer:
            </Typography>
            <Typography variant="title-3" weight="bold" className="text-blue-600">
              Rs. {request.currentAmount.toLocaleString()}
            </Typography>
          </View>
        </Card>

        {/* Route Info */}
        {request.nearestPickupCityName && request.nearestDropCityName && (
          <Card className="mx-4 mt-3 p-5">
            <Typography variant="subhead" weight="semibold" className="text-brand-deepNavy mb-3">
              Route
            </Typography>
            <View className="flex-row items-center">
              <MapPin size={16} color={Colors.neutralGray} weight="regular" />
              <Typography variant="footnote" className="text-brand-neutralGray ml-2">
                Pickup via {request.nearestPickupCityName} → Drop via {request.nearestDropCityName}
              </Typography>
            </View>
          </Card>
        )}

        {/* Negotiation History */}
        <Card className="mx-4 mt-3 p-5">
          <Typography variant="subhead" weight="semibold" className="text-brand-deepNavy mb-3">
            Negotiation History
          </Typography>
          {request.negotiationHistory.map((item, index) => (
            <View key={index} className="mb-3 pl-3 border-l-4 border-blue-300">
              <View className="flex-row items-center justify-between mb-1">
                <Typography variant="footnote" weight="semibold" className="text-brand-deepNavy capitalize">
                  {item.offeredBy}
                </Typography>
                <Typography variant="body" weight="semibold" className="text-black">
                  Rs. {item.amount.toLocaleString()}
                </Typography>
              </View>
              {item.note && (
                <Typography variant="caption-1" className="text-brand-neutralGray italic mb-1">
                  "{item.note}"
                </Typography>
              )}
              <View className="flex-row items-center">
                <Clock size={12} color={Colors.neutralGray} weight="regular" />
                <Typography variant="caption-2" className="text-brand-neutralGray ml-1">
                  {new Date(item.timestamp).toLocaleString()}
                </Typography>
              </View>
            </View>
          ))}
        </Card>

        {/* Response Actions */}
        {canRespond && (
          <Card className="mx-4 mt-3 p-5">
            <Typography variant="subhead" weight="semibold" className="text-brand-deepNavy mb-3">
              Your Response
            </Typography>
            
            <View className="mb-3">
              <Typography variant="footnote" className="text-black mb-2">
                Counter Amount (Rs.):
              </Typography>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3"
                style={{ backgroundColor: '#f9fafb' }}
                placeholder="Enter counter amount"
                value={counterAmount}
                onChangeText={setCounterAmount}
                keyboardType="numeric"
              />
            </View>
            
            <View className="mb-4">
              <Typography variant="footnote" className="text-black mb-2">
                Note (Optional):
              </Typography>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3"
                style={{ backgroundColor: '#f9fafb', minHeight: 80, textAlignVertical: 'top' }}
                placeholder="Add your message..."
                value={counterNote}
                onChangeText={setCounterNote}
                multiline
              />
            </View>
            
            <View className="flex-row gap-2">
              <TouchableOpacity
                className="flex-1 bg-green-500 py-3 rounded-lg mr-2"
                onPress={handleAccept}
                disabled={actionLoading}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center justify-center">
                  <Check size={20} color="#ffffff" weight="bold" />
                  <Typography variant="subhead" weight="semibold" className="text-white ml-2">
                    Accept
                  </Typography>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                className={`flex-1 py-3 rounded-lg mr-2 ${!counterAmount || actionLoading ? 'bg-gray-400' : 'bg-blue-500'}`}
                onPress={handleCounterOffer}
                disabled={!counterAmount || actionLoading}
                activeOpacity={0.8}
              >
                <Typography variant="subhead" weight="semibold" className="text-white text-center">
                  Counter
                </Typography>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-1 bg-red-500 py-3 rounded-lg"
                onPress={handleReject}
                disabled={actionLoading}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center justify-center">
                  <X size={20} color="#ffffff" weight="bold" />
                  <Typography variant="subhead" weight="semibold" className="text-white ml-2">
                    Reject
                  </Typography>
                </View>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Status Messages */}
        {request.status === 'ACCEPTED' && (
          <Card className="mx-4 mt-3 p-5 bg-green-100">
            <Typography variant="subhead" weight="semibold" className="text-green-800 text-center">
              ✓ Request Accepted! The driver will contact you soon.
            </Typography>
          </Card>
        )}

        {request.status === 'REJECTED' && (
          <Card className="mx-4 mt-3 p-5 bg-red-100">
            <Typography variant="subhead" weight="semibold" className="text-red-800 text-center">
              ✗ Request was rejected
            </Typography>
          </Card>
        )}

        {request.status === 'PENDING' && (
          <Card className="mx-4 mt-3 p-5 bg-yellow-100">
            <Typography variant="subhead" weight="semibold" className="text-yellow-800 text-center">
              ⏳ Waiting for driver's response...
            </Typography>
          </Card>
        )}

        {/* Bottom spacer */}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
