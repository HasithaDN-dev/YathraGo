# Quick Test Script - Location Tracking

## Prerequisites
- Backend running on port 3000
- Driver app running
- Customer app running
- Driver has assigned students
- At least one student marked present

## Quick Test (5 minutes)

### 1. Start Backend (Terminal 1)
```powershell
cd backend
npm run start:dev
```
**Wait for:** `✓ Nest application successfully started`

### 2. Start Driver App (Terminal 2)
```powershell
cd mobile-driver
npm run start
```

### 3. Driver Actions
1. Login with driver credentials
2. Navigate to **Navigation** tab
3. Click **"Start Morning Route"** button
4. **Check Console:** Should see:
   ```
   ✅ Location tracking started successfully
   🟢 Live (1 updates)
   ```

### 4. Start Customer App (Terminal 3)
```powershell
cd mobile-customer
npm run start
```

### 5. Customer Actions
1. Login with customer/parent credentials
2. Select a **child profile** (that is assigned to the driver)
3. Navigate to **Navigate** tab
4. **Wait 15 seconds** (automatic polling)
5. **Check Console:** Should see:
   ```
   ✅ Found assigned ride
   ✅ Found active route: {routeId: X, ...}
   ✅ Connected to location tracking server
   ✅ Subscribed to route X
   📍 Driver location received: {...}
   ```

### 6. Verify on Map
- Customer app map should show:
  - **Blue marker** = Your location
  - **Green car marker** = Driver location
  - Driver marker should **move** as driver's location updates

### 7. Watch Real-Time Updates
**Every 10 seconds you should see:**

**Driver Console:**
```
📍 Location updated (2 updates)
📍 Location updated (3 updates)
📍 Location updated (4 updates)
```

**Customer Console:**
```
📍 Driver location received: {...}
📍 Driver location received: {...}
📍 Driver location received: {...}
```

**Map:**
- Green car marker should move smoothly

## Success Checklist

### Backend ✓
- [ ] Server started without errors
- [ ] Shows "Client connected" when apps connect
- [ ] Shows "Start ride request: Driver X, Route Y"
- [ ] Shows "Ride started: Driver X, Route Y"
- [ ] Shows "Customer X subscribing to route Y"

### Driver App ✓
- [ ] Profile loaded automatically
- [ ] Can start route
- [ ] Green indicator: "🟢 Live (X updates)"
- [ ] Console shows location updates every 10s
- [ ] No error messages

### Customer App ✓
- [ ] Can select child profile
- [ ] Finds assigned ride
- [ ] Gets active route (no 401 error)
- [ ] WebSocket connects
- [ ] Subscribes to route
- [ ] Receives location updates
- [ ] Map shows both markers
- [ ] Driver marker moves

## Common Issues

### ❌ "401 Unauthorized"
- **Fix:** Restart backend (already has @Public() decorator)

### ❌ "Driver has no active route"
- **Fix:** Make sure driver clicked "Start Morning Route"
- **Check:** Backend logs should show "Ride started"

### ❌ "Not receiving location updates"
- **Fix:** Check `.env` files have correct API_URL
- **Fix:** Ensure all devices on same network
- **Fix:** Verify location permissions granted

### ❌ "No assigned ride found"
- **Fix:** Ensure child is assigned to a driver
- **Fix:** Check ride request status is "Assigned"

## Expected Timeline

```
0:00 - Start backend
0:30 - Backend ready
0:40 - Start driver app
1:00 - Driver logs in
1:10 - Navigate to Navigation tab
1:15 - Click "Start Morning Route"
1:20 - Route created, tracking started
1:30 - Start customer app
2:00 - Customer logs in
2:10 - Select child profile
2:15 - Navigate to Navigate tab
2:30 - Auto-polling finds assigned ride
2:35 - Fetches active route (SUCCESS)
2:40 - WebSocket connects
2:45 - Subscribes to route
2:50 - First location update received
3:00 - Driver marker appears on map
3:10 - Second location update
3:20 - Driver marker moves
```

**Total Time:** ~3 minutes from start to working location tracking

## Debug Commands

### Check backend connection
```powershell
curl http://localhost:3000/driver/route/active/5
```

### Check WebSocket (from browser console)
```javascript
const socket = io('http://YOUR_IP:3000/driver-location', {
  transports: ['websocket']
});

socket.on('connect', () => console.log('Connected'));
socket.on('driverLocationUpdated', (data) => console.log('Location:', data));
```

### Check process on port 3000
```powershell
netstat -ano | findstr :3000
```

## Emergency Reset

If nothing works:

```powershell
# Kill all Node processes
taskkill /F /IM node.exe

# Clear all caches
cd backend
npm run start:dev

cd ../mobile-driver
npm run start:clear

cd ../mobile-customer
npm run start:clear
```

## Expected Output Examples

### Backend (Success)
```
[Nest] 1234 - LOG [DriverLocationGateway] Client connected: abc123
[Nest] 1234 - LOG [DriverLocationGateway] Start ride request: Driver 5, Route 54
[Nest] 1234 - LOG [DriverLocationService] Ride started: Driver 5, Route 54
[Nest] 1234 - LOG [DriverLocationGateway] Ride started broadcast sent for route 54
[Nest] 1234 - LOG [DriverLocationGateway] Customer 16 subscribing to route 54
[Nest] 1234 - LOG [DriverLocationService] Customer 16 subscribed to route 54
```

### Driver App (Success)
```
✅ [RootLayout] loadProfile completed
🔍 Checking location tracking requirements: {profileId: 5, routeId: 54, ...}
🚀 Starting location tracking... {driverId: 5, routeId: 54}
✅ Connected to location tracking server
✅ Location tracking started successfully
📍 Location updated (1 updates)
📍 Location updated (2 updates)
📍 Location updated (3 updates)
```

### Customer App (Success)
```
📡 Checking for assigned ride for child ID: 16
✅ Found assigned ride: {driverId: 5, ...}
📡 Fetching active route for driver ID: 5
📦 Route data response: {success: true, activeRoute: {routeId: 54, ...}}
✅ Found active route: {routeId: 54, routeType: 'MORNING_PICKUP', ...}
🚀 Starting driver tracking for route: 54
✅ Connected to location tracking server
✅ Subscribed to route 54
📍 Driver location received: {latitude: 6.927, longitude: 79.861, ...}
📍 Driver location received: {latitude: 6.928, longitude: 79.862, ...}
```

## Visual Confirmation

### Driver App Screen
```
┌─────────────────────────────┐
│ Ride in Progress            │
│ 🟢 Live (5 updates)         │  ← Green indicator
│ Stop 1 of 5                 │
├─────────────────────────────┤
│ Next Pickup                 │
│ John Doe                    │
│ 123 Main St                 │
│ ETA 5 min  •  2.3km        │
├─────────────────────────────┤
│ [Get Directions]            │
│ [Mark as Picked Up]         │
└─────────────────────────────┘
```

### Customer App Screen
```
┌─────────────────────────────┐
│        MAP VIEW             │
│                             │
│     📍 (Blue - You)         │  ← Your location
│                             │
│                             │
│   🚗 (Green - Driver)       │  ← Driver location (moving)
│                             │
│                             │
│                             │
├─────────────────────────────┤
│ 🚗 Driver: Sujeewa Prasad   │
│ 📞 +94752245185             │
│ Status: Active              │
│ ETA: 5 mins                 │
└─────────────────────────────┘
```

## What You Should See

1. **Driver starts route** → Green indicator appears
2. **Customer opens Navigate** → Polling starts
3. **After 15 seconds** → Customer finds driver
4. **WebSocket connects** → Both apps connected
5. **Every 10 seconds** → Location updates flow
6. **On map** → Green car marker moves smoothly
7. **Real-time tracking** → Customer always sees driver

## Success = All Green ✓

If you see all these, location tracking is working perfectly:
- ✓ Backend: No errors, shows all connections
- ✓ Driver: Green indicator, location updates
- ✓ Customer: Green car marker moving on map
- ✓ Console: Location updates every 10 seconds
- ✓ No 401 errors
- ✓ No connection errors
- ✓ Smooth marker movement

**Time to celebrate! 🎉 Location tracking is working!**
