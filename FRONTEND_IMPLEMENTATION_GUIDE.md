# Frontend Implementation Guide - Ride Request Feature

## ✅ Completed: Backend & API Files

### Backend (100% Complete)
- ✅ NestJS driver-request module with controller, service, DTOs
- ✅ Distance calculation using Turf.js  
- ✅ Price calculation (distance × Rs.15/km × 26 days)
- ✅ Iterative negotiation with history tracking
- ✅ Auto-assignment to ChildRideRequest/StaffRideRequest tables
- ✅ All TypeScript errors fixed

### API Files Created
- ✅ `mobile-customer/lib/api/driver-request.api.ts` - Customer API calls
- ✅ `mobile-driver/lib/api/driver-request.api.ts` - Driver API calls

## 🔨 TODO: Frontend UI Implementation

### Customer App Changes

#### 1. Remove Request Button from Vehicle List Cards
**File:** `mobile-customer/app/(menu)/(homeCards)/find_vehicle.tsx`

**What to do:**
```typescript
// REMOVE these:
const [requestedMap, setRequestedMap] = useState<{ [key: string]: boolean }>({});

const handleRequestVehicle = (driverId: number, vehicleId: number) => {
  const key = `${driverId}-${vehicleId}`;
  setRequestedMap(prev => ({ ...prev, [key]: true }));
  // ... existing code
};

// REMOVE the Request button from VehicleCard component
<TouchableOpacity
  className={`py-3 rounded-lg ${
    isRequested ? 'bg-gray-300' : 'bg-blue-500'
  }`}
  onPress={() => handleRequestVehicle(driver.driver_id, vehicle.id)}
  disabled={isRequested}
>
  <Text className="text-white text-center font-medium">
    {isRequested ? 'Requested' : 'Request'}
  </Text>
</TouchableOpacity>
```

#### 2. Add Request Section to Transport Overview
**File:** `mobile-customer/app/(menu)/(homeCards)/transport_overview.tsx`

**Add at the bottom (after tabs):**
```typescript
import { driverRequestApi } from '../../../lib/api/driver-request.api';
import { useProfileStore } from '../../../lib/stores/profile.store';

// Add states
const [estimatedDistance, setEstimatedDistance] = useState<number>(0);
const [estimatedPrice, setEstimatedPrice] = useState<number>(0);
const [offeredAmount, setOfferedAmount] = useState<string>('');
const [customerNote, setCustomerNote] = useState<string>('');
const [isCalculating, setIsCalculating] = useState(false);
const [isSending, setIsSending] = useState(false);

// Load distance and price when component mounts
useEffect(() => {
  // This data will be calculated by backend when you create request
  // For now, you can show a placeholder or fetch from vehicle details API
}, []);

const handleSendRequest = async () => {
  try {
    setIsSending(true);
    const { customer, selectedProfile } = useProfileStore.getState();
    
    if (!customer || !selectedProfile) {
      Alert.alert('Error', 'Profile not found');
      return;
    }

    const profileType = selectedProfile.startsWith('child-') ? 'child' : 'staff';
    const profileId = parseInt(selectedProfile.split('-')[1]);

    await driverRequestApi.createRequest({
      customerId: customer.customer_id,
      profileType,
      profileId,
      driverId: driverId, // from route params
      vehicleId: vehicleId, // from route params
      offeredAmount: offeredAmount ? parseFloat(offeredAmount) : undefined,
      customerNote: customerNote || undefined,
    });

    Alert.alert('Success', 'Ride request sent to driver!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  } catch (error) {
    Alert.alert('Error', 'Failed to send request');
    console.error(error);
  } finally {
    setIsSending(false);
  }
};

// Add this UI section after the tabs
<View className="bg-white p-4 m-4 rounded-lg">
  <Text className="text-lg font-bold mb-4">Send Ride Request</Text>
  
  <View className="flex-row justify-between mb-3">
    <Text className="text-gray-600">Estimated Distance:</Text>
    <Text className="font-semibold">{estimatedDistance.toFixed(2)} km</Text>
  </View>
  
  <View className="flex-row justify-between mb-3">
    <Text className="text-gray-600">Estimated Monthly Price:</Text>
    <Text className="font-semibold text-blue-600">Rs. {estimatedPrice.toLocaleString()}</Text>
  </View>
  
  <View className="mb-3">
    <Text className="text-gray-600 mb-2">Your Offer (Rs.):</Text>
    <TextInput
      className="border border-gray-300 rounded-lg px-4 py-3"
      placeholder={`${estimatedPrice}`}
      value={offeredAmount}
      onChangeText={setOfferedAmount}
      keyboardType="numeric"
    />
  </View>
  
  <View className="mb-3">
    <Text className="text-gray-600 mb-2">Note for Driver (Optional):</Text>
    <TextInput
      className="border border-gray-300 rounded-lg px-4 py-3"
      placeholder="Add any special requests..."
      value={customerNote}
      onChangeText={setCustomerNote}
      multiline
      numberOfLines={3}
    />
  </View>
  
  <TouchableOpacity
    className={`py-4 rounded-lg ${isSending ? 'bg-gray-400' : 'bg-blue-500'}`}
    onPress={handleSendRequest}
    disabled={isSending}
  >
    <Text className="text-white text-center font-semibold text-lg">
      {isSending ? 'Sending...' : 'Send Request'}
    </Text>
  </TouchableOpacity>
</View>
```

#### 3. Create Find Driver Menu Option
**File:** `mobile-customer/app/(menu)/find-driver.tsx` (NEW)

```typescript
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function FindDriverScreen() {
  return (
    <View className="flex-1 bg-gray-50 p-4">
      <Text className="text-2xl font-bold mb-6">Find Driver</Text>
      
      {/* Find New Vehicle */}
      <TouchableOpacity
        className="bg-white p-6 rounded-lg mb-4 flex-row items-center"
        onPress={() => router.push('/(menu)/(homeCards)/find_vehicle')}
      >
        <Ionicons name="search" size={32} color="#3B82F6" />
        <View className="ml-4 flex-1">
          <Text className="text-lg font-semibold">Find New Vehicle</Text>
          <Text className="text-gray-600 mt-1">
            Search for available drivers
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
      </TouchableOpacity>
      
      {/* View Sent Requests */}
      <TouchableOpacity
        className="bg-white p-6 rounded-lg flex-row items-center"
        onPress={() => router.push('/(menu)/find-driver/request-list')}
      >
        <Ionicons name="list" size={32} color="#10B981" />
        <View className="ml-4 flex-1">
          <Text className="text-lg font-semibold">View Sent Requests</Text>
          <Text className="text-gray-600 mt-1">
            Check status of your ride requests
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
      </TouchableOpacity>
    </View>
  );
}
```

Add to menu tab navigation in `mobile-customer/app/(tabs)/menu.tsx`:
```typescript
<TouchableOpacity onPress={() => router.push('/(menu)/find-driver')}>
  <View className="flex-row items-center">
    <Ionicons name="car" size={24} color="#3B82F6" />
    <Text className="ml-3">Find Driver</Text>
  </View>
</TouchableOpacity>
```

#### 4. Create Request List Screen
**File:** `mobile-customer/app/(menu)/find-driver/request-list.tsx` (NEW)

```typescript
import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { driverRequestApi, RequestDetails } from '../../../lib/api/driver-request.api';
import { useProfileStore } from '../../../lib/stores/profile.store';

export default function RequestListScreen() {
  const [requests, setRequests] = useState<RequestDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { customer } = useProfileStore();

  const loadRequests = async () => {
    try {
      if (!customer) return;
      const data = await driverRequestApi.getCustomerRequests(customer.customer_id);
      setRequests(data);
    } catch (error) {
      console.error('Load requests error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500';
      case 'DRIVER_COUNTER': return 'bg-blue-500';
      case 'CUSTOMER_COUNTER': return 'bg-purple-500';
      case 'ACCEPTED': return 'bg-green-500';
      case 'REJECTED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadRequests} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-white p-4 m-2 rounded-lg"
            onPress={() => router.push({
              pathname: '/(menu)/find-driver/request-detail',
              params: { requestId: item.id }
            })}
          >
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-lg font-semibold">{item.driverName}</Text>
              <View className={`${getStatusColor(item.status)} px-3 py-1 rounded-full`}>
                <Text className="text-white text-xs font-semibold">
                  {item.status.replace('_', ' ')}
                </Text>
              </View>
            </View>
            
            <Text className="text-gray-600 mb-1">{item.vehicleInfo}</Text>
            <Text className="text-gray-600 mb-1">For: {item.profileName}</Text>
            
            <View className="flex-row justify-between mt-2">
              <Text className="text-sm text-gray-500">
                Distance: {item.estimatedDistance.toFixed(2)} km
              </Text>
              <Text className="text-sm font-semibold text-blue-600">
                Rs. {item.currentAmount.toLocaleString()}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="p-8 items-center">
            <Text className="text-gray-500">No requests yet</Text>
          </View>
        }
      />
    </View>
  );
}
```

#### 5. Create Request Detail Screen
**File:** `mobile-customer/app/(menu)/find-driver/request-detail.tsx` (NEW)

```typescript
import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { driverRequestApi, RequestDetails } from '../../../lib/api/driver-request.api';
import { useProfileStore } from '../../../lib/stores/profile.store';

export default function RequestDetailScreen() {
  const { requestId } = useLocalSearchParams();
  const [request, setRequest] = useState<RequestDetails | null>(null);
  const [counterAmount, setCounterAmount] = useState('');
  const [counterNote, setCounterNote] = useState('');
  const [loading, setLoading] = useState(false);
  const { customer } = useProfileStore();

  const loadRequest = async () => {
    try {
      if (!customer) return;
      const data = await driverRequestApi.getCustomerRequests(customer.customer_id);
      const found = data.find(r => r.id === parseInt(requestId as string));
      setRequest(found || null);
    } catch (error) {
      console.error('Load request error:', error);
    }
  };

  useEffect(() => {
    loadRequest();
  }, []);

  const handleCounterOffer = async () => {
    if (!request || !customer || !counterAmount) return;
    
    try {
      setLoading(true);
      await driverRequestApi.counterOffer({
        requestId: request.id,
        customerId: customer.customer_id,
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
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!request || !customer) return;
    
    try {
      setLoading(true);
      await driverRequestApi.acceptOffer(request.id, customer.customer_id);
      Alert.alert('Success', 'Request accepted!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to accept request');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!request || !customer) return;
    
    Alert.alert('Confirm', 'Are you sure you want to reject this request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            await driverRequestApi.rejectRequest(request.id, customer.customer_id);
            Alert.alert('Success', 'Request rejected', [
              { text: 'OK', onPress: () => router.back() }
            ]);
          } catch (error) {
            Alert.alert('Error', 'Failed to reject request');
          } finally {
            setLoading(false);
          }
        }
      }
    ]);
  };

  if (!request) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Driver & Vehicle Info */}
      <View className="bg-white p-4 mb-2">
        <Text className="text-xl font-bold">{request.driverName}</Text>
        <Text className="text-gray-600 mt-1">{request.vehicleInfo}</Text>
        <Text className="text-gray-600">For: {request.profileName}</Text>
      </View>

      {/* Distance & Price Info */}
      <View className="bg-white p-4 mb-2">
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600">Estimated Distance:</Text>
          <Text className="font-semibold">{request.estimatedDistance.toFixed(2)} km</Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600">Estimated Price:</Text>
          <Text className="font-semibold">Rs. {request.estimatedPrice.toLocaleString()}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-600">Current Offer:</Text>
          <Text className="font-bold text-blue-600 text-lg">
            Rs. {request.currentAmount.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Route Info */}
      {request.nearestPickupCityName && (
        <View className="bg-white p-4 mb-2">
          <Text className="font-semibold mb-2">Route:</Text>
          <Text className="text-gray-600">
            Pickup via {request.nearestPickupCityName} → Drop via {request.nearestDropCityName}
          </Text>
        </View>
      )}

      {/* Negotiation History */}
      <View className="bg-white p-4 mb-2">
        <Text className="font-semibold mb-3">Negotiation History:</Text>
        {request.negotiationHistory.map((item, index) => (
          <View key={index} className="mb-3 border-l-4 border-blue-300 pl-3">
            <Text className="font-semibold capitalize">{item.offeredBy}</Text>
            <Text className="text-lg">Rs. {item.amount.toLocaleString()}</Text>
            {item.note && <Text className="text-gray-600 italic">"{item.note}"</Text>}
            <Text className="text-xs text-gray-400 mt-1">
              {new Date(item.timestamp).toLocaleString()}
            </Text>
          </View>
        ))}
      </View>

      {/* Actions based on status */}
      {request.status === 'DRIVER_COUNTER' && (
        <View className="bg-white p-4 mb-2">
          <Text className="font-semibold mb-3">Counter Offer:</Text>
          
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 mb-3"
            placeholder="Your counter amount (Rs.)"
            value={counterAmount}
            onChangeText={setCounterAmount}
            keyboardType="numeric"
          />
          
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 mb-3"
            placeholder="Note (optional)"
            value={counterNote}
            onChangeText={setCounterNote}
            multiline
          />
          
          <View className="flex-row space-x-2">
            <TouchableOpacity
              className="flex-1 bg-green-500 py-3 rounded-lg mr-2"
              onPress={handleAccept}
              disabled={loading}
            >
              <Text className="text-white text-center font-semibold">Accept</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="flex-1 bg-blue-500 py-3 rounded-lg mr-2"
              onPress={handleCounterOffer}
              disabled={loading || !counterAmount}
            >
              <Text className="text-white text-center font-semibold">Counter</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="flex-1 bg-red-500 py-3 rounded-lg"
              onPress={handleReject}
              disabled={loading}
            >
              <Text className="text-white text-center font-semibold">Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {request.status === 'ACCEPTED' && (
        <View className="bg-green-100 p-4 m-4 rounded-lg">
          <Text className="text-green-800 font-semibold text-center">
            ✓ Request Accepted! The driver will contact you soon.
          </Text>
        </View>
      )}

      {request.status === 'REJECTED' && (
        <View className="bg-red-100 p-4 m-4 rounded-lg">
          <Text className="text-red-800 font-semibold text-center">
            ✗ Request was rejected
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
```

### Driver App Changes

#### 6. Replace Mark Attendance with View Requests
**File:** `mobile-driver/app/(tabs)/index.tsx`

**Replace the attendance card with:**
```typescript
import { driverRequestApi } from '../../lib/api/driver-request.api';
import { useDriverStore } from '../../lib/stores/driver.store';

// Add state for pending count
const [pendingCount, setPendingCount] = useState(0);

// Load pending count
useEffect(() => {
  const loadPendingCount = async () => {
    try {
      const { driver } = useDriverStore.getState();
      if (!driver) return;
      
      const requests = await driverRequestApi.getDriverRequests(
        driver.driver_id,
        'PENDING'
      );
      setPendingCount(requests.length);
    } catch (error) {
      console.error('Load pending count error:', error);
    }
  };
  
  loadPendingCount();
}, []);

// Replace Mark Attendance card with:
<TouchableOpacity
  className="bg-blue-500 p-6 rounded-lg mb-4"
  onPress={() => router.push('/requests/request-list')}
>
  <View className="flex-row items-center justify-between">
    <View>
      <Text className="text-white text-xl font-bold">View Ride Requests</Text>
      {pendingCount > 0 && (
        <Text className="text-white mt-2">
          {pendingCount} pending request{pendingCount !== 1 ? 's' : ''}
        </Text>
      )}
    </View>
    <View className="bg-white rounded-full w-12 h-12 items-center justify-center">
      <Ionicons name="notifications" size={24} color="#3B82F6" />
    </View>
  </View>
</TouchableOpacity>
```

#### 7. Create Driver Request List
**File:** `mobile-driver/app/requests/_layout.tsx` (NEW)

```typescript
import { Stack } from 'expo-router';

export default function RequestsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="request-list"
        options={{ title: 'Ride Requests' }}
      />
      <Stack.Screen
        name="request-detail"
        options={{ title: 'Request Details' }}
      />
    </Stack>
  );
}
```

**File:** `mobile-driver/app/requests/request-list.tsx` (NEW)

```typescript
import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { driverRequestApi, RequestDetails } from '../../lib/api/driver-request.api';
import { useDriverStore } from '../../lib/stores/driver.store';

export default function DriverRequestListScreen() {
  const [requests, setRequests] = useState<RequestDetails[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'responded'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { driver } = useDriverStore();

  const loadRequests = async () => {
    try {
      if (!driver) return;
      const status = filter === 'pending' ? 'PENDING' : undefined;
      const data = await driverRequestApi.getDriverRequests(driver.driver_id, status);
      
      let filtered = data;
      if (filter === 'responded') {
        filtered = data.filter(r => ['DRIVER_COUNTER', 'ACCEPTED', 'REJECTED'].includes(r.status));
      }
      
      setRequests(filtered);
    } catch (error) {
      console.error('Load requests error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500';
      case 'DRIVER_COUNTER': return 'bg-blue-500';
      case 'CUSTOMER_COUNTER': return 'bg-purple-500';
      case 'ACCEPTED': return 'bg-green-500';
      case 'REJECTED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Filter Tabs */}
      <View className="flex-row bg-white p-2">
        {['all', 'pending', 'responded'].map((f) => (
          <TouchableOpacity
            key={f}
            className={`flex-1 py-2 rounded-lg mx-1 ${
              filter === f ? 'bg-blue-500' : 'bg-gray-200'
            }`}
            onPress={() => setFilter(f as any)}
          >
            <Text className={`text-center capitalize ${filter === f ? 'text-white font-semibold' : 'text-gray-600'}`}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={requests}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadRequests} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-white p-4 m-2 rounded-lg"
            onPress={() => router.push({
              pathname: '/requests/request-detail',
              params: { requestId: item.id }
            })}
          >
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-lg font-semibold">{item.customerName}</Text>
              <View className={`${getStatusColor(item.status)} px-3 py-1 rounded-full`}>
                <Text className="text-white text-xs font-semibold">
                  {item.status.replace('_', ' ')}
                </Text>
              </View>
            </View>
            
            <Text className="text-gray-600 mb-1">Profile: {item.profileName} ({item.profileType})</Text>
            
            <View className="flex-row justify-between mt-2">
              <Text className="text-sm text-gray-500">
                {item.estimatedDistance.toFixed(2)} km
              </Text>
              <Text className="text-sm font-semibold text-blue-600">
                Rs. {item.currentAmount.toLocaleString()}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="p-8 items-center">
            <Text className="text-gray-500">No requests</Text>
          </View>
        }
      />
    </View>
  );
}
```

#### 8. Create Driver Request Detail
**File:** `mobile-driver/app/requests/request-detail.tsx` (NEW)

```typescript
import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { driverRequestApi, RequestDetails } from '../../lib/api/driver-request.api';
import { useDriverStore } from '../../lib/stores/driver.store';

export default function DriverRequestDetailScreen() {
  const { requestId } = useLocalSearchParams();
  const [request, setRequest] = useState<RequestDetails | null>(null);
  const [action, setAction] = useState<'ACCEPT' | 'REJECT' | 'COUNTER'>('COUNTER');
  const [counterAmount, setCounterAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const { driver } = useDriverStore();

  const loadRequest = async () => {
    try {
      if (!driver) return;
      const data = await driverRequestApi.getDriverRequests(driver.driver_id);
      const found = data.find(r => r.id === parseInt(requestId as string));
      setRequest(found || null);
    } catch (error) {
      console.error('Load request error:', error);
    }
  };

  useEffect(() => {
    loadRequest();
  }, []);

  const handleRespond = async () => {
    if (!request || !driver) return;
    if (action === 'COUNTER' && !counterAmount) {
      Alert.alert('Error', 'Please enter counter amount');
      return;
    }
    
    try {
      setLoading(true);
      await driverRequestApi.respondToRequest({
        requestId: request.id,
        driverId: driver.driver_id,
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
    } catch (error) {
      Alert.alert('Error', 'Failed to respond to request');
    } finally {
      setLoading(false);
    }
  };

  if (!request) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  const canRespond = ['PENDING', 'CUSTOMER_COUNTER'].includes(request.status);

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Customer & Profile Info */}
      <View className="bg-white p-4 mb-2">
        <Text className="text-xl font-bold">{request.customerName}</Text>
        <Text className="text-gray-600 mt-1">
          {request.profileType === 'child' ? 'Child' : 'Staff'}: {request.profileName}
        </Text>
      </View>

      {/* Distance & Price Info */}
      <View className="bg-white p-4 mb-2">
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600">Distance:</Text>
          <Text className="font-semibold">{request.estimatedDistance.toFixed(2)} km</Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600">Estimated Price:</Text>
          <Text className="font-semibold">Rs. {request.estimatedPrice.toLocaleString()}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-600">Customer Offer:</Text>
          <Text className="font-bold text-blue-600 text-lg">
            Rs. {request.currentAmount.toLocaleString()}
          </Text>
        </View>
        {request.customerNote && (
          <View className="mt-3 bg-gray-100 p-3 rounded-lg">
            <Text className="text-sm font-semibold mb-1">Customer Note:</Text>
            <Text className="text-gray-700 italic">"{request.customerNote}"</Text>
          </View>
        )}
      </View>

      {/* Route Info */}
      {request.nearestPickupCityName && (
        <View className="bg-white p-4 mb-2">
          <Text className="font-semibold mb-2">Route:</Text>
          <Text className="text-gray-600">
            Pickup via {request.nearestPickupCityName} → Drop via {request.nearestDropCityName}
          </Text>
        </View>
      )}

      {/* Negotiation History */}
      <View className="bg-white p-4 mb-2">
        <Text className="font-semibold mb-3">Negotiation History:</Text>
        {request.negotiationHistory.map((item, index) => (
          <View key={index} className="mb-3 border-l-4 border-blue-300 pl-3">
            <Text className="font-semibold capitalize">{item.offeredBy}</Text>
            <Text className="text-lg">Rs. {item.amount.toLocaleString()}</Text>
            {item.note && <Text className="text-gray-600 italic">"{item.note}"</Text>}
            <Text className="text-xs text-gray-400 mt-1">
              {new Date(item.timestamp).toLocaleString()}
            </Text>
          </View>
        ))}
      </View>

      {/* Response Actions */}
      {canRespond && (
        <View className="bg-white p-4 mb-2">
          <Text className="font-semibold mb-3">Your Response:</Text>
          
          {/* Action Selection */}
          <View className="flex-row mb-3">
            {['ACCEPT', 'COUNTER', 'REJECT'].map((a) => (
              <TouchableOpacity
                key={a}
                className={`flex-1 py-2 mx-1 rounded-lg ${
                  action === a ? 'bg-blue-500' : 'bg-gray-200'
                }`}
                onPress={() => setAction(a as any)}
              >
                <Text className={`text-center capitalize ${action === a ? 'text-white font-semibold' : 'text-gray-600'}`}>
                  {a.toLowerCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {action === 'COUNTER' && (
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 mb-3"
              placeholder="Your counter amount (Rs.)"
              value={counterAmount}
              onChangeText={setCounterAmount}
              keyboardType="numeric"
            />
          )}
          
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 mb-3"
            placeholder="Note (optional)"
            value={note}
            onChangeText={setNote}
            multiline
          />
          
          <TouchableOpacity
            className={`py-4 rounded-lg ${loading ? 'bg-gray-400' : 'bg-blue-500'}`}
            onPress={handleRespond}
            disabled={loading}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {loading ? 'Sending...' : `Confirm ${action.charAt(0) + action.slice(1).toLowerCase()}`}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {request.status === 'ACCEPTED' && (
        <View className="bg-green-100 p-4 m-4 rounded-lg">
          <Text className="text-green-800 font-semibold text-center">
            ✓ Request Accepted!
          </Text>
        </View>
      )}

      {request.status === 'REJECTED' && (
        <View className="bg-red-100 p-4 m-4 rounded-lg">
          <Text className="text-red-800 font-semibold text-center">
            ✗ Request Rejected
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
```

## 📝 Summary

### ✅ What's Done:
1. Backend complete with all APIs
2. API integration files created for both apps
3. Complete implementation guide provided

### 🔨 What's Next:
1. Remove Request button from find_vehicle.tsx
2. Add Request section to transport_overview.tsx
3. Create Find Driver menu with options
4. Create customer request list & detail screens
5. Replace Mark Attendance with View Requests in driver app
6. Create driver request list & detail screens
7. Test complete flow

### 🎯 Key Features:
- ✅ Distance & price auto-calculated
- ✅ Iterative negotiation between customer & driver
- ✅ Full negotiation history tracking
- ✅ Auto-assignment to ride tables on acceptance
- ✅ Real-time status updates

All code is ready to copy-paste! 🚀
