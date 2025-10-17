import React, { useState, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, Modal, Linking, Alert } from 'react-native';
import { Typography } from '@/components/Typography';
import {
    MapPin,
    Users,
    NavigationArrowIcon as NavigationIcon,
    Car,
    User,
    X,
    CheckCircle,
    MapTrifold
} from 'phosphor-react-native';
import CustomButton from '@/components/ui/CustomButton';
import { fetchOptimizedRouteWithGPS } from '@/lib/api/maps.api';
import { tokenService } from '@/lib/services/token.service';
import { API_BASE_URL } from '@/config/api';

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

interface DriverRouteCities {
    success: boolean;
    startPoint: string;
    endPoint: string;
    startCityId: number;
    endCityId: number;
}

interface StudentLocation {
    lat: number;
    lng: number;
    type: 'pickup' | 'dropoff';
    childId: number;
    address: string;
    etaSecs: number;
    legDistanceMeters: number;
    childName?: string;
    status?: 'pending' | 'arrived' | 'completed';
}

interface OptimizedRoute {
    degraded: boolean;
    totalDistanceMeters: number;
    totalDurationSecs: number;
    polyline: string | null;
    stops: StudentLocation[];
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

export default function NavigationScreen({
    tripDetails: initialTripDetails = defaultTripDetails,
}: { tripDetails?: TripDetails }) {
    const [showEmergencyDrawer, setShowEmergencyDrawer] = useState(false);
    const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(null);
    const [currentStopIndex, setCurrentStopIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tripDetails, setTripDetails] = useState<TripDetails>(initialTripDetails);
    const [todayStudentCount, setTodayStudentCount] = useState<number>(0);

    const fetchRouteData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const authenticatedFetch = tokenService.createAuthenticatedFetch();
            
            // Fetch driver route cities (start and end points)
            const citiesResponse = await authenticatedFetch(`${API_BASE_URL}/driver/route-cities`);
            let routeCities: DriverRouteCities | null = null;
            
            if (citiesResponse.ok) {
                routeCities = await citiesResponse.json();
            }
            
            // Fetch optimized route with current location
            const routeData = await fetchOptimizedRouteWithGPS();
            setOptimizedRoute(routeData);
            
            // Count unique students (pickups only) for today
            const uniqueStudents = new Set(
                routeData.stops
                    .filter(s => s.type === 'pickup')
                    .map(s => s.childId)
            );
            setTodayStudentCount(uniqueStudents.size);
            
            // Update trip details with actual data
            setTripDetails(prev => ({
                ...prev,
                startPoint: routeCities?.success ? routeCities.startPoint : prev.startPoint,
                endPoint: routeCities?.success ? routeCities.endPoint : prev.endPoint,
                seatsFilled: uniqueStudents.size,
            }));
        } catch (err) {
            console.error('Error fetching route data:', err);
            setError('Failed to load route data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRouteData();
    }, [fetchRouteData]);

    const openEmergencyDrawer = () => {
        setShowEmergencyDrawer(true);
    };

    const closeEmergencyDrawer = () => {
        setShowEmergencyDrawer(false);
    };

    const handleEmergencyType = (type: 'passenger' | 'vehicle') => {
        console.log(`Emergency: ${type} issue`);
        closeEmergencyDrawer();
        Alert.alert('Emergency Alert', `Emergency alert sent for ${type} issue`);
    };

    const openGoogleMaps = async (destination: StudentLocation) => {
        try {
            const { lat, lng } = destination;
            const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
            
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Error', 'Cannot open Google Maps');
            }
        } catch (error) {
            console.error('Error opening Google Maps:', error);
            Alert.alert('Error', 'Failed to open Google Maps');
        }
    };

    const markAttendance = async (student: StudentLocation) => {
        try {
            const authenticatedFetch = tokenService.createAuthenticatedFetch();
            
            // Create attendance record
            const attendanceData = {
                childId: student.childId,
                type: student.type,
                latitude: student.lat,
                longitude: student.lng,
                notes: `${student.type} completed`,
                status: 'completed'
            };

            const response = await authenticatedFetch(`${API_BASE_URL}/driver/mark-attendance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(attendanceData),
            });

            if (response.ok) {
                // Update local state
                setOptimizedRoute(prev => {
                    if (!prev) return prev;
                    const updatedStops = [...prev.stops];
                    const stopIndex = updatedStops.findIndex(s => 
                        s.childId === student.childId && s.type === student.type
                    );
                    if (stopIndex !== -1) {
                        updatedStops[stopIndex] = { ...updatedStops[stopIndex], status: 'completed' };
                    }
                    return { ...prev, stops: updatedStops };
                });

                // Move to next stop
                setCurrentStopIndex(prev => prev + 1);
                
                Alert.alert('Success', `${student.type} attendance marked successfully`);
            } else {
                throw new Error('Failed to mark attendance');
            }
        } catch (error) {
            console.error('Error marking attendance:', error);
            Alert.alert('Error', 'Failed to mark attendance. Please try again.');
        }
    };

    const getCurrentStudent = (): StudentLocation | null => {
        if (!optimizedRoute || currentStopIndex >= optimizedRoute.stops.length) {
            return null;
        }
        return optimizedRoute.stops[currentStopIndex];
    };

    const getNextStudent = (): StudentLocation | null => {
        if (!optimizedRoute || currentStopIndex + 1 >= optimizedRoute.stops.length) {
            return null;
        }
        return optimizedRoute.stops[currentStopIndex + 1];
    };

    const formatETA = (etaSecs: number) => {
        const now = Math.floor(Date.now() / 1000);
        const diffSecs = etaSecs - now;
        const minutes = Math.max(0, Math.floor(diffSecs / 60));
        return `${minutes} min`;
    };

    const formatDistance = (meters: number) => {
        if (meters < 1000) {
            return `${meters}m`;
        }
        return `${(meters / 1000).toFixed(1)}km`;
    };

    if (loading) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <Typography variant="body" className="text-brand-neutralGray">
                    Loading route data...
                </Typography>
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 bg-white items-center justify-center px-6">
                <Typography variant="body" className="text-red-500 text-center mb-4">
                    {error}
                </Typography>
                <CustomButton
                    title="Retry"
                    onPress={fetchRouteData}
                    size="medium"
                />
            </View>
        );
    }

    const currentStudent = getCurrentStudent();
    const nextStudent = getNextStudent();

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
                        zIndex: 0,
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
                                Today&#39;s Students
                            </Typography>
                        </View>
                        <Typography variant="body" weight="bold" className="text-brand-deepNavy">
                            {todayStudentCount} Students
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
                        {currentStudent ? `Heading to ${currentStudent.address}` : 'Route completed'}
                    </Typography>
                    {currentStudent && (
                        <View className="mt-4">
                            <CustomButton
                                title="Open Google Maps"
                                onPress={() => openGoogleMaps(currentStudent)}
                                size="small"
                                IconLeft={MapTrifold}
                            />
                        </View>
                    )}
                </View>

                {/* Current Student Card */}
                {currentStudent && (
                    <View className="absolute bottom-4 left-4 right-4">
                        <View className="bg-white rounded-xl p-4 shadow-lg flex-col justify-between">
                            <View className="flex-row items-center justify-between mb-2">
                                <Typography variant="headline" weight="semibold" className="text-brand-deepNavy">
                                    {currentStudent.type === 'pickup' ? 'Pickup Student' : 'Drop-off Student'}
                                </Typography>
                                <View className="flex-col space-y-1 items-end">
                                    <View className="bg-brand-brightOrange px-2 py-1 rounded-full">
                                        <Typography variant="caption-1" weight="medium" className="text-brand-deepNavy">
                                            ETA {formatETA(currentStudent.etaSecs)}
                                        </Typography>
                                    </View>
                                </View>
                            </View>

                            <View className="flex-row items-center mb-3">
                                <View className="bg-brand-warmYellow w-10 h-10 rounded-full items-center justify-center mr-3">
                                    <User size={20} color="#143373" weight="regular" />
                                </View>
                                <View className="flex-1">
                                    <Typography variant="body" weight="semibold" className="text-brand-deepNavy">
                                        {currentStudent.childName || `Student ${currentStudent.childId}`}
                                    </Typography>
                                    <Typography variant="caption-1" className="text-brand-neutralGray">
                                        {currentStudent.address}
                                    </Typography>
                                </View>
                                <View className="px-2 py-1 rounded-full">
                                    <Typography variant="callout" weight="medium" className="text-brand-deepNavy">
                                        {formatDistance(currentStudent.legDistanceMeters)}
                                    </Typography>
                                </View>
                            </View>

                            <View className="flex-row gap-2">
                                <CustomButton
                                    title="Open Google Maps"
                                    onPress={() => openGoogleMaps(currentStudent)}
                                    size="small"
                                    IconLeft={MapTrifold}
                                    fullWidth
                                />
                                <CustomButton
                                    title="Mark Attendance"
                                    onPress={() => markAttendance(currentStudent)}
                                    size="small"
                                    bgVariant="success"
                                    IconLeft={CheckCircle}
                                    fullWidth
                                />
                            </View>
                        </View>
                    </View>
                )}

                {/* Next Student Preview Card (if available) */}
                {nextStudent && currentStudent && (
                    <View className="absolute bottom-44 left-4 right-4">
                        <View className="bg-white rounded-xl p-3 shadow-md border border-gray-100">
                            <View className="flex-row items-center justify-between mb-1">
                                <Typography variant="subhead" weight="semibold" className="text-brand-deepNavy">
                                    Next: {nextStudent.type === 'pickup' ? 'Pickup' : 'Drop-off'}
                                </Typography>
                                <Typography variant="caption-1" className="text-brand-neutralGray">
                                    ETA {formatETA(nextStudent.etaSecs)}
                                </Typography>
                            </View>
                            <View className="flex-row items-center justify-between">
                                <Typography variant="caption-1" className="text-brand-neutralGray">
                                    {nextStudent.childName || `Student ${nextStudent.childId}`}
                                </Typography>
                                <Typography variant="caption-2" className="text-brand-neutralGray">
                                    {formatDistance(nextStudent.legDistanceMeters)}
                                </Typography>
                            </View>
                            <Typography variant="caption-2" className="text-brand-neutralGray" numberOfLines={1}>
                                {nextStudent.address}
                            </Typography>
                        </View>
                    </View>
                )}
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