import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Typography } from '@/components/Typography';
import { ArrowLeft } from 'phosphor-react-native';
import { useRouter } from 'expo-router';

const genderOptions = ['Male', 'Female', 'Other'];

export default function EditGenderScreen() {
    const router = useRouter();
    const [gender, setGender] = useState('Male');

    return (
        <View className="flex-1 bg-white px-6 pt-12">
            {/* Header */}
            <TouchableOpacity onPress={() => router.back()} className="mb-6">
                <ArrowLeft size={28} color="#143373" weight="regular" />
            </TouchableOpacity>

            <Typography variant="large-title" weight="bold" className="text-brand-deepNavy mb-2">
                Gender
            </Typography>
            <Typography variant="body" className="text-brand-neutralGray mb-6">
                Please select your gender.
            </Typography>

            {/* Gender Picker */}
            <View className="mb-6">
                {genderOptions.map(option => (
                    <TouchableOpacity
                        key={option}
                        className={`flex-row items-center px-4 py-4 mb-2 rounded-xl ${gender === option ? 'bg-brand-lightGray border-2 border-brand-brightOrange' : 'bg-brand-lightGray'}`}
                        onPress={() => setGender(option)}
                    >
                        <Typography variant="body" weight="medium" className={gender === option ? 'text-brand-brightOrange' : 'text-brand-deepNavy'}>
                            {option}
                        </Typography>
                    </TouchableOpacity>
                ))}
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