import { Stack } from 'expo-router';

export default function VehicleListLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: true,
                gestureDirection: 'horizontal',
            }}
        >
            <Stack.Screen
                name="all-vehicles"
                options={{
                    title: 'Vehicle List',
                    headerShown: false,
                }}
            />
            {/* Add more vehicle-related screens here as needed */}
            {/* Example:
      <Stack.Screen
        name="vehicle-details"
        options={{
          title: 'Vehicle Details',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="add-vehicle"
        options={{
          title: 'Add Vehicle',
          headerShown: true,
        }}
      />
      */}
        </Stack>
    );
}
