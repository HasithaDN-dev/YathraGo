import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useDriverStore } from '@/lib/stores/driver.store';
import {
  getPendingConfirmationsApi,
  acceptPaymentConfirmationApi,
  getDriverPayments,
  PendingConfirmation,
} from '@/lib/api/transactions.api';
import { Check, Calendar, User, Money } from 'phosphor-react-native';

// Month names for display
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function PaymentManagementScreen() {
  const { profile } = useDriverStore();
  const driverId = profile?.id;

  const [pendingPayments, setPendingPayments] = useState<PendingConfirmation[]>([]);
  const [totalMonthlyIncome, setTotalMonthlyIncome] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [acceptingPaymentId, setAcceptingPaymentId] = useState<number | null>(null);

  // Calculate today's date and current month stats
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  const todayFormatted = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Fetch pending confirmations and monthly income
  const fetchPendingPayments = useCallback(async () => {
    if (!driverId) {
      console.warn('Driver ID not found, skipping payment fetch');
      return;
    }

    setLoading(true);
    try {
      // Fetch pending confirmations
      const pendingData = await getPendingConfirmationsApi(driverId);
      setPendingPayments(pendingData || []);

      // Fetch all payments for current month to calculate income
      try {
        const allPayments = await getDriverPayments(driverId, {
          month: currentMonth,
          year: currentYear,
          status: 'PAID',
        });

        // Calculate total income from PAID payments (default to 0 if no items)
        const income = (allPayments?.items || []).reduce(
          (sum, payment) => sum + (payment.amountPaid || 0), 
          0
        );
        setTotalMonthlyIncome(income);
      } catch (incomeError) {
        // If fetching income fails, just set to 0
        console.warn('Failed to fetch monthly income, defaulting to 0:', incomeError);
        setTotalMonthlyIncome(0);
      }
    } catch (error: any) {
      console.error('Failed to fetch payments:', error);
      // Don't show error if it's just empty data
      if (!error.message?.includes('404') && !error.message?.includes('not found')) {
        Alert.alert('Error', error.message || 'Failed to load payments');
      }
      // Set defaults
      setPendingPayments([]);
      setTotalMonthlyIncome(0);
    } finally {
      setLoading(false);
    }
  }, [driverId, currentMonth, currentYear]);

  // Refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPendingPayments();
    setRefreshing(false);
  };

  // Accept payment handler
  const handleAcceptPayment = async (payment: PendingConfirmation) => {
    if (!driverId) {
      Alert.alert('Error', 'Driver ID not found');
      return;
    }

    Alert.alert(
      'Confirm Payment',
      `Accept payment of Rs. ${payment.finalPrice.toFixed(2)} from ${payment.Customer.firstName} ${payment.Customer.lastName} for ${MONTH_NAMES[payment.paymentMonth - 1]} ${payment.paymentYear}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Accept',
          onPress: async () => {
            setAcceptingPaymentId(payment.id);
            try {
              await acceptPaymentConfirmationApi(payment.id, driverId);
              Alert.alert('Success', 'Payment accepted successfully!');
              // Refresh the list
              await fetchPendingPayments();
            } catch (error: any) {
              console.error('Failed to accept payment:', error);
              Alert.alert('Error', error.message || 'Failed to accept payment');
            } finally {
              setAcceptingPaymentId(null);
            }
          },
        },
      ]
    );
  };

  // Fetch on mount
  useEffect(() => {
    fetchPendingPayments();
  }, [fetchPendingPayments]);

  // Filter only AWAITING_CONFIRMATION payments
  const awaitingPayments = pendingPayments.filter(
    (p) => p.paymentStatus === 'AWAITING_CONFIRMATION'
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Header */}
        <ScreenHeader title="Payment Management" showBackButton />

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header Info Card */}
          <View className="px-4 py-4">
            <Card className="p-4 bg-brand-deepNavy">
              {/* Date */}
              <View className="flex-row items-center mb-3">
                <Calendar size={20} color="#FFFFFF" weight="bold" />
                <Typography
                  variant="caption-1"
                  className="text-white ml-2"
                >
                  {todayFormatted}
                </Typography>
              </View>

              {/* Total Income */}
              <View className="flex-row items-center justify-between">
                <View>
                  <Typography
                    variant="caption-1"
                    className="text-white opacity-80 mb-1"
                  >
                    Total Income This Month
                  </Typography>
                  <Typography
                    variant="title-1"
                    weight="bold"
                    className="text-white"
                  >
                    Rs. {totalMonthlyIncome.toFixed(2)}
                  </Typography>
                </View>
                <View className="bg-white/20 rounded-full p-3">
                  <Money size={28} color="#FFFFFF" weight="bold" />
                </View>
              </View>
            </Card>
          </View>

          {/* Pending Confirmations Section */}
          <View className="px-4 pb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Typography variant="title-3" weight="semibold" className="text-black">
                Awaiting Confirmation
              </Typography>
              <View className="bg-brand-brightOrange rounded-full px-3 py-1">
                <Typography variant="caption-2" weight="semibold" className="text-white">
                  {awaitingPayments.length}
                </Typography>
              </View>
            </View>

            {loading && !refreshing ? (
              <View className="py-10 items-center">
                <ActivityIndicator size="large" color="#FF6B35" />
                <Typography variant="caption-1" className="text-gray-500 mt-2">
                  Loading payments...
                </Typography>
              </View>
            ) : awaitingPayments.length === 0 ? (
              <Card className="p-6 items-center">
                <Check size={48} color="#10B981" weight="bold" />
                <Typography
                  variant="subhead"
                  className="text-gray-500 mt-3 text-center"
                >
                  No pending confirmations
                </Typography>
                <Typography
                  variant="caption-1"
                  className="text-gray-400 mt-1 text-center"
                >
                  All payments have been processed
                </Typography>
              </Card>
            ) : (
              awaitingPayments.map((payment) => (
                <PaymentConfirmationCard
                  key={payment.id}
                  payment={payment}
                  onAccept={() => handleAcceptPayment(payment)}
                  isAccepting={acceptingPaymentId === payment.id}
                />
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// Payment Confirmation Card Component
interface PaymentConfirmationCardProps {
  payment: PendingConfirmation;
  onAccept: () => void;
  isAccepting: boolean;
}

function PaymentConfirmationCard({
  payment,
  onAccept,
  isAccepting,
}: PaymentConfirmationCardProps) {
  const childName = `${payment.Child.childFirstName} ${payment.Child.childLastName}`;
  const parentName = `${payment.Customer.firstName} ${payment.Customer.lastName}`;
  const monthName = MONTH_NAMES[payment.paymentMonth - 1];

  return (
    <Card className="mb-3 p-4">
      {/* Header - Child & Parent Info */}
      <View className="flex-row items-start mb-3">
        <View className="bg-brand-lightBlue rounded-full p-2 mr-3">
          <User size={24} color="#1E3A8A" weight="bold" />
        </View>
        <View className="flex-1">
          <Typography variant="subhead" weight="semibold" className="text-black">
            {childName}
          </Typography>
          <Typography variant="caption-1" className="text-gray-500">
            Parent: {parentName}
          </Typography>
        </View>
      </View>

      {/* Divider */}
      <View className="h-px bg-gray-200 my-3" />

      {/* Payment Details */}
      <View className="space-y-2">
        {/* Month & Year */}
        <View className="flex-row justify-between items-center">
          <Typography variant="caption-1" className="text-gray-600">
            Payment Period
          </Typography>
          <Typography variant="caption-1" weight="medium" className="text-black">
            {monthName} {payment.paymentYear}
          </Typography>
        </View>

        {/* Amount */}
        <View className="flex-row justify-between items-center">
          <Typography variant="caption-1" className="text-gray-600">
            Amount
          </Typography>
          <Typography variant="subhead" weight="semibold" className="text-brand-deepNavy">
            Rs. {payment.finalPrice.toFixed(2)}
          </Typography>
        </View>

        {/* Payment Method */}
        <View className="flex-row justify-between items-center">
          <Typography variant="caption-1" className="text-gray-600">
            Payment Method
          </Typography>
          <View className="bg-brand-lightGray px-3 py-1 rounded-full">
            <Typography variant="caption-2" weight="medium" className="text-gray-700">
              {payment.paymentMethod === 'PHYSICAL' ? 'Cash' : 'Card'}
            </Typography>
          </View>
        </View>
      </View>

      {/* Accept Button */}
      <TouchableOpacity
        onPress={onAccept}
        disabled={isAccepting}
        className={`mt-4 rounded-lg py-3 items-center ${
          isAccepting ? 'bg-gray-300' : 'bg-brand-brightOrange'
        }`}
        activeOpacity={0.7}
      >
        {isAccepting ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <View className="flex-row items-center">
            <Check size={20} color="#FFFFFF" weight="bold" />
            <Typography
              variant="subhead"
              weight="semibold"
              className="text-white ml-2"
            >
              Accept Payment
            </Typography>
          </View>
        )}
      </TouchableOpacity>
    </Card>
  );
}
