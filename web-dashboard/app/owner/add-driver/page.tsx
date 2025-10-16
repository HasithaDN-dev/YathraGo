"use client";

import React, { useState } from "react";
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
  CreditCard,
  Car,
  Shield,
  Info,
} from "lucide-react";

interface FormData {
  name: string;
  phoneNumber: string;
  licenseNo: string;
  assignedVehicle: string;
  id_front?: File | null;
  id_back?: File | null;
  license_front?: File | null;
  license_back?: File | null;
  backgroundVerificationStatus: "verified" | "pending" | "failed" | "not-started";
}

interface FormErrors {
  name?: string;
  phoneNumber?: string;
  licenseNo?: string;
  assignedVehicle?: string;
  id_front?: string;
  id_back?: string;
  license_front?: string;
  license_back?: string;
}

export default function AddDriverPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phoneNumber: "",
    licenseNo: "",
    assignedVehicle: "",
    id_front: null,
    id_back: null,
    license_front: null,
    license_back: null,
    backgroundVerificationStatus: "not-started",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragOverField, setDragOverField] = useState<string | null>(null);

  // Mock available vehicles
  const availableVehicles = [
    { value: "", label: "Select Vehicle" },
    { value: "ABC-123", label: "ABC-123 - Bus (40 seats)" },
    { value: "XYZ-789", label: "XYZ-789 - Van (15 seats)" },
    { value: "DEF-456", label: "DEF-456 - Mini Bus (25 seats)" },
    { value: "GHI-321", label: "GHI-321 - Bus (35 seats)" },
  ];

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

    // Phone number validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^[\+]?[\d\s\-\(\)]{10,15}$/.test(formData.phoneNumber.replace(/\s/g, ""))) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    // License number validation
    if (!formData.licenseNo.trim()) {
      newErrors.licenseNo = "License number is required";
    } else if (formData.licenseNo.trim().length < 5) {
      newErrors.licenseNo = "License number must be at least 5 characters";
    }

    // Vehicle assignment validation
    if (!formData.assignedVehicle) {
      newErrors.assignedVehicle = "Please assign driver to a vehicle";
    }

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

    setFormData((prev) => ({
      ...prev,
      [field]: file,
    }));

    // Clear file upload error
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const removeFile = (field: keyof FormData) => {
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
      formDataToSend.append("licenseNo", formData.licenseNo);
      formDataToSend.append("assignedVehicle", formData.assignedVehicle);
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
      setFormData({
        name: "",
        phoneNumber: "",
        licenseNo: "",
        assignedVehicle: "",
        id_front: null,
        id_back: null,
        license_front: null,
        license_back: null,
        backgroundVerificationStatus: "not-started",
      });
    } catch (error) {
      console.error("Error adding driver:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      phoneNumber: "",
      licenseNo: "",
      assignedVehicle: "",
      id_front: null,
      id_back: null,
      license_front: null,
      license_back: null,
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
                    placeholder="+1 (555) 123-4567"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.phoneNumber ? "border-red-500 bg-red-50" : "border-gray-400"
                    }`}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-600 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Include country code for international numbers
                </p>
                {errors.phoneNumber && (
                  <div className="mt-1 flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.phoneNumber}</span>
                  </div>
                )}
              </div>

              {/* License Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Number *
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Enter license number"
                    value={formData.licenseNo}
                    onChange={(e) => handleInputChange("licenseNo", e.target.value.toUpperCase())}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.licenseNo ? "border-red-500 bg-red-50" : "border-gray-400"
                    }`}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-600 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Commercial driving license number required
                </p>
                {errors.licenseNo && (
                  <div className="mt-1 flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.licenseNo}</span>
                  </div>
                )}
              </div>

              {/* Assign to Vehicle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign to Vehicle *
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
                    {availableVehicles.map((vehicle) => (
                      <option key={vehicle.value} value={vehicle.value}>
                        {vehicle.label}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="mt-1 text-xs text-gray-600 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Driver will be assigned as primary operator for this vehicle
                </p>
                {errors.assignedVehicle && (
                  <div className="mt-1 flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.assignedVehicle}</span>
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
