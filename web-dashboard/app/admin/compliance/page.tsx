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
        return <Badge className="text-white" style={{ backgroundColor: '#10b981' }}>● Compliant</Badge>;
      case "Expired":
        return <Badge className="text-white" style={{ backgroundColor: '#ef4444' }}>● Expired</Badge>;
      case "Expiring Soon":
        return <Badge className="text-white" style={{ backgroundColor: '#f59e0b' }}>● Expiring Soon</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "Data Protection":
        return <Badge className="text-white" style={{ backgroundColor: '#2d4a8a' }}>{category}</Badge>;
      case "Vehicle Safety":
        return <Badge className="text-white" style={{ backgroundColor: '#f59e0b' }}>{category}</Badge>;
      case "Quality Standards":
        return <Badge className="text-white" style={{ backgroundColor: '#ffb425' }}>{category}</Badge>;
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
          <Button variant="outline" size="sm" className="text-white border-2" style={{ color: '#2d4a8a', borderColor: '#2d4a8a' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c0def5'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
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
        <h1 className="text-2xl font-bold" style={{ color: '#143373' }}>Compliance Management</h1>
        <p style={{ color: '#6b7280' }}>Manage regulatory compliance and policy documents</p>
      </div>

      {/* Alert Banner */}
      <Alert className="border-2" style={{ backgroundColor: '#fef3c7', borderColor: '#f59e0b' }}>
        <AlertTriangle className="h-4 w-4" style={{ color: '#f59e0b' }} />
        <AlertDescription style={{ color: '#92400e' }}>
          <strong>⚠️ Alert:</strong> &ldquo;ISO Transport Certification expires in 5 days!&rdquo;
          <br />
          Please review and update your certification documents.
        </AlertDescription>
      </Alert>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: '#6b7280' }} />
          <Input
            placeholder="Search by regulation name or tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm" style={{ color: '#6b7280' }}>Regulation Type</span>
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
          <Button className="text-white" style={{ backgroundColor: '#143373' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2d4a8a'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#143373'}>
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
                <p className="text-sm" style={{ color: '#6b7280' }}>Supported formats: PDF, DOCX</p>
                
                {/* Drag & Drop Area */}
                <div className="border-2 border-dashed rounded-lg p-8 text-center transition-colors" style={{ borderColor: '#d1d5db' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2d4a8a'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#d1d5db'}>
                  <CloudUpload className="w-12 h-12 mx-auto mb-4" style={{ color: '#6b7280' }} />
                  <p className="text-sm mb-2" style={{ color: '#6b7280' }}>Drag & drop files here</p>
                  <p className="text-xs mb-4" style={{ color: '#9ca3af' }}>or</p>
                  <Button variant="outline" className="border-2" style={{ color: '#2d4a8a', borderColor: '#2d4a8a' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c0def5'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    Browse Files
                  </Button>
                </div>

                <Button className="w-full text-white" style={{ backgroundColor: '#ffb425' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#faaa21'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffb425'}>
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
                  <span className="text-sm" style={{ color: '#6b7280' }}>Total Regulations</span>
                  <span className="font-semibold">{complianceStats.totalRegulations}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: '#6b7280' }}>Compliant</span>
                  <span className="font-semibold" style={{ color: '#10b981' }}>{complianceStats.compliant}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: '#6b7280' }}>Expiring Soon</span>
                  <span className="font-semibold" style={{ color: '#f59e0b' }}>{complianceStats.expiringSoon}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: '#6b7280' }}>Expired</span>
                  <span className="font-semibold" style={{ color: '#ef4444' }}>{complianceStats.expired}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
