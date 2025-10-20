/* eslint-disable @typescript-eslint/no-unused-vars */
import type { OwnerProfile, Vehicle, Driver, Payment, ApiResponse } from '@/types/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

import { checkAuthStatus, redirectToLogin } from '../auth-utils';

class OwnerApiService {
  private getAuthHeaders() {
    // Check authentication status before making API calls
    const authStatus = checkAuthStatus();
    
    if (!authStatus.isAuthenticated) {
      
      // Clear any invalid tokens
      if (typeof document !== 'undefined') {
        document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
      
      // Redirect to login
      redirectToLogin();
      throw new Error(`Authentication failed: ${authStatus.reason}`);
    }

    const token = authStatus.token;

    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  private async handleResponse(response: Response, operation: string) {
    if (!response.ok) {
      const errorText = await response.text();
      
      if (response.status === 401) {
        // Token might be expired, let the auth system handle it
        throw new Error(`Authentication failed: ${errorText || 'Unauthorized'}`);
      }
      
      throw new Error(`${operation} failed: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  async getProfile(): Promise<OwnerProfile> {
    const response = await fetch(`${API_BASE}/owner/profile`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response, 'Profile fetch');
  }

  async updateProfile(data: Partial<OwnerProfile>): Promise<OwnerProfile> {
    const response = await fetch(`${API_BASE}/owner/update-profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response, 'Profile update');
  }

  async addDriver(data: Partial<Driver>): Promise<Driver> {
    const response = await fetch(`${API_BASE}/owner/add-driver`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response, 'Add driver');
  }

  async addDriverWithFiles(formData: FormData): Promise<Driver> {
    const authHeaders = this.getAuthHeaders();
    // Remove Content-Type header for FormData, let browser set it
    const { 'Content-Type': _, ...headers } = authHeaders;
    
    const response = await fetch(`${API_BASE}/owner/add-driver`, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to add driver' }));
      throw new Error(errorData.message || `Failed to add driver: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  async getDrivers(): Promise<Driver[] | ApiResponse<Driver[]>> {
    const response = await fetch(`${API_BASE}/owner/drivers`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response, 'Fetch drivers');
  }

  async getVehicles(): Promise<Vehicle[] | ApiResponse<Vehicle[]>> {
    const response = await fetch(`${API_BASE}/vehicles`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response, 'Fetch vehicles');
  }

  async addVehicle(data: Partial<Vehicle>): Promise<Vehicle> {
    const response = await fetch(`${API_BASE}/owner/add-vehicle`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response, 'Add vehicle');
  }

  async getPaymentHistory(): Promise<Payment[] | ApiResponse<Payment[]>> {
    const response = await fetch(`${API_BASE}/transactions`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response, 'Fetch payment history');
  }
}

export const ownerApi = new OwnerApiService();