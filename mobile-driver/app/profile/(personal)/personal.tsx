import React, { useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Typography } from '@/components/Typography';
import { ArrowLeft, PencilSimple, CaretRight } from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import { getDriverProfileApi } from '@/lib/api/profile.api';
import { tokenService } from '@/lib/services/token.service';
import { Driver } from '@/types/driver.types';

export default function PersonalDetailsScreen() {
    const router = useRouter();
    const [tab, setTab] = React.useState<'basic' | 'contact'>('basic');
    const [driverProfile, setDriverProfile] = useState<Driver | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

//     const DRIVER_ID = 2; // HARDCODED FOR TESTING

    useEffect(() => {
        fetchDriverProfile();
    }, []);

    const fetchDriverProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = await tokenService.getToken();
            if (!token) {
                throw new Error('No authentication token');
            }
            const profile = await getDriverProfileApi(token);
            setDriverProfile(profile);
        } catch (err) {
            console.error('Error fetching driver profile:', err);
            setError('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <ActivityIndicator size="large" color="#1E3A5F" />
            </View>
        );
    }

    if (error || !driverProfile) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <Typography variant="body" className="text-red-500">
                    {error || 'Failed to load profile'}
                </Typography>
                <TouchableOpacity onPress={fetchDriverProfile} className="mt-4 px-6 py-2 bg-brand-deepNavy rounded-lg">
                    <Typography variant="body" className="text-white">Retry</Typography>
                </TouchableOpacity>
            </View>
        );
    }

    // Extract first name and last name from full name
    const nameParts = driverProfile.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const fields = [
        { label: 'First Name', value: firstName },
        { label: 'Last Name', value: lastName },
        { label: 'NIC', value: (driverProfile as any).NIC || 'Not provided' },
        { label: 'Address', value: driverProfile.address || 'Not provided' },
        { label: 'Gender', value: (driverProfile as any).gender || 'Not provided' },
        { label: 'Phone Number', value: driverProfile.phone },
        { label: 'Email', value: driverProfile.email || 'Not provided' },
        { label: 'Secondary Phone Number', value: (driverProfile as any).second_phone || 'Not provided' },
    ];

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-brand-deepNavy px-6 py-16 pb-8 rounded-b-3xl">
                <View className="flex-row items-center justify-between mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="flex-row items-center">
                        <ArrowLeft size={24} color="#fff" weight="regular" />
                        <Typography variant="headline" weight="semibold" className="text-white ml-2">
                            Personal Information
                        </Typography>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <CaretRight size={24} color="#fff" weight="regular" style={{ opacity: 0 }} />
                    </TouchableOpacity>
                </View>
                <View className="items-center">
                    <View className="w-24 h-24 rounded-full bg-brand-lightGray items-center justify-center mt-5 mb-12 overflow-hidden ">
                        {driverProfile.profileImageUrl ? (
                            <Image 
                                source={{ uri: driverProfile.profileImageUrl }} 
                                className="w-24 h-24 rounded-full" 
                                resizeMode="cover"
                            />
                        ) : (
                            <Image 
                                source={require('../../../assets/images/profile.png.jpeg')} 
                                className="w-14 h-14 rounded-full" 
                            />
                        )}
                    </View>
                    <Typography variant="headline" weight="bold" className="text-white">
                        {driverProfile.name}
                    </Typography>
                    <Typography variant="body" className="text-white opacity-80 mb-2">
                        Sri Lanka
                    </Typography>
                    <TouchableOpacity className="border border-brand-brightOrange px-4 py-1 rounded-full mb-2">
                        <Typography variant="body" weight="medium" className="text-brand-brightOrange">
                            Edit Photo
                        </Typography>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Tabs */}
            <View className="flex-row bg-white mx-6 mt-6 rounded-xl overflow-hidden">
                <TouchableOpacity
                    className={`flex-1 py-3 items-center ${tab === 'basic' ? 'border-b-2 border-brand-deepNavy bg-brand-lightGray' : ''}`}
                    onPress={() => setTab('basic')}
                >
                    <Typography variant="headline" weight="semibold" className={tab === 'basic' ? 'text-brand-deepNavy' : 'text-brand-neutralGray'}>
                        Basic Details
                    </Typography>
                </TouchableOpacity>
                <TouchableOpacity
                    className={`flex-1 py-3 items-center ${tab === 'contact' ? 'border-b-2 border-brand-deepNavy bg-brand-lightGray' : ''}`}
                    onPress={() => setTab('contact')}
                >
                    <Typography variant="headline" weight="semibold" className={tab === 'contact' ? 'text-brand-deepNavy' : 'text-brand-neutralGray'}>
                        Contact Details
                    </Typography>
                </TouchableOpacity>
            </View>

            {/* Details List */}
            <ScrollView className="mx-6 mt-2 bg-white rounded-xl">
                {fields
                    .filter((f, i) => (tab === 'basic' ? i < 4 : i >= 4))
                    .map((field, idx) => {
                        const getEditScreen = (label: string) => {
                            switch (label) {
                                case 'First Name':
                                    return 'edit-first-name';
                                case 'Last Name':
                                    return 'edit-last-name';
                                case 'NIC':
                                    return 'edit-nic';
                                case 'Address':
                                    return 'edit-address';
                                case 'Gender':
                                    return 'edit-gender';
                                case 'Phone Number':
                                    return 'edit-phone-number';
                                case 'Email':
                                    return 'edit-email';
                                case 'Secondary Phone Number':
                                    return 'edit-secondary-phone';
                                default:
                                    return '';
                            }
                        };

                        return (
                            <View key={field.label} className="flex-row items-center justify-between px-4 py-5 border-b border-brand-lightGray">
                                <View>
                                    <Typography variant="body" weight="medium" className="text-brand-deepNavy">
                                        {field.label}
                                    </Typography>
                                    <Typography variant="body" className="text-brand-neutralGray mt-1">
                                        {field.value}
                                    </Typography>
                                </View>
                                <TouchableOpacity
                                    className="p-2"
                                    onPress={() => {
                                        const editScreen = getEditScreen(field.label);
                                        if (editScreen) {
                                            router.replace(`./${editScreen}`);
                                        }
                                    }}
                                >
                                    <PencilSimple size={20} color="#fdc334" weight="regular" />
                                </TouchableOpacity>
                            </View>
                        );
                    })}
            </ScrollView>
        </View>
    );
} 