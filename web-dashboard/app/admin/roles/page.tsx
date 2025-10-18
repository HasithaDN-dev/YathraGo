'use client'

import React, { useEffect, useState } from 'react';
import { User, Star, Mail, Phone, MapPin, Calendar, Car, Eye, Edit, X, Users, Settings, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PieChart } from '@/components/charts/PieChart';

// Helper to map ID prefixes to user type labels
const getUserTypeFromId = (userId: string): string => {
  const prefix = String(userId).substring(0, 3);
  const userTypes: { [key: string]: string } = {
    PAR: 'Parent',
    STP: 'Staff Passenger',
    DRV: 'Driver',
    OWN: 'Owner',
    ADM: 'Admin',
    MGR: 'Manager',
    DCO: 'Driver Coordinator',
    FMG: 'Finance Manager',
    CHD: 'Child',
    WEB: 'Web User',
  };
  return userTypes[prefix] || 'Unknown';
};

// User type for modal and table
type UserType = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  address: string;
  status: string;
  joinDate: string;
  profileImage?: string;
  emergencyContact?: string;
  children?: Array<{ name: string; age: number; grade: string }>;
  department?: string;
  employeeId?: string;
  workLocation?: string;
  workAddress?: string;
  pickUpLocation?: string;
  pickupAddress?: string;
  nearbyCity?: string;
  NIC?: string;
  registrationStatus?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  vehicleAssigned?: string;
  experienceYears?: number;
  rating?: number;
  totalTrips?: number;
  businessName?: string;
  adminLevel?: string;
  lastLogin?: string;
  managementArea?: string;
  teamSize?: number;
  coordinationArea?: string;
  driversManaged?: number;
  financialAccess?: string;
  certifications?: string[];
  grade?: string;
  schoolName?: string;
  parentName?: string;
  role?: string;
  permissions?: string;
  reviews?: Array<{
    id: number;
    rating: number;
    comment: string;
    date: string;
    driverId?: string;
    driverName?: string;
    passengerId?: string;
    passengerName?: string;
  }>;
  complaints?: Array<{
    id: number;
    type: string;
    description: string;
    date: string;
    status: string;
    driverId?: string;
    driverName?: string;
    passengerId?: string;
    passengerName?: string;
  }>;
  [key: string]: unknown;
};

// Backend user shape (loose) used for listing and normalization
type BackendUser = {
  customer_id?: string; driver_id?: string; id?: string; child_id?: string; backup_driver_id?: string; userId?: string;
  name?: string; childName?: string; firstName?: string; childFirstName?: string; lastName?: string; childLastName?: string;
  username?: string; email?: string; phone?: string; second_phone?: string; address?: string;
  isActive?: boolean; status?: string;
  createdAt?: string;
  Customer?: { firstName?: string; lastName?: string; email?: string; phone?: string; address?: string; status?: string; createdAt?: string; profileImageUrl?: string; emergencyContact?: string };
  workLocation?: string; workAddress?: string; pickUpLocation?: string; pickupAddress?: string; nearbyCity?: string;
  NIC?: string; licenseNumber?: string; licenseExpiry?: string; registrationStatus?: string;
  grade?: string; schoolName?: string;
  profileImageUrl?: string; emergencyContact?: string;
  permissions?: string; role?: string;
  [key: string]: unknown;
};

// Normalize various backend user shapes into a consistent UserType used by modals
const normalizeUser = (user: BackendUser): UserType => {
  return {
    id: user.customer_id || user.driver_id || user.id || user.child_id || user.backup_driver_id || user.userId || '',
    name:
      user.name ||
      user.childName ||
      `${user.firstName || user.childFirstName || ''} ${user.lastName || user.childLastName || ''}`.trim() ||
      `${user.Customer?.firstName || ''} ${user.Customer?.lastName || ''}`.trim() ||
      user.username ||
      'N/A',
    email: user.email || user.Customer?.email || 'N/A',
    mobile: user.phone || user.Customer?.phone || user.second_phone || 'N/A',
    address: user.address || user.Customer?.address || 'N/A',
    status: user.status || user.Customer?.status || (user.isActive ? 'Active' : 'Inactive') || 'Active',
    joinDate: (user.createdAt || user.Customer?.createdAt || 'N/A') as string,
  profileImage: user.profileImageUrl || user.Customer?.profileImageUrl,
  emergencyContact: user.emergencyContact || user.Customer?.emergencyContact,
    workLocation: user.workLocation,
    workAddress: user.workAddress,
    pickUpLocation: user.pickUpLocation,
    pickupAddress: user.pickupAddress,
    nearbyCity: user.nearbyCity,
    NIC: user.NIC,
    licenseNumber: user.licenseNumber,
    licenseExpiry: user.licenseExpiry,
    registrationStatus: user.registrationStatus,
    grade: user.grade,
    schoolName: user.schoolName,
    parentName: user.Customer ? `${user.Customer.firstName || ''} ${user.Customer.lastName || ''}`.trim() || undefined : undefined,
    role: user.role,
    permissions: user.permissions,
  } as UserType;
};

// User Profile Modal Component
type UserProfileModalProps = {
  user: UserType;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (user: UserType) => void;
};
const UserProfileModal = ({ user, isOpen, onClose, onEdit }: UserProfileModalProps) => {
  if (!isOpen || !user) return null;


  const renderStarRating = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-gray-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">{getUserTypeFromId(String(user.id))} - {user.id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge 
              variant={user.status === "Active" ? "default" : "secondary"}
              className={user.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
            >
              {user.status}
            </Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEdit(user)}
              className="flex items-center space-x-1"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Mobile</p>
                    <p className="font-medium">{user.mobile}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{user.address}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Join Date</p>
                    <p className="font-medium">
                      {user.joinDate && user.joinDate !== 'N/A' 
                        ? new Date(user.joinDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })
                        : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5"></div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge 
                      variant={user.status === "Active" ? "default" : "secondary"}
                      className={user.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                    >
                      {user.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role-specific Information */}
            <Card>
              <CardHeader>
                <CardTitle>Role-specific Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Parent-specific details */}
                {String(user.id).startsWith('PAR') && (
                  <>
                    {user.emergencyContact && (
                      <div>
                        <p className="text-sm text-gray-500">Emergency Contact</p>
                        <p className="font-medium">{user.emergencyContact}</p>
                      </div>
                    )}
                    {user.children && user.children.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500">Children</p>
                        <div className="space-y-2">
                          {user.children.map((child: { name: string; age: number; grade: string }, index: number) => (
                            <div key={index} className="bg-gray-50 p-2 rounded">
                              <p className="font-medium">{child.name}</p>
                              <p className="text-sm text-gray-600">Age: {child.age} | Grade: {child.grade}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Staff Passenger-specific details */}
                {(user.workLocation || user.pickUpLocation) && (
                  <>
                    {user.nearbyCity && (
                      <div>
                        <p className="text-sm text-gray-500">Nearby City</p>
                        <p className="font-medium">{user.nearbyCity}</p>
                      </div>
                    )}
                    {user.workLocation && (
                      <div>
                        <p className="text-sm text-gray-500">Work Location</p>
                        <p className="font-medium">{user.workLocation}</p>
                      </div>
                    )}
                    {user.workAddress && (
                      <div>
                        <p className="text-sm text-gray-500">Work Address</p>
                        <p className="font-medium">{user.workAddress}</p>
                      </div>
                    )}
                    {user.pickUpLocation && (
                      <div>
                        <p className="text-sm text-gray-500">Pickup Location</p>
                        <p className="font-medium">{user.pickUpLocation}</p>
                      </div>
                    )}
                    {user.pickupAddress && (
                      <div>
                        <p className="text-sm text-gray-500">Pickup Address</p>
                        <p className="font-medium">{user.pickupAddress}</p>
                      </div>
                    )}
                  </>
                )}

                {/* Driver-specific details */}
                {(user.NIC || user.licenseNumber || user.registrationStatus) && (
                  <>
                    {user.NIC && (
                      <div>
                        <p className="text-sm text-gray-500">NIC</p>
                        <p className="font-medium">{user.NIC}</p>
                      </div>
                    )}
                    {user.registrationStatus && (
                      <div>
                        <p className="text-sm text-gray-500">Registration Status</p>
                        <p className="font-medium">{user.registrationStatus}</p>
                      </div>
                    )}
                    {user.licenseNumber && (
                      <div>
                        <p className="text-sm text-gray-500">License Number</p>
                        <p className="font-medium">{user.licenseNumber}</p>
                      </div>
                    )}
                    {user.licenseExpiry && (
                      <div>
                        <p className="text-sm text-gray-500">License Expiry</p>
                        <p className="font-medium">{user.licenseExpiry}</p>
                      </div>
                    )}
                    {user.vehicleAssigned && (
                      <div className="flex items-center space-x-3">
                        <Car className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Vehicle Assigned</p>
                          <p className="font-medium">{user.vehicleAssigned}</p>
                        </div>
                      </div>
                    )}
                    {user.experienceYears && (
                      <div>
                        <p className="text-sm text-gray-500">Experience</p>
                        <p className="font-medium">{user.experienceYears} years</p>
                      </div>
                    )}
                    {user.totalTrips && (
                      <div>
                        <p className="text-sm text-gray-500">Total Trips</p>
                        <p className="font-medium">{user.totalTrips}</p>
                      </div>
                    )}
                    {user.rating && (
                      <div>
                        <p className="text-sm text-gray-500">Rating</p>
                        <div className="flex items-center space-x-2">
                          <div className="flex">{renderStarRating(Math.floor(user.rating ?? 0))}</div>
                          <span className="font-medium">{user.rating}</span>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Child-specific details */}
                {(user.grade || user.schoolName || user.parentName) && (
                  <>
                    {user.grade && (
                      <div>
                        <p className="text-sm text-gray-500">Grade</p>
                        <p className="font-medium">{user.grade}</p>
                      </div>
                    )}
                    {user.schoolName && (
                      <div>
                        <p className="text-sm text-gray-500">School Name</p>
                        <p className="font-medium">{user.schoolName}</p>
                      </div>
                    )}
                    {user.parentName && (
                      <div>
                        <p className="text-sm text-gray-500">Parent Name</p>
                        <p className="font-medium">{user.parentName}</p>
                      </div>
                    )}
                  </>
                )}

                {/* Other role-specific details */}
                {user.businessName && (
                  <div>
                    <p className="text-sm text-gray-500">Business Name</p>
                    <p className="font-medium">{user.businessName}</p>
                  </div>
                )}
                {user.role && (
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-medium">{user.role}</p>
                  </div>
                )}
                {user.adminLevel && (
                  <div>
                    <p className="text-sm text-gray-500">Admin Level</p>
                    <p className="font-medium">{user.adminLevel}</p>
                  </div>
                )}
                {user.managementArea && (
                  <div>
                    <p className="text-sm text-gray-500">Management Area</p>
                    <p className="font-medium">{user.managementArea}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Reviews Section */}
          {user.reviews && user.reviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5" />
                  <span>Reviews ({user.reviews.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.reviews.map((review: {
                    id: number;
                    rating: number;
                    comment: string;
                    date: string;
                    driverId?: string;
                    driverName?: string;
                    passengerId?: string;
                    passengerName?: string;
                  }) => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex">{renderStarRating(review.rating)}</div>
                          <span className="font-medium">{review.rating}/5</span>
                        </div>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      <p className="text-gray-700 mb-2">{review.comment}</p>
                      <div className="text-sm text-gray-500">
                        {review.driverId && (
                          <span>Driver: {review.driverName} ({review.driverId})</span>
                        )}
                        {review.passengerId && (
                          <span>Passenger: {review.passengerName} ({review.passengerId})</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Complaints Section */}
          {user.complaints && user.complaints.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Complaints ({user.complaints.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.complaints.map((complaint: {
                    id: number;
                    type: string;
                    description: string;
                    date: string;
                    status: string;
                    driverId?: string;
                    driverName?: string;
                    passengerId?: string;
                    passengerName?: string;
                  }) => (
                    <div key={complaint.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <Badge 
                          variant="outline" 
                          className={
                            complaint.status === "Resolved" 
                              ? "bg-green-100 text-green-800 border-green-300" 
                              : complaint.status === "Under Investigation"
                              ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                              : "bg-red-100 text-red-800 border-red-300"
                          }
                        >
                          {complaint.status}
                        </Badge>
                        <span className="text-sm text-gray-500">{complaint.date}</span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">{complaint.type}</h4>
                      <p className="text-gray-700 mb-2">{complaint.description}</p>
                      <div className="text-sm text-gray-500">
                        {complaint.driverId && (
                          <span>Driver: {complaint.driverName} ({complaint.driverId})</span>
                        )}
                        {complaint.passengerId && (
                          <span>Passenger: {complaint.passengerName} ({complaint.passengerId})</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Reviews/Complaints Message */}
          {(!user.reviews || user.reviews.length === 0) && (!user.complaints || user.complaints.length === 0) && (
            <Card>
              <CardContent className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <Star className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-gray-500">No reviews or complaints available for this user.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

// Edit User Modal Component

const EditUserModal = ({ 
  user, 
  isOpen, 
  onClose, 
  onSave, 
  onStatusChange 
}: { 
  user: UserType; 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: () => void; 
  onStatusChange: (status: string) => void; 
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  
  if (!isOpen || !user) return null;

  const handleSaveClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmSave = () => {
    setShowConfirm(false);
    onSave();
  };

  const handleCancelSave = () => {
    setShowConfirm(false);
  };

  const getUserTypeFromId = (userId: string) => {
    const prefix = String(userId).substring(0, 3);
    const userTypes: { [key: string]: string } = {
      'PAR': 'Parent',
      'STP': 'Staff Passenger',
      'DRV': 'Driver',
      'OWN': 'Owner',
      'ADM': 'Admin',
      'MGR': 'Manager',
      'DCO': 'Driver Coordinator',
      'FMG': 'Finance Manager',
    };
    return userTypes[prefix] || 'Unknown';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Edit User</h2>
            <p className="text-gray-600">{user.name} - {getUserTypeFromId(String(user.id))}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User Info Display */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">User Information</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">User ID:</span>
                <span className="ml-2 font-medium">{user.id}</span>
              </div>
              <div>
                <span className="text-gray-500">Name:</span>
                <span className="ml-2 font-medium">{user.name}</span>
              </div>
              <div>
                <span className="text-gray-500">Email:</span>
                <span className="ml-2 font-medium">{user.email}</span>
              </div>
              <div>
                <span className="text-gray-500">Mobile:</span>
                <span className="ml-2 font-medium">{user.mobile}</span>
              </div>
            </div>
          </div>

          {/* Status Edit Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              User Status
            </label>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="status-active"
                  name="status"
                  value="Active"
                  checked={user.status === "Active"}
                  onChange={(e) => onStatusChange(e.target.value)}
                  className="w-4 h-4 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="status-active" className="flex items-center space-x-2">
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                  <span className="text-sm text-gray-700">User can access the system</span>
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="status-inactive"
                  name="status"
                  value="Inactive"
                  checked={user.status === "Inactive"}
                  onChange={(e) => onStatusChange(e.target.value)}
                  className="w-4 h-4 text-gray-600 focus:ring-gray-500"
                />
                <label htmlFor="status-inactive" className="flex items-center space-x-2">
                  <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                  <span className="text-sm text-gray-700">User access is suspended</span>
                </label>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Only user status can be modified. Personal details cannot be changed from this interface for security reasons.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveClick}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Save Changes
          </Button>
        </div>

        {/* Confirmation Dialog */}
        {showConfirm && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
              <div className="flex items-start space-x-3 mb-4">
                <div className="flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Confirm Changes
                  </h3>
                  <p className="text-sm text-gray-600">
                    Are you sure you want to save the changes to this user&apos;s status? This action will immediately affect the user&apos;s access to the system.
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={handleCancelSave}
                  size="sm"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmSave}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  Confirm & Save
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function RolePermissionManagementPage() {
  const [selectedRole, setSelectedRole] = useState("Staff Passengers");
  const [showUserTable, setShowUserTable] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  
  // State for real user counts from database
  const [userCounts, setUserCounts] = useState({
    staffPassengers: 0,
    drivers: 0,
    owners: 0,
    admins: 0,
    managers: 0,
    backupDrivers: 0,
    children: 0,
    webusers: 0,
    totalCustomers: 0,
  });
  // const [loadingCounts, setLoadingCounts] = useState(true); // currently unused

  // State for real user data from database
  const [realUsers, setRealUsers] = useState<BackendUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch user counts from backend
  useEffect(() => {
    async function fetchUserCounts() {
      try {
        const response = await fetch('http://localhost:3002/customer/counts');
        const data = await response.json();
        
        if (data.success) {
          setUserCounts(data.counts);
        }
      } catch (error) {
  console.error('Failed to fetch user counts:', error);
      }
    }

    fetchUserCounts();
  }, []); // Run once when component mounts

  // Fetch real users when role is selected
  useEffect(() => {
    if (showUserTable && selectedRole) {
      fetchUsersForRole(selectedRole);
    }
  }, [showUserTable, selectedRole]);

  // Function to fetch users for a specific role
  const fetchUsersForRole = async (roleName: string) => {
    setLoadingUsers(true);
    try {
      let endpoint = '';
      
      // Map role names to API endpoints
      switch (roleName) {
        case 'Staff Passengers':
          endpoint = '/admin/users/staff-passengers';
          break;
        case 'Drivers':
          endpoint = '/admin/users/drivers';
          break;
        case 'Owners':
          endpoint = '/admin/users/owners';
          break;
        case 'Admins':
          endpoint = '/admin/users/admins';
          break;
        case 'Managers':
          endpoint = '/admin/users/managers';
          break;
        case 'Backup Drivers':
          endpoint = '/admin/users/backup-drivers';
          break;
        case 'Children':
          endpoint = '/admin/users/children';
          break;
        case 'Web Users':
          endpoint = '/admin/users/web-users';
          break;
        default:
          endpoint = '/admin/users/parents';
      }

      const response = await fetch(`http://localhost:3002${endpoint}`);
      const data = await response.json();
      
      if (data.success) {
        // Extract the appropriate data array from response
        const dataKey = Object.keys(data).find(key => Array.isArray(data[key]));
        setRealUsers(dataKey ? data[dataKey] : []);
      } else {
        setRealUsers([]);
      }
      setLoadingUsers(false);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setRealUsers([]);
      setLoadingUsers(false);
    }
  };

  // Use real counts from database instead of hardcoded values
  const roles = [
    { name: "Staff Passengers", userCount: userCounts.staffPassengers },
    { name: "Drivers", userCount: userCounts.drivers },
    { name: "Owners", userCount: userCounts.owners },
    { name: "Admins", userCount: userCounts.admins },
    { name: "Managers", userCount: userCounts.managers },
    { name: "Backup Drivers", userCount: userCounts.backupDrivers },
    { name: "Children", userCount: userCounts.children },
    { name: "Web Users", userCount: userCounts.webusers },
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<BackendUser[]>([]);

  const handleRoleChange = (roleName: string) => {
    setSelectedRole(roleName);
    setShowUserTable(true);
    setSearchTerm("");
  };

  const handleBackToRoles = () => {
    setShowUserTable(false);
    setSearchTerm("");
  };

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(realUsers);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredUsers(
        realUsers.filter((user: BackendUser) => {
          const id = (user.customer_id || user.driver_id || user.id || user.child_id || user.backup_driver_id || user.userId || '').toString().toLowerCase();
          const name = (
            user.name || user.childName || `${user.firstName || user.childFirstName || ''} ${user.lastName || user.childLastName || ''}`.trim() ||
            `${user.Customer?.firstName || ''} ${user.Customer?.lastName || ''}`.trim() || user.username || ''
          ).toLowerCase();
          const role = (user.role || getUserTypeFromId(id) || '').toLowerCase();
          const email = (user.email || user.Customer?.email || '').toLowerCase();
          const address = (user.address || user.Customer?.address || '').toLowerCase();
          const mobile = (user.phone || user.Customer?.phone || user.second_phone || '').toString().toLowerCase();
          return (
            id.includes(term) ||
            name.includes(term) ||
            role.includes(term) ||
            email.includes(term) ||
            address.includes(term) ||
            mobile.includes(term)
          );
        })
      );
    }
  }, [searchTerm, realUsers]);

  const handleViewUser = (user: BackendUser) => {
    // Normalize the user object to a consistent structure for the modal
    const normalizedUser = {
      id: user.customer_id || user.driver_id || user.id || user.child_id || user.backup_driver_id || user.userId || '',
      name: user.name || user.childName || 
        `${user.firstName || user.childFirstName || ''} ${user.lastName || user.childLastName || ''}`.trim() || 
        `${user.Customer?.firstName || ''} ${user.Customer?.lastName || ''}`.trim() ||
        user.username || 'N/A',
      email: user.email || user.Customer?.email || 'N/A',
      mobile: user.phone || user.Customer?.phone || user.second_phone || 'N/A',
      address: user.address || user.Customer?.address || 'N/A',
      status: user.status || user.Customer?.status || (user.isActive ? 'Active' : 'Inactive') || 'Active',
      joinDate: user.createdAt || user.Customer?.createdAt || 'N/A',
      profileImage: user.profileImageUrl || user.Customer?.profileImageUrl,
      emergencyContact: user.emergencyContact || user.Customer?.emergencyContact,
      // Staff Passenger specific fields
      workLocation: user.workLocation,
      workAddress: user.workAddress,
      pickUpLocation: user.pickUpLocation,
      pickupAddress: user.pickupAddress,
      nearbyCity: user.nearbyCity,
      // Driver specific fields
      NIC: user.NIC,
      licenseNumber: user.licenseNumber,
      licenseExpiry: user.licenseExpiry,
      registrationStatus: user.registrationStatus,
      // Child specific fields
      grade: user.grade,
      schoolName: user.schoolName,
      parentName: user.Customer ? `${user.Customer.firstName} ${user.Customer.lastName}` : undefined,
      // Admin/Manager fields
      role: user.role,
      permissions: user.permissions,
      // Include raw object for any other fields
      ...user,
    };
    
    setSelectedUser(normalizedUser);
    setShowUserProfile(true);
  };

  const handleCloseProfile = () => {
    setShowUserProfile(false);
    setSelectedUser(null);
  };

  const handleEditUser = (user: UserType) => {
    setEditingUser({ ...user });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
  };

  const handleSaveUserChanges = async () => {
    if (editingUser) {
      try {
        // Determine the user type from the selected role
        const userTypeMap: { [key: string]: string } = {
          'Staff Passengers': 'staff-passenger',
          'Drivers': 'driver',
          'Owners': 'owner',
          'Admins': 'admin',
          'Managers': 'manager',
          'Backup Drivers': 'backup-driver',
          'Children': 'child',
          'Web Users': 'webuser',
        };
        
        const userType = userTypeMap[selectedRole] || 'customer';
        
        // Make API call to update user status in database
        const response = await fetch(`http://localhost:3002/admin/users/${userType}/${editingUser.id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: editingUser.status }),
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Update the user in the realUsers array
          setRealUsers(prevUsers => 
            prevUsers.map(user => {
              const userId = user.customer_id || user.driver_id || user.id || user.child_id || user.backup_driver_id;
              if (userId === editingUser.id) {
                // Update the status in the appropriate field
                if (user.status !== undefined) {
                  return { ...user, status: editingUser.status };
                } else if (user.Customer) {
                  return { 
                    ...user, 
                    Customer: { ...user.Customer, status: editingUser.status }
                  };
                } else {
                  return { ...user, status: editingUser.status };
                }
              }
              return user;
            })
          );
          
          // If we're viewing the user profile, update the selected user too
          if (selectedUser && selectedUser.id === editingUser.id) {
            setSelectedUser({ ...editingUser });
          }
          
          // Show success message
          alert(`✓ User status updated successfully!\n\nUser: ${editingUser.name}\nNew Status: ${editingUser.status}`);
          
          setShowEditModal(false);
          setEditingUser(null);
        } else {
          alert(`❌ Failed to update user status:\n${result.message}`);
        }
      } catch (error) {
        console.error('Error updating user status:', error);
        alert('❌ Failed to update user status. Please try again.');
      }
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (editingUser) {
      setEditingUser({ ...editingUser, status: newStatus });
    }
  };

  // permissions matrix removed

  // Get users for selected role
  // Removed reference to roleUsers. Use realUsers from backend only.

  // If showing user table, render the user management interface
  if (showUserTable) {
    return (
      <>
        <div className="space-y-6">
          {/* Header with back button */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={handleBackToRoles}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Roles</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedRole} Users</h1>
              <p className="text-gray-600">Manage users in the {selectedRole} role</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search/Filter: Quickly find users
            </label>
            <input
              type="text"
              aria-label="Search or filter users by user ID, name, email, address, or mobile"
              placeholder="Type a name, user ID, email, address, or mobile number"
              className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">Search by user ID, name, role, email, address, or mobile number.</p>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>User List</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No users found for this role.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">User ID</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">User Name</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Mobile</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Address</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user: BackendUser, index: number) => {
                        // Map different user object structures to consistent format
                        const userId = user.customer_id || user.driver_id || user.id || user.child_id || user.backup_driver_id || index;
                        const userName = user.name || user.childName || 
                          `${user.firstName || user.childFirstName || ''} ${user.lastName || user.childLastName || ''}`.trim() || 
                          `${user.Customer?.firstName || ''} ${user.Customer?.lastName || ''}`.trim() ||
                          user.username || 'N/A';
                        const userEmail = user.email || (user.Customer?.email) || 'N/A';
                        const userPhone = user.phone || (user.Customer?.phone) || 'N/A';
                        const userAddress = user.address || (user.Customer?.address) || 'N/A';
                        // Determine user status - default to Active if not specified
                        let userStatus = 'Active';
                        if (user.status) {
                          userStatus = user.status;
                        } else if (user.Customer?.status) {
                          userStatus = user.Customer.status;
                        } else if (user.isActive !== undefined) {
                          userStatus = user.isActive ? 'Active' : 'Inactive';
                        }
                        // Normalize status to proper case
                        if (userStatus.toUpperCase() === 'ACTIVE') {
                          userStatus = 'Active';
                        } else if (userStatus.toUpperCase() === 'INACTIVE') {
                          userStatus = 'Inactive';
                        }
                        
                        return (
                          <tr key={userId} className="border-b hover:bg-gray-50">
                            <td className="py-4 px-4 font-medium text-gray-900">{userId}</td>
                            <td className="py-4 px-4 font-medium text-gray-900">{userName}</td>
                            <td className="py-4 px-4 text-gray-700">{userEmail}</td>
                            <td className="py-4 px-4 text-gray-700">{userPhone}</td>
                            <td className="py-4 px-4 text-gray-700">{userAddress}</td>
                            <td className="py-4 px-4">
                              <Badge 
                                variant={userStatus === "Active" || userStatus === "ACTIVE" ? "default" : "secondary"}
                                className={userStatus === "Active" || userStatus === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                              >
                                {userStatus}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex space-x-2 justify-center">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="flex items-center space-x-1"
                                  onClick={() => handleViewUser(user)}
                                >
                                  <Eye className="w-4 h-4" />
                                  <span>View</span>
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="flex items-center space-x-1"
                                  onClick={() => handleEditUser(normalizeUser(user))}
                                >
                                  <Edit className="w-4 h-4" />
                                  <span>Edit</span>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* User Profile Modal */}
        {selectedUser && (
          <UserProfileModal 
            user={selectedUser} 
            isOpen={showUserProfile} 
            onClose={handleCloseProfile}
            onEdit={handleEditUser}
          />
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <EditUserModal
            user={editingUser}
            isOpen={showEditModal}
            onClose={handleCloseEditModal}
            onSave={handleSaveUserChanges}
            onStatusChange={handleStatusChange}
          />
        )}
      </>
    );
  }

  // Default role and permission management interface
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Role & Permission Management</h1>
        <p className="text-gray-600">Manage user roles and their permissions</p>
      </div>

      {/* Global Search removed as requested */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles Section */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Roles</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(searchTerm.trim()
                  ? roles.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  : roles
                 ).map((role, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedRole === role.name
                        ? 'bg-blue-50 border-2 border-blue-200' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => handleRoleChange(role.name)}
                  >
                    <div className="flex flex-col">
                      <span className={`font-medium ${
                        selectedRole === role.name ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {role.name}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {role.userCount} users
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pie Chart Section */}
        <div className="lg:col-span-2">
          {/* Quick Search in right panel */}
          {!showUserTable && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Quick Search</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RightPanelSearch 
                  onView={handleViewUser} 
                  onEdit={(u) => handleEditUser(normalizeUser(u))} 
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>User Roles Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center">
                <PieChart
                  data={roles.map((role) => ({
                    name: role.name,
                    value: role.userCount,
                  }))}
                  height={260}
                />
                <p className="text-gray-500 text-sm mt-4">Pie chart shows the proportion of each user role.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Right panel search component (search by role, user id, email, name)
type RightPanelSearchProps = {
  onView: (user: BackendUser) => void;
  onEdit: (user: BackendUser) => void;
};

const RightPanelSearch: React.FC<RightPanelSearchProps> = ({ onView, onEdit }) => {
  const [term, setTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BackendUser[]>([]);
  const rolesMap: { [key: string]: string } = {
    'Staff Passengers': '/admin/users/staff-passengers',
    'Drivers': '/admin/users/drivers',
    'Owners': '/admin/users/owners',
    'Admins': '/admin/users/admins',
    'Managers': '/admin/users/managers',
    'Backup Drivers': '/admin/users/backup-drivers',
    'Children': '/admin/users/children',
    'Web Users': '/admin/users/web-users',
  };

  const doSearch = async (q: string, role: string) => {
    const query = q.trim();
    if (query.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const endpoints: string[] = role !== 'All' ? [rolesMap[role]] : Object.values(rolesMap);
      const fetches = endpoints.map(async (ep) => {
        const res = await fetch(`http://localhost:3002${ep}`);
        const json = await res.json();
        if (json && json.success) {
          const key = Object.keys(json).find((k) => Array.isArray(json[k]));
          return (key ? (json[key] as BackendUser[]) : []) as BackendUser[];
        }
        return [] as BackendUser[];
      });
      const arrays = await Promise.all(fetches);
      const combined: BackendUser[] = ([] as BackendUser[]).concat(...arrays);
      const lower = query.toLowerCase();
      const filtered = combined.filter((u) => {
        const id = (u.customer_id || u.driver_id || u.id || u.child_id || u.backup_driver_id || u.userId || '').toString();
        const email = (u.email || u.Customer?.email || '').toString();
        const name = (
          u.name || u.childName || `${u.firstName || u.childFirstName || ''} ${u.lastName || u.childLastName || ''}`.trim() ||
          `${u.Customer?.firstName || ''} ${u.Customer?.lastName || ''}`.trim() || u.username || ''
        ).toString();
        const roleName = getUserTypeFromId(id) || (u.role || '');
        const address = (u.address || u.Customer?.address || '').toString();
        const mobile = (u.phone || u.Customer?.phone || u.second_phone || '').toString();
        return (
          id.toLowerCase().includes(lower) ||
          email.toLowerCase().includes(lower) ||
          name.toLowerCase().includes(lower) ||
          roleName.toLowerCase().includes(lower) ||
          address.toLowerCase().includes(lower) ||
          mobile.toLowerCase().includes(lower)
        );
      });
      setResults(filtered.slice(0, 50));
    } catch (e) {
      console.error('Search failed', e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Live search when term changes
    doSearch(term, roleFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, roleFilter]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search users</label>
          <input
            type="text"
            placeholder="By role, user ID, email, name, address or mobile"
            aria-label="Search by role, user ID, email, name, address or mobile"
            className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option>All</option>
            {Object.keys(rolesMap).map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      <div>
        {loading ? (
          <p className="text-sm text-gray-500">Searching...</p>
        ) : results.length === 0 ? (
          <p className="text-sm text-gray-500">No results</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 font-medium text-gray-900">User ID</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-900">Name</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-900">Email</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-900">Role</th>
                  <th className="text-center py-2 px-2 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((u, idx) => {
                  const id = (u.customer_id || u.driver_id || u.id || u.child_id || u.backup_driver_id || u.userId || '').toString();
                  const name = (
                    u.name || u.childName || `${u.firstName || u.childFirstName || ''} ${u.lastName || u.childLastName || ''}`.trim() ||
                    `${u.Customer?.firstName || ''} ${u.Customer?.lastName || ''}`.trim() || u.username || 'N/A'
                  ).toString();
                  const email = (u.email || u.Customer?.email || 'N/A').toString();
                  const roleName = getUserTypeFromId(id) || (u.role || '');
                  return (
                    <tr key={`${id}-${idx}`} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2 font-medium text-gray-900">{id}</td>
                      <td className="py-2 px-2 font-medium text-gray-900">{name}</td>
                      <td className="py-2 px-2 text-gray-700">{email}</td>
                      <td className="py-2 px-2 text-gray-700">{roleName}</td>
                      <td className="py-2 px-2">
                        <div className="flex space-x-2 justify-center">
                          <Button size="sm" variant="outline" className="flex items-center space-x-1" onClick={() => onView(u)}>
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </Button>
                          <Button size="sm" variant="outline" className="flex items-center space-x-1" onClick={() => onEdit(u)}>
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="text-xs text-gray-500 mt-2">Showing up to 50 matches</p>
          </div>
        )}
      </div>
    </div>
  );
};
