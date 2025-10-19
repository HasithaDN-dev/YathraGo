# Improved Driver Search Algorithm - Point-to-Line Distance

## Overview
The driver search algorithm has been completely rewritten to use **point-to-line distance calculations** instead of simple point-to-point (city center) distance checks. This provides much more accurate matching of drivers to customer trips.

## Why the Change?

### Old Algorithm (Inaccurate)
❌ Only checked if city centers were within radius of pickup/drop  
❌ Didn't consider the actual route path  
❌ Could match drivers whose route didn't actually pass near customer  
❌ No verification that drop-off comes after pickup  

### New Algorithm (Accurate)
✅ Calculates distance from customer points to actual route segments  
✅ Considers the driver's full route path  
✅ Ensures drop-off segment comes after pickup segment  
✅ Uses proper geospatial calculations with Turf.js  

## How It Works

### 1. Route Representation
Driver routes are represented as **polylines** (sequences of connected line segments between cities):

```
Driver Route: City A → City B → City C → City D

Route Polyline:
Segment 1: A ━━━━━ B
Segment 2:        B ━━━━━ C
Segment 3:               C ━━━━━ D
```

### 2. Point-to-Line Distance Calculation

For each customer location (pickup and drop-off):
1. **Find nearest segment**: Calculate perpendicular distance from the point to each route segment
2. **Get minimum distance**: Select the segment with the shortest distance
3. **Check threshold**: Verify distance is within acceptable range (≤ 10 km)

```typescript
// Customer Pickup Point
      ↓
      P
      |
      | ← Perpendicular distance (3 km)
      |
A ━━━━━━━━━━━━━━━ B
```

### 3. Route Direction Validation

The algorithm ensures the driver is traveling in the correct direction:

```
✅ CORRECT: Pickup segment before drop segment
Route: A → B → C → D
       ↓pickup    ↓drop
      (segment 0) (segment 2)

❌ WRONG: Drop segment before pickup segment
Route: A → B → C → D
       ↓drop      ↓pickup
      (segment 0) (segment 2)
```

## Algorithm Steps

```typescript
for each driver:
  1. Build route polyline from ordered city coordinates
  
  2. Find nearest segment to pickup point
     - Calculate distance from pickup to each route segment
     - Keep track of minimum distance and segment index
  
  3. Find nearest segment to drop-off point
     - Calculate distance from drop to each route segment
     - Keep track of minimum distance and segment index
  
  4. Validate route suitability:
     ✓ Pickup distance ≤ 10 km from route
     ✓ Drop distance ≤ 10 km from route
     ✓ Drop segment index > Pickup segment index
  
  5. If suitable, add to results with actual distances
```

## Implementation Details

### Libraries Used
- **@turf/turf**: Industry-standard geospatial analysis library
  - `turf.point()`: Create point geometries
  - `turf.lineString()`: Create line geometries
  - `turf.pointToLineDistance()`: Calculate perpendicular distance

### Key Functions

#### 1. `pointToLineDistance()`
```typescript
private pointToLineDistance(
  point: [number, number],           // [longitude, latitude]
  lineSegment: [[number, number], [number, number]],
): number {
  const turfPoint = turf.point(point);
  const turfLine = turf.lineString(lineSegment);
  const distance = turf.pointToLineDistance(turfPoint, turfLine, {
    units: 'kilometers',
  });
  return distance;
}
```

#### 2. `findNearestSegment()`
```typescript
private findNearestSegment(
  point: [number, number],
  routeCoordinates: [number, number][],
): {
  segmentIndex: number;    // Which segment is nearest
  distance: number;        // Distance to that segment (km)
  isNearRoute: boolean;    // Within 10km threshold
}
```

#### 3. `isRouteSuitableForTrip()`
```typescript
private isRouteSuitableForTrip(
  pickupPoint: [number, number],
  dropPoint: [number, number],
  routeCoordinates: [number, number][],
  maxDistanceKm: number = 10,
): {
  isSuitable: boolean;      // Overall suitability
  pickupDistance: number;   // km from pickup to route
  dropDistance: number;     // km from drop to route
  pickupSegment: number;    // Segment index for pickup
  dropSegment: number;      // Segment index for drop
}
```

## Example Scenario

### Customer Request
- **Pickup**: Latitude 6.8649, Longitude 79.8997 (Nugegoda area)
- **Drop-off**: Latitude 6.9271, Longitude 79.8612 (Colombo area)

### Driver Route
Cities: Maharagama → Nugegoda → Dehiwala → Colombo

Coordinates:
- Maharagama: [79.9267, 6.8484]
- Nugegoda: [79.8997, 6.8649]
- Dehiwala: [79.8713, 6.8532]
- Colombo: [79.8612, 6.9271]

### Algorithm Processing

```
Step 1: Build route segments
  Segment 0: Maharagama → Nugegoda
  Segment 1: Nugegoda → Dehiwala
  Segment 2: Dehiwala → Colombo

Step 2: Find nearest segment to pickup (Nugegoda area)
  Distance to Segment 0: 0.3 km ✓
  Distance to Segment 1: 0.5 km
  Distance to Segment 2: 2.1 km
  → Nearest: Segment 0 (0.3 km)

Step 3: Find nearest segment to drop (Colombo area)
  Distance to Segment 0: 4.2 km
  Distance to Segment 1: 3.1 km
  Distance to Segment 2: 0.2 km ✓
  → Nearest: Segment 2 (0.2 km)

Step 4: Validate suitability
  ✓ Pickup distance (0.3 km) ≤ 10 km
  ✓ Drop distance (0.2 km) ≤ 10 km
  ✓ Drop segment (2) > Pickup segment (0)
  
Result: ✅ MATCH - Driver is suitable for this trip
```

## Benefits of New Algorithm

### 1. **Accuracy**
- Measures actual distance to route path, not just city centers
- Handles routes that curve or take indirect paths

### 2. **Direction Awareness**
- Ensures driver is traveling in the right direction
- Prevents matching drivers going the opposite way

### 3. **Flexibility**
- Works with routes of any length (2+ cities)
- Handles irregular route shapes

### 4. **Real-world Applicability**
- Customers can be anywhere along the route, not just at city centers
- More matches for customers in between cities

## Configuration

### Adjustable Parameters

```typescript
const RADIUS_KM = 10; // Maximum distance from route (in km)
```

You can adjust this threshold based on:
- Urban vs rural areas
- Service coverage requirements
- Driver flexibility

### Minimum Route Requirements

```typescript
if (driverCity.cityIds.length < 2) {
  continue; // Need at least 2 cities to form a route
}
```

## Performance Considerations

### Computational Complexity
- **Per driver**: O(n) where n = number of cities in route
- **Overall**: O(d × c) where d = drivers, c = cities per route
- **Typical**: ~20 drivers × 5 cities = 100 segment checks

### Optimization Opportunities
1. **Spatial indexing**: Use R-tree for large driver sets
2. **Caching**: Cache route geometries
3. **Early termination**: Stop checking if first segment exceeds threshold

## Testing

### Test Case 1: Direct Route Match
```sql
-- Customer: Nugegoda to Colombo
-- Driver route: Maharagama → Nugegoda → Dehiwala → Colombo
-- Expected: MATCH (on route)
```

### Test Case 2: Wrong Direction
```sql
-- Customer: Colombo to Nugegoda
-- Driver route: Maharagama → Nugegoda → Dehiwala → Colombo
-- Expected: NO MATCH (drop before pickup)
```

### Test Case 3: Too Far from Route
```sql
-- Customer: Kandy to Galle
-- Driver route: Maharagama → Nugegoda → Colombo
-- Expected: NO MATCH (both points > 10km from route)
```

### Test Case 4: Parallel Route
```sql
-- Customer: Pickup and drop both near highway
-- Driver route: Follows parallel road
-- Expected: Depends on actual distance (likely NO MATCH if > 10km)
```

## API Response

The API now returns **actual distances** to the route:

```json
{
  "driverId": 1,
  "driverName": "John Doe",
  "vehicleType": "Van",
  "startCity": "Maharagama",
  "endCity": "Colombo",
  "routeCities": ["Maharagama", "Nugegoda", "Dehiwala", "Colombo"],
  "distanceFromPickup": 0.3,    // km from pickup to nearest route segment
  "distanceFromDrop": 0.2,      // km from drop to nearest route segment
  "estimatedPickupTime": "06:00",
  "estimatedDropTime": "16:00"
}
```

## Migration from Old Algorithm

### What Changed
- ❌ Removed: Simple city-center distance checks
- ❌ Removed: `calculateDistance()` helper (Haversine)
- ❌ Removed: `deg2rad()` helper
- ✅ Added: `pointToLineDistance()` using Turf.js
- ✅ Added: `findNearestSegment()` for route analysis
- ✅ Added: `isRouteSuitableForTrip()` for validation

### Data Requirements (Unchanged)
- Customer must have pickup/drop coordinates
- Driver must have DriverCities with cityIds array
- Cities must be in correct order in the route
- City table must have latitude/longitude

## Future Enhancements

1. **Road Network**: Use actual road network instead of straight lines
2. **Traffic Awareness**: Consider traffic patterns and travel times
3. **Multi-route Support**: Support drivers with multiple routes
4. **Dynamic Routing**: Integrate with Google Directions API
5. **Weighted Matching**: Prefer closer routes over distant ones
6. **Time Windows**: Consider driver's actual operating hours

## Conclusion

The new point-to-line distance algorithm provides significantly more accurate driver matching by:
- Considering the actual route path, not just city centers
- Validating travel direction (pickup before drop)
- Returning real distances for customer decision-making

This results in better matches, happier customers, and more efficient ride assignments.
