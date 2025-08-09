import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { CustomInput } from '@/components/ui/CustomInput';
import CustomButton from '@/components/ui/CustomButton';

const AddCardScreen: React.FC = () => {
  const [cardNumber, setCardNumber] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [nickname, setNickname] = useState('');

  const [cardNumberError, setCardNumberError] = useState('');
  const [monthError, setMonthError] = useState('');
  const [yearError, setYearError] = useState('');
  const [cvvError, setCvvError] = useState('');

  // Format card number as XXXX - XXXX - XXXX - XXXX (16 digits max)
  const formatCardNumber = (input: string) => {
    const digits = input.replace(/\D/g, '').slice(0, 16);
    // Group into 4s, join with ' - '
    let formatted = '';
    for (let i = 0; i < digits.length; i += 4) {
      if (i > 0) formatted += ' - ';
      formatted += digits.slice(i, i + 4);
    }
    return formatted;
  };

  const handleCardNumberChange = (input: string) => {
    // Only allow up to 16 digits
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
    // Card number: 16 digits
    const digits = cardNumber.replace(/\D/g, '');
    if (digits.length !== 16) {
      setCardNumberError('Card number must be 16 digits');
      valid = false;
    }
    // Month: 2 digits, 01-12
    if (!/^(0[1-9]|1[0-2])$/.test(month)) {
      setMonthError('Month must be between 01 and 12');
      valid = false;
    }
    // Year: 2 digits, not in the past
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
    // CVV: 3 digits
    if (!/^[0-9]{3}$/.test(cvv)) {
      setCvvError('CVV must be 3 digits');
      valid = false;
    }
    return valid;
  };

  const handleAddCard = () => {
    if (!validateInputs()) return;
    // Handle add card logic
    const digits = cardNumber.replace(/\D/g, '');
    console.log('Adding card:', { cardNumber: digits, month, year, cvv, nickname });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ScreenHeader title="Add Card" showBackButton />

        {/* Card Details Form */}
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
              maxLength={25} // 16 digits + 3 separators (' - ')
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

          {/* Add Card Button */}
          <View className="flex items-center">
            <CustomButton
              title="Add Card"
              onPress={handleAddCard}
              className="self-center w-full max-w-xs"
              bgVariant="primary"
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddCardScreen;