"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar,
  User,
  Activity,
  Filter,
  FileText,
  Download,
  Zap,
  Circle
} from "lucide-react";

export default function AuditLogsPage() {
  const [dateRange, setDateRange] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [actionFilter, setActionFilter] = useState("All Actions");

  const auditLogData = [
    {
      timestamp: "2025-07-16 14:30",
      userEmail: "admin@yathrago.com",
      role: "Admin",
      module: "Roles",
      action: "Created new role"
    },
    {
      timestamp: "2025-07-15 09:12",
      userEmail: "driver01@yathrago.com",
      role: "Driver",
      module: "Profile",
      action: "Edited phone #"
    },
    {
      timestamp: "2025-07-14 16:45",
      userEmail: "parent@example.com",
      role: "Parent",
      module: "Booking",
      action: "Created booking"
    },
    {
      timestamp: "2025-07-14 11:30",
      userEmail: "owner@transport.com",
      role: "Owner",
      module: "Vehicle",
      action: "Updated vehicle info"
    },
    {
      timestamp: "2025-07-13 08:15",
      userEmail: "admin@yathrago.com",
      role: "Admin",
      module: "System",
      action: "System backup"
    }
  ];

  const liveActivityData = [
    {
      type: "User Login",
      email: "driver02@yathrago.com",
      time: "just now"
    },
    {
      type: "Route Updated",
      details: "School Route #5",
      time: "2 minutes ago"
    },
    {
      type: "Permission Changed",
      details: "Driver role permissions",
      time: "5 minutes ago"
    },
    {
      type: "New Booking",
      details: "parent@school.edu",
      time: "8 minutes ago"
    },
    {
      type: "Failed Login",
      details: "unknown@example.com",
      time: "12 minutes ago"
    }
  ];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "Admin":
        return <Badge className="bg-blue-100 text-blue-800">{role}</Badge>;
      case "Driver":
        return <Badge className="bg-green-100 text-green-800">{role}</Badge>;
      case "Parent":
        return <Badge className="bg-purple-100 text-purple-800">{role}</Badge>;
      case "Owner":
        return <Badge className="bg-orange-100 text-orange-800">{role}</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "User Login":
        return <Circle className="w-2 h-2 text-green-500 fill-current" />;
      case "Route Updated":
        return <Circle className="w-2 h-2 text-blue-500 fill-current" />;
      case "Permission Changed":
        return <Circle className="w-2 h-2 text-orange-500 fill-current" />;
      case "New Booking":
        return <Circle className="w-2 h-2 text-purple-500 fill-current" />;
      case "Failed Login":
        return <Circle className="w-2 h-2 text-red-500 fill-current" />;
      default:
        return <Circle className="w-2 h-2 text-gray-500 fill-current" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-gray-600">Monitor system activities and user actions</p>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Date Range
          </label>
          <Input
            type="date"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-48"
            placeholder="mm/dd/yyyy"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            <User className="w-4 h-4 mr-2" />
            Role
          </label>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Roles">All Roles</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Driver">Driver</SelectItem>
              <SelectItem value="Parent">Parent</SelectItem>
              <SelectItem value="Owner">Owner</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            <Activity className="w-4 h-4 mr-2" />
            Action Type
          </label>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Actions">All Actions</SelectItem>
              <SelectItem value="Create">Create</SelectItem>
              <SelectItem value="Update">Update</SelectItem>
              <SelectItem value="Delete">Delete</SelectItem>
              <SelectItem value="Login">Login</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button className="bg-blue-600 hover:bg-blue-700">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Audit Log Entries */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Audit Log Entries</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    <FileText className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button variant="outline" size="sm" className="bg-red-50 text-red-700 border-red-200">
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Module</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogData.map((log, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                        <TableCell>{log.userEmail}</TableCell>
                        <TableCell>{getRoleBadge(log.role)}</TableCell>
                        <TableCell>{log.module}</TableCell>
                        <TableCell>{log.action}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-600">Showing 1 to 5 of 47 entries</p>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" className="bg-blue-600 text-white">
                    1
                  </Button>
                  <Button variant="outline" size="sm">
                    2
                  </Button>
                  <Button variant="outline" size="sm">
                    3
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Activity Feed */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span>Live Activity Feed</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {liveActivityData.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.type}</p>
                      {activity.email && (
                        <p className="text-sm text-gray-600">{activity.email}</p>
                      )}
                      {activity.details && (
                        <p className="text-sm text-gray-600">{activity.details}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
