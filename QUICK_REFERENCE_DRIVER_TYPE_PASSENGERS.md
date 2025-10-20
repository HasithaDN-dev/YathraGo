# Quick Reference: Driver Type-Based Passengers

## 🎯 What Changed?

The driver app now shows different passengers based on the driver's type:
- **School** → Shows only children
- **Work** → Shows only staff
- **Both** → Shows both children and staff

---

## 📦 Implementation Summary

### Database
✅ New table: `StaffAttendance` (same structure as `Attendance` but for staff)

### Backend
✅ New endpoint: `GET /driver/assigned-passengers`  
✅ Returns passengers based on driver's ride type

### Frontend
✅ Dynamic labels: "Students", "Staff", or "Passengers"  
✅ Auto-updates based on driver type

---

## 🔧 Required Migration

```bash
cd backend
npx prisma migrate dev --name add_staff_attendance
npx prisma generate
npm run start:dev
```

---

## 📡 New API Endpoint

**Endpoint:** `GET /driver/assigned-passengers`

**Response for School Driver:**
```json
{
  "success": true,
  "rideType": "School",
  "children": [...],
  "staff": [],
  "total": 5
}
```

**Response for Work Driver:**
```json
{
  "success": true,
  "rideType": "Work",
  "children": [],
  "staff": [...],
  "total": 3
}
```

**Response for Both Driver:**
```json
{
  "success": true,
  "rideType": "Both",
  "children": [...],
  "staff": [...],
  "total": 8
}
```

---

## 🎨 UI Changes

### School Driver UI
```
Assigned Students
Today's Students: 5 Students
```

### Work Driver UI
```
Assigned Staff
Today's Staff: 3 Staff
```

### Both Driver UI
```
Assigned Passengers
Today's Passengers: 8 Passengers
```

---

## 🧪 Quick Test

### 1. School Driver Test
```sql
-- Setup
DELETE FROM "DriverCities" WHERE "driverId" = 1;

-- Login and setup route with type "School"
-- Expected: See only children, labels say "Students"
```

### 2. Work Driver Test
```sql
-- Setup
DELETE FROM "DriverCities" WHERE "driverId" = 1;

-- Login and setup route with type "Work"
-- Expected: See only staff, labels say "Staff"
```

### 3. Both Driver Test
```sql
-- Setup
DELETE FROM "DriverCities" WHERE "driverId" = 1;

-- Login and setup route with type "Both"
-- Expected: See all passengers, labels say "Passengers"
```

---

## 📋 Files Changed

| File | Changes |
|------|---------|
| `backend/prisma/schema.prisma` | Added StaffAttendance model |
| `backend/src/driver/driver.service.ts` | Added getAssignedPassengers method |
| `backend/src/driver/driver.controller.ts` | Added /assigned-passengers endpoint |
| `mobile-driver/app/(tabs)/index.tsx` | Dynamic labels and new API call |

---

## ✅ Key Features

✅ Automatic passenger filtering based on driver type  
✅ Dynamic UI labels (Students/Staff/Passengers)  
✅ Separate attendance tracking (Attendance/StaffAttendance)  
✅ No changes to routing logic  
✅ Backward compatible  

---

## 🚀 Next Steps

1. Run database migration
2. Restart backend and mobile app
3. Test all three driver types
4. Verify passenger counts and labels

---

## 📊 Driver Type Logic

```
Driver Type = School
    ↓
Query: ChildRideRequest
Display: "Students"
Attendance: Attendance table

Driver Type = Work
    ↓
Query: StaffRideRequest
Display: "Staff"
Attendance: StaffAttendance table

Driver Type = Both
    ↓
Query: Both tables
Display: "Passengers"
Attendance: Both tables
```

---

## 💡 Important Notes

- **Routing unchanged** - Morning/evening sessions work the same
- **Chat/Payment unchanged** - Feature only affects passenger display
- **StaffAttendance** - New table with same structure as Attendance
- **Backward compatible** - Old code still works

---

**Status**: ✅ Ready for Migration  
**Docs**: `DRIVER_TYPE_BASED_PASSENGER_MANAGEMENT.md`
