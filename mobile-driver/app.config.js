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
    },
    ios: {
      ...(config.ios || {}),
      config: {
        ...(config.ios?.config || {}),
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
      },
    },
    extra: {
      serverBaseUrl: process.env.SERVER_BASE_URL || 'http://10.0.2.2:3000',
    },
  };
};
