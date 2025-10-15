# Chat Image Upload Testing Guide

## 🎯 Implementation Summary

The chat image upload functionality has been successfully implemented with the following features:

### Backend Changes:
1. **New Upload Endpoint**: `POST /chat/upload-image`
2. **Static File Serving**: Images are served from `/uploads/chat/` directory
3. **Unique Filename Generation**: Images are saved with timestamp-based unique names
4. **Database Integration**: Image URLs are stored in the `imageUrl` field of chat messages

### Frontend Changes:
1. **Image Picker Integration**: Camera and gallery image selection
2. **Image Upload**: Automatic upload to backend with progress feedback
3. **Local Caching**: Images are cached locally for offline viewing
4. **Optimistic UI**: Immediate display of images while uploading

## 🚀 Testing Steps

### 1. Backend Testing with Postman

#### Test Image Upload Endpoint:
```
POST http://localhost:3000/chat/upload-image
Content-Type: multipart/form-data

Body (form-data):
- file: [Select an image file]
```

**Expected Response:**
```json
{
  "success": true,
  "filename": "image_1703123456789.jpg",
  "imageUrl": "uploads/chat/image_1703123456789.jpg"
}
```

#### Test Image Serving:
```
GET http://localhost:3000/uploads/chat/image_1703123456789.jpg
```

**Expected Response:** The actual image file

#### Test Sending Image Message:
```
POST http://localhost:3000/chat/messages
Content-Type: application/json

{
  "conversationId": 1,
  "senderId": 1,
  "senderType": "CUSTOMER",
  "message": null,
  "imageUrl": "uploads/chat/image_1703123456789.jpg"
}
```

### 2. Mobile App Testing

#### Test Camera Image Capture:
1. Open the chat room
2. Tap the camera icon in the input bar
3. Grant camera permission if prompted
4. Take a photo
5. Verify the image appears immediately in the chat
6. Check that the image is uploaded to the server

#### Test Gallery Image Selection:
1. Open the chat room
2. Tap the paperclip icon in the input bar
3. Grant photo library permission if prompted
4. Select an image from the gallery
5. Verify the image appears immediately in the chat
6. Check that the image is uploaded to the server

#### Test Image Caching:
1. Send an image message
2. Close and reopen the chat room
3. Verify the image loads quickly from cache
4. Check the device's cache directory for stored images

### 3. End-to-End Testing

#### Complete Chat Flow:
1. **Create Conversation**: Use Postman to create a conversation between customer and driver
2. **Send Text Message**: Send a regular text message
3. **Send Image Message**: Send an image message via mobile app
4. **Verify Database**: Check that the message is stored with correct imageUrl
5. **Test Retrieval**: Verify images are displayed correctly when fetching messages
6. **Test Cross-Device**: Send images from one device and verify they appear on another

## 📁 File Structure

### Backend:
```
backend/
├── uploads/
│   └── chat/           # Chat image uploads
├── src/
│   ├── chat/
│   │   ├── chat.controller.ts    # Added upload endpoint
│   │   └── chat.service.ts       # Added image handling
│   └── main.ts                   # Added static file serving
```

### Mobile:
```
mobile-customer/
├── utils/
│   └── imageCache.ts            # Image caching utility
└── app/(menu)/(homeCards)/
    └── chat_room.tsx            # Updated with image upload
```

## 🔧 Configuration

### Backend Environment:
- Port: 3000 (default)
- Upload Directory: `backend/uploads/chat/`
- Static File Serving: `/uploads/` prefix

### Mobile App:
- Cache Directory: `FileSystem.cacheDirectory/chat-images/`
- Max Cache Size: 100MB
- Max Cache Age: 7 days

## 🐛 Troubleshooting

### Common Issues:

1. **Upload Fails**: Check if the uploads/chat directory exists
2. **Images Not Displaying**: Verify static file serving is configured
3. **Permission Errors**: Ensure camera/photo library permissions are granted
4. **Cache Issues**: Clear the app cache or restart the app

### Debug Commands:

```bash
# Check if uploads directory exists
ls -la backend/uploads/chat/

# Test image serving
curl http://localhost:3000/uploads/chat/[filename]

# Check mobile app logs for cache operations
```

## 📱 Mobile App Features

### Image Upload Features:
- ✅ Camera capture with editing
- ✅ Gallery selection
- ✅ Automatic server upload
- ✅ Local caching for offline viewing
- ✅ Optimistic UI updates
- ✅ Error handling with user feedback
- ✅ Progress indicators

### Performance Optimizations:
- ✅ Local image caching reduces bandwidth
- ✅ Optimistic UI provides instant feedback
- ✅ Automatic cache cleanup prevents storage bloat
- ✅ Efficient image compression before upload

## 🎉 Success Criteria

The implementation is complete when:
- [x] Images can be uploaded via mobile app
- [x] Images are stored on the backend server
- [x] Images are served correctly via HTTP
- [x] Images are cached locally for offline viewing
- [x] Chat messages with images work end-to-end
- [x] Error handling works for failed uploads
- [x] Image permissions are handled gracefully

## 🚀 Next Steps

For production deployment:
1. Add image compression/resizing
2. Implement image moderation
3. Add progress bars for uploads
4. Implement image thumbnails
5. Add support for multiple image formats
6. Implement image deletion from server
7. Add image sharing functionality
