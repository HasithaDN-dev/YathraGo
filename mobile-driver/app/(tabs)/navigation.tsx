import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Modal, Linking, Alert, ScrollView, RefreshControl } from 'react-native';
import * as Location from 'expo-location';
import { Typography } from '@/components/Typography';
import {
    MapPin,
    Users,
    NavigationArrowIcon as NavigationIcon,
    Car,
    User,
    X,
    CheckCircle,
    MapTrifold,
    House,
    Building
} from 'phosphor-react-native';
import CustomButton from '@/components/ui/CustomButton';
import { routeApi, RouteStop, DailyRoute } from '@/lib/api/route.api';

/**
 * This screen implements the complete driver routing workflow as described in the guide:
 * 1. Driver starts ride
 * 2. Gets ordered list of stops (pickups and dropoffs)
 * 3. Shows current stop with "Get Directions" and "Mark Complete" buttons
 * 4. Advances to next stop after completing current one
 * 5. Shows next stop preview
 */

export default function NavigationScreen() {
    // Core state management as per guide
    const [isRideActive, setIsRideActive] = useState(false);
    const [stopList, setStopList] = useState<RouteStop[]>([]);
    const [currentStopIndex, setCurrentStopIndex] = useState(0);
    
    // Additional state
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showEmergencyDrawer, setShowEmergencyDrawer] = useState(false);
    const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [routeData, setRouteData] = useState<DailyRoute | null>(null);

    // Get current location
    const getCurrentLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                throw new Error('Location permission denied');
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            return {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };
        } catch (error) {
            console.error('Error getting location:', error);
            return null;
        }
    };

    // Load initial data when screen opens
    useEffect(() => {
        loadRouteStatus();
    }, []);

    // Check if there's an existing route for today
    const loadRouteStatus = async () => {
        try {
            setLoading(true);
            const status = await routeApi.getCurrentRouteStatus();
            
            if (status.routes && status.routes.length > 0) {
                const activeRoute = status.routes.find(r => 
                    r.status === 'IN_PROGRESS' || r.status === 'PENDING'
                );
                
                if (activeRoute && activeRoute.stops) {
                    setRouteData(activeRoute);
                    setStopList(activeRoute.stops);
                    
                    // Find first incomplete stop
                    const firstIncompleteIndex = activeRoute.stops.findIndex(
                        (stop: RouteStop) => stop.status !== 'COMPLETED'
                    );
                    
                    if (firstIncompleteIndex !== -1) {
                        setCurrentStopIndex(firstIncompleteIndex);
                        setIsRideActive(activeRoute.status === 'IN_PROGRESS');
                    }
                }
            }
        } catch (error) {
            console.error('Error loading route status:', error);
        } finally {
            setLoading(false);
        }
    };

    // Start the ride - Step A from the guide
    const handleStartRide = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Get current location
            const location = await getCurrentLocation();
            if (!location) {
                Alert.alert('Location Required', 'Please enable location services to start the ride.');
                return;
            }
            
            setCurrentLocation(location);
            
            // Fetch today's optimized route from backend
            const routeData = await routeApi.getTodaysRoute(
                'MORNING_PICKUP',
                location.latitude,
                location.longitude
            );
            
            if (!routeData.success || !routeData.stops || routeData.stops.length === 0) {
                setError('No stops found for today. Please check student assignments and attendance.');
                return;
            }
            
            // Set the state - this is the core of the guide's workflow
            setRouteData(routeData);
            setStopList(routeData.stops);
            setCurrentStopIndex(0);
            setIsRideActive(true);
            
            Alert.alert(
                'Ride Started',
                `You have ${routeData.stops.length} stops today. Navigate to the first stop to begin.`
            );
        } catch (error) {
            console.error('Error starting ride:', error);
            setError(error instanceof Error ? error.message : 'Failed to start ride. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Get current stop object
    const getCurrentStop = (): RouteStop | null => {
        if (!stopList || currentStopIndex >= stopList.length) {
            return null;
        }
        return stopList[currentStopIndex];
    };

    // Get next stop object
    const getNextStop = (): RouteStop | null => {
        if (!stopList || currentStopIndex + 1 >= stopList.length) {
            return null;
        }
        return stopList[currentStopIndex + 1];
    };

    // Handle "Get Directions" button - Step B from the guide
    const handleGetDirections = () => {
        const currentStop = getCurrentStop();
        if (!currentStop) return;

        const { latitude, longitude } = currentStop;
        
        // This URL format directly opens Google Maps in navigation mode
        const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
        
        Linking.openURL(url).catch(err => {
            console.error('Error opening Google Maps:', err);
            Alert.alert('Error', 'Cannot open Google Maps');
        });
    };

    // Handle "Mark as Picked Up / Dropped Off" button - Step C from the guide
    const handleMarkAsComplete = async () => {
        const currentStop = getCurrentStop();
        if (!currentStop) return;

        try {
            setLoading(true);
            
            // Get current location for attendance record
            const location = await getCurrentLocation();
            
            // Call backend to mark stop as completed
            const result = await routeApi.markStopCompleted(
                currentStop.stopId,
                location?.latitude,
                location?.longitude,
                `${currentStop.type} completed`
            );

            // Update local state
            const updatedStops = [...stopList];
            updatedStops[currentStopIndex] = {
                ...currentStop,
                status: 'COMPLETED',
            };
            setStopList(updatedStops);

            // Check if there are more stops
            if (currentStopIndex < stopList.length - 1) {
                // Advance to next stop - this is the core workflow advancement
                setCurrentStopIndex(prevIndex => prevIndex + 1);
                
                Alert.alert(
                    'Success',
                    `${currentStop.type === 'PICKUP' ? 'Pickup' : 'Drop-off'} completed! Moving to next stop.`,
                    [{ text: 'OK' }]
                );
            } else {
                // This was the last stop!
                    Alert.alert(
                    'Ride Complete!',
                    'All stops have been completed. Great job!',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                setIsRideActive(false);
                                setStopList([]);
                                setCurrentStopIndex(0);
                            }
                        }
                    ]
                );
            }
        } catch (error) {
            console.error('Error marking stop complete:', error);
            Alert.alert('Error', 'Failed to mark stop as complete. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Refresh handler
    const onRefresh = async () => {
        setRefreshing(true);
        await loadRouteStatus();
        setRefreshing(false);
    };

    // Emergency handlers
    const openEmergencyDrawer = () => setShowEmergencyDrawer(true);
    const closeEmergencyDrawer = () => setShowEmergencyDrawer(false);
    const handleEmergencyType = (type: 'passenger' | 'vehicle') => {
        closeEmergencyDrawer();
        Alert.alert('Emergency Alert', `Emergency alert sent for ${type} issue`);
    };

    // Format ETA
    const formatETA = (etaSecs: number) => {
        const now = Math.floor(Date.now() / 1000);
        const diffSecs = etaSecs - now;
        const minutes = Math.max(0, Math.floor(diffSecs / 60));
        return `${minutes} min`;
    };

    // Format distance
    const formatDistance = (meters: number) => {
        if (meters < 1000) {
            return `${meters}m`;
        }
        return `${(meters / 1000).toFixed(1)}km`;
    };

    const currentStop = getCurrentStop();
    const nextStop = getNextStop();

    // Loading state
    if (loading && !isRideActive) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <Typography variant="body" className="text-brand-neutralGray">
                    Loading route data...
                </Typography>
            </View>
        );
    }

    return (
        <ScrollView 
            className="flex-1 bg-white"
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Header */}
            <View className="bg-brand-deepNavy px-6 pt-16 pb-6 rounded-b-3xl">
                <View className="flex-row items-center justify-between mb-4">
                    <View>
                        <Typography variant="title-2" weight="bold" className="text-white">
                            {isRideActive ? 'Ride in Progress' : 'Ready to Start'}
                        </Typography>
                        <Typography variant="body" className="text-white opacity-80">
                            {isRideActive ? `Stop ${currentStopIndex + 1} of ${stopList.length}` : 'Start your trip'}
                        </Typography>
                </View>

                {/* Emergency Alert Button */}
                    <TouchableOpacity
                        className="bg-red-500 px-4 py-2 rounded-full"
                        onPress={openEmergencyDrawer}
                    >
                        <Typography variant="subhead" weight="medium" className="text-white">Alert</Typography>
                    </TouchableOpacity>
                </View>

                {/* Progress bar */}
                {isRideActive && stopList.length > 0 && (
                    <View className="bg-white bg-opacity-20 h-2 rounded-full overflow-hidden">
                        <View 
                            className="bg-brand-brightOrange h-full" 
                            style={{ width: `${((currentStopIndex) / stopList.length) * 100}%` }}
                        />
                    </View>
                )}
                    </View>

            {/* Main Content */}
            <View className="px-6 py-6">
                {!isRideActive ? (
                    // Pre-ride screen
                    <View>
                        <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-4">
                            <View className="items-center mb-6">
                                <View className="bg-brand-lightGray p-6 rounded-full mb-4">
                                    <NavigationIcon size={48} color="#143373" weight="regular" />
                                </View>
                                <Typography variant="title-2" weight="bold" className="text-brand-deepNavy mb-2 text-center">
                                    Ready to Start Your Route?
                                </Typography>
                                <Typography variant="body" className="text-brand-neutralGray text-center">
                                    Tap the button below to fetch today's optimized route based on student attendance
                                </Typography>
            </View>

                                <CustomButton
                                title="Start Ride"
                                onPress={handleStartRide}
                                size="large"
                                    bgVariant="success"
                                fullWidth
                                disabled={loading}
                                />
                </View>

                        {error && (
                            <View className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <Typography variant="body" className="text-red-600 text-center">
                                    {error}
                                </Typography>
                            </View>
                        )}
                    </View>
                ) : (
                    // Active ride screen - showing current stop card
                    <View>
                        {currentStop ? (
                            <>
                                {/* Current Stop Card - This is the "Current Task" card from the guide */}
                                <View className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-4">
                                    <View className="flex-row items-center justify-between mb-4">
                                        <Typography variant="title-2" weight="bold" className="text-brand-deepNavy">
                                            Next {currentStop.type === 'PICKUP' ? 'Pickup' : 'Drop-off'}
                                        </Typography>
                                        <View className="bg-brand-brightOrange px-3 py-1 rounded-full">
                                            <Typography variant="caption-1" weight="medium" className="text-brand-deepNavy">
                                                ETA {formatETA(currentStop.etaSecs)}
                                            </Typography>
                                        </View>
                            </View>

                                    {/* Passenger Info */}
                                    <View className="flex-row items-center mb-4">
                                        <View className="bg-brand-warmYellow w-12 h-12 rounded-full items-center justify-center mr-3">
                                            <User size={24} color="#143373" weight="regular" />
                                </View>
                                <View className="flex-1">
                                            <Typography variant="headline" weight="semibold" className="text-brand-deepNavy">
                                                {currentStop.childName}
                                    </Typography>
                                            <Typography variant="body" className="text-brand-neutralGray">
                                                {currentStop.address}
                                    </Typography>
                                </View>
                                    <Typography variant="callout" weight="medium" className="text-brand-deepNavy">
                                            {formatDistance(currentStop.legDistanceMeters)}
                                    </Typography>
                            </View>

                                    {/* Action Buttons */}
                                    <View className="space-y-3">
                                    <CustomButton
                                            title="Get Directions"
                                            onPress={handleGetDirections}
                                        size="medium"
                                            bgVariant="outline"
                                        IconLeft={MapTrifold}
                                        fullWidth
                                    />
                                    <CustomButton
                                            title={`Mark as ${currentStop.type === 'PICKUP' ? 'Picked Up' : 'Dropped Off'}`}
                                            onPress={handleMarkAsComplete}
                                        size="medium"
                                        bgVariant="success"
                                        IconLeft={CheckCircle}
                                        fullWidth
                                            disabled={loading}
                                    />
                            </View>
                                </View>

                                {/* Next Stop Preview */}
                                {nextStop && (
                                    <View className="bg-brand-lightGray rounded-xl p-4 mb-4">
                                        <Typography variant="subhead" weight="semibold" className="text-brand-deepNavy mb-2">
                                            Next: {nextStop.type === 'PICKUP' ? 'Pickup' : 'Drop-off'}
                                        </Typography>
                                        <View className="flex-row items-center justify-between">
                                            <View className="flex-1">
                                                <Typography variant="body" className="text-brand-neutralGray">
                                                    {nextStop.childName}
                                                </Typography>
                                                <Typography variant="caption-1" className="text-brand-neutralGray" numberOfLines={1}>
                                                    {nextStop.address}
                                                </Typography>
                                            </View>
                                            <Typography variant="caption-1" className="text-brand-neutralGray">
                                                {formatDistance(nextStop.legDistanceMeters)}
                                            </Typography>
                        </View>
                    </View>
                )}

                                {/* Route Summary */}
                                <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                    <Typography variant="subhead" weight="semibold" className="text-brand-deepNavy mb-3">
                                        Route Summary
                                    </Typography>
                                    <View className="space-y-2">
                                        <View className="flex-row items-center justify-between">
                                            <Typography variant="body" className="text-brand-neutralGray">
                                                Total Stops
                                            </Typography>
                                            <Typography variant="body" weight="semibold" className="text-brand-deepNavy">
                                                {stopList.length}
                                            </Typography>
                                        </View>
                                        <View className="flex-row items-center justify-between">
                                            <Typography variant="body" className="text-brand-neutralGray">
                                                Completed
                                </Typography>
                                            <Typography variant="body" weight="semibold" className="text-success">
                                                {currentStopIndex}
                                </Typography>
                            </View>
                            <View className="flex-row items-center justify-between">
                                            <Typography variant="body" className="text-brand-neutralGray">
                                                Remaining
                                            </Typography>
                                            <Typography variant="body" weight="semibold" className="text-brand-brightOrange">
                                                {stopList.length - currentStopIndex}
                                            </Typography>
                                        </View>
                                        {routeData?.route?.totalDistanceMeters && (
                                            <View className="flex-row items-center justify-between pt-2 border-t border-gray-200">
                                                <Typography variant="body" className="text-brand-neutralGray">
                                                    Total Distance
                                                </Typography>
                                                <Typography variant="body" weight="semibold" className="text-brand-deepNavy">
                                                    {formatDistance(routeData.route.totalDistanceMeters)}
                                                </Typography>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </>
                        ) : (
                            // No more stops
                            <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 items-center">
                                <View className="bg-success p-4 rounded-full mb-4">
                                    <CheckCircle size={48} color="#ffffff" weight="fill" />
                                </View>
                                <Typography variant="title-2" weight="bold" className="text-brand-deepNavy mb-2 text-center">
                                    All Stops Completed!
                                </Typography>
                                <Typography variant="body" className="text-brand-neutralGray text-center">
                                    Great job! You've completed all stops for today.
                                </Typography>
                            </View>
                        )}
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
                                size="medium"
                                fullWidth
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}
