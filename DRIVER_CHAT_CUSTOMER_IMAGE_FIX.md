# Driver Chat - Customer Profile Image Display Fix

## Issue
Customer (and child) profile images were not displaying correctly in the driver chat interface (both chat list and chat room screens).

## Root Cause
The driver chat frontend was incorrectly reconstructing avatar URLs that the backend had already sent as complete URLs with the `/uploads/` prefix.

**Backend sends**: `http://10.21.86.0:3000/uploads/customer/customer-xxxxx.jpg` ✅  
**Frontend was trying to reconstruct**: `http://10.21.86.0:3000/customer/customer-xxxxx.jpg` ❌

## Files Modified

### Driver App Frontend
**Files**: 
- `mobile-driver/app/(tabs)/chat/chat_list.tsx`
- `mobile-driver/app/(tabs)/chat/chat_room.tsx`

**Changes**:
1. Simplified avatar URL handling - backend already sends complete URLs
2. Added `defaultSource` fallback for Image components
3. Removed redundant URL reconstruction logic

**chat_list.tsx**:
```typescript
// Before - Incorrectly reconstructing URLs
const avatarPath = other.profileImage || other.avatarUrl || other.imageUrl || other.avatar || '';
const avatarUri = avatarPath
  ? avatarPath.startsWith('http')
    ? avatarPath
    : `${API_BASE_URL}/${avatarPath.replace(/^\//, '')}`
  : null;

// After - Using backend's complete URLs directly
const avatarUri = other.avatarUrl || other.profileImage || other.imageUrl || other.avatar || null;
```

For child images from passenger store:
```typescript
// After - Passenger store already has full URLs
let finalAvatarUri = avatarUri;
if (childId) {
  const passengerData: any = childMap.get(childId);
  if (passengerData?.child?.childImageUrl) {
    // Child image URL from passenger store is already a full URL
    finalAvatarUri = passengerData.child.childImageUrl;
  }
}
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

### Backend (No Changes Required)
The backend chat service already correctly constructs full URLs with `/uploads/` prefix for all participant types:

**File**: `backend/src/chat/chat.service.ts`

```typescript
// Already correct - constructs full URLs
const base = (process.env.SERVER_BASE_URL || '').replace(/\/$/, '');
const avatarUrl = avatarPath
  ? avatarPath.startsWith('http')
    ? avatarPath
    : base
      ? `${base}/uploads/${avatarPath.replace(/^\/+/, '')}`
      : avatarPath
  : null;
```

## How It Works Now

### Data Flow for Customer Images
1. **Database**: Stores relative path in `customer.profileImageUrl`: `customer/customer-xxxxx.jpg`
2. **Backend Chat Service**: Constructs full URL
   - Gets `profileImageUrl` from Customer table
   - Builds: `http://SERVER_BASE_URL/uploads/customer/customer-xxxxx.jpg`
   - Sends in `otherParticipant.avatarUrl` field
3. **Driver Frontend**: Receives and displays the complete URL
   - Chat list shows 44x44 customer profile image
   - Chat room shows 36x36 customer profile image in header
   - Falls back to default image if URL is null/invalid

### Data Flow for Child Images
There are two sources for child images:

#### 1. From Backend (via chat conversations API)
- Backend constructs: `http://SERVER_BASE_URL/uploads/child/child-xxxxx.jpg`
- Sent in `otherParticipant.avatarUrl`

#### 2. From Passenger Store (preferred)
- Driver app enriches chat data with passenger store
- Uses `child.childImageUrl` from passenger store
- This URL is already complete from the customer profile API
- Overrides the backend's avatarUrl if available

### URL Format Examples
✅ **Customer image**: `http://10.21.86.0:3000/uploads/customer/customer-1761010867952.jpg`  
✅ **Child image**: `http://10.21.86.0:3000/uploads/child/child-1761010867952.jpg`  
✅ **Driver image**: `http://10.21.86.0:3000/uploads/driver/driver-1761010867952.jpg`

## Testing

### 1. Verify Backend Response
```bash
# Get conversations for a driver
curl "http://10.21.86.0:3000/chat/conversations?userId=7&userType=DRIVER"
```

Expected response includes:
```json
{
  "otherParticipant": {
    "id": 1,
    "type": "CUSTOMER",
    "name": "John Smith",
    "phone": "+94771234567",
    "avatarUrl": "http://10.21.86.0:3000/uploads/customer/customer-1761010867952.jpg"
  }
}
```

Or for child participants:
```json
{
  "otherParticipant": {
    "id": 22,
    "type": "CHILD",
    "name": "Sarah Smith",
    "phone": "+94771234567",
    "avatarUrl": "http://10.21.86.0:3000/uploads/child/child-1761010867952.jpg"
  }
}
```

### 2. Test Image Access
Open in browser or curl:
```
http://10.21.86.0:3000/uploads/customer/customer-1761010867952.jpg
http://10.21.86.0:3000/uploads/child/child-1761010867952.jpg
```

Should display the respective profile images.

### 3. Frontend Display
1. **Chat List Screen** (Driver App):
   - Navigate to Chat tab
   - Verify customer/child profile images appear in conversation list (44x44 circular)
   - If no image, default profile_Picture.png should show

2. **Chat Room Screen** (Driver App):
   - Open a conversation with a customer/child
   - Verify customer/child profile image appears in header (36x36 circular)
   - Image should match the one in chat list

## Environment Variables
Ensure these are set correctly:

**Backend** (`.env`):
```
SERVER_BASE_URL=http://10.21.86.0:3000
```

**Driver App Frontend** (`.env`):
```
EXPO_PUBLIC_API_URL=http://10.21.86.0:3000
```

Both must point to the same server address.

## Consistency Across Apps

### Profile Image URLs
All endpoints now consistently return full URLs with `/uploads/` prefix:

1. **Customer Profile API**: `GET /customer/profile`
   ```json
   {
     "profileImageUrl": "http://10.21.86.0:3000/uploads/customer/customer-xxxxx.jpg"
   }
   ```

2. **Driver Profile API**: `GET /driver/profile`
   ```json
   {
     "profile_picture_url": "http://10.21.86.0:3000/uploads/driver/driver-xxxxx.jpg"
   }
   ```

3. **Chat Conversations API**: `GET /chat/conversations`
   ```json
   {
     "otherParticipant": {
       "avatarUrl": "http://10.21.86.0:3000/uploads/{entity}/{entity}-xxxxx.jpg"
     }
   }
   ```

### Image Storage Pattern
All profile images follow the same pattern:
- **Customer images**: `uploads/customer/customer-{timestamp}.{ext}`
- **Driver images**: `uploads/driver/driver-{timestamp}.{ext}`
- **Child images**: `uploads/child/child-{timestamp}.{ext}`
- **Chat images**: `uploads/chat/chat-{timestamp}.{ext}`

Pattern: `uploads/{entity}/{entity}-{timestamp}.{ext}`

## Additional Context

### Passenger Store Enrichment
The driver chat list enriches backend conversation data with the passenger store:

1. **Child Names**: Uses `childFirstName + childLastName` from passenger store
   - More reliable than backend `otherParticipant.name`
   - Reflects most recent data from driver's assigned passengers

2. **Child Images**: Prefers `childImageUrl` from passenger store
   - Already fetched when driver loads their passenger list
   - Overrides backend's `avatarUrl` if available
   - Ensures consistency with child images shown elsewhere in driver app

### Image Component Best Practices
All chat Image components now use:
```tsx
<Image
  source={{ uri: avatarUri }}
  style={{ width: X, height: X, borderRadius: X/2, marginRight: Y }}
  defaultSource={require('../../../assets/images/profile_Picture.png')}
/>
```

The `defaultSource` prop ensures:
- Immediate fallback if URL is invalid
- Better UX during image loading
- Consistent placeholder across the app

## Related Documentation
- `CUSTOMER_CHAT_DRIVER_IMAGE_FIX.md` - Customer chat showing driver images
- `DRIVER_IMAGE_FLOW_VERIFICATION.md` - Driver app image upload flow
- `DRIVER_CHAT_BACKEND_INTEGRATION.md` - Driver chat implementation
- `CHAT_IMAGE_UPLOAD_TESTING.md` - Chat image upload testing

## Affected Features
✅ **Fixed**: Customer profile images in driver chat  
✅ **Fixed**: Child profile images in driver chat  
✅ **Working**: Driver profile images in customer chat (from previous fix)  
✅ **Working**: All chat message images  

## Status
✅ **Fixed** - Customer and child profile images now display correctly in driver chat interface

## Notes
- This fix mirrors the customer chat driver image fix
- Backend was already correct - issue was frontend URL reconstruction
- Passenger store enrichment provides better UX for child data
- All image URLs now consistent across both apps (customer and driver)
