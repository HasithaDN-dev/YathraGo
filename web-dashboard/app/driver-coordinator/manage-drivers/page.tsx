"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { mockDrivers, Driver } from '@/lib/drivers';
import {
  UserCheck,
  UserX,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Phone,
  Mail,
  Car,
  Calendar,
  FileText,
  Search,
  Users,
  UserPlus,
  Clock,
  Shield,
  Image as ImageIcon,
  MapPin,
  CreditCard
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function ManageDriversPage() {
  const [selectedTab, setSelectedTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [drivers, setDrivers] = useState<Driver[]>(mockDrivers);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showSuspensionModal, setShowSuspensionModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [suspensionReason, setSuspensionReason] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<string>('');

  // Filter drivers based on tab and search
  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = 
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.NIC.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone.includes(searchTerm) ||
      driver.vehicle_Reg_No.toLowerCase().includes(searchTerm.toLowerCase());

    switch (selectedTab) {
      case 'pending':
        return matchesSearch && driver.status === 'PENDING';
      case 'active':
        return matchesSearch && driver.status === 'ACTIVE';
      case 'flagged':
        return matchesSearch && driver.status === 'SUSPENDED';
      default:
        return matchesSearch;
    }
  });

  const handleVerifyDriver = (driverId: number, approved: boolean) => {
    setDrivers(prev => prev.map(driver => 
      driver.driver_id === driverId 
        ? { 
            ...driver, 
            status: approved ? 'ACTIVE' : 'INACTIVE',
            verifiedBy: 'Driver Coordinator',
            verifiedAt: new Date().toISOString(),
            verificationNotes: verificationNotes
          }
        : driver
    ));
    setShowVerificationModal(false);
    setVerificationNotes('');
    setSelectedDriver(null);
  };

  const handleSuspendDriver = (driverId: number) => {
    setDrivers(prev => prev.map(driver => 
      driver.driver_id === driverId 
        ? { 
            ...driver, 
            status: 'SUSPENDED',
            suspendedBy: 'Driver Coordinator',
            suspendedAt: new Date().toISOString(),
            suspensionReason: suspensionReason
          }
        : driver
    ));
    setShowSuspensionModal(false);
    setSuspensionReason('');
    setSelectedDriver(null);
  };

  const handleReactivateDriver = (driverId: number) => {
    setDrivers(prev => prev.map(driver => 
      driver.driver_id === driverId 
        ? { 
            ...driver, 
            status: 'ACTIVE',
            suspendedBy: undefined,
            suspendedAt: undefined,
            suspensionReason: undefined
          }
        : driver
    ));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'ACTIVE':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
      case 'SUSPENDED':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Suspended</Badge>;
      case 'INACTIVE':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const openDocumentViewer = (driver: Driver, documentType: string) => {
    setSelectedDriver(driver);
    setSelectedDocument(documentType);
    setShowDocumentModal(true);
  };

  const getDocumentUrl = (driver: Driver, documentType: string) => {
    switch (documentType) {
      case 'profile': return driver.profile_picture_url;
      case 'nic_front': return driver.nic_front_pic_url;
      case 'nic_back': return driver.nice_back_pic_url;
      case 'license_front': return driver.driver_license_front_url;
      case 'license_back': return driver.driver_license_back_url;
      default: return '';
    }
  };

  const renderDriverCard = (driver: Driver) => (
    <Card key={driver.driver_id} className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{driver.name}</h3>
              <p className="text-gray-600">Driver ID: {driver.driver_id}</p>
            </div>
            {getStatusBadge(driver.status)}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{driver.phone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{driver.email || 'N/A'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Car className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{driver.vehicle_Reg_No}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{new Date(driver.date_of_joining).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-gray-400" />
              <span className="text-sm">NIC: {driver.NIC}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{driver.address}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{driver.gender}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm">DOB: {new Date(driver.date_of_birth).toLocaleDateString()}</span>
            </div>
          </div>

          {driver.status === 'SUSPENDED' && driver.suspensionReason && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">Suspension Reason:</span>
              </div>
              <p className="text-sm text-red-700">{driver.suspensionReason}</p>
              {driver.suspendedAt && (
                <p className="text-xs text-red-600 mt-1">
                  Suspended on {new Date(driver.suspendedAt).toLocaleDateString()} by {driver.suspendedBy}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center space-x-4 text-sm">
            <span className="font-medium">Documents:</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openDocumentViewer(driver, 'profile')}
              className="flex items-center space-x-1"
            >
              <ImageIcon className="w-3 h-3" />
              <span>Profile</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openDocumentViewer(driver, 'nic_front')}
              className="flex items-center space-x-1"
            >
              <CreditCard className="w-3 h-3" />
              <span>NIC Front</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openDocumentViewer(driver, 'nic_back')}
              className="flex items-center space-x-1"
            >
              <CreditCard className="w-3 h-3" />
              <span>NIC Back</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openDocumentViewer(driver, 'license_front')}
              className="flex items-center space-x-1"
            >
              <FileText className="w-3 h-3" />
              <span>License Front</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openDocumentViewer(driver, 'license_back')}
              className="flex items-center space-x-1"
            >
              <FileText className="w-3 h-3" />
              <span>License Back</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-col space-y-2 ml-4">
          {driver.status === 'PENDING' && (
            <>
              <Button 
                size="sm" 
                onClick={() => {
                  setSelectedDriver(driver);
                  setShowVerificationModal(true);
                }}
                className="flex items-center space-x-1 text-green-600 border-green-600 hover:bg-green-50"
                variant="outline"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Verify</span>
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setSelectedDriver(driver);
                  setShowVerificationModal(true);
                }}
                className="flex items-center space-x-1 text-red-600 border-red-600 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </Button>
            </>
          )}
          
          {driver.status === 'ACTIVE' && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => {
                setSelectedDriver(driver);
                setShowSuspensionModal(true);
              }}
              className="flex items-center space-x-1 text-red-600 border-red-600 hover:bg-red-50"
            >
              <UserX className="w-4 h-4" />
              <span>Suspend</span>
            </Button>
          )}
          
          {driver.status === 'SUSPENDED' && (
            <Button 
              size="sm" 
              onClick={() => handleReactivateDriver(driver.driver_id)}
              className="flex items-center space-x-1 text-green-600 border-green-600 hover:bg-green-50"
              variant="outline"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Reactivate</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Drivers</h1>
        <p className="text-gray-600">Verify new drivers, monitor active drivers, and handle driver issues</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Verification</p>
              <p className="text-3xl font-bold text-yellow-600">
                {drivers.filter(d => d.status === 'PENDING').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Drivers</p>
              <p className="text-3xl font-bold text-green-600">
                {drivers.filter(d => d.status === 'ACTIVE').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Suspended Drivers</p>
              <p className="text-3xl font-bold text-red-600">
                {drivers.filter(d => d.status === 'SUSPENDED').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <UserX className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Drivers</p>
              <p className="text-3xl font-bold text-blue-600">{drivers.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search drivers by name, NIC, phone, or vehicle registration..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Driver Management Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Pending ({drivers.filter(d => d.status === 'PENDING').length})</span>
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center space-x-2">
            <UserCheck className="w-4 h-4" />
            <span>Active ({drivers.filter(d => d.status === 'ACTIVE').length})</span>
          </TabsTrigger>
          <TabsTrigger value="flagged" className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Flagged ({drivers.filter(d => d.status === 'SUSPENDED').length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <div className="space-y-4">
            {filteredDrivers.length > 0 ? (
              filteredDrivers.map(renderDriverCard)
            ) : (
              <Card className="p-8 text-center">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Drivers</h3>
                <p className="text-gray-600">All driver verification requests have been processed.</p>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <div className="space-y-4">
            {filteredDrivers.length > 0 ? (
              filteredDrivers.map(renderDriverCard)
            ) : (
              <Card className="p-8 text-center">
                <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Drivers</h3>
                <p className="text-gray-600">No active drivers match your search criteria.</p>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="flagged" className="mt-6">
          <div className="space-y-4">
            {filteredDrivers.length > 0 ? (
              filteredDrivers.map(renderDriverCard)
            ) : (
              <Card className="p-8 text-center">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Flagged Drivers</h3>
                <p className="text-gray-600">No drivers are currently suspended or flagged.</p>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Verification Modal */}
      <Dialog open={showVerificationModal} onOpenChange={setShowVerificationModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Driver: {selectedDriver?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to verify this driver? Please add any verification notes below:</p>
            <Textarea
              placeholder="Add verification notes (optional)..."
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVerificationModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50"
              onClick={() => selectedDriver && handleVerifyDriver(selectedDriver.driver_id, false)}
            >
              Reject
            </Button>
            <Button 
              onClick={() => selectedDriver && handleVerifyDriver(selectedDriver.driver_id, true)}
            >
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspension Modal */}
      <Dialog open={showSuspensionModal} onOpenChange={setShowSuspensionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend Driver: {selectedDriver?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Please provide a reason for suspending this driver:</p>
            <Textarea
              placeholder="Suspension reason (required)..."
              value={suspensionReason}
              onChange={(e) => setSuspensionReason(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuspensionModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedDriver && handleSuspendDriver(selectedDriver.driver_id)}
              disabled={!suspensionReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              Suspend Driver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Viewer Modal */}
      <Dialog open={showDocumentModal} onOpenChange={setShowDocumentModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedDriver?.name} - {selectedDocument?.replace('_', ' ').toUpperCase()}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-100 p-4 rounded-lg text-center">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-2">Document Preview</p>
              <p className="text-sm text-gray-500">
                {selectedDriver && selectedDocument ? getDocumentUrl(selectedDriver, selectedDocument) : 'No document available'}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                In a real implementation, this would display the actual image file.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDocumentModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}