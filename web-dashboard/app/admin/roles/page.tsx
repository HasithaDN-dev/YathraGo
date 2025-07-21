"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users,
  Plus,
  UserCheck,
  Settings,
  ArrowLeft,
  Eye,
  Edit,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Star,
  AlertTriangle,
  User,
  Car
} from "lucide-react";

// Sample user data for different roles with ID prefixes for identification
const roleUsers = {
  "Parents": [
    { 
      id: "PAR001", 
      name: "John Silva", 
      email: "john.silva@gmail.com", 
      mobile: "+94 77 123 4567", 
      address: "123 Main St, Colombo", 
      status: "Active",
      joinDate: "2024-01-15",
      profileImage: "/api/placeholder/100/100",
      emergencyContact: "+94 77 123 4568",
      children: [
        { name: "Alex Silva", age: 8, grade: "Grade 3" },
        { name: "Emma Silva", age: 10, grade: "Grade 5" }
      ],
      reviews: [
        { 
          id: 1, 
          rating: 5, 
          comment: "Excellent service, always on time", 
          date: "2024-06-15",
          driverId: "DRV001",
          driverName: "Kasun Perera"
        },
        { 
          id: 2, 
          rating: 4, 
          comment: "Good overall experience", 
          date: "2024-05-20",
          driverId: "DRV002",
          driverName: "Nimal Rodrigo"
        }
      ],
      complaints: [
        {
          id: 1,
          type: "Late Arrival",
          description: "Driver was 15 minutes late on 2024-06-01",
          date: "2024-06-01",
          status: "Resolved",
          driverId: "DRV001",
          driverName: "Kasun Perera"
        }
      ]
    },
    { 
      id: "PAR002", 
      name: "Maria Fernando", 
      email: "maria.fernando@yahoo.com", 
      mobile: "+94 76 234 5678", 
      address: "456 Oak Ave, Kandy", 
      status: "Active",
      joinDate: "2024-02-20",
      profileImage: "/api/placeholder/100/100",
      emergencyContact: "+94 76 234 5679",
      children: [
        { name: "Sofia Fernando", age: 7, grade: "Grade 2" }
      ],
      reviews: [
        { 
          id: 3, 
          rating: 5, 
          comment: "Very professional drivers", 
          date: "2024-06-10",
          driverId: "DRV001",
          driverName: "Kasun Perera"
        }
      ],
      complaints: []
    },
    { 
      id: "PAR003", 
      name: "David Chen", 
      email: "david.chen@gmail.com", 
      mobile: "+94 75 345 6789", 
      address: "789 Pine St, Galle", 
      status: "Inactive",
      joinDate: "2024-03-10",
      profileImage: "/api/placeholder/100/100",
      emergencyContact: "+94 75 345 6780",
      children: [
        { name: "Kevin Chen", age: 9, grade: "Grade 4" }
      ],
      reviews: [],
      complaints: []
    }
  ],
  "Staff Passengers": [
    { 
      id: "STP001", 
      name: "Sarah Wilson", 
      email: "sarah.wilson@company.com", 
      mobile: "+94 74 456 7890", 
      address: "321 Elm St, Matara", 
      status: "Active",
      joinDate: "2024-01-05",
      profileImage: "/api/placeholder/100/100",
      department: "Marketing",
      employeeId: "EMP001",
      workLocation: "Colombo Office",
      reviews: [
        { 
          id: 4, 
          rating: 4, 
          comment: "Comfortable rides", 
          date: "2024-06-12",
          driverId: "DRV002",
          driverName: "Nimal Rodrigo"
        }
      ],
      complaints: []
    },
    { 
      id: "STP002", 
      name: "Mike Johnson", 
      email: "mike.johnson@company.com", 
      mobile: "+94 73 567 8901", 
      address: "654 Cedar Rd, Negombo", 
      status: "Active",
      joinDate: "2024-02-15",
      profileImage: "/api/placeholder/100/100",
      department: "IT",
      employeeId: "EMP002",
      workLocation: "Kandy Office",
      reviews: [],
      complaints: []
    }
  ],
  "Drivers": [
    { 
      id: "DRV001", 
      name: "Kasun Perera", 
      email: "kasun.perera@gmail.com", 
      mobile: "+94 71 678 9012", 
      address: "987 Birch Lane, Kalutara", 
      status: "Active",
      joinDate: "2023-12-01",
      profileImage: "/api/placeholder/100/100",
      licenseNumber: "B123456789",
      licenseExpiry: "2026-12-01",
      vehicleAssigned: "Toyota Hiace - ABC-1234",
      experienceYears: 8,
      rating: 4.8,
      totalTrips: 1250,
      reviews: [
        { 
          id: 5, 
          rating: 5, 
          comment: "Very punctual and professional", 
          date: "2024-06-18",
          passengerId: "PAR001",
          passengerName: "John Silva"
        },
        { 
          id: 6, 
          rating: 4, 
          comment: "Safe driving", 
          date: "2024-06-15",
          passengerId: "STP001",
          passengerName: "Sarah Wilson"
        }
      ],
      complaints: [
        {
          id: 2,
          type: "Rude Behavior",
          description: "Driver was rude to passenger",
          date: "2024-05-25",
          status: "Under Investigation",
          passengerId: "PAR002",
          passengerName: "Maria Fernando"
        }
      ]
    },
    { 
      id: "DRV002", 
      name: "Nimal Rodrigo", 
      email: "nimal.rodrigo@yahoo.com", 
      mobile: "+94 70 789 0123", 
      address: "147 Maple Dr, Panadura", 
      status: "Active",
      joinDate: "2024-01-10",
      profileImage: "/api/placeholder/100/100",
      licenseNumber: "B987654321",
      licenseExpiry: "2027-01-10",
      vehicleAssigned: "Toyota Coaster - XYZ-5678",
      experienceYears: 5,
      rating: 4.6,
      totalTrips: 890,
      reviews: [
        { 
          id: 7, 
          rating: 5, 
          comment: "Excellent service", 
          date: "2024-06-20",
          passengerId: "PAR003",
          passengerName: "David Chen"
        }
      ],
      complaints: []
    }
  ],
  "Owners": [
    { 
      id: "OWN001", 
      name: "Rajesh Kumar", 
      email: "rajesh.kumar@transport.com", 
      mobile: "+94 77 890 1234", 
      address: "258 Willow St, Colombo 07", 
      status: "Active",
      joinDate: "2023-11-15",
      profileImage: "/api/placeholder/100/100",
      businessName: "Kumar Transport Services",
      vehicleCount: 15,
      businessRegistration: "BRN123456",
      reviews: [],
      complaints: []
    }
  ],
  "Admins": [
    { 
      id: "ADM001", 
      name: "Priya Jayawardena", 
      email: "priya.admin@yathrago.com", 
      mobile: "+94 76 901 2345", 
      address: "369 Spruce Ave, Colombo 05", 
      status: "Active",
      joinDate: "2023-10-01",
      profileImage: "/api/placeholder/100/100",
      adminLevel: "Super Admin",
      lastLogin: "2024-07-18 09:30:00",
      reviews: [],
      complaints: []
    }
  ],
  "Managers": [
    { 
      id: "MGR001", 
      name: "Sunil Bandara", 
      email: "sunil.manager@yathrago.com", 
      mobile: "+94 75 012 3456", 
      address: "741 Aspen Ct, Dehiwala", 
      status: "Active",
      joinDate: "2023-11-20",
      profileImage: "/api/placeholder/100/100",
      managementArea: "Operations",
      teamSize: 25,
      reviews: [],
      complaints: []
    }
  ],
  "Driver Coordinators": [
    { 
      id: "DCO001", 
      name: "Chaminda Silva", 
      email: "chaminda.coord@yathrago.com", 
      mobile: "+94 74 123 4567", 
      address: "852 Poplar Blvd, Mount Lavinia", 
      status: "Active",
      joinDate: "2024-01-15",
      profileImage: "/api/placeholder/100/100",
      coordinationArea: "Colombo District",
      driversManaged: 12,
      reviews: [],
      complaints: []
    }
  ],
  "Finance Managers": [
    { 
      id: "FMG001", 
      name: "Anura Wickramasinghe", 
      email: "anura.finance@yathrago.com", 
      mobile: "+94 73 234 5678", 
      address: "963 Chestnut Way, Moratuwa", 
      status: "Active",
      joinDate: "2023-12-05",
      profileImage: "/api/placeholder/100/100",
      financialAccess: "Full Access",
      certifications: ["CMA", "ACCA"],
      reviews: [],
      complaints: []
    }
  ]
};

// Helper function to get user type from ID prefix
const getUserTypeFromId = (userId: string) => {
  const prefix = userId.substring(0, 3);
  const userTypes: { [key: string]: { label: string; color: string } } = {
    'PAR': { label: 'Parent', color: 'bg-blue-100 text-blue-800' },
    'STP': { label: 'Staff Passenger', color: 'bg-purple-100 text-purple-800' },
    'DRV': { label: 'Driver', color: 'bg-yellow-100 text-yellow-800' },
    'OWN': { label: 'Owner', color: 'bg-green-100 text-green-800' },
    'ADM': { label: 'Admin', color: 'bg-red-100 text-red-800' },
    'MGR': { label: 'Manager', color: 'bg-indigo-100 text-indigo-800' },
    'DCO': { label: 'Driver Coordinator', color: 'bg-orange-100 text-orange-800' },
    'FMG': { label: 'Finance Manager', color: 'bg-pink-100 text-pink-800' },
  };
  return userTypes[prefix] || { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
};

// User Profile Modal Component
const UserProfileModal = ({ 
  user, 
  isOpen, 
  onClose, 
  onEdit 
}: { 
  user: any; 
  isOpen: boolean; 
  onClose: () => void; 
  onEdit: (user: any) => void; 
}) => {
  if (!isOpen || !user) return null;

  const getUserTypeFromId = (userId: string) => {
    const prefix = userId.substring(0, 3);
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
              <p className="text-gray-600">{getUserTypeFromId(user.id)} - {user.id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge 
              variant={user.status === "Active" ? "default" : "secondary"}
              className={user.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
            >
              {user.status}
            </Badge>
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
                    <p className="font-medium">{user.joinDate}</p>
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
                {user.id.startsWith('PAR') && (
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
                          {user.children.map((child: any, index: number) => (
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
                {user.id.startsWith('STP') && (
                  <>
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="font-medium">{user.department}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Employee ID</p>
                      <p className="font-medium">{user.employeeId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Work Location</p>
                      <p className="font-medium">{user.workLocation}</p>
                    </div>
                  </>
                )}

                {/* Driver-specific details */}
                {user.id.startsWith('DRV') && (
                  <>
                    <div className="flex items-center space-x-3">
                      <Car className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Vehicle Assigned</p>
                        <p className="font-medium">{user.vehicleAssigned}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">License Number</p>
                      <p className="font-medium">{user.licenseNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">License Expiry</p>
                      <p className="font-medium">{user.licenseExpiry}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Experience</p>
                      <p className="font-medium">{user.experienceYears} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Trips</p>
                      <p className="font-medium">{user.totalTrips}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Rating</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex">{renderStarRating(Math.floor(user.rating))}</div>
                        <span className="font-medium">{user.rating}</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Other role-specific details */}
                {user.businessName && (
                  <div>
                    <p className="text-sm text-gray-500">Business Name</p>
                    <p className="font-medium">{user.businessName}</p>
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
                  {user.reviews.map((review: any) => (
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
                  {user.complaints.map((complaint: any) => (
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

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => onEdit(user)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
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
  user: any; 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: () => void; 
  onStatusChange: (status: string) => void; 
}) => {
  if (!isOpen || !user) return null;

  const getUserTypeFromId = (userId: string) => {
    const prefix = userId.substring(0, 3);
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
            <p className="text-gray-600">{user.name} - {getUserTypeFromId(user.id)}</p>
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
            onClick={onSave}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function RolePermissionManagementPage() {
  const [selectedRole, setSelectedRole] = useState("Staff Passengers");
  const [showUserTable, setShowUserTable] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const roles = [
    { name: "Parents", userCount: 24 },
    { name: "Staff Passengers", userCount: 12 },
    { name: "Drivers", userCount: 8 },
    { name: "Owners", userCount: 3 },
    { name: "Admins", userCount: 2 },
    { name: "Managers", userCount: 5 },
    { name: "Driver Coordinators", userCount: 4 },
    { name: "Finance Managers", userCount: 2 },
  ];

  const permissions = [
    {
      module: "Dashboard Access",
      view: true,
      create: false,
      edit: false,
      delete: false
    },
    {
      module: "Trip Management",
      view: true,
      create: true,
      edit: true,
      delete: false
    },
    {
      module: "User Accounts",
      view: true,
      create: true,
      edit: true,
      delete: true
    },
    {
      module: "Vehicle Assignment",
      view: true,
      create: true,
      edit: false,
      delete: false
    }
  ];

  const [permissionMatrix, setPermissionMatrix] = useState(permissions);

  const handleRoleChange = (roleName: string) => {
    setSelectedRole(roleName);
    setShowUserTable(true); // Navigate to user table when role is clicked
  };

  const handleBackToRoles = () => {
    setShowUserTable(false);
  };

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setShowUserProfile(true);
  };

  const handleCloseProfile = () => {
    setShowUserProfile(false);
    setSelectedUser(null);
  };

  const handleEditUser = (user: any) => {
    setEditingUser({ ...user });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
  };

  const handleSaveUserChanges = () => {
    if (editingUser) {
      // In a real application, this would make an API call to update the user
      console.log('Saving user changes:', editingUser);
      
      // If we're viewing the user profile, update the selected user too
      if (selectedUser && selectedUser.id === editingUser.id) {
        setSelectedUser({ ...editingUser });
      }
      
      setShowEditModal(false);
      setEditingUser(null);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (editingUser) {
      setEditingUser({ ...editingUser, status: newStatus });
    }
  };

  const handlePermissionToggle = (moduleIndex: number, permissionType: string) => {
    setPermissionMatrix(prev => prev.map((item, index) => {
      if (index === moduleIndex) {
        return {
          ...item,
          [permissionType]: !item[permissionType as keyof typeof item]
        };
      }
      return item;
    }));
  };

  // Get users for selected role
  const currentRoleUsers = roleUsers[selectedRole as keyof typeof roleUsers] || [];

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

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>User List</CardTitle>
            </CardHeader>
            <CardContent>
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
                    {currentRoleUsers.map((user) => {
                      return (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-4 font-medium text-gray-900">{user.id}</td>
                          <td className="py-4 px-4 font-medium text-gray-900">{user.name}</td>
                          <td className="py-4 px-4 text-gray-700">{user.email}</td>
                          <td className="py-4 px-4 text-gray-700">{user.mobile}</td>
                          <td className="py-4 px-4 text-gray-700">{user.address}</td>
                          <td className="py-4 px-4">
                            <Badge 
                              variant={user.status === "Active" ? "default" : "secondary"}
                              className={user.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                            >
                              {user.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-2 justify-center">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleViewUser(user)}
                                className="flex items-center space-x-1"
                              >
                                <Eye className="w-4 h-4" />
                                <span>View</span>
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditUser(user)}
                                className="flex items-center space-x-1"
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
            </CardContent>
          </Card>
        </div>

        {/* User Profile Modal */}
        <UserProfileModal 
          user={selectedUser} 
          isOpen={showUserProfile} 
          onClose={handleCloseProfile}
          onEdit={handleEditUser}
        />

        {/* Edit User Modal */}
        <EditUserModal
          user={editingUser}
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          onSave={handleSaveUserChanges}
          onStatusChange={handleStatusChange}
        />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles Section */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Roles</span>
                </CardTitle>
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Role
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {roles.map((role, index) => (
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

        {/* Permissions Matrix */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Permissions Matrix - {selectedRole}</span>
                </CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Clone Existing Role
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <UserCheck className="w-4 h-4 mr-2" />
                    Assign Role to User
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Module / Feature
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">
                        View
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">
                        Create
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">
                        Edit
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">
                        Delete
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissionMatrix.map((permission, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium text-gray-900">
                          {permission.module}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Switch
                            checked={permission.view}
                            onCheckedChange={() => handlePermissionToggle(index, 'view')}
                            className="data-[state=checked]:bg-green-500"
                          />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Switch
                            checked={permission.create}
                            onCheckedChange={() => handlePermissionToggle(index, 'create')}
                            className="data-[state=checked]:bg-green-500"
                          />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Switch
                            checked={permission.edit}
                            onCheckedChange={() => handlePermissionToggle(index, 'edit')}
                            className="data-[state=checked]:bg-green-500"
                          />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Switch
                            checked={permission.delete}
                            onCheckedChange={() => handlePermissionToggle(index, 'delete')}
                            className="data-[state=checked]:bg-green-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
