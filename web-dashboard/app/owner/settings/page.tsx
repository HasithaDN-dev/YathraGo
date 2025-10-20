"use client";

import React, { useEffect, useState } from "react";
import { useOwner } from "@/components/owner/OwnerContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  Bell,
  Shield,
  Settings as SettingsIcon,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  Phone,
  Mail,
  Lock,
  Globe,
  Clock,
  Smartphone,
} from "lucide-react";

import Cookies from "js-cookie";

type TabType = "profile" | "notifications" | "security" | "preferences";

interface ProfileData {
  username: string;
  email: string;
  phone: string;
  address: string;
}

interface NotificationSettings {
  appNotifications: boolean;
  smsAlerts: boolean;
  emailSummaries: boolean;
}

interface SecuritySettings {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorEnabled: boolean;
}

interface PreferenceSettings {
  defaultView: string;
  timeFormat: string;
  notificationLanguage: string;
}

export default function SettingsPage() {

  const { refreshOwner } = useOwner();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = Cookies.get("access_token");
      ////if (!token) return;
      try {
        const response = await fetch("http://localhost:3000/owner/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) return;
        const data = await response.json();
        // prefer username; fall back to first/last if available
        const usernameFromResponse = data.username || data.user_name || data.username || (data.firstName || data.first_name ? `${data.firstName || data.first_name}${data.lastName ? ' ' + data.lastName : ''}` : "");

        setProfileData({
          username: usernameFromResponse || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
        });
      } catch (err) {
        // handle error
        }
    };
    fetchUserData();
  }, []);
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Profile state
  const [profileData, setProfileData] = useState<ProfileData>({
    username: "",
    email: "",
    phone: "",
    address: "",
  });
  const [profileErrors, setProfileErrors] = useState<Partial<ProfileData>>({});

  // Notifications state
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    appNotifications: true,
    smsAlerts: false,
    emailSummaries: true,
  });

  // Security state
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
  });
  const [securityErrors, setSecurityErrors] = useState<Partial<SecuritySettings>>({});

  // Preferences state
  const [preferenceSettings, setPreferenceSettings] = useState<PreferenceSettings>({
    defaultView: "dashboard",
    timeFormat: "12-hour",
    notificationLanguage: "english",
  });

  const tabs = [
    { id: "profile" as TabType, label: "Profile", icon: User },
    { id: "notifications" as TabType, label: "Notifications", icon: Bell },
    { id: "security" as TabType, label: "Security", icon: Shield },
    { id: "preferences" as TabType, label: "Preferences", icon: SettingsIcon },
  ];

  const validateProfile = (): boolean => {
    const errors: Partial<ProfileData> = {};
    if (!profileData.username.trim()) {
      errors.username = "Username is required";
    }
    if (!profileData.address.trim()) {
      errors.address = "Address is required";
    }

    if (!profileData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!profileData.phone.trim()) {
      errors.phone = "Phone number is required";
    }

    // companyName removed

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSecurity = (): boolean => {
    const errors: Partial<SecuritySettings> = {};

    if (!securitySettings.currentPassword) {
      errors.currentPassword = "Current password is required";
    }

    if (!securitySettings.newPassword) {
      errors.newPassword = "New password is required";
    } else if (securitySettings.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    }

    if (!securitySettings.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setSecurityErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) return;

    try {
      const token = Cookies.get("access_token");
      const response = await fetch("http://localhost:3000/owner/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
      if (!response.ok) throw new Error("Failed to update profile");
      // Prefer backend as source of truth: try to use response body, otherwise refresh
      try {
        let respJson = null;
        try {
          respJson = await response.json();
        } catch {}

        // Prefer backend as source of truth. Refresh owner context if response contains user info or as a fallback.
        if (respJson) {
          try { await refreshOwner(); } catch {}
        } else {
          try { await refreshOwner(); } catch {}
        }
      } catch {
        // noop
      }
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      }
  };

  const handleSaveSecurity = async () => {
    if (!validateSecurity()) return;

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSecuritySettings({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        twoFactorEnabled: securitySettings.twoFactorEnabled,
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      }
  };

  const handleToggleNotification = (key: keyof NotificationSettings) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const Toggle: React.FC<{
    checked: boolean;
    onChange: () => void;
    label: string;
    description?: string;
  }> = ({ checked, onChange, label, description }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div>
        <h4 className="font-medium text-gray-900">{label}</h4>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-green-600" : "bg-gray-300"
          }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"
            }`}
        />
      </button>
    </div>
  );

  const renderProfileTab = () => (
    <Card className="shadow-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <User className="w-5 h-5" />
          Profile Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Username */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={profileData.username}
                onChange={(e) =>
                  setProfileData((prev) => ({ ...prev, username: e.target.value }))
                }
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${profileErrors.username ? "border-red-500 bg-red-50" : "border-gray-400"
                  }`}
              />
            </div>
            {profileErrors.username && (
              <p className="mt-1 text-sm text-red-600">{profileErrors.username}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                value={profileData.email}
                onChange={(e) =>
                  setProfileData((prev) => ({ ...prev, email: e.target.value }))
                }
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${profileErrors.email ? "border-red-500 bg-red-50" : "border-gray-400"
                  }`}
              />
            </div>
            {profileErrors.email && (
              <p className="mt-1 text-sm text-red-600">{profileErrors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData((prev) => ({ ...prev, phone: e.target.value }))
                }
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${profileErrors.phone ? "border-red-500 bg-red-50" : "border-gray-400"
                  }`}
              />
            </div>
            {profileErrors.phone && (
              <p className="mt-1 text-sm text-red-600">{profileErrors.phone}</p>
            )}
          </div>

          {/* Company Name removed */}

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <input
              type="text"
              value={profileData.address}
              onChange={(e) =>
                setProfileData((prev) => ({ ...prev, address: e.target.value }))
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${profileErrors.address ? "border-red-500 bg-red-50" : "border-gray-400"
                }`}
            />
            {profileErrors.address && (
              <p className="mt-1 text-sm text-red-600">{profileErrors.address}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSaveProfile}
            className="bg-orange-500 hover:bg-orange-600 text-black font-medium"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderNotificationsTab = () => (
    <Card className="shadow-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Preferences
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Manage how you receive notifications and alerts
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Toggle
          checked={notificationSettings.appNotifications}
          onChange={() => handleToggleNotification("appNotifications")}
          label="App Notifications"
          description="Receive push notifications in the web application"
        />

        <Toggle
          checked={notificationSettings.smsAlerts}
          onChange={() => handleToggleNotification("smsAlerts")}
          label="SMS Alerts"
          description="Get important alerts via text message"
        />

        <Toggle
          checked={notificationSettings.emailSummaries}
          onChange={() => handleToggleNotification("emailSummaries")}
          label="Email Summaries"
          description="Receive daily/weekly summary emails"
        />
      </CardContent>
    </Card>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      {/* Change Password */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword.current ? "text" : "password"}
                  value={securitySettings.currentPassword}
                  onChange={(e) =>
                    setSecuritySettings((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${securityErrors.currentPassword ? "border-red-500 bg-red-50" : "border-gray-400"
                    }`}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => ({ ...prev, current: !prev.current }))
                  }
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {securityErrors.currentPassword && (
                <p className="mt-1 text-sm text-red-600">{securityErrors.currentPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword.new ? "text" : "password"}
                  value={securitySettings.newPassword}
                  onChange={(e) =>
                    setSecuritySettings((prev) => ({ ...prev, newPassword: e.target.value }))
                  }
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${securityErrors.newPassword ? "border-red-500 bg-red-50" : "border-gray-400"
                    }`}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => ({ ...prev, new: !prev.new }))
                  }
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {securityErrors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{securityErrors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword.confirm ? "text" : "password"}
                  value={securitySettings.confirmPassword}
                  onChange={(e) =>
                    setSecuritySettings((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${securityErrors.confirmPassword ? "border-red-500 bg-red-50" : "border-gray-400"
                    }`}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => ({ ...prev, confirm: !prev.confirm }))
                  }
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {securityErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{securityErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSaveSecurity}
              className="bg-orange-500 hover:bg-orange-600 text-black font-medium"
            >
              <Save className="w-4 h-4 mr-2" />
              Update Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div>
                <h4 className="font-medium text-gray-900">Enable 2FA</h4>
                <p className="text-sm text-gray-600">
                  Add an extra layer of security to your account
                </p>
              </div>
              {securitySettings.twoFactorEnabled && (
                <Badge className="bg-green-100 text-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Enabled
                </Badge>
              )}
            </div>
            <button
              onClick={() =>
                setSecuritySettings((prev) => ({
                  ...prev,
                  twoFactorEnabled: !prev.twoFactorEnabled,
                }))
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${securitySettings.twoFactorEnabled ? "bg-green-600" : "bg-gray-300"
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${securitySettings.twoFactorEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPreferencesTab = () => (
    <Card className="shadow-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5" />
          Application Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Default View */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default View Option
            </label>
            <select
              value={preferenceSettings.defaultView}
              onChange={(e) =>
                setPreferenceSettings((prev) => ({ ...prev, defaultView: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="dashboard">Dashboard</option>
              <option value="vehicle-list">Vehicle List</option>
              <option value="payment-history">Payment History</option>
            </select>
          </div>

          {/* Time Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Time Format
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={preferenceSettings.timeFormat}
                onChange={(e) =>
                  setPreferenceSettings((prev) => ({ ...prev, timeFormat: e.target.value }))
                }
                className="w-full pl-10 pr-3 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="12-hour">12-hour (AM/PM)</option>
                <option value="24-hour">24-hour</option>
              </select>
            </div>
          </div>

          {/* Notification Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notification Language
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={preferenceSettings.notificationLanguage}
                onChange={(e) =>
                  setPreferenceSettings((prev) => ({
                    ...prev,
                    notificationLanguage: e.target.value,
                  }))
                }
                className="w-full pl-10 pr-3 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
                <option value="german">German</option>
              </select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your account and fleet preferences
        </p>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-100 border border-green-200 text-green-600 px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Settings saved successfully!</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "profile" && renderProfileTab()}
          {activeTab === "notifications" && renderNotificationsTab()}
          {activeTab === "security" && renderSecurityTab()}
          {activeTab === "preferences" && renderPreferencesTab()}
        </div>
      </div>
    </div>
  );
}
