import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { CustomInput } from '../../components/ui/CustomInput';
import { ButtonComponent } from '../../components/ui/ButtonComponent';
import { ApiService } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { StaffPassengerRegistration } from '../../types/registration.types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function StaffPassengerScreen() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<StaffPassengerRegistration>>({
    customerId: 0,
    nearbyCity: '',
    workLocation: '',
    workAddress: '',
    pickUpLocation: '',
    pickupAddress: '',
  });
  const { refreshProfile } = useAuth();

  // Load customer ID from stored user data on component mount
  React.useEffect(() => {
    const loadCustomerId = async () => {
      try {
        const storedUser = await ApiService.getStoredCustomer();
        if (storedUser?.id) {
          setFormData(prev => ({
            ...prev,
            customerId: storedUser.id
          }));
        }
      } catch (error) {
        console.error('Error loading customer ID:', error);
      }
    };
    loadCustomerId();
  }, []);

  const handleInputChange = (field: keyof StaffPassengerRegistration, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.customerId || formData.customerId === 0) {
      Alert.alert('Error', 'Customer ID not found. Please log in again.');
      return false;
    }

    const requiredFields: (keyof StaffPassengerRegistration)[] = [
      'nearbyCity',
      'workLocation',
      'workAddress',
      'pickUpLocation',
      'pickupAddress'
    ];

    for (const field of requiredFields) {
      const value = formData[field];
      if (!value || (typeof value === 'string' && !value.trim())) {
        const fieldName = field.replace(/([A-Z])/g, ' $1').toLowerCase();
        Alert.alert('Error', `${fieldName} is required`);
        return false;
      }
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    const token = await ApiService.getStoredToken();
    if (!token) {
      Alert.alert('Error', 'Authentication token not found');
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.registerStaffPassenger(token, formData as StaffPassengerRegistration);

      if (response.success) {
        Alert.alert(
          'Success',
          'Staff passenger registration completed successfully!',
          [
            {
              text: 'Go to Dashboard',
              onPress: async () => {
                // Refresh authentication/profile state before navigating
                try {
                  await AsyncStorage.setItem('isRegistered', 'true');
                  await refreshProfile();
                } catch (e) {
                  // If refreshProfile fails, continue navigation
                }
                setTimeout(() => {
                  router.replace('/(tabs)');
                }, 100);
              }
            }
          ]
        );
} else {
  Alert.alert('Error', response.message || 'Registration failed');
}
    } catch (error: any) {
  console.error('Staff registration error:', error);
  Alert.alert('Error', error.message || 'Registration failed');
} finally {
  setLoading(false);
}
  };

const handleBack = () => {
  router.back();
};

return (
  <SafeAreaView style={{ flex: 1 }}>
    <ThemedView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: 32 }}>
          <ThemedText
            style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: '#1e293b',
              textAlign: 'center',
              marginBottom: 8
            }}
          >
            Staff Passenger Registration
          </ThemedText>
          <ThemedText
            style={{
              fontSize: 16,
              color: '#64748b',
              textAlign: 'center',
              lineHeight: 24
            }}
          >
            Please provide your work and pickup details
          </ThemedText>
        </View>

        {/* Form */}
        <View style={{ gap: 20, marginBottom: 32 }}>
          <CustomInput
            label="Nearby City"
            placeholder="Enter nearby city"
            value={formData.nearbyCity || ''}
            onChangeText={(value: string) => handleInputChange('nearbyCity', value)}
            required
          />

          <CustomInput
            label="Work Location"
            placeholder="Enter work location name"
            value={formData.workLocation || ''}
            onChangeText={(value: string) => handleInputChange('workLocation', value)}
            required
          />

          <CustomInput
            label="Work Address"
            placeholder="Enter full work address"
            value={formData.workAddress || ''}
            onChangeText={(value: string) => handleInputChange('workAddress', value)}
            multiline
            numberOfLines={3}
            required
          />

          <CustomInput
            label="Pickup Location"
            placeholder="Enter pickup location name"
            value={formData.pickUpLocation || ''}
            onChangeText={(value: string) => handleInputChange('pickUpLocation', value)}
            required
          />

          <CustomInput
            label="Pickup Address"
            placeholder="Enter full pickup address"
            value={formData.pickupAddress || ''}
            onChangeText={(value: string) => handleInputChange('pickupAddress', value)}
            multiline
            numberOfLines={3}
            required
          />
        </View>

        {/* Action Buttons */}
        <View style={{ gap: 12 }}>
          <ButtonComponent
            title="Complete Registration"
            onPress={handleRegister}
            loading={loading}
            variant="primary"
            size="large"
          />

          <ButtonComponent
            title="Back"
            onPress={handleBack}
            variant="secondary"
            size="large"
          />
        </View>

        {/* Info Text */}
        <View style={{
          backgroundColor: '#f1f5f9',
          padding: 16,
          borderRadius: 12,
          borderLeftWidth: 4,
          borderLeftColor: '#3b82f6',
          marginTop: 20
        }}>
          <ThemedText style={{
            fontSize: 14,
            color: '#475569',
            lineHeight: 20
          }}>
            After completing this registration, you will be able to access staff passenger features and book rides to your work location.
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  </SafeAreaView>
);
}
