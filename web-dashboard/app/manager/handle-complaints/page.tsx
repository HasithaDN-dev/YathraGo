"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MessageSquare,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Star,
  MessageCircle,
  Building,
} from "lucide-react";

interface Complaint {
  id: string;
  subject: string;
  description: string;
  category: "service" | "safety" | "billing" | "driver" | "vehicle" | "app" | "other";
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in-progress" | "resolved" | "closed";
  complainantType: "parent" | "school" | "driver" | "owner";
  complainantName: string;
  complainantContact: string;
  schoolName?: string;
  vehicleNo?: string;
  driverName?: string;
  submissionDate: string;
  responseDate?: string;
  resolution?: string;
  assignedTo?: string;
  rating?: number;
  feedback?: string;
}

const mockComplaints: Complaint[] = [
  {
    id: "1",
    subject: "Driver arrived 15 minutes late consistently",
    description: "My child's school bus has been arriving 15 minutes late for the past week. This is causing issues with school attendance. Please address this urgently.",
    category: "service",
    priority: "high",
    status: "in-progress",
    complainantType: "parent",
    complainantName: "Priya Sharma",
    complainantContact: "+91-9876543210",
    schoolName: "Greenwood Elementary",
    vehicleNo: "KA-01-AB-1234",
    driverName: "Ramesh Kumar",
    submissionDate: "2025-07-20",
    assignedTo: "Manager - South Zone",
  },
  {
    id: "2",
    subject: "Vehicle cleanliness issues",
    description: "The bus interior is not being cleaned properly. Seats are dusty and floor has debris. Please ensure daily cleaning is maintained.",
    category: "vehicle",
    priority: "medium",
    status: "resolved",
    complainantType: "school",
    complainantName: "Mrs. Sunitha (Principal)",
    complainantContact: "principal@riverside.edu",
    schoolName: "Riverside High School",
    vehicleNo: "KA-02-CD-5678",
    submissionDate: "2025-07-18",
    responseDate: "2025-07-19",
    resolution: "Vehicle cleaning protocol has been updated and additional cleaning supplies provided to the driver. Daily inspection will be conducted.",
    assignedTo: "Fleet Maintenance Team",
    rating: 4,
    feedback: "Quick response and effective solution. Thank you.",
  },
  {
    id: "3",
    subject: "Payment discrepancy in monthly bill",
    description: "There's an extra charge of Rs 500 in this month's billing that wasn't explained. Please clarify the billing breakdown.",
    category: "billing",
    priority: "medium",
    status: "open",
    complainantType: "owner",
    complainantName: "Mohammed Ali",
    complainantContact: "+91-9876543212",
    submissionDate: "2025-07-21",
  },
  {
    id: "4",
    subject: "App not showing real-time location",
    description: "The mobile app hasn't been showing real-time bus location for the past 3 days. Parents are unable to track their children's bus.",
    category: "app",
    priority: "critical",
    status: "in-progress",
    complainantType: "school",
    complainantName: "IT Admin - Oak Valley",
    complainantContact: "admin@oakvalley.edu",
    schoolName: "Oak Valley Middle School",
    submissionDate: "2025-07-20",
    assignedTo: "Technical Team",
  },
];

export default function HandleComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>(mockComplaints);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolution, setResolution] = useState("");

  const itemsPerPage = 5;
  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch = 
      complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.complainantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "" || complaint.status === filterStatus;
    const matchesCategory = filterCategory === "" || complaint.category === filterCategory;
    const matchesPriority = filterPriority === "" || complaint.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentComplaints = filteredComplaints.slice(startIndex, startIndex + itemsPerPage);

  const handleStatusUpdate = (complaintId: string, newStatus: Complaint["status"]) => {
    setComplaints(prev => prev.map(complaint => 
      complaint.id === complaintId 
        ? { ...complaint, status: newStatus, assignedTo: newStatus === "in-progress" ? "Current Manager" : complaint.assignedTo }
        : complaint
    ));
  };

  const handleResolveComplaint = () => {
    if (selectedComplaint && resolution.trim()) {
      setComplaints(prev => prev.map(complaint => 
        complaint.id === selectedComplaint.id 
          ? { 
              ...complaint, 
              status: "resolved" as const, 
              resolution: resolution.trim(),
              responseDate: new Date().toISOString().split('T')[0]
            }
          : complaint
      ));
      setShowResolveModal(false);
      setResolution("");
      setSelectedComplaint(null);
    }
  };

  const getPriorityColor = (priority: Complaint["priority"]) => {
    const colors = {
      low: "bg-gray-100 text-gray-600",
      medium: "bg-blue-100 text-blue-600", 
      high: "bg-[var(--warm-yellow)]/20 text-[var(--warning-amber)]",
      critical: "bg-[var(--error-bg)] text-[var(--error-red)]",
    };
    return colors[priority];
  };

  const getStatusBadge = (status: Complaint["status"]) => {
    const config = {
      open: { bg: "bg-[var(--warm-yellow)]/20", text: "text-[var(--warning-amber)]", icon: Clock },
      "in-progress": { bg: "bg-blue-100", text: "text-blue-600", icon: MessageCircle },
      resolved: { bg: "bg-[var(--success-bg)]", text: "text-[var(--success-green)]", icon: CheckCircle },
      closed: { bg: "bg-gray-100", text: "text-gray-600", icon: CheckCircle },
    };

    const statusConfig = config[status];
    const IconComponent = statusConfig.icon;

    return (
      <Badge variant="secondary" className={`${statusConfig.bg} ${statusConfig.text} flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {status === "in-progress" ? "In Progress" : status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getCategoryIcon = (category: Complaint["category"]) => {
    const icons = {
      service: Clock,
      safety: AlertTriangle,
      billing: MessageSquare,
      driver: User,
      vehicle: MessageSquare,
      app: MessageSquare,
      other: MessageSquare,
    };
    return icons[category];
  };

  const getComplainantTypeIcon = (type: Complaint["complainantType"]) => {
    const icons = {
      parent: User,
      school: Building,
      driver: User,
      owner: User,
    };
    return icons[type];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-[var(--neutral-gray)] p-6">
        <h1 className="text-2xl font-bold text-[var(--color-deep-navy)]">Handle Complaints</h1>
        <p className="text-[var(--neutral-gray)] mt-2">
          Manage and resolve customer complaints across the platform
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: "Total Complaints", value: complaints.length, color: "bg-blue-100 text-blue-600" },
          { title: "Open", value: complaints.filter(c => c.status === "open").length, color: "bg-[var(--warm-yellow)]/20 text-[var(--warning-amber)]" },
          { title: "In Progress", value: complaints.filter(c => c.status === "in-progress").length, color: "bg-blue-100 text-blue-600" },
          { title: "Resolved", value: complaints.filter(c => c.status === "resolved").length, color: "bg-[var(--success-bg)] text-[var(--success-green)]" },
        ].map((stat, index) => (
          <Card key={index} className="shadow-sm border border-[var(--neutral-gray)]">
            <CardContent className="p-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${stat.color.split(' ')[1]}`}>
                  {stat.value}
                </div>
                <p className="text-sm text-[var(--neutral-gray)]">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--neutral-gray)] w-4 h-4" />
              <input
                type="text"
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[var(--neutral-gray)] rounded-lg focus:ring-2 focus:ring-[var(--bright-orange)] focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-[var(--neutral-gray)] rounded-lg focus:ring-2 focus:ring-[var(--bright-orange)] focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-[var(--neutral-gray)] rounded-lg focus:ring-2 focus:ring-[var(--bright-orange)] focus:border-transparent"
            >
              <option value="">All Categories</option>
              <option value="service">Service</option>
              <option value="safety">Safety</option>
              <option value="billing">Billing</option>
              <option value="driver">Driver</option>
              <option value="vehicle">Vehicle</option>
              <option value="app">App/Technical</option>
              <option value="other">Other</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-[var(--neutral-gray)] rounded-lg focus:ring-2 focus:ring-[var(--bright-orange)] focus:border-transparent"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>

            {/* Clear Filters */}
            <Button
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("");
                setFilterCategory("");
                setFilterPriority("");
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

      {/* Resolve Complaint Modal */}
      {showResolveModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-[var(--color-deep-navy)] mb-4">
              Resolve Complaint
            </h3>
            <p className="text-sm text-[var(--neutral-gray)] mb-4">
              Complaint: {selectedComplaint.subject}
            </p>
            <textarea
              placeholder="Please provide resolution details..."
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="w-full p-3 border border-[var(--neutral-gray)] rounded-lg focus:ring-2 focus:ring-[var(--bright-orange)] focus:border-transparent mb-4"
              rows={4}
            />
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowResolveModal(false);
                  setResolution("");
                  setSelectedComplaint(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleResolveComplaint}
                disabled={!resolution.trim()}
                className="flex-1 bg-[var(--success-green)] hover:bg-green-600 text-white"
              >
                Mark Resolved
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Complaint Details Modal */}
      {showDetailsModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-semibold text-[var(--color-deep-navy)]">
                Complaint Details
              </h3>
              <Button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedComplaint(null);
                }}
                variant="outline"
                size="sm"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-[var(--color-deep-navy)] mb-2">{selectedComplaint.subject}</h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge className={getPriorityColor(selectedComplaint.priority)}>
                    {selectedComplaint.priority.toUpperCase()} Priority
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {selectedComplaint.category}
                  </Badge>
                  {getStatusBadge(selectedComplaint.status)}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-[var(--color-deep-navy)] mb-2">Description:</h4>
                <p className="text-sm text-[var(--neutral-gray)] leading-relaxed">
                  {selectedComplaint.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-[var(--color-deep-navy)] mb-2">Complainant Details:</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Name:</strong> {selectedComplaint.complainantName}</div>
                    <div><strong>Type:</strong> {selectedComplaint.complainantType}</div>
                    <div><strong>Contact:</strong> {selectedComplaint.complainantContact}</div>
                    {selectedComplaint.schoolName && (
                      <div><strong>School:</strong> {selectedComplaint.schoolName}</div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-[var(--color-deep-navy)] mb-2">Service Details:</h4>
                  <div className="space-y-1 text-sm">
                    {selectedComplaint.vehicleNo && (
                      <div><strong>Vehicle:</strong> {selectedComplaint.vehicleNo}</div>
                    )}
                    {selectedComplaint.driverName && (
                      <div><strong>Driver:</strong> {selectedComplaint.driverName}</div>
                    )}
                    <div><strong>Submitted:</strong> {new Date(selectedComplaint.submissionDate).toLocaleDateString()}</div>
                    {selectedComplaint.assignedTo && (
                      <div><strong>Assigned to:</strong> {selectedComplaint.assignedTo}</div>
                    )}
                  </div>
                </div>
              </div>

              {selectedComplaint.resolution && (
                <div>
                  <h4 className="font-medium text-[var(--color-deep-navy)] mb-2">Resolution:</h4>
                  <p className="text-sm text-[var(--neutral-gray)] leading-relaxed bg-[var(--success-bg)] p-3 rounded">
                    {selectedComplaint.resolution}
                  </p>
                  {selectedComplaint.responseDate && (
                    <p className="text-xs text-[var(--neutral-gray)] mt-2">
                      Resolved on: {new Date(selectedComplaint.responseDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              {selectedComplaint.rating && (
                <div>
                  <h4 className="font-medium text-[var(--color-deep-navy)] mb-2">Feedback:</h4>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < selectedComplaint.rating!
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-[var(--neutral-gray)]">
                      {selectedComplaint.rating}/5
                    </span>
                  </div>
                  {selectedComplaint.feedback && (
                    <p className="text-sm text-[var(--neutral-gray)] italic">
                      &ldquo;{selectedComplaint.feedback}&rdquo;
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Complaints Table */}
      <div className="bg-white rounded-lg shadow-sm border border-[var(--neutral-gray)]">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-[var(--neutral-gray)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--neutral-gray)] uppercase tracking-wider">
                  Complaint Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--neutral-gray)] uppercase tracking-wider">
                  Complainant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--neutral-gray)] uppercase tracking-wider">
                  Category & Priority
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
              {currentComplaints.map((complaint) => {
                const CategoryIcon = getCategoryIcon(complaint.category);
                const ComplainantIcon = getComplainantTypeIcon(complaint.complainantType);
                
                return (
                  <tr
                    key={complaint.id}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-[var(--bright-orange)]/10 rounded-lg">
                          <CategoryIcon className="w-4 h-4 text-[var(--bright-orange)]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[var(--color-deep-navy)] line-clamp-1">
                            {complaint.subject}
                          </p>
                          <p className="text-xs text-[var(--neutral-gray)] line-clamp-2 mt-1">
                            {complaint.description}
                          </p>
                          <div className="flex items-center space-x-1 mt-2">
                            <Calendar className="w-3 h-3 text-[var(--neutral-gray)]" />
                            <span className="text-xs text-[var(--neutral-gray)]">
                              {new Date(complaint.submissionDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="p-1 bg-blue-100 rounded">
                          <ComplainantIcon className="w-3 h-3 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--color-deep-navy)]">
                            {complaint.complainantName}
                          </p>
                          <p className="text-xs text-[var(--neutral-gray)] capitalize">
                            {complaint.complainantType}
                          </p>
                          {complaint.complainantContact.includes('@') ? (
                            <div className="flex items-center space-x-1">
                              <Mail className="w-3 h-3 text-[var(--neutral-gray)]" />
                              <span className="text-xs text-[var(--neutral-gray)]">Email</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1">
                              <Phone className="w-3 h-3 text-[var(--neutral-gray)]" />
                              <span className="text-xs text-[var(--neutral-gray)]">Phone</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        <Badge variant="outline" className="capitalize text-xs">
                          {complaint.category}
                        </Badge>
                        <Badge className={`${getPriorityColor(complaint.priority)} text-xs`}>
                          {complaint.priority.toUpperCase()}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        {getStatusBadge(complaint.status)}
                        {complaint.assignedTo && (
                          <p className="text-xs text-[var(--neutral-gray)]">
                            Assigned: {complaint.assignedTo}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setShowDetailsModal(true);
                          }}
                          className="border-blue-500 text-blue-600 hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        {complaint.status === "open" && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(complaint.id, "in-progress")}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Take Action
                          </Button>
                        )}
                        {complaint.status === "in-progress" && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedComplaint(complaint);
                              setShowResolveModal(true);
                            }}
                            className="bg-[var(--success-green)] hover:bg-green-600 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Resolve
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-[var(--neutral-gray)]">
            <div className="flex items-center justify-between">
              <div className="text-sm text-[var(--neutral-gray)]">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredComplaints.length)} of{" "}
                {filteredComplaints.length} complaints
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
        {filteredComplaints.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-[var(--neutral-gray)] mx-auto mb-4" />
            <p className="text-[var(--neutral-gray)]">No complaints found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
