import { API_BASE_URL } from '../../config/api';
import { useAuthStore } from '../stores/auth.store';

interface TokenValidationResponse {
  valid: boolean;
  user: any;
  message: string;
}

interface TokenRefreshResponse {
  accessToken: string;
  user: any;
}

class TokenService {
  private static instance: TokenService;
  private refreshPromise: Promise<string> | null = null;

  static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  /**
   * Validates the current token with the backend
   */
  async validateToken(token: string): Promise<TokenValidationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/customer/validate-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Token validation failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Token validation error:', error);
      throw error;
    }
  }

  /**
   * Refreshes the token using the refresh token
   */
  async refreshToken(token: string): Promise<TokenRefreshResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/customer/refresh-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  /**
   * Gets a valid token, refreshing if necessary
   * Uses a promise to prevent multiple simultaneous refresh requests
   */
  async getValidToken(): Promise<string> {
    const { accessToken, refreshToken: refreshTokenAction } = useAuthStore.getState();

    if (!accessToken) {
      throw new Error('No access token available');
    }

    // If there's already a refresh in progress, wait for it
    if (this.refreshPromise) {
      return await this.refreshPromise;
    }

    try {
      // First, try to validate the current token
      const validation = await this.validateToken(accessToken);
      
      if (validation.valid) {
        return accessToken;
      }

      // Token is invalid, refresh it
      this.refreshPromise = this.performTokenRefresh(accessToken);
      const newToken = await this.refreshPromise;
      this.refreshPromise = null;
      return newToken;
    } catch (error) {
      this.refreshPromise = null;
      throw error;
    }
  }

  /**
   * Performs the actual token refresh
   */
  private async performTokenRefresh(token: string): Promise<string> {
    try {
      const response = await this.refreshToken(token);
      const { refreshToken: refreshTokenAction } = useAuthStore.getState();
      
      // Update the store with the new token
      refreshTokenAction(response.accessToken);
      
      return response.accessToken;
    } catch (error) {
      // If refresh fails, logout the user
      const { logout } = useAuthStore.getState();
      await logout();
      throw error;
    }
  }

  /**
   * Creates an authenticated fetch function that automatically handles token refresh
   */
  createAuthenticatedFetch() {
    return async (url: string, options: RequestInit = {}): Promise<Response> => {
      const token = await this.getValidToken();
      
      const authenticatedOptions: RequestInit = {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
        },
      };

      const response = await fetch(url, authenticatedOptions);

      // If we get a 401, try to refresh the token and retry once
      if (response.status === 401) {
        try {
          const newToken = await this.getValidToken();
          const retryOptions: RequestInit = {
            ...options,
            headers: {
              ...options.headers,
              'Authorization': `Bearer ${newToken}`,
            },
          };
          return await fetch(url, retryOptions);
        } catch (refreshError) {
          // If refresh fails, return the original 401 response
          return response;
        }
      }

      return response;
    };
  }
}

export const tokenService = TokenService.getInstance(); 