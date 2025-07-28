import { Stack } from 'expo-router';

export default function HomeLinksLayout() {
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
                name="inform"
                options={{
                    title: 'Infrom',
                    headerShown: false,
                }}
            />
         
        </Stack>
    );
}
