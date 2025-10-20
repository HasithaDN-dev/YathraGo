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
    
    // Use /driver/all/:driverId to get ALL payments (not just current month)
    // If filters are provided, use the filtered endpoint
    const endpoint = (filters?.month || filters?.year || filters?.status) 
      ? `driver/${driverId}` 
      : `driver/all/${driverId}`;
    
    const url = `${API_BASE_URL}/transactions/${endpoint}${queryString ? `?${queryString}` : ''}`;

    console.log('Fetching payments from:', url);

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Payment fetch error:', response.status, errorText);
      throw new Error(`Failed to fetch payments: ${response.status} ${response.statusText}`);
    }

    // backend returns an array of DTOs for payments; normalize into PaymentsResponse
    const raw = await response.json();

    const items = Array.isArray(raw) ? raw : [];
    const total = items.length;

    console.log(`Fetched ${total} payment records`);

    return {
      items: items as any,
      total,
      page: 1,
      limit: total || 0,
      totalPages: 1,
    } as PaymentsResponse;
  } catch (error) {
    console.error('Error fetching driver payments:', error);
    throw error;
  }
};

/**
 * Pending confirmation interfaces
 */
export interface PendingConfirmation {
  id: number;
  childId: number;
  driverId: number;
  customerId: number;
  paymentMonth: number;
  paymentYear: number;
  finalPrice: number;
  amountPaid: number;
  paymentStatus: string;
  paymentMethod: string | null;
  dueDate: string;
  Child: {
    child_id: number;
    childFirstName: string;
    childLastName: string;
  };
  Customer: {
    customer_id: number;
    firstName: string;
    lastName: string;
  };
}

export interface AcceptPaymentResponse {
  message: string;
  payment: any;
}

/**
 * Get pending payment confirmations for a driver
 */
export const getPendingConfirmationsApi = async (
  driverId: number
): Promise<PendingConfirmation[]> => {
  try {
    const url = `${API_BASE_URL}/transactions/confirmations-for/${driverId}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch pending confirmations: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching pending confirmations:', error);
    throw error;
  }
};

/**
 * Accept a payment confirmation
 */
export const acceptPaymentConfirmationApi = async (
  paymentId: number,
  driverId: number
): Promise<AcceptPaymentResponse> => {
  try {
    const url = `${API_BASE_URL}/transactions/accept-confirmation/${paymentId}/${driverId}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Failed to accept payment',
      }));
      throw new Error(error.message || 'Failed to accept payment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error accepting payment:', error);
    throw error;
  }
};
