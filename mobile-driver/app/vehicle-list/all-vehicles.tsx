import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Typography } from '@/components/Typography';
import CustomButton from '@/components/ui/CustomButton';
import { ArrowLeft, Plus } from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import { VehicleCard } from '@/components/vehicle/VehicleCard';

type TabType = 'all' | 'assigned' | 'unassigned';

interface Vehicle {
    id: string;
    licensePlate: string;
    model: string;
    driver: string;
    status: 'active' | 'inactive';
    image: any;
}

const mockVehicles: Vehicle[] = [
    {
        id: '1',
        licensePlate: 'WP CAB 4645',
        model: 'TOYOTA GDH 223 GL',
        driver: 'Hemal Perera',
        status: 'active',
        image: require('@/assets/images/vehicle1.png'),
    },
    {
        id: '2',
        licensePlate: 'WP FFD 1206',
        model: 'TOYOTA TownACE',
        driver: 'Wishwa Namal',
        status: 'active',
        image: require('@/assets/images/vehicle2.png'),
    },
    {
        id: '3',
        licensePlate: 'WP CAB 4645',
        model: 'TOYOTA GDH 223 GL',
        driver: 'Hemal Perera',
        status: 'inactive',
        image: require('@/assets/images/vehicle1.png'),
    },
    {
        id: '4',
        licensePlate: 'WP ABC 1234',
        model: 'TOYOTA Hiace',
        driver: 'Kamal Silva',
        status: 'active',
        image: require('@/assets/images/vehicle2.png'),
    },
    {
        id: '5',
        licensePlate: 'WP XYZ 5678',
        model: 'NISSAN Caravan',
        driver: 'Sunil Fernando',
        status: 'active',
        image: require('@/assets/images/vehicle1.png'),
    },
];

export default function VehicleListScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('all');

    const handleBack = () => {
        router.back();
    };

    const handleAddVehicle = () => {
        // TODO: Navigate to add vehicle screen
        console.log('Add vehicle pressed');
    };

    const handleViewMore = (vehicleId: string) => {
        // TODO: Navigate to vehicle details screen
        console.log('View more for vehicle:', vehicleId);
    };

    const getFilteredVehicles = () => {
        switch (activeTab) {
            case 'assigned':
                return mockVehicles.filter(vehicle => vehicle.driver !== 'Unassigned');
            case 'unassigned':
                return mockVehicles.filter(vehicle => vehicle.driver === 'Unassigned');
            default:
                return mockVehicles;
        }
    };

    const TabButton = ({ tab, label }: { tab: TabType; label: string }) => (
        <TouchableOpacity
            onPress={() => setActiveTab(tab)}
            className="flex-1 items-center py-3"
        >
            <Typography
                variant="subhead"
                weight={activeTab === tab ? 'semibold' : 'medium'}
                className={`${activeTab === tab ? 'text-white' : 'text-brand-neutralGray'}`}
            >
                {label}
            </Typography>
            {activeTab === tab && (
                <View className="w-8 h-1 bg-brand-warmYellow rounded-full mt-2" />
            )}
        </TouchableOpacity>
    );



    return (
        <View className="flex-1 bg-gray-50">
            {/* Blue Header with rounded bottom corners */}
            <View className="bg-brand-deepNavy px-6 py-12 pb-4 rounded-b-3xl">
                <View className="flex-row items-center mb-3">
                    <TouchableOpacity onPress={handleBack} className="mr-4 mt-5 mb-4">
                        <ArrowLeft size={24} color="#ffffff" weight="regular" />
                    </TouchableOpacity>
                    <Typography
                        variant="title-2"
                        weight="bold"
                        className="text-white flex-1 mt-5 mb-4"
                    >
                        Vehicle List
                    </Typography>
                </View>

                {/* Tabs */}
                <View className="flex-row justify-between">
                    <TabButton tab="all" label="All" />
                    <TabButton tab="assigned" label="Assigned" />
                    <TabButton tab="unassigned" label="Unassigned" />
                </View>
            </View>

            {/* Content */}
            <ScrollView className="flex-1 px-6 pt-4">
                {getFilteredVehicles().map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} onViewMore={handleViewMore} />
                ))}

                {/* Add Vehicle Button - Only show in All tab */}
                {activeTab === 'all' && (
                    <View className="pt-4 pb-6">
                        <CustomButton
                            title="Add another vehicle"
                            bgVariant="navyBlue"
                            textVariant="white"
                            size="large"
                            fullWidth
                            IconLeft={Plus}
                            onPress={handleAddVehicle}
                        />
                    </View>
                )}
            </ScrollView>
        </View>
    );
} 