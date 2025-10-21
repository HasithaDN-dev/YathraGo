# Customer Chat - Driver Profile Image Display Fix

## Issue
Driver profile images were not displaying in the customer chat interface (both chat list and chat room screens).

## Root Cause
The backend chat service was missing the `/uploads/` prefix when constructing driver profile image URLs.

**Database stored**: `driver/driver-1761010867952.jpeg`  
**Backend was sending**: `http://10.21.86.0:3000/driver/driver-1761010867952.jpeg` ❌  
**Should send**: `http://10.21.86.0:3000/uploads/driver/driver-1761010867952.jpeg` ✅

## Files Modified

### Backend
**File**: `backend/src/chat/chat.service.ts`

Changed URL construction logic to include `/uploads/` prefix:

```typescript
// Before
const avatarUrl = avatarPath
  ? avatarPath.startsWith('http')
    ? avatarPath
    : base
      ? `${base}/${avatarPath.replace(/^\/+/, '')}`
      : avatarPath
  : null;

// After
const avatarUrl = avatarPath
  ? avatarPath.startsWith('http')
    ? avatarPath
    : base
      ? `${base}/uploads/${avatarPath.replace(/^\/+/, '')}`
      : avatarPath
  : null;
```

### Frontend
**Files**: 
- `mobile-customer/app/(menu)/(homeCards)/chat_list.tsx`
- `mobile-customer/app/(menu)/(homeCards)/chat_room.tsx`

**Changes**:
1. Simplified avatar URL handling - backend now sends complete URLs
2. Added `defaultSource` fallback for Image components
3. Removed redundant URL construction logic

**chat_list.tsx**:
```typescript
// Simplified - backend sends full URL
const avatarUri = other.avatarUrl || other.profileImage || other.imageUrl || other.avatar || null;
```

**chat_room.tsx**:
```tsx
// Added defaultSource for better error handling
<Image 
  source={{ uri: avatarUri }} 
  style={{ width: 36, height: 36, borderRadius: 18, marginRight: 10 }}
  defaultSource={require('../../../assets/images/profile_Picture.png')}
/>
```

## How It Works Now

### Data Flow
1. **Database**: Stores relative path: `driver/driver-1761010867952.jpeg`
2. **Backend Chat Service**: Constructs full URL with `/uploads/` prefix
   - Gets `profile_picture_url` from Driver table
   - Builds: `http://SERVER_BASE_URL/uploads/driver/driver-xxxxx.jpeg`
   - Sends in `otherParticipant.avatarUrl` field
3. **Frontend**: Receives and displays the complete URL
   - Chat list shows 44x44 driver profile image
   - Chat room shows 36x36 driver profile image in header
   - Falls back to default image if URL is null/invalid

### URL Format
✅ **Correct format**: `http://10.21.86.0:3000/uploads/driver/driver-1761010867952.jpeg`

This matches the static file serving configuration in the backend:
```typescript
app.useStaticAssets(join(__dirname, '..', 'uploads'), {
  prefix: '/uploads/',
});
```

## Testing

### 1. Verify Backend Response
```bash
# Get conversations for a customer
curl "http://10.21.86.0:3000/chat/conversations?userId=1&userType=CUSTOMER"
```

Expected response includes:
```json
{
  "otherParticipant": {
    "id": 7,
    "type": "DRIVER",
    "name": "John Doe",
    "phone": "+94771234567",
    "avatarUrl": "http://10.21.86.0:3000/uploads/driver/driver-1761010867952.jpeg"
  }
}
```

### 2. Test Image Access
Open in browser or curl:
```
http://10.21.86.0:3000/uploads/driver/driver-1761010867952.jpeg
```

Should display the driver's profile image.

### 3. Frontend Display
1. **Chat List Screen**:
   - Navigate to Chat tab
   - Verify driver profile images appear in conversation list (44x44 circular)
   - If no image, default profile_Picture.png should show

2. **Chat Room Screen**:
   - Open a conversation with a driver
   - Verify driver profile image appears in header (36x36 circular)
   - Image should match the one in chat list

## Environment Variables
Ensure these are set correctly:

**Backend** (`.env`):
```
SERVER_BASE_URL=http://10.21.86.0:3000
```

**Frontend** (`.env`):
```
EXPO_PUBLIC_API_URL=http://10.21.86.0:3000
```

Both must point to the same server address.

## Consistency Across Apps

### Driver Profile Image URLs
All endpoints now consistently return full URLs with `/uploads/` prefix:

1. **Driver Profile API**: `GET /driver/profile`
   ```json
   {
     "profile_picture_url": "http://10.21.86.0:3000/uploads/driver/driver-xxxxx.jpeg"
   }
   ```

2. **Chat Conversations API**: `GET /chat/conversations`
   ```json
   {
     "otherParticipant": {
       "avatarUrl": "http://10.21.86.0:3000/uploads/driver/driver-xxxxx.jpeg"
     }
   }
   ```

### Image Storage Pattern
- **Customer images**: `uploads/customer/customer-xxxxx.jpg`
- **Driver images**: `uploads/driver/driver-xxxxx.jpg`
- **Child images**: `uploads/child/child-xxxxx.jpg`
- **Chat images**: `uploads/chat/chat-xxxxx.jpg`

All follow the same pattern: `uploads/{entity}/{entity}-{timestamp}.{ext}`

## Related Documentation
- `DRIVER_IMAGE_FLOW_VERIFICATION.md` - Driver app image upload flow
- `DRIVER_CHAT_BACKEND_INTEGRATION.md` - Driver chat implementation
- `CHAT_IMAGE_UPLOAD_TESTING.md` - Chat image upload testing

## Status
✅ **Fixed** - Driver profile images now display correctly in customer chat interface
