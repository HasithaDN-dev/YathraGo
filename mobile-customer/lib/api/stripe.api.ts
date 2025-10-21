import { tokenService } from '../services/token.service';
import { API_BASE_URL } from '../../config/api';

export interface CreatePaymentIntentRequest {
  childId: number;
  customerId: number;
  paymentIds: number[];
  totalAmount: number;
  description?: string;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

export interface ConfirmPaymentRequest {
  paymentIntentId: string;
}

export interface ConfirmPaymentResponse {
  success: boolean;
  message: string;
  paidPaymentIds: number[];
}

export interface PaymentStatusResponse {
  status: string;
  amount: number;
  currency: string;
  metadata: any;
}

/**
 * Create a Stripe payment intent
 */
export const createPaymentIntentApi = async (
  data: CreatePaymentIntentRequest,
): Promise<CreatePaymentIntentResponse> => {
  try {
    const authenticatedFetch = tokenService.createAuthenticatedFetch();
    const response = await authenticatedFetch('/stripe/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to create payment intent' }));
      throw new Error(errorData.message || 'Failed to create payment intent');
    }

    return response.json();
  } catch (error: any) {
    // Add more context to network errors
    if (error.message?.includes('fetch failed') || error.message?.includes('Network request failed')) {
      throw new Error('Cannot connect to payment server. Please check if the backend is running.');
    }
    throw error;
  }
};

/**
 * Confirm payment after successful Stripe charge
 */
export const confirmPaymentApi = async (
  data: ConfirmPaymentRequest,
): Promise<ConfirmPaymentResponse> => {
  const authenticatedFetch = tokenService.createAuthenticatedFetch();
  const response = await authenticatedFetch('/stripe/confirm-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to confirm payment' }));
    throw new Error(errorData.message || 'Failed to confirm payment');
  }

  return response.json();
};

/**
 * Get payment status
 */
export const getPaymentStatusApi = async (
  paymentIntentId: string,
): Promise<PaymentStatusResponse> => {
  const authenticatedFetch = tokenService.createAuthenticatedFetch();
  const response = await authenticatedFetch(`/stripe/payment-status/${paymentIntentId}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to get payment status' }));
    throw new Error(errorData.message || 'Failed to get payment status');
  }

  return response.json();
};

/**
 * Cancel payment intent
 */
export const cancelPaymentIntentApi = async (paymentIntentId: string): Promise<void> => {
  const authenticatedFetch = tokenService.createAuthenticatedFetch();
  const response = await authenticatedFetch(`/stripe/cancel-payment/${paymentIntentId}`, {
    method: 'POST',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to cancel payment' }));
    throw new Error(errorData.message || 'Failed to cancel payment');
  }
};

/**
 * Get Stripe publishable key (Public endpoint - no auth required)
 */
export const getStripePublishableKeyApi = async (): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/stripe/publishable-key`);

  if (!response.ok) {
    throw new Error('Failed to get Stripe publishable key');
  }

  const data = await response.json();
  return data.publishableKey;
};
