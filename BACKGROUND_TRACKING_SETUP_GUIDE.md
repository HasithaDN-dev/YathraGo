# Background Location Tracking - Quick Setup Guide

## What Was Fixed

Previously, when the driver opened Google Maps for navigation:

- ❌ App stopped tracking location in the background
- ❌ No notification when reaching the destination
- ❌ Driver had to manually switch back and check if they arrived
- ❌ Attendance button didn't appear automatically

Now with background tracking:

- ✅ App tracks location continuously, even when in Google Maps
- ✅ Automatic notification when within 100 meters of destination
- ✅ Attendance button appears automatically when near
- ✅ Visual indicator shows tracking is active
- ✅ Smart prompts for next student after completing pickup/dropoff

## Quick Start

### For Developers

#### 1. Install Dependencies (Already Done)

```bash
cd mobile-driver
npm install expo-notifications expo-task-manager --legacy-peer-deps
```

#### 2. Rebuild the App (Required)

**Important**: You MUST rebuild the native app to apply permission changes.

```bash
# For Android
cd mobile-driver
npx expo run:android

# OR if using EAS
eas build --platform android --profile development
```

**Why rebuild?**

- New permissions added to `app.config.js`
- Background location requires native configuration
- Notification channels need native setup

#### 3. Test on Physical Device

Background location tracking **does not work on emulators/simulators**. You must test on a real device.

### For Testing

#### First Time Setup

1. **Launch the rebuilt app on a physical device**
2. **Navigate to the Navigation tab**
3. **Grant permissions when prompted:**
   - ✅ Location (When In Use) - Tap "Allow"
   - ✅ Location (Always/Background) - Tap "Allow"
   - ✅ Notifications - Tap "Allow"

#### Testing the Feature

**Scenario 1: Full Navigation Flow**

1. Go to Navigation tab
2. Wait for route to load with student locations
3. Look for "Background Tracking Active" indicator (should appear)
4. Tap "Open Google Maps" button
5. Google Maps opens with navigation
6. Navigate toward the student location
7. When within 100m, you'll receive a notification:
   - 📍 "Pickup Location Reached" or "Drop-off Location Reached"
   - "You've arrived at [Student Name]'s location. Tap to mark attendance."
8. Tap the notification OR manually switch to app
9. See "Mark Pickup" or "Mark Drop-off" button
10. Tap button to complete
11. App prompts for next student (if available)

**Scenario 2: Testing Without Moving (For Quick Verification)**

1. Go to Navigation tab
2. Tap "Open Google Maps"
3. Wait 5-10 seconds
4. Switch back to YathraGo Driver app manually
5. If you're near the student location (within 100m), button should appear

## Files Modified

### New Files

- ✅ `mobile-driver/lib/services/background-location.service.ts` - Background tracking service
- ✅ `BACKGROUND_LOCATION_TRACKING.md` - Comprehensive documentation
- ✅ `BACKGROUND_TRACKING_SETUP_GUIDE.md` - This file

### Modified Files

- ✅ `mobile-driver/app.config.js` - Added permissions and plugins
- ✅ `mobile-driver/app/_layout.tsx` - Added notification channel setup
- ✅ `mobile-driver/app/(tabs)/navigation.tsx` - Integrated background tracking
- ✅ `mobile-driver/package.json` - Added expo-notifications and expo-task-manager

## Permissions Added

### Android (app.config.js)

```javascript
'ACCESS_FINE_LOCATION',           // Precise location
'ACCESS_COARSE_LOCATION',         // Approximate location
'ACCESS_BACKGROUND_LOCATION',     // Background access
'FOREGROUND_SERVICE',             // Foreground service
'FOREGROUND_SERVICE_LOCATION',    // Location-specific foreground service
```

### iOS (app.config.js)

```javascript
NSLocationAlwaysAndWhenInUseUsageDescription; // Always + when-in-use
NSLocationWhenInUseUsageDescription; // When-in-use
UIBackgroundModes: ["location", "fetch"]; // Background modes
```

## Common Issues & Solutions

### Issue: "Permissions Required" Alert Keeps Appearing

**Solution**:

1. Go to device Settings > Apps > YathraGo Driver > Permissions
2. Set Location to "Allow all the time" or "Allow only while using the app"
3. Enable Notifications
4. Restart the app

### Issue: Background Tracking Badge Doesn't Show

**Solution**:

1. Make sure you rebuilt the app (not just refreshed)
2. Check that permissions are granted
3. Look in console logs for permission errors
4. Try tapping "Open Google Maps" again

### Issue: No Notification When Arriving

**Solution**:

1. Check notification permission is granted
2. Verify "Do Not Disturb" is off
3. Check battery saver isn't blocking the app
4. Android: Check notification channel settings
5. Make sure you're actually within 100m of the destination

### Issue: "Cannot start background tracking"

**Solution**:

1. Background location permission not granted
2. Go to Settings > Apps > YathraGo Driver > Permissions
3. Set Location to "Allow all the time"
4. Restart the app

### Issue: High Battery Usage

**Solution**:

1. This is expected when background tracking is active
2. Tracking stops automatically after marking attendance
3. Don't leave navigation screen active when not navigating
4. Battery usage is optimized with "balanced" accuracy

## Configuration

### Adjust Distance Threshold

Default is 100 meters. To change:

**File**: `mobile-driver/lib/services/background-location.service.ts`

```typescript
// Line 152
if (distance <= 100) {
  // Change to 50, 150, etc.
  await sendArrivalNotification(destination);
}
```

### Adjust Update Frequency

Default is every 5 seconds or 10 meters. To change:

**File**: `mobile-driver/lib/services/background-location.service.ts`

```typescript
// Line 209-210
await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
  accuracy: Location.Accuracy.Balanced,
  timeInterval: 5000, // Change this (milliseconds)
  distanceInterval: 10, // Change this (meters)
  // ...
});
```

## Verification Checklist

After rebuilding and installing:

- [ ] App launches successfully
- [ ] Navigation tab loads student locations
- [ ] Permission prompts appear for location and notifications
- [ ] All permissions granted
- [ ] "Background Tracking Active" badge appears
- [ ] "Open Google Maps" button works
- [ ] Google Maps opens with correct destination
- [ ] App continues running in background (check foreground notification on Android)
- [ ] Notification received when near destination (or test manually)
- [ ] Mark attendance button appears when near
- [ ] Attendance marked successfully
- [ ] Background tracking stops after marking attendance
- [ ] Next student prompt appears (if multiple students)

## Additional Testing Tips

### Test Without Actually Driving

1. **Mock Location** (Android):
   - Enable Developer Options
   - Enable "Mock Location App"
   - Use a GPS mocking app to simulate movement
2. **Change Distance Threshold**:
   - Temporarily set distance threshold to 1000m or more
   - This will trigger notification even if you're far away
   - Remember to change it back after testing!

### Logs to Check

Enable verbose logging and check for:

```javascript
// Success messages
"Background tracking started";
"Background location: distance to destination: XXXm";
"Arrival notification sent for: [Student Name]";
"Background location tracking stopped";

// Error messages
"Background location permission denied";
"Error starting background location tracking";
"Error checking proximity";
```

## Production Checklist

Before releasing to production:

- [ ] Test on multiple physical devices (Android & iOS if applicable)
- [ ] Verify battery usage is acceptable
- [ ] Test with poor GPS signal
- [ ] Test with multiple students in sequence
- [ ] Test permission denial scenarios
- [ ] Verify notifications work consistently
- [ ] Check that tracking stops properly
- [ ] Test app switching back and forth
- [ ] Verify distance threshold is appropriate
- [ ] Test during actual driving route
- [ ] Review privacy policy covers background location
- [ ] Submit for App Store review (mention background location use)

## Support

For issues:

1. Check console logs
2. Verify device permissions
3. Ensure app was rebuilt (not just refreshed)
4. Test on physical device only
5. Check BACKGROUND_LOCATION_TRACKING.md for detailed docs

## Next Steps After Setup

1. **Rebuild the app** - Most important step!
2. **Test on physical device** - Emulators won't work
3. **Grant all permissions** - Required for functionality
4. **Test the full flow** - Follow testing scenario above
5. **Check logs** - Verify everything is working
6. **Fine-tune settings** - Adjust distance/frequency if needed

---

**Ready to Test?**

1. Run: `npx expo run:android` (or iOS)
2. Open app on physical device
3. Go to Navigation tab
4. Grant all permissions
5. Tap "Open Google Maps"
6. Navigate toward student location
7. Receive notification when close
8. Mark attendance
9. Success! 🎉

---

**Last Updated**: October 18, 2025
