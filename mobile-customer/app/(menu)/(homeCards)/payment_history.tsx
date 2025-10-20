import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { MagnifyingGlass, Download } from 'phosphor-react-native';
import { getPaymentHistoryApi, PaymentHistoryItem } from '@/lib/api/payments.api';
import { useProfileStore } from '@/lib/stores/profile.store';

// Month names for display
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// Format status for display
const formatStatus = (status: string): string => {
  switch (status.toUpperCase()) {
    case 'GRACE_PERIOD':
      return 'Grace Period';
    case 'AWAITING_CONFIRMATION':
      return 'Awaiting';
    case 'NOT_DUE':
      return 'Not Due';
    default:
      return status.charAt(0) + status.slice(1).toLowerCase();
  }
};

// Get status color
const getStatusColor = (status: string): string => {
  switch (status.toUpperCase()) {
    case 'PAID':
      return 'text-success';
    case 'OVERDUE':
      return 'text-danger';
    case 'GRACE_PERIOD':
      return 'text-warning';
    case 'CANCELLED':
      return 'text-gray-500';
    case 'AWAITING_CONFIRMATION':
      return 'text-brand-brightOrange';
    default:
      return 'text-brand-deepNavy';
  }
};

export default function PaymentHistoryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  
  const { activeProfile } = useProfileStore();
  
  // Extract child ID from profile
  const childId = activeProfile?.id ? 
    parseInt(activeProfile.id.replace('child-', '')) : null;

  // Fetch payment history function
  const fetchPaymentHistory = useCallback(async () => {
    if (!childId) {
      Alert.alert('Error', 'Please select a child profile');
      return;
    }

    setLoading(true);
    try {
      const data = await getPaymentHistoryApi(childId);
      setPayments(data);
    } catch (error: any) {
      console.error('Failed to fetch payment history:', error);
      Alert.alert('Error', error.message || 'Failed to load payment history');
    } finally {
      setLoading(false);
    }
  }, [childId]);

  // Fetch payment history on mount
  useEffect(() => {
    if (childId) {
      fetchPaymentHistory();
    }
  }, [childId, fetchPaymentHistory]);

  // Filter by search query (month-year or status)
  const filteredPayments = payments.filter((payment) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const monthYear = `${MONTH_NAMES[payment.month - 1]} ${payment.year}`.toLowerCase();
    const status = formatStatus(payment.status).toLowerCase();
    
    return monthYear.includes(query) || status.includes(query);
  });

  const handleDownload = (paymentId: number) => {
    console.log('Downloading payment receipt:', paymentId);
    Alert.alert('Download', 'Receipt download feature coming soon!');
  };

  const TransactionCard = ({ payment }: { payment: PaymentHistoryItem }) => {
    const paymentDate = new Date(payment.paymentDate);
    const formattedDate = `${paymentDate.getFullYear()} - ${String(paymentDate.getMonth() + 1).padStart(2, '0')} - ${String(paymentDate.getDate()).padStart(2, '0')}`;
    const formattedTime = paymentDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    return (
      <Card className="mb-3 p-4">
        {/* Month-Year and Status */}
        <View className="flex-row justify-between items-center mb-2">
          <Typography variant="subhead" weight="semibold" className="text-black">
            {MONTH_NAMES[payment.month - 1]} {payment.year}
          </Typography>
          <Typography variant="caption-1" weight="medium" className={getStatusColor(payment.status)}>
            {formatStatus(payment.status)}
          </Typography>
        </View>

        {/* Date and Time */}
        <View className="flex-row justify-between items-center mb-2">
          <Typography variant="caption-1" className="text-brand-neutralGray">
            {formattedDate}
          </Typography>
          <Typography variant="caption-1" className="text-brand-neutralGray">
            {formattedTime}
          </Typography>
        </View>

        {/* Amount */}
        <Typography variant="title-3" weight="semibold" className="text-black mb-2">
          Rs. {payment.amount.toFixed(2)}
        </Typography>

        {/* Payment Method, Driver Name, and Download */}
        <View className="flex-row justify-between items-center">
          <View>
            {payment.paymentMethod && (
              <Typography variant="caption-1" className="text-brand-neutralGray mb-1">
                {payment.paymentMethod === 'PHYSICAL' ? 'Cash' : 'Card'}
              </Typography>
            )}
            {payment.driverName && (
              <Typography variant="caption-2" className="text-gray-500">
                Driver: {payment.driverName}
              </Typography>
            )}
          </View>
          <TouchableOpacity
            onPress={() => handleDownload(payment.id)}
            activeOpacity={0.7}
          >
            <Download size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Header (fixed) */}
        <ScreenHeader title="Payment History" showBackButton />

        {/* Search Bar (fixed) */}
        <View className="px-4 mt-4 mb-2">
          <View className="flex-row items-center bg-brand-lightGray rounded-full px-4 py-1 shadow-sm">
            <MagnifyingGlass size={18} color="#6b7280" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by month or status"
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-2 text-black"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Transaction List (scrollable) */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-4 pb-6">
            {loading ? (
              <View className="flex-1 items-center justify-center py-10">
                <ActivityIndicator size="large" color="#FF6B35" />
                <Typography variant="caption-1" className="text-brand-neutralGray mt-2">
                  Loading payment history...
                </Typography>
              </View>
            ) : filteredPayments.length === 0 ? (
              <View className="flex-1 items-center justify-center py-10">
                <Typography variant="subhead" className="text-brand-neutralGray">
                  {searchQuery ? 'No payments found' : 'No payment history yet'}
                </Typography>
              </View>
            ) : (
              filteredPayments.map((payment) => (
                <TransactionCard key={payment.id} payment={payment} />
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
