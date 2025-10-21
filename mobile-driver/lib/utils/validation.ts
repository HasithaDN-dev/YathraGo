/**
 * Validation utility functions for driver registration forms
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate email format
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === '') {
    return { isValid: true }; // Email is optional
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
};

/**
 * Validate Sri Lankan NIC format
 * Accepts both old format (9 digits + V/X) and new format (12 digits)
 */
export const validateNIC = (nic: string): ValidationResult => {
  if (!nic || nic.trim() === '') {
    return { isValid: false, error: 'NIC is required' };
  }

  const nicTrimmed = nic.trim().toUpperCase();

  // Old format: 9 digits followed by V or X (e.g., 123456789V)
  const oldFormatRegex = /^[0-9]{9}[VX]$/;
  // New format: 12 digits (e.g., 200012345678)
  const newFormatRegex = /^[0-9]{12}$/;

  if (!oldFormatRegex.test(nicTrimmed) && !newFormatRegex.test(nicTrimmed)) {
    return {
      isValid: false,
      error: 'Invalid NIC format. Use 9 digits + V/X (old format) or 12 digits (new format)',
    };
  }

  return { isValid: true };
};

/**
 * Validate phone number format (Sri Lankan)
 */
export const validatePhone = (phone: string, required: boolean = false): ValidationResult => {
  if (!phone || phone.trim() === '') {
    if (required) {
      return { isValid: false, error: 'Phone number is required' };
    }
    return { isValid: true };
  }

  const phoneTrimmed = phone.trim().replace(/\s/g, '');

  // Accepts formats: +94771234567, 0771234567, 771234567
  const phoneRegex = /^(\+94|0)?[1-9][0-9]{8}$/;

  if (!phoneRegex.test(phoneTrimmed)) {
    return {
      isValid: false,
      error: 'Invalid phone number. Use format: 0771234567 or +94771234567',
    };
  }

  return { isValid: true };
};

/**
 * Validate date of birth
 * - Must be in YYYY-MM-DD format
 * - Must be at least 18 years old
 * - Must not be in the future
 */
export const validateDateOfBirth = (dob: string): ValidationResult => {
  if (!dob || dob.trim() === '') {
    return { isValid: false, error: 'Date of birth is required' };
  }

  // Check format YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dob)) {
    return {
      isValid: false,
      error: 'Invalid date format. Use YYYY-MM-DD (e.g., 1990-01-15)',
    };
  }

  const date = new Date(dob);
  const today = new Date();

  // Check if valid date
  if (isNaN(date.getTime())) {
    return { isValid: false, error: 'Invalid date. Please check the date values' };
  }

  // Check if not in future
  if (date > today) {
    return { isValid: false, error: 'Date of birth cannot be in the future' };
  }

  // Check minimum age (18 years)
  const age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  const dayDiff = today.getDate() - date.getDate();

  const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

  if (actualAge < 18) {
    return { isValid: false, error: 'You must be at least 18 years old to register as a driver' };
  }

  if (actualAge > 100) {
    return { isValid: false, error: 'Please enter a valid date of birth' };
  }

  return { isValid: true };
};

/**
 * Validate name fields (first name, last name)
 */
export const validateName = (name: string, fieldName: string = 'Name'): ValidationResult => {
  if (!name || name.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  const nameTrimmed = name.trim();

  if (nameTrimmed.length < 2) {
    return { isValid: false, error: `${fieldName} must be at least 2 characters long` };
  }

  if (nameTrimmed.length > 50) {
    return { isValid: false, error: `${fieldName} must not exceed 50 characters` };
  }

  // Allow letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(nameTrimmed)) {
    return {
      isValid: false,
      error: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`,
    };
  }

  return { isValid: true };
};

/**
 * Validate city/address field
 */
export const validateCity = (city: string): ValidationResult => {
  if (!city || city.trim() === '') {
    return { isValid: false, error: 'City is required' };
  }

  const cityTrimmed = city.trim();

  if (cityTrimmed.length < 2) {
    return { isValid: false, error: 'City must be at least 2 characters long' };
  }

  if (cityTrimmed.length > 100) {
    return { isValid: false, error: 'City must not exceed 100 characters' };
  }

  return { isValid: true };
};

/**
 * Validate gender selection
 */
export const validateGender = (gender: string): ValidationResult => {
  if (!gender || gender.trim() === '') {
    return { isValid: false, error: 'Gender is required' };
  }

  const validGenders = ['Male', 'Female', 'Other'];
  if (!validGenders.includes(gender)) {
    return { isValid: false, error: 'Please select a valid gender' };
  }

  return { isValid: true };
};

/**
 * Validate license plate number (Sri Lankan format)
 */
export const validateLicensePlate = (plate: string): ValidationResult => {
  if (!plate || plate.trim() === '') {
    return { isValid: false, error: 'License plate number is required' };
  }

  const plateTrimmed = plate.trim().toUpperCase();

  // Sri Lankan format: ABC-1234 or AB-1234 or ABC1234
  const plateRegex = /^[A-Z]{2,3}-?[0-9]{4}$/;

  if (!plateRegex.test(plateTrimmed)) {
    return {
      isValid: false,
      error: 'Invalid license plate format. Use format: ABC-1234 or ABC1234',
    };
  }

  return { isValid: true };
};

/**
 * Validate year of manufacture
 */
export const validateYear = (year: string): ValidationResult => {
  if (!year || year.trim() === '') {
    return { isValid: false, error: 'Year of manufacture is required' };
  }

  const yearNum = parseInt(year, 10);
  const currentYear = new Date().getFullYear();

  if (isNaN(yearNum)) {
    return { isValid: false, error: 'Year must be a valid number' };
  }

  if (yearNum < 1980) {
    return { isValid: false, error: 'Vehicle must be manufactured after 1980' };
  }

  if (yearNum > currentYear + 1) {
    return { isValid: false, error: 'Year cannot be in the future' };
  }

  return { isValid: true };
};

/**
 * Validate number of seats
 */
export const validateSeats = (seats: string): ValidationResult => {
  if (!seats || seats.trim() === '') {
    return { isValid: false, error: 'Number of seats is required' };
  }

  const seatsNum = parseInt(seats, 10);

  if (isNaN(seatsNum)) {
    return { isValid: false, error: 'Number of seats must be a valid number' };
  }

  if (seatsNum < 1) {
    return { isValid: false, error: 'Vehicle must have at least 1 seat' };
  }

  if (seatsNum > 60) {
    return { isValid: false, error: 'Number of seats cannot exceed 60' };
  }

  return { isValid: true };
};

/**
 * Validate vehicle type
 */
export const validateVehicleType = (type: string): ValidationResult => {
  if (!type || type.trim() === '') {
    return { isValid: false, error: 'Vehicle type is required' };
  }

  const validTypes = ['Car', 'Van', 'Bus', 'Tuktuk', 'Other'];
  if (!validTypes.includes(type)) {
    return { isValid: false, error: 'Please select a valid vehicle type' };
  }

  return { isValid: true };
};

/**
 * Validate required text field
 */
export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  if (!value || value.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  return { isValid: true };
};

/**
 * Validate image is selected
 */
export const validateImage = (image: any, fieldName: string): ValidationResult => {
  if (!image) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  return { isValid: true };
};

/**
 * Batch validate multiple fields
 * Returns first error found, or null if all valid
 */
export const validateAll = (
  validations: { validate: () => ValidationResult; priority?: number }[]
): ValidationResult => {
  // Sort by priority (lower number = higher priority)
  const sorted = validations.sort((a, b) => (a.priority || 999) - (b.priority || 999));

  for (const { validate } of sorted) {
    const result = validate();
    if (!result.isValid) {
      return result;
    }
  }

  return { isValid: true };
};
