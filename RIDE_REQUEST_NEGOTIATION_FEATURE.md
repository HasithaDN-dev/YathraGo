# Ride Request Negotiation Feature - Implementation Guide

## Overview
Complete ride request system allowing customers to send ride requests to drivers with price negotiation capability. The system calculates estimated distance and price, then allows iterative negotiation until both parties agree.

## Database Schema Changes

### Modified `askDriverRequest` Table
```prisma
model askDriverRequest {
  id                        Int       @id @default(autoincrement())
  customerID                Int
  staffOrChild              String    // 'staff' or 'child'
  staffOrChildID            Int
  driverId                  Int
  estimatedDistance         Float     // Stored on initial calculation (km)
  estimatedPrice            Float     // Stored on initial calculation (distance * price per km)
  currentAmount             Float     // Current negotiated amount
  customerNote              String?
  driverNote                String?
  status                    askStatus @default(PENDING)
  nearestPickupCityID       Int
  nearestWorkOrSchoolCityID Int
  nearestPickupCityName     String?
  nearestDropCityName       String?
  lastModifiedBy            String?   // 'customer' or 'driver'
  negotiationHistory        Json?     // Array of negotiation steps
  createdAt                 DateTime  @default(now())
  updatedAt                 DateTime  @updatedAt
  Driver                    Driver    @relation(fields: [driverId], references: [driver_id])
  Customer                  Customer  @relation(fields: [customerID], references: [customer_id])

  @@index([customerID])
  @@index([driverId])
  @@index([status])
}
```

### Updated `askStatus` Enum
```prisma
enum askStatus {
  PENDING          // Initial request sent by customer
  DRIVER_COUNTER   // Driver counter-offered
  CUSTOMER_COUNTER // Customer counter-offered
  ACCEPTED         // Both parties agreed
  REJECTED         // Request rejected
  ASSIGNED         // Successfully assigned to ChildRideRequest/StaffRideRequest
}
```

## Distance Calculation Logic

### Formula
```
Total Distance = 
  Distance(Pickup Location → Nearest Driver City from Pickup) +
  Distance(Nearest Driver City from Pickup → Nearest Driver City from School/Work) +
  Distance(Nearest Driver City from School/Work → School/Work Location)
```

### Implementation Steps
1. Find nearest driver city from customer's pickup location
2. Find nearest driver city from customer's school/work location
3. Calculate distances between points using Haversine formula or Google Distance Matrix API
4. Sum all distances

## Price Calculation Logic

### Formula
```
Estimated Price = Total Distance (km) × Price Per KM × Number of Days in Month
```

### Constants
- `PRICE_PER_KM_PER_DAY`: Rs. 15 (configurable)
- `AVERAGE_DAYS_PER_MONTH`: 26 (working days)
- `Monthly Price = Distance × 15 × 26`

## Backend Implementation

### 1. Driver Request Module Structure
```
backend/src/driver-request/
├── driver-request.controller.ts
├── driver-request.service.ts
├── driver-request.module.ts
└── dto/
    ├── index.ts
    ├── create-request.dto.ts
    ├── respond-request.dto.ts
    └── request-response.dto.ts
```

### 2. API Endpoints

#### Customer Endpoints
```typescript
// Create new ride request
POST /driver-request/create
Body: {
  customerId: number;
  profileType: 'child' | 'staff';
  profileId: number;
  driverId: number;
  vehicleId: number;
  customerNote?: string;
}
Response: RequestResponseDto

// Get customer's requests
GET /driver-request/customer/:customerId
Query: { status?: askStatus }
Response: RequestResponseDto[]

// Counter offer
POST /driver-request/:id/counter-offer
Body: {
  amount: number;
  note?: string;
}

// Accept driver's offer
POST /driver-request/:id/accept

// Reject request
POST /driver-request/:id/reject
Body: {
  reason?: string;
}
```

#### Driver Endpoints
```typescript
// Get driver's requests
GET /driver-request/driver/:driverId
Query: { status?: askStatus }
Response: RequestResponseDto[]

// Respond to request
POST /driver-request/:id/respond
Body: {
  action: 'ACCEPT' | 'REJECT' | 'COUNTER';
  amount?: number; // Required if action is COUNTER
  note?: string;
}
```

### 3. Service Methods

```typescript
class DriverRequestService {
  // Calculate distance and create request
  async createRequest(dto: CreateRequestDto): Promise<RequestResponseDto>;
  
  // Get requests for customer
  async getCustomerRequests(customerId: number, status?: askStatus): Promise<RequestResponseDto[]>;
  
  // Get requests for driver
  async getDriverRequests(driverId: number, status?: askStatus): Promise<RequestResponseDto[]>;
  
  // Customer counter offer
  async customerCounterOffer(requestId: number, amount: number, note?: string): Promise<RequestResponseDto>;
  
  // Driver respond
  async driverRespond(requestId: number, action: string, amount?: number, note?: string): Promise<RequestResponseDto>;
  
  // Accept request (final agreement)
  async acceptRequest(requestId: number, acceptedBy: string): Promise<RequestResponseDto>;
  
  // Reject request
  async rejectRequest(requestId: number, rejectedBy: string, reason?: string): Promise<RequestResponseDto>;
  
  // Transfer to ChildRideRequest/StaffRideRequest
  async assignRequest(requestId: number): Promise<void>;
  
  // Calculate estimated distance
  private async calculateEstimatedDistance(
    pickupLat: number,
    pickupLon: number,
    dropLat: number,
    dropLon: number,
    driverCityIds: number[]
  ): Promise<{
    totalDistance: number;
    nearestPickupCityId: number;
    nearestDropCityId: number;
    nearestPickupCityName: string;
    nearestDropCityName: string;
  }>;
  
  // Calculate price
  private calculatePrice(distanceKm: number): number;
}
```

## Frontend Implementation

### Customer App Changes

#### 1. Remove Request Button from Vehicle Cards
**File:** `mobile-customer/app/(menu)/(homeCards)/find_vehicle.tsx`
- Remove `requestedMap` state
- Remove `handleRequestVehicle` function
- Remove Request button from VehicleCard component

#### 2. Add Request Button to Transport Overview
**File:** `mobile-customer/app/(menu)/(homeCards)/transport_overview.tsx`

Add new section showing:
- Estimated Distance: X km
- Estimated Monthly Price: Rs. X,XXX
- Your Offer: Input field (pre-filled with estimated price)
- Note: Text area
- Send Request button

#### 3. Create Find Driver Menu Option
**File:** `mobile-customer/app/(menu)/find-driver.tsx` (NEW)

Two options:
1. Find New Vehicle → Navigate to find_vehicle screen
2. View Sent Requests → Navigate to request-list screen

#### 4. Create Request List Screen
**File:** `mobile-customer/app/(menu)/find-driver/request-list.tsx` (NEW)

Show list of requests with:
- Driver name and vehicle info
- Current status (Pending, Driver Counter, etc.)
- Current offered amount
- Last modified date
- Tap to view details

#### 5. Create Request Detail Screen
**File:** `mobile-customer/app/(menu)/find-driver/request-detail.tsx` (NEW)

Show:
- Driver and vehicle information
- Estimated distance and price
- Negotiation history timeline
- Current offer
- Actions based on status:
  - If PENDING: Cancel button
  - If DRIVER_COUNTER: Accept / Counter / Reject
  - If ACCEPTED: View details
  - If REJECTED: View reason

#### 6. Create API File
**File:** `mobile-customer/lib/api/driver-request.api.ts` (NEW)

```typescript
export interface CreateRequestParams {
  customerId: number;
  profileType: 'child' | 'staff';
  profileId: number;
  driverId: number;
  vehicleId: number;
  offeredAmount?: number;
  customerNote?: string;
}

export interface CounterOfferParams {
  requestId: number;
  amount: number;
  note?: string;
}

export interface RequestDetails {
  id: number;
  driverId: number;
  driverName: string;
  vehicleInfo: string;
  estimatedDistance: number;
  estimatedPrice: number;
  currentAmount: number;
  status: string;
  customerNote?: string;
  driverNote?: string;
  lastModifiedBy: string;
  negotiationHistory: Array<{
    offeredBy: string;
    amount: number;
    note?: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export const driverRequestApi = {
  createRequest: async (params: CreateRequestParams): Promise<RequestDetails>;
  getCustomerRequests: async (customerId: number, status?: string): Promise<RequestDetails[]>;
  counterOffer: async (params: CounterOfferParams): Promise<RequestDetails>;
  acceptOffer: async (requestId: number): Promise<RequestDetails>;
  rejectRequest: async (requestId: number, reason?: string): Promise<void>;
};
```

### Driver App Changes

#### 1. Replace Mark Attendance Card in Home
**File:** `mobile-driver/app/(tabs)/index.tsx`

Replace the attendance card/button with:
- "View Ride Requests" card
- Shows count of pending requests
- Navigate to request-list screen

#### 2. Create Request List Screen
**File:** `mobile-driver/app/requests/request-list.tsx` (NEW)

Show list with filters:
- All / Pending / Responded
- Each request shows:
  - Customer name
  - Child/Staff profile name
  - Pickup and drop locations
  - Estimated distance
  - Offered amount
  - Status
  - Date

#### 3. Create Request Detail Screen
**File:** `mobile-driver/app/requests/request-detail.tsx` (NEW)

Show:
- Customer and profile information
- Route details with cities
- Estimated distance
- Negotiation history
- Actions based on status:
  - If PENDING: Accept / Counter / Reject
  - If CUSTOMER_COUNTER: Accept / Counter / Reject
  - If ACCEPTED: Confirm Assignment

#### 4. Create API File
**File:** `mobile-driver/lib/api/driver-request.api.ts` (NEW)

```typescript
export interface RespondRequestParams {
  requestId: number;
  action: 'ACCEPT' | 'REJECT' | 'COUNTER';
  amount?: number;
  note?: string;
}

export const driverRequestApi = {
  getDriverRequests: async (driverId: number, status?: string): Promise<RequestDetails[]>;
  respondToRequest: async (params: RespondRequestParams): Promise<RequestDetails>;
};
```

## Negotiation Flow

### 1. Customer Sends Initial Request
```
1. Customer views vehicle in transport_overview
2. Sees estimated distance (e.g., 25 km) and price (e.g., Rs. 9,750)
3. Can modify offered amount or accept estimated
4. Adds optional note
5. Clicks "Send Request"
6. Status: PENDING
```

### 2. Driver Responds
```
Driver sees request with:
- Customer details
- Route details
- Estimated distance: 25 km
- Customer offered: Rs. 9,000

Options:
A. Accept → Status: ACCEPTED → Create assignment
B. Reject → Status: REJECTED
C. Counter (e.g., Rs. 9,500) → Status: DRIVER_COUNTER
```

### 3. Negotiation Continues
```
If driver countered:
Customer sees:
- Your offer: Rs. 9,000
- Driver counter: Rs. 9,500

Options:
A. Accept → Status: ACCEPTED → Create assignment
B. Reject → Status: REJECTED
C. Counter (e.g., Rs. 9,250) → Status: CUSTOMER_COUNTER

This continues until either:
- One party accepts → Create assignment
- One party rejects → End negotiation
```

### 4. Final Assignment
```
When status becomes ACCEPTED:
1. If staffOrChild === 'child':
   - Create entry in ChildRideRequest table
   - Set Amount to agreed price
   - Set status to PENDING
2. If staffOrChild === 'staff':
   - Create entry in StaffRideRequest table
   - Set Amount to agreed price
   - Set status to PENDING
3. Update askDriverRequest status to ASSIGNED
```

## Negotiation History Format

```json
{
  "negotiationHistory": [
    {
      "offeredBy": "customer",
      "amount": 9000,
      "note": "Can you do this price?",
      "timestamp": "2025-01-15T10:30:00Z"
    },
    {
      "offeredBy": "driver",
      "amount": 9500,
      "note": "How about this amount?",
      "timestamp": "2025-01-15T14:20:00Z"
    },
    {
      "offeredBy": "customer",
      "amount": 9250,
      "note": "Let's meet in the middle",
      "timestamp": "2025-01-15T16:45:00Z"
    },
    {
      "offeredBy": "driver",
      "amount": 9250,
      "note": "Accepted!",
      "timestamp": "2025-01-15T17:00:00Z",
      "action": "ACCEPT"
    }
  ]
}
```

## Migration Steps

1. Update schema: `npx prisma migrate dev --name add_ride_request_negotiation`
2. Generate Prisma client: `npx prisma generate`
3. Create driver-request module in backend
4. Implement all API endpoints
5. Create frontend API files
6. Update customer UI components
7. Update driver UI components
8. Test complete flow

## Configuration

Add to environment variables:
```env
# Pricing Configuration
PRICE_PER_KM_PER_DAY=15
AVERAGE_WORKING_DAYS_PER_MONTH=26
```

## Testing Checklist

- [ ] Customer can view estimated distance and price in transport_overview
- [ ] Customer can send initial request with custom amount
- [ ] Driver receives request notification
- [ ] Driver can view request details
- [ ] Driver can accept/reject/counter
- [ ] Customer receives driver's response
- [ ] Customer can counter-offer
- [ ] Negotiation history is properly stored
- [ ] Request is properly assigned to ChildRideRequest/StaffRideRequest on acceptance
- [ ] Proper error handling for all edge cases
- [ ] UI updates in real-time (consider WebSockets/polling)

## Status
✅ Schema updated
⏳ Backend implementation pending
⏳ Frontend implementation pending
