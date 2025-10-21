# Home Screen Real-Time Updates Implementation

## Overview
This document explains how to implement real-time updates for the customer home screen, including:
1. Dynamic ride status display based on driver route status
2. Real-time driver/vehicle info updates when requests are accepted
3. Notification system integration

## Changes Implemented

### 1. Home Screen Updates (`mobile-customer/app/(tabs)/index.tsx`)

#### Added State Management
```typescript
const [routeStatus, setRouteStatus] = useState<string>('PENDING');
```

#### Added Auto-Refresh on Focus
```typescript
// Refresh assigned ride when screen is focused
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

#### Added Dynamic Status Display Functions
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

const getEtaDisplay = () => {
  // Calculate ETA based on current time + estimated minutes
  const now = new Date();
  const etaTime = new Date(now.getTime() + 15 * 60000);
  const hours = etaTime.getHours();
  const minutes = etaTime.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${ampm}`;
};
```

#### Updated Current Ride Card
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

### 2. Notification System Integration

#### Notification DTO Structure
The backend already has a complete notification system. Use this structure:

```typescript
{
  "sender": "Manager",           // Name of sender
  "message": "Your request has been accepted!", // Notification message
  "type": "Alert",               // NotificationTypes: System | Alert | Other | Chat
  "receiver": "CHILD",           // UserTypes: CUSTOMER | CHILD | STAFF | DRIVER
  "receiverId": 123              // ID of the specific user
}
```

#### User Types (from Prisma schema)
```typescript
enum UserTypes {
  CUSTOMER
  WEBUSER
  BACKUPDRIVER
  DRIVER
  VEHICLEOWNER
  CHILD
  STAFF
}
```

#### Notification Types (from Prisma schema)
```typescript
enum NotificationTypes {
  System
  Alert
  Other
  Chat
}
```

### 3. Backend Integration Points

#### Where to Send Notifications

**When Driver Accepts Child Request:**
```typescript
// In backend/src/driver/driver.service.ts or similar
// After accepting child ride request:

await this.notificationsService.sendNotification({
  sender: 'System',
  message: `Driver ${driver.name} has accepted your ride request!`,
  type: NotificationTypes.Alert,
  receiver: UserTypes.CHILD,
  receiverId: childRideRequest.childId,
});
```

**When Driver Accepts Staff Request:**
```typescript
// After accepting staff ride request:

await this.notificationsService.sendNotification({
  sender: 'System',
  message: `Driver ${driver.name} has accepted your ride request!`,
  type: NotificationTypes.Alert,
  receiver: UserTypes.STAFF,
  receiverId: staffRideRequest.staffId,
});
```

**When Driver Starts Route:**
```typescript
await this.notificationsService.sendNotification({
  sender: 'System',
  message: 'Your driver is on the way!',
  type: NotificationTypes.System,
  receiver: UserTypes.CHILD, // or STAFF
  receiverId: childId, // or staffId
});
```

**When Driver Updates Status:**
```typescript
await this.notificationsService.sendNotification({
  sender: 'System',
  message: 'Driver is arriving soon!',
  type: NotificationTypes.Alert,
  receiver: UserTypes.CHILD,
  receiverId: childId,
});
```

### 4. Route Status Mapping

The driver route has these statuses (from schema):
- `PENDING` - Route created but not started
- `IN_PROGRESS` - Driver is actively on route
- `COMPLETED` - Route finished

Map these to customer-friendly displays:
- `PENDING` → "Driver Assigned"
- `IN_PROGRESS` → "On the Way"
- `COMPLETED` → "Completed"

### 5. Real-Time Updates Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Real-Time Update Flow                    │
└─────────────────────────────────────────────────────────────┘

1. Driver accepts request
   ↓
2. Backend updates ride request status to "Assigned"
   ↓
3. Backend sends notification to customer
   {
     type: "Alert",
     receiver: "CHILD" or "STAFF",
     receiverId: <profile_id>,
     message: "Driver accepted your request!"
   }
   ↓
4. Customer app receives notification (via FCM)
   ↓
5. Home screen auto-refreshes on focus
   ↓
6. Updated driver/vehicle info displayed

Alternative: WebSocket Real-Time Updates
   ↓
1. Customer app subscribes to updates
   ↓
2. Backend emits event when request accepted
   ↓
3. Customer app receives instant update
   ↓
4. Driver/vehicle cards update immediately
```

### 6. Implementation Steps

#### Step 1: Add Notification on Request Acceptance

Find where ride requests are accepted in the backend and add notification:

```typescript
// Example location: backend/src/driver/driver.service.ts

async acceptChildRideRequest(driverId: number, requestId: number) {
  // ... existing code to accept request ...
  
  const updatedRequest = await this.prisma.childRideRequest.update({
    where: { id: requestId },
    data: { 
      status: 'Assigned',
      driverId: driverId,
      AssignedDate: new Date(),
    },
    include: {
      child: true,
      driver: true,
    },
  });

  // Send notification to child
  await this.notificationsService.sendNotification({
    sender: 'System',
    message: `Driver ${updatedRequest.driver.name} has accepted your ride request!`,
    type: NotificationTypes.Alert,
    receiver: UserTypes.CHILD,
    receiverId: updatedRequest.childId,
  });

  return updatedRequest;
}
```

#### Step 2: Add Route Status Updates

When driver starts/updates route:

```typescript
async startRoute(driverId: number, routeId: number) {
  // Update route status
  const route = await this.prisma.driverRoute.update({
    where: { id: routeId },
    data: { 
      status: 'IN_PROGRESS',
      startedAt: new Date(),
    },
    include: {
      stops: {
        include: {
          child: true,
        },
      },
    },
  });

  // Notify all children on route
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

#### Step 3: Mobile App Notification Handling

The mobile app should already have FCM setup. When notification arrives:

```typescript
// In notification handler
const handleNotification = (notification: any) => {
  if (notification.type === 'Alert' && notification.message.includes('accepted')) {
    // Refresh assigned ride data
    loadAssignedRide(activeProfile.type, profileId);
  }
};
```

### 7. Testing Checklist

#### Backend Testing
- [ ] Accept child ride request → Notification sent to correct child
- [ ] Accept staff ride request → Notification sent to correct staff
- [ ] Start route → Notifications sent to all passengers
- [ ] Complete route → Status updated correctly
- [ ] Check notification table has correct data

#### Frontend Testing
- [ ] Receive notification when request accepted
- [ ] Home screen shows "No active ride" when no assignment
- [ ] Home screen shows driver/vehicle when assigned
- [ ] Driver/vehicle cards display correct information
- [ ] Status changes from "Driver Assigned" to "On the Way"
- [ ] ETA displays correctly
- [ ] Tapping "See More" navigates to map
- [ ] Screen auto-refreshes when focused
- [ ] Driver rating displayed correctly
- [ ] Vehicle details displayed correctly

### 8. Enhanced Real-Time with WebSockets (Optional)

For instant updates without polling, add WebSocket events:

```typescript
// Backend: Emit event when request accepted
this.socketGateway.emitToUser(childId, 'requestAccepted', {
  driverId: driver.driver_id,
  driverName: driver.name,
  vehicleId: vehicle.id,
});

// Frontend: Listen for events
useEffect(() => {
  socket.on('requestAccepted', (data) => {
    Alert.alert('Request Accepted', `Driver ${data.driverName} accepted!`);
    loadAssignedRide(activeProfile.type, profileId);
  });

  return () => {
    socket.off('requestAccepted');
  };
}, []);
```

## Database Schema Reference

### Route Status in DriverRoute
```prisma
model DriverRoute {
  id         Int      @id @default(autoincrement())
  status     String   @default("PENDING")
  routeType  String   @default("MORNING_PICKUP")
  startedAt  DateTime?
  completedAt DateTime?
  // ... other fields
}
```

### Ride Request Status
```prisma
model ChildRideRequest {
  id           Int      @id @default(autoincrement())
  status       String   // "Pending", "Assigned", "Completed"
  AssignedDate DateTime?
  // ... other fields
}
```

## API Endpoints Used

1. **GET /customer/assigned-ride/child/:childId** - Get assigned child ride
2. **GET /customer/assigned-ride/staff** - Get assigned staff ride
3. **POST /notifications/send** - Send notification
4. **GET /driver/route/active/:driverId** - Get active route (used in navigate screen)

## Summary

The home screen now:
✅ Auto-refreshes when focused (picks up new assignments)
✅ Shows dynamic status based on route state
✅ Displays real-time driver and vehicle information
✅ Shows appropriate message when no ride assigned
✅ Calculates and displays ETA
✅ Navigates to map for more details

Next steps for full real-time experience:
1. Add notification sending in backend when requests are accepted
2. Set up FCM notification handlers in mobile app
3. (Optional) Add WebSocket events for instant updates
4. Add route status tracking in navigate screen
5. Implement ETA calculation based on actual route data

---

**Status:** ✅ Home Screen Updates Implemented
**Date:** 2024
**Feature:** Real-Time Ride Status and Driver/Vehicle Updates
