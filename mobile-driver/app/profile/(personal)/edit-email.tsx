import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Typography } from '@/components/Typography';
import { ArrowLeft, X } from 'phosphor-react-native';
import { useRouter } from 'expo-router';

export default function EditEmailScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('nihal.perera@email.com');

    return (
        <View className="flex-1 bg-white px-6 pt-12">
            {/* Header */}
            <TouchableOpacity onPress={() => router.back()} className="mb-6">
                <ArrowLeft size={28} color="#143373" weight="regular" />
            </TouchableOpacity>

            <Typography variant="large-title" weight="bold" className="text-brand-deepNavy mb-2">
                Email
            </Typography>
            <Typography variant="body" className="text-brand-neutralGray mb-6">
                Please enter your email address.
            </Typography>

            {/* Input */}
            <Typography variant="body" weight="medium" className="text-brand-deepNavy mb-2">
                Email
            </Typography>
            <View className="flex-row items-center bg-brand-lightGray rounded-xl px-4 mb-6">
                <TextInput
                    className="flex-1 py-4 text-body font-figtree-regular text-brand-deepNavy"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email"
                    placeholderTextColor="#6b7280"
                    keyboardType="email-address"
                />
                {email.length > 0 && (
                    <TouchableOpacity onPress={() => setEmail('')}>
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