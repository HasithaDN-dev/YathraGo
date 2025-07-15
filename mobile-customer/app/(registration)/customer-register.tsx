import React, { useState } from 'react';
import { View, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { CustomButton } from '../../components/ui/CustomButton';
import { CustomInput } from '../../components/ui/CustomInput';
import { ApiService } from '../../services/api';
import { CustomerRegistration } from '../../types/registration.types';

export default function CustomerRegisterScreen() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CustomerRegistration>>({
    customerId: 0,
    name: '',
    email: '',
    address: '',
    profileImageUrl: '',
    emergencyContact: '',
  });

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

  const handleInputChange = (field: keyof CustomerRegistration, value: string) => {
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
    if (!formData.name?.trim()) {
      Alert.alert('Error', 'Name is required');
      return false;
    }
    if (!formData.email?.trim()) {
      Alert.alert('Error', 'Email is required');
      return false;
    }
    if (!formData.address?.trim()) {
      Alert.alert('Error', 'Address is required');
      return false;
    }
    if (!formData.emergencyContact?.trim()) {
      Alert.alert('Error', 'Emergency contact is required');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleRegisterAndContinue = async () => {
    if (!validateForm()) return;
    
    const token = await ApiService.getStoredToken();
    if (!token) {
      Alert.alert('Error', 'Authentication token not found');
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.registerCustomer(token, formData as CustomerRegistration);
      
      if (response.success) {
        Alert.alert(
          'Success', 
          'Customer registration completed successfully!',
          [
            {
              text: 'Continue',
              onPress: () => router.push('./registration-type')
            }
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Customer registration error:', error);
      Alert.alert('Error', error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
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
              Complete Your Profile
            </ThemedText>
            <ThemedText 
              style={{ 
                fontSize: 16, 
                color: '#64748b',
                textAlign: 'center',
                lineHeight: 24
              }}
            >
              Please provide your details to continue with registration
            </ThemedText>
          </View>

          {/* Form */}
          <View style={{ gap: 20, marginBottom: 32 }}>
            <CustomInput
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.name || ''}
              onChangeText={(value: string) => handleInputChange('name', value)}
              required
            />

            <CustomInput
              label="Email Address"
              placeholder="Enter your email"
              value={formData.email || ''}
              onChangeText={(value: string) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              required
            />

            <CustomInput
              label="Address"
              placeholder="Enter your address"
              value={formData.address || ''}
              onChangeText={(value: string) => handleInputChange('address', value)}
              multiline
              numberOfLines={3}
              required
            />

            <CustomInput
              label="Emergency Contact"
              placeholder="Enter emergency contact number"
              value={formData.emergencyContact || ''}
              onChangeText={(value: string) => handleInputChange('emergencyContact', value)}
              keyboardType="phone-pad"
              required
            />

            <CustomInput
              label="Profile Image URL (Optional)"
              placeholder="Enter profile image URL"
              value={formData.profileImageUrl || ''}
              onChangeText={(value: string) => handleInputChange('profileImageUrl', value)}
              autoCapitalize="none"
            />
          </View>

          {/* Register Button */}
          <CustomButton
            title="Register and Continue"
            onPress={handleRegisterAndContinue}
            loading={loading}
            variant="primary"
            size="large"
            style={{ marginBottom: 20 }}
          />

          {/* Info Text */}
          <View style={{ 
            backgroundColor: '#f1f5f9', 
            padding: 16, 
            borderRadius: 12,
            borderLeftWidth: 4,
            borderLeftColor: '#3b82f6'
          }}>
            <ThemedText style={{ 
              fontSize: 14, 
              color: '#475569',
              lineHeight: 20
            }}>
              After completing your profile, you will be able to choose your registration type and continue with the specific registration process.
            </ThemedText>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}
