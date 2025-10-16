import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GoogleService {
  private readonly logger = new Logger(GoogleService.name);
  private readonly apiKey = process.env.GOOGLE_MAPS_API_KEY;

  async getOptimizedDirections(waypoints: string[]) {
    if (!this.apiKey) {
      this.logger.error('GOOGLE_MAPS_API_KEY is not set');
      throw new Error('Google Maps API key not configured');
    }

    // Build request: use optimize:true and use waypoints param as pipe-separated lat,lng
    // We will let origin and destination be the first and last waypoint by default.
    // To allow optimization we pass all waypoints in the 'waypoints' param with optimize:true

    const params = new URLSearchParams();
    // Using a simple approach: provide origin and destination as the first and last waypoint
    const origin = waypoints[0];
    const destination = waypoints[waypoints.length - 1];

    // intermediate waypoints are all waypoints (Google allows optimize:true with waypoints param)
    const waypointsParam = `optimize:true|${waypoints.join('|')}`;

    params.append('origin', origin);
    params.append('destination', destination);
    params.append('waypoints', waypointsParam);
    params.append('key', this.apiKey);

    const url = `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`;
    this.logger.log(
      `Calling Google Directions API with ${waypoints.length} waypoints`,
    );
    const res = await axios.get(url, { timeout: 15000 });
    return res.data;
  }
}
