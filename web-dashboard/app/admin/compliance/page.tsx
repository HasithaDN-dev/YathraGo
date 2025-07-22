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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  Upload, 
  Eye, 
  Edit, 
  FileText,
  CloudUpload
} from "lucide-react";

export default function ComplianceManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [regulationType, setRegulationType] = useState("All Types");

  const complianceData = [
    {
      regulationName: "GDPR",
      category: "Data Protection",
      lastReviewed: "2025-06-20",
      status: "Compliant",
      actions: ["View"]
    },
    {
      regulationName: "Transport Law Act",
      category: "Vehicle Safety",
      lastReviewed: "2025-05-01",
      status: "Expired",
      actions: ["Update"]
    },
    {
      regulationName: "ISO Transport Certification",
      category: "Quality Standards",
      lastReviewed: "2025-01-15",
      status: "Expiring Soon",
      actions: ["View"]
    }
  ];

  const complianceStats = {
    totalRegulations: 12,
    compliant: 8,
    expiringSoon: 2,
    expired: 2
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Compliant":
        return <Badge className="bg-green-100 text-green-800">● Compliant</Badge>;
      case "Expired":
        return <Badge className="bg-red-100 text-red-800">● Expired</Badge>;
      case "Expiring Soon":
        return <Badge className="bg-yellow-100 text-yellow-800">● Expiring Soon</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "Data Protection":
        return <Badge className="bg-blue-100 text-blue-800">{category}</Badge>;
      case "Vehicle Safety":
        return <Badge className="bg-orange-100 text-orange-800">{category}</Badge>;
      case "Quality Standards":
        return <Badge className="bg-purple-100 text-purple-800">{category}</Badge>;
      default:
        return <Badge variant="secondary">{category}</Badge>;
    }
  };

  const getActionButton = (action: string) => {
    switch (action) {
      case "View":
        return (
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
        );
      case "Update":
        return (
          <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50">
            <Edit className="w-4 h-4 mr-1" />
            Update
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Compliance Management</h1>
        <p className="text-gray-600">Manage regulatory compliance and policy documents</p>
      </div>

      {/* Alert Banner */}
      <Alert className="bg-yellow-50 border-yellow-200">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <strong>⚠️ Alert:</strong> &quot;ISO Transport Certification expires in 5 days!&quot;
          <br />
          Please review and update your certification documents.
        </AlertDescription>
      </Alert>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by regulation name or tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Regulation Type</span>
          <Select value={regulationType} onValueChange={setRegulationType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Types">All Types</SelectItem>
              <SelectItem value="Data Protection">Data Protection</SelectItem>
              <SelectItem value="Vehicle Safety">Vehicle Safety</SelectItem>
              <SelectItem value="Quality Standards">Quality Standards</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Overview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Regulation Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Last Reviewed</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {complianceData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.regulationName}</TableCell>
                        <TableCell>{getCategoryBadge(item.category)}</TableCell>
                        <TableCell>{item.lastReviewed}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {item.actions.map((action) => (
                              <span key={action}>
                                {getActionButton(action)}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Upload Policy Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Upload Policy Documents</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Supported formats: PDF, DOCX</p>
                
                {/* Drag & Drop Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                  <CloudUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-2">Drag & drop files here</p>
                  <p className="text-xs text-gray-500 mb-4">or</p>
                  <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                    Browse Files
                  </Button>
                </div>

                <Button className="w-full bg-yellow-500 hover:bg-yellow-600">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Regulations</span>
                  <span className="font-semibold">{complianceStats.totalRegulations}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Compliant</span>
                  <span className="font-semibold text-green-600">{complianceStats.compliant}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Expiring Soon</span>
                  <span className="font-semibold text-yellow-600">{complianceStats.expiringSoon}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Expired</span>
                  <span className="font-semibold text-red-600">{complianceStats.expired}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
