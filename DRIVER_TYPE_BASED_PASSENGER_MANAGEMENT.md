# Driver Type-Based Passenger Management Implementation

## 🎯 Overview
This feature implements intelligent passenger management based on driver type (School/Work/Both). The system now dynamically fetches and displays the appropriate passengers (children or staff) based on the driver's configured ride type.

---

## ✨ Key Features

### 1. **Driver Type Configuration**
- Drivers set their type during route setup: **School**, **Work**, or **Both**
- Stored in `DriverCities.rideType` field
- Determines which passengers are shown

### 2. **Dynamic Passenger Fetching**
- **School drivers** → See only children from `ChildRideRequest`
- **Work drivers** → See only staff from `StaffRideRequest`
- **Both drivers** → See combined children and staff

### 3. **Dynamic UI Labels**
- Labels automatically change based on driver type:
  - School: "Students", "Student"
  - Work: "Staff", "Staff Member"
  - Both: "Passengers", "Passenger"

### 4. **Separate Attendance Tracking**
- New `StaffAttendance` table for staff passengers
- Mirrors `Attendance` table structure
- Maintains separate attendance records for children and staff

---

## 📊 Database Changes

### New Model: StaffAttendance

```prisma
model StaffAttendance {
  id            Int            @id @default(autoincrement())
  driverId      Int
  staffId       Int            // References Staff_Passenger instead of Child
  waypointId    Int?
  latitude      Float?
  longitude     Float?
  notes         String?
  tripId        Int?
  status        String         @default("completed")
  timestamp     DateTime       @default(now())
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  date          DateTime       @db.Date
  type          AttendanceType
  Driver        Driver         @relation("StaffAttendance", fields: [driverId], references: [driver_id])
  Staff         Staff_Passenger @relation(fields: [staffId], references: [id])

  @@unique([driverId, staffId, date, type])
  @@index([staffId])
  @@index([date])
  @@index([driverId])
  @@index([timestamp])
  @@index([waypointId])
}
```

### Updated Relations

**Driver Model:**
```prisma
model Driver {
  // ... existing fields
  StaffAttendance  StaffAttendance[]  @relation("StaffAttendance")
  // ... other relations
}
```

**Staff_Passenger Model:**
```prisma
model Staff_Passenger {
  // ... existing fields
  StaffAttendance  StaffAttendance[]
  // ... other relations
}
```

---

## 🔧 Backend Implementation

### New Service Method: `getAssignedPassengers`

**Location:** `backend/src/driver/driver.service.ts`

**Functionality:**
1. Fetches driver's ride type from `DriverCities`
2. Based on ride type:
   - `School`: Queries `ChildRideRequest` for assigned children
   - `Work`: Queries `StaffRideRequest` for assigned staff
   - `Both`: Queries both tables

**Response Structure:**
```typescript
{
  success: true,
  rideType: 'School' | 'Work' | 'Both',
  children: [...],    // Only if School or Both
  staff: [...],       // Only if Work or Both
  total: number
}
```

### New API Endpoint

**Endpoint:** `GET /driver/assigned-passengers`  
**Auth:** JWT Required  
**Description:** Returns assigned passengers based on driver type

**Example Response (School Driver):**
```json
{
  "success": true,
  "rideType": "School",
  "children": [
    {
      "child_id": 1,
      "childFirstName": "John",
      "childLastName": "Doe",
      "school": "Royal College",
      "pickUpAddress": "123 Main St",
      "pickupLatitude": 6.9271,
      "pickupLongitude": 79.8612,
      "schoolLatitude": 6.9181,
      "schoolLongitude": 79.8742,
      "childImageUrl": "https://..."
    }
  ],
  "staff": [],
  "total": 1
}
```

**Example Response (Work Driver):**
```json
{
  "success": true,
  "rideType": "Work",
  "children": [],
  "staff": [
    {
      "id": 1,
      "customerId": 5,
      "nearbyCity": "Colombo",
      "workLocation": "Fort",
      "workAddress": "456 Business Tower",
      "pickupAddress": "789 Residence St",
      "pickupLatitude": 6.9271,
      "pickupLongitude": 79.8612,
      "workLatitude": 6.9181,
      "workLongitude": 79.8742,
      "staffFirstName": "Jane",
      "staffLastName": "Smith",
      "staffImageUrl": "https://..."
    }
  ],
  "total": 1
}
```

**Example Response (Both Driver):**
```json
{
  "success": true,
  "rideType": "Both",
  "children": [...],
  "staff": [...],
  "total": 5
}
```

---

## 📱 Mobile App Changes

### Updated Home Screen (`mobile-driver/app/(tabs)/index.tsx`)

#### New State Variables
```typescript
const [passengerCount, setPassengerCount] = useState<number>(0);
const [rideType, setRideType] = useState<'School' | 'Work' | 'Both' | null>(null);
```

#### New Helper Function
```typescript
const getPassengerLabel = (plural: boolean = false): string => {
  if (!rideType) return plural ? 'Passengers' : 'Passenger';
  if (rideType === 'School') return plural ? 'Students' : 'Student';
  if (rideType === 'Work') return plural ? 'Staff' : 'Staff Member';
  return plural ? 'Passengers' : 'Passenger'; // Both
};
```

#### Updated Data Fetching
```typescript
// Fetch assigned passengers based on driver type
const passengersResponse = await authenticatedFetch(
  `${API_BASE_URL}/driver/assigned-passengers`
);
if (passengersResponse.ok) {
  const passengersData = await passengersResponse.json();
  if (passengersData.success) {
    setRideType(passengersData.rideType);
    setPassengerCount(passengersData.total || 0);
  }
}
```

#### Dynamic UI Labels
```tsx
{/* Before */}
<Typography>Assigned Students</Typography>
<Typography>{studentCount} Students</Typography>

{/* After */}
<Typography>Assigned {getPassengerLabel(true)}</Typography>
<Typography>{passengerCount} {getPassengerLabel(passengerCount !== 1)}</Typography>
```

---

## 🎨 UI Behavior by Driver Type

### School Driver
```
┌─────────────────────────────────┐
│ Assigned Students               │
│ See All Students          →     │
├─────────────────────────────────┤
│ 👥 Today's Students             │
│                      5 Students │
└─────────────────────────────────┘
```

### Work Driver
```
┌─────────────────────────────────┐
│ Assigned Staff                  │
│ See All Staff             →     │
├─────────────────────────────────┤
│ 👥 Today's Staff                │
│                          3 Staff│
└─────────────────────────────────┘
```

### Both Driver
```
┌─────────────────────────────────┐
│ Assigned Passengers             │
│ See All Passengers        →     │
├─────────────────────────────────┤
│ 👥 Today's Passengers           │
│                   8 Passengers  │
└─────────────────────────────────┘
```

---

## 🔄 Data Flow

### 1. Driver Setup Flow
```
Driver Login
    ↓
Setup Route (SetupRouteCard)
    ↓
Select Ride Type (School/Work/Both)
    ↓
Save to DriverCities.rideType
    ↓
Complete Route Setup
```

### 2. Passenger Display Flow
```
Home Screen Load
    ↓
Fetch /driver/assigned-passengers
    ↓
Backend checks DriverCities.rideType
    ↓
If School → Query ChildRideRequest
If Work → Query StaffRideRequest
If Both → Query Both Tables
    ↓
Return appropriate passengers
    ↓
Frontend updates UI with dynamic labels
```

---

## 🧪 Testing Guide

### Prerequisites
```bash
# 1. Run database migration
cd backend
npx prisma migrate dev --name add_staff_attendance

# 2. Generate Prisma client
npx prisma generate

# 3. Restart backend
npm run start:dev

# 4. Restart mobile app
cd ../mobile-driver
npm start
```

### Test Case 1: School Driver

1. **Setup:**
   ```sql
   DELETE FROM "DriverCities" WHERE "driverId" = <DRIVER_ID>;
   
   -- Ensure driver has assigned children
   INSERT INTO "ChildRideRequest" ("childId", "driverId", "status")
   VALUES (1, <DRIVER_ID>, 'Assigned');
   ```

2. **Login as driver**
3. **Setup route with Ride Type = "School"**
4. **Expected Results:**
   - ✅ UI shows "Assigned Students"
   - ✅ UI shows "Today's Students"
   - ✅ Passenger count matches assigned children
   - ✅ API returns only children, no staff

5. **Verify API:**
   ```bash
   GET /driver/assigned-passengers
   Authorization: Bearer <JWT>
   
   Expected Response:
   {
     "success": true,
     "rideType": "School",
     "children": [...],
     "staff": [],
     "total": <number of children>
   }
   ```

### Test Case 2: Work Driver

1. **Setup:**
   ```sql
   DELETE FROM "DriverCities" WHERE "driverId" = <DRIVER_ID>;
   
   -- Ensure driver has assigned staff
   INSERT INTO "StaffRideRequest" ("staffId", "driverId", "status")
   VALUES (1, <DRIVER_ID>, 'Assigned');
   ```

2. **Login as driver**
3. **Setup route with Ride Type = "Work"**
4. **Expected Results:**
   - ✅ UI shows "Assigned Staff"
   - ✅ UI shows "Today's Staff"
   - ✅ Passenger count matches assigned staff
   - ✅ API returns only staff, no children

5. **Verify API:**
   ```bash
   GET /driver/assigned-passengers
   Authorization: Bearer <JWT>
   
   Expected Response:
   {
     "success": true,
     "rideType": "Work",
     "children": [],
     "staff": [...],
     "total": <number of staff>
   }
   ```

### Test Case 3: Both Driver

1. **Setup:**
   ```sql
   DELETE FROM "DriverCities" WHERE "driverId" = <DRIVER_ID>;
   
   -- Ensure driver has both children and staff assigned
   INSERT INTO "ChildRideRequest" ("childId", "driverId", "status")
   VALUES (1, <DRIVER_ID>, 'Assigned');
   
   INSERT INTO "StaffRideRequest" ("staffId", "driverId", "status")
   VALUES (1, <DRIVER_ID>, 'Assigned');
   ```

2. **Login as driver**
3. **Setup route with Ride Type = "Both"**
4. **Expected Results:**
   - ✅ UI shows "Assigned Passengers"
   - ✅ UI shows "Today's Passengers"
   - ✅ Passenger count = children + staff
   - ✅ API returns both children and staff

5. **Verify API:**
   ```bash
   GET /driver/assigned-passengers
   Authorization: Bearer <JWT>
   
   Expected Response:
   {
     "success": true,
     "rideType": "Both",
     "children": [...],
     "staff": [...],
     "total": <children count + staff count>
   }
   ```

### Test Case 4: Driver Without Route Setup

1. **Setup:**
   ```sql
   DELETE FROM "DriverCities" WHERE "driverId" = <DRIVER_ID>;
   ```

2. **Login as driver**
3. **Expected Results:**
   - ✅ Setup Route Card is displayed
   - ✅ No passenger section visible
   - ✅ API returns success: false

4. **Verify API:**
   ```bash
   GET /driver/assigned-passengers
   Authorization: Bearer <JWT>
   
   Expected Response:
   {
     "success": false,
     "message": "Driver route not set up",
     "rideType": null,
     "children": [],
     "staff": [],
     "total": 0
   }
   ```

---

## 📋 Files Modified

### Backend (3 files)

1. **`backend/prisma/schema.prisma`**
   - ✅ Added `StaffAttendance` model (alphabetically ordered)
   - ✅ Added `StaffAttendance` relation to `Driver` model
   - ✅ Added `StaffAttendance` relation to `Staff_Passenger` model

2. **`backend/src/driver/driver.service.ts`**
   - ✅ Added `getAssignedPassengers(driverId)` method
   - ✅ Fetches passengers based on driver's ride type
   - ✅ Returns structured response with children/staff

3. **`backend/src/driver/driver.controller.ts`**
   - ✅ Added `GET /driver/assigned-passengers` endpoint
   - ✅ JWT protected
   - ✅ Calls service method

### Frontend (1 file)

1. **`mobile-driver/app/(tabs)/index.tsx`**
   - ✅ Added `passengerCount` and `rideType` state
   - ✅ Added `getPassengerLabel()` helper function
   - ✅ Updated data fetching to use new endpoint
   - ✅ Dynamic UI labels based on ride type
   - ✅ Updated comments from "Children" to "Passengers"

---

## 🔍 Important Notes

### Routing Logic Unchanged
As requested, **all routing logic remains the same**:
- ✅ Morning and evening sessions work identically
- ✅ Route optimization unchanged
- ✅ Navigation logic unchanged
- ✅ The only change is **which passengers are fetched**

### Attendance Tracking
- Children use existing `Attendance` table
- Staff use new `StaffAttendance` table
- Both tables have identical structure
- Attendance logic remains the same

### Backward Compatibility
- `studentCount` state variable kept for compatibility
- Old endpoints still functional
- Gradual migration possible

---

## 🚀 Migration Steps

### 1. Database Migration
```bash
cd backend
npx prisma migrate dev --name add_staff_attendance
npx prisma generate
```

### 2. Restart Services
```bash
# Backend
npm run start:dev

# Mobile App (new terminal)
cd ../mobile-driver
npm start
```

### 3. Test with Different Driver Types
- Create/reset driver route setup
- Test with School, Work, and Both types
- Verify passenger counts and labels

---

## 💡 Future Enhancements

1. **Edit Driver Type** - Allow changing ride type after setup
2. **Mixed Route Optimization** - Different optimizations for children vs staff
3. **Separate Notifications** - Different notifications for children parents vs staff
4. **Analytics** - Separate metrics for school and work rides
5. **Payment Tracking** - Different pricing for school vs work passengers

---

## 📊 Database Migration Script

```sql
-- This is automatically generated by Prisma Migrate
-- Manual execution not required if using `npx prisma migrate dev`

CREATE TABLE "StaffAttendance" (
    "id" SERIAL NOT NULL,
    "driverId" INTEGER NOT NULL,
    "staffId" INTEGER NOT NULL,
    "waypointId" INTEGER,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "notes" TEXT,
    "tripId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "date" DATE NOT NULL,
    "type" "AttendanceType" NOT NULL,

    CONSTRAINT "StaffAttendance_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StaffAttendance_driverId_staffId_date_type_key" 
  ON "StaffAttendance"("driverId", "staffId", "date", "type");
  
CREATE INDEX "StaffAttendance_staffId_idx" ON "StaffAttendance"("staffId");
CREATE INDEX "StaffAttendance_date_idx" ON "StaffAttendance"("date");
CREATE INDEX "StaffAttendance_driverId_idx" ON "StaffAttendance"("driverId");
CREATE INDEX "StaffAttendance_timestamp_idx" ON "StaffAttendance"("timestamp");
CREATE INDEX "StaffAttendance_waypointId_idx" ON "StaffAttendance"("waypointId");

ALTER TABLE "StaffAttendance" 
  ADD CONSTRAINT "StaffAttendance_driverId_fkey" 
  FOREIGN KEY ("driverId") REFERENCES "Driver"("driver_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "StaffAttendance" 
  ADD CONSTRAINT "StaffAttendance_staffId_fkey" 
  FOREIGN KEY ("staffId") REFERENCES "Staff_Passenger"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

---

## ✅ Completion Checklist

- [x] StaffAttendance table created
- [x] Relations added to Driver and Staff_Passenger
- [x] Backend service method implemented
- [x] Backend API endpoint created
- [x] Frontend state management updated
- [x] Dynamic UI labels implemented
- [x] Passenger fetching based on driver type
- [ ] Database migration run
- [ ] Manual testing completed
- [ ] All driver types tested (School/Work/Both)

---

## 🎯 Status

✅ **Implementation Complete**  
⏳ **Pending**: Database Migration + Testing

Ready for migration and testing!

---

**Last Updated**: October 21, 2025  
**Version**: 1.0.0
