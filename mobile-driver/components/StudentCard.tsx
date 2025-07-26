import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { Typography } from '@/components/Typography';
import { MapPin, Phone, User } from 'phosphor-react-native';

interface StudentCardProps {
    name: string;
    profilePic?: string;
    pickupLocation: string;
    distance: string;
    contactNumber: string;
    onPress?: () => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({
    name,
    profilePic,
    pickupLocation,
    distance,
    contactNumber,
    onPress
}) => {
    return (
        <TouchableOpacity
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-3"
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View className="flex-row items-center">
                {/* Profile Picture */}
                <View className="mr-4">
                    {profilePic ? (
                        <Image
                            source={{ uri: profilePic }}
                            className="w-14 h-14 rounded-full"
                            resizeMode="cover"
                        />
                    ) : (
                        <View className="w-14 h-14 rounded-full bg-brand-lightGray items-center justify-center">
                            <User size={24} color="#143373" weight="regular" />
                        </View>
                    )}
                </View>

                {/* Student Information */}
                <View className="flex-1">
                    <Typography variant="headline" weight="semibold" className="text-brand-deepNavy mb-1">
                        {name}
                    </Typography>

                    {/* Pickup Location */}
                    <View className="flex-row items-center mb-2">
                        <MapPin size={16} color="#6b7280" weight="regular" />
                        <Typography variant="caption-1" className="text-brand-neutralGray ml-1 flex-1">
                            {pickupLocation}
                        </Typography>
                    </View>

                    {/* Distance and Contact */}
                    <View className="flex-row items-center justify-between">
                        <View className="bg-brand-lightGray px-2 py-1 rounded-full">
                            <Typography variant="caption-2" weight="medium" className="text-brand-deepNavy">
                                {distance} from city
                            </Typography>
                        </View>

                        <TouchableOpacity
                            className="flex-row items-center bg-brand-brightOrange px-3 py-1 rounded-full"
                            onPress={() => console.log('Calling:', contactNumber)}
                            activeOpacity={0.8}
                        >
                            <Phone size={14} color="#ffffff" weight="regular" />
                            <Typography variant="caption-2" weight="medium" className="text-white ml-1">
                                Call
                            </Typography>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}; 