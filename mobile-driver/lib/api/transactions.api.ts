import { API_BASE_URL } from '../../config/api';

export interface ChildPayment {
  id: number;
  rideRequestId: number;
  childId: number;
  driverId: number;
  customerId: number;
  paymentMonth: number;
  paymentYear: number;
  baseMonthlyPrice: number;
  isAdjusted: boolean;
  adjustmentPercent: number | null;
  adjustedPrice: number | null;
  finalPrice: number;
  amountPaid: number;
  paymentStatus: 'NOT_DUE' | 'PENDING' | 'PAID' | 'OVERDUE' | 'GRACE_PERIOD' | 'CANCELLED';
  paymentEvents: {
    type: string;
    date: string;
    amount: number;
    method?: string;
    transactionRef?: string;
  }[];
  dueDate: string;
  gracePeriodEndDate: string | null;
  paymentMethod: string | null;
  transactionRef: string | null;
  carryForwardDue: number;
  Prepaid: number;
  createdAt: string;
  updatedAt: string;
  paymentDate?: string;
}

export interface PaymentFilters {
  status?: string;
  month?: number;
  year?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaymentsResponse {
  items: ChildPayment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getDriverPayments = async (
  driverId: number,
  filters?: PaymentFilters
): Promise<PaymentsResponse> => {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.month) params.append('month', filters.month.toString());
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const url = `${API_BASE_URL}/transactions/driver/${driverId}/payments${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch payments: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching driver payments:', error);
    throw error;
  }
};
