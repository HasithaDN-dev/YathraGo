# Driver Route Setup Implementation

## Overview

This document describes the implementation of a **first-time driver route setup flow** that allows drivers to configure their route by selecting multiple cities from a list when they log in for the first time.

---

## 🎯 Features Implemented

### Backend (NestJS + Prisma + PostgreSQL)

#### 1. **Database Schema**

The `DriverCities` model already exists in the Prisma schema with the following structure:

```prisma
model DriverCities {
  id             Int       @id @default(autoincrement())
  driverId       Int       @unique
  cityIds        Int[]     // Array of city IDs in travel order
  rideType       Ridetype  @default(Both)
  usualEndTime   DateTime? @db.Time(6)
  usualStartTime DateTime? @db.Time(6)
  driver         Driver    @relation(fields: [driverId], references: [driver_id])
}
```

#### 2. **New Service Methods** (driver.service.ts)

- **`saveDriverCities(driverId: number, cityIds: number[])`**

  - Validates that all city IDs exist in the database
  - Creates or updates the driver's route cities
  - Returns success/error response

- **`getDriverCities(driverId: number)`**
  - Retrieves the driver's assigned cities
  - Returns cities in the order they were saved
  - Includes a `hasRoute` boolean flag to indicate if route is setup

#### 3. **New API Endpoints** (driver.controller.ts)

##### GET `/driver/cities`

- **Protected**: Requires JWT authentication
- **Purpose**: Check if driver has a route setup and retrieve city details
- **Response**:
  ```json
  {
    "success": true,
    "hasRoute": true,
    "cities": [
      {
        "id": 1,
        "name": "Maharagama Junction",
        "latitude": 6.8463,
        "longitude": 79.929
      },
      {
        "id": 2,
        "name": "Royal College",
        "latitude": 6.9025,
        "longitude": 79.8612
      }
    ],
    "cityIds": [1, 2]
  }
  ```

##### POST `/driver/cities`

- **Protected**: Requires JWT authentication
- **Purpose**: Save or update driver's route cities
- **Request Body**:
  ```json
  {
    "cityIds": [1, 3, 5, 2]
  }
  ```
- **Validation**: Requires at least 2 cities (start and destination)
- **Response**:
  ```json
  {
    "success": true,
    "message": "Driver cities saved successfully",
    "driverCities": {
      "id": 1,
      "driverId": 123,
      "cityIds": [1, 3, 5, 2],
      "rideType": "Both"
    }
  }
  ```

---

### Frontend (Expo React Native)

#### 1. **New Component: SetupRouteCard**

Location: `mobile-driver/components/SetupRouteCard.tsx`

**Features:**

- Fetches all available cities from `/cities` endpoint
- Allows driver to add cities one by one in travel order
- Shows visual feedback for selected cities
- Displays route order with numbered indicators
- Validates minimum 2 cities before saving
- Shows loading states and error messages
- Automatically refreshes parent screen after successful save

**UI Elements:**

- City selection dropdown/list
- Selected cities with order numbers
- Remove button for each city
- "Add City" button
- "Save Route" button (enabled only when ≥2 cities selected)

#### 2. **Updated HomeScreen**

Location: `mobile-driver/app/(tabs)/index.tsx`

**Changes:**

- Added `hasRouteSetup` state to track if driver has configured their route
- Modified `fetchDriverData()` to check route setup status via `/driver/cities`
- Conditionally renders either:
  - **SetupRouteCard**: When `hasRouteSetup = false`
  - **Normal Trip Card**: When `hasRouteSetup = true`
- All existing sections (Students, Schedule, Quick Actions) only show when route is setup
- Added `handleRouteSetupComplete()` callback to refresh screen after setup

---

## 🔄 User Flow

### First-Time Login (No Route Setup)

1. Driver logs in
2. App fetches driver data including route status
3. `hasRouteSetup` is `false`
4. **SetupRouteCard** is displayed
5. Driver sees "Setup Your Route" card with instructions
6. Driver clicks "Add City" and selects cities from the list
7. Cities appear in order with visual indicators
8. After adding ≥2 cities, "Save Route" button becomes enabled
9. Driver clicks "Save Route"
10. Cities are saved to backend
11. Screen refreshes and shows normal trip interface

### Subsequent Logins (Route Already Setup)

1. Driver logs in
2. App fetches driver data including route status
3. `hasRouteSetup` is `true`
4. Normal home screen with trip card is displayed
5. Start/end cities are fetched from the route

---

## 📡 API Integration

### Existing Endpoints Used:

- `GET /cities` - Fetch all available cities
- `GET /driver/profile` - Get driver profile information
- `GET /driver/child-ride-requests` - Get assigned students
- `GET /driver/route-cities` - Get route start/end points (existing)
- `GET /driver/route-cities-with-eta` - Get route with ETA calculation (existing)

### New Endpoints:

- `GET /driver/cities` - Check if driver has route and get full city list
- `POST /driver/cities` - Save/update driver's route cities

---

## 🎨 UI/UX Highlights

### SetupRouteCard Design:

- **Header**: Clear title and instructions
- **City List**: Scrollable list with city names
- **Selected Cities**: Numbered badges showing order
- **Visual Feedback**:
  - Selected cities are grayed out in dropdown
  - Checkmarks on already selected cities
  - Order numbers (1, 2, 3...) in navy circles
  - Labels: "Starting Point", "Waypoint", "Destination"
- **Error Handling**: Red alert box for errors
- **Progressive Enhancement**: Save button only enabled when requirements met

### Conditional Rendering:

- Clean separation between setup and normal mode
- Smooth transition after route setup
- All sections hidden until route is configured
- Pull-to-refresh support maintained

---

## 🔒 Security

- All endpoints are protected with JWT authentication
- Driver ID is extracted from JWT token (not from request body)
- City validation ensures only valid city IDs are saved
- Error messages don't expose sensitive information

---

## 🧪 Testing

### Backend Testing (Postman/Thunder Client):

1. **Get Driver Cities (No Setup)**

   ```
   GET http://localhost:3000/driver/cities
   Headers: Authorization: Bearer <JWT_TOKEN>
   Expected: { success: false, hasRoute: false, cities: [] }
   ```

2. **Save Driver Cities**

   ```
   POST http://localhost:3000/driver/cities
   Headers:
     Authorization: Bearer <JWT_TOKEN>
     Content-Type: application/json
   Body: { "cityIds": [1, 3, 5, 2] }
   Expected: { success: true, message: "Driver cities saved successfully" }
   ```

3. **Get Driver Cities (After Setup)**
   ```
   GET http://localhost:3000/driver/cities
   Headers: Authorization: Bearer <JWT_TOKEN>
   Expected: { success: true, hasRoute: true, cities: [...] }
   ```

### Frontend Testing:

1. **First-Time Driver Login**

   - Delete driver's DriverCities record from database
   - Login as driver
   - Verify SetupRouteCard is displayed
   - Add cities and save
   - Verify normal home screen appears

2. **Existing Driver Login**
   - Login as driver with existing route
   - Verify normal home screen appears immediately
   - Verify start/end cities are displayed correctly

---

## 📝 Database Operations

### To Test First-Time Flow:

```sql
-- Remove driver's route setup to simulate first-time login
DELETE FROM "DriverCities" WHERE "driverId" = <DRIVER_ID>;
```

### To Verify Route Setup:

```sql
-- Check driver's saved route
SELECT * FROM "DriverCities" WHERE "driverId" = <DRIVER_ID>;

-- Get city names for the route
SELECT c.id, c.name
FROM "City" c
JOIN "DriverCities" dc ON c.id = ANY(dc."cityIds")
WHERE dc."driverId" = <DRIVER_ID>;
```

---

## 🔧 Configuration

No additional environment variables or configuration needed. The implementation uses existing:

- `DATABASE_URL` for Prisma
- `GOOGLE_MAPS_API_KEY` for ETA calculations (optional)
- JWT authentication configuration

---

## 📦 Files Modified/Created

### Backend:

- ✅ `backend/src/driver/driver.service.ts` - Added 2 new methods
- ✅ `backend/src/driver/driver.controller.ts` - Added 2 new endpoints
- ✅ `backend/prisma/schema.prisma` - No changes (already had DriverCities model)

### Frontend:

- ✅ `mobile-driver/components/SetupRouteCard.tsx` - New component (242 lines)
- ✅ `mobile-driver/app/(tabs)/index.tsx` - Updated with conditional rendering

---

## 🚀 Future Enhancements

1. **Edit Route**: Allow drivers to modify their route after initial setup
2. **Route Visualization**: Show route on a map during setup
3. **Time Estimates**: Show estimated time for each leg
4. **Route Templates**: Suggest popular routes
5. **Waypoint Details**: Add notes/instructions for each waypoint
6. **Multi-Route Support**: Allow drivers to save multiple routes

---

## ✅ Implementation Complete

The driver route setup flow is now fully functional! Drivers logging in for the first time will be prompted to set up their route, while existing drivers with configured routes will see the normal home screen immediately.

All code follows the existing patterns and styling conventions of the YathraGo project.
