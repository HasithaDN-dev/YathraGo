// Loads environment variables from mobile-driver/.env and injects them into Expo config
require('dotenv').config();

/**
 * Expo app config - injects Google Maps API key for native builds
 * Copy your key into mobile-driver/.env as EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
 */
module.exports = ({ config }) => {
  return {
    ...config,
    android: {
      ...(config.android || {}),
      config: {
        ...(config.android?.config || {}),
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        },
      },
      permissions: [
        ...(config.android?.permissions || []),
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
        'ACCESS_BACKGROUND_LOCATION',
        'FOREGROUND_SERVICE',
        'FOREGROUND_SERVICE_LOCATION',
      ],
    },
    ios: {
      ...(config.ios || {}),
      config: {
        ...(config.ios?.config || {}),
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
      },
      infoPlist: {
        ...(config.ios?.infoPlist || {}),
        NSLocationAlwaysAndWhenInUseUsageDescription: 'This app needs background location access to track your location and notify you when you reach student pickup/dropoff locations.',
        NSLocationWhenInUseUsageDescription: 'This app needs location access to show your current location and navigate to student locations.',
        UIBackgroundModes: ['location', 'fetch'],
      },
    },
    plugins: [
      ...(config.plugins || []),
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission: 'Allow YathraGo Driver to use your location to track your route and notify you when you reach student locations.',
          locationAlwaysPermission: 'Allow YathraGo Driver to use your location in the background to track your route and notify you when you reach student locations.',
          locationWhenInUsePermission: 'Allow YathraGo Driver to use your location to show your current position.',
        },
      ],
      [
        'expo-notifications',
        {
          icon: './assets/images/notification-icon.png',
          color: '#143373',
          sounds: ['./assets/sounds/notification.wav'],
        },
      ],
    ],
    extra: {
      serverBaseUrl: process.env.SERVER_BASE_URL || 'http://10.0.2.2:3000',
    },
  };
};
