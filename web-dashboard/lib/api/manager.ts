const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ManagerStatisticsResponse {
  overview: {
    openComplaints: number;
    inProgressComplaints: number;
    resolvedComplaints: number;
    totalComplaints: number;
    activeDrivers: number;
    totalVehicles: number;
    recentNotices: number;
    recentComplaintsCount: number;
  };
  complaints: {
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
    recentCount: number;
  };
  fleet: {
    activeDrivers: number;
    totalVehicles: number;
  };
  notifications: {
    recentCount: number;
  };
  insights: {
    topComplaintCategories: Array<{
      category: string;
      count: number;
    }>;
  };
}

import { checkAuthStatus, redirectToLogin } from '../auth-utils';

class ManagerApiService {
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

  async getStatistics(): Promise<ManagerStatisticsResponse> {
    const response = await fetch(`${API_BASE}/manager/statistics`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<ManagerStatisticsResponse>(response, 'Statistics fetch');
  }

  async generateReport(
    reportType: string,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<any> {
    const response = await fetch(`${API_BASE}/manager/reports`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        reportType,
        dateFrom,
        dateTo,
      }),
    });
    return this.handleResponse<any>(response, 'Report generation');
  }
}

export const managerApi = new ManagerApiService();
export type { ManagerStatisticsResponse };
