import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Typography } from '@/components/Typography';
import { ArrowLeft, X } from 'phosphor-react-native';
import { useRouter } from 'expo-router';

export default function EditPhoneNumberScreen() {
    const router = useRouter();
    const [phone, setPhone] = useState('+94 71 234 5678');

    return (
        <View className="flex-1 bg-white px-6 pt-12">
            {/* Header */}
            <TouchableOpacity onPress={() => router.back()} className="mb-6">
                <ArrowLeft size={28} color="#143373" weight="regular" />
            </TouchableOpacity>

            <Typography variant="large-title" weight="bold" className="text-brand-deepNavy mb-2">
                Phone Number
            </Typography>
            <Typography variant="body" className="text-brand-neutralGray mb-6">
                Please enter your phone number.
            </Typography>

            {/* Input */}
            <Typography variant="body" weight="medium" className="text-brand-deepNavy mb-2">
                Phone number
            </Typography>
            <View className="flex-row items-center bg-brand-lightGray rounded-xl px-4 mb-6">
                <TextInput
                    className="flex-1 py-4 text-body font-figtree-regular text-brand-deepNavy"
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Phone number"
                    placeholderTextColor="#6b7280"
                    keyboardType="phone-pad"
                />
                {phone.length > 0 && (
                    <TouchableOpacity onPress={() => setPhone('')}>
                        <X size={20} color="#6b7280" weight="regular" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Update Button */}
            <TouchableOpacity
                className="bg-brand-deepNavy rounded-xl py-4 items-center mt-8"
                onPress={() => {/* handle update */ }}
            >
                <Typography variant="body" weight="semibold" className="text-white">
                    Update
                </Typography>
            </TouchableOpacity>
        </View>
    );
} 