"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Calendar,
  FileText,
} from "lucide-react";

interface FormData {
  vehicleNo: string;
  type: string;
  seatingCapacity: string;
  insuranceExpiry: string;
  uploadedFiles: File[];
}

interface FormErrors {
  vehicleNo?: string;
  type?: string;
  seatingCapacity?: string;
  insuranceExpiry?: string;
  uploadedFiles?: string;
}

export default function AddVehiclePage() {
  const [formData, setFormData] = useState<FormData>({
    vehicleNo: "",
    type: "",
    seatingCapacity: "",
    insuranceExpiry: "",
    uploadedFiles: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const vehicleTypes = [
    { value: "", label: "Select Vehicle Type" },
    { value: "bus", label: "Bus" },
    { value: "mini-bus", label: "Mini Bus" },
    { value: "van", label: "Van" },
    { value: "suv", label: "SUV" },
    { value: "sedan", label: "Sedan" },
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Vehicle No validation
    if (!formData.vehicleNo.trim()) {
      newErrors.vehicleNo = "Vehicle number is required";
    } else if (!/^[A-Z]{2,3}-\d{3,4}$/.test(formData.vehicleNo)) {
      newErrors.vehicleNo = "Vehicle number format should be ABC-123 or AB-1234";
    }

    // Type validation
    if (!formData.type) {
      newErrors.type = "Vehicle type is required";
    }

    // Seating Capacity validation
    if (!formData.seatingCapacity.trim()) {
      newErrors.seatingCapacity = "Seating capacity is required";
    } else if (isNaN(Number(formData.seatingCapacity)) || Number(formData.seatingCapacity) <= 0) {
      newErrors.seatingCapacity = "Please enter a valid number";
    } else if (Number(formData.seatingCapacity) > 100) {
      newErrors.seatingCapacity = "Seating capacity cannot exceed 100";
    }

    // Insurance Expiry validation
    if (!formData.insuranceExpiry) {
      newErrors.insuranceExpiry = "Insurance expiry date is required";
    } else {
      const expiryDate = new Date(formData.insuranceExpiry);
      const today = new Date();
      if (expiryDate <= today) {
        newErrors.insuranceExpiry = "Insurance expiry date must be in the future";
      }
    }

    // File upload validation
    if (formData.uploadedFiles.length === 0) {
      newErrors.uploadedFiles = "At least one document is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files).filter((file) => {
      // Only accept PDF, images, and documents
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
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
        vehicleNo: "",
        type: "",
        seatingCapacity: "",
        insuranceExpiry: "",
        uploadedFiles: [],
      });
    } catch (error) {
      console.error("Error adding vehicle:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      vehicleNo: "",
      type: "",
      seatingCapacity: "",
      insuranceExpiry: "",
      uploadedFiles: [],
    });
    setErrors({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-[var(--neutral-gray)] p-6">
        <h1 className="text-2xl font-bold text-[var(--color-deep-navy)]">Add Vehicle</h1>
        <p className="text-[var(--neutral-gray)] mt-2">
          Register a new vehicle to your fleet
        </p>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-[var(--success-bg)] border border-[var(--success-green)] text-[var(--success-green)] px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Vehicle added successfully!</span>
            <button
              onClick={() => setShowSuccess(false)}
              className="text-[var(--success-green)] hover:text-[var(--color-deep-navy)]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vehicle Form */}
        <Card className="shadow-sm border border-[var(--neutral-gray)]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[var(--color-deep-navy)]">
              Vehicle Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vehicle No */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-deep-navy)] mb-2">
                  Vehicle No. *
                </label>
                <input
                  type="text"
                  placeholder="e.g., ABC-123"
                  value={formData.vehicleNo}
                  onChange={(e) => handleInputChange("vehicleNo", e.target.value.toUpperCase())}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--bright-orange)] focus:border-transparent ${
                    errors.vehicleNo ? "border-[var(--error-red)] bg-[var(--error-bg)]" : "border-[var(--neutral-gray)]"
                  }`}
                />
                {errors.vehicleNo && (
                  <div className="mt-1 flex items-center space-x-1 text-[var(--error-red)] bg-[var(--error-bg)] px-2 py-1 rounded text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.vehicleNo}</span>
                  </div>
                )}
              </div>

              {/* Vehicle Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.type ? "border-red-500 bg-red-50" : "border-gray-400"
                  }`}
                >
                  {vehicleTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <div className="mt-1 flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.type}</span>
                  </div>
                )}
              </div>

              {/* Seating Capacity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seating Capacity *
                </label>
                <input
                  type="number"
                  placeholder="e.g., 40"
                  min="1"
                  max="100"
                  value={formData.seatingCapacity}
                  onChange={(e) => handleInputChange("seatingCapacity", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.seatingCapacity ? "border-red-500 bg-red-50" : "border-gray-400"
                  }`}
                />
                {errors.seatingCapacity && (
                  <div className="mt-1 flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.seatingCapacity}</span>
                  </div>
                )}
              </div>

              {/* Insurance Expiry */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance Expiry *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.insuranceExpiry}
                    onChange={(e) => handleInputChange("insuranceExpiry", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.insuranceExpiry ? "border-red-500 bg-red-50" : "border-gray-400"
                    }`}
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
                {errors.insuranceExpiry && (
                  <div className="mt-1 flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.insuranceExpiry}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Upload Section */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Upload Documents
            </CardTitle>
            <p className="text-sm text-gray-600">
              Upload vehicle registration, insurance, and other relevant documents
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
                  Drag and drop files here
                </p>
                <p className="text-sm text-gray-500">
                  or{" "}
                  <label className="text-blue-600 hover:text-blue-800 cursor-pointer underline">
                    browse files
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                    />
                  </label>
                </p>
                <p className="text-xs text-gray-400">
                  Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 5MB each)
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
                <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
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
            className="border-[var(--neutral-gray)] text-[var(--neutral-gray)] hover:bg-[var(--light-gray)]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[var(--bright-orange)] hover:bg-[var(--warm-yellow)] text-[var(--black)] font-medium"
          >
            {isSubmitting ? "Adding Vehicle..." : "Add Vehicle"}
          </Button>
        </div>
      </form>
    </div>
  );
}
