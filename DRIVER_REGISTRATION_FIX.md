# Driver Registration Fix Documentation

## Overview
Fixed the driver registration process in the mobile driver app to properly send all collected data to the backend API and save it to the database.

## Issues Identified

### 1. **API Data Format Mismatch**
- **Problem**: The mobile app was sending JSON data, but the backend expects `multipart/form-data` with files
- **Solution**: Updated `completeDriverRegistrationApi` to construct FormData with all fields and files

### 2. **Missing Required Fields**
- **Problem**: NIC and gender were collected at the wrong stage and not stored in the driver store
- **Solution**: 
  - Added NIC and gender fields to `PersonalInfo` interface in driver store
  - Added input fields for NIC and gender in `reg-personal.tsx`
  - Removed duplicate local state from `vehicle-doc.tsx`

### 3. **Type Definitions**
- **Problem**: `DriverRegistrationData` interface didn't match backend expectations
- **Solution**: Updated the interface to include all required fields (personal info, ID docs, vehicle info, vehicle docs)

### 4. **Multiple API Calls**
- **Problem**: Registration was split into multiple API calls (driver registration, ID upload, vehicle registration, document upload)
- **Solution**: Consolidated into a single API call that sends all data at once to `/driver/register`

## Files Modified

### Mobile Driver App

#### 1. `types/driver.types.ts`
- Updated `DriverRegistrationData` interface to include:
  - Personal details (firstName, lastName, NIC, city, dateOfBirth, gender, email, secondaryPhone)
  - Profile image
  - ID documents (front and back images)
  - Vehicle information (type, brand, model, year, color, license plate, seats, assistant)
  - Vehicle images (front, side, rear, interior views)
  - Vehicle documents (revenue license, insurance, registration, driver license front/back)

#### 2. `lib/api/profile.api.ts`
- Rewrote `completeDriverRegistrationApi` to:
  - Accept the new `DriverRegistrationData` structure
  - Build a FormData object with all text fields
  - Append all image files with correct field names
  - Send multipart/form-data to backend
  - Removed dependency on `tokenService.createAuthenticatedFetch()` to properly handle FormData

#### 3. `lib/stores/driver.store.ts`
- Added `NIC` and `gender` fields to `PersonalInfo` interface
- Updated `initialPersonalInfo` to include empty strings for NIC and gender
- Updated `isRegistrationComplete()` function to validate NIC and gender

#### 4. `app/(registration)/reg-personal.tsx`
- Added state variables for NIC and gender
- Added input fields for:
  - NIC (National Identity Card number)
  - Gender (Male, Female, Other)
- Updated `handleSubmit` to save NIC and gender to the store
- Updated validation to require NIC and gender

#### 5. `app/(registration)/vehicle-doc.tsx`
- Removed local state for NIC and gender (now in store)
- Removed duplicate NIC and Gender input fields from UI
- Completely rewrote `handleVerify` function to:
  - Validate that NIC and gender exist in personalInfo
  - Build complete registration data object from all store sections
  - Call single API endpoint with all data
  - Properly handle success and error cases
- Removed unused imports (`registerVehicleApi`, `uploadVehicleDocumentsApi`, `uploadIdDocumentsApi`)

## Backend Compatibility

The backend `/driver/register` endpoint expects:
- Text fields: firstName, lastName, NIC, city, dateOfBirth, gender, email, secondaryPhone, profileImage (URI string)
- Vehicle fields: vehicleType, vehicleBrand, vehicleModel, yearOfManufacture, vehicleColor, licensePlate, seats, femaleAssistant
- File fields: idFrontImage, idBackImage, vehicleFrontView, vehicleSideView, vehicleRearView, vehicleInteriorView, revenueLicense, vehicleInsurance, registrationDoc, licenseFront, licenseBack

The backend controller processes:
1. Receives FormData with files
2. Extracts file paths from uploaded files
3. Constructs `CompleteDriverRegistrationDto`
4. Calls `driverService.completeDriverRegistration()`
5. Updates driver record with all information
6. Sets registration status to `ACCOUNT_CREATED`

## Testing Checklist

- [ ] User can enter NIC and gender in personal information screen
- [ ] All personal info is saved to driver store
- [ ] ID verification images are captured and stored
- [ ] Vehicle information is collected completely
- [ ] Vehicle images are captured (front, side, rear, interior)
- [ ] Vehicle documents are uploaded (revenue license, insurance, registration)
- [ ] Driver license photos are captured (front and back)
- [ ] "Complete Registration" button sends all data to backend
- [ ] Backend receives and processes FormData correctly
- [ ] Database is updated with all driver and vehicle information
- [ ] User is redirected to success screen after successful registration
- [ ] Appropriate error messages are shown on failure

## Flow Diagram

```
1. Phone Auth (OTP) → Status: OTP_VERIFIED
2. Personal Info (includes NIC, gender) → Saved to store
3. ID Verification (NIC photos) → Saved to store
4. Vehicle Registration (details + photos) → Saved to store
5. Vehicle Documents (all docs + license) → Click "Complete Registration"
6. API Call → POST /driver/register with FormData
7. Backend → Updates database, Status: ACCOUNT_CREATED
8. Success Screen → Registration complete
```

## Known Limitations

1. Profile image is sent as URI string, not as file upload (backend expects this)
2. No real-time validation of NIC format
3. Gender is free text input (could be dropdown/radio buttons)
4. Date of birth is text input (could be date picker)
5. Some TypeScript linting warnings remain (style prop on Icon, unused variables)

## Future Improvements

1. Add date picker for date of birth
2. Add dropdown/radio buttons for gender selection
3. Add NIC format validation (Sri Lankan NIC format)
4. Add image compression before upload
5. Add progress indicator for file uploads
6. Add ability to preview uploaded documents
7. Better error handling with specific error messages for each field
8. Add ability to edit information before final submission
