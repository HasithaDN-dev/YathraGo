import type {
  Complaint,
  ComplaintQueryParams,
  ComplaintStatistics,
  Payment,
  PaymentQueryParams,
  PaymentStatistics,
  Payout,
  PayoutCalculation,
  PayoutApprovalData,
  Refund,
  RefundRequestData,
  RefundQueryParams,
  RefundStatistics,
  DriverCoordinatorStatistics,
  Driver,
  Vehicle,
  PaginatedResponse,
} from '@/types/api';

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
    // Re-throw with more context
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to fetch from ${endpoint}`);
  }
}

// Complaints API
export const complaintsApi = {
  getAll: (params?: ComplaintQueryParams) => {
    const queryString = new URLSearchParams(
      Object.entries(params || {}).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    return apiCall<PaginatedResponse<Complaint>>(`/complaints?${queryString}`);
  },

  getStatistics: () => apiCall<ComplaintStatistics>('/complaints/statistics'),

  getById: (id: number) => apiCall<Complaint>(`/complaints/${id}`),

  create: (data: Partial<Complaint>) =>
    apiCall<Complaint>('/complaints', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<Complaint>) =>
    apiCall<Complaint>(`/complaints/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: number, status: string) =>
    apiCall<Complaint>(`/complaints/${id}/status`, {
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
  getAll: (params?: PaymentQueryParams) => {
    const queryString = new URLSearchParams(
      Object.entries(params || {}).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    return apiCall<PaginatedResponse<Payment>>(`/payments?${queryString}`);
  },

  getStatistics: () => apiCall<PaymentStatistics>('/payments/statistics'),

  getById: (id: number) => apiCall<Payment>(`/payments/${id}`),

  create: (data: Partial<Payment>) =>
    apiCall<Payment>('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  verify: (id: number, verifiedBy: number) =>
    apiCall<Payment>(`/payments/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ verifiedBy }),
    }),

  markAsPaid: (id: number, amount: number, transactionRef?: string) =>
    apiCall<Payment>(`/payments/${id}/mark-paid`, {
      method: 'PATCH',
      body: JSON.stringify({ amount, transactionRef }),
    }),
};

// Payouts API
export const payoutsApi = {
  getPending: () => apiCall<Payout[]>('/payments/payouts/pending'),

  getDriverHistory: (driverId: number, limit?: number) => {
    const query = limit ? `?limit=${limit}` : '';
    return apiCall<Payout[]>(`/payments/payouts/driver/${driverId}${query}`);
  },

  calculate: (driverId: number, month: number, year: number) =>
    apiCall<PayoutCalculation>('/payments/payouts/calculate', {
      method: 'POST',
      body: JSON.stringify({ driverId, month, year }),
    }),

  approve: (data: PayoutApprovalData) =>
    apiCall<Payout>('/payments/payouts/approve', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Refunds API
export const refundsApi = {
  getAll: (params?: RefundQueryParams) => {
    const queryString = new URLSearchParams(
      Object.entries(params || {}).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    return apiCall<PaginatedResponse<Refund>>(`/payments/refunds?${queryString}`);
  },

  getStatistics: () => apiCall<RefundStatistics>('/payments/refunds/statistics'),

  getById: (id: number) => apiCall<Refund>(`/payments/refunds/${id}`),

  request: (data: RefundRequestData) =>
    apiCall<Refund>('/payments/refunds', {
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
    apiCall<Refund>(`/payments/refunds/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({
        approverId,
        approverType,
        refundMethod,
        transactionRef,
      }),
    }),

  reject: (id: number, rejectorId: number, rejectionReason: string) =>
    apiCall<Refund>(`/payments/refunds/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ rejectorId, rejectionReason }),
    }),
};

// Driver Coordinator API
export const driverCoordinatorApi = {
  getStatistics: () => apiCall<DriverCoordinatorStatistics>('/driver-coordinator/statistics'),

  getPendingVerifications: (page = 1, limit = 10) =>
    apiCall<PaginatedResponse<Driver>>(`/driver-coordinator/pending-verifications?page=${page}&limit=${limit}`),

  getActiveDrivers: (page = 1, limit = 10) =>
    apiCall<PaginatedResponse<Driver>>(`/driver-coordinator/active-drivers?page=${page}&limit=${limit}`),

  getSafetyAlerts: (page = 1, limit = 10) =>
    apiCall<PaginatedResponse<Driver>>(`/driver-coordinator/safety-alerts?page=${page}&limit=${limit}`),

  approveDriver: (driverId: number) =>
    apiCall<{ success: boolean; message: string; driver: Driver }>(
      `/driver-coordinator/drivers/${driverId}/approve`,
      { method: 'POST' }
    ),

  rejectDriver: (driverId: number, reason: string) =>
    apiCall<{ success: boolean; message: string; driver: Driver }>(
      `/driver-coordinator/drivers/${driverId}/reject`,
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }
    ),

  getPendingVehicles: (page = 1, limit = 10) =>
    apiCall<{ success: boolean; data: Vehicle[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(
      `/driver-coordinator/pending-vehicles?page=${page}&limit=${limit}`
    ),

  approveVehicle: (vehicleId: number) =>
    apiCall<{ success: boolean; message: string; vehicle: Vehicle }>(
      `/driver-coordinator/vehicles/${vehicleId}/approve`,
      { method: 'POST' }
    ),

  rejectVehicle: (vehicleId: number, reason: string) =>
    apiCall<{ success: boolean; message: string; vehicle: Vehicle; reason: string }>(
      `/driver-coordinator/vehicles/${vehicleId}/reject`,
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }
    ),

  // Inquiries
  getInquiries: (page = 1, limit = 10, status?: string, category?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.append('status', status);
    if (category) params.append('category', category);
    return apiCall<{
      success: boolean;
      data: Array<Complaint & { driverInfo: { driver_id: number; name: string; phone: string; email: string; vehicle_Reg_No: string } }>;
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/driver-coordinator/inquiries?${params.toString()}`);
  },

  getInquiryStatistics: () =>
    apiCall<{
      success: boolean;
      overview: { total: number; pending: number; inProgress: number; resolved: number };
      byCategory: Array<{ category: string; count: number }>;
      byType: Array<{ type: string; count: number }>;
    }>('/driver-coordinator/inquiries/statistics'),

  updateInquiryStatus: (id: number, status: string) =>
    apiCall<{ success: boolean; message: string; data: Complaint }>(
      `/driver-coordinator/inquiries/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
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
