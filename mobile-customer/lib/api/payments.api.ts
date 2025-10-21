import { API_BASE_URL } from '../../config/api';
import { tokenService } from '../services/token.service';

/**
 * Payment API functions for physical payment flow
 */

export interface PaymentMonth {
  id: number; // Payment record ID
  year: number;
  month: number;
  paymentStatus: string;
  amountDue: number; // Amount to be paid
}

export interface PayableMonthsResponse {
  months: PaymentMonth[];
  currentMonth: {
    year: number;
    month: number;
    paymentStatus: string;
  };
}

export interface SubmitMonthsPayload {
  childId: number;
  months: {
    year: number;
    month: number;
  }[];
}

export interface SubmitMonthsResponse {
  message: string;
}

/**
 * Get the next 5 months with payment status for a child
 */
export const getPayableMonthsApi = async (childId: number): Promise<PayableMonthsResponse> => {
  const authenticatedFetch = tokenService.createAuthenticatedFetch();
  
  const response = await authenticatedFetch(
    `${API_BASE_URL}/transactions/payable-months/${childId}`
  );
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      message: 'Failed to fetch payable months' 
    }));
    throw new Error(error.message || 'Failed to fetch payable months');
  }
  
  return await response.json();
};

/**
 * Submit selected months for physical payment confirmation
 */
export const submitMonthsForPaymentApi = async (
  payload: SubmitMonthsPayload
): Promise<SubmitMonthsResponse> => {
  const authenticatedFetch = tokenService.createAuthenticatedFetch();
  
  const response = await authenticatedFetch(
    `${API_BASE_URL}/transactions/submit-for-confirmation`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      message: 'Failed to submit payment' 
    }));
    throw new Error(error.message || 'Failed to submit payment');
  }
  
  return await response.json();
};

/**
 * Payment history interfaces
 */
export interface PaymentHistoryItem {
  id: number;
  month: number;
  year: number;
  amount: number;
  baseAmount: number;
  status: string;
  paymentMethod: string | null;
  paymentDate: string;
  dueDate: string | null;
  driverName: string | null;
}

/**
 * Get payment history for a child
 */
export const getPaymentHistoryApi = async (childId: number): Promise<PaymentHistoryItem[]> => {
  const authenticatedFetch = tokenService.createAuthenticatedFetch();
  
  const response = await authenticatedFetch(
    `${API_BASE_URL}/transactions/payment-history/${childId}`
  );
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      message: 'Failed to fetch payment history' 
    }));
    throw new Error(error.message || 'Failed to fetch payment history');
  }
  
  return await response.json();
};
