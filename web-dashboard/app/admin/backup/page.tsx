"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { Cloud, Database, Calendar, Download, RotateCcw, X, HardDrive, Shield, Clock, CheckCircle, AlertCircle } from "lucide-react";

export default function BackupRecoveryPage() {
  const [autoBackup, setAutoBackup] = useState(true);
  const [cloudSync, setCloudSync] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState("Daily");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [backupForm, setBackupForm] = useState({
    name: "",
    type: "Full",
    compression: true,
    encryption: false,
    cloudUpload: false,
    schedule: "immediate",
    scheduledTime: "",
    includeSystem: true,
    includeUserData: true,
    includeLogs: true,
    includeConfigs: true
  });

  const backupHistory = [
    {
      id: "BCK-001",
      type: "Full",
      dateTime: "2025-07-12 10:30 AM",
      size: "120 MB",
      status: "Success",
      actions: ["Download", "Restore"]
    },
    {
      id: "BCK-002", 
      type: "Incremental",
      dateTime: "2025-07-14 06:00 AM",
      size: "30 MB",
      status: "Failed",
      actions: ["Retry"]
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Success":
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case "Failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "Full":
        return <Badge className="bg-blue-100 text-blue-800">Full</Badge>;
      case "Incremental":
        return <Badge className="bg-purple-100 text-purple-800">Incremental</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getActionButton = (action: string) => {
    switch (action) {
      case "Download":
        return (
          <Button variant="outline" size="sm" className="mr-2">
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
        );
      case "Restore":
        return (
          <Button variant="outline" size="sm">
            <RotateCcw className="w-4 h-4 mr-1" />
            Restore
          </Button>
        );
      case "Retry":
        return (
          <Button variant="outline" size="sm" className="text-orange-600 border-orange-600 hover:bg-orange-50">
            <RotateCcw className="w-4 h-4 mr-1" />
            Retry
          </Button>
        );
      default:
        return null;
    }
  };

  const handleCreateBackup = () => {
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setBackupForm({
      name: "",
      type: "Full",
      compression: true,
      encryption: false,
      cloudUpload: false,
      schedule: "immediate",
      scheduledTime: "",
      includeSystem: true,
      includeUserData: true,
      includeLogs: true,
      includeConfigs: true
    });
  };

  const handleFormChange = (field: string, value: string | boolean) => {
    setBackupForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitBackup = () => {
    // In a real application, this would make an API call
    console.log('Creating backup with settings:', backupForm);
    
    // Simulate backup creation
    alert('Backup creation started! You will be notified when complete.');
    handleCloseModal();
  };

  const getStorageEstimate = () => {
    let baseSize = 50; // Base MB
    if (backupForm.includeSystem) baseSize += 200;
    if (backupForm.includeUserData) baseSize += 500;
    if (backupForm.includeLogs) baseSize += 100;
    if (backupForm.includeConfigs) baseSize += 20;
    
    if (backupForm.compression) baseSize *= 0.6; // 40% compression
    
    return Math.round(baseSize);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Backup & Recovery</h1>
        <Button 
          className="bg-yellow-500 hover:bg-yellow-600 text-white"
          onClick={handleCreateBackup}
        >
          + Create New Backup
        </Button>
      </div>

      {/* Backup Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Backup Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Auto Backup Toggle */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span className="font-medium">Auto Backup</span>
              </div>
              <Switch
                checked={autoBackup}
                onCheckedChange={setAutoBackup}
                className="data-[state=checked]:bg-blue-500"
              />
            </div>

            {/* Cloud Sync Toggle */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Cloud className="w-4 h-4 text-blue-500" />
                <span className="font-medium">Cloud Sync</span>
              </div>
              <Switch
                checked={cloudSync}
                onCheckedChange={setCloudSync}
                className="data-[state=checked]:bg-blue-500"
              />
            </div>

            {/* Backup Frequency */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="font-medium">Backup Frequency</span>
              </div>
              <Select value={backupFrequency} onValueChange={setBackupFrequency}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Backup ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {backupHistory.map((backup) => (
                  <TableRow key={backup.id}>
                    <TableCell className="font-medium">{backup.id}</TableCell>
                    <TableCell>{getTypeBadge(backup.type)}</TableCell>
                    <TableCell>{backup.dateTime}</TableCell>
                    <TableCell>{backup.size}</TableCell>
                    <TableCell>{getStatusBadge(backup.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {backup.actions.map((action) => (
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

      {/* Create Backup Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Create New Backup</h2>
                <p className="text-gray-600">Configure backup settings and options</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleCloseModal}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Basic Settings */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Settings</h3>
                <div className="space-y-4">
                  {/* Backup Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Backup Name
                    </label>
                    <input
                      type="text"
                      value={backupForm.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      placeholder="Enter backup name (e.g., Weekly System Backup)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Backup Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Backup Type
                    </label>
                    <Select value={backupForm.type} onValueChange={(value) => handleFormChange('type', value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full">
                          <div className="flex items-center space-x-2">
                            <HardDrive className="w-4 h-4" />
                            <span>Full Backup - Complete system backup</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Incremental">
                          <div className="flex items-center space-x-2">
                            <Database className="w-4 h-4" />
                            <span>Incremental - Changed files only</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Differential">
                          <div className="flex items-center space-x-2">
                            <Shield className="w-4 h-4" />
                            <span>Differential - Changes since last full backup</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Data Selection */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Data to Include</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <HardDrive className="w-5 h-5 text-blue-500" />
                      <div>
                        <span className="font-medium">System Files</span>
                        <p className="text-sm text-gray-600">Core system files and configurations</p>
                      </div>
                    </div>
                    <Switch
                      checked={backupForm.includeSystem}
                      onCheckedChange={(checked) => handleFormChange('includeSystem', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Database className="w-5 h-5 text-green-500" />
                      <div>
                        <span className="font-medium">User Data</span>
                        <p className="text-sm text-gray-600">Application data and user files</p>
                      </div>
                    </div>
                    <Switch
                      checked={backupForm.includeUserData}
                      onCheckedChange={(checked) => handleFormChange('includeUserData', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="w-5 h-5 text-orange-500" />
                      <div>
                        <span className="font-medium">Log Files</span>
                        <p className="text-sm text-gray-600">System and application logs</p>
                      </div>
                    </div>
                    <Switch
                      checked={backupForm.includeLogs}
                      onCheckedChange={(checked) => handleFormChange('includeLogs', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-purple-500" />
                      <div>
                        <span className="font-medium">Configuration Files</span>
                        <p className="text-sm text-gray-600">Settings and configuration data</p>
                      </div>
                    </div>
                    <Switch
                      checked={backupForm.includeConfigs}
                      onCheckedChange={(checked) => handleFormChange('includeConfigs', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Advanced Options */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Options</h3>
                <div className="space-y-4">
                  {/* Compression */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">Enable Compression</span>
                      <span className="text-sm text-gray-600">Reduce backup size by ~40%</span>
                    </div>
                    <Switch
                      checked={backupForm.compression}
                      onCheckedChange={(checked) => handleFormChange('compression', checked)}
                    />
                  </div>

                  {/* Encryption */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">Enable Encryption</span>
                      <span className="text-sm text-gray-600">Secure backup with AES-256</span>
                    </div>
                    <Switch
                      checked={backupForm.encryption}
                      onCheckedChange={(checked) => handleFormChange('encryption', checked)}
                    />
                  </div>

                  {/* Cloud Upload */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">Upload to Cloud</span>
                      <span className="text-sm text-gray-600">Automatic cloud storage</span>
                    </div>
                    <Switch
                      checked={backupForm.cloudUpload}
                      onCheckedChange={(checked) => handleFormChange('cloudUpload', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      When to run backup
                    </label>
                    <Select value={backupForm.schedule} onValueChange={(value) => handleFormChange('schedule', value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4" />
                            <span>Start Immediately</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="scheduled">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>Schedule for Later</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {backupForm.schedule === 'scheduled' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Scheduled Time
                      </label>
                      <input
                        type="datetime-local"
                        value={backupForm.scheduledTime}
                        onChange={(e) => handleFormChange('scheduledTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Storage Estimate */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <HardDrive className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Estimated Storage</span>
                </div>
                <div className="text-2xl font-bold text-blue-700">
                  ~{getStorageEstimate()} MB
                </div>
                <p className="text-sm text-blue-600 mt-1">
                  Actual size may vary based on data compression and content
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
              <Button variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitBackup}
                className="bg-yellow-500 hover:bg-yellow-600"
                disabled={!backupForm.name.trim()}
              >
                {backupForm.schedule === 'immediate' ? 'Start Backup' : 'Schedule Backup'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
