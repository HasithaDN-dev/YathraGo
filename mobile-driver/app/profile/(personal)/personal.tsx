import React from 'react';
import { View, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Typography } from '@/components/Typography';
import { ArrowLeft, PencilSimple, CaretRight } from 'phosphor-react-native';
import { useRouter } from 'expo-router';

const user = {
    profilePic: undefined, // Replace with actual image URI if available
    name: 'Nihal Perera',
    country: 'Sri Lanka',
    firstName: 'Nihal',
    lastName: 'Perera',
    nic: '810264220 V',
    address: '123, Main Street, Colombo',
    gender: 'Male',
    phone: '+94 71 234 5678',
    email: 'nihal.perera@email.com',
    secondaryPhone: '+94 77 345 6789',
};

const fields = [
    { label: 'First Name', value: user.firstName },
    { label: 'Last Name', value: user.lastName },
    { label: 'NIC', value: user.nic },
    { label: 'Address', value: user.address },
    { label: 'Gender', value: user.gender },
    { label: 'Phone Number', value: user.phone },
    { label: 'Email', value: user.email },
    { label: 'Secondary Phone Number', value: user.secondaryPhone },
];

export default function PersonalDetailsScreen() {
    const router = useRouter();
    const [tab, setTab] = React.useState<'basic' | 'contact'>('basic');

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

                        <Image source={require('../../../assets/images/profile.png.jpeg')} className="w-14 h-14 rounded-full" />

                    </View>
                    <Typography variant="headline" weight="bold" className="text-white">
                        {user.name}
                    </Typography>
                    <Typography variant="body" className="text-white opacity-80 mb-2">
                        {user.country}
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