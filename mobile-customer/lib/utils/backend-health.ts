/**
 * Backend Health Check Utility
 * Checks if the backend server is reachable
 */

import { API_BASE_URL } from '../../config/api';

export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.log('Backend health check failed:', error);
    return false;
  }
};

export const checkBackendHealthWithAlert = async (): Promise<boolean> => {
  const isHealthy = await checkBackendHealth();
  
  if (!isHealthy) {
    console.warn('⚠️ Backend server is not responding. Please start the backend server.');
  }
  
  return isHealthy;
};
