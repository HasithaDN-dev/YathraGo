"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Megaphone,
  Plus,
  Eye,
  Edit,
  Trash2,
  Send,
  Users,
  Car,
  Building,
  AlertTriangle,
  Info,
  CheckCircle,
  Calendar,
  Clock,
  Search,
} from "lucide-react";

interface Notice {
  id: string;
  title: string;
  content: string;
  type: "general" | "safety" | "maintenance" | "policy" | "emergency";
  priority: "low" | "medium" | "high" | "critical";
  targetAudience: ("owners" | "drivers" | "schools")[];
  status: "draft" | "published" | "scheduled";
  createdDate: string;
  publishDate?: string;
  scheduledDate?: string;
  views: number;
  acknowledgments: number;
}

const mockNotices: Notice[] = [
  {
    id: "1",
    title: "Monthly Safety Inspection Reminder",
    content: "All fleet owners are reminded to conduct monthly safety inspections of their vehicles. Please ensure all safety equipment is functional and documentation is up to date.",
    type: "safety",
    priority: "high",
    targetAudience: ["owners", "drivers"],
    status: "published",
    createdDate: "2025-07-20",
    publishDate: "2025-07-20",
    views: 245,
    acknowledgments: 198,
  },
  {
    id: "2",
    title: "New Route Optimization System Launch",
    content: "We are excited to announce the launch of our new AI-powered route optimization system. This will help reduce fuel costs and improve efficiency. Training sessions will be scheduled next week.",
    type: "general",
    priority: "medium",
    targetAudience: ["owners", "drivers", "schools"],
    status: "published",
    createdDate: "2025-07-19",
    publishDate: "2025-07-19",
    views: 312,
    acknowledgments: 287,
  },
  {
    id: "3",
    title: "Emergency Contact Update Required",
    content: "All drivers must update their emergency contact information in the system by July 30th. This is mandatory for safety compliance and insurance purposes.",
    type: "emergency",
    priority: "critical",
    targetAudience: ["drivers"],
    status: "published",
    createdDate: "2025-07-18",
    publishDate: "2025-07-18",
    views: 156,
    acknowledgments: 142,
  },
  {
    id: "4",
    title: "Updated Commission Structure",
    content: "The platform commission structure will be updated starting August 1st, 2025. Please review the attached document for details on the new pricing model.",
    type: "policy",
    priority: "high",
    targetAudience: ["owners"],
    status: "draft",
    createdDate: "2025-07-21",
    views: 0,
    acknowledgments: 0,
  },
];

export default function PublishNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>(mockNotices);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState<Notice | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [newNotice, setNewNotice] = useState<Partial<Notice>>({
    title: "",
    content: "",
    type: "general",
    priority: "medium",
    targetAudience: [],
    status: "draft",
  });

  const filteredNotices = notices.filter(notice => {
    const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notice.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "" || notice.status === filterStatus;
    const matchesType = filterType === "" || notice.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleCreateNotice = () => {
    if (!newNotice.title || !newNotice.content || !newNotice.targetAudience?.length) {
      alert("Please fill all required fields");
      return;
    }

    const notice: Notice = {
      ...newNotice,
      id: Date.now().toString(),
      createdDate: new Date().toISOString().split('T')[0],
      views: 0,
      acknowledgments: 0,
    } as Notice;

    setNotices(prev => [notice, ...prev]);
    setNewNotice({
      title: "",
      content: "",
      type: "general",
      priority: "medium",
      targetAudience: [],
      status: "draft",
    });
    setShowCreateModal(false);
  };

  const handlePublishNotice = (noticeId: string) => {
    setNotices(prev => prev.map(notice => 
      notice.id === noticeId 
        ? { ...notice, status: "published" as const, publishDate: new Date().toISOString().split('T')[0] }
        : notice
    ));
  };

  const handleDeleteNotice = (noticeId: string) => {
    if (confirm("Are you sure you want to delete this notice?")) {
      setNotices(prev => prev.filter(notice => notice.id !== noticeId));
    }
  };

  const handleAudienceChange = (audience: "owners" | "drivers" | "schools", checked: boolean) => {
    setNewNotice(prev => ({
      ...prev,
      targetAudience: checked 
        ? [...(prev.targetAudience || []), audience]
        : (prev.targetAudience || []).filter(a => a !== audience)
    }));
  };

  const getTypeIcon = (type: Notice["type"]) => {
    const icons = {
      general: Info,
      safety: AlertTriangle,
      maintenance: Car,
      policy: Building,
      emergency: Megaphone,
    };
    return icons[type];
  };

  const getPriorityColor = (priority: Notice["priority"]) => {
    const colors = {
      low: "bg-gray-100 text-gray-600",
      medium: "bg-blue-100 text-blue-600",
      high: "bg-[var(--warm-yellow)]/20 text-[var(--warning-amber)]",
      critical: "bg-[var(--error-bg)] text-[var(--error-red)]",
    };
    return colors[priority];
  };

  const getStatusBadge = (status: Notice["status"]) => {
    const config = {
      draft: { bg: "bg-gray-100", text: "text-gray-600", icon: Edit },
      published: { bg: "bg-[var(--success-bg)]", text: "text-[var(--success-green)]", icon: CheckCircle },
      scheduled: { bg: "bg-blue-100", text: "text-blue-600", icon: Clock },
    };

    const statusConfig = config[status];
    const IconComponent = statusConfig.icon;

    return (
      <Badge variant="secondary" className={`${statusConfig.bg} ${statusConfig.text} flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getAudienceIcons = (audience: Notice["targetAudience"]) => {
    const icons = {
      owners: { icon: Users, color: "text-blue-600" },
      drivers: { icon: Car, color: "text-green-600" },
      schools: { icon: Building, color: "text-purple-600" },
    };

    return audience.map(a => {
      const IconComponent = icons[a].icon;
      return (
        <div key={a} className={`p-1 rounded ${icons[a].color}`}>
          <IconComponent className="w-4 h-4" />
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-[var(--neutral-gray)] p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-deep-navy)]">Publish Notices</h1>
            <p className="text-[var(--neutral-gray)] mt-2">
              Create and manage system-wide notices for owners, drivers, and schools
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-[var(--bright-orange)] hover:bg-[var(--warm-yellow)] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Notice
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-sm border border-[var(--neutral-gray)]">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--neutral-gray)] w-4 h-4" />
              <input
                type="text"
                placeholder="Search notices..."
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
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
            </select>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-[var(--neutral-gray)] rounded-lg focus:ring-2 focus:ring-[var(--bright-orange)] focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="general">General</option>
              <option value="safety">Safety</option>
              <option value="maintenance">Maintenance</option>
              <option value="policy">Policy</option>
              <option value="emergency">Emergency</option>
            </select>

            {/* Clear Filters */}
            <Button
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("");
                setFilterType("");
              }}
              variant="outline"
              className="border-[var(--neutral-gray)] text-[var(--neutral-gray)] hover:bg-gray-50"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create Notice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-[var(--color-deep-navy)] mb-6">Create New Notice</h3>
            
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-deep-navy)] mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter notice title..."
                  className="w-full px-3 py-2 border border-[var(--neutral-gray)] rounded-lg focus:ring-2 focus:ring-[var(--bright-orange)] focus:border-transparent"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-deep-navy)] mb-2">
                  Content *
                </label>
                <textarea
                  value={newNotice.content}
                  onChange={(e) => setNewNotice(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter notice content..."
                  rows={6}
                  className="w-full px-3 py-2 border border-[var(--neutral-gray)] rounded-lg focus:ring-2 focus:ring-[var(--bright-orange)] focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-deep-navy)] mb-2">
                    Type
                  </label>
                  <select
                    value={newNotice.type}
                    onChange={(e) => setNewNotice(prev => ({ ...prev, type: e.target.value as Notice["type"] }))}
                    className="w-full px-3 py-2 border border-[var(--neutral-gray)] rounded-lg focus:ring-2 focus:ring-[var(--bright-orange)] focus:border-transparent"
                  >
                    <option value="general">General</option>
                    <option value="safety">Safety</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="policy">Policy</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-deep-navy)] mb-2">
                    Priority
                  </label>
                  <select
                    value={newNotice.priority}
                    onChange={(e) => setNewNotice(prev => ({ ...prev, priority: e.target.value as Notice["priority"] }))}
                    className="w-full px-3 py-2 border border-[var(--neutral-gray)] rounded-lg focus:ring-2 focus:ring-[var(--bright-orange)] focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-deep-navy)] mb-2">
                  Target Audience *
                </label>
                <div className="flex flex-wrap gap-4">
                  {[
                    { key: "owners", label: "Fleet Owners", icon: Users },
                    { key: "drivers", label: "Drivers", icon: Car },
                    { key: "schools", label: "Schools", icon: Building },
                  ].map(({ key, label, icon: IconComponent }) => (
                    <label key={key} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newNotice.targetAudience?.includes(key as "owners" | "drivers" | "schools") || false}
                        onChange={(e) => handleAudienceChange(key as "owners" | "drivers" | "schools", e.target.checked)}
                        className="rounded"
                      />
                      <IconComponent className="w-4 h-4 text-[var(--neutral-gray)]" />
                      <span className="text-sm text-[var(--color-deep-navy)]">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowCreateModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateNotice}
                className="flex-1 bg-[var(--bright-orange)] hover:bg-[var(--warm-yellow)] text-white"
              >
                Create Notice
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Notice Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-semibold text-[var(--color-deep-navy)]">
                {showViewModal.title}
              </h3>
              <Button
                onClick={() => setShowViewModal(null)}
                variant="outline"
                size="sm"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className={getPriorityColor(showViewModal.priority)}>
                  {showViewModal.priority.toUpperCase()} Priority
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {showViewModal.type}
                </Badge>
                {getStatusBadge(showViewModal.status)}
              </div>

              <div>
                <h4 className="font-medium text-[var(--color-deep-navy)] mb-2">Content:</h4>
                <p className="text-sm text-[var(--neutral-gray)] leading-relaxed">
                  {showViewModal.content}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-[var(--color-deep-navy)] mb-2">Target Audience:</h4>
                <div className="flex space-x-2">
                  {getAudienceIcons(showViewModal.targetAudience)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-[var(--color-deep-navy)]">Created:</span>
                  <span className="ml-2 text-[var(--neutral-gray)]">
                    {new Date(showViewModal.createdDate).toLocaleDateString()}
                  </span>
                </div>
                {showViewModal.publishDate && (
                  <div>
                    <span className="font-medium text-[var(--color-deep-navy)]">Published:</span>
                    <span className="ml-2 text-[var(--neutral-gray)]">
                      {new Date(showViewModal.publishDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-[var(--color-deep-navy)]">Views:</span>
                  <span className="ml-2 text-[var(--neutral-gray)]">{showViewModal.views}</span>
                </div>
                <div>
                  <span className="font-medium text-[var(--color-deep-navy)]">Acknowledgments:</span>
                  <span className="ml-2 text-[var(--neutral-gray)]">{showViewModal.acknowledgments}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notices List */}
      <div className="space-y-4">
        {filteredNotices.map((notice) => {
          const TypeIcon = getTypeIcon(notice.type);
          return (
            <Card key={notice.id} className="shadow-sm border border-[var(--neutral-gray)]">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 bg-[var(--bright-orange)]/10 rounded-lg">
                        <TypeIcon className="w-5 h-5 text-[var(--bright-orange)]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--color-deep-navy)]">
                          {notice.title}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getPriorityColor(notice.priority)}>
                            {notice.priority.toUpperCase()}
                          </Badge>
                          {getStatusBadge(notice.status)}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-[var(--neutral-gray)] mb-3 line-clamp-2">
                      {notice.content}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4 text-[var(--neutral-gray)]" />
                          <span className="text-xs text-[var(--neutral-gray)]">
                            {new Date(notice.createdDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4 text-[var(--neutral-gray)]" />
                          <span className="text-xs text-[var(--neutral-gray)]">{notice.views} views</span>
                        </div>
                        <div className="flex space-x-1">
                          {getAudienceIcons(notice.targetAudience)}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowViewModal(notice)}
                          className="border-blue-500 text-blue-600 hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        {notice.status === "draft" && (
                          <Button
                            size="sm"
                            onClick={() => handlePublishNotice(notice.id)}
                            className="bg-[var(--success-green)] hover:bg-green-600 text-white"
                          >
                            <Send className="w-4 h-4 mr-1" />
                            Publish
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteNotice(notice.id)}
                          className="border-[var(--error-red)] text-[var(--error-red)] hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredNotices.length === 0 && (
        <Card className="shadow-sm border border-[var(--neutral-gray)]">
          <CardContent className="text-center py-12">
            <Megaphone className="w-12 h-12 text-[var(--neutral-gray)] mx-auto mb-4" />
            <p className="text-[var(--neutral-gray)]">No notices found matching your criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
