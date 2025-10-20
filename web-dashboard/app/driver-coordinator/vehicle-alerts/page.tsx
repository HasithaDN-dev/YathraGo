"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { mockVehicleAlerts, VehicleAlert } from '@/lib/drivers';
import {
  AlertTriangle,
  Search,
  CheckCircle,
  Clock,
  Wrench,
  Car,
  Calendar,
  Phone,
  MapPin,
  User,
  FileText,
  MessageSquare,
  Settings,
  Fuel,
  Battery,
  Shield
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function VehicleAlertsPage() {
  const [alerts, setAlerts] = useState<VehicleAlert[]>(mockVehicleAlerts);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<VehicleAlert | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [selectedTab, setSelectedTab] = useState('active');

  // Filter alerts based on tab and search
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = 
      alert.vehicleRegNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.alertType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === '' || alert.status === filterStatus;
    const matchesSeverity = filterSeverity === '' || alert.severity === filterSeverity;

    let tabMatch = true;
    switch (selectedTab) {
      case 'active':
        tabMatch = alert.status === 'ACTIVE';
        break;
      case 'assigned':
        tabMatch = alert.status === 'ASSIGNED';
        break;
      case 'resolved':
        tabMatch = alert.status === 'RESOLVED';
        break;
    }

    return matchesSearch && matchesStatus && matchesSeverity && tabMatch;
  });

  const handleAssignAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            status: 'ASSIGNED' as const
          }
        : alert
    ));
    setShowAssignModal(false);
    setAssignmentNotes('');
    setSelectedAlert(null);
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            status: 'RESOLVED' as const,
            resolvedAt: new Date().toISOString()
          }
        : alert
    ));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Active</Badge>;
      case 'ASSIGNED':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Assigned</Badge>;
      case 'RESOLVED':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      case 'HIGH':
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case 'MEDIUM':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'LOW':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'BREAKDOWN':
        return <Wrench className="w-6 h-6 text-red-600" />;
      case 'MAINTENANCE':
        return <Settings className="w-6 h-6 text-orange-600" />;
      case 'FUEL':
        return <Fuel className="w-6 h-6 text-blue-600" />;
      case 'BATTERY':
        return <Battery className="w-6 h-6 text-yellow-600" />;
      case 'TIRE':
        return <Car className="w-6 h-6 text-purple-600" />;
      case 'ENGINE':
        return <Wrench className="w-6 h-6 text-red-600" />;
      case 'SAFETY':
        return <Shield className="w-6 h-6 text-green-600" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-gray-600" />;
    }
  };

  const getAlertTypeColor = (alertType: string) => {
    switch (alertType) {
      case 'BREAKDOWN':
        return 'bg-red-100';
      case 'MAINTENANCE':
        return 'bg-orange-100';
      case 'FUEL':
        return 'bg-blue-100';
      case 'BATTERY':
        return 'bg-yellow-100';
      case 'TIRE':
        return 'bg-purple-100';
      case 'ENGINE':
        return 'bg-red-100';
      case 'SAFETY':
        return 'bg-green-100';
      default:
        return 'bg-gray-100';
    }
  };

  const renderAlertCard = (alert: VehicleAlert) => (
    <Card key={alert.id} className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getAlertTypeColor(alert.alertType)}`}>
              {getAlertIcon(alert.alertType)}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{alert.alertType} Alert</h3>
              <p className="text-gray-600">ID: {alert.id}</p>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge(alert.status)}
              {getSeverityBadge(alert.severity)}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Car className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium">{alert.vehicleRegNo}</span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{alert.driverName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-sm">Contact Driver</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{new Date(alert.reportedAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-gray-700 mb-2">{alert.description}</p>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{alert.location}</span>
            </div>
          </div>

          {alert.estimatedDowntime && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Estimated Downtime:</span>
              </div>
              <p className="text-sm text-blue-700">{alert.estimatedDowntime}</p>
            </div>
          )}

          {alert.assignedBackupVehicle && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <FileText className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Backup Assignment:</span>
              </div>
              <p className="text-sm text-green-700">Vehicle: {alert.assignedBackupVehicle}</p>
              {alert.assignedBackupDriver && (
                <p className="text-sm text-green-700">Driver: {alert.assignedBackupDriver}</p>
              )}
            </div>
          )}

          {alert.affectedChildren > 0 && (
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-orange-800">Affected Children:</span>
                <span className="text-lg font-bold text-orange-600">{alert.affectedChildren}</span>
              </div>
              <div className="mt-1">
                <span className="text-xs text-orange-600">Routes: {alert.affectedRoutes.join(', ')}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-2 ml-4">
          {alert.status === 'ACTIVE' && (
            <Button 
              size="sm" 
              onClick={() => {
                setSelectedAlert(alert);
                setShowAssignModal(true);
              }}
              className="flex items-center space-x-1"
            >
              <User className="w-4 h-4" />
              <span>Assign</span>
            </Button>
          )}
          
          {alert.status === 'ASSIGNED' && (
            <Button 
              size="sm" 
              onClick={() => handleResolveAlert(alert.id)}
              className="flex items-center space-x-1"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Mark Resolved</span>
            </Button>
          )}
          
          {alert.status === 'RESOLVED' && (
            <Button 
              size="sm" 
              variant="outline"
              disabled
              className="flex items-center space-x-1"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Resolved</span>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Vehicle Alerts</h1>
        <p className="text-gray-600">Manage vehicle breakdowns and maintenance requests</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Alerts</p>
              <p className="text-3xl font-bold text-yellow-600">
                {alerts.filter(a => a.status === 'ACTIVE').length}
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
              <p className="text-sm text-gray-600 mb-1">Assigned</p>
              <p className="text-3xl font-bold text-blue-600">
                {alerts.filter(a => a.status === 'ASSIGNED').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Resolved</p>
              <p className="text-3xl font-bold text-green-600">
                {alerts.filter(a => a.status === 'RESOLVED').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Critical Alerts</p>
              <p className="text-3xl font-bold text-red-600">
                {alerts.filter(a => a.severity === 'CRITICAL').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search alerts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      {/* Alert Management Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Active ({alerts.filter(a => a.status === 'ACTIVE').length})</span>
          </TabsTrigger>
          <TabsTrigger value="assigned" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Assigned ({alerts.filter(a => a.status === 'ASSIGNED').length})</span>
          </TabsTrigger>
          <TabsTrigger value="resolved" className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>Resolved ({alerts.filter(a => a.status === 'RESOLVED').length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <div className="space-y-4">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map(renderAlertCard)
            ) : (
              <Card className="p-8 text-center">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Alerts</h3>
                <p className="text-gray-600">All alerts have been assigned or resolved.</p>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="assigned" className="mt-6">
          <div className="space-y-4">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map(renderAlertCard)
            ) : (
              <Card className="p-8 text-center">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Assigned Alerts</h3>
                <p className="text-gray-600">No alerts are currently assigned for handling.</p>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="resolved" className="mt-6">
          <div className="space-y-4">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map(renderAlertCard)
            ) : (
              <Card className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Resolved Alerts</h3>
                <p className="text-gray-600">No alerts have been resolved yet.</p>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Assignment Modal */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Alert: {selectedAlert?.alertType} - {selectedAlert?.vehicleRegNo}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Driver: {selectedAlert?.driverName}</p>
              <p className="text-sm text-gray-600 mb-1">Location: {selectedAlert?.location}</p>
              <p className="text-sm text-gray-800">{selectedAlert?.description}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignment Notes:
              </label>
              <Textarea
                placeholder="Add notes for this assignment..."
                value={assignmentNotes}
                onChange={(e) => setAssignmentNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedAlert && handleAssignAlert(selectedAlert.id)}
            >
              Assign to Me
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}