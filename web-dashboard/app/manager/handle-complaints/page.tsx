"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  MessageCircle,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { api } from "@/lib/api";

interface Complaint {
  id: number;
  senderId: number;
  senderUserType: string;
  type: string;
  description: string;
  category: string;
  status: string;
  createdAt: string;
}

export default function HandleComplaintsPageNew() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolution, setResolution] = useState("");

  const itemsPerPage = 10;

  useEffect(() => {
    fetchComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filterStatus, filterCategory]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const response = await api.complaints.getAll({
        status: filterStatus || undefined,
        category: filterCategory || undefined,
        page: currentPage,
        limit: itemsPerPage,
      });

      setComplaints(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      alert("Failed to load complaints. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (complaintId: number, newStatus: string) => {
    try {
      await api.complaints.updateStatus(complaintId, newStatus);
      await fetchComplaints(); // Refresh the list
    } catch (error) {
      alert("Failed to update complaint status");
    }
  };

  const handleResolveComplaint = async () => {
    if (selectedComplaint && resolution.trim()) {
      try {
        await api.complaints.update(selectedComplaint.id, {
          status: "RESOLVED",
          resolution: resolution.trim(),
        });
        setShowResolveModal(false);
        setResolution("");
        setSelectedComplaint(null);
        await fetchComplaints();
      } catch (error) {
        alert("Failed to resolve complaint");
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; icon: typeof Clock }> = {
      PENDING: { bg: "bg-yellow-100", text: "text-yellow-600", icon: Clock },
      IN_PROGRESS: { bg: "bg-blue-100", text: "text-blue-600", icon: MessageCircle },
      RESOLVED: { bg: "bg-green-100", text: "text-green-600", icon: CheckCircle },
    };
    const statusConfig = config[status] || config.PENDING;
    const Icon = statusConfig.icon;

    return (
      <Badge className={`${statusConfig.bg} ${statusConfig.text} border-none`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      SYSTEM: "bg-purple-100 text-purple-600",
      DRIVER: "bg-blue-100 text-blue-600",
      PAYMENT: "bg-green-100 text-green-600",
      OTHER: "bg-gray-100 text-gray-600",
    };
    return (
      <Badge className={`${colors[category] || colors.OTHER} border-none`}>
        {category}
      </Badge>
    );
  };

  const filteredComplaints = complaints.filter((complaint) =>
    complaint.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-deep-navy)] mb-2">
          Handle Complaints & Inquiries
        </h1>
        <p className="text-[var(--neutral-gray)]">
          Manage and resolve customer complaints and inquiries
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: "Total", value: loading ? "..." : complaints.length },
          { title: "Pending", value: loading ? "..." : complaints.filter(c => c.status === "PENDING").length },
          { title: "In Progress", value: loading ? "..." : complaints.filter(c => c.status === "IN_PROGRESS").length },
          { title: "Resolved", value: loading ? "..." : complaints.filter(c => c.status === "RESOLVED").length },
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-[var(--color-deep-navy)]">{stat.value}</p>
                <p className="text-sm text-[var(--neutral-gray)]">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search complaints..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <select
              className="px-4 py-2 border rounded-lg"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>

            {/* Category Filter */}
            <select
              className="px-4 py-2 border rounded-lg"
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Categories</option>
              <option value="SYSTEM">System</option>
              <option value="DRIVER">Driver</option>
              <option value="PAYMENT">Payment</option>
              <option value="OTHER">Other</option>
            </select>

            {/* Refresh */}
            <Button onClick={fetchComplaints} className="w-full">
              <Filter className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Complaints List */}
      <Card>
        <CardHeader>
          <CardTitle>Complaints List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading complaints...</div>
          ) : filteredComplaints.length === 0 ? (
            <div className="text-center py-8 text-[var(--neutral-gray)]">
              No complaints found
            </div>
          ) : (
            <div className="space-y-4">
              {filteredComplaints.map((complaint) => (
                <Card key={complaint.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(complaint.status)}
                          {getCategoryBadge(complaint.category)}
                          <Badge className="bg-gray-100 text-gray-600 border-none">
                            {complaint.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-[var(--color-deep-navy)] mb-2">
                          {complaint.description.substring(0, 200)}
                          {complaint.description.length > 200 && "..."}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-[var(--neutral-gray)]">
                          <span className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {complaint.senderUserType} (ID: {complaint.senderId})
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(complaint.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setShowDetailsModal(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {complaint.status === "PENDING" && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(complaint.id, "IN_PROGRESS")}
                          >
                            Start
                          </Button>
                        )}
                        {complaint.status === "IN_PROGRESS" && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedComplaint(complaint);
                              setShowResolveModal(true);
                            }}
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      {showDetailsModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>Complaint Details</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedComplaint(null);
                  }}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                {getStatusBadge(selectedComplaint.status)}
                {getCategoryBadge(selectedComplaint.category)}
              </div>
              
              <div>
                <strong>Type:</strong> {selectedComplaint.type}
              </div>
              
              <div>
                <strong>Description:</strong>
                <p className="mt-2 text-gray-700">{selectedComplaint.description}</p>
              </div>
              
              <div>
                <strong>Submitted by:</strong> {selectedComplaint.senderUserType} (ID:{" "}
                {selectedComplaint.senderId})
              </div>
              
              <div>
                <strong>Date:</strong>{" "}
                {new Date(selectedComplaint.createdAt).toLocaleString()}
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={() => setShowDetailsModal(false)} variant="outline">
                  Close
                </Button>
                {selectedComplaint.status === "PENDING" && (
                  <Button
                    onClick={async () => {
                      await handleStatusUpdate(selectedComplaint.id, "IN_PROGRESS");
                      setShowDetailsModal(false);
                    }}
                  >
                    Start Working
                  </Button>
                )}
                {selectedComplaint.status !== "RESOLVED" && (
                  <Button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setShowResolveModal(true);
                    }}
                  >
                    Resolve
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Resolve Modal */}
      {showResolveModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg m-4">
            <CardHeader>
              <CardTitle>Resolve Complaint</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Resolution Notes</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={4}
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Enter resolution details..."
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowResolveModal(false);
                    setResolution("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleResolveComplaint}
                  disabled={!resolution.trim()}
                >
                  Resolve Complaint
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
