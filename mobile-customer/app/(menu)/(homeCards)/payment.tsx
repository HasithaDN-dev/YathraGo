import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import CustomButton from '@/components/ui/CustomButton';
import { CheckCircle, CreditCard, Money } from 'phosphor-react-native';
import { getPayableMonthsApi, submitMonthsForPaymentApi, PaymentMonth } from '@/lib/api/payments.api';
import { useProfileStore } from '@/lib/stores/profile.store';
import { useLocalSearchParams } from 'expo-router';

type PaymentType = 'card' | 'physical';

// Month names for display
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Status color mapping
const getStatusColor = (status: string): string => {
  switch (status.toUpperCase()) {
    case 'PAID':
      return 'bg-success';
    case 'OVERDUE':
      return 'bg-danger';
    case 'GRACE_PERIOD':
      return 'bg-warning';
    case 'CANCELLED':
      return 'bg-gray-500';
    case 'AWAITING_CONFIRMATION':
      return 'bg-brand-brightOrange';
    case 'PENDING':
    case 'NOT_DUE':
      return 'bg-brand-deepNavy';
    default:
      return 'bg-gray-400';
  }
};

// Format status for display
const formatStatus = (status: string): string => {
  switch (status.toUpperCase()) {
    case 'GRACE_PERIOD':
      return 'Grace Period';
    case 'AWAITING_CONFIRMATION':
      return 'Awaiting Confirmation';
    case 'NOT_DUE':
      return 'Not Due';
    case 'NOT_CREATED':
      return 'Not Available';
    default:
      return status.charAt(0) + status.slice(1).toLowerCase();
  }
};

export default function PaymentScreen() {
  // Get payment type from navigation params (if coming from Payment Method screen)
  const params = useLocalSearchParams();
  const initialPaymentType = (params.paymentType as PaymentType) || 'card';
  
  const [paymentType, setPaymentType] = useState<PaymentType>(initialPaymentType);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [months, setMonths] = useState<PaymentMonth[]>([]);
  const [currentMonthStatus, setCurrentMonthStatus] = useState<string>('');
  const [selectedMonths, setSelectedMonths] = useState<Set<string>>(new Set());
  
  const { activeProfile } = useProfileStore();
  
  // Extract child ID from profile
  const childId = activeProfile?.id ? 
    parseInt(activeProfile.id.replace('child-', '')) : null;

  const fetchPayableMonths = useCallback(async () => {
    if (!childId) {
      Alert.alert('Error', 'Please select a child profile');
      return;
    }

    setLoading(true);
    try {
      const response = await getPayableMonthsApi(childId);
      setMonths(response.months);
      setCurrentMonthStatus(response.currentMonth.paymentStatus);
    } catch (error: any) {
      console.error('Failed to fetch payable months:', error);
      Alert.alert('Error', error.message || 'Failed to load payment information');
    } finally {
      setLoading(false);
    }
  }, [childId]);

  // Fetch payable months when switching to physical payment
  useEffect(() => {
    if (paymentType === 'physical' && childId) {
      fetchPayableMonths();
    }
  }, [paymentType, childId, fetchPayableMonths]);

  const toggleMonthSelection = (year: number, month: number) => {
    const key = `${year}-${month}`;
    const newSelection = new Set(selectedMonths);
    
    if (newSelection.has(key)) {
      newSelection.delete(key);
    } else {
      newSelection.add(key);
    }
    
    setSelectedMonths(newSelection);
  };

  const handleProceed = async () => {
    if (selectedMonths.size === 0) {
      Alert.alert('No Selection', 'Please select at least one month to proceed');
      return;
    }

    if (!childId) {
      Alert.alert('Error', 'Child ID not found');
      return;
    }

    setSubmitting(true);
    try {
      // Convert selected months to API format
      const monthsToSubmit = Array.from(selectedMonths).map(key => {
        const [year, month] = key.split('-').map(Number);
        return { year, month };
      });

      const response = await submitMonthsForPaymentApi({
        childId,
        months: monthsToSubmit,
      });

      Alert.alert(
        'Success',
        response.message || 'Payment submitted for driver confirmation',
        [
          {
            text: 'OK',
            onPress: () => {
              // Clear selection and refresh
              setSelectedMonths(new Set());
              fetchPayableMonths();
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Failed to submit payment:', error);
      Alert.alert('Error', error.message || 'Failed to submit payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCardPayment = () => {
    Alert.alert('Card Payment', 'Card payment integration coming soon!');
  };

  // Check if a month can be selected
  const canSelectMonth = (status: string): boolean => {
    const upperStatus = status.toUpperCase();
    return upperStatus !== 'PAID' && 
           upperStatus !== 'CANCELLED' && 
           upperStatus !== 'AWAITING_CONFIRMATION' &&
           upperStatus !== 'NOT_CREATED';
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ScreenHeader title="Payments" showBackButton />

        {/* Payment Type Toggle */}
        <View className="mx-4 mb-6">
          <Card className="bg-gray-100 p-2 rounded-2xl">
            <View className="flex-row">
              <TouchableOpacity
                className={`flex-1 py-3 rounded-xl ${paymentType === 'card' ? 'bg-white' : 'bg-transparent'}`}
                activeOpacity={0.8}
                onPress={() => setPaymentType('card')}
              >
                <Typography
                  variant="subhead"
                  weight={paymentType === 'card' ? 'semibold' : 'medium'}
                  className={`text-center ${paymentType === 'card' ? 'text-brand-deepNavy' : 'text-gray-600'}`}
                >
                  Card Payment
                </Typography>
              </TouchableOpacity>
              
              <TouchableOpacity
                className={`flex-1 py-3 rounded-xl ${paymentType === 'physical' ? 'bg-white' : 'bg-transparent'}`}
                activeOpacity={0.8}
                onPress={() => setPaymentType('physical')}
              >
                <Typography
                  variant="subhead"
                  weight={paymentType === 'physical' ? 'semibold' : 'medium'}
                  className={`text-center ${paymentType === 'physical' ? 'text-brand-deepNavy' : 'text-gray-600'}`}
                >
                  Physical Payment
                </Typography>
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        {/* Card Payment View */}
        {paymentType === 'card' && (
          <View className="px-4">
            <Card className="p-6 mb-4">
              <View className="mb-6">
                <Typography variant="subhead" className="text-black mb-4">
                  Card Payment Summary
                </Typography>
                
                <View className="flex-row justify-between items-center mb-3">
                  <Typography variant="body" className="text-gray-700">
                    Monthly Amount:
                  </Typography>
                  <Typography variant="body" weight="semibold" className="text-black">
                    Rs. 8,500.00
                  </Typography>
                </View>
                
                <View className="flex-row justify-between items-center mb-6">
                  <Typography variant="body" className="text-gray-700">
                    Total Payable:
                  </Typography>
                  <Typography variant="headline" weight="semibold" className="text-brand-deepNavy">
                    Rs. 8,500.00
                  </Typography>
                </View>
              </View>

              <CustomButton
                title="Pay with Card"
                bgVariant="primary"
                textVariant="white"
                size="large"
                IconLeft={CreditCard}
                className="w-full"
                onPress={handleCardPayment}
              />
            </Card>
          </View>
        )}

        {/* Physical Payment View */}
        {paymentType === 'physical' && (
          <View className="px-4">
            {/* Current Month Status Header */}
            <View className={`mb-6 p-4 rounded-2xl ${getStatusColor(currentMonthStatus)}`}>
              <Typography variant="subhead" weight="semibold" className="text-white text-center mb-2">
                Payments
              </Typography>
              <Typography variant="caption-1" className="text-white text-center">
                Current Status: {formatStatus(currentMonthStatus)}
              </Typography>
            </View>

            {/* Loading State */}
            {loading && (
              <View className="py-12 items-center justify-center">
                <ActivityIndicator size="large" color="#143373" />
                <Typography variant="body" className="text-gray-600 mt-4">
                  Loading payment information...
                </Typography>
              </View>
            )}

            {/* Months List */}
            {!loading && months.length > 0 && (
              <>
                <Typography variant="subhead" weight="semibold" className="text-black mb-4">
                  Select Months to Pay
                </Typography>
                
                {months.map((month, index) => {
                  const monthKey = `${month.year}-${month.month}`;
                  const isSelected = selectedMonths.has(monthKey);
                  const selectable = canSelectMonth(month.paymentStatus);
                  
                  return (
                    <TouchableOpacity
                      key={monthKey}
                      className={`mb-3 ${!selectable && 'opacity-50'}`}
                      activeOpacity={selectable ? 0.7 : 1}
                      onPress={() => selectable && toggleMonthSelection(month.year, month.month)}
                      disabled={!selectable}
                    >
                      <Card className={`p-4 ${isSelected ? 'border-2 border-brand-deepNavy' : ''}`}>
                        <View className="flex-row items-center justify-between">
                          {/* Month Info */}
                          <View className="flex-1">
                            <Typography variant="subhead" weight="semibold" className="text-black mb-1">
                              {MONTH_NAMES[month.month - 1]} {month.year}
                            </Typography>
                            <View className={`self-start px-3 py-1 rounded-full ${getStatusColor(month.paymentStatus)}`}>
                              <Typography variant="caption-2" className="text-white">
                                {formatStatus(month.paymentStatus)}
                              </Typography>
                            </View>
                          </View>
                          
                          {/* Selection Indicator */}
                          {selectable && (
                            <View className="ml-3">
                              {isSelected ? (
                                <CheckCircle size={28} color="#143373" weight="fill" />
                              ) : (
                                <View className="w-7 h-7 rounded-full border-2 border-gray-400" />
                              )}
                            </View>
                          )}
                        </View>
                      </Card>
                    </TouchableOpacity>
                  );
                })}

                {/* Proceed Button */}
                {selectedMonths.size > 0 && (
                  <View className="mt-6 mb-8">
                    <CustomButton
                      title={`Proceed (${selectedMonths.size} month${selectedMonths.size > 1 ? 's' : ''})`}
                      bgVariant="primary"
                      textVariant="white"
                      size="large"
                      IconLeft={Money}
                      className="w-full"
                      onPress={handleProceed}
                      disabled={submitting}
                    />
                    
                    {submitting && (
                      <View className="mt-4 items-center">
                        <ActivityIndicator size="small" color="#143373" />
                        <Typography variant="caption-1" className="text-gray-600 mt-2">
                          Submitting payment...
                        </Typography>
                      </View>
                    )}
                  </View>
                )}

                {/* Info Text */}
                <View className="mb-8 p-4 bg-gray-100 rounded-xl">
                  <Typography variant="caption-1" className="text-gray-700 text-center">
                    Selected months will be submitted to your driver for confirmation.
                    {'\n'}Pay the amount directly to your driver.
                  </Typography>
                </View>
              </>
            )}

            {/* Empty State */}
            {!loading && months.length === 0 && (
              <View className="py-12 items-center justify-center">
                <Typography variant="body" className="text-gray-600 text-center">
                  No payment information available
                </Typography>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
