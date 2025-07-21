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
  Car,
  Calendar,
  MapPin,
  User,
  Phone,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Vehicle {
  id: string;
  vehicleNo: string;
  type: string;
  seatingCapacity: number;
  ownerName: string;
  ownerPhone: string;
  location: string;
  submissionDate: string;
  status: "pending" | "approved" | "rejected";
  insuranceExpiry: string;
  documents: {
    registration: boolean;
    insurance: boolean;
    puc: boolean;
    fitnessOne: boolean;
  };
  rejectionReason?: string;
}

const mockVehicles: Vehicle[] = [
  {
    id: "1",
    vehicleNo: "KA-01-AB-1234",
    type: "Bus",
    seatingCapacity: 40,
    ownerName: "Rajesh Kumar",
    ownerPhone: "+91-9876543210",
    location: "Bangalore",
    submissionDate: "2025-07-20",
    status: "pending",
    insuranceExpiry: "2026-03-15",
    documents: {
      registration: true,
      insurance: true,
      puc: true,
      fitnessOne: false,
    }
  },
  {
    id: "2",
    vehicleNo: "KA-02-CD-5678",
    type: "Mini Bus",
    seatingCapacity: 25,
    ownerName: "Priya Sharma",
    ownerPhone: "+91-9876543211",
    location: "Mysore",
    submissionDate: "2025-07-19",
    status: "pending",
    insuranceExpiry: "2025-12-20",
    documents: {
      registration: true,
      insurance: true,
      puc: false,
      fitnessOne: true,
    }
  },
  {
    id: "3",
    vehicleNo: "KA-03-EF-9012",
    type: "Van",
    seatingCapacity: 15,
    ownerName: "Mohammed Ali",
    ownerPhone: "+91-9876543212",
    location: "Hubli",
    submissionDate: "2025-07-18",
    status: "approved",
    insuranceExpiry: "2026-01-10",
    documents: {
      registration: true,
      insurance: true,
      puc: true,
      fitnessOne: true,
    }
  },
  {
    id: "4",
    vehicleNo: "KA-04-GH-3456",
    type: "Bus",
    seatingCapacity: 35,
    ownerName: "Sunita Reddy",
    ownerPhone: "+91-9876543213",
    location: "Mangalore",
    submissionDate: "2025-07-17",
    status: "rejected",
    insuranceExpiry: "2025-08-05",
    documents: {
      registration: true,
      insurance: false,
      puc: true,
      fitnessOne: true,
    },
    rejectionReason: "Insurance document expired. Please submit valid insurance certificate."
  },
];

export default function ApproveVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionModal, setShowRejectionModal] = useState(false);

  const itemsPerPage = 5;
  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch = 
      vehicle.vehicleNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "" || vehicle.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentVehicles = filteredVehicles.slice(startIndex, startIndex + itemsPerPage);

  const handleApprove = (vehicleId: string) => {
    setVehicles(prev => prev.map(vehicle => 
      vehicle.id === vehicleId 
        ? { ...vehicle, status: "approved" as const }
        : vehicle
    ));
  };

  const handleReject = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowRejectionModal(true);
  };

  const confirmRejection = () => {
    if (selectedVehicle && rejectionReason.trim()) {
      setVehicles(prev => prev.map(vehicle => 
        vehicle.id === selectedVehicle.id 
          ? { ...vehicle, status: "rejected" as const, rejectionReason: rejectionReason.trim() }
          : vehicle
      ));
      setShowRejectionModal(false);
      setRejectionReason("");
      setSelectedVehicle(null);
    }
  };

  const getDocumentCompletionPercentage = (documents: Vehicle["documents"]) => {
    const total = Object.keys(documents).length;
    const completed = Object.values(documents).filter(Boolean).length;
    return Math.round((completed / total) * 100);
  };

  const StatusBadge: React.FC<{ status: Vehicle["status"] }> = ({ status }) => {
    const statusConfig = {
      pending: { bg: "bg-[var(--warm-yellow)]/20", text: "text-[var(--warning-amber)]", icon: Clock },
      approved: { bg: "bg-[var(--success-bg)]", text: "text-[var(--success-green)]", icon: CheckCircle },
      rejected: { bg: "bg-[var(--error-bg)]", text: "text-[var(--error-red)]", icon: XCircle },
    };

    const config = statusConfig[status];
    const IconComponent = config.icon;

    return (
      <Badge variant="secondary" className={`${config.bg} ${config.text} flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-[var(--neutral-gray)] p-6">
        <h1 className="text-2xl font-bold text-[var(--color-deep-navy)]">Vehicle Approvals</h1>
        <p className="text-[var(--neutral-gray)] mt-2">
          Review and approve vehicle registration requests from owners
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
                placeholder="Search vehicle no, owner, or location..."
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
              <option value="approved">Approved</option>
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
              Reject Vehicle Application
            </h3>
            <p className="text-sm text-[var(--neutral-gray)] mb-4">
              Vehicle: {selectedVehicle?.vehicleNo}
            </p>
            <textarea
              placeholder="Please provide a reason for rejection..."
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
                  setSelectedVehicle(null);
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

      {/* Vehicles Table */}
      <div className="bg-white rounded-lg shadow-sm border border-[var(--neutral-gray)]">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-[var(--neutral-gray)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--neutral-gray)] uppercase tracking-wider">
                  Vehicle Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--neutral-gray)] uppercase tracking-wider">
                  Owner Information
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
              {currentVehicles.map((vehicle) => (
                <tr
                  key={vehicle.id}
                  className="hover:bg-blue-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-[var(--bright-orange)]/10 rounded-lg">
                        <Car className="w-5 h-5 text-[var(--bright-orange)]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-deep-navy)]">
                          {vehicle.vehicleNo}
                        </p>
                        <p className="text-xs text-[var(--neutral-gray)]">
                          {vehicle.type} • {vehicle.seatingCapacity} seats
                        </p>
                        <div className="flex items-center space-x-1 mt-1">
                          <MapPin className="w-3 h-3 text-[var(--neutral-gray)]" />
                          <span className="text-xs text-[var(--neutral-gray)]">{vehicle.location}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--color-deep-navy)]">
                          {vehicle.ownerName}
                        </p>
                        <div className="flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-[var(--neutral-gray)]" />
                          <span className="text-xs text-[var(--neutral-gray)]">{vehicle.ownerPhone}</span>
                        </div>
                        <div className="flex items-center space-x-1 mt-1">
                          <Calendar className="w-3 h-3 text-[var(--neutral-gray)]" />
                          <span className="text-xs text-[var(--neutral-gray)]">
                            {new Date(vehicle.submissionDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[var(--color-deep-navy)]">
                          {getDocumentCompletionPercentage(vehicle.documents)}% Complete
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-[var(--bright-orange)] h-2 rounded-full"
                          style={{ width: `${getDocumentCompletionPercentage(vehicle.documents)}%` }}
                        ></div>
                      </div>
                      <div className="grid grid-cols-2 gap-1 mt-2">
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${vehicle.documents.registration ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-xs text-[var(--neutral-gray)]">Registration</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${vehicle.documents.insurance ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-xs text-[var(--neutral-gray)]">Insurance</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${vehicle.documents.puc ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-xs text-[var(--neutral-gray)]">PUC</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${vehicle.documents.fitnessOne ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-xs text-[var(--neutral-gray)]">Fitness</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-2">
                      <StatusBadge status={vehicle.status} />
                      {vehicle.status === "rejected" && vehicle.rejectionReason && (
                        <div className="max-w-xs">
                          <p className="text-xs text-[var(--error-red)] bg-[var(--error-bg)] p-2 rounded">
                            {vehicle.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-500 text-blue-600 hover:bg-blue-50"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      {vehicle.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(vehicle.id)}
                            className="bg-[var(--success-green)] hover:bg-green-600 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleReject(vehicle)}
                            variant="outline"
                            className="border-[var(--error-red)] text-[var(--error-red)] hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
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
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredVehicles.length)} of{" "}
                {filteredVehicles.length} vehicles
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
        {filteredVehicles.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-[var(--neutral-gray)] mx-auto mb-4" />
            <p className="text-[var(--neutral-gray)]">No vehicles found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
