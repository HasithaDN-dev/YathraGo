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
import { Cloud, Database, Calendar, Download, RotateCcw } from "lucide-react";

export default function BackupRecoveryPage() {
  const [autoBackup, setAutoBackup] = useState(true);
  const [cloudSync, setCloudSync] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState("Daily");

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Backup & Recovery</h1>
        <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
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
    </div>
  );
}
