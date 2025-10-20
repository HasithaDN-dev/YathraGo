import axios from 'axios';
import { tokenService } from '../services/token.service';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:3000';

export interface CreateRequestParams {
  customerId: number;
  profileType: 'child' | 'staff';
  profileId: number;
  driverId: number;
  vehicleId: number;
  offeredAmount?: number;
  customerNote?: string;
}

export interface CounterOfferParams {
  requestId: number;
  customerId: number;
  amount: number;
  note?: string;
}

export interface NegotiationHistoryItem {
  offeredBy: 'customer' | 'driver';
  amount: number;
  note?: string;
  timestamp: string;
  action?: 'ACCEPT' | 'REJECT' | 'COUNTER';
}

export interface RequestDetails {
  id: number;
  customerID: number;
  customerName: string;
  profileType: 'child' | 'staff';
  profileId: number;
  profileName: string;
  driverId: number;
  driverName: string;
  vehicleInfo: string;
  estimatedDistance: number;
  estimatedPrice: number;
  currentAmount: number;
  status: string;
  customerNote?: string;
  driverNote?: string;
  lastModifiedBy?: string;
  nearestPickupCityName?: string;
  nearestDropCityName?: string;
  negotiationHistory: NegotiationHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export const driverRequestApi = {
  /**
   * Create a new ride request
   */
  createRequest: async (params: CreateRequestParams): Promise<RequestDetails> => {
    try {
      const token = await tokenService.getValidToken();
      const response = await axios.post(
        `${API_URL}/driver-request/create`,
        params,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Create request error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get all requests for a customer
   */
  getCustomerRequests: async (
    customerId: number,
    status?: string
  ): Promise<RequestDetails[]> => {
    try {
      const token = await tokenService.getValidToken();
      const url = status
        ? `${API_URL}/driver-request/customer/${customerId}?status=${status}`
        : `${API_URL}/driver-request/customer/${customerId}`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Get customer requests error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Customer counter offer
   */
  counterOffer: async (params: CounterOfferParams): Promise<RequestDetails> => {
    try {
      const token = await tokenService.getValidToken();
      const response = await axios.post(
        `${API_URL}/driver-request/${params.requestId}/counter-offer`,
        {
          customerId: params.customerId,
          amount: params.amount,
          note: params.note,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Counter offer error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Accept the current offer
   */
  acceptOffer: async (requestId: number, customerId: number): Promise<RequestDetails> => {
    try {
      const token = await tokenService.getValidToken();
      const response = await axios.post(
        `${API_URL}/driver-request/${requestId}/accept`,
        {
          userId: customerId,
          userType: 'customer',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Accept offer error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Reject the request
   */
  rejectRequest: async (
    requestId: number,
    customerId: number,
    reason?: string
  ): Promise<void> => {
    try {
      const token = await tokenService.getValidToken();
      await axios.post(
        `${API_URL}/driver-request/${requestId}/reject`,
        {
          userId: customerId,
          userType: 'customer',
          reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error: any) {
      console.error('Reject request error:', error.response?.data || error.message);
      throw error;
    }
  },
};
