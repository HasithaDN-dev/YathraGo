import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { CustomInput } from '../../components/ui/CustomInput';
import { CustomButton } from '../../components/ui/CustomButton';
import { useAuth } from '../../hooks/useAuth';
import { ApiService } from '../../services/api';
import { ChildRegistration } from '../../types/registration.types';

export default function ChildRegistrationScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<ChildRegistration>>({
    customerId: user?.id || 0,
    childName: '',
    relationship: '',
    nearbyCity: '',
    schoolLocation: '',
    school: '',
    pickUpAddress: '',
    childImageUrl: '',
  });

  const handleInputChange = (field: keyof ChildRegistration, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    const requiredFields: (keyof ChildRegistration)[] = [
      'childName', 
      'relationship', 
      'nearbyCity', 
      'schoolLocation', 
      'school', 
      'pickUpAddress'
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
    
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      Alert.alert('Error', 'Authentication token not found');
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.registerChild(token, formData as ChildRegistration);
      
      if (response.success) {
        Alert.alert(
          'Success', 
          'Child registration completed successfully!',
          [
            {
              text: 'Go to Dashboard',
              onPress: () => router.replace('/(tabs)')
            }
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Child registration error:', error);
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
              Child Registration
            </ThemedText>
            <ThemedText 
              style={{ 
                fontSize: 16, 
                color: '#64748b',
                textAlign: 'center',
                lineHeight: 24
              }}
            >
              Please provide your child&apos;s school and transport details
            </ThemedText>
          </View>

          {/* Form */}
          <View style={{ gap: 20, marginBottom: 32 }}>
            <CustomInput
              label="Child Name"
              placeholder="Enter child's full name"
              value={formData.childName || ''}
              onChangeText={(value: string) => handleInputChange('childName', value)}
              required
            />

            <CustomInput
              label="Relationship"
              placeholder="e.g., Father, Mother, Guardian"
              value={formData.relationship || ''}
              onChangeText={(value: string) => handleInputChange('relationship', value)}
              required
            />

            <CustomInput
              label="Nearby City"
              placeholder="Enter nearby city"
              value={formData.nearbyCity || ''}
              onChangeText={(value: string) => handleInputChange('nearbyCity', value)}
              required
            />

            <CustomInput
              label="School Location"
              placeholder="Enter school location/area"
              value={formData.schoolLocation || ''}
              onChangeText={(value: string) => handleInputChange('schoolLocation', value)}
              required
            />

            <CustomInput
              label="School Name"
              placeholder="Enter school name"
              value={formData.school || ''}
              onChangeText={(value: string) => handleInputChange('school', value)}
              required
            />

            <CustomInput
              label="Pickup Address"
              placeholder="Enter pickup address"
              value={formData.pickUpAddress || ''}
              onChangeText={(value: string) => handleInputChange('pickUpAddress', value)}
              multiline
              numberOfLines={3}
              required
            />

            <CustomInput
              label="Child Image URL (Optional)"
              placeholder="Enter child's image URL"
              value={formData.childImageUrl || ''}
              onChangeText={(value: string) => handleInputChange('childImageUrl', value)}
              autoCapitalize="none"
            />
          </View>

          {/* Action Buttons */}
          <View style={{ gap: 12 }}>
            <CustomButton
              title="Complete Registration"
              onPress={handleRegister}
              loading={loading}
              variant="primary"
              size="large"
            />

            <CustomButton
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
              After completing this registration, you will be able to track your child&apos;s school transport and receive notifications about pickup times.
            </ThemedText>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}
