/**
 * API Configuration
 * Uses environment variables to configure API endpoints
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export { API_BASE_URL };
