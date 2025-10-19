import { API_BASE_URL } from "../../config/api";
import { tokenService } from "./token.service";
import { etaCacheService } from "./eta-cache.service";

interface RouteCitiesResponse {
  success: boolean;
  startPoint: string;
  endPoint: string;
  startCityId: number;
  endCityId: number;
  startLatitude?: number;
  startLongitude?: number;
  endLatitude?: number;
  endLongitude?: number;
  etaMinutes?: number;
  distanceKm?: number;
  message?: string;
}

class RouteCitiesService {
  /**
   * Fetch driver route cities with ETA (with caching)
   */
  async getRouteCitiesWithETA(): Promise<RouteCitiesResponse | null> {
    try {
      const authenticatedFetch = tokenService.createAuthenticatedFetch();

      // First, fetch route cities without ETA
      const basicResponse = await authenticatedFetch(
        `${API_BASE_URL}/driver/route-cities`
      );

      if (!basicResponse.ok) {
        console.error("Failed to fetch route cities");
        return null;
      }

      const basicData: RouteCitiesResponse = await basicResponse.json();

      if (!basicData.success) {
        console.error("Route cities not found:", basicData.message);
        return null;
      }

      // Check if we have cached ETA for these cities
      const cachedETA = await etaCacheService.getCachedETA(
        basicData.startCityId,
        basicData.endCityId
      );

      if (cachedETA) {
        // Return cached data
        console.log("Using cached ETA data");
        return {
          ...basicData,
          etaMinutes: cachedETA.etaMinutes,
          distanceKm: cachedETA.distanceKm,
        };
      }

      // No cache or cache expired, fetch fresh ETA
      console.log("Fetching fresh ETA data");
      const etaResponse = await authenticatedFetch(
        `${API_BASE_URL}/driver/route-cities-with-eta`
      );

      if (!etaResponse.ok) {
        console.error("Failed to fetch ETA");
        // Return basic data without ETA
        return basicData;
      }

      const etaData: RouteCitiesResponse = await etaResponse.json();

      if (etaData.success && etaData.etaMinutes && etaData.distanceKm) {
        // Cache the new ETA data
        await etaCacheService.saveETA({
          startCityId: etaData.startCityId,
          endCityId: etaData.endCityId,
          startCity: etaData.startPoint,
          endCity: etaData.endPoint,
          etaMinutes: etaData.etaMinutes,
          distanceKm: etaData.distanceKm,
          timestamp: Date.now(),
        });

        return etaData;
      }

      // Return basic data if ETA calculation failed
      return basicData;
    } catch (error) {
      console.error("Error fetching route cities with ETA:", error);
      return null;
    }
  }

  /**
   * Force refresh ETA (clears cache and fetches new data)
   */
  async refreshETA(): Promise<RouteCitiesResponse | null> {
    try {
      await etaCacheService.clearCache();
      return this.getRouteCitiesWithETA();
    } catch (error) {
      console.error("Error refreshing ETA:", error);
      return null;
    }
  }

  /**
   * Format ETA for display
   */
  formatETA(etaMinutes: number): string {
    if (etaMinutes < 60) {
      return `${etaMinutes} min`;
    }
    const hours = Math.floor(etaMinutes / 60);
    const minutes = etaMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  /**
   * Calculate ETA from current time
   */
  calculateETATime(etaMinutes: number): string {
    const now = new Date();
    const etaTime = new Date(now.getTime() + etaMinutes * 60000);

    return etaTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }
}

export const routeCitiesService = new RouteCitiesService();
