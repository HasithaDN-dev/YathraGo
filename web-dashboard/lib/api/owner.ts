/* eslint-disable @typescript-eslint/no-unused-vars */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
}

import { checkAuthStatus, redirectToLogin } from '../auth-utils';

class OwnerApiService {
  private getAuthHeaders() {
    console.log('🔍 Getting auth headers...');
    
    // Check authentication status before making API calls
    const authStatus = checkAuthStatus();
    console.log('🔍 Auth status:', authStatus);
    
    if (!authStatus.isAuthenticated) {
      console.error('❌ Authentication failed:', authStatus.reason);
      
      // Clear any invalid tokens
      if (typeof document !== 'undefined') {
        document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
      
      // Redirect to login
      redirectToLogin();
      throw new Error(`Authentication failed: ${authStatus.reason}`);
    }

    const token = authStatus.token;
    console.log('🔍 Using valid token for request:', token ? token.substring(0, 20) + '...' : 'null');

    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  private async handleResponse(response: Response, operation: string) {
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`${operation} failed:`, response.status, response.statusText, errorText);
      
      if (response.status === 401) {
        // Token might be expired, let the auth system handle it
        throw new Error(`Authentication failed: ${errorText || 'Unauthorized'}`);
      }
      
      throw new Error(`${operation} failed: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  async getProfile() {
    console.log('Fetching owner profile...');
    const response = await fetch(`${API_BASE}/owner/profile`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response, 'Profile fetch');
  }

  async updateProfile(data: unknown) {
    const response = await fetch(`${API_BASE}/owner/update-profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response, 'Profile update');
  }

  async addDriver(data: unknown) {
    const response = await fetch(`${API_BASE}/owner/add-driver`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response, 'Add driver');
  }

  async addDriverWithFiles(formData: FormData) {
    const authHeaders = this.getAuthHeaders();
    // Remove Content-Type header for FormData, let browser set it
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { 'Content-Type': _, ...headers } = authHeaders;
    
    console.log('Sending request to add driver with headers:', headers);
    
    const response = await fetch(`${API_BASE}/owner/add-driver`, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to add driver' }));
      console.error('Error response:', errorData);
      throw new Error(errorData.message || `Failed to add driver: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  async getDrivers() {
    const response = await fetch(`${API_BASE}/owner/drivers`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response, 'Fetch drivers');
  }

  async getVehicles() {
    const response = await fetch(`${API_BASE}/vehicles`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response, 'Fetch vehicles');
  }

  async addVehicle(data: unknown) {
    const response = await fetch(`${API_BASE}/owner/add-vehicle`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response, 'Add vehicle');
  }

  async getPaymentHistory() {
    const response = await fetch(`${API_BASE}/transactions`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response, 'Fetch payment history');
  }
}

export const ownerApi = new OwnerApiService();