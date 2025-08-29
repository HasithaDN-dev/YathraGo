"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Settings,
  Bell,
  Shield,
  Mail,
  Database,
  Clock,
  Globe,
  Users,
  Key,
  Smartphone,
  Eye,
  EyeOff,
  Save,
  RefreshCw
} from "lucide-react";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [showPassword, setShowPassword] = useState(false);
  
  // General Settings State
  const [systemName, setSystemName] = useState("YathraGo Transport System");
  const [adminEmail, setAdminEmail] = useState("admin@yathrago.com");
  const [timezone, setTimezone] = useState("UTC+05:30");
  const [language, setLanguage] = useState("English");
  
  // Security Settings State
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [passwordPolicy, setPasswordPolicy] = useState("Strong");
  const [loginAttempts, setLoginAttempts] = useState("5");
  
  // Notification Settings State
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [systemAlerts, setSystemAlerts] = useState(true);
  const [backupNotifications, setBackupNotifications] = useState(true);
  
  // Backup Settings State
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState("Daily");
  const [backupRetention, setBackupRetention] = useState("30");
  const [cloudBackup, setCloudBackup] = useState(false);

  // Admin Profile State
  const [adminName, setAdminName] = useState("Admin User");
  const [adminPhone, setAdminPhone] = useState("+94 77 123 4567");
  const [adminAddress, setAdminAddress] = useState("123 Main Street, Colombo");
  const [adminBio, setAdminBio] = useState("System Administrator");
  const [adminDepartment, setAdminDepartment] = useState("IT Department");
  const [adminJoinDate, setAdminJoinDate] = useState("2023-01-15");
  const [adminRole, setAdminRole] = useState("Super Admin");
  const profileImage = "/api/placeholder/100/100"; // Default profile image

  const settingsTabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "backup", label: "Backup", icon: Database },
    { id: "profile", label: "Edit Profile", icon: Users },
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            System Name
          </label>
          <Input
            value={systemName}
            onChange={(e) => setSystemName(e.target.value)}
            placeholder="Enter system name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Admin Email
          </label>
          <Input
            type="email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            placeholder="Enter admin email"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Globe className="w-4 h-4 inline mr-2" />
            Timezone
          </label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UTC+05:30">UTC+05:30 (Asia/Colombo - Sri Lanka)</SelectItem>
              <SelectItem value="UTC+00:00">UTC+00:00 (GMT)</SelectItem>
              <SelectItem value="UTC+05:00">UTC+05:00 (Asia/Karachi)</SelectItem>
              
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Sinhala">Sinhala (සිංහල)</SelectItem>
              <SelectItem value="Tamil">Tamil (தமிழ்)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <Smartphone className="w-5 h-5 text-gray-600" />
          <div>
            <p className="font-medium">Two-Factor Authentication</p>
            <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
          </div>
        </div>
        <Switch
          checked={twoFactorAuth}
          onCheckedChange={setTwoFactorAuth}
          className="data-[state=checked]:bg-green-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4 inline mr-2" />
            Session Timeout (minutes)
          </label>
          <Input
            type="number"
            value={sessionTimeout}
            onChange={(e) => setSessionTimeout(e.target.value)}
            placeholder="30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password Policy
          </label>
          <Select value={passwordPolicy} onValueChange={setPasswordPolicy}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Basic">Basic (8+ characters)</SelectItem>
              <SelectItem value="Strong">Strong (8+ chars, mixed case, numbers)</SelectItem>
              <SelectItem value="Complex">Complex (12+ chars, symbols required)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Key className="w-4 h-4 inline mr-2" />
            Max Login Attempts
          </label>
          <Input
            type="number"
            value={loginAttempts}
            onChange={(e) => setLoginAttempts(e.target.value)}
            placeholder="5"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Password
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter current password"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-gray-600" />
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-gray-600">Receive notifications via email</p>
            </div>
          </div>
          <Switch
            checked={emailNotifications}
            onCheckedChange={setEmailNotifications}
            className="data-[state=checked]:bg-blue-500"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Smartphone className="w-5 h-5 text-gray-600" />
            <div>
              <p className="font-medium">SMS Notifications</p>
              <p className="text-sm text-gray-600">Receive critical alerts via SMS</p>
            </div>
          </div>
          <Switch
            checked={smsNotifications}
            onCheckedChange={setSmsNotifications}
            className="data-[state=checked]:bg-blue-500"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Bell className="w-5 h-5 text-gray-600" />
            <div>
              <p className="font-medium">System Alerts</p>
              <p className="text-sm text-gray-600">Get notified about system events</p>
            </div>
          </div>
          <Switch
            checked={systemAlerts}
            onCheckedChange={setSystemAlerts}
            className="data-[state=checked]:bg-blue-500"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Database className="w-5 h-5 text-gray-600" />
            <div>
              <p className="font-medium">Backup Notifications</p>
              <p className="text-sm text-gray-600">Receive backup status updates</p>
            </div>
          </div>
          <Switch
            checked={backupNotifications}
            onCheckedChange={setBackupNotifications}
            className="data-[state=checked]:bg-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderBackupSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-5 h-5 text-gray-600" />
          <div>
            <p className="font-medium">Automatic Backup</p>
            <p className="text-sm text-gray-600">Enable scheduled automatic backups</p>
          </div>
        </div>
        <Switch
          checked={autoBackup}
          onCheckedChange={setAutoBackup}
          className="data-[state=checked]:bg-green-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Backup Frequency
          </label>
          <Select value={backupFrequency} onValueChange={setBackupFrequency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Hourly">Hourly</SelectItem>
              <SelectItem value="Daily">Daily</SelectItem>
              <SelectItem value="Weekly">Weekly</SelectItem>
              <SelectItem value="Monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Backup Retention (days)
          </label>
          <Input
            type="number"
            value={backupRetention}
            onChange={(e) => setBackupRetention(e.target.value)}
            placeholder="30"
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <Globe className="w-5 h-5 text-gray-600" />
          <div>
            <p className="font-medium">Cloud Backup</p>
            <p className="text-sm text-gray-600">Store backups in cloud storage</p>
          </div>
        </div>
        <Switch
          checked={cloudBackup}
          onCheckedChange={setCloudBackup}
          className="data-[state=checked]:bg-green-500"
        />
      </div>
    </div>
  );

  const renderEditProfile = () => (
    <div className="space-y-6">
      {/* Profile Picture Section */}
      <div className="flex items-center space-x-6">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
          {profileImage ? (
            <Image 
              src={profileImage} 
              alt="Profile" 
              width={80}
              height={80}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <Users className="w-10 h-10 text-gray-400" />
          )}
        </div>
        <div>
          <Button variant="outline" size="sm">
            Change Photo
          </Button>
          <p className="text-sm text-gray-600 mt-1">
            JPG, PNG or GIF. Max size of 800KB
          </p>
        </div>
      </div>

      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <Input
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              placeholder="Enter full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <Input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="Enter email address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <Input
              type="tel"
              value={adminPhone}
              onChange={(e) => setAdminPhone(e.target.value)}
              placeholder="Enter phone number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <Select value={adminDepartment} onValueChange={setAdminDepartment}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IT Department">IT Department</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Management">Management</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Address Information</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <Input
            value={adminAddress}
            onChange={(e) => setAdminAddress(e.target.value)}
            placeholder="Enter address"
          />
        </div>
      </div>

      {/* Professional Information */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Professional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <Select value={adminRole} onValueChange={setAdminRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Super Admin">Super Admin</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Supervisor">Supervisor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Join Date
            </label>
            <Input
              type="date"
              value={adminJoinDate}
              onChange={(e) => setAdminJoinDate(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            value={adminBio}
            onChange={(e) => setAdminBio(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter a brief bio"
          />
        </div>
      </div>

      {/* Account Statistics */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Account Statistics</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">2</p>
              <p className="text-sm text-gray-600">Years Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">847</p>
              <p className="text-sm text-gray-600">Login Sessions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">156</p>
              <p className="text-sm text-gray-600">Actions Performed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">98%</p>
              <p className="text-sm text-gray-600">System Uptime</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return renderGeneralSettings();
      case "security":
        return renderSecuritySettings();
      case "notifications":
        return renderNotificationSettings();
      case "backup":
        return renderBackupSettings();
      case "profile":
        return renderEditProfile();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your system settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {settingsTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border-2 border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {settingsTabs.find(tab => tab.id === activeTab)?.icon && (
                  <span className="text-blue-600">
                    {React.createElement(settingsTabs.find(tab => tab.id === activeTab)!.icon, { className: "w-5 h-5" })}
                  </span>
                )}
                <span>{settingsTabs.find(tab => tab.id === activeTab)?.label}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderTabContent()}
              
              {/* Save Button */}
              <div className="mt-8 flex justify-end space-x-4">
                <Button variant="outline">
                  Cancel
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
