# Vehicle Registration Integration Fix

## Overview
Fixed the driver registration process to also create and link vehicle records in the database when a driver completes registration.

## Problem Statement
During driver registration, vehicle information was collected in the mobile app UI but not saved to the `Vehicle` table in the database. The registration flow collected:
- Vehicle details (type, brand, model, year, color, license plate, seats)
- Vehicle images (front, side, rear, interior views)
- Vehicle documents (revenue license, insurance, registration)

However, only driver information was being saved, leaving the vehicle data unused.

## Solution Architecture

### Database Schema
```prisma
model Driver {
  driver_id Int @id @default(autoincrement())
  // ... driver fields
  vehicles Vehicle[] // One-to-many relationship
}

model Vehicle {
  id Int @id @default(autoincrement())
  type String
  brand String
  model String
  manufactureYear Int
  registrationNumber String?
  color String
  route String[]
  no_of_seats Int
  air_conditioned Boolean
  assistant Boolean
  // Image URLs
  rear_picture_url String
  front_picture_url String
  side_picture_url String
  inside_picture_url String
  // Document URLs
  revenue_license_url String?
  insurance_front_url String?
  insurance_back_url String?
  vehicle_reg_url String?
  // Relationships
  driverId Int?
  driver Driver? @relation(fields: [driverId], references: [driver_id])
}
```

## Implementation Changes

### 1. Backend DTO Update
**File:** `backend/src/driver/dto/complete-driver-registration.dto.ts`

Added vehicle fields to the DTO:
```typescript
export class CompleteDriverRegistrationDto {
  // ... existing driver fields ...
  
  // Vehicle Information
  vehicleType?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  yearOfManufacture?: string;
  vehicleColor?: string;
  licensePlate?: string;
  seats?: number;
  femaleAssistant?: boolean;
  
  // Vehicle Image URLs
  vehicleFrontView?: string;
  vehicleSideView?: string;
  vehicleRearView?: string;
  vehicleInteriorView?: string;
  
  // Vehicle Document URLs
  revenueLicenseUrl?: string;
  vehicleInsuranceUrl?: string;
  registrationDocUrl?: string;
}
```

### 2. Controller Update
**File:** `backend/src/driver/driver.controller.ts`

Extended the controller to map vehicle data from FormData:
```typescript
const completeRegistrationData: CompleteDriverRegistrationDto = {
  // ... driver fields ...
  
  // Vehicle information
  vehicleType: registrationData.vehicleType,
  vehicleBrand: registrationData.vehicleBrand,
  vehicleModel: registrationData.vehicleModel,
  yearOfManufacture: registrationData.yearOfManufacture,
  vehicleColor: registrationData.vehicleColor,
  licensePlate: registrationData.licensePlate,
  seats: parseInt(registrationData.seats?.toString()),
  femaleAssistant: registrationData.femaleAssistant === 'true',
  
  // Vehicle images
  vehicleFrontView: vehicleFrontViewUrl,
  vehicleSideView: vehicleSideViewUrl,
  vehicleRearView: vehicleRearViewUrl,
  vehicleInteriorView: vehicleInteriorViewUrl,
  
  // Vehicle documents
  revenueLicenseUrl: revenueLicenseUrl,
  vehicleInsuranceUrl: vehicleInsuranceUrl,
  registrationDocUrl: registrationDocUrl,
};
```

### 3. Service Update
**File:** `backend/src/driver/driver.service.ts`

Enhanced `completeDriverRegistration` method to create vehicle record:
```typescript
async completeDriverRegistration(phone: string, registrationData: CompleteDriverRegistrationDto) {
  // ... update driver record ...
  
  // Create vehicle if vehicle information is provided
  if (registrationData.vehicleType && registrationData.vehicleBrand && 
      registrationData.vehicleModel && registrationData.yearOfManufacture &&
      registrationData.licensePlate) {
    await this.prisma.vehicle.create({
      data: {
        type: registrationData.vehicleType,
        brand: registrationData.vehicleBrand,
        model: registrationData.vehicleModel,
        manufactureYear: parseInt(registrationData.yearOfManufacture),
        registrationNumber: registrationData.licensePlate,
        color: registrationData.vehicleColor || '',
        route: [], // Empty for now, updated later
        no_of_seats: registrationData.seats || 1,
        air_conditioned: false,
        assistant: registrationData.femaleAssistant || false,
        rear_picture_url: registrationData.vehicleRearView || '',
        front_picture_url: registrationData.vehicleFrontView || '',
        side_picture_url: registrationData.vehicleSideView || '',
        inside_picture_url: registrationData.vehicleInteriorView || '',
        revenue_license_url: registrationData.revenueLicenseUrl,
        insurance_front_url: registrationData.vehicleInsuranceUrl,
        insurance_back_url: null,
        vehicle_reg_url: registrationData.registrationDocUrl,
        driverId: updatedDriver.driver_id, // Link to driver
      },
    });
  }
  
  return updatedDriver;
}
```

## Registration Flow

```
1. Phone Auth (OTP) → Status: OTP_VERIFIED
   ↓
2. Personal Info (name, NIC, gender, DOB, email) → Saved to store
   ↓
3. ID Verification (NIC photos) → Saved to store
   ↓
4. Vehicle Ownership Selection (own vehicle vs added by owner)
   ↓
5. Vehicle Registration (type, brand, model, year, color, plate, seats, photos) → Saved to store
   ↓
6. Vehicle Documents (revenue license, insurance, registration, driver license) → Saved to store
   ↓
7. Complete Registration Button
   ↓
8. API Call: POST /driver/register with FormData
   ↓
9. Backend Processing:
   - Validate driver is OTP_VERIFIED
   - Update driver record with all personal info
   - Create vehicle record linked to driver
   - Set registrationStatus to ACCOUNT_CREATED
   ↓
10. Success Screen → Registration complete
```

## Data Flow

### Mobile App → Backend
The mobile app collects all data through the registration screens and sends it in a single FormData request:

**Text Fields:**
- firstName, lastName, NIC, city, dateOfBirth, gender, email, secondaryPhone
- vehicleType, vehicleBrand, vehicleModel, yearOfManufacture, vehicleColor, licensePlate, seats, femaleAssistant
- profileImage (URI string)

**File Fields:**
- idFrontImage, idBackImage
- vehicleFrontView, vehicleSideView, vehicleRearView, vehicleInteriorView
- revenueLicense, vehicleInsurance, registrationDoc, licenseFront, licenseBack

### Backend → Database
The backend processes the FormData:
1. Extracts and saves uploaded files to `uploads/vehicle/`
2. Updates `Driver` table with personal information
3. Creates new record in `Vehicle` table with:
   - Vehicle specifications
   - Image URLs (pointing to uploaded files)
   - Document URLs (pointing to uploaded files)
   - Foreign key `driverId` linking to the driver

## Database Result

After successful registration:

**Driver Table:**
```sql
INSERT INTO Driver (
  name, NIC, address, date_of_birth, gender, profile_picture_url,
  email, driver_license_front_url, driver_license_back_url,
  nic_front_pic_url, nice_back_pic_url, phone, second_phone,
  vehicle_Reg_No, registrationStatus, status
) VALUES (...);
```

**Vehicle Table:**
```sql
INSERT INTO Vehicle (
  type, brand, model, manufactureYear, registrationNumber, color,
  route, no_of_seats, air_conditioned, assistant,
  rear_picture_url, front_picture_url, side_picture_url, inside_picture_url,
  revenue_license_url, insurance_front_url, vehicle_reg_url,
  driverId
) VALUES (...);
```

## Key Features

1. **Atomic Operation**: Both driver and vehicle are created in the same transaction
2. **Validation**: Vehicle is only created if required fields are provided
3. **Relationship**: Vehicle is automatically linked to driver via `driverId` foreign key
4. **Optional Fields**: Vehicle creation doesn't fail if optional documents are missing
5. **File Management**: All uploaded files are stored in `uploads/vehicle/` directory
6. **Error Handling**: Proper error messages for validation failures

## Benefits

- ✅ Drivers can register their vehicles during initial registration
- ✅ No need for separate vehicle registration endpoint
- ✅ Data consistency between driver and vehicle
- ✅ Single API call reduces network requests
- ✅ Vehicle ownership is clearly established from the start
- ✅ Vehicle images and documents are properly stored and linked

## Testing Checklist

- [ ] Complete driver registration with vehicle information
- [ ] Verify driver record is created with registrationStatus = ACCOUNT_CREATED
- [ ] Verify vehicle record is created and linked to driver
- [ ] Check all vehicle images are uploaded and URLs are correct
- [ ] Check all vehicle documents are uploaded and URLs are correct
- [ ] Verify vehicle can be queried using driver's ID
- [ ] Test registration without vehicle info (should still create driver)
- [ ] Test error handling for invalid vehicle data

## Future Enhancements

1. Support for multiple vehicles per driver
2. Vehicle route planning during registration
3. Air conditioning preference selection
4. Vehicle insurance expiry date tracking
5. Automated vehicle document verification
6. Vehicle inspection scheduling
7. Support for "added by owner" flow (separate vehicles owned by vehicle owners)

## Migration Notes

For existing drivers without vehicles:
- Drivers can add vehicles later through the profile/vehicle management section
- The vehicle registration UI can be reused for adding additional vehicles
- Consider a bulk import tool for migrating existing vehicle data

## API Endpoints

### Driver Registration (with Vehicle)
```
POST /driver/register
Headers:
  Authorization: Bearer {jwt_token}
  Content-Type: multipart/form-data

Body: FormData with all driver and vehicle fields
Response: Updated driver object with registrationStatus: ACCOUNT_CREATED
```

### Get Driver Vehicles
```
GET /driver/{driverId}/vehicles
Response: Array of vehicle objects linked to the driver
```

## Troubleshooting

### Vehicle Not Created
- Check if all required vehicle fields are provided (type, brand, model, year, licensePlate)
- Verify FormData is being sent correctly from mobile app
- Check backend logs for validation errors
- Ensure file uploads are successful

### Images Not Showing
- Verify file paths are correct in database
- Check uploads/vehicle/ directory has proper permissions
- Ensure static file serving is configured in NestJS
- Verify file extensions and MIME types are correct

### Database Errors
- Check Prisma schema is up to date (run `npx prisma generate`)
- Verify database migrations are applied
- Check foreign key constraints are satisfied
- Ensure driverId exists before creating vehicle
