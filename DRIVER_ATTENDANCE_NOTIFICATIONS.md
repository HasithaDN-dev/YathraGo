# Driver Attendance Notification Implementation

## Overview
Implemented automatic notification system that sends notifications to children or staff when a driver marks their attendance (pickup/dropoff) during morning or evening routes.

## Implementation Summary

### Files Modified

#### 1. `backend/src/driver-route/driver-route.module.ts`
- **Added**: Import of `NotificationsModule` 
- **Purpose**: Enable the driver-route module to use the notifications service

```typescript
imports: [PrismaModule, NotificationsModule]
```

#### 2. `backend/src/driver-route/driver-route.service.ts`

**Added Imports:**
```typescript
import { NotificationsService } from '../notifications/notifications.service';
```

**Updated Constructor:**
```typescript
constructor(
  private prisma: PrismaService,
  private vrpOptimizer: VRPOptimizerService,
  private notificationsService: NotificationsService,
) {}
```

**Modified `markStopCompleted` method:**
- After creating attendance records for children or staff, the system now sends notifications
- For **Work Drivers** (Staff): Sends notification to STAFF with the staff ID
- For **School Drivers** (Children): Sends notification to CHILD with the child ID
- Notifications use the existing `/notifications/send` endpoint
- Error handling ensures notification failures don't break attendance marking

**Added Helper Method:**
```typescript
private getNotificationMessage(attendanceType): string
```
- Generates appropriate notification message based on attendance type:
  - `MORNING_PICKUP` → "Your morning pickup has been completed"
  - `MORNING_DROPOFF` → "Your morning dropoff has been completed"
  - `EVENING_PICKUP` → "Your evening pickup has been completed"
  - `EVENING_DROPOFF` → "Your evening dropoff has been completed"

## Notification Data Format

When a driver marks attendance, the following notification is sent:

```json
{
  "sender": "Driver",
  "message": "Your morning pickup has been completed",
  "type": "System",
  "receiver": "CHILD",  // or "STAFF" for work drivers
  "receiverId": 123     // Child ID or Staff ID
}
```

### Notification Fields Explained:
- **sender**: Always "Driver" (as requested)
- **message**: Auto-generated based on the attendance type (morning/evening pickup/dropoff)
- **type**: Always "System" (NotificationTypes enum)
- **receiver**: Either "CHILD" or "STAFF" (UserTypes enum)
  - CHILD: For school drivers marking attendance for students
  - STAFF: For work drivers marking attendance for staff members
- **receiverId**: The ID of the specific child or staff member whose attendance was marked

## Flow of Execution

1. **Driver marks stop as completed** via `PATCH /driver/route/stop/:stopId/complete`
2. **System determines attendance type** based on:
   - Route type (MORNING_PICKUP or AFTERNOON_DROPOFF)
   - Stop type (PICKUP or DROPOFF)
3. **System checks driver ride type** to determine if passenger is child or staff
4. **Attendance record is created** in appropriate table:
   - `Attendance` table for children (school drivers)
   - `StaffAttendance` table for staff (work drivers)
5. **Notification is sent** to the appropriate recipient:
   - Child (if school driver)
   - Staff (if work driver)
6. **Error handling**: If notification fails, error is logged but attendance marking succeeds

## Key Features

### ✅ Automatic Detection
- Automatically detects if the driver is a school driver or work driver
- Routes notification to correct recipient type (CHILD vs STAFF)

### ✅ Session-Aware
- Differentiates between morning and evening routes
- Generates appropriate message for each combination of route type and stop type

### ✅ Robust Error Handling
- Notification failures are logged but don't break attendance marking
- Try-catch blocks ensure the core functionality (attendance marking) always succeeds

### ✅ No Schema Changes
- Uses existing notification infrastructure
- No database schema modifications required
- No changes to mobile-customer files

## Testing

To test the implementation:

1. **Start a route** as a driver (morning or evening)
2. **Mark a stop as completed** for a child or staff member
3. **Verify**:
   - Attendance record is created in the database
   - Notification is sent to the appropriate child/staff profile
   - Notification appears in the child/staff notification list

### Expected Scenarios:

| Driver Type | Route Type | Stop Type | Receiver | Message |
|------------|-----------|-----------|----------|---------|
| School | MORNING_PICKUP | PICKUP | CHILD | "Your morning pickup has been completed" |
| School | MORNING_PICKUP | DROPOFF | CHILD | "Your morning dropoff has been completed" |
| School | AFTERNOON_DROPOFF | PICKUP | CHILD | "Your evening pickup has been completed" |
| School | AFTERNOON_DROPOFF | DROPOFF | CHILD | "Your evening dropoff has been completed" |
| Work | MORNING_PICKUP | PICKUP | STAFF | "Your morning pickup has been completed" |
| Work | MORNING_PICKUP | DROPOFF | STAFF | "Your morning dropoff has been completed" |
| Work | AFTERNOON_DROPOFF | PICKUP | STAFF | "Your evening pickup has been completed" |
| Work | AFTERNOON_DROPOFF | DROPOFF | STAFF | "Your evening dropoff has been completed" |

## Notes

- The notification system uses the existing NotificationsService
- Notifications are sent via the `/notifications/send` endpoint
- The mobile customer side does not need any changes - it will automatically receive notifications through the existing notification infrastructure
- The implementation only touches the mobile-driver backend logic
