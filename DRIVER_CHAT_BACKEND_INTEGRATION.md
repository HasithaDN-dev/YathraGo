# Driver Chat Backend Integration

## Overview
Successfully integrated the driver mobile app chat feature with the existing backend chat module. The implementation follows the same pattern as the mobile-customer app, ensuring consistency and reusing the existing backend infrastructure.

## What Was Implemented

### 1. Auto-Create Conversations
The driver chat now automatically creates conversations with all assigned children from the passenger store:

- **Location**: `mobile-driver/app/(tabs)/chat/chat_list.tsx`
- **How it works**:
  - On screen focus, the app fetches all assigned passengers from `usePassengerStore`
  - For each child, it makes a POST request to `/chat/conversations` with:
    ```json
    {
      "participantAId": driverId,
      "participantAType": "DRIVER",
      "participantBId": childId,
      "participantBType": "CHILD"
    }
    ```
  - The backend's `upsertConversation` method ensures no duplicates (uses unique constraint)
  - This runs automatically so drivers always have conversations ready for their students

### 2. Fetch Existing Conversations
After ensuring conversations exist, the app fetches the list:

- **Endpoint**: `GET /chat/conversations?userId={driverId}&userType=DRIVER`
- **Returns**: Array of conversations with:
  - Conversation metadata (id, timestamps)
  - Messages array (sorted DESC, most recent first)
  - `otherParticipant` object with child/customer details
  - Unread count calculation

### 3. Display Child Names & Avatars
The UI enriches backend data with passenger store information:

- **Child Names**: Combines `childFirstName` + `childLastName` from passenger store
- **Avatars**: Uses `childImageUrl` from passenger store, falls back to backend `avatarUrl`
- **Fallback**: If passenger store doesn't have data, uses backend's `otherParticipant.name`
- **Default Image**: Shows bundled `profile_Picture.png` if no avatar available

### 4. Unread Count Logic
Counts messages where:
- `senderId !== driverId` (not sent by this driver)
- `senderType !== 'DRIVER'` (not from driver type)
- `seen === false` (not yet read)

### 5. Push Notifications
The backend already handles driver notifications:

- **Service**: `NotificationsService.sendNewMessagePush()`
- **When**: Triggered automatically when a message is sent via `POST /chat/messages`
- **What happens**:
  1. Backend determines the receiver (the other participant in conversation)
  2. If receiver is DRIVER, fetches driver's FCM token from `Driver` table
  3. Creates a Notification record with type `Chat`
  4. Sends push notification via Firebase
- **No changes needed** - existing backend code handles DRIVER type correctly

## Backend Endpoints Used

| Endpoint | Method | Purpose | Request Body |
|----------|--------|---------|--------------|
| `/chat/conversations` | POST | Create/get conversation | `{ participantAId, participantAType, participantBId, participantBType }` |
| `/chat/conversations` | GET | List conversations for driver | Query: `userId`, `userType` |
| `/chat/conversations/:id/messages` | GET | Get messages for conversation | - |
| `/chat/messages` | POST | Send text/image message | `{ conversationId, senderId, senderType, message, imageUrl }` |
| `/chat/conversations/:id/mark-seen` | POST | Mark conversation messages as seen | `{ userId, userType }` |
| `/chat/upload-image` | POST | Upload image file | FormData with `file` |

## Key Files Modified

### Driver App
- `mobile-driver/app/(tabs)/chat/chat_list.tsx` - Main changes:
  - Added `usePassengerStore` import
  - Added `ensureConversationsExist()` function
  - Enhanced conversation mapping with passenger store data
  - Added childId tracking for proper avatar/name resolution

- `mobile-driver/app/(tabs)/chat/chat_room.tsx` - No changes needed (already working)

- `mobile-driver/app/(tabs)/_layout.tsx` - Fixed tab bar hiding

### Backend
- **No changes needed** - existing chat module already supports:
  - DRIVER user type
  - CHILD participant type
  - Push notifications to drivers via FCM
  - All required endpoints and business logic

## Data Flow

```
1. Driver opens Chat List
   ↓
2. App fetches passengers from zustand store
   ↓
3. For each child: POST /chat/conversations (creates if not exists)
   ↓
4. GET /chat/conversations?userId=X&userType=DRIVER
   ↓
5. Backend returns conversations with:
   - otherParticipant (child data)
   - messages array
   ↓
6. UI enriches with passenger store:
   - Child name (firstName + lastName)
   - Child avatar (childImageUrl)
   ↓
7. Display conversation list with unread counts
```

## Message Sending Flow

```
1. Driver types message in chat room
   ↓
2. POST /chat/messages
   { conversationId, senderId: driverId, senderType: 'DRIVER', message: 'text' }
   ↓
3. Backend chat.service:
   - Creates Chat record
   - Updates conversation timestamp
   - Determines receiver (parent/customer)
   ↓
4. Backend notifications.service:
   - Creates Notification record
   - Fetches customer's FCM token
   - Sends push notification via Firebase
   ↓
5. Customer receives push notification
   ↓
6. Customer opens chat, sees message
   ↓
7. POST /chat/conversations/:id/mark-seen
   { userId: customerId, userType: 'CUSTOMER' }
   ↓
8. Backend updates all driver's messages in that conversation to seen=true
```

## Notification Behavior

### When Driver Sends Message
- **Receiver**: Customer (parent) of the child
- **Notification Type**: `Chat`
- **Title**: Driver's name (from Driver table)
- **Body**: Message text or "📷 Sent an image"
- **Data payload**:
  - `conversationId`
  - `notificationId`
  - `receiverType: CUSTOMER`
  - `receiverId: customerId`

### When Customer Sends Message
- **Receiver**: Driver
- **Notification Type**: `Chat`
- **Title**: Customer's name (firstName + lastName)
- **Body**: Message text or "📷 Sent an image"
- **Data payload**:
  - `conversationId`
  - `notificationId`
  - `receiverType: DRIVER`
  - `receiverId: driverId`

## Testing Checklist

### Manual Testing
1. **Start backend**: `npm run start:dev` (in backend folder)
2. **Start driver app**: `npm run start:clear` (in mobile-driver folder)
3. **Verify passenger store has data**:
   - Login as driver
   - Check home screen shows assigned students
4. **Open Chat**:
   - Tap "Message" quick action on home
   - Verify chat list loads
   - Verify child names appear (not "Chat")
   - Verify avatars load (or fallback image)
5. **Send Messages**:
   - Tap a conversation
   - Send text message
   - Upload image from gallery
   - Capture image from camera
6. **Check Backend**:
   - Verify conversation created in database
   - Verify messages stored correctly
   - Check Notification table for push records
7. **Check Customer App**:
   - Login as customer (parent)
   - Check if notification appears
   - Open chat and verify message visible
   - Reply to driver
8. **Check Driver App**:
   - Verify unread count updates
   - Open chat and see customer reply
   - Verify "seen" status updates

### API Testing (Postman)

#### Create Conversation
```http
POST http://localhost:3000/chat/conversations
Content-Type: application/json

{
  "participantAId": 7,
  "participantBId": 22,
  "participantAType": "DRIVER",
  "participantBType": "CHILD"
}
```

#### Get Conversations
```http
GET http://localhost:3000/chat/conversations?userId=7&userType=DRIVER
```

#### Send Message
```http
POST http://localhost:3000/chat/messages
Content-Type: application/json

{
  "conversationId": 8,
  "senderId": 7,
  "senderType": "DRIVER",
  "message": "Hello from driver!"
}
```

## Known Behavior

1. **Conversation Creation**: Runs on every screen focus (not just first load)
   - Backend upsert ensures no duplicates
   - Minimal overhead (one POST per child, typically fast)
   - Consider optimizing if passenger list is very large (>50 children)

2. **Polling**: Chat list polls every 5 seconds when focused
   - Chat room polls every 3 seconds when focused
   - Similar to customer app behavior
   - Consider using WebSocket for production if needed

3. **Image Upload**: Uses multipart/form-data to `/chat/upload-image`
   - Saved to `uploads/chat/` folder
   - Returns relative path: `uploads/chat/filename.jpg`
   - Frontend prefixes with `API_BASE_URL`

4. **Participant Types**: Backend uses `CHILD` for children (not `Child`)
   - Schema defines: `enum UserTypes { CUSTOMER, WEBUSER, BACKUPDRIVER, DRIVER, VEHICLEOWNER, CHILD, STAFF }`
   - Make sure to use uppercase `CHILD` in requests

## Next Steps

1. **Optimize conversation creation** (optional):
   - Add flag to track if conversations already created this session
   - Only run on first load + manual refresh
   - Or move to background service

2. **Add WebSocket support** (optional):
   - Replace polling with real-time updates
   - Reduce API calls and improve UX

3. **Add typing indicators** (optional):
   - Show "Parent is typing..." when customer is composing

4. **Add read receipts UI** (optional):
   - Show checkmarks (single = sent, double = seen)
   - Already implemented in chat_room.tsx Bubble component

5. **Test with multiple drivers**:
   - Verify each driver only sees their assigned children
   - Test conversation isolation

6. **Monitor performance**:
   - Check database query performance with large message history
   - Consider pagination for messages (backend already supports cursor)

## Troubleshooting

### Conversations Not Appearing
- Check passenger store has data (`console.log(passengerStore.ids)`)
- Verify backend is running and accessible
- Check network tab for API errors
- Verify driver is logged in (`user.id` exists)

### Names Show as "Chat"
- Passenger store may not be loaded yet
- Check child data has `childFirstName` and `childLastName`
- Fallback to backend `otherParticipant.name` working?

### Notifications Not Received
- Verify FCM token is saved in Driver table
- Check Firebase console for delivery status
- Verify NotificationsService is working (check logs)
- Test with Postman: call `/notifications/send` directly

### Images Not Uploading
- Check `uploads/chat/` folder exists and has write permissions
- Verify multer configuration in chat.controller.ts
- Check file size limits (default 5MB)
- Test upload endpoint directly with Postman

## Summary

The driver chat is now fully integrated with the backend:
- ✅ Auto-creates conversations with all assigned children
- ✅ Fetches and displays conversations with proper names/avatars
- ✅ Sends and receives messages (text + images)
- ✅ Calculates unread counts correctly
- ✅ Sends push notifications to customers when driver sends message
- ✅ Receives push notifications when customer replies
- ✅ No backend changes required (existing chat module supports all features)
- ✅ Tab bar properly hides chat routes (no unwanted tabs)

The implementation mirrors the customer app pattern, ensuring consistent behavior and maintainability.
