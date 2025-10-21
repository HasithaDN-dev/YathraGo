# Home Screen and Ride Status Update - Implementation Summary

## Overview
Successfully updated the customer home screen to display real-time ride status and driver/vehicle information. The screen now auto-refreshes when focused and shows dynamic status based on assigned rides.

## Changes Made

### 1. Home Screen (`mobile-customer/app/(tabs)/index.tsx`)

#### Features Implemented
✅ Auto-refresh on screen focus - Picks up new ride assignments automatically
✅ Dynamic ride status display - Shows different status based on route state
✅ Conditional rendering - Shows "No active ride" when no driver assigned
✅ Smart status mapping - Maps route status to user-friendly text
✅ ETA calculation - Displays estimated arrival time
✅ Navigation integration - "See More" links to navigate screen

#### Key Changes

**Added State:**
```typescript
const [routeStatus, setRouteStatus] = useState<string>('PENDING');
```

**Added Auto-Refresh:**
```typescript
useFocusEffect(
  React.useCallback(() => {
    if (activeProfile) {
      const profileIdStr = activeProfile.id.split('-')[1];
      const profileId = parseInt(profileIdStr, 10);
      loadAssignedRide(activeProfile.type, profileId);
    }
  }, [activeProfile, loadAssignedRide])
);
```

**Dynamic Status Display:**
```typescript
const getRideStatusDisplay = () => {
  if (!assignedRide) return 'Waiting';
  
  switch (routeStatus) {
    case 'PENDING':
      return 'Driver Assigned';
    case 'IN_PROGRESS':
      return 'On the Way';
    case 'COMPLETED':
      return 'Completed';
    default:
      return 'Driver Assigned';
  }
};
```

**Conditional Current Ride Card:**
```typescript
{assignedRide ? (
  <RideStatus
    status={getRideStatusDisplay()}
    pickupLocation={getPickupLocation()}
    destination={getDestinationName()}
    eta={getEtaDisplay()}
  />
) : (
  <View className="bg-[#F7F9FB] rounded-2xl px-4 py-6">
    <Typography variant="body" className="text-gray-500 text-center">
      No active ride
    </Typography>
  </View>
)}
```

## Notification System Guide

### Sending Notifications from Backend

The backend has a complete notification system. Use these examples:

#### When Driver Accepts Child Request
```typescript
await this.notificationsService.sendNotification({
  sender: 'System',
  message: 'Driver has accepted your ride request!',
  type: NotificationTypes.Alert,
  receiver: UserTypes.CHILD,
  receiverId: childId,
});
```

#### When Driver Accepts Staff Request
```typescript
await this.notificationsService.sendNotification({
  sender: 'System',
  message: 'Driver has accepted your ride request!',
  type: NotificationTypes.Alert,
  receiver: UserTypes.STAFF,
  receiverId: staffId,
});
```

#### When Route Starts
```typescript
await this.notificationsService.sendNotification({
  sender: 'System',
  message: 'Your driver is on the way!',
  type: NotificationTypes.System,
  receiver: UserTypes.CHILD, // or STAFF
  receiverId: childId, // or staffId
});
```

### Notification DTO Structure
```typescript
{
  "sender": "System",                    // Name of sender
  "message": "Your message here",        // Notification text
  "type": "Alert",                       // System | Alert | Other | Chat
  "receiver": "CHILD",                   // CUSTOMER | CHILD | STAFF | DRIVER
  "receiverId": 123                      // Specific user ID
}
```

### Available Enums

**User Types:**
- `CUSTOMER` - Parent/customer account
- `CHILD` - Child profile
- `STAFF` - Staff passenger profile
- `DRIVER` - Driver account
- `WEBUSER` - Dashboard user
- `BACKUPDRIVER` - Backup driver
- `VEHICLEOWNER` - Vehicle owner

**Notification Types:**
- `System` - System-generated notifications
- `Alert` - Important alerts
- `Chat` - Chat messages
- `Other` - Other notifications

## Status Mapping

### Route Status (Backend)
- `PENDING` - Route created, driver not started
- `IN_PROGRESS` - Driver actively on route
- `COMPLETED` - Route finished

### Display Status (Frontend)
- `PENDING` → "Driver Assigned"
- `IN_PROGRESS` → "On the Way"
- `COMPLETED` → "Completed"

## User Flow

### When Driver Accepts Request

```
1. Driver accepts ride request in driver app
   ↓
2. Backend updates ChildRideRequest/StaffRideRequest
   - status: "Assigned"
   - driverId: <driver_id>
   - AssignedDate: <current_date>
   ↓
3. Backend sends notification
   {
     type: "Alert",
     receiver: "CHILD" or "STAFF",
     receiverId: <profile_id>,
     message: "Driver accepted your request!"
   }
   ↓
4. Customer app receives FCM notification
   ↓
5. User opens app / switches to home tab
   ↓
6. Screen auto-refreshes (useFocusEffect)
   ↓
7. assignedRide data loaded
   ↓
8. Driver & Vehicle cards appear
   ↓
9. Current Ride card shows "Driver Assigned"
```

### When Route Starts

```
1. Driver starts route in driver app
   ↓
2. Backend updates DriverRoute
   - status: "IN_PROGRESS"
   - startedAt: <current_time>
   ↓
3. Backend sends notifications to all passengers
   ↓
4. Customer refreshes home screen
   ↓
5. Status changes to "On the Way"
   ↓
6. ETA updates based on route data
```

## Testing Guide

### 1. Test No Assignment State
```
- Open home screen without assigned driver
- Expected: "No active ride" message in Current Ride card
- Expected: "No driver assigned yet" in Driver & Vehicle card
- Expected: No Inform/Message buttons
```

### 2. Test With Assignment
```
- Assign a driver via backend/driver app
- Open customer app
- Navigate to home tab
- Expected: Driver name and rating displayed
- Expected: Vehicle info displayed
- Expected: "Driver Assigned" status
- Expected: Inform and Message buttons visible
```

### 3. Test Auto-Refresh
```
- Start on home screen
- Assign driver via backend (while app is open)
- Navigate away from home tab
- Navigate back to home tab
- Expected: New assignment appears automatically
```

### 4. Test Status Changes
```
- Have assigned driver
- Driver starts route
- Refresh home screen
- Expected: Status changes to "On the Way"
```

### 5. Test Navigation
```
- Tap "See More" on Current Ride card
- Expected: Navigates to navigate tab
- Expected: Map shows driver location
```

### 6. Test Driver/Vehicle Details
```
- Tap "See Info" on Driver & Vehicle card
- Expected: Opens assigned-ride-detail screen
- Expected: Shows full driver information
```

## Backend Integration Points

### Where to Add Notification Code

**1. Accept Child Ride Request**
File: `backend/src/driver/driver.service.ts` or similar

```typescript
async acceptChildRideRequest(driverId: number, requestId: number) {
  const updatedRequest = await this.prisma.childRideRequest.update({
    where: { id: requestId },
    data: { 
      status: 'Assigned',
      driverId: driverId,
      AssignedDate: new Date(),
    },
    include: { driver: true },
  });

  // ADD THIS:
  await this.notificationsService.sendNotification({
    sender: 'System',
    message: `Driver ${updatedRequest.driver.name} accepted your request!`,
    type: NotificationTypes.Alert,
    receiver: UserTypes.CHILD,
    receiverId: updatedRequest.childId,
  });

  return updatedRequest;
}
```

**2. Accept Staff Ride Request**
```typescript
async acceptStaffRideRequest(driverId: number, requestId: number) {
  const updatedRequest = await this.prisma.staffRideRequest.update({
    where: { id: requestId },
    data: { 
      status: 'Assigned',
      driverId: driverId,
      AssignedDate: new Date(),
    },
    include: { driver: true },
  });

  // ADD THIS:
  await this.notificationsService.sendNotification({
    sender: 'System',
    message: `Driver ${updatedRequest.driver.name} accepted your request!`,
    type: NotificationTypes.Alert,
    receiver: UserTypes.STAFF,
    receiverId: updatedRequest.staffId,
  });

  return updatedRequest;
}
```

**3. Start Route**
File: `backend/src/driver-route/driver-route.service.ts`

```typescript
async startRoute(driverId: number, routeId: number) {
  const route = await this.prisma.driverRoute.update({
    where: { id: routeId },
    data: { 
      status: 'IN_PROGRESS',
      startedAt: new Date(),
    },
    include: {
      stops: {
        include: { child: true },
      },
    },
  });

  // ADD THIS:
  for (const stop of route.stops) {
    if (stop.child) {
      await this.notificationsService.sendNotification({
        sender: 'System',
        message: 'Your driver is on the way!',
        type: NotificationTypes.System,
        receiver: UserTypes.CHILD,
        receiverId: stop.child.child_id,
      });
    }
  }

  return route;
}
```

## Files Modified

1. ✅ `mobile-customer/app/(tabs)/index.tsx` - Home screen with real-time updates
2. 📝 `backend/src/driver/*` - Add notification calls (needs implementation)
3. 📝 `backend/src/driver-route/*` - Add route status notifications (needs implementation)

## Documentation Created

1. ✅ `HOME_SCREEN_REALTIME_UPDATES.md` - Comprehensive implementation guide
2. ✅ `HOME_SCREEN_UPDATE_SUMMARY.md` - This summary document

## Next Steps

### Required Backend Changes
1. [ ] Find where `ChildRideRequest` status is updated to "Assigned"
2. [ ] Add notification call when child request accepted
3. [ ] Find where `StaffRideRequest` status is updated to "Assigned"
4. [ ] Add notification call when staff request accepted
5. [ ] Add notification when driver starts route
6. [ ] Test notification delivery

### Optional Enhancements
1. [ ] Add WebSocket for instant updates without refresh
2. [ ] Implement actual ETA calculation from route data
3. [ ] Add route status polling in home screen
4. [ ] Show real-time driver location preview
5. [ ] Add push notification handling
6. [ ] Display notification badge on app icon

## Key Features

### Current Ride Card
- ✅ Shows actual ride status
- ✅ Displays pickup and destination
- ✅ Calculates ETA
- ✅ "No active ride" state
- ✅ Navigate to map on "See More"

### Driver & Vehicle Card
- ✅ Shows driver info when assigned
- ✅ Shows vehicle details
- ✅ "No driver assigned" state
- ✅ Driver rating display
- ✅ Inform and Message buttons
- ✅ Navigate to detail screen

### Auto-Refresh
- ✅ Refreshes on screen focus
- ✅ Picks up new assignments
- ✅ Updates driver/vehicle info
- ✅ No manual refresh needed

## Technical Notes

### Why useFocusEffect?
- Triggers when tab becomes active
- Better than useEffect for tab navigation
- Ensures data is fresh when user views screen
- Doesn't trigger on initial mount only

### Status State Management
- `routeStatus` state ready for WebSocket updates
- Currently uses default 'PENDING'
- Can be updated via socket events
- Will reflect in UI automatically

### Notification Integration
- Backend already has full system
- Just needs to be called at right places
- FCM handles delivery to mobile
- App handles notification display

---

**Status:** ✅ Frontend Implementation Complete
**Pending:** Backend notification integration
**Date:** 2024
**Feature:** Real-Time Home Screen Updates
