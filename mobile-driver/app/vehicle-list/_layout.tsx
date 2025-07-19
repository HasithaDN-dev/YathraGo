import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { Car, Users, Plus } from 'phosphor-react-native';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';

export default function VehicleListTabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors.tabIconSelected,
                tabBarInactiveTintColor: Colors.tabIconDefault,
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarBackground: TabBarBackground,
                tabBarStyle: Platform.select({
                    ios: {
                        position: 'absolute',
                    },
                    default: {},
                }),
            }}>
            <Tabs.Screen
                name="all-vehicles"
                options={{
                    title: 'All Vehicles',
                    tabBarIcon: ({ color }) => <Car size={28} color={color} weight="fill" />,
                }}
            />
            <Tabs.Screen
                name="assigned-vehicles"
                options={{
                    title: 'Assigned',
                    tabBarIcon: ({ color }) => <Users size={28} color={color} weight="fill" />,
                }}
            />
            <Tabs.Screen
                name="add-vehicle"
                options={{
                    title: 'Add Vehicle',
                    tabBarIcon: ({ color }) => <Plus size={28} color={color} weight="fill" />,
                }}
            />
        </Tabs>
    );
} 