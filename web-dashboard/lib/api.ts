/**
 * API Configuration for connecting to the backend
 * Backend is running on http://localhost:3002
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

/**
 * Simple fetch wrapper for API calls
 */
export async function apiClient(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

/**
 * API endpoints for the admin dashboard
 */
export const api = {
  // Customer endpoints
  customers: {
    getAll: () => apiClient('/customer/all'),
    getById: (id: number) => apiClient(`/customer/${id}`),
    getCounts: () => apiClient('/customer/counts'),
  },
  
  // Driver endpoints
  drivers: {
    getAll: () => apiClient('/driver/all'),
    getById: (id: number) => apiClient(`/driver/${id}`),
  },
  
  // Vehicle endpoints
  vehicles: {
    getAll: () => apiClient('/owner/vehicles'),
  },
};
