import React, { useState, useEffect } from 'react';
import { View, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStripe } from '@stripe/stripe-react-native';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import CustomButton from '@/components/ui/CustomButton';
import { CreditCard } from 'phosphor-react-native';
import { createPaymentIntentApi, confirmPaymentApi } from '@/lib/api/stripe.api';
import { checkBackendHealth } from '@/lib/utils/backend-health';
import { useLocalSearchParams, useRouter } from 'expo-router';

// Month names for display
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface SelectedPayment {
  id: number;
  year: number;
  month: number;
  amountDue: number;
  paymentStatus: string;
}

export default function CardPaymentScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  
  const [loading, setLoading] = useState(false);
  const [paymentReady, setPaymentReady] = useState(false);
  const [selectedPayments, setSelectedPayments] = useState<SelectedPayment[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);

  // Parse params
  const childId = params.childId ? parseInt(params.childId as string) : 0;
  const customerId = params.customerId ? parseInt(params.customerId as string) : 0;
  const parentName = (params.parentName as string) || 'Customer';

  // Parse selected payments from JSON string
  useEffect(() => {
    try {
      const paymentsData = JSON.parse(params.selectedPayments as string) as SelectedPayment[];
      setSelectedPayments(paymentsData);
      
      // Calculate total amount
      const total = paymentsData.reduce((sum, payment) => sum + payment.amountDue, 0);
      setTotalAmount(total);
    } catch (error) {
      console.error('Failed to parse selected payments:', error);
      Alert.alert('Error', 'Invalid payment data');
      router.back();
    }
  }, [params.selectedPayments, router]);

  const handlePayNow = async () => {
    if (selectedPayments.length === 0) {
      Alert.alert('Error', 'No payments selected');
      return;
    }

    setLoading(true);
    
    try {
      // Step 1: Check backend health
      const isBackendHealthy = await checkBackendHealth();
      if (!isBackendHealthy) {
        setLoading(false);
        Alert.alert(
          'Connection Error',
          'Cannot connect to payment server. Please check your internet connection and ensure the backend is running.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Step 2: Validate payment IDs (must not be 0)
      const invalidPayments = selectedPayments.filter(p => !p.id || p.id === 0);
      if (invalidPayments.length > 0) {
        setLoading(false);
        Alert.alert(
          'Invalid Payment Records',
          'Some payment records are not ready. Please go back and refresh the payment screen.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
        return;
      }

      // Step 3: Create payment intent
      console.log('Creating payment intent for payments:', selectedPayments.map(p => p.id));
      const paymentIds = selectedPayments.map(p => p.id);
      const { clientSecret, paymentIntentId } = await createPaymentIntentApi({
        childId,
        customerId,
        paymentIds,
        totalAmount,
        description: `Payment for ${selectedPayments.length} month(s)`,
      });

      console.log('Payment intent created:', paymentIntentId);

      // Step 4: Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'YathraGo',
        paymentIntentClientSecret: clientSecret,
        defaultBillingDetails: {
          name: parentName,
        },
        allowsDelayedPaymentMethods: false,
      });

      if (initError) {
        console.error('Init payment sheet error:', initError);
        setLoading(false);
        Alert.alert(
          'Payment Setup Failed',
          initError.message || 'Failed to initialize payment. Please try again.',
          [{ text: 'OK' }]
        );
        return;
      }

      console.log('Payment sheet initialized successfully');
      setLoading(false);

      // Step 5: Present payment sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        // User cancelled or error occurred
        if (presentError.code === 'Canceled') {
          console.log('User cancelled payment');
        } else {
          console.error('Present payment sheet error:', presentError);
          Alert.alert('Payment Failed', presentError.message || 'Payment was not completed');
        }
        return;
      }

      // Step 6: Payment successful - confirm with backend
      console.log('Payment successful, confirming with backend...');
      setLoading(true);
      const confirmResponse = await confirmPaymentApi({ paymentIntentId });

      Alert.alert(
        'Payment Successful!',
        confirmResponse.message || 'Your payment has been processed successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to payment screen
              router.back();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Card payment error:', error);
      
      // Provide specific error messages based on error type
      let errorMessage = 'Failed to process payment. Please try again.';
      
      if (error.message?.includes('fetch') || error.message?.includes('Network')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message?.includes('payment intent') || error.message?.includes('not found')) {
        errorMessage = 'Failed to create payment. Please go back and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert(
        'Payment Failed',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ScreenHeader title="Card Payment" showBackButton onBackPress={handleGoBack} />

        <View className="px-4">
          {/* Selected Months Summary */}
          <Card className="p-4 mb-4">
            <Typography variant="subhead" weight="semibold" className="text-black mb-4">
              Payment Summary
            </Typography>

            {selectedPayments.map((payment, index) => (
              <View key={`${payment.year}-${payment.month}`} className="flex-row justify-between items-center mb-2">
                <Typography variant="body" className="text-gray-700">
                  {MONTH_NAMES[payment.month - 1]} {payment.year}
                </Typography>
                <Typography variant="body" weight="medium" className="text-black">
                  Rs. {payment.amountDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </View>
            ))}

            <View className="h-px bg-gray-300 my-4" />

            <View className="flex-row justify-between items-center">
              <Typography variant="subhead" weight="semibold" className="text-black">
                Total Amount
              </Typography>
              <Typography variant="headline" weight="bold" className="text-brand-deepNavy">
                Rs. {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </View>
          </Card>

          {/* Payment Information */}
          <Card className="p-4 mb-4">
            <Typography variant="subhead" weight="semibold" className="text-black mb-3">
              How Payment Works
            </Typography>

            <View className="space-y-3">
              <View className="flex-row items-start">
                <View className="w-6 h-6 rounded-full bg-brand-deepNavy items-center justify-center mr-3 mt-0.5">
                  <Typography variant="caption-1" weight="bold" className="text-white">
                    1
                  </Typography>
                </View>
                <View className="flex-1">
                  <Typography variant="body" className="text-gray-700">
                    Tap the &quot;Pay Now&quot; button below
                  </Typography>
                </View>
              </View>

              <View className="flex-row items-start">
                <View className="w-6 h-6 rounded-full bg-brand-deepNavy items-center justify-center mr-3 mt-0.5">
                  <Typography variant="caption-1" weight="bold" className="text-white">
                    2
                  </Typography>
                </View>
                <View className="flex-1">
                  <Typography variant="body" className="text-gray-700">
                    Enter your card details in the secure Stripe payment form
                  </Typography>
                </View>
              </View>

              <View className="flex-row items-start">
                <View className="w-6 h-6 rounded-full bg-brand-deepNavy items-center justify-center mr-3 mt-0.5">
                  <Typography variant="caption-1" weight="bold" className="text-white">
                    3
                  </Typography>
                </View>
                <View className="flex-1">
                  <Typography variant="body" className="text-gray-700">
                    Confirm your payment - funds will be processed immediately
                  </Typography>
                </View>
              </View>
            </View>

            <View className="bg-gray-100 p-3 rounded-lg mt-4">
              <Typography variant="caption-1" className="text-gray-600 text-center">
                � Your card information is securely processed by Stripe
              </Typography>
            </View>
          </Card>

          {/* Test Card Info (for development) */}
          <Card className="p-4 mb-4 bg-blue-50 border border-blue-200">
            <Typography variant="caption-1" weight="semibold" className="text-blue-900 mb-2">
              🧪 Test Card for Development
            </Typography>
            <Typography variant="caption-2" className="text-blue-700">
              Card: 4242 4242 4242 4242{'\n'}
              Expiry: Any future date (e.g., 12/34){'\n'}
              CVC: Any 3 digits (e.g., 123)
            </Typography>
          </Card>

          {/* Pay Now Button */}
          <View className="mb-8">
            <CustomButton
              title={loading ? 'Processing...' : `Pay Rs. ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              bgVariant="primary"
              textVariant="white"
              size="large"
              IconLeft={CreditCard}
              className="w-full"
              onPress={handlePayNow}
              disabled={loading}
            />

            {loading && (
              <View className="mt-4 items-center">
                <ActivityIndicator size="small" color="#143373" />
                <Typography variant="caption-1" className="text-gray-600 mt-2">
                  Processing your payment securely...
                </Typography>
              </View>
            )}
          </View>

          {/* Security Info */}
          <View className="mb-8 p-4 bg-gray-100 rounded-xl">
            <Typography variant="caption-1" className="text-gray-700 text-center">
              🔒 Secure Payment{'\n'}
              Your payment is protected by Stripe&apos;s industry-leading security
            </Typography>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
