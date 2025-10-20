# Driver Chat - Quick Reference

## How It Works (Simple Version)

1. **Driver opens Chat** → App auto-creates conversations with all assigned children
2. **Chat list loads** → Shows all children with their names and avatars
3. **Driver sends message** → Customer (parent) receives push notification
4. **Customer replies** → Driver receives push notification
5. **Unread counts update** → Shows blue badge on conversations

## Key Features

✅ **Auto-create conversations** - No manual setup needed, just open chat  
✅ **Real child names** - Shows actual student names from passenger data  
✅ **Profile pictures** - Displays child avatars from backend  
✅ **Unread badges** - Blue count shows how many unread messages  
✅ **Push notifications** - Both driver and customer get notified  
✅ **Image sharing** - Send photos via camera or gallery  
✅ **Read receipts** - See when messages are read (checkmarks)  
✅ **Real-time-ish** - Polls every 3-5 seconds for updates  

## Quick Start Testing

### 1. Start Backend
```bash
cd backend
npm run start:dev
```

### 2. Start Driver App
```bash
cd mobile-driver
npm run start:clear
```

### 3. Open Chat
- Login as driver
- Tap "Message" quick action on home screen
- Verify chat list shows assigned children

### 4. Send Message
- Tap any child conversation
- Type message and send
- Check customer app for notification

## API Endpoints (For Reference)

```typescript
// Create conversation (auto-called on chat list load)
POST /chat/conversations
{
  "participantAId": 7,          // driverId
  "participantAType": "DRIVER",
  "participantBId": 22,          // childId
  "participantBType": "CHILD"
}

// Get driver's conversations
GET /chat/conversations?userId=7&userType=DRIVER

// Send message
POST /chat/messages
{
  "conversationId": 8,
  "senderId": 7,              // driverId
  "senderType": "DRIVER",
  "message": "Hello!"
}

// Mark messages as read
POST /chat/conversations/8/mark-seen
{
  "userId": 7,                // driverId
  "userType": "DRIVER"
}

// Upload image
POST /chat/upload-image
FormData: { file: <image> }
```

## Code Locations

### Main Files
- **Chat List**: `mobile-driver/app/(tabs)/chat/chat_list.tsx`
- **Chat Room**: `mobile-driver/app/(tabs)/chat/chat_room.tsx`
- **Passenger Store**: `mobile-driver/lib/stores/passenger.store.ts`

### Backend
- **Chat Service**: `backend/src/chat/chat.service.ts`
- **Chat Controller**: `backend/src/chat/chat.controller.ts`
- **Notifications**: `backend/src/notifications/notifications.service.ts`

## Common Issues & Fixes

### Chat list is empty
- Check: Is passenger store loaded? (`usePassengerStore().ids`)
- Check: Is backend running? (`http://localhost:3000`)
- Check: Is driver logged in? (`useAuthStore().user.id`)

### Shows "Chat" instead of child name
- Passenger store not loaded yet (give it a moment)
- Backend might not have child data (check database)

### No notifications
- FCM token missing in Driver table
- Firebase not configured
- Check backend logs for errors

### Images won't upload
- Check `backend/uploads/chat/` folder exists
- Check file permissions
- Check file size (max 5MB by default)

## Notification Flow

```
Driver sends message
    ↓
Backend creates message
    ↓
Backend finds customer (parent of child)
    ↓
Backend gets customer FCM token
    ↓
Firebase sends push to customer
    ↓
Customer sees notification
    ↓
Customer opens chat
    ↓
Customer replies
    ↓
Backend finds driver
    ↓
Backend gets driver FCM token
    ↓
Firebase sends push to driver
    ↓
Driver sees notification
```

## Data Sources

### Child Name
1. **Primary**: Passenger store (`childFirstName` + `childLastName`)
2. **Fallback**: Backend `otherParticipant.name`
3. **Default**: "Chat"

### Child Avatar
1. **Primary**: Passenger store (`child.childImageUrl`)
2. **Fallback**: Backend `otherParticipant.avatarUrl`
3. **Default**: `profile_Picture.png` (bundled asset)

### Unread Count
- Counts messages where:
  - Not sent by this driver
  - `seen === false`

## Tips

- **Polling**: Chat updates every 3-5 seconds (not instant)
- **Pull to refresh**: Swipe down to force update
- **Network errors**: App handles gracefully, shows cached data
- **Multiple children**: Each gets separate conversation
- **Customer sees driver name**: From Driver table `name` field

## Testing with Postman

1. Create conversation (use actual driver_id and child_id from DB)
2. Send message as driver
3. Check Notification table for record
4. Get conversations for driver - verify message appears
5. Send message as customer (participantBId=driverId, participantBType=DRIVER)
6. Get driver conversations again - verify reply appears

## Next Features (Future)

- [ ] WebSocket for real-time updates (no polling)
- [ ] Typing indicators ("Parent is typing...")
- [ ] Message reactions (👍, ❤️, etc.)
- [ ] Voice messages
- [ ] Delivery status (sent → delivered → seen)
- [ ] Search messages
- [ ] Archive conversations
- [ ] Block/mute conversations

## Support

For detailed documentation, see: `DRIVER_CHAT_BACKEND_INTEGRATION.md`

Backend was NOT modified - existing chat module already supports all features!
