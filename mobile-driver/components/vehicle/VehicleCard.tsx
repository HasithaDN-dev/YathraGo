import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Typography } from '@/components/Typography';
import { User } from 'phosphor-react-native';

interface Vehicle {
    id: string;
    vehicleId: string;
    model: string;
    assignedDriver: string;
    status: 'active' | 'inactive';
    image?: any;
}

interface VehicleCardProps {
    vehicle: Vehicle;
    onViewMore: () => void;
}

export default function VehicleCard({ vehicle, onViewMore }: VehicleCardProps) {
    const getStatusColor = (status: 'active' | 'inactive') => {
        return status === 'active'
            ? 'bg-success bg-opacity-20 text-success'
            : 'bg-danger bg-opacity-20 text-danger';
    };

    return (
        <View className="bg-white rounded-xl p-4 shadow-sm mb-4 border border-gray-100">
            <View className="flex-row">
                {/* Vehicle Image */}
                <View className="w-20 h-16 bg-gray-100 rounded-lg mr-4 items-center justify-center overflow-hidden">
                    {vehicle.image ? (
                        <Image
                            source={vehicle.image}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    ) : (
                        <View className="w-16 h-12 bg-brand-lightGray rounded-lg items-center justify-center">
                            {/* Placeholder for vehicle icon */}
                            <View className="w-8 h-6 bg-brand-deepNavy rounded-sm" />
                        </View>
                    )}
                </View>

                {/* Vehicle Details */}
                <View className="flex-1">
                    <View className="flex-row items-start justify-between mb-2">
                        <View className="flex-1">
                            <Typography variant="body" weight="bold" className="text-brand-deepNavy mb-1">
                                {vehicle.vehicleId}
                            </Typography>
                            <Typography variant="caption-1" className="text-brand-neutralGray">
                                {vehicle.model}
                            </Typography>
                        </View>

                        {/* Status Tag */}
                        <View className={`px-2 py-1 rounded-full ${getStatusColor(vehicle.status)}`}>
                            <Typography variant="caption-1" weight="medium" className="capitalize">
                                {vehicle.status}
                            </Typography>
                        </View>
                    </View>

                    {/* Assigned Driver */}
                    <View className="flex-row items-center mb-3">
                        <User size={14} color="#6b7280" weight="regular" />
                        <Typography variant="caption-1" className="text-brand-neutralGray ml-1">
                            {vehicle.assignedDriver}
                        </Typography>
                    </View>

                    {/* View More Button */}
                    <TouchableOpacity
                        className="bg-brand-navyBlue bg-opacity-10 rounded-lg px-3 py-2 self-start"
                        onPress={onViewMore}
                    >
                        <Typography variant="caption-1" weight="medium" className="text-brand-navyBlue">
                            View More
                        </Typography>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
} 