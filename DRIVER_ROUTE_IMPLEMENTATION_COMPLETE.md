# Complete Driver Routing System Implementation

This document describes the comprehensive driver routing system implementation based on the provided guide. The system implements dynamic attendance-based route optimization with a sequential stop workflow.

## Overview

The system follows the classic delivery/transport app pattern where the driver works through an ordered list of stops (pickups and dropoffs) that is dynamically generated based on who is present each day.

## Architecture

### 1. Data Models (Prisma Schema)

#### DriverRoute

Represents a daily route for a driver. Each driver can have multiple routes per day (e.g., morning pickup, afternoon dropoff).

```prisma
model DriverRoute {
  id                  Int             @id @default(autoincrement())
  driverId            Int
  date                DateTime        @db.Date
  routeType           String          // MORNING_PICKUP, AFTERNOON_DROPOFF
  status              String          // PENDING, IN_PROGRESS, COMPLETED
  totalDistanceMeters Int?
  totalDurationSecs   Int?
  optimizedPolyline   String?
  startedAt           DateTime?
  completedAt         DateTime?
  stops               RouteStop[]
}
```

#### RouteStop

Represents an individual stop in the route (either a pickup or dropoff).

```prisma
model RouteStop {
  id                       Int          @id @default(autoincrement())
  driverRouteId            Int
  childId                  Int
  order                    Int          // Sequential order in route
  type                     WaypointType // PICKUP or DROPOFF
  address                  String
  latitude                 Float
  longitude                Float
  etaSecs                  Int?
  legDistanceMeters        Int?
  status                   StopStatus   // PENDING, ARRIVED, COMPLETED, SKIPPED
  arrivedAt                DateTime?
  completedAt              DateTime?
}
```

#### Attendance

Enhanced to track daily attendance with unique constraint per driver-child-date-type.

```prisma
model Attendance {
  id         Int      @id @default(autoincrement())
  driverId   Int
  childId    Int
  date       DateTime @db.Date
  type       String   // "pickup" or "dropoff"
  status     String
  timestamp  DateTime

  @@unique([driverId, childId, date, type])
}
```

### 2. Backend Service (DriverRouteService)

The service handles all route generation and optimization logic.

#### Key Methods

##### `getTodaysRoute(driverId, routeType, driverLatitude, driverLongitude)`

This is the main method called when a driver starts a ride. It:

1. **Checks for existing route**: If a route already exists for today and is not completed, returns it
2. **Fetches assigned children**: Gets all children with confirmed ride requests (status = 'Assigned')
3. **Filters by attendance**: Excludes children marked absent in the Absence_Child table
4. **Generates stops**: Creates pickup and dropoff stops based on route type:
   - **Morning Pickup**: Pickup each child from home → Drop all at school
   - **Afternoon Dropoff**: Pickup all from school → Drop each at home
5. **Optimizes route**: Uses Google Maps Distance Matrix API + greedy algorithm to find optimal order
6. **Saves to database**: Persists the optimized route with all stops

##### `markStopCompleted(stopId, driverId, latitude, longitude, notes)`

Called when driver completes a stop (pickup or dropoff). It:

1. Updates the stop status to 'COMPLETED'
2. Creates an attendance record
3. Updates route status (PENDING → IN_PROGRESS → COMPLETED)
4. Returns remaining stops count

#### Route Optimization Algorithm

The service uses a **greedy nearest-neighbor algorithm** with a critical constraint: **pickups must happen before dropoffs for each child**.

```typescript
// Simplified optimization logic:
while (remaining stops) {
  for each stop in remaining {
    // Constraint: Only allow dropoff if child was picked up
    if (stop.type === 'DROPOFF' && !pickedUpChildren.has(stop.childId)) {
      skip this stop
    }

    // Find nearest valid stop
    distance = distanceMatrix[currentLocation][stop]
    if (distance < bestDistance) {
      bestStop = stop
    }
  }

  add bestStop to route
  if (bestStop.type === 'PICKUP') {
    mark child as picked up
  }
}
```

### 3. Backend API Endpoints

All endpoints are protected with JWT authentication.

#### POST `/driver/route/today`

Fetches or generates today's optimized route.

**Request:**

```json
{
  "routeType": "MORNING_PICKUP",
  "latitude": 6.8428,
  "longitude": 79.9384
}
```

**Response:**

```json
{
  "success": true,
  "route": {
    "id": 123,
    "driverId": 45,
    "date": "2025-10-18",
    "routeType": "MORNING_PICKUP",
    "status": "PENDING",
    "totalDistanceMeters": 15000,
    "totalDurationSecs": 1200
  },
  "stops": [
    {
      "stopId": 1,
      "childId": 10,
      "childName": "Nimal Perera",
      "type": "PICKUP",
      "address": "123 Galle Road, Dehiwala",
      "latitude": 6.8428,
      "longitude": 79.9384,
      "etaSecs": 1697234567,
      "legDistanceMeters": 1200,
      "status": "PENDING",
      "order": 0
    }
    // ... more stops
  ]
}
```

#### PATCH `/driver/route/stop/:stopId/complete`

Marks a stop as completed.

**Request:**

```json
{
  "latitude": 6.8428,
  "longitude": 79.9384,
  "notes": "Pickup completed successfully"
}
```

**Response:**

```json
{
  "success": true,
  "remainingStops": 5,
  "routeCompleted": false
}
```

#### GET `/driver/route/status`

Gets current route status for today.

### 4. Mobile App Implementation (React Native / Expo)

The mobile app follows the exact workflow described in the guide.

#### State Management

```typescript
const [isRideActive, setIsRideActive] = useState(false);
const [stopList, setStopList] = useState<RouteStop[]>([]);
const [currentStopIndex, setCurrentStopIndex] = useState(0);
```

#### Core Workflow

##### A. Starting the Ride

```typescript
const handleStartRide = async () => {
  // 1. Get current location
  const location = await getCurrentLocation();

  // 2. Fetch optimized route from backend
  const routeData = await routeApi.getTodaysRoute(
    "MORNING_PICKUP",
    location.latitude,
    location.longitude
  );

  // 3. Initialize state
  setStopList(routeData.stops);
  setCurrentStopIndex(0);
  setIsRideActive(true);
};
```

##### B. Getting Directions

```typescript
const handleGetDirections = () => {
  const currentStop = stopList[currentStopIndex];
  const url = `https://www.google.com/maps/dir/?api=1&destination=${currentStop.latitude},${currentStop.longitude}`;
  Linking.openURL(url);
};
```

This opens Google Maps in navigation mode. The driver navigates using Google Maps and manually returns to the app when they arrive.

##### C. Marking Stop Complete

```typescript
const handleMarkAsComplete = async () => {
  const currentStop = stopList[currentStopIndex];

  // 1. Notify backend
  await routeApi.markStopCompleted(currentStop.stopId);

  // 2. Check if more stops exist
  if (currentStopIndex < stopList.length - 1) {
    // 3. Advance to next stop
    setCurrentStopIndex((prev) => prev + 1);
  } else {
    // Route complete!
    Alert.alert("Ride Complete!");
    setIsRideActive(false);
  }
};
```

When you increment `currentStopIndex`, React automatically re-renders and shows the next stop's details.

#### UI Components

##### Current Stop Card

Shows:

- Header: "Next Pickup" or "Next Drop-off"
- Passenger name
- Address
- ETA badge
- Distance
- Two action buttons:
  - **Get Directions** (opens Google Maps)
  - **Mark as Picked Up/Dropped** (completes stop)

##### Next Stop Preview

Shows a smaller card with preview of the next stop so the driver knows what's coming.

##### Route Summary

Shows progress:

- Total stops
- Completed stops
- Remaining stops
- Total distance

### 5. Attendance Management

#### Attendance Screen (`mobile-driver/app/(tabs)/attendance.tsx`)

Allows drivers to mark students as present or absent before starting the route.

**Features:**

- List of all assigned students
- Toggle present/absent status
- Shows summary (X present, Y absent)
- Saves to backend
- Affects route generation (only present students included)

#### Backend Absence Tracking

Uses existing `Absence_Child` table:

```prisma
model Absence_Child {
  absent_id Int      @id @default(autoincrement())
  reason    String
  childId   Int
  date      DateTime @db.Date

  @@unique([childId, date])
}
```

When generating routes, the service queries this table to exclude absent students.

## How It All Works Together

### Daily Workflow

1. **Morning Preparation**

   - Driver opens app
   - Goes to "Mark Attendance" screen
   - Marks students as present/absent
   - Returns to home screen

2. **Starting the Route**

   - Driver clicks "Start Trip" on home screen
   - App navigates to Navigation screen
   - Driver clicks "Start Ride"
   - Backend generates optimized route based on present students
   - App displays first stop

3. **For Each Stop**

   - Driver sees current stop details
   - Clicks "Get Directions"
   - Google Maps opens and navigates
   - Driver drives to location
   - Driver returns to app
   - Clicks "Mark as Picked Up/Dropped"
   - App shows next stop
   - Repeat until all stops complete

4. **Route Completion**
   - After last stop marked complete
   - App shows "Ride Complete!" message
   - Route status set to 'COMPLETED' in database
   - Attendance records created for all stops

### Key Features

✅ **Dynamic Route Generation**: Routes are generated fresh each day based on attendance

✅ **Google Maps Integration**: Distance Matrix API for optimization, Directions API for polyline

✅ **Persistent Routes**: Routes are saved to database and can be resumed if app crashes

✅ **Sequential Workflow**: Simple, clear workflow - driver only sees current task

✅ **Constraint Handling**: Ensures pickups happen before dropoffs

✅ **Real-time Progress**: Shows progress through route with visual indicators

✅ **Offline Resilience**: If optimization fails, falls back to default order

## Database Migration

To apply the schema changes:

```bash
cd backend
npx prisma migrate dev --name add_route_stop_model
npx prisma generate
```

## Environment Variables

Ensure `.env` has:

```
GOOGLE_MAPS_API_KEY=your_api_key_here
```

## Testing the System

### 1. Setup Test Data

```sql
-- Ensure you have a driver
-- Ensure driver has assigned children (ChildRideRequest with status='Assigned')
-- Ensure children have valid coordinates (pickupLatitude, pickupLongitude, schoolLatitude, schoolLongitude)
```

### 2. Test Attendance Management

1. Open mobile app
2. Go to "Mark Attendance" from home screen
3. Toggle some students as absent
4. Click "Save Attendance"

### 3. Test Route Generation

1. Click "Start Trip" on home screen
2. Click "Start Ride" on navigation screen
3. Verify route is fetched
4. Verify only present students are in route
5. Verify stops are ordered logically

### 4. Test Sequential Workflow

1. Click "Get Directions" on first stop
2. Verify Google Maps opens
3. Return to app
4. Click "Mark as Picked Up"
5. Verify next stop appears
6. Repeat until route complete

## Troubleshooting

### "No students assigned"

- Check `ChildRideRequest` table has records with status='Assigned' for this driver
- Verify `child` relation is valid

### "No valid pickup/dropoff locations"

- Check `Child` records have non-null latitude/longitude values
- Verify coordinates are in correct format (not swapped)

### Route optimization fails

- Check `GOOGLE_MAPS_API_KEY` is set and valid
- Check API key has Distance Matrix and Directions APIs enabled
- System will fall back to default order if optimization fails

### Stop not completing

- Check network connectivity
- Verify JWT token is valid
- Check backend logs for errors

## Future Enhancements

1. **Real-time ETA updates**: Update ETAs as driver progresses through route
2. **Parent notifications**: Notify parents when driver is approaching
3. **Route replay**: Show history of completed routes on map
4. **Multi-school support**: Handle students going to different schools
5. **Traffic awareness**: Use real-time traffic data for better ETAs
6. **Driver location sharing**: Share driver location with parents in real-time

## Summary

This implementation provides a complete, production-ready driver routing system with:

- ✅ Proper database schema
- ✅ Attendance-based route generation
- ✅ Google Maps route optimization
- ✅ Sequential stop workflow
- ✅ Route persistence
- ✅ Clean UI/UX following the guide
- ✅ Error handling and fallbacks
- ✅ Real-time progress tracking

The system exactly matches the workflow described in your guide and provides a robust foundation for a driver transport app.
