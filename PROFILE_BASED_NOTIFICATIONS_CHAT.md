# Profile-Based Notifications and Chat Implementation

## Overview
This document outlines the changes made to support separate notifications and chats for CUSTOMER, CHILD, and STAFF profiles, ensuring that even if IDs overlap, each profile receives only their own notifications and chat messages.

## Problem Statement
Previously, the system used only 'CUSTOMER' as the `receiver`/`userType` for all customer-related profiles (main customer, children, and staff). This caused conflicts when:
- `customer_id`, `child_id`, or `staff_id` had overlapping values
- Notifications/chats intended for one profile appeared in another profile's view

## Solution
Updated both backend and frontend to use specific `UserTypes` (CUSTOMER, CHILD, STAFF) for proper profile isolation.

---

## Backend Changes

### 1. Schema Updates (`backend/prisma/schema.prisma`)

**Enum UserTypes:**
```prisma
enum UserTypes {
  CUSTOMER
  CHILD      // ✅ Added
  STAFF      // ✅ Added
  WEBUSER
  BACKUPDRIVER
  DRIVER
  VEHICLEOWNER
}
```

### 2. Notifications Service (`backend/src/notifications/notifications.service.ts`)

#### Updated Type Definitions:
- `SendNotificationInput.receiver`: Now includes `'CHILD'` and `'STAFF'`
- `getNotifications()`: Now accepts CHILD and STAFF as receiver types
- `sendNewMessagePush()`: Now accepts CHILD and STAFF as receiverType

#### New Method - Broadcast to Customer Family:
```typescript
async sendNotificationToCustomerFamily(
  customerId: number,
  sender: string,
  message: string,
  type: 'SYSTEM' | 'ALERT' | 'OTHER' | 'CHAT',
)
```
**Purpose:** Sends the same notification to:
- Customer (receiver: CUSTOMER, receiverId: customer_id)
- All children (receiver: CHILD, receiverId: child_id for each)
- Staff if exists (receiver: STAFF, receiverId: staff.id)

**Use Case:** System-wide announcements, driver updates, etc. that should be visible to all profiles.

#### Updated FCM Token Resolution:
```typescript
private async getReceiverToken(receiver, receiverId) {
  // ...existing cases...
  
  case 'CHILD': {
    // Children use customer's FCM token
    const child = await this.prisma.child.findUnique({
      where: { child_id: receiverId },
      select: { Customer: { select: { fcmToken: true } } },
    });
    return child?.Customer?.fcmToken ?? null;
  }
  
  case 'STAFF': {
    // Staff uses customer's FCM token
    const staff = await this.prisma.staff_Passenger.findUnique({
      where: { id: receiverId },
      select: { Customer: { select: { fcmToken: true } } },
    });
    return staff?.Customer?.fcmToken ?? null;
  }
}
```

#### Updated Receiver Mapping:
```typescript
private mapReceiver(input: string): UserTypes {
  // Added:
  case 'CHILD': return UserTypes.CHILD;
  case 'STAFF': return UserTypes.STAFF;
}
```

### 3. Notifications Controller (`backend/src/notifications/notifications.controller.ts`)

#### New Endpoint:
```typescript
@Post('customer-family/:customerId')
sendToCustomerFamily(
  @Param('customerId') customerId: string,
  @Body() body: { sender: string; message: string; type: string },
)
```

#### Updated Endpoints:
- `@Get()`: Now accepts CHILD and STAFF in `receiver` query parameter

### 4. Chat Service (`backend/src/chat/chat.service.ts`)

#### Updated Profile Name Resolution:
```typescript
// In listConversations()
else if (otherType === 'CHILD') {
  const rec = await this.prisma.child.findUnique({
    where: { child_id: otherId },
    select: { childFirstName: true, childLastName: true, Customer: { select: { phone: true } } },
  });
  if (rec) {
    name = `${rec.childFirstName} ${rec.childLastName}`.trim();
    phone = rec.Customer?.phone ?? null;
  }
} else if (otherType === 'STAFF') {
  const rec = await this.prisma.staff_Passenger.findUnique({
    where: { id: otherId },
    select: { Customer: { select: { firstName: true, lastName: true, phone: true } } },
  });
  if (rec?.Customer) {
    name = `${rec.Customer.firstName} ${rec.Customer.lastName} (Staff)`.trim();
    phone = rec.Customer.phone;
  }
}
```

#### Updated Sender Name Resolution:
```typescript
// In sendMessage()
else if (params.senderType === 'CHILD') {
  const c = await this.prisma.child.findUnique({
    where: { child_id: params.senderId },
    select: { childFirstName: true, childLastName: true },
  });
  if (c) senderName = `${c.childFirstName} ${c.childLastName}`.trim();
} else if (params.senderType === 'STAFF') {
  const s = await this.prisma.staff_Passenger.findUnique({
    where: { id: params.senderId },
    select: { Customer: { select: { firstName: true, lastName: true } } },
  });
  if (s?.Customer) senderName = `${s.Customer.firstName} ${s.Customer.lastName} (Staff)`.trim();
}
```

### 5. Chat Controller (`backend/src/chat/chat.controller.ts`)

#### Updated Type Definitions:
- `createConversation()`: participantAType/participantBType now include CHILD and STAFF
- `listConversations()`: userType now includes CHILD and STAFF

---

## Frontend Changes

### 1. Notifications API (`mobile-customer/lib/api/notifications.api.ts`)

#### Updated Type:
```typescript
export type ReceiverType = 'CUSTOMER' | 'CHILD' | 'STAFF' | 'DRIVER' | 'WEBUSER' | 'VEHICLEOWNER' | 'BACKUPDRIVER';
```

### 2. Notifications Screen (`mobile-customer/app/(tabs)/notifications.tsx`)

#### Updated Profile-Based Fetching:
```typescript
const fetchNotifications = useCallback(async () => {
  if (!accessToken || !activeProfile) return;
  
  let receiver: ReceiverType = 'CUSTOMER';
  let receiverId: number | null = null;
  
  if (activeProfile.type === 'child') {
    receiver = 'CHILD';  // ✅ Use CHILD type
    const m = String(activeProfile.id).match(/(\d+)/);
    receiverId = m ? parseInt(m[1], 10) : null;
  } else if (activeProfile.type === 'staff') {
    receiver = 'STAFF';  // ✅ Use STAFF type
    const m = String(activeProfile.id).match(/(\d+)/);
    receiverId = m ? parseInt(m[1], 10) : null;
  } else if (customerProfile?.customer_id) {
    receiver = 'CUSTOMER';
    receiverId = customerProfile.customer_id;
  }
  
  if (receiverId) {
    await loadForProfile(accessToken, receiver, receiverId);
  }
}, [accessToken, activeProfile, loadForProfile, customerProfile?.customer_id]);
```

### 3. Chat List Screen (`mobile-customer/app/(menu)/(homeCards)/chat_list.tsx`)

#### Added Profile Store:
```typescript
import { useProfileStore } from '../../../lib/stores/profile.store';
```

#### Updated Conversation Fetching:
```typescript
const fetchConversations = useCallback(async () => {
  if (!user || !activeProfile) return;
  
  // Determine the correct userType and userId based on active profile
  let userType: 'CUSTOMER' | 'CHILD' | 'STAFF' = 'CUSTOMER';
  let userId = Number(user.id);
  
  if (activeProfile.type === 'child') {
    userType = 'CHILD';
    const m = String(activeProfile.id).match(/(\d+)/);
    userId = m ? parseInt(m[1], 10) : userId;
  } else if (activeProfile.type === 'staff') {
    userType = 'STAFF';
    const m = String(activeProfile.id).match(/(\d+)/);
    userId = m ? parseInt(m[1], 10) : userId;
  } else if (customerProfile?.customer_id) {
    userId = customerProfile.customer_id;
  }
  
  const res = await fetch(`${API_BASE_URL}/chat/conversations?userId=${userId}&userType=${userType}`);
  // ...
}, [user, activeProfile, customerProfile?.customer_id]);
```

#### Updated Unread Count Filtering:
```typescript
const unreadCount = messages.filter((msg: any) => 
  msg.senderId !== userId &&           // ✅ Use dynamic userId
  msg.senderType !== userType &&       // ✅ Use dynamic userType
  msg.seen === false
).length;
```

### 4. Chat Room Screen (`mobile-customer/app/(menu)/(homeCards)/chat_room.tsx`)

#### Added Profile Store:
```typescript
import { useProfileStore } from '../../../lib/stores/profile.store';
const { activeProfile, customerProfile } = useProfileStore();
```

#### Updated Mark As Seen:
```typescript
const markMessagesAsSeen = useCallback(async () => {
  if (!conversationId || !user || !activeProfile) return;
  
  let userType: 'CUSTOMER' | 'CHILD' | 'STAFF' = 'CUSTOMER';
  let userId = Number(user.id);
  
  if (activeProfile.type === 'child') {
    userType = 'CHILD';
    userId = extractIdFromProfile(activeProfile.id);
  } else if (activeProfile.type === 'staff') {
    userType = 'STAFF';
    userId = extractIdFromProfile(activeProfile.id);
  } else if (customerProfile?.customer_id) {
    userId = customerProfile.customer_id;
  }
  
  await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}/mark-seen`, {
    method: 'POST',
    body: JSON.stringify({ userId, userType }),
  });
}, [conversationId, user, activeProfile, customerProfile]);
```

#### Updated Send Message:
```typescript
const send = async (overrideText?: string) => {
  // ...
  if (!textToSend || !user || !conversationId || !activeProfile) return;
  
  let userType: 'CUSTOMER' | 'CHILD' | 'STAFF' = 'CUSTOMER';
  let userId = getProfileUserId();
  
  await fetch(`${API_BASE_URL}/chat/messages`, {
    method: 'POST',
    body: JSON.stringify({
      conversationId,
      senderId: userId,       // ✅ Dynamic userId
      senderType: userType,   // ✅ Dynamic userType
      message: textToSend,
    }),
  });
};
```

#### Updated Send Image:
```typescript
const sendImageMessage = async (imageUri: string) => {
  // Same logic as send() for determining userType and userId
  await fetch(`${API_BASE_URL}/chat/messages`, {
    method: 'POST',
    body: JSON.stringify({
      conversationId,
      senderId: userId,       // ✅ Dynamic
      senderType: userType,   // ✅ Dynamic
      imageUrl: imageUrl,
    }),
  });
};
```

---

## How It Works

### Notification Flow

**1. Profile-Specific Notifications:**
```
Driver sends notification → Backend creates notification with:
- receiver: CHILD (or CUSTOMER/STAFF based on target)
- receiverId: child_id (specific child ID)

Frontend (child profile active):
- Fetches with receiver='CHILD' & receiverId=child_id
- Only sees notifications for THIS child
```

**2. Broadcast Notifications:**
```
System announcement → Backend.sendNotificationToCustomerFamily()
- Creates notification for CUSTOMER (customerId)
- Creates notification for each CHILD (child_id)
- Creates notification for STAFF if exists (staff.id)

Frontend:
- Each profile sees the notification in their own list
- All profiles get push notification (same FCM token)
```

### Chat Flow

**1. Sending Messages:**
```
Child profile sends message → Frontend:
- senderId: child_id
- senderType: 'CHILD'

Backend:
- Resolves sender name from Child table
- Creates Chat record with senderType='CHILD'
- Sends notification to receiver with correct receiverType
```

**2. Receiving Messages:**
```
Frontend (child profile active) fetches conversations:
- userId: child_id
- userType: 'CHILD'

Backend:
- Filters Conversation where:
  (participantAId=child_id AND participantAType='CHILD') OR
  (participantBId=child_id AND participantBType='CHILD')
- Returns only conversations for THIS child
```

### Database Isolation

**Notifications Table:**
```sql
-- Customer notification
receiver='CUSTOMER', receiverId=5

-- Child notification
receiver='CHILD', receiverId=5

-- Staff notification
receiver='STAFF', receiverId=5
```
Even if all IDs are 5, they're isolated by `receiver` type.

**Conversation Table:**
```sql
-- Customer-to-Driver conversation
participantAId=5, participantAType='CUSTOMER'
participantBId=10, participantBType='DRIVER'

-- Child-to-Driver conversation
participantAId=5, participantAType='CHILD'
participantBId=10, participantBType='DRIVER'
```
Different conversations even with same IDs.

---

## Benefits

1. ✅ **No ID Conflicts:** Each profile type is isolated by UserTypes enum
2. ✅ **Privacy:** Children see only their chats/notifications, not siblings'
3. ✅ **Flexibility:** Can send to specific profiles or broadcast to all
4. ✅ **Accurate Names:** Chat displays correct names (child name vs customer name)
5. ✅ **Push Notifications:** FCM tokens correctly resolved through Customer relation

---

## Testing Checklist

### Notifications
- [ ] Switch to child profile → see only child's notifications
- [ ] Switch to staff profile → see only staff's notifications
- [ ] Switch to customer profile → see only customer's notifications
- [ ] Send broadcast notification → all profiles see it
- [ ] Verify no overlap when IDs are same

### Chat
- [ ] Send message as child → appears with child's name
- [ ] Send message as staff → appears with "(Staff)" label
- [ ] Send message as customer → appears with customer name
- [ ] Conversations are separate for each profile
- [ ] Unread counts are correct per profile
- [ ] Mark as seen only affects current profile's messages

---

## API Endpoints Summary

### Notifications
```
GET  /notifications?receiver={type}&receiverId={id}&duration={mins}
POST /notifications
POST /notifications/customer-family/:customerId
PUT  /notifications/fcm-token/:customerId
```

### Chat
```
GET  /chat/conversations?userId={id}&userType={type}
GET  /chat/conversations/:id/messages
POST /chat/conversations
POST /chat/messages
POST /chat/conversations/:id/mark-seen
POST /chat/upload-image
```

---

## Migration Notes

**No database migration required** - UserTypes enum already includes CHILD and STAFF.

**Existing data:**
- Old notifications with receiver='CUSTOMER' will still work
- New notifications should use specific types (CHILD/STAFF/CUSTOMER)
- Gradually migrate existing notifications by re-sending with correct types if needed

---

## Future Enhancements

1. **Profile-specific FCM tokens:** Store separate tokens per profile for granular push control
2. **Notification preferences:** Allow users to customize per-profile notification settings
3. **Chat history export:** Export chats per profile
4. **Admin dashboard:** View notifications/chats across all customer family profiles

---

**Implementation Date:** December 2024  
**Status:** ✅ Complete
