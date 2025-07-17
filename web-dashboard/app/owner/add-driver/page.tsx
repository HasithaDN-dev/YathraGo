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
  FileText,
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
  uploadedFiles: File[];
  backgroundVerificationStatus: "verified" | "pending" | "failed" | "not-started";
}

interface FormErrors {
  name?: string;
  phoneNumber?: string;
  licenseNo?: string;
  assignedVehicle?: string;
  uploadedFiles?: string;
}

export default function AddDriverPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phoneNumber: "",
    licenseNo: "",
    assignedVehicle: "",
    uploadedFiles: [],
    backgroundVerificationStatus: "not-started",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

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
    if (formData.uploadedFiles.length === 0) {
      newErrors.uploadedFiles = "License and ID proof documents are required";
    } else if (formData.uploadedFiles.length < 2) {
      newErrors.uploadedFiles = "Please upload both license and ID proof";
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

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files).filter((file) => {
      // Only accept PDF, images
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
      ];
      return allowedTypes.includes(file.type) && file.size <= 5 * 1024 * 1024; // 5MB limit
    });

    setFormData((prev) => ({
      ...prev,
      uploadedFiles: [...prev.uploadedFiles, ...newFiles],
    }));

    // Clear file upload error
    if (errors.uploadedFiles) {
      setErrors((prev) => ({ ...prev, uploadedFiles: undefined }));
    }
  };

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((_, i) => i !== index),
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
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
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      
      // Reset form
      setFormData({
        name: "",
        phoneNumber: "",
        licenseNo: "",
        assignedVehicle: "",
        uploadedFiles: [],
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
      uploadedFiles: [],
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
                    className="border-blue-500 text-blue-600 hover:bg-blue-50"
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
              Upload clear photos or scans of driving license and government ID
            </p>
          </CardHeader>
          <CardContent>
            {/* Drag & Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center bg-gray-50 transition-colors ${
                isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
              } ${errors.uploadedFiles ? "border-red-500 bg-red-50" : ""}`}
            >
              <Upload className="mx-auto w-12 h-12 text-gray-400 mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-700">
                  Drag and drop documents here
                </p>
                <p className="text-sm text-gray-500">
                  or{" "}
                  <label className="text-blue-600 hover:text-blue-800 cursor-pointer underline">
                    browse files
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                    />
                  </label>
                </p>
                <p className="text-xs text-gray-600 flex items-center justify-center gap-1">
                  <Info className="w-3 h-3" />
                  Upload both driving license and ID proof (PDF, JPG, PNG - Max 5MB each)
                </p>
              </div>
            </div>

            {errors.uploadedFiles && (
              <div className="mt-2 flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.uploadedFiles}</span>
              </div>
            )}

            {/* Uploaded Files List */}
            {formData.uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Uploaded Documents:</h4>
                {formData.uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="border-gray-400 text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-orange-500 hover:bg-orange-600 text-black font-medium"
          >
            {isSubmitting ? "Adding Driver..." : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  );
}
