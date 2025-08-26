import React, { useMemo, useState } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { MagnifyingGlass, Download } from 'phosphor-react-native';

interface Transaction {
  id: string;
  date: string;
  time: string;
  amount: string;
  paymentMethod: 'Card' | 'Cash';
}

export default function PaymentHistoryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const transactions: Transaction[] = useMemo(() => {
    // Helpers scoped to memo
    const pad2 = (n: number) => n.toString().padStart(2, '0');
    const formatDateStr = (d: Date) => `${d.getFullYear()} - ${pad2(d.getMonth() + 1)} - ${pad2(d.getDate())}`;
    const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const randomTime = (): string => {
      const hour24 = randomInt(0, 23);
      const minutes = pad2(randomInt(0, 59));
      const suffix = hour24 < 12 ? 'a.m' : 'p.m';
      let hour12 = hour24 % 12;
      if (hour12 === 0) hour12 = 12;
      return `${pad2(hour12)}:${minutes} ${suffix}`;
    };
    const randomAmount = (): string => {
      const amount = randomInt(5000, 15000);
      return `Rs. ${amount.toFixed(2)}`;
    };
    const randomMethod = (): 'Card' | 'Cash' => (Math.random() < 0.5 ? 'Card' : 'Cash');

    const start = new Date(2025, 0, 1).getTime(); // Jan 1, 2025
    const end = new Date(2025, 11, 31).getTime(); // Dec 31, 2025
    return Array.from({ length: 20 }, (_, i) => {
      const ts = start + Math.random() * (end - start);
      const date = new Date(ts);
      return {
        id: String(i + 1),
        date: formatDateStr(date),
        time: randomTime(),
        amount: randomAmount(),
        paymentMethod: randomMethod(),
      } as Transaction;
    });
  }, []);

  // Optional: filter by date input
  const filtered = useMemo(
    () => transactions.filter((t) => t.date.includes(searchQuery.trim())),
    [transactions, searchQuery]
  );

  // Format input as YYYY - MM - DD while typing
  const formatDateInput = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '').slice(0, 8); // limit to YYYYMMDD
    const y = digits.slice(0, 4);
    const m = digits.slice(4, 6);
    const d = digits.slice(6, 8);
    let out = y;
    if (m.length) out += ` - ${m}`;
    if (d.length) out += ` - ${d}`;
    return out;
  };

  const handleDownload = (transactionId: string) => {
    console.log('Downloading transaction:', transactionId);
    // Handle download logic here
  };

  const TransactionCard = ({ transaction }: { transaction: Transaction }) => (
    <Card className="mb-3 p-4">
      {/* Date and Time Row */}
      <View className="flex-row justify-between items-center mb-2">
        <Typography variant="caption-1" className="text-brand-neutralGray">
          {transaction.date}
        </Typography>
        <Typography variant="caption-1" className="text-brand-neutralGray">
          {transaction.time}
        </Typography>
      </View>

      {/* Amount */}
      <Typography variant="subhead" weight="semibold" className="text-black mb-1">
        {transaction.amount}
      </Typography>

      {/* Payment Method + Download (last row) */}
      <View className="flex-row justify-between items-center">
        <Typography variant="caption-1" className="text-brand-neutralGray">
          {transaction.paymentMethod}
        </Typography>
        <TouchableOpacity
          onPress={() => handleDownload(transaction.id)}
          activeOpacity={0.7}
        >
          <Download size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>
    </Card>
  );

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
              onChangeText={(t) => setSearchQuery(formatDateInput(t))}
              placeholder="YYYY - MM - DD"
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-2 text-black"
              autoCapitalize="none"
              keyboardType="numeric"
              maxLength={14}
            />
          </View>
        </View>

        {/* Transaction List (scrollable) */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-4 pb-6">
            {(filtered.length ? filtered : transactions).map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
