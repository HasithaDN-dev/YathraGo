"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Phone,
  CreditCard,
  Calendar,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Shield,
  Download,
} from "lucide-react";

interface Driver {
  id: string;
  name: string;
  phoneNumber: string;
  // licenseNo removed
  ownerName: string;
  vehicleAssigned: string;
  submissionDate: string;
  verificationStatus: "pending" | "verified" | "rejected" | "background-check";
  backgroundCheck: {
    criminalRecord: "clear" | "pending" | "flagged";
    employmentHistory: "verified" | "pending" | "incomplete";
    references: "verified" | "pending" | "incomplete";
  };
  documents: {
    license: boolean;
    idProof: boolean;
    addressProof: boolean;
    medicalCertificate: boolean;
  };
  rejectionReason?: string;
}

const mockDrivers: Driver[] = [
  {
    id: "1",
    name: "Ramesh Kumar",
    phoneNumber: "+91-9876543210",
    ownerName: "Rajesh Kumar",
    vehicleAssigned: "KA-01-AB-1234",
    submissionDate: "2025-07-20",
    verificationStatus: "pending",
    backgroundCheck: {
      criminalRecord: "clear",
      employmentHistory: "verified",
      references: "pending",
    },
    documents: {
      license: true,
      idProof: true,
      addressProof: true,
      medicalCertificate: false,
    }
  },
  {
    id: "2",
    name: "Suresh Patil",
    phoneNumber: "+91-9876543211",
    ownerName: "Priya Sharma",
    vehicleAssigned: "KA-02-CD-5678",
    submissionDate: "2025-07-19",
    verificationStatus: "background-check",
    backgroundCheck: {
      criminalRecord: "pending",
      employmentHistory: "verified",
      references: "verified",
    },
    documents: {
      license: true,
      idProof: true,
      addressProof: false,
      medicalCertificate: true,
    }
  },
  {
    id: "3",
    name: "Ganesh Reddy",
    phoneNumber: "+91-9876543212",
    ownerName: "Mohammed Ali",
    vehicleAssigned: "KA-03-EF-9012",
    submissionDate: "2025-07-18",
    verificationStatus: "verified",
    backgroundCheck: {
      criminalRecord: "clear",
      employmentHistory: "verified",
      references: "verified",
    },
    documents: {
      license: true,
      idProof: true,
      addressProof: true,
      medicalCertificate: true,
    }
  },
  {
    id: "4",
    name: "Vijay Singh",
    phoneNumber: "+91-9876543213",
    ownerName: "Sunita Reddy",
    vehicleAssigned: "KA-04-GH-3456",
    submissionDate: "2025-07-17",
    verificationStatus: "rejected",
    backgroundCheck: {
      criminalRecord: "flagged",
      employmentHistory: "incomplete",
      references: "incomplete",
    },
    documents: {
      license: false,
      idProof: true,
      addressProof: true,
      medicalCertificate: false,
    },
    rejectionReason: "Invalid driving license and flagged criminal background check. Please submit valid documents and address background concerns."
  },
];

export default function VerifyDriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>(mockDrivers);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const itemsPerPage = 5;
  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch = 
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phoneNumber.includes(searchTerm) ||
      driver.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "" || driver.verificationStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDrivers = filteredDrivers.slice(startIndex, startIndex + itemsPerPage);

  const handleVerify = (driverId: string) => {
    setDrivers(prev => prev.map(driver => 
      driver.id === driverId 
        ? { ...driver, verificationStatus: "verified" as const }
        : driver
    ));
  };

  const handleReject = (driver: Driver) => {
    setSelectedDriver(driver);
    setShowRejectionModal(true);
  };

  const confirmRejection = () => {
    if (selectedDriver && rejectionReason.trim()) {
      setDrivers(prev => prev.map(driver => 
        driver.id === selectedDriver.id 
          ? { ...driver, verificationStatus: "rejected" as const, rejectionReason: rejectionReason.trim() }
          : driver
      ));
      setShowRejectionModal(false);
      setRejectionReason("");
      setSelectedDriver(null);
    }
  };

  const handleRemoveDriver = (driverId: string) => {
    if (confirm("Are you sure you want to remove this driver from the system?")) {
      setDrivers(prev => prev.filter(driver => driver.id !== driverId));
    }
  };

  const getDocumentCompletionPercentage = (documents: Driver["documents"]) => {
    const total = Object.keys(documents).length;
    const completed = Object.values(documents).filter(Boolean).length;
    return Math.round((completed / total) * 100);
  };

  const getBackgroundCheckStatus = (backgroundCheck: Driver["backgroundCheck"]) => {
    const statuses = Object.values(backgroundCheck);
    if (statuses.includes("flagged")) return "flagged";
    if (statuses.includes("pending")) return "pending";
    return "clear";
  };

  const StatusBadge: React.FC<{ status: Driver["verificationStatus"] }> = ({ status }) => {
    const statusConfig = {
      pending: { bg: "bg-[var(--warm-yellow)]/20", text: "text-[var(--warning-amber)]", icon: Clock },
      "background-check": { bg: "bg-blue-100", text: "text-blue-600", icon: Shield },
      verified: { bg: "bg-[var(--success-bg)]", text: "text-[var(--success-green)]", icon: CheckCircle },
      rejected: { bg: "bg-[var(--error-bg)]", text: "text-[var(--error-red)]", icon: XCircle },
    };

    const config = statusConfig[status];
    const IconComponent = config.icon;

    return (
      <Badge variant="secondary" className={`${config.bg} ${config.text} flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {status === "background-check" ? "Background Check" : status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const BackgroundCheckBadge: React.FC<{ status: "clear" | "pending" | "flagged" | "verified" | "incomplete" }> = ({ status }) => {
    const config = {
      clear: { bg: "bg-[var(--success-bg)]", text: "text-[var(--success-green)]" },
      verified: { bg: "bg-[var(--success-bg)]", text: "text-[var(--success-green)]" },
      pending: { bg: "bg-[var(--warm-yellow)]/20", text: "text-[var(--warning-amber)]" },
      incomplete: { bg: "bg-[var(--warm-yellow)]/20", text: "text-[var(--warning-amber)]" },
      flagged: { bg: "bg-[var(--error-bg)]", text: "text-[var(--error-red)]" },
    };

    return (
      <span className={`px-2 py-1 rounded text-xs ${config[status].bg} ${config[status].text}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-[var(--neutral-gray)] p-6">
        <h1 className="text-2xl font-bold text-[var(--color-deep-navy)]">Driver Verification & Management</h1>
        <p className="text-[var(--neutral-gray)] mt-2">
          Verify driver credentials, conduct background checks, and manage driver records
        </p>
      </div>

      {/* Filters */}
      <Card className="shadow-sm border border-[var(--neutral-gray)]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[var(--color-deep-navy)] flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--neutral-gray)] w-4 h-4" />
              <input
                type="text"
                placeholder="Search driver name, license, phone, or owner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[var(--neutral-gray)] rounded-lg focus:ring-2 focus:ring-[var(--bright-orange)] focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-[var(--neutral-gray)] rounded-lg focus:ring-2 focus:ring-[var(--bright-orange)] focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="background-check">Background Check</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Clear Filters */}
            <Button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
                setCurrentPage(1);
              }}
              variant="outline"
              className="border-[var(--neutral-gray)] text-[var(--neutral-gray)] hover:bg-gray-50"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-[var(--color-deep-navy)] mb-4">
              Reject Driver Application
            </h3>
            <p className="text-sm text-[var(--neutral-gray)] mb-4">
              Driver: {selectedDriver?.name}
            </p>
            <textarea
              placeholder="Please provide a detailed reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-3 border border-[var(--neutral-gray)] rounded-lg focus:ring-2 focus:ring-[var(--bright-orange)] focus:border-transparent mb-4"
              rows={4}
            />
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowRejectionModal(false);
                  setRejectionReason("");
                  setSelectedDriver(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmRejection}
                disabled={!rejectionReason.trim()}
                className="flex-1 bg-[var(--error-red)] hover:bg-red-600 text-white"
              >
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Driver Details Modal */}
      {showDetailsModal && selectedDriver && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-[var(--color-deep-navy)]">
                Driver Details - {selectedDriver.name}
              </h3>
              <Button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedDriver(null);
                }}
                variant="outline"
                size="sm"
              >
                ✕
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div>
                <h4 className="font-semibold text-[var(--color-deep-navy)] mb-3">Personal Information</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Name:</strong> {selectedDriver.name}</div>
                  <div><strong>Phone:</strong> {selectedDriver.phoneNumber}</div>
                  {/* License No removed */}
                {/* License No removed */}
                  <div><strong>Owner:</strong> {selectedDriver.ownerName}</div>
                  <div><strong>Vehicle:</strong> {selectedDriver.vehicleAssigned}</div>
                  <div><strong>Applied:</strong> {new Date(selectedDriver.submissionDate).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Background Check */}
              <div>
                <h4 className="font-semibold text-[var(--color-deep-navy)] mb-3">Background Check</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Criminal Record:</span>
                    <BackgroundCheckBadge status={selectedDriver.backgroundCheck.criminalRecord} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Employment History:</span>
                    <BackgroundCheckBadge status={selectedDriver.backgroundCheck.employmentHistory} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">References:</span>
                    <BackgroundCheckBadge status={selectedDriver.backgroundCheck.references} />
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="md:col-span-2">
                <h4 className="font-semibold text-[var(--color-deep-navy)] mb-3">Documents</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(selectedDriver.documents).map(([doc, status]) => (
                    <div key={doc} className="flex items-center space-x-2 p-2 border rounded">
                      <div className={`w-3 h-3 rounded-full ${status ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm capitalize">{doc.replace(/([A-Z])/g, ' $1')}</span>
                      {status && (
                        <Button size="sm" variant="outline">
                          <Download className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {selectedDriver.rejectionReason && (
              <div className="mt-6 p-4 bg-[var(--error-bg)] rounded-lg">
                <h4 className="font-semibold text-[var(--error-red)] mb-2">Rejection Reason</h4>
                <p className="text-sm text-[var(--error-red)]">{selectedDriver.rejectionReason}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Drivers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-[var(--neutral-gray)]">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-[var(--neutral-gray)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--neutral-gray)] uppercase tracking-wider">
                  Driver Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--neutral-gray)] uppercase tracking-wider">
                  Owner & Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--neutral-gray)] uppercase tracking-wider">
                  Background Check
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--neutral-gray)] uppercase tracking-wider">
                  Documents
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--neutral-gray)] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--neutral-gray)] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[var(--neutral-gray)]">
              {currentDrivers.map((driver) => (
                <tr
                  key={driver.id}
                  className="hover:bg-blue-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-deep-navy)]">
                          {driver.name}
                        </p>
                        <div className="flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-[var(--neutral-gray)]" />
                          <span className="text-xs text-[var(--neutral-gray)]">{driver.phoneNumber}</span>
                        </div>
                        <div className="flex items-center space-x-1 mt-1">
                          <CreditCard className="w-3 h-3 text-[var(--neutral-gray)]" />
                          <span className="text-xs text-[var(--neutral-gray)]">N/A</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-[var(--color-deep-navy)]">
                        {driver.ownerName}
                      </p>
                      <p className="text-xs text-[var(--neutral-gray)]">{driver.vehicleAssigned}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <Calendar className="w-3 h-3 text-[var(--neutral-gray)]" />
                        <span className="text-xs text-[var(--neutral-gray)]">
                          {new Date(driver.submissionDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <BackgroundCheckBadge status={getBackgroundCheckStatus(driver.backgroundCheck)} />
                      <div className="text-xs text-[var(--neutral-gray)] space-y-1">
                        <div>Criminal: {driver.backgroundCheck.criminalRecord}</div>
                        <div>Employment: {driver.backgroundCheck.employmentHistory}</div>
                        <div>References: {driver.backgroundCheck.references}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[var(--color-deep-navy)]">
                          {getDocumentCompletionPercentage(driver.documents)}% Complete
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-[var(--bright-orange)] h-2 rounded-full"
                          style={{ width: `${getDocumentCompletionPercentage(driver.documents)}%` }}
                        ></div>
                      </div>
                      <div className="grid grid-cols-2 gap-1 mt-2">
                        {Object.entries(driver.documents).slice(0, 4).map(([doc, status]) => (
                          <div key={doc} className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${status ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-xs text-[var(--neutral-gray)]">{doc.charAt(0).toUpperCase()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={driver.verificationStatus} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedDriver(driver);
                          setShowDetailsModal(true);
                        }}
                        className="border-blue-500 text-blue-600 hover:bg-blue-50"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      {driver.verificationStatus === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleVerify(driver.id)}
                            className="bg-[var(--success-green)] hover:bg-green-600 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Verify
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleReject(driver)}
                            variant="outline"
                            className="border-[var(--error-red)] text-[var(--error-red)] hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      {driver.verificationStatus === "verified" && (
                        <Button
                          size="sm"
                          onClick={() => handleRemoveDriver(driver.id)}
                          variant="outline"
                          className="border-[var(--error-red)] text-[var(--error-red)] hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-[var(--neutral-gray)]">
            <div className="flex items-center justify-between">
              <div className="text-sm text-[var(--neutral-gray)]">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredDrivers.length)} of{" "}
                {filteredDrivers.length} drivers
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-[var(--neutral-gray)] text-[var(--neutral-gray)] hover:bg-blue-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      currentPage === page
                        ? "bg-[var(--bright-orange)] text-white"
                        : "text-[var(--bright-orange)] hover:bg-[var(--bright-orange)] hover:text-white"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-[var(--neutral-gray)] text-[var(--neutral-gray)] hover:bg-blue-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredDrivers.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-[var(--neutral-gray)] mx-auto mb-4" />
            <p className="text-[var(--neutral-gray)]">No drivers found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
