import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Typography } from '@/components/Typography';
import {
    MapPin,
    Clock,
    Users,
    NavigationArrowIcon as NavigationIcon,
    Car,
    User,
    X,
    Phone
} from 'phosphor-react-native';
import CustomButton from '@/components/ui/CustomButton';

// Types for the navigation screen props
interface TripDetails {
    startPoint: string;
    endPoint: string;
    startTime: string;
    endTime: string;
    currentLocation: string;
    seatsFilled: number;
    totalSeats: number;
}

interface NextPassenger {
    name: string;
    location: string;
    eta: string;
    profileImage?: string;
}

interface NavigationScreenProps {
    tripDetails?: TripDetails;
    nextPassenger?: NextPassenger;
    onEmergencyAlert?: (type: 'passenger' | 'vehicle') => void;
    onViewTrip?: () => void;
}

// Default values for when props are not provided
const defaultTripDetails: TripDetails = {
    startPoint: 'Athurugiriya',
    endPoint: 'Maradana',
    startTime: '6:20 AM',
    endTime: '8:20 AM',
    currentLocation: 'Colombo',
    seatsFilled: 6,
    totalSeats: 8,
};

const defaultNextPassenger: NextPassenger = {
    name: 'Supun Thilina',
    location: 'Maharagama Junction',
    eta: '7:15 AM',
};

export default function NavigationScreen({
    tripDetails = defaultTripDetails,
    nextPassenger = defaultNextPassenger,
    onEmergencyAlert,
    onViewTrip,
}: NavigationScreenProps) {
    const [showEmergencyDrawer, setShowEmergencyDrawer] = useState(false);

    const openEmergencyDrawer = () => {
        setShowEmergencyDrawer(true);
    };

    const closeEmergencyDrawer = () => {
        setShowEmergencyDrawer(false);
    };

    const handleEmergencyType = (type: 'passenger' | 'vehicle') => {
        console.log(`Emergency: ${type} issue`);
        closeEmergencyDrawer();

        // Call the callback if provided
        if (onEmergencyAlert) {
            onEmergencyAlert(type);
        }
    };

    return (
        <View className="flex-1 bg-white">
            {/* Header with Trip Details */}
            <View className="bg-white px-6 pt-12 pb-4 border-b border-gray-100">
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-1">
                        <Typography variant="caption-1" weight="medium" className="text-brand-deepNavy">
                            Start Point
                        </Typography>
                        <Typography variant="body" weight="semibold" className="text-brand-navyBlue">
                            {tripDetails.startPoint}
                        </Typography>
                        <Typography variant="caption-1" className="text-brand-neutralGray">
                            {tripDetails.startTime}
                        </Typography>
                    </View>

                    <View className="flex-1 items-end">
                        <Typography variant="caption-1" weight="medium" className="text-brand-deepNavy">
                            End Point
                        </Typography>
                        <Typography variant="body" weight="semibold" className="text-brand-deepNavy">
                            {tripDetails.endPoint}
                        </Typography>
                        <Typography variant="caption-1" className="text-brand-neutralGray">
                            {tripDetails.endTime}
                        </Typography>
                    </View>
                </View>

                  {/* Emergency Alert Button */}
                  <View className="flex-1 items-center justify-center">
                    <View style={{
                        position: 'absolute',
                        width: 70,
                        height: 70,
                        borderRadius: 100,
                        backgroundColor: '#fe9290',
                        opacity: 0.3,
                        bottom: 7,
                        zIndex:0,
                        right: 136
                    }} />
                    <TouchableOpacity
                        className="bg-red-50 border-2 border-red-300 w-16 h-16 rounded-full items-center justify-center shadow-lg bottom-12"
                        onPress={openEmergencyDrawer}
                    >
                        <Typography variant="subhead" weight="medium" className="text-red-500">Alert</Typography>
                    </TouchableOpacity>
                </View>


                {/* Current Location & Trip Info */}
                <View className="bg-brand-lightGray rounded-xl p-4 mb-4">
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center">
                            <MapPin size={16} color="#143373" weight="regular" />
                            <Typography variant="body" weight="semibold" className="text-brand-deepNavy ml-2">
                                Current Location
                            </Typography>
                        </View>
                        <Typography variant="caption-1" weight="medium" className="text-brand-brightOrange">
                            {tripDetails.currentLocation}
                        </Typography>
                    </View>

                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <Users size={16} color="#143373" weight="regular" />
                            <Typography variant="caption-1" weight="medium" className="text-brand-deepNavy ml-2">
                                Seats Filled
                            </Typography>
                        </View>
                        <Typography variant="body" weight="bold" className="text-brand-deepNavy">
                            {tripDetails.seatsFilled}/{tripDetails.totalSeats}
                        </Typography>
                    </View>
                </View>
            </View>

            

            {/* Map Container */}
            <View className="flex-1 bg-gray-100 relative">
                {/* Placeholder for Map Component */}
                <View className="flex-1 bg-gray-200 items-center justify-center">
                    <NavigationIcon size={48} color="#6b7280" weight="regular" />
                    <Typography variant="body" className="text-brand-neutralGray mt-2">
                        Heading to the destination...
                    </Typography>
                </View>

              
                {/* Next Passenger Card */}
                <View className="absolute bottom-4 left-4 right-4">
                    <View className="bg-white rounded-xl p-4 shadow-lg">
                    <View className="flex-row items-center justify-between mb-2">
                        <Typography variant="headline" weight="semibold" className="text-brand-deepNavy">
                            Next Passenger
                        </Typography>

                        <View className="flex-col space-y-1 items-end">
                            <View className="bg-brand-brightOrange px-2 py-1  rounded-full">
                            <Typography variant="caption-1" weight="medium" className="text-brand-deepNavy">
                                ETA {nextPassenger.eta}
                            </Typography>
                            </View>
                            <View className="bg-brand-brightOrange px-2 py-1 rounded-full">
                            <Typography variant="caption-1" weight="medium" className="text-brand-deepNavy">
                                ETA {nextPassenger.eta}
                            </Typography>
                            </View>
                        </View>
                        </View>


                        <View className="flex-row items-center">
                            <View className="bg-brand-warmYellow w-10 h-10 rounded-full items-center justify-center mr-3">
                                {nextPassenger.profileImage ? (
                                    <View className="w-10 h-10 rounded-full overflow-hidden">
                                        {/* Add Image component here when profile image is available */}
                                        <User size={20} color="#143373" weight="regular" />
                                    </View>
                                ) : (
                                    <User size={20} color="#143373" weight="regular" />
                                )}
                            </View>
                            <View className="flex-1">
                                <Typography variant="body" weight="semibold" className="text-brand-deepNavy">
                                    {nextPassenger.name}
                                </Typography>
                                <Typography variant="caption-1" className="text-brand-neutralGray">
                                    {nextPassenger.location}
                                </Typography>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {/* Emergency Drawer Modal */}
            <Modal
                visible={showEmergencyDrawer}
                transparent={true}
                animationType="slide"
                onRequestClose={closeEmergencyDrawer}
            >
                <View className="flex-1 bg-black bg-opacity-60 justify-end">
                    <View className="bg-white rounded-t-3xl p-6">
                        <View className="flex-row items-center justify-between mb-6">
                            <Typography variant="title-2" weight="bold" className="text-brand-deepNavy">
                                Emergency Alert
                            </Typography>
                            <TouchableOpacity onPress={closeEmergencyDrawer}>
                                <X size={24} color="#6b7280" weight="regular" />
                            </TouchableOpacity>
                        </View>

                        <Typography variant="body" className="text-brand-neutralGray mb-6">
                            Select the type of emergency to report:
                        </Typography>

                        <View className="space-y-4">
                            <TouchableOpacity
                                className="bg-red-50 border border-red-200 rounded-xl p-4 flex-row items-center"
                                onPress={() => handleEmergencyType('passenger')}
                            >
                                <User size={24} color="#ef4444" weight="regular" />
                                <View className="ml-4 flex-1">
                                    <Typography variant="body" weight="semibold" className="text-brand-deepNavy">
                                        Passenger Issue
                                    </Typography>
                                    <Typography variant="caption-1" className="text-brand-neutralGray">
                                        Medical emergency, behavior issue, or passenger concern
                                    </Typography>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex-row items-center"
                                onPress={() => handleEmergencyType('vehicle')}
                            >
                                <Car size={24} color="#f59e0b" weight="regular" />
                                <View className="ml-4 flex-1">
                                    <Typography variant="body" weight="semibold" className="text-brand-deepNavy">
                                        Vehicle Issue
                                    </Typography>
                                    <Typography variant="caption-1" className="text-brand-neutralGray">
                                        Mechanical problem, breakdown, or vehicle concern
                                    </Typography>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View className="mt-6">
                            <CustomButton
                                title="Cancel"
                                onPress={closeEmergencyDrawer}
                                bgVariant="outline"
                                textVariant="primary"
                                size="medium"
                                fullWidth
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
} 