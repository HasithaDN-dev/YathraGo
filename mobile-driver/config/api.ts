/**
 * API configuration for mobile-driver app
 * Uses environment variables to configure API endpoints
 */

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';