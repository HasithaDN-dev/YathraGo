/**
 * TypeScript Type Definitions for YathraGo API
 * 
 * This file contains all interface definitions for API requests and responses
 * to ensure type safety across the application.
 */

// ============================================================================
// Common Types
// ============================================================================

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  message?: string;
}

export type ApiStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';

// ============================================================================
// User & Authentication Types
// ============================================================================

export interface User {
  id: number;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  role: string;
  roleName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OwnerProfile extends User {
  phoneNumber?: string;
  address?: string;
  nic?: string;
  profilePicture?: string;
}

// ============================================================================
// Vehicle Types
// ============================================================================

export interface Vehicle {
  id: number;
  registrationNumber: string | null;
  registrationNo?: string;
  vehicleNumber?: string;
  type: string;
  vehicleType?: string;
  brand: string;
  model: string;
  manufactureYear: number;
  color: string;
  route: string[];
  no_of_seats: number;
  numberOfSeats?: number;
  seats?: number;
  air_conditioned: boolean;
  assistant: boolean;
  rear_picture_url: string;
  front_picture_url: string;
  side_picture_url: string;
  inside_picture_url: string;
  revenue_license_url?: string;
  insurance_front_url?: string;
  insurance_back_url?: string;
  vehicle_reg_url?: string;
  status?: 'Active' | 'Inactive' | 'Pending' | 'Maintenance';
  assignedDriver?: string;
  driverId?: number | null;
  driver?: {
    driver_id?: number;
    id?: number;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    full_name?: string;
  } | null;
  ownerId?: number | null;
  VehicleOwner?: {
    id: number;
    first_name: string;
    last_name: string;
    phone: string;
    email?: string;
  } | null;
  owner?: {
    id?: number;
    username?: string;
    firstName?: string;
    lastName?: string;
  };
  webuserId?: number | null;
  make?: string;
  year?: number;
  insuranceExpiry?: string;
  lastMaintenanceDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VehicleFormData {
  registrationNumber: string;
  type: string;
  no_of_seats: number;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  insuranceExpiry?: string;
  ownerId?: number;
}

// ============================================================================
// Driver Types
// ============================================================================

export interface Driver {
  id: number;
  firstName: string;
  lastName: string;
  fullName?: string;
  email?: string;
  phoneNumber: string;
  phone?: string;
  nic: string;
  licenseNumber: string;
  licenseExpiry?: string;
  address?: string;
  status: 'Active' | 'Inactive' | 'Pending' | 'Suspended';
  verificationStatus?: 'Pending' | 'Verified' | 'Rejected';
  profilePicture?: string;
  rating?: number;
  totalTrips?: number;
  ownerId?: number;
  vehicleId?: number;
  vehicle?: Vehicle;
  createdAt: string;
  updatedAt?: string;
}

export interface DriverFormData {
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber: string;
  nic: string;
  licenseNumber: string;
  licenseExpiry?: string;
  address?: string;
  vehicleId?: number;
}

// ============================================================================
// Payment Types
// ============================================================================

export interface Payment {
  id: number;
  paymentId?: string;
  transactionId?: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Failed' | 'Cancelled';
  paymentMethod?: string;
  transactionRef?: string;
  paymentMonth?: number;
  paymentYear?: number;
  dueDate?: string;
  paidDate?: string;
  driverId?: number;
  driver?: Driver;
  customerId?: number;
  customer?: {
    id?: number;
    name?: string;
    firstName?: string;
    lastName?: string;
  };
  childId?: number;
  child?: {
    id?: number;
    name?: string;
    firstName?: string;
    lastName?: string;
  };
  schoolName?: string;
  customerName?: string;
  childName?: string;
  verifiedBy?: number;
  verifiedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PaymentStatistics {
  overview: {
    total: number;
    pending: number;
    paid: number;
    overdue: number;
  };
  revenue: {
    today: number;
    thisMonth: number;
  };
}

export interface PaymentQueryParams {
  driverId?: number;
  customerId?: number;
  childId?: number;
  status?: string;
  paymentMonth?: number;
  paymentYear?: number;
  page?: number;
  limit?: number;
}

// ============================================================================
// Payout Types
// ============================================================================

export interface Payout {
  id: number;
  driverId: number;
  driver?: Driver;
  paymentMonth: number;
  paymentYear: number;
  totalTrips: number;
  totalRevenue: number;
  platformFee: number;
  driverEarnings: number;
  payoutAmount: number;
  status: 'Pending' | 'Approved' | 'Paid' | 'Rejected';
  bankAccount?: string;
  paymentMethod?: string;
  transactionRef?: string;
  notes?: string;
  approvedBy?: number;
  approvedAt?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PayoutCalculation {
  driverId: number;
  month: number;
  year: number;
  totalTrips: number;
  totalRevenue: number;
  platformFee: number;
  driverEarnings: number;
  payments: Payment[];
}

export interface PayoutApprovalData {
  driverId: number;
  paymentMonth: number;
  paymentYear: number;
  payoutAmount: number;
  bankAccount?: string;
  paymentMethod?: string;
  notes?: string;
}

// ============================================================================
// Refund Types
// ============================================================================

export interface Refund {
  id: number;
  paymentId: number;
  payment?: Payment;
  childId: number;
  child?: {
    id?: number;
    name?: string;
  };
  customerId: number;
  customer?: {
    id?: number;
    name?: string;
  };
  driverId: number;
  driver?: Driver;
  refundAmount: number;
  refundReason: string;
  refundType: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Processed';
  requestedBy: number;
  requestedByType: string;
  approvedBy?: number;
  approverType?: string;
  approvedAt?: string;
  refundMethod?: string;
  transactionRef?: string;
  rejectedBy?: number;
  rejectionReason?: string;
  rejectedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface RefundStatistics {
  overview: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  totalRefundAmount: number;
}

export interface RefundRequestData {
  paymentId: number;
  childId: number;
  customerId: number;
  driverId: number;
  refundAmount: number;
  refundReason: string;
  refundType: string;
  requestedBy: number;
  requestedByType: string;
}

export interface RefundQueryParams {
  page?: number;
  limit?: number;
  status?: string;
}

// ============================================================================
// Complaint Types
// ============================================================================

export interface Complaint {
  id: number;
  complaintId?: string;
  title: string;
  description: string;
  category: string;
  type: string;
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Closed';
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  customerId?: number;
  customer?: {
    id?: number;
    name?: string;
  };
  driverId?: number;
  driver?: Driver;
  assignedTo?: number;
  assignee?: {
    id?: number;
    name?: string;
  };
  resolution?: string;
  resolvedAt?: string;
  resolvedBy?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ComplaintStatistics {
  overview: {
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
  };
  byCategory: Array<{ category: string; count: number }>;
  byType: Array<{ type: string; count: number }>;
  recent: Complaint[];
}

export interface ComplaintQueryParams {
  status?: string;
  type?: string;
  category?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// Driver Coordinator Types
// ============================================================================

export interface DriverCoordinatorStatistics {
  overview: {
    pendingVerifications: number;
    activeDrivers: number;
    safetyAlerts: number;
    pendingVehicleApprovals: number;
    totalDrivers: number;
    inactiveDrivers: number;
    driversThisMonth: number;
  };
  metrics: {
    verificationRate: string;
    alertsPerDriver: string;
  };
}

export interface SafetyAlert {
  id: number;
  alertType: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  driverId?: number;
  driver?: Driver;
  vehicleId?: number;
  vehicle?: Vehicle;
  status: 'Open' | 'Investigating' | 'Resolved' | 'Dismissed';
  reportedBy?: number;
  reportedAt: string;
  resolvedAt?: string;
  resolution?: string;
  createdAt: string;
  updatedAt?: string;
}

// ============================================================================
// Manager Types
// ============================================================================

export interface ManagerStatistics {
  overview: {
    openComplaints: number;
    activeDrivers: number;
    totalVehicles: number;
    recentNotices: number;
  };
  complaints?: {
    byStatus: Record<string, number>;
  };
}

// ============================================================================
// Notification/Notice Types
// ============================================================================

export interface Notice {
  id: string | number;
  noticeId?: string;
  title: string;
  body: string;
  message?: string;
  audience: string;
  receiver?: string;
  publishedAt: string;
  createdAt?: string;
  created_at?: string;
  expiresAt?: string;
  priority?: 'Low' | 'Medium' | 'High';
  status?: 'Draft' | 'Published' | 'Archived';
  createdBy?: number;
  updatedAt?: string;
}

// ============================================================================
// Export Utility Types
// ============================================================================

export interface ExportOptions {
  filename: string;
  title?: string;
  columns?: string[];
  customFormatters?: Record<string, (value: unknown) => unknown>;
}

export interface ReportSummary {
  totalRecords: number;
  metrics: Record<string, number | string>;
}

// ============================================================================
// Form Data Types
// ============================================================================

export interface VehicleRegistrationData extends VehicleFormData {
  documents?: File[];
}

export interface DriverRegistrationData extends DriverFormData {
  documents?: File[];
  profilePicture?: File;
}

// ============================================================================
// API Response Types
// ============================================================================

export type ComplaintResponse = Complaint;
export type ComplaintsListResponse = PaginatedResponse<Complaint>;
export type ComplaintStatisticsResponse = ComplaintStatistics;

export type PaymentResponse = Payment;
export type PaymentsListResponse = PaginatedResponse<Payment>;
export type PaymentStatisticsResponse = PaymentStatistics;

export type PayoutResponse = Payout;
export type PayoutsListResponse = Payout[];
export type PayoutCalculationResponse = PayoutCalculation;

export type RefundResponse = Refund;
export type RefundsListResponse = PaginatedResponse<Refund>;
export type RefundStatisticsResponse = RefundStatistics;

export type VehicleResponse = Vehicle;
export type VehiclesListResponse = Vehicle[] | PaginatedResponse<Vehicle>;

export type DriverResponse = Driver;
export type DriversListResponse = Driver[] | PaginatedResponse<Driver>;

export type DriverCoordinatorStatisticsResponse = DriverCoordinatorStatistics;
export type ManagerStatisticsResponse = ManagerStatistics;

// ============================================================================
// Type Guards
// ============================================================================

export function isPayment(obj: unknown): obj is Payment {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'amount' in obj &&
    'status' in obj
  );
}

export function isVehicle(obj: unknown): obj is Vehicle {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    ('registrationNumber' in obj || 'registrationNo' in obj || 'vehicleNumber' in obj)
  );
}

export function isDriver(obj: unknown): obj is Driver {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'firstName' in obj &&
    'licenseNumber' in obj
  );
}
