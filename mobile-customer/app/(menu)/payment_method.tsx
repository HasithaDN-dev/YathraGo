import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Plus, ArrowRight } from 'phosphor-react-native';
import { router } from 'expo-router';

const paymentMethods = [
  { id: 'cash', label: 'cash' },
  { id: 'card', label: 'card' },
];

const cards = [
  { id: '1', type: 'visa', last4: '4506' },
  { id: '2', type: 'mastercard', last4: '8813' },
];

export default function PaymentMethodScreen() {
  const [selectedMethod, setSelectedMethod] = useState('cash');

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ScreenHeader title="Payment Methods" showBackButton />

        {/* Payment Method Selection */}
        <Card className="mx-4 mb-6 bg-gray-100 p-6 rounded-2xl shadow-md">
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              className="flex-row items-center mb-4"
              activeOpacity={0.8}
              onPress={() => setSelectedMethod(method.id)}
            >
              <View
                className={`w-6 h-6 rounded-full border-2 ${selectedMethod === method.id ? 'border-brand-deepNavy' : 'border-gray-400'} items-center justify-center mr-4 bg-white`}
              >
                {selectedMethod === method.id && (
                  <View className="w-3 h-3 rounded-full bg-brand-deepNavy" />
                )}
              </View>
              <Typography variant="subhead" className="text-black">
                {method.label}
              </Typography>
            </TouchableOpacity>
          ))}
        </Card>

        {/* Cards List */}
        <Card className="mx-4 mb-8 bg-gray-100 p-6 rounded-2xl shadow-md">
          <Typography variant="subhead" className="text-black mb-4">
            Cards
          </Typography>
          {cards.map((card) => (
            <TouchableOpacity
              key={card.id}
              className="flex-row items-center justify-between bg-white rounded-full px-4 py-3 mb-4 shadow-sm"
              activeOpacity={0.8}
              onPress={() => router.push({ pathname: '/(menu)/(paymentMethod)/view-card', params: { id: card.id } })}
            >
              <View className="flex-row items-center">
                {/* Card type icon */}
                {card.type === 'visa' ? (
                  <Image
                    source={require('../../assets/images/Visa.png')}
                    style={{ width: 32, height: 20, resizeMode: 'contain', marginRight: 10 }}
                  />
                ) : (
                  <Image
                    source={require('../../assets/images/MasterCard.png')}
                    style={{ width: 32, height: 20, resizeMode: 'contain', marginRight: 10 }}
                  />
                )}
                <Typography variant="subhead" className="text-black">
                  ...{card.last4}
                </Typography>
              </View>
              <ArrowRight size={20} color="#222" weight="regular" />
            </TouchableOpacity>
          ))}
          {/* Add Card */}
          <TouchableOpacity
            className="flex-row items-center justify-between bg-white rounded-full px-4 py-3 shadow-sm"
            activeOpacity={0.8}
            onPress={() => router.push('/(menu)/(paymentMethod)/add-card')}
          >
            <Typography variant="subhead" className="text-black">
              Add card
            </Typography>
            <View className="bg-black rounded-full w-8 h-8 items-center justify-center">
              <Plus size={20} color="#fff" weight="bold" />
            </View>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}