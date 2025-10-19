# Background Location Tracking Implementation

## Overview

This document describes the implementation of background location tracking for the YathraGo Driver app. This feature allows the app to track the driver's location even when they switch to Google Maps for navigation, and automatically notify them when they reach a student's pickup or drop-off location.

## Features

### 1. Background Location Tracking

- **Continuous Tracking**: The app tracks the driver's location in the background while navigating to student locations
- **Low Battery Impact**: Uses balanced accuracy and intelligent update intervals (every 5 seconds or 10 meters)
- **Foreground Service**: On Android, uses a foreground service to ensure tracking continues reliably

### 2. Automatic Arrival Detection

- **Proximity Detection**: Automatically detects when the driver is within 100 meters of the destination
- **Smart Notifications**: Sends a high-priority notification when arrival is detected
- **Audio & Vibration**: Notification includes sound and vibration to alert the driver

### 3. Seamless App Switching

- **Google Maps Integration**: Driver can open Google Maps for turn-by-turn navigation
- **Automatic Monitoring**: App continues monitoring location in the background
- **Return Notification**: When destination is reached, notification prompts driver to return to app

### 4. Visual Feedback

- **Tracking Status Indicator**: Shows "Background Tracking Active" badge when tracking is enabled
- **Real-time Updates**: Location updates every 5 seconds when app is in foreground
- **Status Persistence**: Tracking status is maintained across app switches

## User Flow

### Starting Navigation

1. Driver views the navigation screen with current student location
2. Driver taps "Open Google Maps" button
3. App requests background location and notification permissions (if not already granted)
4. Background tracking starts automatically
5. Google Maps opens with navigation to the student's location
6. App shows "Background Tracking Active" indicator

### During Navigation

1. Driver follows Google Maps turn-by-turn directions
2. App continues tracking location in the background
3. Foreground service notification shows "Navigating to [Student Name]'s [pickup/dropoff] location"
4. App calculates distance to destination every 5 seconds

### Arriving at Destination

1. When driver comes within 100 meters of the destination:

   - High-priority notification is sent
   - Notification title: "📍 Pickup Location Reached" or "📍 Drop-off Location Reached"
   - Notification body: "You've arrived at [Student Name]'s [type] location. Tap to mark attendance."
   - Phone vibrates with pattern: [0ms, 250ms, 250ms, 250ms]

2. Driver can either:
   - **Tap notification**: Returns to app and shows mark attendance button
   - **Manually switch**: Open app and see mark attendance button automatically displayed
   - **Continue**: Stay in Google Maps until ready, then switch back

### Marking Attendance

1. Driver switches to YathraGo Driver app (if not already there)
2. "Mark Pickup" or "Mark Drop-off" button is visible
3. Driver taps button to mark attendance
4. Background tracking automatically stops
5. If there's a next student, app prompts to navigate to them

## Technical Implementation

### Background Location Service

Located in: `mobile-driver/lib/services/background-location.service.ts`

**Key Functions:**

- `requestPermissions()`: Requests foreground, background location, and notification permissions
- `startTracking(destination)`: Starts background location tracking for a specific destination
- `stopTracking()`: Stops background location tracking
- `checkProximity()`: Manually checks if driver is near the destination
- `setupNotificationHandler()`: Sets up handler for notification taps

**Background Task:**

- Task Name: `background-location-task`
- Uses Expo TaskManager to define background location task
- Calculates distance using Haversine formula
- Triggers notification when within 100 meters

### Navigation Screen Updates

Located in: `mobile-driver/app/(tabs)/navigation.tsx`

**New Features:**

- Background permission request on mount
- App state monitoring (foreground/background detection)
- Automatic proximity checking when app returns to foreground
- Background tracking status indicator
- Enhanced "Open Google Maps" with tracking initialization
- Enhanced "Mark Attendance" with tracking cleanup
- Next stop prompt after completing current stop

### App Configuration

Located in: `mobile-driver/app.config.js`

**Android Permissions:**

- `ACCESS_FINE_LOCATION`: Precise location access
- `ACCESS_COARSE_LOCATION`: Approximate location access
- `ACCESS_BACKGROUND_LOCATION`: Background location access
- `FOREGROUND_SERVICE`: Foreground service capability
- `FOREGROUND_SERVICE_LOCATION`: Location-specific foreground service

**iOS Permissions:**

- `NSLocationAlwaysAndWhenInUseUsageDescription`: Always + when-in-use permission
- `NSLocationWhenInUseUsageDescription`: When-in-use permission
- `UIBackgroundModes`: ['location', 'fetch'] - Background execution modes

### Notification Setup

Located in: `mobile-driver/app/_layout.tsx`

**Android Notification Channel:**

- Channel ID: `location-tracking`
- Name: "Location Tracking"
- Importance: HIGH
- Vibration Pattern: [0, 250, 250, 250]
- Sound: Default
- Vibration: Enabled
- Badge: Enabled

## Permissions

### Required Permissions

1. **Foreground Location** (Always required)

   - Used when app is in foreground
   - Required for basic functionality

2. **Background Location** (Strongly recommended)

   - Used when app is in background
   - Critical for automatic arrival detection
   - Without this, driver must manually check arrival

3. **Notifications** (Strongly recommended)
   - Used to alert driver of arrival
   - Critical for automatic notifications
   - Without this, no arrival alerts

### Permission Handling

- Permissions are requested when navigation screen first loads
- If background permission is denied, app shows warning but continues to work
- Driver can still use manual proximity checking
- Alert shows explaining why permissions are needed

## Testing

### Prerequisites

1. Install the app on a physical device (background location doesn't work in simulator)
2. Grant all requested permissions
3. Have at least one student assigned with a valid location

### Test Scenario 1: Background Tracking with Google Maps

1. Navigate to the Navigation tab
2. Wait for route to load
3. Verify permissions are granted
4. Tap "Open Google Maps" for current student
5. Verify "Background Tracking Active" badge appears
6. Google Maps should open
7. Navigate toward the destination
8. When within 100m, you should receive a notification
9. Tap notification or switch back to app
10. Verify "Mark [Pickup/Drop-off]" button is visible
11. Mark attendance
12. Verify tracking stops

### Test Scenario 2: Manual App Switching

1. Navigate to the Navigation tab
2. Tap "Open Google Maps"
3. Navigate in Google Maps toward destination
4. Don't wait for notification
5. Manually switch back to YathraGo Driver app
6. App should detect you're near and show attendance button

### Test Scenario 3: Multiple Students

1. Start navigation with multiple students
2. Complete pickup for first student
3. App should prompt "Ready to navigate to [next student]?"
4. Tap "Navigate"
5. Repeat process for each student

## Troubleshooting

### Background Tracking Not Working

**Issue**: Background tracking doesn't start or stops unexpectedly

**Solutions**:

1. Check permissions in device settings
2. Ensure battery optimization is disabled for the app
3. Verify location services are enabled
4. On Android, check if battery saver mode is affecting the app

### Notifications Not Received

**Issue**: No notification when reaching destination

**Solutions**:

1. Check notification permissions in device settings
2. Verify notification channel settings (Android)
3. Check Do Not Disturb settings
4. Ensure app has permission to run in background

### Location Inaccuracy

**Issue**: Wrong distance or late notifications

**Solutions**:

1. Ensure GPS is enabled (not just Wi-Fi location)
2. Check if in area with good GPS signal
3. Wait a few seconds for GPS to acquire accurate location
4. Try restarting the app

### Battery Drain

**Issue**: App consuming too much battery

**Solutions**:

1. Check tracking accuracy settings (currently set to "balanced")
2. Ensure tracking is stopped when not needed
3. Verify no multiple tracking sessions running
4. Check if other apps are also using location

## Configuration Options

### Distance Threshold

Default: **100 meters**

To change, edit `background-location.service.ts`:

```typescript
// Line 152
if (distance <= 100) {  // Change this value
```

### Update Intervals

Default: **5 seconds** or **10 meters**

To change, edit `navigation.tsx`:

```typescript
// Line 209-210 in startLocationUpdatesAsync
timeInterval: 5000,      // milliseconds
distanceInterval: 10,    // meters
```

### Location Accuracy

Default: **Balanced**

Options:

- `Location.Accuracy.Lowest` - Very low power
- `Location.Accuracy.Low` - Low power
- `Location.Accuracy.Balanced` - Good balance (current)
- `Location.Accuracy.High` - High accuracy
- `Location.Accuracy.Highest` - Highest accuracy
- `Location.Accuracy.BestForNavigation` - Best for navigation

To change, edit `background-location.service.ts`:

```typescript
// Line 206
accuracy: Location.Accuracy.Balanced,  // Change this
```

## Future Enhancements

### Possible Improvements

1. **Geofencing**: Use native geofencing APIs for even lower battery usage
2. **Route Deviation Detection**: Alert if driver deviates significantly from route
3. **ETA Predictions**: More accurate arrival time predictions
4. **Offline Support**: Cache route data for offline navigation
5. **Background Map**: Show mini-map in notification (Android)
6. **Voice Alerts**: Spoken notification when arriving
7. **Smart Tracking**: Adjust tracking frequency based on distance to destination
8. **Historical Tracking**: Save location history for trip replay

### Known Limitations

1. **iOS Restrictions**: iOS is more restrictive with background location usage
2. **Battery Impact**: Continuous background tracking does impact battery life
3. **GPS Accuracy**: Urban canyons and tunnels can affect accuracy
4. **Simulator**: Background location tracking does not work in iOS Simulator
5. **Permission Persistence**: Users may revoke permissions at any time

## Code Structure

```
mobile-driver/
├── app/
│   ├── _layout.tsx                           # Notification channel setup
│   └── (tabs)/
│       └── navigation.tsx                    # Main navigation screen with tracking
├── lib/
│   └── services/
│       └── background-location.service.ts    # Background tracking service
└── app.config.js                            # Permission configuration
```

## API Dependencies

- **expo-location**: Location tracking (foreground and background)
- **expo-notifications**: Push notifications
- **expo-task-manager**: Background task management
- **expo-linking**: Opening Google Maps

## Best Practices

1. **Permission Timing**: Request permissions when needed, not at app startup
2. **Clear Communication**: Always explain why permissions are needed
3. **Graceful Degradation**: App works without background permissions, just with reduced functionality
4. **Battery Awareness**: Use balanced accuracy and appropriate update intervals
5. **User Feedback**: Show clear visual indicators of tracking status
6. **Cleanup**: Always stop tracking when no longer needed
7. **Error Handling**: Handle permission denials and location errors gracefully

## Compliance

### Privacy Considerations

- Location data is only used for navigation and attendance marking
- Location is not stored permanently on the device
- No location data is shared with third parties
- Background tracking only active during navigation
- User can disable at any time through system settings

### App Store Guidelines

**iOS App Store:**

- Background location usage is explained in permission dialog
- InfoPlist descriptions are clear and specific
- Background modes are justified by app functionality

**Google Play Store:**

- Permissions are requested in context
- Background location is essential for app functionality
- Privacy policy covers location data usage

## Support

For issues or questions:

1. Check this documentation
2. Review console logs for error messages
3. Test on physical device (not simulator)
4. Verify all permissions are granted
5. Check device settings for battery optimization

## Version History

- **v1.0.0** (October 2025)
  - Initial implementation
  - Background location tracking
  - Automatic arrival notifications
  - Google Maps integration
  - Visual status indicators

---

**Last Updated**: October 18, 2025
**Author**: YathraGo Development Team
