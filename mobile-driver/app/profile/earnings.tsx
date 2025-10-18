import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Calendar, CreditCard, ArrowLeft, PencilSimple, Bank } from 'phosphor-react-native';
import { getDriverPayments, ChildPayment } from '../../lib/api/transactions.api';
import { useAuthStore } from '../../lib/stores/auth.store';

// Format date from ISO string to "2 May, 2025" format
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
};

// Get status display config
const getStatusConfig = (status: string): { backgroundColor: string; textColor: string; displayText: string } => {
  switch (status) {
    case 'PAID':
      return { backgroundColor: '#D4EDDA', textColor: '#155724', displayText: 'Paid' };
    case 'PENDING':
      return { backgroundColor: '#FFF3CD', textColor: '#856404', displayText: 'Pending' };
    case 'OVERDUE':
      return { backgroundColor: '#F8D7DA', textColor: '#721C24', displayText: 'Overdue' };
    case 'GRACE_PERIOD':
      return { backgroundColor: '#FFE5CC', textColor: '#CC5500', displayText: 'Grace Period' };
    case 'NOT_DUE':
      return { backgroundColor: '#E2E3E5', textColor: '#383D41', displayText: 'Not Due' };
    case 'CANCELLED':
      return { backgroundColor: '#D6D8DB', textColor: '#1B1E21', displayText: 'Cancelled' };
    default:
      return { backgroundColor: '#E2E3E5', textColor: '#383D41', displayText: status };
  }
};

const PaymentHistoryItem = ({ payment }: { payment: ChildPayment }) => {
  const statusConfig = getStatusConfig(payment.paymentStatus);
  const displayDate = payment.paymentDate 
    ? formatDate(payment.paymentDate) 
    : formatDate(payment.createdAt);
  const displayMethod = payment.paymentMethod || '-';
  const displayRef = payment.transactionRef || '-';
  const isPaid = payment.paymentStatus === 'PAID';
  const amountColor = isPaid ? '#143373' : '#EF4444'; // Warning color for unpaid

  return (
    <View style={styles.card}>
      <View style={styles.paymentItemRow}>
        <View style={styles.paymentItemLeft}>
          <Calendar size={16} color="#555" />
          <Text style={styles.paymentDate}>{displayDate}</Text>
        </View>
        <View style={[styles.statusTagSuccessful, { backgroundColor: statusConfig.backgroundColor }]}>
          <Text style={[styles.statusText, { color: statusConfig.textColor }]}>
            {statusConfig.displayText}
          </Text>
        </View>
      </View>
      <View style={styles.paymentDetailsRow}>
        <View style={styles.paymentDetailsLeft}>
          <Text style={styles.detailLabel}>Reference ID</Text>
          <Text style={styles.detailValue}>{displayRef}</Text>
          <Text style={styles.detailLabel}>Payment method</Text>
          <Text style={styles.detailValue}>{displayMethod}</Text>
        </View>
        <View style={styles.paymentDetailsRight}>
          <CreditCard size={20} color={amountColor} />
          <Text style={[styles.amount, { color: amountColor }]}>
            {payment.amountPaid.toFixed(2)} LKR
          </Text>
        </View>
      </View>
    </View>
  );
};

export default function EarningsScreen() {
  const user = useAuthStore((state) => state.user);
  const driverId = user?.id;
  
  const [payments, setPayments] = useState<ChildPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!driverId) {
        setError('Driver ID not found. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getDriverPayments(driverId);
        setPayments(response.items);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch payments:', err);
        setError('Failed to load payment history');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [driverId]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header and Earnings Section */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#143373" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transactions</Text>
          <View style={{ width: 20 }} /> {/* Spacer for alignment */}
        </View>

        <View style={styles.earningsSection}>
          <Text style={styles.earningsLabel}>Earnings</Text>
          <Text style={styles.earningsDate}>2025-06-21</Text>
          <Text style={styles.earningsAmount}>80,000 LKR</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollViewContent}>
        {/* Linked Account Section */}
        <View style={[styles.card, { marginTop: 40 }]}>
          <View style={styles.linkedAccountHeader}>
            <Text style={styles.cardTitle}>Linked Account</Text>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editText}>Edit</Text>
              <PencilSimple size={16} color="#555"  />
            </TouchableOpacity>
          </View>
          <View style={styles.bankDetails}>
            <Bank size={24} color="#555" style={styles.bankIcon} />
            <View>
              <Text style={styles.bankName}>Commercial Bank</Text>
              <Text style={styles.accountNumber}>**** **** **** 1326</Text>
            </View>
            <View style={styles.cardLogos}>
              <Image
                source={require('../../assets/images/visa.png')}
                style={styles.cardLogo}
              />
              <Image
                source={require('../../assets/images/mastercard.png')}
                style={styles.cardLogo}
              />
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Payment History</Text>

        {loading && (
          <View style={styles.card}>
            <ActivityIndicator size="large" color="#143373" />
            <Text style={{ textAlign: 'center', marginTop: 10, color: '#777' }}>
              Loading payments...
            </Text>
          </View>
        )}

        {error && (
          <View style={styles.card}>
            <Text style={{ textAlign: 'center', color: '#EF4444' }}>{error}</Text>
          </View>
        )}

        {!loading && !error && payments.length === 0 && (
          <View style={styles.card}>
            <Text style={{ textAlign: 'center', color: '#777' }}>
              No payment history available
            </Text>
          </View>
        )}

        {!loading && !error && payments.map((payment) => (
          <PaymentHistoryItem key={payment.id} payment={payment} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerContainer: {
    backgroundColor: '#fdc334',
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: 24,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#143373',
  },
  earningsSection: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  earningsLabel: {
    fontSize: 16,
    color: '#143373',
    opacity: 0.8,
  },
  earningsDate: {
    fontSize: 14,
    color: '#143373',
    opacity: 0.7,
    marginBottom: 5,
  },
  earningsAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#143373',
  },
  scrollViewContent: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 160, // Pushes content below the absolute positioned header
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  linkedAccountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10, // Light background for edit button
    backgroundColor: '#F0F0F0',
  },
  editText: {
    fontSize: 14,
    color: '#555',
    marginRight: 5,
  },
  editIcon: {
    color: '#555',
  },
  bankDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankIcon: {
    marginRight: 15,
  },
  bankName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  accountNumber: {
    fontSize: 14,
    color: '#777',
    marginTop: 2,
  },
  cardLogos: {
    flexDirection: 'row', // Push logos to the right
    marginLeft: 'auto',
  },
  cardLogo: {
    width: 40,
    height: 25,
    resizeMode: 'contain',
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  paymentItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  paymentItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentDate: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  statusTagSuccessful: {
    backgroundColor: '#E0FFE0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    fontSize: 12,
    color: '#28A745',
    fontWeight: 'bold',
  },
  paymentDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 5,
  },
  paymentDetailsLeft: {},
  detailLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  paymentDetailsRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#143373',
    marginLeft: 5,
  },
});
