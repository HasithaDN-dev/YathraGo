# Driver Route Setup - Enhanced with Ride Type and Time Slots

## 🎯 Overview
This document describes the enhanced driver route setup feature that now includes:
1. **Ride Type Selection**: School, Work, or Both
2. **Time Slots**: Start time and end time for daily trips
3. **City Route**: Multiple cities in travel order (existing feature)

---

## ✨ New Features Added

### 1. Ride Type Selection
- **Options**: School, Work, Both
- **UI**: Dropdown modal with visual selection
- **Default**: "Both" (serves both school children and work passengers)
- **Storage**: Saved in `DriverCities.rideType` (enum: Ridetype)

### 2. Time Slots
- **Start Time**: When driver begins morning pickup route
- **End Time**: When driver completes evening dropoff route
- **UI**: Native time pickers (iOS spinner, Android dialog)
- **Default**: 
  - Start Time: 7:00 AM
  - End Time: 5:00 PM
- **Storage**: Saved in `DriverCities.usualStartTime` and `DriverCities.usualEndTime` (DateTime @db.Time(6))

---

## 📱 Updated UI Components

### SetupRouteCard.tsx Changes

#### New State Variables
```typescript
const [rideType, setRideType] = useState<RideType>('Both');
const [startTime, setStartTime] = useState<Date>(new Date(new Date().setHours(7, 0, 0, 0)));
const [endTime, setEndTime] = useState<Date>(new Date(new Date().setHours(17, 0, 0, 0)));
const [showRideTypeModal, setShowRideTypeModal] = useState(false);
const [showStartTimePicker, setShowStartTimePicker] = useState(false);
const [showEndTimePicker, setShowEndTimePicker] = useState(false);
```

#### New UI Sections

**1. Ride Type Selector**
- Material-style dropdown button
- Shows current selection
- Opens modal with 3 options
- Visual feedback with checkmark

**2. Time Slot Pickers**
- Two side-by-side time inputs
- Clock icon for visual clarity
- Displays in 12-hour format (AM/PM)
- Native platform pickers

**3. Ride Type Modal**
- Full-screen overlay
- Clean selection cards
- Active state highlighting
- Dismiss on selection or outside tap

---

## 🔧 Backend Updates

### 1. Controller Changes (driver.controller.ts)

**Updated Request Body Type:**
```typescript
@Body() body: { 
  cityIds: number[];
  rideType?: 'School' | 'Work' | 'Both';
  usualStartTime?: string;  // Format: "HH:MM:SS"
  usualEndTime?: string;     // Format: "HH:MM:SS"
}
```

**Updated Service Call:**
```typescript
return this.driverService.saveDriverCities(
  driverId, 
  body.cityIds,
  body.rideType,
  body.usualStartTime,
  body.usualEndTime
);
```

### 2. Service Changes (driver.service.ts)

**Updated Method Signature:**
```typescript
async saveDriverCities(
  driverId: number, 
  cityIds: number[],
  rideType?: 'School' | 'Work' | 'Both',
  usualStartTime?: string,
  usualEndTime?: string
)
```

**Time Conversion Logic:**
```typescript
if (usualStartTime) {
  const [hours, minutes, seconds] = usualStartTime.split(':').map(Number);
  const timeDate = new Date();
  timeDate.setHours(hours, minutes, seconds || 0, 0);
  updateData.usualStartTime = timeDate;
}
```

---

## 📡 API Request/Response

### POST /driver/cities

**Request Example:**
```json
{
  "cityIds": [1, 5, 8, 12],
  "rideType": "School",
  "usualStartTime": "07:30:00",
  "usualEndTime": "17:00:00"
}
```

**Response Example:**
```json
{
  "success": true,
  "message": "Driver cities saved successfully",
  "driverCities": {
    "id": 1,
    "driverId": 123,
    "cityIds": [1, 5, 8, 12],
    "rideType": "School",
    "usualStartTime": "2025-10-20T07:30:00.000Z",
    "usualEndTime": "2025-10-20T17:00:00.000Z"
  }
}
```

---

## 🗄️ Database Schema (No Changes Required)

The `DriverCities` table already has all required columns:

```prisma
model DriverCities {
  id             Int       @id @default(autoincrement())
  driverId       Int       @unique
  cityIds        Int[]
  rideType       Ridetype  @default(Both)        // ✅ Already exists
  usualEndTime   DateTime? @db.Time(6)           // ✅ Already exists
  usualStartTime DateTime? @db.Time(6)           // ✅ Already exists
  driver         Driver    @relation(...)
}

enum Ridetype {
  School
  Work
  Both
}
```

---

## 🧪 Testing Guide

### Prerequisites
1. Install DateTimePicker package:
   ```bash
   cd mobile-driver
   npm install @react-native-community/datetimepicker
   ```

2. Restart Expo development server:
   ```bash
   npm start
   ```

### Test Case 1: Complete Route Setup

1. **Delete existing driver route:**
   ```sql
   DELETE FROM "DriverCities" WHERE "driverId" = <YOUR_DRIVER_ID>;
   ```

2. **Login to driver app**
3. **Verify UI shows all new fields:**
   - ✅ Ride Type dropdown (default: "Both")
   - ✅ Start Time picker (default: 7:00 AM)
   - ✅ End Time picker (default: 5:00 PM)
   - ✅ City search and selection
   - ✅ Save Route button

4. **Test Ride Type Selection:**
   - Tap on ride type dropdown
   - Modal should appear with 3 options
   - Select "School"
   - Verify selection updates in UI
   - Repeat with "Work" and "Both"

5. **Test Start Time:**
   - Tap on Start Time field
   - Time picker should appear
   - Select 6:30 AM
   - Verify time updates in UI
   - On Android: Picker dismisses automatically
   - On iOS: Use separate confirm if needed

6. **Test End Time:**
   - Tap on End Time field
   - Select 6:00 PM
   - Verify time updates

7. **Add Cities:**
   - Search and add at least 2 cities
   - Verify cities appear in order

8. **Save Route:**
   - Tap "Save Route" button
   - Should show loading state
   - Should redirect to normal home screen

9. **Verify in Database:**
   ```sql
   SELECT * FROM "DriverCities" WHERE "driverId" = <YOUR_DRIVER_ID>;
   ```
   Expected columns to have data:
   - `cityIds`: [array of city IDs]
   - `rideType`: "School"
   - `usualStartTime`: 06:30:00
   - `usualEndTime`: 18:00:00

### Test Case 2: Default Values

1. Fresh route setup (no prior data)
2. Don't change ride type or times
3. Just add cities and save
4. Verify database has:
   - `rideType`: "Both"
   - `usualStartTime`: 07:00:00
   - `usualEndTime`: 17:00:00

### Test Case 3: Update Existing Route

1. Driver with existing route setup
2. Currently no UI to edit (future enhancement)
3. For now, backend supports updates via API

### Test Case 4: Backend Validation

**Test with Postman:**

```
POST http://localhost:3000/driver/cities
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "cityIds": [1, 2, 3],
  "rideType": "School",
  "usualStartTime": "06:00:00",
  "usualEndTime": "18:30:00"
}
```

Expected response: Success with saved data

**Test missing cityIds:**
```json
{
  "cityIds": [],
  "rideType": "School"
}
```
Expected: Error - "Please provide at least 2 cities"

**Test invalid ride type:**
```json
{
  "cityIds": [1, 2],
  "rideType": "InvalidType"
}
```
Expected: Database validation error

---

## 📋 Files Modified

### Frontend
- ✅ `mobile-driver/components/SetupRouteCard.tsx` (Enhanced)
  - Added ride type selection UI
  - Added time picker components
  - Updated save payload

### Backend
- ✅ `backend/src/driver/driver.controller.ts` (Updated)
  - Extended request DTO
  - Added optional parameters to service call

- ✅ `backend/src/driver/driver.service.ts` (Updated)
  - Extended method signature
  - Added time parsing logic
  - Updated database save operation

### Database
- ✅ No schema changes required (columns already exist)

---

## 🎨 UI/UX Features

### Visual Design
- **Ride Type**: Card-based selection with active state
- **Time Pickers**: Native platform components
- **Consistency**: Matches existing app design language
- **Accessibility**: Clear labels and touch targets

### User Flow
1. View default values
2. Optionally change ride type
3. Optionally adjust times
4. Add cities (required minimum 2)
5. Save all settings at once

### Error Handling
- Required field validation (cities)
- API error messages
- Loading states during save
- Success feedback via navigation

---

## 🚀 Future Enhancements

1. **Edit Mode**: Allow drivers to update route after initial setup
2. **Time Validation**: Ensure end time is after start time
3. **Route Templates**: Save/load common routes
4. **Multiple Routes**: Different routes for different days
5. **Break Times**: Add lunch/rest periods
6. **Route Suggestions**: AI-based route optimization

---

## 💡 Usage Notes

### For Drivers
- Set ride type based on your passenger type
- Start time: When you begin picking up passengers
- End time: When you finish dropping off passengers
- These times help parents/clients know your availability

### For Developers
- Times are stored in database as TIME type
- Frontend sends time as "HH:MM:SS" string
- Backend converts to Date object for Prisma
- Display format is 12-hour with AM/PM

### For Admins
- Can view driver availability in admin panel
- Useful for matching drivers to requests
- Helps in scheduling and route planning
- Ride type filters affect search results

---

## 🐛 Troubleshooting

### DateTimePicker not showing
```bash
# Reinstall package
npm install @react-native-community/datetimepicker
# Clear cache
npm start --clear
```

### Time not saving to database
- Check backend logs for parsing errors
- Verify time format is "HH:MM:SS"
- Ensure hours are 00-23, minutes/seconds 00-59

### Ride type modal not appearing
- Check if Modal import is correct
- Verify state management
- Test on both iOS and Android

### Database shows NULL times
- Frontend may not be sending times
- Check network request payload
- Verify optional parameters are included

---

## ✅ Completion Checklist

- [x] Frontend UI updated with ride type selector
- [x] Frontend UI updated with time pickers
- [x] Time formatting function implemented
- [x] Request payload updated
- [x] Backend controller accepts new parameters
- [x] Backend service saves new fields
- [x] Error handling implemented
- [x] TypeScript types updated
- [ ] DateTimePicker package installed
- [ ] Manual testing completed
- [ ] Database verified with saved data

---

## 📞 Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Review console/server logs
3. Verify database schema matches expected structure
4. Test API endpoints with Postman first
5. Check React Native DateTimePicker documentation

---

**Last Updated**: October 20, 2025
**Status**: ✅ Implementation Complete - Ready for Testing
