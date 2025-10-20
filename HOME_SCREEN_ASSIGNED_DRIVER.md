# Assigned Driver Display on Home Screen

## Summary
Implemented automatic fetching and display of assigned driver and vehicle information on the customer app home screen. The data is loaded from `ChildRideRequest` and `StaffRideRequest` tables based on the active profile, and automatically updates when a ride request is accepted.

---

## Features Implemented

### ✅ Backend API Endpoints
- **GET** `/customer/assigned-ride/child/:childId` - Get assigned ride for a child profile
- **GET** `/customer/assigned-ride/staff` - Get assigned ride for staff profile

### ✅ Frontend Components
- **Assigned Ride API Client** - API integration for fetching assigned rides
- **Assigned Ride Store** - Zustand state management for assigned ride data
- **Home Screen Updates** - Dynamic driver/vehicle cards with loading states

### ✅ Automatic Updates
- Loads assigned ride when app starts
- Reloads when active profile changes
- Refreshes after accepting a ride request
- Shows loading indicator during fetch
- Displays "No driver assigned" message when no ride is assigned

---

## Backend Changes

### File: `backend/src/customer/customer.service.ts`

#### New Method: `getAssignedChildRide`
Fetches the assigned ride for a specific child profile.

**Input**:
- `childId`: number - The child's ID
- `customerId`: number - Customer ID for authorization

**Output**:
```typescript
{
  rideRequestId: number;
  childId: number;
  driverId: number;
  amount: number | null;
  assignedDate: string | null;
  status: string;
  driver: {
    id: number;
    name: string;
    phone: string;
    profilePictureUrl: string;
    rating: number;
  };
  vehicle: {
    id: number;
    registrationNumber: string;
    brand: string;
    model: string;
    type: string;
    color: string;
    seats: number;
    airConditioned: boolean;
  } | null;
}
```

**Logic**:
1. Verifies the child belongs to the customer (authorization)
2. Queries `ChildRideRequest` where `childId` matches and `status = 'Assigned'`
3. Includes driver and vehicle information
4. Returns most recent assignment (`orderBy AssignedDate desc`)
5. Returns `null` if no assigned ride found

#### New Method: `getAssignedStaffRide`
Fetches the assigned ride for the customer's staff profile.

**Input**:
- `customerId`: number - The customer ID

**Output**: Same structure as `getAssignedChildRide` but with `staffId` instead of `childId`

**Logic**:
1. Finds the staff passenger profile for this customer
2. Queries `StaffRideRequest` where `staffId` matches and `status = 'Assigned'`
3. Includes driver and vehicle information
4. Returns most recent assignment
5. Returns `null` if no staff profile or no assigned ride

---

### File: `backend/src/customer/customer.controller.ts`

#### New Endpoint: GET `/customer/assigned-ride/child/:childId`
```typescript
@Get('assigned-ride/child/:childId')
@UseGuards(JwtAuthGuard)
async getAssignedChildRide(
  @Param('childId', ParseIntPipe) childId: number,
  @Request() req: AuthenticatedRequest,
)
```

**Authentication**: JWT required (customer token)  
**Authorization**: Verifies child belongs to customer  
**Returns**: Assigned ride details or `null`

#### New Endpoint: GET `/customer/assigned-ride/staff`
```typescript
@Get('assigned-ride/staff')
@UseGuards(JwtAuthGuard)
async getAssignedStaffRide(@Request() req: AuthenticatedRequest)
```

**Authentication**: JWT required (customer token)  
**Returns**: Assigned ride details or `null`

---

## Frontend Changes

### File: `mobile-customer/lib/api/assigned-ride.api.ts` (NEW)

**Purpose**: API client for fetching assigned ride information

**Exports**:
- `AssignedDriver` interface
- `AssignedVehicle` interface
- `AssignedRideResponse` interface
- `assignedRideApi` object with methods:
  - `getAssignedChildRide(childId: number)`
  - `getAssignedStaffRide()`

**Error Handling**:
- Returns `null` if no assigned ride found (404 or null response)
- Throws error for other failures
- Logs errors to console

---

### File: `mobile-customer/lib/stores/assigned-ride.store.ts` (NEW)

**Purpose**: Zustand store for managing assigned ride state

**State**:
```typescript
{
  assignedRide: AssignedRideResponse | null;
  isLoading: boolean;
  error: string | null;
}
```

**Methods**:
- `loadAssignedRide(profileType, profileId?)` - Fetches assigned ride
- `clearAssignedRide()` - Clears stored ride data
- `clearError()` - Clears error state

**Usage**:
```typescript
const { assignedRide, isLoading, loadAssignedRide } = useAssignedRideStore();

// Load for child profile
await loadAssignedRide('child', 123);

// Load for staff profile
await loadAssignedRide('staff');
```

---

### File: `mobile-customer/app/(tabs)/index.tsx`

**Changes**:

#### 1. Added Imports
```typescript
import { useAssignedRideStore } from '@/lib/stores/assigned-ride.store';
import { ActivityIndicator } from 'react-native';
```

#### 2. Load on Profile Change
```typescript
useEffect(() => {
  if (activeProfile) {
    const profileIdStr = activeProfile.id.split('-')[1];
    const profileId = parseInt(profileIdStr, 10);
    loadAssignedRide(activeProfile.type, profileId);
  }
}, [activeProfile, loadAssignedRide]);
```

#### 3. Dynamic Driver & Vehicle Section
**Before**: Hardcoded driver "Hemal Perera" and vehicle "WP-5562"

**After**: Three states:
1. **Loading State**:
   ```tsx
   <ActivityIndicator />
   <Typography>Loading driver info...</Typography>
   ```

2. **Assigned State** (when `assignedRide` exists):
   ```tsx
   <DriverVehicleCard
     type="driver"
     name={assignedRide.driver.name}
     rating={assignedRide.driver.rating}
   />
   <DriverVehicleCard
     type="vehicle"
     name={assignedRide.vehicle?.registrationNumber}
     subtitle={`${vehicle.brand} ${vehicle.model}`}
   />
   ```

3. **No Assignment State**:
   ```tsx
   <Typography>No driver assigned yet</Typography>
   <Typography>Find a vehicle to get started</Typography>
   ```

#### 4. Conditional Action Buttons
- "Inform" and "Message" buttons only show when `assignedRide` exists
- Hidden during loading or when no driver assigned

---

### File: `mobile-customer/app/(menu)/find-driver/request-detail.tsx`

**Changes**:

#### Added Store Import
```typescript
import { useAssignedRideStore } from '@/lib/stores/assigned-ride.store';
```

#### Updated `handleAccept` Method
After accepting a ride request:
```typescript
// Reload assigned ride for the active profile
if (activeProfile) {
  const profileIdStr = activeProfile.id.split('-')[1];
  const profileId = parseInt(profileIdStr, 10);
  await loadAssignedRide(activeProfile.type, profileId);
}
```

This ensures the home screen updates immediately after assignment.

---

## Data Flow

### On App Start / Profile Change

```
1. User opens app / switches profile
   ↓
2. useEffect in home screen triggers
   ↓
3. Extract profile type ('child' or 'staff')
   ↓
4. Extract numeric profileId from "child-123" format
   ↓
5. Call loadAssignedRide(type, id)
   ↓
6. API call to backend
   - Child: GET /customer/assigned-ride/child/:childId
   - Staff: GET /customer/assigned-ride/staff
   ↓
7. Backend queries ChildRideRequest/StaffRideRequest
   - WHERE status = 'Assigned'
   - ORDER BY AssignedDate DESC
   - INCLUDE driver and vehicles
   ↓
8. Return driver + vehicle data (or null)
   ↓
9. Update Zustand store
   ↓
10. Home screen re-renders with driver info
```

### On Ride Request Acceptance

```
1. Customer taps "Accept" on request
   ↓
2. Confirm dialog shown
   ↓
3. User confirms
   ↓
4. API call: POST /driver-request/:id/accept
   ↓
5. Backend creates ChildRideRequest/StaffRideRequest
   - status: 'Assigned'
   - AssignedDate: current timestamp
   - Amount: negotiated amount
   ↓
6. Frontend calls loadAssignedRide()
   ↓
7. Fetches updated assignment
   ↓
8. Updates Zustand store
   ↓
9. Shows success alert
   ↓
10. Navigates back to home
    ↓
11. Home screen shows new driver 🎉
```

---

## Database Schema Reference

### ChildRideRequest
```prisma
model ChildRideRequest {
  id           Int           @id @default(autoincrement())
  childId      Int           // Links to Child
  driverId     Int           // Links to Driver
  Amount       Float?        // Negotiated monthly amount
  AssignedDate DateTime?     // When assignment was made
  status       RequestStatus // 'Assigned' = active assignment
  createdAt    DateTime
  updatedAt    DateTime
  child        Child         @relation(...)
  driver       Driver        @relation(...)
}
```

### StaffRideRequest
```prisma
model StaffRideRequest {
  id           Int             @id @default(autoincrement())
  staffId      Int             // Links to Staff_Passenger
  driverId     Int             // Links to Driver
  Amount       Float?          // Negotiated monthly amount
  AssignedDate DateTime?       // When assignment was made
  status       RequestStatus   // 'Assigned' = active assignment
  createdAt    DateTime
  updatedAt    DateTime
  Driver       Driver          @relation(...)
  Staff_Passenger Staff_Passenger @relation(...)
}
```

**Query Logic**:
```sql
-- Get assigned child ride
SELECT cr.*, d.*, v.*
FROM "ChildRideRequest" cr
JOIN "Driver" d ON cr."driverId" = d.driver_id
LEFT JOIN "Vehicle" v ON d.driver_id = v."driverId"
WHERE cr."childId" = $1
  AND cr.status = 'Assigned'
ORDER BY cr."AssignedDate" DESC
LIMIT 1;
```

---

## UI States

### 1. Loading State
```
┌─────────────────────────┐
│  Driver & Vehicle       │
│                         │
│     ⏳ Loading...       │
│   Loading driver info   │
│                         │
└─────────────────────────┘
```

### 2. Assigned State
```
┌─────────────────────────┐
│  Driver & Vehicle       │
│                         │
│  ┌──────┐   ┌──────┐   │
│  │  👤  │   │  🚗  │   │
│  │ Name │   │ WP-  │   │
│  │ ⭐4.9│   │ 5562 │   │
│  └──────┘   └──────┘   │
│                         │
│  [Inform]  [Message]   │
└─────────────────────────┘
```

### 3. No Assignment State
```
┌─────────────────────────┐
│  Driver & Vehicle       │
│                         │
│  No driver assigned yet │
│  Find a vehicle to get  │
│      started            │
│                         │
└─────────────────────────┘
```

---

## Testing Instructions

### Test 1: View Assigned Driver on Home Screen

**Prerequisites**:
- Have at least one accepted ride request in database
- Child or staff profile should have status='Assigned' ride

**Steps**:
1. **Login** to customer app
2. **Select profile** (child or staff with assignment)
3. **Go to Home** tab
4. **Verify**:
   - ✅ Driver name displayed correctly
   - ✅ Driver rating shown (4.9)
   - ✅ Vehicle registration number shown
   - ✅ Vehicle brand/model displayed
   - ✅ "Inform" and "Message" buttons visible

### Test 2: No Assignment State

**Prerequisites**: Profile with no assigned ride

**Steps**:
1. **Login** to customer app
2. **Select profile** with no assignment
3. **Go to Home** tab
4. **Verify**:
   - ✅ "No driver assigned yet" message shown
   - ✅ "Find a vehicle to get started" hint shown
   - ✅ No "Inform" or "Message" buttons

### Test 3: Profile Switch Updates Display

**Steps**:
1. **Login** with multiple profiles
2. **Profile A** has assigned driver
3. **Profile B** has no assigned driver
4. **Switch to Profile A**
   - ✅ Driver info loads and displays
5. **Switch to Profile B**
   - ✅ Shows "No driver assigned" message
6. **Switch back to Profile A**
   - ✅ Driver info reloads

### Test 4: Assignment Updates Home Screen

**Steps**:
1. **Have a pending request**
2. **Go to** "View Sent Requests"
3. **Open request detail**
4. **Tap "Accept"** button
5. **Confirm acceptance**
6. **Wait for success** message
7. **Go back to Home** tab
8. **Verify**:
   - ✅ Driver info now displays
   - ✅ Shows newly assigned driver
   - ✅ Vehicle info populated
   - ✅ Action buttons now visible

### Test 5: Multiple Children Different Drivers

**Prerequisites**: Customer with 2+ children, each with different drivers

**Steps**:
1. **Login** as customer
2. **Select Child A**
   - ✅ Shows Driver X
3. **Switch to Child B**
   - ✅ Shows Driver Y (different)
4. **Verify** correct driver/vehicle for each child

---

## API Endpoints Reference

### GET `/customer/assigned-ride/child/:childId`

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response (Assigned)**:
```json
{
  "rideRequestId": 5,
  "childId": 12,
  "driverId": 7,
  "amount": 12000,
  "assignedDate": "2025-10-20T10:30:00.000Z",
  "status": "Assigned",
  "driver": {
    "id": 7,
    "name": "Hemal Perera",
    "phone": "0771234567",
    "profilePictureUrl": "uploads/driver/profile.jpg",
    "rating": 4.9
  },
  "vehicle": {
    "id": 3,
    "registrationNumber": "WP-5562",
    "brand": "Toyota",
    "model": "HIACE",
    "type": "Van",
    "color": "White",
    "seats": 14,
    "airConditioned": true
  }
}
```

**Response (Not Assigned)**:
```json
null
```

**Error (Unauthorized)**:
```json
{
  "statusCode": 400,
  "message": "Child not found or unauthorized"
}
```

### GET `/customer/assigned-ride/staff`

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response**: Same format as child endpoint, but with `staffId` instead of `childId`

---

## Files Modified/Created

### Backend
1. ✅ `backend/src/customer/customer.service.ts`
   - Added `getAssignedChildRide()` method
   - Added `getAssignedStaffRide()` method

2. ✅ `backend/src/customer/customer.controller.ts`
   - Added `GET /customer/assigned-ride/child/:childId`
   - Added `GET /customer/assigned-ride/staff`

### Frontend
3. ✅ `mobile-customer/lib/api/assigned-ride.api.ts` (NEW)
   - Created API client for assigned rides

4. ✅ `mobile-customer/lib/stores/assigned-ride.store.ts` (NEW)
   - Created Zustand store for state management

5. ✅ `mobile-customer/app/(tabs)/index.tsx`
   - Added loading state
   - Dynamic driver/vehicle display
   - Profile change listener
   - Conditional action buttons

6. ✅ `mobile-customer/app/(menu)/find-driver/request-detail.tsx`
   - Refresh assigned ride after acceptance

---

## Benefits

### Before:
- ❌ Hardcoded driver/vehicle info
- ❌ No connection to database
- ❌ Didn't update after assignment
- ❌ Same info for all profiles

### After:
- ✅ Real driver/vehicle data from database
- ✅ Loads automatically on app start
- ✅ Updates when profile changes
- ✅ Refreshes after accepting request
- ✅ Shows loading states
- ✅ Handles no-assignment case
- ✅ Different driver for each profile
- ✅ Action buttons only when needed

---

## Future Enhancements

1. **Real-time Updates**: WebSocket/polling for live status changes
2. **Driver Rating**: Calculate from actual reviews instead of hardcoded 4.9
3. **Multiple Assignments**: Handle history of past assignments
4. **Assignment Details**: Show assignment date, monthly amount
5. **Quick Actions**: Call driver, view route, etc.
6. **Cache Strategy**: Reduce API calls with smart caching
7. **Offline Support**: Cache last known assignment

---

**Status**: ✅ COMPLETE - Home screen now displays real assigned driver/vehicle data!
