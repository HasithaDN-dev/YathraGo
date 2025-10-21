# Customer App - Driver Location Not Showing - Troubleshooting

## Issue
Customer can only see their own location on the map, not the driver's location.

## What We Fixed

### 1. Automatic Polling ✅
- Customer app now automatically checks for driver's route status every 15 seconds
- No need to click any button - it happens automatically

### 2. Better UI Feedback ✅
- Shows different messages based on status:
  - "No driver assigned yet" - if no ride request assigned
  - "Waiting for Driver - [Driver Name] hasn't started their route yet" - if assigned but driver hasn't started
  - "Driver on the way - Live" - if driver is actively sharing location

### 3. Manual Refresh Button ✅
- Added "🔄 Refresh Driver Status" button for manual checking
- Shows driver info even before route starts

## Testing Checklist

### Prerequisites
- [ ] Customer has a child/staff profile created
- [ ] Driver is assigned to this child/staff (ride request accepted and assigned)
- [ ] Driver app is running
- [ ] Customer app is on Navigate tab

### Test Steps

1. **Open Customer App**
   - Login as customer
   - Select the child/staff profile that has an assigned driver
   - Navigate to "Navigate" tab
   - ✅ **Should see**: "Waiting for Driver - [Driver Name] hasn't started..."

2. **Driver Starts Route** (on driver app)
   - Driver goes to Navigation tab
   - Driver clicks "Start Morning Route" or "Start Evening Route"
   - ✅ **Driver should see**: "🟢 Live (X updates)" in header

3. **Customer App Auto-Updates** (within 15 seconds)
   - Customer app automatically detects driver has started
   - ✅ **Should see**: Green car marker appear on map
   - ✅ **Should see**: "Driver on the way - Live" status
   - ✅ **Should see**: Dotted line connecting customer to driver

4. **Real-Time Movement**
   - Move driver's phone/device
   - ✅ **Should see**: Driver marker moves on customer's map every ~10 seconds

## Console Logs to Check

### Customer App Console

**When driver NOT started yet:**
```
📍 Active profile: {...}
📡 Checking for assigned ride for child ID: 14
✅ Found assigned ride: {...}
📡 Fetching active route for driver ID: 7
📦 Route data response: { success: false, message: "No active route..." }
ℹ️ Driver has no active route yet - will check again shortly
```

**When driver HAS started:**
```
📍 Active profile: {...}
📡 Checking for assigned ride for child ID: 14
✅ Found assigned ride: {...}
📡 Fetching active route for driver ID: 7
📦 Route data response: { success: true, activeRoute: { routeId: 123, ... } }
✅ Found active route: { routeId: 123, routeType: "MORNING_PICKUP", ... }
🚀 Starting driver tracking for route: 123
✅ Connected to location tracking server
📡 Subscribing to route 123...
✅ Subscribed to route 123
✅ Started tracking driver
📍 Driver location received: { latitude: 6.92, longitude: 79.86, ... }
```

## Common Issues & Solutions

### Issue: "No assigned ride found"

**Cause**: Customer profile doesn't have a driver assigned

**Solution**:
1. Go to customer app home screen
2. Check if assigned driver card is showing
3. If not, create a ride request and get driver to accept it
4. Admin needs to assign the accepted request

### Issue: "Driver hasn't started their route yet"

**Cause**: Driver assigned but hasn't clicked "Start Route" button

**Solution**:
1. Open driver app
2. Go to Navigation tab
3. Click "Start Morning Route" or "Start Evening Route"
4. Wait for customer app to auto-detect (within 15 seconds)

### Issue: Driver started but customer still doesn't see location

**Check Backend**:
```bash
# Check if route is active
curl http://YOUR_IP:3000/driver/route/active/[driverId]

# Should return:
{
  "success": true,
  "activeRoute": {
    "routeId": 123,
    "routeType": "MORNING_PICKUP",
    "status": "IN_PROGRESS"
  }
}
```

**If backend returns `success: false`**:
- Driver route is not marked as IN_PROGRESS in database
- Driver needs to restart the route

**Check WebSocket Connection**:
- Look for "✅ Connected to location tracking server" in customer console
- If missing, check network connectivity
- Verify `EXPO_PUBLIC_API_URL` in .env file

### Issue: Old location showing

**Cause**: Driver completed route earlier today

**Solution**:
- Driver completed morning route already
- They need to start evening route
- Or wait for next day for fresh route

### Issue: Customer can't select profile

**Solution**:
1. Go to Home tab
2. Click profile dropdown at top
3. Select the child/staff profile
4. Go back to Navigate tab

## Environment Check

### Mobile Customer App (.env)
```env
EXPO_PUBLIC_API_URL=http://192.168.X.X:3000
```
⚠️ Must be your computer's IP address, not localhost!

### Backend Running
```bash
cd backend
npm run start:dev

# Should see:
# Application is running on: http://[::]:3000
```

### WebSocket Server Running
Check backend logs for:
```
WebSocket Gateway initialized for driver location tracking
```

## Quick Test Flow

1. **Backend**: Ensure running (`npm run start:dev`)
2. **Driver App**: Login → Navigation → Start Morning Route
3. **Driver App**: Verify "🟢 Live (X updates)" shows
4. **Customer App**: Login → Select profile → Navigate tab
5. **Customer App**: Wait 15 seconds (auto-check)
6. **Customer App**: Should see driver's green car marker
7. **Driver App**: Walk/move phone
8. **Customer App**: Watch marker move every 10 seconds

## Debug Commands

### Check Driver's Active Route
```bash
# Replace [driverId] with actual driver ID
curl http://YOUR_IP:3000/driver/route/active/7
```

### Check Assigned Ride
```bash
# Replace [childId] with actual child ID
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://YOUR_IP:3000/customer/assigned-ride/child/14
```

## Expected Timeline

```
0:00 - Customer opens Navigate tab
0:01 - App checks for assigned ride
0:01 - Shows "Waiting for Driver - [Name] hasn't started..."
0:05 - Driver starts route on their app
0:06 - Driver sees "🟢 Live (1 updates)"
0:15 - Customer app auto-checks again (15s poll)
0:15 - Customer sees driver marker appear!
0:16 - Customer sees "Driver on the way - Live"
0:26 - Location updates (every 10s)
0:36 - Location updates
...
```

## Still Not Working?

**Check these in order**:

1. ✅ Is backend running?
2. ✅ Is `EXPO_PUBLIC_API_URL` correct in both apps?
3. ✅ Does customer have assigned driver? (Check home screen)
4. ✅ Has driver started route? (Check driver app header)
5. ✅ Is route status IN_PROGRESS? (Check backend API)
6. ✅ Are both devices on same network?
7. ✅ Check console logs in both apps
8. ✅ Try manual refresh button on customer app

## Summary

The customer app now:
- ✅ Automatically checks every 15 seconds
- ✅ Shows clear status messages
- ✅ Displays driver info even before route starts
- ✅ Has manual refresh button
- ✅ Auto-connects when driver starts route

No button clicks needed - just open Navigate tab and wait!
