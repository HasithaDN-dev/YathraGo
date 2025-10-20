import axios from 'axios';
import { tokenService } from '../services/token.service';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:3000';

export interface RespondRequestParams {
  requestId: number;
  driverId: number;
  action: 'ACCEPT' | 'REJECT' | 'COUNTER';
  amount?: number;
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
   * Get all requests for a driver
   */
  getDriverRequests: async (
    driverId: number,
    status?: string
  ): Promise<RequestDetails[]> => {
    try {
      const token = await tokenService.getValidToken();
      const url = status
        ? `${API_URL}/driver-request/driver/${driverId}?status=${status}`
        : `${API_URL}/driver-request/driver/${driverId}`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Get driver requests error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Respond to a request (accept/reject/counter)
   */
  respondToRequest: async (params: RespondRequestParams): Promise<RequestDetails> => {
    try {
      const token = await tokenService.getValidToken();
      
      // Backend expects driverId as separate body parameter, not inside dto
      const body: any = {
        driverId: params.driverId, // Separate parameter expected by @Body('driverId', ParseIntPipe)
        action: params.action,
      };
      
      // Add optional fields only if provided
      if (params.amount !== undefined) {
        body.amount = params.amount;
      }
      if (params.note !== undefined) {
        body.note = params.note;
      }
      
      console.log('Sending respond request:', {
        url: `${API_URL}/driver-request/${params.requestId}/respond`,
        body,
      });
      
      const response = await axios.post(
        `${API_URL}/driver-request/${params.requestId}/respond`,
        body,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      // Log detailed error information
      if (error.response) {
        console.error('Respond to request error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        });
      } else {
        console.error('Respond to request error:', error.message);
      }
      throw error;
    }
  },

  /**
   * Assign accepted request to ride table
   */
  assignRequest: async (requestId: number): Promise<void> => {
    try {
      const token = await tokenService.getToken();
      await axios.post(
        `${API_URL}/driver-request/${requestId}/assign`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error: any) {
      console.error('Assign request error:', error.response?.data || error.message);
      throw error;
    }
  },
};
