export type Driver = {
  driver_id: number;
  NIC: string;
  address: string;
  date_of_birth: string;
  date_of_joining: string;
  driver_license_back_url: string;
  driver_license_front_url: string;
  name: string;
  gender: string;
  nic_front_pic_url: string;
  nice_back_pic_url: string;
  phone: string;
  profile_picture_url: string;
  second_phone: string;
  vehicle_Reg_No: string;
  email?: string;
  status: "ACTIVE" | "SUSPENDED" | "INACTIVE" | "PENDING";
  registrationStatus: "OTP_PENDING" | "OTP_VERIFIED" | "ACCOUNT_CREATED" | "HAVING_A_PROFILE";
  createdAt: string;
  updatedAt: string;
  fcmToken?: string;
  verificationNotes?: string;
  suspensionReason?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  suspendedBy?: string;
  suspendedAt?: string;
};

export type DriverInquiry = {
  id: string;
  driverId: number;
  driverName: string;
  driverPhone: string;
  inquiryType: "COMPLAINT" | "INQUIRY";
  category: "SYSTEM" | "DRIVER" | "PAYMENT" | "OTHER";
  subject: string;
  description: string;
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  submittedDate: string;
  responseDate?: string;
  response?: string;
  assignedTo?: string;
  customerName?: string;
  customerPhone?: string;
  vehicleRegNo?: string;
};

export type VehicleAlert = {
  id: string;
  vehicleId: number;
  vehicleRegNo: string;
  driverId: number;
  driverName: string;
  alertType: "BREAKDOWN" | "ACCIDENT" | "MAINTENANCE" | "EMERGENCY";
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  status: "ACTIVE" | "ASSIGNED" | "RESOLVED";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  reportedAt: string;
  resolvedAt?: string;
  assignedBackupVehicle?: string;
  assignedBackupDriver?: string;
  affectedRoutes: string[];
  affectedChildren: number;
  estimatedDowntime?: string;
};

// Mock data for drivers
export const mockDrivers: Driver[] = [
  {
    driver_id: 1,
    NIC: "199512345678",
    address: "123 Main Street, Colombo 05",
    date_of_birth: "1995-05-15",
    date_of_joining: "2024-01-15",
    driver_license_back_url: "/images/drivers/license-back-1.jpg",
    driver_license_front_url: "/images/drivers/license-front-1.jpg",
    name: "Ramesh Perera",
    gender: "Male",
    nic_front_pic_url: "/images/drivers/nic-front-1.jpg",
    nice_back_pic_url: "/images/drivers/nic-back-1.jpg",
    phone: "+94771234567",
    profile_picture_url: "/images/drivers/profile-1.jpg",
    second_phone: "+94777654321",
    vehicle_Reg_No: "CAB-1234",
    email: "ramesh@email.com",
    status: "PENDING",
    registrationStatus: "HAVING_A_PROFILE",
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-01-20T10:30:00Z",
    fcmToken: "fcm_token_123"
  },
  {
    driver_id: 2,
    NIC: "198712345678",
    address: "456 Lake Road, Kandy",
    date_of_birth: "1987-08-22",
    date_of_joining: "2023-11-10",
    driver_license_back_url: "/images/drivers/license-back-2.jpg",
    driver_license_front_url: "/images/drivers/license-front-2.jpg",
    name: "Sunil Fernando",
    gender: "Male",
    nic_front_pic_url: "/images/drivers/nic-front-2.jpg",
    nice_back_pic_url: "/images/drivers/nic-back-2.jpg",
    phone: "+94771234568",
    profile_picture_url: "/images/drivers/profile-2.jpg",
    second_phone: "+94777654322",
    vehicle_Reg_No: "VAN-5678",
    email: "sunil@email.com",
    status: "ACTIVE",
    registrationStatus: "HAVING_A_PROFILE",
    createdAt: "2023-11-10T08:00:00Z",
    updatedAt: "2023-11-15T10:30:00Z",
    fcmToken: "fcm_token_456",
    verifiedBy: "Admin",
    verifiedAt: "2023-11-15T10:30:00Z"
  },
  {
    driver_id: 3,
    NIC: "199712345679",
    address: "789 Hill Street, Galle",
    date_of_birth: "1997-03-10",
    date_of_joining: "2024-02-20",
    driver_license_back_url: "/images/drivers/license-back-3.jpg",
    driver_license_front_url: "/images/drivers/license-front-3.jpg",
    name: "Priya Jayasuriya",
    gender: "Female",
    nic_front_pic_url: "/images/drivers/nic-front-3.jpg",
    nice_back_pic_url: "/images/drivers/nic-back-3.jpg",
    phone: "+94771234569",
    profile_picture_url: "/images/drivers/profile-3.jpg",
    second_phone: "+94777654323",
    vehicle_Reg_No: "CAR-9012",
    email: "priya@email.com",
    status: "SUSPENDED",
    registrationStatus: "HAVING_A_PROFILE",
    createdAt: "2024-02-20T08:00:00Z",
    updatedAt: "2024-03-01T14:20:00Z",
    fcmToken: "fcm_token_789",
    suspensionReason: "Multiple customer complaints about tardiness",
    suspendedBy: "Manager",
    suspendedAt: "2024-03-01T14:20:00Z"
  },
  {
    driver_id: 4,
    NIC: "199012345680",
    address: "321 Beach Road, Negombo",
    date_of_birth: "1990-12-05",
    date_of_joining: "2024-10-15",
    driver_license_back_url: "/images/drivers/license-back-4.jpg",
    driver_license_front_url: "/images/drivers/license-front-4.jpg",
    name: "Kumara Silva",
    gender: "Male",
    nic_front_pic_url: "/images/drivers/nic-front-4.jpg",
    nice_back_pic_url: "/images/drivers/nic-back-4.jpg",
    phone: "+94771234570",
    profile_picture_url: "/images/drivers/profile-4.jpg",
    second_phone: "+94777654324",
    vehicle_Reg_No: "BUS-3456",
    email: "kumara@email.com",
    status: "PENDING",
    registrationStatus: "HAVING_A_PROFILE",
    createdAt: "2024-10-15T08:00:00Z",
    updatedAt: "2024-10-15T08:00:00Z",
    fcmToken: "fcm_token_101"
  }
];

// Mock data for driver inquiries
export const mockDriverInquiries: DriverInquiry[] = [
  {
    id: "INQ-001",
    driverId: 2,
    driverName: "Sunil Fernando",
    driverPhone: "+94771234568",
    inquiryType: "COMPLAINT",
    category: "PAYMENT",
    subject: "Payment not received for last month",
    description: "I have not received my payment for September. Please check the payment status and resolve this issue urgently.",
    status: "PENDING",
    priority: "HIGH",
    submittedDate: "2024-10-18T10:30:00Z",
    customerName: "Saman Perera",
    customerPhone: "+94771111111",
    vehicleRegNo: "VAN-5678"
  },
  {
    id: "INQ-002",
    driverId: 1,
    driverName: "Ramesh Perera",
    driverPhone: "+94771234567",
    inquiryType: "INQUIRY",
    category: "SYSTEM",
    subject: "Unable to update location in app",
    description: "The mobile app is not allowing me to update my current location. This is affecting the real-time tracking for parents.",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    submittedDate: "2024-10-17T14:20:00Z",
    responseDate: "2024-10-18T09:00:00Z",
    response: "Technical team is investigating the issue. Will be resolved within 24 hours.",
    assignedTo: "Technical Team",
    vehicleRegNo: "CAB-1234"
  },
  {
    id: "INQ-003",
    driverId: 4,
    driverName: "Kumara Silva",
    driverPhone: "+94771234570",
    inquiryType: "COMPLAINT",
    category: "OTHER",
    subject: "Rude behavior from customer",
    description: "A customer was very rude and used inappropriate language when I was 5 minutes late due to traffic. Please address this issue.",
    status: "RESOLVED",
    priority: "MEDIUM",
    submittedDate: "2024-10-16T16:45:00Z",
    responseDate: "2024-10-17T11:30:00Z",
    response: "Customer has been contacted and counseled about appropriate behavior. Incident has been documented.",
    assignedTo: "Customer Relations Manager",
    customerName: "Nimal Gunasekara",
    customerPhone: "+94772222222",
    vehicleRegNo: "BUS-3456"
  }
];

// Mock data for vehicle alerts
export const mockVehicleAlerts: VehicleAlert[] = [
  {
    id: "ALERT-001",
    vehicleId: 1,
    vehicleRegNo: "VAN-5678",
    driverId: 2,
    driverName: "Sunil Fernando",
    alertType: "BREAKDOWN",
    description: "Engine overheating, vehicle unable to continue route",
    location: "Main Street, Colombo 05",
    latitude: 6.9271,
    longitude: 79.8612,
    status: "ACTIVE",
    severity: "CRITICAL",
    reportedAt: "2024-10-19T08:30:00Z",
    affectedRoutes: ["Route-A", "Route-B"],
    affectedChildren: 15,
    estimatedDowntime: "2-3 hours"
  },
  {
    id: "ALERT-002",
    vehicleId: 2,
    vehicleRegNo: "CAB-1234",
    driverId: 1,
    driverName: "Ramesh Perera",
    alertType: "MAINTENANCE",
    description: "Scheduled maintenance required - brake inspection",
    location: "Garage - Kandy Road",
    status: "ASSIGNED",
    severity: "MEDIUM",
    reportedAt: "2024-10-18T15:00:00Z",
    resolvedAt: "2024-10-19T10:00:00Z",
    assignedBackupVehicle: "BACKUP-001",
    assignedBackupDriver: "Backup Driver 1",
    affectedRoutes: ["Route-C"],
    affectedChildren: 8,
    estimatedDowntime: "4 hours"
  },
  {
    id: "ALERT-003",
    vehicleId: 3,
    vehicleRegNo: "BUS-3456",
    driverId: 4,
    driverName: "Kumara Silva",
    alertType: "ACCIDENT",
    description: "Minor collision with parked vehicle, no injuries reported",
    location: "Galle Road, Colombo 06",
    latitude: 6.8851,
    longitude: 79.8776,
    status: "RESOLVED",
    severity: "HIGH",
    reportedAt: "2024-10-17T12:00:00Z",
    resolvedAt: "2024-10-17T18:00:00Z",
    assignedBackupVehicle: "BACKUP-002",
    assignedBackupDriver: "Backup Driver 2",
    affectedRoutes: ["Route-D", "Route-E"],
    affectedChildren: 20,
    estimatedDowntime: "6 hours"
  }
];