import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Calendar, CreditCard, ArrowLeft, PencilSimple, Bank } from 'phosphor-react-native';

const paymentHistoryData = [
  {
    id: '1',
    date: '2 May, 2025',
    refId: 'YTDP12289',
    method: 'Bank',
    amount: '70,000',
    status: 'Successful',
  },
  {
    id: '2',
    date: '12 April, 2025',
    refId: 'YTDP12287',
    method: 'Bank',
    amount: '80,000',
    status: 'Successful',
  },
  {
    id: '3',
    date: '16 March, 2025',
    refId: 'YTDP10549',
    method: 'Bank',
    amount: '95,000',
    status: 'Successful',
  },
];

const PaymentHistoryItem = ({ item }: { item: (typeof paymentHistoryData)[0] }) => (
  <View style={styles.card}>
    <View style={styles.paymentItemRow}>
      <View style={styles.paymentItemLeft}>
        <Calendar size={16} color="#555" />
        <Text style={styles.paymentDate}>{item.date}</Text>
      </View>
      <View style={styles.statusTagSuccessful}>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </View>
    <View style={styles.paymentDetailsRow}>
      <View style={styles.paymentDetailsLeft}>
        <Text style={styles.detailLabel}>Reference ID</Text>
        <Text style={styles.detailValue}>{item.refId}</Text>
        <Text style={styles.detailLabel}>Payment method</Text>
        <Text style={styles.detailValue}>{item.method}</Text>
      </View>
      <View style={styles.paymentDetailsRight}>
        <CreditCard size={20} color="#143373" />
        <Text style={styles.amount}>{item.amount} LKR</Text>
      </View>
    </View>
  </View>
);

export default function EarningsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header and Earnings Section */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#143373" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Earnings</Text>
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

        {paymentHistoryData.map((item) => (
          <PaymentHistoryItem key={item.id} item={item} />
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
