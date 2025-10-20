import * as SecureStore from "expo-secure-store";

class TokenService {
  private tokenKey = "driver-auth-token";

  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(this.tokenKey);
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  }

  /**
   * Get a valid token (alias for getToken for consistency with customer app)
   */
  async getValidToken(): Promise<string> {
    const token = await this.getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }
    return token;
  }

  async setToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.tokenKey, token);
    } catch (error) {
      console.error("Error setting token:", error);
      throw error;
    }
  }

  async removeToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(this.tokenKey);
    } catch (error) {
      console.error("Error removing token:", error);
      throw error;
    }
  }

  async isTokenValid(): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) return false;

      // Basic JWT validation (check if token is not expired)
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;

      return payload.exp > currentTime;
    } catch (error) {
      console.error("Error validating token:", error);
      return false;
    }
  }

  /**
   * Decode JWT token and extract driver ID
   */
  async getDriverIdFromToken(): Promise<number | null> {
    try {
      const token = await this.getToken();
      if (!token) return null;

      const payload = JSON.parse(atob(token.split(".")[1]));
      // The 'sub' field contains the driver_id
      return payload.sub ? parseInt(payload.sub, 10) : null;
    } catch (error) {
      console.error("Error extracting driver ID from token:", error);
      return null;
    }
  }

  /**
   * Decode JWT token and get full payload
   */
  async getTokenPayload(): Promise<any | null> {
    try {
      const token = await this.getToken();
      if (!token) return null;

      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload;
    } catch (error) {
      console.error("Error decoding token payload:", error);
      return null;
    }
  }

  createAuthenticatedFetch() {
    return async (url: string, options: RequestInit = {}) => {
      const token = await this.getToken();

      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });

      return response;
    };
  }

  async refreshToken(): Promise<string | null> {
    try {
      const token = await this.getToken();
      if (!token) return null;

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/driver/refresh-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const newToken = data.accessToken;
        await this.setToken(newToken);
        return newToken;
      }

      return null;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return null;
    }
  }
}

export const tokenService = new TokenService();
