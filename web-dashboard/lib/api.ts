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
  // Admin user management endpoints
  admin: {
    getParents: () => apiClient('/admin/users/parents'),
    getStaffPassengers: () => apiClient('/admin/users/staff-passengers'),
    getDrivers: () => apiClient('/admin/users/drivers'),
    getOwners: () => apiClient('/admin/users/owners'),
    getAdmins: () => apiClient('/admin/users/admins'),
    getManagers: () => apiClient('/admin/users/managers'),
    getBackupDrivers: () => apiClient('/admin/users/backup-drivers'),
    getChildren: () => apiClient('/admin/users/children'),
    getWebUsers: () => apiClient('/admin/users/web-users'),
  },

  // Customer endpoints (for customer count)
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
