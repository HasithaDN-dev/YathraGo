"use client";

import React, { useState } from "react";
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Phone,
  User,
  Car,
  Shield,
  Info,
} from "lucide-react";

interface FormData {
  name: string;
  phoneNumber: string;
  secondPhone?: string;
  email?: string;
  address?: string;
  dateOfBirth?: string;
  nic?: string;
  assignedVehicle: string;
  vehicle_Reg_No?: string;
  id_front?: File | null;
  id_back?: File | null;
  license_front?: File | null;
  license_back?: File | null;
  profile_picture?: File | null;
  backgroundVerificationStatus: "verified" | "pending" | "failed" | "not-started";
}

interface FormErrors {
  name?: string;
  phoneNumber?: string;
  secondPhone?: string;
  email?: string;
  address?: string;
  dateOfBirth?: string;
  nic?: string;
  // licenseNo removed per request
  assignedVehicle?: string;
  id_front?: string;
  id_back?: string;
  license_front?: string;
  license_back?: string;
  profile_picture?: string;
}

export default function AddDriverPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phoneNumber: "",
    secondPhone: "",
    email: "",
    address: "",
    dateOfBirth: "",
    nic: "",
  // licenseNo removed per request
    assignedVehicle: "",
    id_front: null,
    id_back: null,
    license_front: null,
    license_back: null,
    profile_picture: null,
    backgroundVerificationStatus: "not-started",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragOverField, setDragOverField] = useState<string | null>(null);
  const [profilePreviewUrl, setProfilePreviewUrl] = useState<string | null>(null);

  // Mock available vehicles
  const availableVehicles = [
    { value: "", label: "Unassigned / Select Vehicle (optional)" },
  ];

  // Real vehicles will be fetched from the backend; keep availableVehicles as initial placeholder
  const [vehicles, setVehicles] = useState<Array<{ value: string; label: string }>>(availableVehicles);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [vehiclesError, setVehiclesError] = useState<string | null>(null);

  // Change this if the backend endpoint differs
  // Backend provides vehicles at GET /vehicles (controller uses @Get('vehicles') with no prefix)
  const VEHICLES_ENDPOINT = "http://localhost:3000/vehicles";

  React.useEffect(() => {
    let mounted = true;
    setVehiclesLoading(true);
    setVehiclesError(null);
    (async () => {
      try {
        // Attach auth header from cookie if present (frontend stores access_token cookie)
        const token = typeof document !== 'undefined' ? document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1] : undefined;
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await fetch(VEHICLES_ENDPOINT, { credentials: 'include', headers });
        if (!res.ok) {
          if (res.status === 401) throw new Error('Unauthorized (401) - please login as owner');
          throw new Error(`Failed to load vehicles: ${res.status}`);
        }
        const data: unknown = await res.json();
        if (!mounted) return;
        const opts = Array.isArray(data) ? data.map((v) => {
          const vehicle = v as Record<string, unknown>;
          const value = String(vehicle['registrationNumber'] ?? vehicle['reg_no'] ?? vehicle['id'] ?? vehicle['_id'] ?? '');
          const label = vehicle['registrationNumber'] ? `${String(vehicle['registrationNumber'])} - ${String(vehicle['type'] ?? vehicle['model'] ?? '')}` : (String(vehicle['label'] ?? value));
          return { value, label };
        }) : [];
        setVehicles([{ value: "", label: "Unassigned / Select Vehicle (optional)" }, ...opts]);
      } catch (err: unknown) {
        if (!mounted) return;
        setVehiclesError(String((err as Error).message ?? err));
      } finally {
        if (mounted) setVehiclesLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Driver name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters long";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      newErrors.name = "Name should only contain letters and spaces";
    }

    // Phone number validation - Sri Lanka only (+94) format
    const slPhoneNormalized = formData.phoneNumber.replace(/\s/g, "");
    if (!slPhoneNormalized) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\+94\d{9}$/.test(slPhoneNormalized)) {
      newErrors.phoneNumber = "Please enter a Sri Lanka phone number in the format +94XXXXXXXXX";
    }

    // License number removed; no validation needed

    // NIC validation (simple: required and length)
    if (!formData.nic || !formData.nic.trim()) {
      newErrors.nic = "NIC is required";
    } else if (formData.nic.trim().length < 5) {
      newErrors.nic = "NIC must be at least 5 characters";
    }

    // DOB validation
    if (!formData.dateOfBirth || !formData.dateOfBirth.trim()) {
      newErrors.dateOfBirth = "Date of birth is required";
    }

    // secondPhone validation (optional) - Sri Lanka +94 format
    if (formData.secondPhone && formData.secondPhone.trim()) {
      const s = formData.secondPhone.replace(/\s/g, "");
      if (!/^\+94\d{9}$/.test(s)) {
        newErrors.secondPhone = "Please enter a Sri Lanka phone number in the format +94XXXXXXXXX";
      }
    }

    // Email required and basic format validation
    if (!formData.email || !formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address";
      }
    }

  // Assign vehicle is optional (owner can leave driver unassigned)

    // File upload validation
    if (!formData.id_front) {
      newErrors.id_front = "ID front picture is required";
    }
    if (!formData.id_back) {
      newErrors.id_back = "ID back picture is required";
    }
    if (!formData.license_front) {
      newErrors.license_front = "License front picture is required";
    }
    if (!formData.license_back) {
      newErrors.license_back = "License back picture is required";
    }
  // Profile picture optional but if present validate type/size already done at upload

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileUpload = (field: keyof FormData, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // File type validation - only accept images for driver documents
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({ 
        ...prev, 
        [field]: 'Please upload a valid image or PDF file'
      }));
      return;
    }
    
    // File size validation (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ 
        ...prev, 
        [field]: 'File size must be less than 5MB'
      }));
      return;
    }

    // If uploading profile picture, manage preview object URL (revoke previous)
    if (field === 'profile_picture') {
      try {
        if (profilePreviewUrl) {
          URL.revokeObjectURL(profilePreviewUrl);
        }
      } catch {}
      try {
        const url = URL.createObjectURL(file);
        setProfilePreviewUrl(url);
      } catch {}
    }

    setFormData((prev) => ({
      ...prev,
      [field]: file,
    }));

    // Clear file upload error
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // helper to display image preview url for profile picture
  // (profilePreviewUrl state is used for profile image preview)

  const removeFile = (field: keyof FormData) => {
    // if removing profile picture, revoke the object URL preview if present
    if (field === 'profile_picture') {
      try {
        if (profilePreviewUrl) {
          URL.revokeObjectURL(profilePreviewUrl);
        }
      } catch {}
      setProfilePreviewUrl(null);
    }

    setFormData((prev) => ({
      ...prev,
      [field]: null,
    }));
  };

  const handleDragOver = (e: React.DragEvent, field: string) => {
    e.preventDefault();
    setDragOverField(field);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverField(null);
  };

  const handleDrop = (e: React.DragEvent, field: keyof FormData) => {
    e.preventDefault();
    setDragOverField(null);
    handleFileUpload(field, e.dataTransfer.files);
  };

  const startBackgroundVerification = () => {
    setFormData((prev) => ({ ...prev, backgroundVerificationStatus: "pending" }));
    
    // Simulate background verification process
    setTimeout(() => {
      const statuses: ("verified" | "failed")[] = ["verified", "failed"];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      setFormData((prev) => ({ ...prev, backgroundVerificationStatus: randomStatus }));
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("phoneNumber", formData.phoneNumber);
      if (formData.secondPhone) formDataToSend.append("secondPhone", formData.secondPhone);
      if (formData.email) formDataToSend.append("email", formData.email);
      if (formData.address) formDataToSend.append("address", formData.address);
      if (formData.dateOfBirth) formDataToSend.append("dateOfBirth", formData.dateOfBirth);
      if (formData.nic) formDataToSend.append("NIC", formData.nic);
  // also send backend-friendly field names
  if (formData.dateOfBirth) formDataToSend.append("date_of_birth", formData.dateOfBirth);
  if (formData.secondPhone) formDataToSend.append("second_phone", formData.secondPhone);
  // licenseNo removed; not included in payload
      formDataToSend.append("assignedVehicle", formData.assignedVehicle);
      // Map assignedVehicle to vehicle_Reg_No if needed by backend
      if (formData.assignedVehicle) formDataToSend.append("vehicle_Reg_No", formData.assignedVehicle);
      if (formData.profile_picture) formDataToSend.append("profile_picture", formData.profile_picture);
      formDataToSend.append("backgroundVerificationStatus", formData.backgroundVerificationStatus);
      
  if (formData.id_front) formDataToSend.append("id_front", formData.id_front);
  if (formData.id_back) formDataToSend.append("id_back", formData.id_back);
  if (formData.license_front) formDataToSend.append("license_front", formData.license_front);
  if (formData.license_back) formDataToSend.append("license_back", formData.license_back);

      // API call
      const token = typeof document !== 'undefined' ? document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1] : undefined;
      const response = await fetch("http://localhost:3000/owner/add-driver", {
        method: "POST",
        body: formDataToSend,
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      if (!response.ok) {
        let msg = "Failed to add driver";
        try {
          const data = await response.json();
          msg = data.message || JSON.stringify(data);
        } catch {
          // fallback to text
          try {
            msg = await response.text();
          } catch {}
        }
        setErrorMessage(msg);
        throw new Error(msg);
      }
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      
      // Reset form
      try { if (profilePreviewUrl) URL.revokeObjectURL(profilePreviewUrl); } catch {}
      setProfilePreviewUrl(null);

      setFormData({
        name: "",
        phoneNumber: "",
        secondPhone: "",
        email: "",
        address: "",
        dateOfBirth: "",
        nic: "",
        // licenseNo removed
        assignedVehicle: "",
        id_front: null,
        id_back: null,
        license_front: null,
        license_back: null,
        profile_picture: null,
        backgroundVerificationStatus: "not-started",
      });
    } catch (error) {
      console.error("Error adding driver:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    try { if (profilePreviewUrl) URL.revokeObjectURL(profilePreviewUrl); } catch {}
    setProfilePreviewUrl(null);

    setFormData({
      name: "",
      phoneNumber: "",
      secondPhone: "",
      email: "",
      address: "",
      dateOfBirth: "",
      nic: "",
      // licenseNo removed
      assignedVehicle: "",
      id_front: null,
      id_back: null,
      license_front: null,
      license_back: null,
      profile_picture: null,
      backgroundVerificationStatus: "not-started",
    });
    setErrors({});
  };

  const VerificationBadge = () => {
    const badgeConfig = {
      verified: { bg: "bg-green-100", text: "text-green-600", icon: CheckCircle, label: "Verified" },
      pending: { bg: "bg-yellow-100", text: "text-yellow-600", icon: Clock, label: "Pending" },
      failed: { bg: "bg-red-100", text: "text-red-600", icon: AlertCircle, label: "Failed" },
      "not-started": { bg: "bg-gray-100", text: "text-gray-600", icon: Clock, label: "Not Started" },
    };

    const config = badgeConfig[formData.backgroundVerificationStatus];
    const IconComponent = config.icon;

    return (
      <Badge variant="secondary" className={`${config.bg} ${config.text} flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Add Driver</h1>
        <p className="text-gray-600 mt-2">
          Register a new driver to your fleet
        </p>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-100 border border-green-200 text-green-600 px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Driver added successfully!</span>
            <button
              onClick={() => setShowSuccess(false)}
              className="text-green-600 hover:text-green-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 flex items-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span className="block sm:inline font-medium">{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-700 hover:text-red-900 focus:outline-none">&times;</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Driver Form */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5" />
              Driver Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* NIC */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NIC *
                </label>
                <input
                  type="text"
                  placeholder="Enter NIC"
                  value={formData.nic}
                  onChange={(e) => handleInputChange("nic", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.nic ? "border-red-500 bg-red-50" : "border-gray-400"}`}
                />
                {errors.nic && (
                  <div className="mt-1 flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.nic}</span>
                  </div>
                )}
              </div>
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter driver's full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? "border-red-500 bg-red-50" : "border-gray-400"
                  }`}
                />
                <p className="mt-1 text-xs text-gray-600 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Enter first and last name as it appears on official documents
                </p>
                {errors.name && (
                  <div className="mt-1 flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.name}</span>
                  </div>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                      type="tel"
                      placeholder="+94XXXXXXXXX"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.phoneNumber ? "border-red-500 bg-red-50" : "border-gray-400"
                    }`}
                  />
                </div>
                  <p className="mt-1 text-xs text-gray-600 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Country code required: use Sri Lanka prefix +94 (example +94771234567)
                  </p>
                {errors.phoneNumber && (
                  <div className="mt-1 flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.phoneNumber}</span>
                  </div>
                )}
              </div>

              {/* Second Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Second Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    placeholder="Optional: +94XXXXXXXXX"
                    value={formData.secondPhone}
                    onChange={(e) => handleInputChange("secondPhone", e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.secondPhone ? "border-red-500 bg-red-50" : "border-gray-400"}`}
                  />
                </div>
                {errors.secondPhone && <div className="mt-1 text-red-600 text-sm">{errors.secondPhone}</div>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  placeholder="driver@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? "border-red-500 bg-red-50" : "border-gray-400"}`}
                />
                {errors.email && <div className="mt-1 text-red-600 text-sm">{errors.email}</div>}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.dateOfBirth ? "border-red-500 bg-red-50" : "border-gray-400"}`}
                />
                {errors.dateOfBirth && <div className="mt-1 text-red-600 text-sm">{errors.dateOfBirth}</div>}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  placeholder="Driver's address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.address ? "border-red-500 bg-red-50" : "border-gray-400"}`}
                />
              </div>

              {/* License number removed per request */}

              {/* Assign to Vehicle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign to Vehicle (optional)
                </label>
                <div className="relative">
                  <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={formData.assignedVehicle}
                    onChange={(e) => handleInputChange("assignedVehicle", e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.assignedVehicle ? "border-red-500 bg-red-50" : "border-gray-400"
                    }`}
                  >
                    {vehiclesLoading ? (
                      <option value="">Loading vehicles...</option>
                    ) : vehiclesError ? (
                      <option value="">Failed to load vehicles</option>
                    ) : (
                      vehicles.map((vehicle) => (
                        <option key={vehicle.value} value={vehicle.value}>
                          {vehicle.label}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <p className="mt-1 text-xs text-gray-600 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Driver will be assigned as primary operator for this vehicle when selected. Leaving it blank keeps the driver unassigned.
                </p>
                {vehiclesError && (
                  <div className="mt-1 flex items-center space-x-1 text-yellow-700 bg-yellow-50 px-2 py-1 rounded text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{vehiclesError}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Background Verification Section */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Background Verification
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Verify driver credentials and background for safety compliance
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Verification Status</h4>
                <p className="text-sm text-gray-600">
                  {formData.backgroundVerificationStatus === "not-started" && "Click to start background verification process"}
                  {formData.backgroundVerificationStatus === "pending" && "Verification in progress..."}
                  {formData.backgroundVerificationStatus === "verified" && "Driver has been successfully verified"}
                  {formData.backgroundVerificationStatus === "failed" && "Verification failed - please contact support"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <VerificationBadge />
                {formData.backgroundVerificationStatus === "not-started" && (
                  <Button
                    type="button"
                    onClick={startBackgroundVerification}
                    variant="outline"
                    size="sm"
                    className="border-blue-500 text-blue-600 hover:bg-blue-600 hover:text-white"
                  >
                    Start Verification
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Upload Section */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Upload License & ID Proof
            </CardTitle>
            <p className="text-sm text-gray-600">
              Upload clear photos or scans of driving license and government ID. You can click to select files or drag and drop them directly onto the upload areas.
            </p>
          </CardHeader>
          <CardContent>
            {/* ID Front Picture */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--color-deep-navy)] mb-2">ID Front *</label>
              <div 
                className={`flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 transition-colors ${
                  dragOverField === 'id_front' ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'
                }`}
                onDragOver={(e) => handleDragOver(e, 'id_front')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'id_front')}
              >
                <label className="cursor-pointer flex items-center gap-2 text-[var(--bright-orange)] font-medium hover:underline">
                  <Upload className="w-5 h-5" />
                  {formData.id_front ? 'Change File' : 'Select File or Drag & Drop'}
                  <input type="file" accept="image/*,application/pdf" onChange={e => handleFileUpload('id_front', e.target.files)} className="hidden" />
                </label>
                {formData.id_front && (
                  <span className="text-sm text-gray-700 bg-white px-2 py-1 rounded border border-gray-200 flex items-center gap-1">
                    {formData.id_front.name}
                    <button type="button" onClick={() => removeFile('id_front')} className="ml-1 text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
                  </span>
                )}
              </div>
              {errors.id_front && <div className="mt-1 text-red-600 text-sm">{errors.id_front}</div>}
            </div>
            {/* ID Back Picture */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--color-deep-navy)] mb-2">ID Back *</label>
              <div 
                className={`flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 transition-colors ${
                  dragOverField === 'id_back' ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'
                }`}
                onDragOver={(e) => handleDragOver(e, 'id_back')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'id_back')}
              >
                <label className="cursor-pointer flex items-center gap-2 text-[var(--bright-orange)] font-medium hover:underline">
                  <Upload className="w-5 h-5" />
                  {formData.id_back ? 'Change File' : 'Select File or Drag & Drop'}
                  <input type="file" accept="image/*,application/pdf" onChange={e => handleFileUpload('id_back', e.target.files)} className="hidden" />
                </label>
                {formData.id_back && (
                  <span className="text-sm text-gray-700 bg-white px-2 py-1 rounded border border-gray-200 flex items-center gap-1">
                    {formData.id_back.name}
                    <button type="button" onClick={() => removeFile('id_back')} className="ml-1 text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
                  </span>
                )}
              </div>
              {errors.id_back && <div className="mt-1 text-red-600 text-sm">{errors.id_back}</div>}
            </div>
            {/* License Front Picture */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--color-deep-navy)] mb-2">License Front *</label>
              <div 
                className={`flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 transition-colors ${
                  dragOverField === 'license_front' ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'
                }`}
                onDragOver={(e) => handleDragOver(e, 'license_front')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'license_front')}
              >
                <label className="cursor-pointer flex items-center gap-2 text-[var(--bright-orange)] font-medium hover:underline">
                  <Upload className="w-5 h-5" />
                  {formData.license_front ? 'Change File' : 'Select File or Drag & Drop'}
                  <input type="file" accept="image/*,application/pdf" onChange={e => handleFileUpload('license_front', e.target.files)} className="hidden" />
                </label>
                {formData.license_front && (
                  <span className="text-sm text-gray-700 bg-white px-2 py-1 rounded border border-gray-200 flex items-center gap-1">
                    {formData.license_front.name}
                    <button type="button" onClick={() => removeFile('license_front')} className="ml-1 text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
                  </span>
                )}
              </div>
              {errors.license_front && <div className="mt-1 text-red-600 text-sm">{errors.license_front}</div>}
            </div>
            {/* License Back Picture */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--color-deep-navy)] mb-2">License Back *</label>
              <div 
                className={`flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 transition-colors ${
                  dragOverField === 'license_back' ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'
                }`}
                onDragOver={(e) => handleDragOver(e, 'license_back')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'license_back')}
              >
                <label className="cursor-pointer flex items-center gap-2 text-[var(--bright-orange)] font-medium hover:underline">
                  <Upload className="w-5 h-5" />
                  {formData.license_back ? 'Change File' : 'Select File or Drag & Drop'}
                  <input type="file" accept="image/*,application/pdf" onChange={e => handleFileUpload('license_back', e.target.files)} className="hidden" />
                </label>
                {formData.license_back && (
                  <span className="text-sm text-gray-700 bg-white px-2 py-1 rounded border border-gray-200 flex items-center gap-1">
                    {formData.license_back.name}
                    <button type="button" onClick={() => removeFile('license_back')} className="ml-1 text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
                  </span>
                )}
              </div>
              {errors.license_back && <div className="mt-1 text-red-600 text-sm">{errors.license_back}</div>}
            </div>

            {/* Profile Picture */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--color-deep-navy)] mb-2">Profile Picture</label>
              <div className={`flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 transition-colors ${
                dragOverField === 'profile_picture' ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'
              }`} onDragOver={(e) => handleDragOver(e, 'profile_picture')} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, 'profile_picture')}>
                <label className="cursor-pointer flex items-center gap-2 text-[var(--bright-orange)] font-medium hover:underline">
                  <Upload className="w-5 h-5" />
                  {formData.profile_picture ? 'Change Picture' : 'Select Picture or Drag & Drop'}
                  <input type="file" accept="image/*" onChange={e => handleFileUpload('profile_picture', e.target.files)} className="hidden" />
                </label>
                {formData.profile_picture && (
                  <div className="flex items-center gap-2">
                    {profilePreviewUrl ? (
                      <div className="w-16 h-16 rounded-full overflow-hidden border">
                        <Image src={profilePreviewUrl} alt="preview" width={64} height={64} className="object-cover" />
                      </div>
                    ) : null}
                    <div className="text-sm text-gray-700 bg-white px-2 py-1 rounded border border-gray-200 flex items-center gap-1">
                      {formData.profile_picture.name}
                      <button type="button" onClick={() => removeFile('profile_picture')} className="ml-1 text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
                    </div>
                  </div>
                )}
              </div>
              {errors.profile_picture && <div className="mt-1 text-red-600 text-sm">{errors.profile_picture}</div>}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="border-gray-400 text-gray-600 hover:bg-gray-600 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-orange-500 hover:bg-orange-600 text-black font-medium"
          >
            {isSubmitting ? "Adding Driver..." : "Add Driver"}
          </Button>
        </div>
      </form>
    </div>
  );
}
