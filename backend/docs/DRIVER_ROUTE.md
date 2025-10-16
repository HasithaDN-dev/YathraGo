# Driver Route Optimization

## Overview

This module provides optimized route generation for drivers using Google Directions API. It reads assigned children from `ChildRideRequest`, builds waypoints from each child's pickup and school coordinates, requests an optimized route from Google, and stores the full response in `DriverRoute` and per-waypoint entries in `RouteWaypoint`.

## Endpoints

- POST /driver-route/optimize/:driverId — Build and save an optimized route for the given driver.
- GET /driver-route/:driverId — Get the latest saved route for the driver.

## Environment

Add your Google Maps API key to the backend `.env` file as:

GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY

The key must have Directions API enabled. Keep this secret and do not commit the `.env` file.

## Frontend

The mobile driver app can call these endpoints. A helper was added at `mobile-driver/lib/api/maps.api.ts`:

- `fetchOptimizedRoute(driverId)` — triggers optimization on the server.
- `getLatestRoute(driverId)` — returns saved route (includes `routeDetails` JSON from Google).
- `decodeOverviewPolyline(overviewPolyline)` — decodes overview_polyline to lat/lng points for rendering.

## Notes

- The server expects children to have `pickupLatitude/pickupLongitude` and `schoolLatitude/schoolLongitude` set.
- The Google Directions response is stored verbatim in `DriverRoute.routeDetails` — you can read `routes[0].overview_polyline.points` to draw a polyline on the client.
- If you want per-segment distances/durations, inspect `routes[0].legs` in the saved JSON.
