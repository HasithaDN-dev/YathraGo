# Complete Driver Navigation Feature Setup Guide

## Overview

This guide covers the complete implementation of the new driver navigation feature that replaces the old in-app route drawing with a step-by-step Google Maps integration.

## Features Implemented

### ✅ Frontend (Driver App)

- **Step-by-step navigation**: Shows one child/stop at a time
- **Google Maps integration**: Opens external Google Maps for each segment
- **Background GPS tracking**: Detects arrival within 100m threshold
- **Attendance marking**: Records pickup/dropoff with GPS coordinates
- **Automatic progression**: Advances to next stop after attendance
- **Trip completion**: Shows completion when all stops are done

### ✅ Backend (NestJS + Prisma)

- **Attendance model**: Records driver attendance with GPS coordinates
- **Route optimization**: Uses Google Maps API to order stops optimally
- **Today's route endpoint**: Returns ordered waypoints for current day
- **Attendance API**: Marks attendance with full audit trail

## Setup Instructions

### 1. Database Migration

```bash
# Navigate to backend directory
cd backend

# Generate Prisma client with new schema
npx prisma generate

# Apply database migration
npx prisma db push

# Or run the SQL migration manually:
# psql -d your_database -f migrations/add-attendance-model.sql
```

### 2. Backend Setup

```bash
# Install dependencies (if not already installed)
npm install

# Start the backend server
npm run start:dev
```

### 3. Frontend Setup

```bash
# Navigate to mobile-driver directory
cd mobile-driver

# Install dependencies (if not already installed)
npm install

# Start the Expo development server
npx expo start
```

## API Endpoints

### Get Today's Route

```
GET /driver-route/today/:driverId
```

Returns ordered waypoints for the driver's current day route.

### Mark Attendance

```
POST /attendance/mark
```

Body:

```json
{
  "driverId": 2,
  "childId": 123,
  "waypointId": 456,
  "type": "pickup",
  "latitude": 6.9123,
  "longitude": 79.8567,
  "tripId": 789
}
```

### Get Attendance History

```
GET /attendance/history/:driverId?date=2024-01-15
```

## How It Works

### 1. Route Generation

- Backend fetches assigned children for driver
- Uses Google Maps Directions API to optimize route order
- Stores ordered waypoints in database with pickup/dropoff types

### 2. Driver Navigation Flow

1. Driver clicks "Start Trip" on home screen
2. App navigates to Navigation tab
3. Shows first incomplete waypoint with child details
4. Driver clicks "Open in Google Maps" → opens external navigation
5. App tracks GPS location in background
6. When within 100m of destination → shows "Mark Attendance" button
7. Driver marks attendance → automatically advances to next stop
8. Repeats until all stops completed

### 3. Data Flow

```
Home Screen → Start Trip → Navigation Tab → Google Maps → Arrival Detection → Attendance → Next Stop
```

## Configuration

### Environment Variables

```env
# Backend (.env)
DATABASE_URL="postgresql://..."
GOOGLE_MAPS_API_KEY="your_google_maps_api_key"

# Frontend (app.config.js)
EXPO_PUBLIC_API_URL="http://localhost:3000"
```

### Driver ID Configuration

Currently hardcoded as `DRIVER_ID = 2` in:

- `mobile-driver/app/(tabs)/navigation.tsx`
- Replace with actual authentication context

## Testing

### 1. Create Test Data

```sql
-- Insert test driver
INSERT INTO "Driver" (name, phone, ...) VALUES ('Test Driver', '+1234567890', ...);

-- Insert test children
INSERT INTO "Child" (childFirstName, childLastName, pickUpAddress, school, ...)
VALUES ('John', 'Doe', '123 Main St', 'Test School', ...);

-- Create ride request
INSERT INTO "ChildRideRequest" (childId, driverId, status)
VALUES (1, 2, 'Assigned');
```

### 2. Generate Route

```bash
# Call the route optimization endpoint
curl -X POST http://localhost:3000/driver-route/optimize/2
```

### 3. Test Navigation

1. Open mobile app
2. Navigate to Home tab
3. Click "Start Trip"
4. Should navigate to Navigation tab with first waypoint
5. Test Google Maps integration
6. Test attendance marking

## Troubleshooting

### Common Issues

1. **No route found**: Ensure children are assigned to driver with status 'Assigned'
2. **Google Maps not opening**: Check location permissions
3. **Attendance not saving**: Verify backend API is running and accessible
4. **GPS not working**: Check device location permissions

### Debug Steps

1. Check browser/device console for errors
2. Verify API endpoints are accessible
3. Check database for route data
4. Test with different driver IDs

## File Structure

```
backend/
├── src/
│   ├── attendance/           # New attendance module
│   │   ├── attendance.controller.ts
│   │   ├── attendance.service.ts
│   │   └── attendance.module.ts
│   ├── driver-route/         # Updated with new endpoints
│   │   ├── driver-route.controller.ts
│   │   └── driver-route.service.ts
│   └── schema.prisma         # Updated with Attendance model

mobile-driver/
├── app/(tabs)/
│   ├── navigation.tsx        # Completely rewritten
│   └── index.tsx            # Updated Start Trip button
├── lib/api/
│   └── navigation.api.ts    # New API service
└── config/
    └── api.ts               # API configuration
```

## Next Steps

1. **Authentication Integration**: Replace hardcoded driver ID with auth context
2. **Error Handling**: Add comprehensive error handling and retry logic
3. **Offline Support**: Add offline capability for attendance marking
4. **Push Notifications**: Notify parents when child is picked up/dropped off
5. **Route Optimization**: Add real-time traffic updates
6. **Analytics**: Track driver performance and route efficiency

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review console logs for error messages
3. Verify all environment variables are set correctly
4. Ensure database migrations have been applied
