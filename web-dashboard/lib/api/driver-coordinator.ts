const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface StatisticsResponse {
  overview: {
    pendingVerifications: number;
    activeDrivers: number;
    safetyAlerts: number;
    pendingVehicleApprovals: number;
    totalDrivers: number;
    inactiveDrivers: number;
    driversThisMonth: number;
  };
  metrics: {
    verificationRate: string;
    alertsPerDriver: string;
  };
}

import { checkAuthStatus, redirectToLogin } from '../auth-utils';

class DriverCoordinatorApiService {
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

  private async handleResponse<T>(response: Response, operation: string): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      
      if (response.status === 401) {
        throw new Error(`Authentication failed: ${errorText || 'Unauthorized'}`);
      }
      
      throw new Error(`${operation} failed: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  async getStatistics(): Promise<StatisticsResponse> {
    const response = await fetch(`${API_BASE}/driver-coordinator/statistics`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<StatisticsResponse>(response, 'Statistics fetch');
  }

  async getPendingVerifications(page = 1, limit = 10) {
    const response = await fetch(
      `${API_BASE}/driver-coordinator/pending-verifications?page=${page}&limit=${limit}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return this.handleResponse(response, 'Pending verifications fetch');
  }

  async getActiveDrivers(page = 1, limit = 10) {
    const response = await fetch(
      `${API_BASE}/driver-coordinator/active-drivers?page=${page}&limit=${limit}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return this.handleResponse(response, 'Active drivers fetch');
  }

  async getSafetyAlerts(page = 1, limit = 10) {
    const response = await fetch(
      `${API_BASE}/driver-coordinator/safety-alerts?page=${page}&limit=${limit}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return this.handleResponse(response, 'Safety alerts fetch');
  }

  async approveDriver(id: number) {
    const response = await fetch(`${API_BASE}/driver-coordinator/drivers/${id}/approve`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response, 'Driver approval');
  }

  async rejectDriver(id: number, reason: string) {
    const response = await fetch(`${API_BASE}/driver-coordinator/drivers/${id}/reject`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });
    return this.handleResponse(response, 'Driver rejection');
  }
}

export const driverCoordinatorApi = new DriverCoordinatorApiService();
export type { StatisticsResponse };
