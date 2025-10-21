# Location Tracking - Updated Quick Start Guide (2025)

## 🚀 Quick Testing (TL;DR)

### Driver App
1. Login as driver
2. Go to Navigation tab
3. Click **"Start Morning Route"** or **"Start Evening Route"**
4. ✅ Look for **🟢 Live (X updates)** in header
5. Complete stops normally
6. After last stop, tracking automatically stops

### Customer App
1. Login as customer
2. Select child/staff profile (must be assigned to a driver)
3. Go to Navigate tab
4. ✅ See driver's **green car marker** on map
5. ✅ Watch it move in real-time every 10 seconds

---

## 📋 Prerequisites Checklist

- [ ] Backend running
- [ ] Driver registered and verified
- [ ] Customer has child/staff profile
- [ ] Ride request created and assigned
- [ ] Both apps have correct `EXPO_PUBLIC_API_URL` in .env

---

## 🔧 How It Works (Simple Version)

```
Driver clicks "Start Route"
    ↓
Backend creates route with ID (e.g., 123)
    ↓
Driver app starts sending location every 10s via WebSocket
    ↓
Customer app fetches driver's active route ID
    ↓
Customer subscribes to route updates via WebSocket
    ↓
Customer receives driver location in real-time
    ↓
Driver completes all stops
    ↓
Tracking stops automatically
```

---

## 🛠️ Key Files

### Backend
- `backend/src/driver-location/driver-location.gateway.ts` - WebSocket handler
- `backend/src/driver-route/driver-route.controller.ts` - Added GET /driver/route/active/:driverId

### Driver App
- `mobile-driver/app/(tabs)/navigation.tsx` - Start/stop tracking
- `mobile-driver/lib/services/driver-location.service.ts` - Location service

### Customer App
- `mobile-customer/app/(tabs)/navigate.tsx` - Display driver location
- `mobile-customer/lib/services/customer-location.service.ts` - Receive updates

---

## 🐛 Troubleshooting

### Driver location not showing?

**Check driver app console for**:
```
✅ Location tracking started successfully
📍 Location updated (1 updates)
```

**If you see**:
```
⚠️ Location tracking could not be started
```
→ Check location permissions

### Customer not receiving updates?

**Check customer app console for**:
```
✅ Connected to location tracking server
✅ Subscribed to route 123
📍 Driver location updated
```

**If missing**:
1. Ensure driver has actually started route
2. Check network connection
3. Verify `EXPO_PUBLIC_API_URL` is correct
4. Check that customer has assigned driver

### Backend issues?

**Verify**:
```bash
# Check if route exists
curl http://localhost:3000/driver/route/active/[driverId]

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

---

## 📱 Testing Workflow

### Setup (One Time)
1. Create driver account → verify → add vehicle
2. Create customer account → add child/staff profile with locations
3. Customer requests ride → driver accepts → admin assigns

### Test Flow (Repeatable)
1. **Driver**: Start route
2. **Check**: Driver sees "🟢 Live" in header
3. **Customer**: Open Navigate tab
4. **Check**: Customer sees green car marker
5. **Move**: Walk/drive with driver phone
6. **Check**: Customer sees marker move
7. **Driver**: Complete all stops
8. **Check**: Both apps show "completed" state

---

## 🔑 Key Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/driver/route/today` | POST | Start route & get stops |
| `/driver/route/active/:driverId` | GET | Get active route ID |
| WebSocket `/driver-location` | - | Real-time updates |

---

## 🎯 Success Indicators

### Driver App
- ✅ Green pulsing dot in header
- ✅ "Live (X updates)" text
- ✅ Update count increases

### Customer App
- ✅ Green car marker on map
- ✅ "Driver on the way" card
- ✅ "🟢 Live" indicator
- ✅ Marker moves smoothly

### Backend Logs
```
✅ Connected to location tracking server
🚗 Ride started confirmed
📍 Location updated: 6.927100, 79.861200
📡 Subscribing to route 123...
✅ Subscribed to route 123
```

---

## 💡 Pro Tips

1. **Use physical devices** for best location accuracy
2. **Check console logs** - they're very detailed
3. **Test reconnection** - turn WiFi off/on
4. **Multiple customers** - test with 2+ profiles
5. **Complete flow** - don't skip the "assign" step

---

## 📖 Full Documentation

See `REAL_TIME_LOCATION_TRACKING_IMPLEMENTATION.md` for:
- Complete architecture details
- API reference
- Security considerations
- Performance optimization
- Future enhancements

---

## 🎉 Expected Behavior

**Morning Route**:
```
08:00 - Driver starts morning route
08:01 - Customer sees driver location
08:05 - Driver completes first pickup
08:10 - Customer still sees updates
08:30 - Driver completes all pickups
08:31 - Tracking stops, customer sees "Ride ended"
```

**Evening Route**:
```
14:00 - Driver starts evening route (after morning completed)
14:01 - Customer sees driver location again
14:30 - All drop-offs complete
14:31 - Tracking stops for the day
```

---

That's it! Simple as that. The system handles all the complexity automatically. 🎊
