import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Typography } from '@/components/Typography';
import { ArrowLeft, Plus, Camera } from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import CustomButton from '@/components/ui/CustomButton';
import InputField from '@/components/ui/InputField';

export default function AddVehicleScreen() {
    const router = useRouter();
    const [vehicleData, setVehicleData] = useState({
        vehicleId: '',
        model: '',
        year: '',
        color: '',
        capacity: '',
    });

    const handleBack = () => {
        router.back();
    };

    const handleAddVehicle = () => {
        console.log('Adding vehicle:', vehicleData);
        // Handle vehicle addition logic
    };

    const handleTakePhoto = () => {
        console.log('Take photo pressed');
        // Handle camera functionality
    };

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="bg-brand-deepNavy px-6 pt-12 pb-4 rounded-b-3xl">
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={handleBack} className="mr-4">
                        <ArrowLeft size={24} color="#ffffff" weight="regular" />
                    </TouchableOpacity>
                    <Typography variant="title-1" weight="bold" className="text-white">
                        Add Vehicle
                    </Typography>
                </View>
            </View>

            {/* Form */}
            <ScrollView className="flex-1 px-6 py-4">
                {/* Vehicle Photo Section */}
                <View className="bg-white rounded-xl p-4 shadow-sm mb-4 border border-gray-100">
                    <Typography variant="headline" weight="semibold" className="text-brand-deepNavy mb-4">
                        Vehicle Photo
                    </Typography>

                    <TouchableOpacity
                        className="bg-brand-lightGray rounded-xl p-8 items-center justify-center border-2 border-dashed border-brand-neutralGray"
                        onPress={handleTakePhoto}
                    >
                        <Camera size={48} color="#6b7280" weight="regular" />
                        <Typography variant="body" weight="medium" className="text-brand-neutralGray mt-2">
                            Tap to take photo
                        </Typography>
                        <Typography variant="caption-1" className="text-brand-neutralGray text-center mt-1">
                            Add a clear photo of your vehicle
                        </Typography>
                    </TouchableOpacity>
                </View>

                {/* Vehicle Details Form */}
                <View className="bg-white rounded-xl p-4 shadow-sm mb-4 border border-gray-100">
                    <Typography variant="headline" weight="semibold" className="text-brand-deepNavy mb-4">
                        Vehicle Details
                    </Typography>

                    <View className="space-y-4">
                        <InputField
                            label="Vehicle ID"
                            placeholder="WP ABC 1234"
                            value={vehicleData.vehicleId}
                            onChangeText={(text) => setVehicleData({ ...vehicleData, vehicleId: text })}
                            size="medium"
                        />

                        <InputField
                            label="Model"
                            placeholder="TOYOTA HIACE"
                            value={vehicleData.model}
                            onChangeText={(text) => setVehicleData({ ...vehicleData, model: text })}
                            size="medium"
                        />

                        <InputField
                            label="Year"
                            placeholder="2020"
                            value={vehicleData.year}
                            onChangeText={(text) => setVehicleData({ ...vehicleData, year: text })}
                            size="medium"
                            inputMode="numeric"
                        />

                        <InputField
                            label="Color"
                            placeholder="White"
                            value={vehicleData.color}
                            onChangeText={(text) => setVehicleData({ ...vehicleData, color: text })}
                            size="medium"
                        />

                        <InputField
                            label="Passenger Capacity"
                            placeholder="8"
                            value={vehicleData.capacity}
                            onChangeText={(text) => setVehicleData({ ...vehicleData, capacity: text })}
                            size="medium"
                            inputMode="numeric"
                        />
                    </View>
                </View>

                {/* Add Vehicle Button */}
                <View className="mb-20">
                    <CustomButton
                        title="Add Vehicle"
                        onPress={handleAddVehicle}
                        bgVariant="primary"
                        size="large"
                        fullWidth
                        IconLeft={Plus}
                    />
                </View>
            </ScrollView>
        </View>
    );
} 