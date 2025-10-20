/* eslint-disable @typescript-eslint/no-explicit-any */
// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Generic API call function
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);

    // Handle non-OK responses
    if (!response.ok) {
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If JSON parsing fails, use the default error message
      }
      
      throw new Error(errorMessage);
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    } else {
      // Return empty object for non-JSON responses
      return {} as T;
    }
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    
    // Re-throw with more context
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to fetch from ${endpoint}`);
  }
}

// Complaints API
export const complaintsApi = {
  getAll: (params?: {
    status?: string;
    type?: string;
    category?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryString = new URLSearchParams(
      Object.entries(params || {}).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    return apiCall<{
      data: any[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>(`/complaints?${queryString}`);
  },

  getStatistics: () =>
    apiCall<{
      overview: {
        total: number;
        pending: number;
        inProgress: number;
        resolved: number;
      };
      byCategory: Array<{ category: string; count: number }>;
      byType: Array<{ type: string; count: number }>;
      recent: any[];
    }>('/complaints/statistics'),

  getById: (id: number) => apiCall<any>(`/complaints/${id}`),

  create: (data: any) =>
    apiCall<any>('/complaints', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: any) =>
    apiCall<any>(`/complaints/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: number, status: string) =>
    apiCall<any>(`/complaints/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  delete: (id: number) =>
    apiCall<void>(`/complaints/${id}`, {
      method: 'DELETE',
    }),
};

// Payments API
export const paymentsApi = {
  getAll: (params?: {
    driverId?: number;
    customerId?: number;
    childId?: number;
    status?: string;
    paymentMonth?: number;
    paymentYear?: number;
    page?: number;
    limit?: number;
  }) => {
    const queryString = new URLSearchParams(
      Object.entries(params || {}).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    return apiCall<{
      data: any[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>(`/payments?${queryString}`);
  },

  getStatistics: () =>
    apiCall<{
      overview: {
        total: number;
        pending: number;
        paid: number;
        overdue: number;
      };
      revenue: {
        today: number;
        thisMonth: number;
      };
    }>('/payments/statistics'),

  getById: (id: number) => apiCall<any>(`/payments/${id}`),

  create: (data: any) =>
    apiCall<any>('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  verify: (id: number, verifiedBy: number) =>
    apiCall<any>(`/payments/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ verifiedBy }),
    }),

  markAsPaid: (id: number, amount: number, transactionRef?: string) =>
    apiCall<any>(`/payments/${id}/mark-paid`, {
      method: 'PATCH',
      body: JSON.stringify({ amount, transactionRef }),
    }),
};

// Payouts API
export const payoutsApi = {
  getPending: () => apiCall<any[]>('/payments/payouts/pending'),

  getDriverHistory: (driverId: number, limit?: number) => {
    const query = limit ? `?limit=${limit}` : '';
    return apiCall<any[]>(`/payments/payouts/driver/${driverId}${query}`);
  },

  calculate: (driverId: number, month: number, year: number) =>
    apiCall<{
      driverId: number;
      month: number;
      year: number;
      totalTrips: number;
      totalRevenue: number;
      platformFee: number;
      driverEarnings: number;
      payments: any[];
    }>('/payments/payouts/calculate', {
      method: 'POST',
      body: JSON.stringify({ driverId, month, year }),
    }),

  approve: (data: {
    driverId: number;
    paymentMonth: number;
    paymentYear: number;
    payoutAmount: number;
    bankAccount?: string;
    paymentMethod?: string;
    notes?: string;
  }) =>
    apiCall<any>('/payments/payouts/approve', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Refunds API
export const refundsApi = {
  getAll: (params?: { page?: number; limit?: number; status?: string }) => {
    const queryString = new URLSearchParams(
      Object.entries(params || {}).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    return apiCall<{
      data: any[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>(`/payments/refunds?${queryString}`);
  },

  getStatistics: () =>
    apiCall<{
      overview: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
      };
      totalRefundAmount: number;
    }>('/payments/refunds/statistics'),

  getById: (id: number) => apiCall<any>(`/payments/refunds/${id}`),

  request: (data: {
    paymentId: number;
    childId: number;
    customerId: number;
    driverId: number;
    refundAmount: number;
    refundReason: string;
    refundType: string;
    requestedBy: number;
    requestedByType: string;
  }) =>
    apiCall<any>('/payments/refunds', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  approve: (
    id: number,
    approverId: number,
    approverType: string,
    refundMethod?: string,
    transactionRef?: string
  ) =>
    apiCall<any>(`/payments/refunds/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({
        approverId,
        approverType,
        refundMethod,
        transactionRef,
      }),
    }),

  reject: (id: number, rejectorId: number, rejectionReason: string) =>
    apiCall<any>(`/payments/refunds/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ rejectorId, rejectionReason }),
    }),
};

// Driver Coordinator API
export const driverCoordinatorApi = {
  getStatistics: () =>
    apiCall<{
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
    }>('/driver-coordinator/statistics'),

  getPendingVerifications: (page = 1, limit = 10) =>
    apiCall<{
      data: any[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>(`/driver-coordinator/pending-verifications?page=${page}&limit=${limit}`),

  getActiveDrivers: (page = 1, limit = 10) =>
    apiCall<{
      data: any[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>(`/driver-coordinator/active-drivers?page=${page}&limit=${limit}`),

  getSafetyAlerts: (page = 1, limit = 10) =>
    apiCall<{
      data: any[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>(`/driver-coordinator/safety-alerts?page=${page}&limit=${limit}`),

  approveDriver: (driverId: number) =>
    apiCall<{ success: boolean; message: string; driver: any }>(
      `/driver-coordinator/drivers/${driverId}/approve`,
      { method: 'POST' }
    ),

  rejectDriver: (driverId: number, reason: string) =>
    apiCall<{ success: boolean; message: string; driver: any }>(
      `/driver-coordinator/drivers/${driverId}/reject`,
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }
    ),
};

// Export all APIs
export const api = {
  complaints: complaintsApi,
  payments: paymentsApi,
  payouts: payoutsApi,
  refunds: refundsApi,
  driverCoordinator: driverCoordinatorApi,
};

export default api;
