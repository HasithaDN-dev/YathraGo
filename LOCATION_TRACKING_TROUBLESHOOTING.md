# Driver Location Tracking - Troubleshooting Guide

## Common Errors and Solutions

### Error: "Validation failed (numeric string is expected)"

**Error Message**:
```
Get assigned child ride error: {"error": "Bad Request", "message": "Validation failed (numeric string is expected)", "statusCode": 400}
```

#### Cause
This error occurs when trying to fetch assigned ride information for a child profile that doesn't have a valid numeric ID.

#### Possible Reasons

1. **Profile Not Fully Set Up**
   - Child profile exists but hasn't been synced with backend
   - Profile was created locally but not saved to database
   
2. **Profile ID Format Issue**
   - Profile ID is not a number (e.g., "temp-123" or UUID)
   - Profile ID is null or undefined

3. **Profile State Not Loaded**
   - Active profile is loading when API call is made
   - Profile store hasn't initialized yet

#### Solutions

##### Solution 1: Verify Profile Has Valid ID

1. Open customer app console/logs
2. Look for: `📍 Active profile: { id: "XXX", type: "child", ... }`
3. Check if the ID is a number (e.g., "123") or something else

**If ID is not a number:**
- The child profile needs to be properly created/saved
- Go to registration flow and complete child profile setup
- Ensure profile is saved to backend before using tracking

##### Solution 2: Check Profile Loading State

The app now checks for assigned rides when the profile changes, not on mount. This prevents calling the API before the profile is loaded.

**Verification**:
```
Console should show:
1. "📍 Active profile: ..." 
2. "📡 Checking for assigned ride for child ID: XXX"
3. Either "✅ Found assigned ride" or "ℹ️ No assigned ride found"
```

##### Solution 3: Manual Refresh

If you see "Ready to Navigate" card:
1. Tap "Tap to check for assigned driver" button
2. This manually retries the API call
3. Check console for updated logs

##### Solution 4: Verify Backend Data

Check if child profile exists in database:
```sql
SELECT * FROM Child WHERE child_id = XXX;
SELECT * FROM ChildRideRequest WHERE child_id = XXX AND status = 'ACCEPTED';
```

If no ride request exists:
- Child needs to create a ride request
- Driver needs to accept the request
- Only then will tracking be available

#### Debug Steps

1. **Enable Detailed Logging** (Already implemented):
   ```
   Open app → Navigate tab → Check console
   Look for emoji indicators:
   📍 = Profile info
   📡 = API call
   ✅ = Success
   ℹ️ = Info
   ⚠️ = Warning
   ❌ = Error
   ```

2. **Test Profile ID**:
   ```typescript
   // In console, check:
   console.log('Profile:', useProfileStore.getState().activeProfile);
   console.log('ID:', useProfileStore.getState().activeProfile?.id);
   console.log('Is Number:', !isNaN(parseInt(activeProfile?.id)));
   ```

3. **Test API Directly**:
   ```bash
   # Replace TOKEN and CHILD_ID
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        http://YOUR_API/customer/assigned-ride/child/CHILD_ID
   ```

#### Prevention

To prevent this error in the future:

1. **Complete Profile Setup**:
   - Always complete the child registration flow
   - Verify profile appears in profile list
   - Ensure profile has numeric ID

2. **Check Before Tracking**:
   - The app now validates ID before making API call
   - Invalid IDs are logged as warnings
   - No error shown to user for invalid profiles

3. **Handle Edge Cases**:
   ```typescript
   // Current implementation already handles:
   - No active profile
   - Profile without ID
   - Non-numeric ID
   - 404 (no assigned ride)
   - 400 (validation error)
   ```

---

## Other Common Issues

### Issue: No driver marker appears

**Symptoms**: Map loads but no green car marker shows

**Causes**:
1. Driver hasn't started ride yet
2. No assigned ride exists
3. WebSocket connection failed

**Solutions**:
1. Check bottom card: Should say "Waiting for driver" if ride exists
2. Verify driver pressed "Start Ride" button
3. Check console for WebSocket connection: "✅ Connected to location tracking server"

**Debugging**:
```
Look for:
- ℹ️ No assigned ride found → Need to create/accept ride request
- ⚠️ Tracking Error → Check WebSocket connection
- Check driver app: Green "Sharing location" indicator should be visible
```

### Issue: "Could not connect to driver location tracking"

**Causes**:
1. Backend not running
2. Wrong API URL in .env
3. WebSocket port blocked

**Solutions**:
1. Verify backend is running: `npm run start:dev`
2. Check `.env` file: `EXPO_PUBLIC_API_URL=http://YOUR_IP:3000`
3. Ensure both apps use same API URL
4. Test connection: `curl http://YOUR_IP:3000`

### Issue: Driver marker not updating

**Causes**:
1. Driver's location permissions denied
2. GPS not enabled on driver device
3. Ride not started (no "Sharing location" indicator)

**Solutions**:
1. Driver app → Settings → Permissions → Location → Allow always
2. Enable GPS on driver's device
3. Verify driver pressed "Start Ride"

---

## Error Codes Reference

| Status Code | Meaning | Action |
|-------------|---------|--------|
| 400 | Bad Request - Invalid child ID | Check profile has valid numeric ID |
| 401 | Unauthorized - Token expired | Re-login to app |
| 404 | Not Found - No assigned ride | Create/accept ride request first |
| 500 | Server Error | Check backend logs |

---

## Quick Fixes Checklist

When customer can't see driver location:

- [ ] Is a profile selected? (Check top of screen)
- [ ] Does profile have valid numeric ID? (Check console logs)
- [ ] Does child have accepted ride request? (Check with backend/admin)
- [ ] Has driver started ride? (Check driver app for green indicator)
- [ ] Is backend running? (Check URL in browser)
- [ ] Are both apps on same network? (Check IP addresses)
- [ ] Is WebSocket connection established? (Check console for ✅ Connected)

---

## Getting Help

If issue persists after trying above solutions:

1. **Collect Logs**:
   - Customer app console (all messages starting with 📍, 📡, ❌)
   - Driver app console (look for WebSocket messages)
   - Backend logs (check for errors in driver-location module)

2. **Check Configuration**:
   ```
   Customer .env: EXPO_PUBLIC_API_URL=?
   Driver .env:   EXPO_PUBLIC_API_URL=?
   Backend:       Running on port ?
   ```

3. **Test Components Separately**:
   - Backend: Test endpoints with Postman
   - Driver app: Verify location tracking starts
   - Customer app: Verify WebSocket connection

4. **Create Issue** with:
   - Error message (full stack trace)
   - Console logs from both apps
   - Steps to reproduce
   - Profile structure (sanitized)

---

**Last Updated**: January 2025
