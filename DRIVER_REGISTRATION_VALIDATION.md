# Driver Registration Form Validation

## Overview
Comprehensive validation has been added to all driver registration forms to ensure data quality and prevent submission of invalid information.

## Validation Utility
**File**: `mobile-driver/lib/utils/validation.ts`

### Validation Functions

#### Personal Information
- **`validateName(name, fieldName)`**: Validates names (first/last)
  - Minimum 2 characters
  - Maximum 50 characters
  - Only letters, spaces, hyphens, and apostrophes allowed
  
- **`validateDateOfBirth(dob)`**: Validates date of birth
  - Format: YYYY-MM-DD (e.g., 1990-01-15)
  - Must be at least 18 years old
  - Cannot be in the future
  - Maximum age: 100 years

- **`validateEmail(email)`**: Validates email format
  - Optional field (returns valid if empty)
  - Standard email format validation

- **`validatePhone(phone, required)`**: Validates Sri Lankan phone numbers
  - Accepts: +94771234567, 0771234567, 771234567
  - Optional or required based on parameter

- **`validateCity(city)`**: Validates city/address
  - Minimum 2 characters
  - Maximum 100 characters
  - Required field

- **`validateNIC(nic)`**: Validates Sri Lankan NIC
  - Old format: 9 digits + V/X (e.g., 123456789V)
  - New format: 12 digits (e.g., 200012345678)
  - Required field

- **`validateGender(gender)`**: Validates gender selection
  - Valid values: Male, Female, Other
  - Required field

#### Vehicle Information
- **`validateVehicleType(type)`**: Validates vehicle type
  - Valid values: Car, Van, Bus, Tuktuk, Other
  - Required field

- **`validateLicensePlate(plate)`**: Validates Sri Lankan license plates
  - Format: ABC-1234 or ABC1234
  - 2-3 letters followed by 4 digits

- **`validateYear(year)`**: Validates year of manufacture
  - Must be after 1980
  - Cannot be more than 1 year in the future

- **`validateSeats(seats)`**: Validates number of seats
  - Minimum: 1 seat
  - Maximum: 60 seats

#### Generic Validators
- **`validateRequired(value, fieldName)`**: Validates any required field
- **`validateImage(image, fieldName)`**: Validates image/file selection
- **`validateAll(validations)`**: Batch validates multiple fields with priority

## Form Implementations

### 1. Personal Information (`reg-personal.tsx`)
**Validated Fields:**
- First Name (required, 2-50 characters, letters only)
- Last Name (required, 2-50 characters, letters only)
- Date of Birth (required, YYYY-MM-DD, 18+ years old)
- Email (optional, valid email format)
- Secondary Phone (optional, Sri Lankan format)
- City (required, 2-100 characters)
- NIC (required, Sri Lankan format)
- Gender (required, Male/Female/Other)
- Profile Image (required)

**Validation Flow:**
```typescript
const validation = validateAll([
  { validate: () => validateName(firstName, 'First name'), priority: 1 },
  { validate: () => validateName(lastName, 'Last name'), priority: 2 },
  { validate: () => validateDateOfBirth(dob), priority: 3 },
  { validate: () => validateEmail(email), priority: 4 },
  { validate: () => validatePhone(secondaryPhone, false), priority: 5 },
  { validate: () => validateCity(city), priority: 6 },
  { validate: () => validateNIC(nic), priority: 7 },
  { validate: () => validateGender(gender), priority: 8 },
  { validate: () => validateImage(profileImage, 'Profile image'), priority: 9 },
]);
```

**Data Trimming:**
- All text fields are trimmed before submission
- NIC is converted to uppercase

### 2. ID Verification (`reg-id.tsx`)
**Validated Fields:**
- Front ID Photo (required)
- Back ID Photo (required)

**Validation Flow:**
```typescript
const validation = validateAll([
  { validate: () => validateImage(frontImage, 'Front ID photo'), priority: 1 },
  { validate: () => validateImage(backImage, 'Back ID photo'), priority: 2 },
]);
```

### 3. Vehicle Registration (`vehicle-reg.tsx`)
**Validated Fields:**
- Vehicle Type (required, Car/Van/Bus/Tuktuk/Other)
- Vehicle Brand (required)
- Vehicle Model (required)
- Year of Manufacture (required, 1980-present)
- Vehicle Color (required)
- License Plate (required, Sri Lankan format)
- Number of Seats (required, 1-60)
- Front View Photo (required)
- Side View Photo (required)
- Rear View Photo (required)
- Interior Photo (required)

**Validation Flow:**
```typescript
const validation = validateAll([
  { validate: () => validateVehicleType(vehicleType), priority: 1 },
  { validate: () => validateRequired(vehicleBrand, 'Vehicle brand'), priority: 2 },
  { validate: () => validateRequired(vehicleModel, 'Vehicle model'), priority: 3 },
  { validate: () => validateYear(yearOfManufacture), priority: 4 },
  { validate: () => validateRequired(vehicleColor, 'Vehicle color'), priority: 5 },
  { validate: () => validateLicensePlate(licensePlate), priority: 6 },
  { validate: () => validateSeats(seats.toString()), priority: 7 },
  { validate: () => validateImage(frontView, 'Front view photo'), priority: 8 },
  { validate: () => validateImage(sideView, 'Side view photo'), priority: 9 },
  { validate: () => validateImage(rearView, 'Rear view photo'), priority: 10 },
  { validate: () => validateImage(interiorView, 'Interior photo'), priority: 11 },
]);
```

**Data Trimming:**
- All text fields are trimmed before submission
- License plate is converted to uppercase

### 4. Vehicle Documents (`vehicle-doc.tsx`)
**Validated Fields:**
- Revenue License Document (required)
- Vehicle Insurance Document (required)
- Vehicle Registration Document (required)
- Driving License Front Photo (required)
- Driving License Back Photo (required)
- NIC from Personal Info (cross-validation)
- Gender from Personal Info (cross-validation)

**Validation Flow:**
```typescript
const validation = validateAll([
  { validate: () => validateDocument(revenueLicense, 'Revenue license'), priority: 1 },
  { validate: () => validateDocument(vehicleInsurance, 'Vehicle insurance'), priority: 2 },
  { validate: () => validateDocument(registrationDoc, 'Vehicle registration document'), priority: 3 },
  { validate: () => validateImage(licenseFront, 'Driving license front photo'), priority: 4 },
  { validate: () => validateImage(licenseBack, 'Driving license back photo'), priority: 5 },
  { validate: () => validateNIC(personalInfo.NIC || ''), priority: 6 },
  { validate: () => validateGender(personalInfo.gender || ''), priority: 7 },
]);
```

## Validation Features

### Priority-Based Validation
Validations are executed in priority order (lower number = higher priority). This ensures users see the most important errors first.

### User-Friendly Error Messages
All validation functions return descriptive error messages:
- ✅ "First name is required"
- ✅ "Invalid NIC format. Use 9 digits + V/X (old format) or 12 digits (new format)"
- ✅ "You must be at least 18 years old to register as a driver"
- ✅ "Invalid license plate format. Use format: ABC-1234 or ABC1234"

### Real-Time Validation
Validation occurs on form submission, preventing invalid data from being sent to the backend.

### Data Sanitization
- Text fields are trimmed (leading/trailing whitespace removed)
- NIC and license plates are converted to uppercase
- Consistent data format ensures backend compatibility

## Error Handling

### Alert Display
```typescript
if (!validation.isValid) {
  Alert.alert('Validation Error', validation.error || 'Please check your input');
  return;
}
```

### First Error Only
The `validateAll` function returns the first error encountered, preventing information overload.

## Usage Example

```typescript
import {
  validateName,
  validateEmail,
  validateAll,
} from '../../lib/utils/validation';

const handleSubmit = () => {
  const validation = validateAll([
    { validate: () => validateName(firstName, 'First name'), priority: 1 },
    { validate: () => validateEmail(email), priority: 2 },
  ]);

  if (!validation.isValid) {
    Alert.alert('Error', validation.error);
    return;
  }

  // Proceed with submission
  submitForm();
};
```

## Testing Validation

### Valid Test Data

**Personal Information:**
```javascript
firstName: "John"
lastName: "Doe"
dateOfBirth: "1990-01-15"
email: "john@example.com"
secondaryPhone: "0771234567"
city: "Colombo"
NIC: "123456789V" or "200012345678"
gender: "Male"
```

**Vehicle Information:**
```javascript
vehicleType: "Van"
vehicleBrand: "Toyota"
vehicleModel: "Hiace"
yearOfManufacture: "2015"
vehicleColor: "White"
licensePlate: "WP-KJP-2356" or "WPKJP2356"
seats: "15"
```

### Invalid Test Cases

**Personal Information:**
- ❌ First name: "J" (too short)
- ❌ Date of birth: "2010-01-01" (under 18)
- ❌ Email: "invalid-email" (invalid format)
- ❌ Phone: "12345" (invalid format)
- ❌ NIC: "12345" (invalid format)

**Vehicle Information:**
- ❌ Year: "1970" (too old)
- ❌ License plate: "ABC" (invalid format)
- ❌ Seats: "0" (below minimum)
- ❌ Vehicle type: "Bicycle" (not in valid list)

## Benefits

1. **Data Quality**: Ensures only valid data reaches the backend
2. **User Experience**: Clear, helpful error messages guide users
3. **Backend Protection**: Reduces invalid API calls
4. **Consistency**: Standardized data format (uppercase NIC, trimmed fields)
5. **Compliance**: Age verification (18+), valid NIC format
6. **Maintainability**: Centralized validation logic

## Future Enhancements

### Potential Additions:
- Real-time validation (on field blur)
- Visual error indicators below fields
- Form field highlighting for errors
- Multi-language error messages
- Backend validation sync (validate against database)
- NIC-based auto-fill (extract DOB from NIC)

## Related Files

- `mobile-driver/lib/utils/validation.ts` - Validation utility
- `mobile-driver/app/(registration)/reg-personal.tsx` - Personal info form
- `mobile-driver/app/(registration)/reg-id.tsx` - ID verification form
- `mobile-driver/app/(registration)/vehicle-reg.tsx` - Vehicle registration form
- `mobile-driver/app/(registration)/vehicle-doc.tsx` - Document upload form

## Notes

- All validations are client-side for immediate feedback
- Backend should still validate for security (never trust client)
- Validation rules match Sri Lankan regulations and formats
- Image validation only checks presence, not file quality/format
