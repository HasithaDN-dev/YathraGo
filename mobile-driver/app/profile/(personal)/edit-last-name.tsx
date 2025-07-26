import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Typography } from '@/components/Typography';
import { ArrowLeft, X } from 'phosphor-react-native';
import { useRouter } from 'expo-router';

export default function EditLastNameScreen() {
    const router = useRouter();
    const [lastName, setLastName] = useState('Perera');

    return (
        <View className="flex-1 bg-white px-6 pt-12">
            {/* Header */}
            <TouchableOpacity onPress={() => router.back()} className="mb-6">
                <ArrowLeft size={28} color="#143373" weight="regular" />
            </TouchableOpacity>

            <Typography variant="large-title" weight="bold" className="text-brand-deepNavy mb-2">
                Last Name
            </Typography>
            <Typography variant="body" className="text-brand-neutralGray mb-6">
                This is the last name you would like other people to use when referring to you.
            </Typography>

            {/* Input */}
            <Typography variant="body" weight="medium" className="text-brand-deepNavy mb-2">
                Last name
            </Typography>
            <View className="flex-row items-center bg-brand-lightGray rounded-xl px-4 mb-6">
                <TextInput
                    className="flex-1 py-4 text-body font-figtree-regular text-brand-deepNavy"
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Last name"
                    placeholderTextColor="#6b7280"
                />
                {lastName.length > 0 && (
                    <TouchableOpacity onPress={() => setLastName('')}>
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