# Notification System Quick Reference

## Send Notification Examples

### Basic Structure
```typescript
await this.notificationsService.sendNotification({
  sender: string,              // Who sent it
  message: string,             // Message content
  type: NotificationTypes,     // System | Alert | Other | Chat
  receiver: UserTypes,         // Who receives it
  receiverId?: number          // Specific user (optional for broadcast)
});
```

## User Types Reference

```typescript
enum UserTypes {
  CUSTOMER       // Parent/customer account
  WEBUSER        // Dashboard admin
  BACKUPDRIVER   // Backup driver
  DRIVER         // Regular driver
  VEHICLEOWNER   // Vehicle owner
  CHILD          // Child profile
  STAFF          // Staff passenger
}
```

## Notification Types Reference

```typescript
enum NotificationTypes {
  System   // System-generated messages
  Alert    // Important alerts
  Other    // General notifications
  Chat     // Chat messages
}
```

## Common Scenarios

### 1. Notify Child - Request Accepted
```typescript
await this.notificationsService.sendNotification({
  sender: 'System',
  message: 'Your ride request has been accepted!',
  type: NotificationTypes.Alert,
  receiver: UserTypes.CHILD,
  receiverId: childId,
});
```

### 2. Notify Staff - Request Accepted
```typescript
await this.notificationsService.sendNotification({
  sender: 'System',
  message: 'Your ride request has been accepted!',
  type: NotificationTypes.Alert,
  receiver: UserTypes.STAFF,
  receiverId: staffId,
});
```

### 3. Notify Driver - New Request
```typescript
await this.notificationsService.sendNotification({
  sender: 'System',
  message: 'New ride request received!',
  type: NotificationTypes.Alert,
  receiver: UserTypes.DRIVER,
  receiverId: driverId,
});
```

### 4. Notify Child - Driver On Way
```typescript
await this.notificationsService.sendNotification({
  sender: 'System',
  message: 'Your driver is on the way!',
  type: NotificationTypes.System,
  receiver: UserTypes.CHILD,
  receiverId: childId,
});
```

### 5. Broadcast to All Children
```typescript
await this.notificationsService.sendNotification({
  sender: 'Admin',
  message: 'Important announcement for all students',
  type: NotificationTypes.System,
  receiver: UserTypes.CHILD,
  // No receiverId = broadcast to all children
});
```

### 6. Chat Message Notification
```typescript
await this.notificationsService.sendNotification({
  sender: 'Manager',
  message: 'New message from manager',
  type: NotificationTypes.Chat,
  receiver: UserTypes.DRIVER,
  receiverId: driverId,
  conversationId: 123,  // Optional conversation ID
});
```

## Integration Points

### Where to Add Notifications

**File: `backend/src/driver/driver.service.ts` or similar**

```typescript
// Import at top
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationTypes, UserTypes } from '@prisma/client';

// Inject in constructor
constructor(
  private prisma: PrismaService,
  private notificationsService: NotificationsService,
) {}

// Use in methods
async acceptChildRideRequest(driverId: number, requestId: number) {
  // Update request
  const request = await this.prisma.childRideRequest.update({
    where: { id: requestId },
    data: { status: 'Assigned', driverId, AssignedDate: new Date() },
    include: { driver: true },
  });

  // Send notification
  await this.notificationsService.sendNotification({
    sender: 'System',
    message: `Driver ${request.driver.name} accepted your request!`,
    type: NotificationTypes.Alert,
    receiver: UserTypes.CHILD,
    receiverId: request.childId,
  });

  return request;
}
```

## API Endpoint

**POST** `/notifications/send`

```json
{
  "sender": "System",
  "message": "Your ride request has been accepted!",
  "type": "Alert",
  "receiver": "CHILD",
  "receiverId": 123
}
```

## Testing Notifications

### 1. Check Database
```sql
SELECT * FROM notifications 
WHERE receiverId = <user_id> AND receiver = '<USER_TYPE>'
ORDER BY createdAt DESC;
```

### 2. Check FCM Token
```sql
SELECT fcmToken FROM driver WHERE driver_id = <id>;
SELECT fcmToken FROM child WHERE child_id = <id>;
```

### 3. Manual API Test
```bash
curl -X POST http://localhost:3000/notifications/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "sender": "System",
    "message": "Test notification",
    "type": "Alert",
    "receiver": "CHILD",
    "receiverId": 123
  }'
```

## Best Practices

### ✅ DO
- Use `NotificationTypes.Alert` for important user actions
- Use `NotificationTypes.System` for status updates
- Include user names in messages ("Driver John accepted...")
- Send notifications after database updates succeed
- Use specific receiverId for targeted notifications

### ❌ DON'T
- Don't send notifications before database updates
- Don't use plain strings for type/receiver (use enums)
- Don't spam users with too many notifications
- Don't send duplicate notifications
- Don't include sensitive data in messages

## Common Use Cases

| Event | Receiver | Type | Example Message |
|-------|----------|------|-----------------|
| Request accepted | CHILD/STAFF | Alert | "Driver John accepted your request!" |
| Request rejected | CHILD/STAFF | System | "Your request was declined" |
| Route started | CHILD/STAFF | System | "Your driver is on the way!" |
| Pickup soon | CHILD/STAFF | Alert | "Driver arriving in 2 minutes" |
| Picked up | CHILD/STAFF | System | "You have been picked up" |
| Dropped off | CHILD/STAFF | System | "You have been dropped off" |
| Payment due | CUSTOMER | Alert | "Payment due: Rs. 8000" |
| New message | ALL | Chat | "New message from driver" |
| Route completed | DRIVER | System | "Route completed successfully" |

---

**Quick Copy-Paste:**

```typescript
// Child notification
await this.notificationsService.sendNotification({
  sender: 'System',
  message: 'Your message here',
  type: NotificationTypes.Alert,
  receiver: UserTypes.CHILD,
  receiverId: childId,
});

// Staff notification
await this.notificationsService.sendNotification({
  sender: 'System',
  message: 'Your message here',
  type: NotificationTypes.Alert,
  receiver: UserTypes.STAFF,
  receiverId: staffId,
});

// Driver notification
await this.notificationsService.sendNotification({
  sender: 'System',
  message: 'Your message here',
  type: NotificationTypes.Alert,
  receiver: UserTypes.DRIVER,
  receiverId: driverId,
});
```
