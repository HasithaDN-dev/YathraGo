import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { CustomInput } from '@/components/ui/CustomInput';
import CustomButton from '@/components/ui/CustomButton';
import { useLocalSearchParams, useRouter } from 'expo-router';

// Dummy data for saved cards (replace with real data from API or storage)
const cards = [
  {
    id: '1',
    cardNumber: '1234 - 5678 - 9012 - 3456',
    month: '08',
    year: '25',
    nickname: 'Personal',
    cvv: '123',
  },
  {
    id: '2',
    cardNumber: '9876 - 5432 - 1098 - 7654',
    month: '12',
    year: '27',
    nickname: 'Work',
    cvv: '456',
  },
];

const formatCardNumber = (input: string) => {
  const digits = input.replace(/\D/g, '').slice(0, 16);
  let formatted = '';
  for (let i = 0; i < digits.length; i += 4) {
    if (i > 0) formatted += ' - ';
    formatted += digits.slice(i, i + 4);
  }
  return formatted;
};

const ViewCardScreen: React.FC = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const card = cards.find(c => c.id === id);

  const [cardNumber, setCardNumber] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [nickname, setNickname] = useState('');

  const [cardNumberError, setCardNumberError] = useState('');
  const [monthError, setMonthError] = useState('');
  const [yearError, setYearError] = useState('');
  const [cvvError, setCvvError] = useState('');

  useEffect(() => {
    if (card) {
      setCardNumber(card.cardNumber);
      setMonth(card.month);
      setYear(card.year);
      setCvv(card.cvv || '');
      setNickname(card.nickname);
    }
  }, [card]);

  const handleCardNumberChange = (input: string) => {
    const digits = input.replace(/\D/g, '').slice(0, 16);
    const formatted = formatCardNumber(digits);
    setCardNumber(formatted);
    setCardNumberError('');
  };
  const handleMonthChange = (input: string) => {
    const digits = input.replace(/\D/g, '').slice(0, 2);
    setMonth(digits);
    setMonthError('');
  };
  const handleYearChange = (input: string) => {
    const digits = input.replace(/\D/g, '').slice(0, 2);
    setYear(digits);
    setYearError('');
  };
  const handleCvvChange = (input: string) => {
    const digits = input.replace(/\D/g, '').slice(0, 3);
    setCvv(digits);
    setCvvError('');
  };

  const validateInputs = () => {
    let valid = true;
    const digits = cardNumber.replace(/\D/g, '');
    if (digits.length !== 16) {
      setCardNumberError('Card number must be 16 digits');
      valid = false;
    }
    if (!/^(0[1-9]|1[0-2])$/.test(month)) {
      setMonthError('Month must be between 01 and 12');
      valid = false;
    }
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const yearNum = parseInt(year, 10);
    if (!/^[0-9]{2}$/.test(year)) {
      setYearError('Year must be 2 digits');
      valid = false;
    } else if (yearNum < currentYear) {
      setYearError('Year cannot be in the past');
      valid = false;
    }
    if (!/^[0-9]{3}$/.test(cvv)) {
      setCvvError('CVV must be 3 digits');
      valid = false;
    }
    return valid;
  };

  const handleUpdate = () => {
    if (!validateInputs()) return;
    // Implement update logic
    alert('Card updated!');
  };

  const handleDelete = () => {
    // Implement delete logic
    alert('Card deleted!');
    router.back();
  };

  if (!card) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500">Card not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Card Details" showBackButton />
        <Card className="mx-4 mb-8 bg-gray-100 p-6 rounded-2xl shadow-md">
          {/* Card Number */}
          <View className="mb-6">
            <CustomInput
              label="Card Number"
              required
              value={cardNumber}
              onChangeText={handleCardNumberChange}
              placeholder="Enter card number"
              className="bg-white rounded-xl shadow-sm"
              keyboardType="numeric"
              maxLength={25}
              error={cardNumberError}
            />
          </View>

          {/* Expiration and CVV Row */}
          <View className="flex-row mb-6">
            {/* Month */}
            <View className="flex-1 mr-6">
              <CustomInput
                label="Month"
                required
                value={month}
                onChangeText={handleMonthChange}
                placeholder="MM"
                className="bg-white rounded-xl shadow-sm"
                keyboardType="numeric"
                maxLength={2}
                error={monthError}
              />
            </View>

            {/* Year */}
            <View className="flex-1 mr-6">
              <CustomInput
                label="Year"
                required
                value={year}
                onChangeText={handleYearChange}
                placeholder="YY"
                className="bg-white rounded-xl shadow-sm"
                keyboardType="numeric"
                maxLength={2}
                error={yearError}
              />
            </View>

            {/* CVV */}
            <View className="flex-1">
              <CustomInput
                label="CVV"
                required
                value={cvv}
                onChangeText={handleCvvChange}
                placeholder="CVV"
                className="bg-white rounded-xl shadow-sm"
                keyboardType="numeric"
                maxLength={3}
                secureTextEntry
                error={cvvError}
              />
            </View>
          </View>

          {/* Nick Name */}
          <View className="mb-8">
            <CustomInput
              label="Nick Name"
              value={nickname}
              onChangeText={setNickname}
              placeholder="Enter nickname"
              className="bg-white rounded-xl shadow-sm"
            />
          </View>

          {/* Update & Delete Buttons */}
          <View className="flex-row justify-between">
            <CustomButton
              title="Update Card"
              onPress={handleUpdate}
              className="w-[48%]"
              bgVariant="primary"
            />
            <CustomButton
              title="Delete Card"
              onPress={handleDelete}
              className="w-[48%]"
              bgVariant="danger"
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ViewCardScreen;