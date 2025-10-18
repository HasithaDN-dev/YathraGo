import AsyncStorage from "@react-native-async-storage/async-storage";

interface ETACache {
  startCityId: number;
  endCityId: number;
  startCity: string;
  endCity: string;
  etaMinutes: number;
  distanceKm: number;
  timestamp: number;
}

const ETA_CACHE_KEY = "driver_route_eta_cache";
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

class ETACacheService {
  /**
   * Get cached ETA data for a driver's route
   */
  async getCachedETA(
    startCityId: number,
    endCityId: number
  ): Promise<ETACache | null> {
    try {
      const cachedData = await AsyncStorage.getItem(ETA_CACHE_KEY);
      if (!cachedData) return null;

      const cache: ETACache = JSON.parse(cachedData);

      // Check if cities match
      if (cache.startCityId !== startCityId || cache.endCityId !== endCityId) {
        // Cities changed, clear cache
        await this.clearCache();
        return null;
      }

      // Check if cache is still valid
      const now = Date.now();
      if (now - cache.timestamp > CACHE_DURATION) {
        // Cache expired
        await this.clearCache();
        return null;
      }

      return cache;
    } catch (error) {
      console.error("Error reading ETA cache:", error);
      return null;
    }
  }

  /**
   * Save ETA data to cache
   */
  async saveETA(data: ETACache): Promise<void> {
    try {
      const cacheData: ETACache = {
        ...data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(ETA_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error("Error saving ETA cache:", error);
    }
  }

  /**
   * Clear the ETA cache
   */
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ETA_CACHE_KEY);
    } catch (error) {
      console.error("Error clearing ETA cache:", error);
    }
  }

  /**
   * Check if cache exists and is valid
   */
  async isCacheValid(startCityId: number, endCityId: number): Promise<boolean> {
    const cache = await this.getCachedETA(startCityId, endCityId);
    return cache !== null;
  }
}

export const etaCacheService = new ETACacheService();
