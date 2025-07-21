import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Typography } from '@/components/Typography';
import { User } from 'phosphor-react-native';

interface Vehicle {
    id: string;
    licensePlate: string;
    model: string;
    driver: string;
    status: 'active' | 'inactive';
    image: any;
}

interface VehicleCardProps {
    vehicle: Vehicle;
    onViewMore: (vehicleId: string) => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onViewMore }) => {
    return (
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
            <View className="flex-row items-center">
                <Image
                    source={vehicle.image}
                    className="w-16 h-12 rounded-lg mr-4"
                    resizeMode="cover"
                />
                <View className="flex-1">
                    <Typography
                        variant="headline"
                        weight="bold"
                        className="text-brand-deepNavy mb-1"
                    >
                        {vehicle.licensePlate}
                    </Typography>
                    <Typography
                        variant="body"
                        className="text-brand-neutralGray mb-2"
                    >
                        {vehicle.model}
                    </Typography>
                    <View className="flex-row items-center">
                        <User size={16} color="#6b7280" weight="regular" />
                        <Typography
                            variant="body"
                            className="text-brand-neutralGray ml-2"
                        >
                            {vehicle.driver}
                        </Typography>
                    </View>
                </View>
                <View className="items-end">
                    <View
                        className={`px-3 py-1 rounded-full ${vehicle.status === 'active'
                                ? 'bg-success-bg'
                                : 'bg-danger-bg'
                            }`}
                    >
                        <Typography
                            variant="caption-1"
                            weight="medium"
                            className={
                                vehicle.status === 'active'
                                    ? 'text-success'
                                    : 'text-danger'
                            }
                        >
                            {vehicle.status === 'active' ? 'Active' : 'Inactive'}
                        </Typography>
                    </View>
                </View>
            </View>
            <TouchableOpacity
                onPress={() => onViewMore(vehicle.id)}
                className="mt-4 bg-brand-lightGray py-3 rounded-lg items-center"
            >
                <Typography
                    variant="subhead"
                    weight="medium"
                    className="text-brand-deepNavy"
                >
                    View More
                </Typography>
            </TouchableOpacity>
        </View>
    );
}; 