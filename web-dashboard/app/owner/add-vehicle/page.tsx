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
  type: string;
  brand: string;
  model: string;
  manufactureYear: string;
  registrationNumber: string;
  color: string;
  route: string[];
  no_of_seats: string;
  air_conditioned: boolean;
  assistant: boolean;
  rear_picture?: File | null;
  front_picture?: File | null;
  side_picture?: File | null;
  inside_picture?: File | null;
  revenue_license?: File | null;
  insurance_front?: File | null;
  insurance_back?: File | null;
  vehicle_reg?: File | null;
}

interface FormErrors {
  type?: string;
  brand?: string;
  model?: string;
  manufactureYear?: string;
  registrationNumber?: string;
  color?: string;
  route?: string;
  no_of_seats?: string;
  air_conditioned?: string;
  assistant?: string;
  rear_picture?: string;
  front_picture?: string;
  side_picture?: string;
  inside_picture?: string;
  revenue_license?: string;
  insurance_front?: string;
  insurance_back?: string;
  vehicle_reg?: string;
}

export default function AddVehiclePage() {
  const [formData, setFormData] = useState<FormData>({
    type: "",
    brand: "",
    model: "",
    manufactureYear: "",
    registrationNumber: "",
    color: "",
    route: [],
    no_of_seats: "",
    air_conditioned: false,
    assistant: false,
    rear_picture: null,
    front_picture: null,
    side_picture: null,
    inside_picture: null,
    revenue_license: null,
    insurance_front: null,
    insurance_back: null,
    vehicle_reg: null,
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

    // Type validation
    if (!formData.type) {
      newErrors.type = "Vehicle type is required";
    }

    // Brand validation
    if (!formData.brand.trim()) {
      newErrors.brand = "Brand is required";
    }

    // Model validation
    if (!formData.model.trim()) {
      newErrors.model = "Model is required";
    }

    // Manufacture Year validation
    if (!formData.manufactureYear.trim()) {
      newErrors.manufactureYear = "Manufacture year is required";
    } else if (isNaN(Number(formData.manufactureYear)) || Number(formData.manufactureYear) < 1900 || Number(formData.manufactureYear) > new Date().getFullYear()) {
      newErrors.manufactureYear = "Please enter a valid year";
    }

    // Registration Number validation
    if (!formData.registrationNumber.trim()) {
      newErrors.registrationNumber = "Registration number is required";
    }

    // Color validation
    if (!formData.color.trim()) {
      newErrors.color = "Color is required";
    }

    // Route validation
    if (formData.route.length === 0) {
      newErrors.route = "At least one route is required";
    }

    // Seating Capacity validation
    if (!formData.no_of_seats.trim()) {
      newErrors.no_of_seats = "Seating capacity is required";
    } else if (isNaN(Number(formData.no_of_seats)) || Number(formData.no_of_seats) <= 0) {
      newErrors.no_of_seats = "Please enter a valid number";
    } else if (Number(formData.no_of_seats) > 100) {
      newErrors.no_of_seats = "Seating capacity cannot exceed 100";
    }

    // Air Conditioned validation
    if (typeof formData.air_conditioned === "undefined") {
      newErrors.air_conditioned = "Air conditioned status is required";
    }

    // Assistant validation
    if (typeof formData.assistant === "undefined") {
      newErrors.assistant = "Assistant status is required";
    }

    // File upload validation
    if (!formData.rear_picture) {
      newErrors.rear_picture = "Rear picture is required";
    }
    if (!formData.front_picture) {
      newErrors.front_picture = "Front picture is required";
    }
    if (!formData.side_picture) {
      newErrors.side_picture = "Side picture is required";
    }
    if (!formData.inside_picture) {
      newErrors.inside_picture = "Inside picture is required";
    }
    if (!formData.revenue_license) {
      newErrors.revenue_license = "Revenue license is required";
    }
    if (!formData.insurance_front) {
      newErrors.insurance_front = "Insurance front is required";
    }
    if (!formData.insurance_back) {
      newErrors.insurance_back = "Insurance back is required";
    }
    if (!formData.vehicle_reg) {
      newErrors.vehicle_reg = "Vehicle registration is required";
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

  const handleFileUpload = (field: keyof FormData, files: FileList | null) => {
    if (!files) return;

    const newFile = Array.from(files)[0]; // Only take the first file for simplicity, adjust if multiple are allowed
    setFormData((prev) => ({
      ...prev,
      [field]: newFile,
    }));

    // Clear file upload error
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const removeFile = (field: keyof FormData) => {
    setFormData((prev) => ({
      ...prev,
      [field]: null,
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
    // This part needs to be updated to handle multiple files if allowed
    handleFileUpload("rear_picture", e.dataTransfer.files);
    handleFileUpload("front_picture", e.dataTransfer.files);
    handleFileUpload("side_picture", e.dataTransfer.files);
    handleFileUpload("inside_picture", e.dataTransfer.files);
    handleFileUpload("revenue_license", e.dataTransfer.files);
    handleFileUpload("insurance_front", e.dataTransfer.files);
    handleFileUpload("insurance_back", e.dataTransfer.files);
    handleFileUpload("vehicle_reg", e.dataTransfer.files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("type", formData.type);
      formDataToSend.append("brand", formData.brand);
      formDataToSend.append("model", formData.model);
      formDataToSend.append("manufactureYear", formData.manufactureYear);
      formDataToSend.append("registrationNumber", formData.registrationNumber);
      formDataToSend.append("color", formData.color);
      formDataToSend.append("route", JSON.stringify(formData.route));
      formDataToSend.append("no_of_seats", formData.no_of_seats);
      formDataToSend.append("air_conditioned", String(formData.air_conditioned));
      formDataToSend.append("assistant", String(formData.assistant));
      if (formData.rear_picture) formDataToSend.append("rear_picture", formData.rear_picture);
      if (formData.front_picture) formDataToSend.append("front_picture", formData.front_picture);
      if (formData.side_picture) formDataToSend.append("side_picture", formData.side_picture);
      if (formData.inside_picture) formDataToSend.append("inside_picture", formData.inside_picture);
      if (formData.revenue_license) formDataToSend.append("revenue_license", formData.revenue_license);
      if (formData.insurance_front) formDataToSend.append("insurance_front", formData.insurance_front);
      if (formData.insurance_back) formDataToSend.append("insurance_back", formData.insurance_back);
      if (formData.vehicle_reg) formDataToSend.append("vehicle_reg", formData.vehicle_reg);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      
      // Reset form
      setFormData({
        type: "",
        brand: "",
        model: "",
        manufactureYear: "",
        registrationNumber: "",
        color: "",
        route: [],
        no_of_seats: "",
        air_conditioned: false,
        assistant: false,
        rear_picture: null,
        front_picture: null,
        side_picture: null,
        inside_picture: null,
        revenue_license: null,
        insurance_front: null,
        insurance_back: null,
        vehicle_reg: null,
      });
    } catch (error) {
      console.error("Error adding vehicle:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      type: "",
      brand: "",
      model: "",
      manufactureYear: "",
      registrationNumber: "",
      color: "",
      route: [],
      no_of_seats: "",
      air_conditioned: false,
      assistant: false,
      rear_picture: null,
      front_picture: null,
      side_picture: null,
      inside_picture: null,
      revenue_license: null,
      insurance_front: null,
      insurance_back: null,
      vehicle_reg: null,
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
              {/* Vehicle Type */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-deep-navy)] mb-2">
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

              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-deep-navy)] mb-2">
                  Brand *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Toyota"
                  value={formData.brand}
                  onChange={(e) => handleInputChange("brand", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.brand ? "border-red-500 bg-red-50" : "border-gray-400"
                  }`}
                />
                {errors.brand && (
                  <div className="mt-1 flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.brand}</span>
                  </div>
                )}
              </div>

              {/* Model */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-deep-navy)] mb-2">
                  Model *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Corolla"
                  value={formData.model}
                  onChange={(e) => handleInputChange("model", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.model ? "border-red-500 bg-red-50" : "border-gray-400"
                  }`}
                />
                {errors.model && (
                  <div className="mt-1 flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.model}</span>
                  </div>
                )}
              </div>

              {/* Manufacture Year */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-deep-navy)] mb-2">
                  Manufacture Year *
                </label>
                <input
                  type="number"
                  placeholder="e.g., 2020"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={formData.manufactureYear}
                  onChange={(e) => handleInputChange("manufactureYear", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.manufactureYear ? "border-red-500 bg-red-50" : "border-gray-400"
                  }`}
                />
                {errors.manufactureYear && (
                  <div className="mt-1 flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.manufactureYear}</span>
                  </div>
                )}
              </div>

              {/* Registration Number */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-deep-navy)] mb-2">
                  Registration Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g., ABC-123"
                  value={formData.registrationNumber}
                  onChange={(e) => handleInputChange("registrationNumber", e.target.value.toUpperCase())}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.registrationNumber ? "border-red-500 bg-red-50" : "border-gray-400"
                  }`}
                />
                {errors.registrationNumber && (
                  <div className="mt-1 flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.registrationNumber}</span>
                  </div>
                )}
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-deep-navy)] mb-2">
                  Color *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Red"
                  value={formData.color}
                  onChange={(e) => handleInputChange("color", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.color ? "border-red-500 bg-red-50" : "border-gray-400"
                  }`}
                />
                {errors.color && (
                  <div className="mt-1 flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.color}</span>
                  </div>
                )}
              </div>

              {/* Route */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-deep-navy)] mb-2">
                  Route *
                </label>
                <select
                  value={formData.route[0] || ""}
                  onChange={(e) => handleInputChange("route", [e.target.value])}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a route</option>
                  <option value="Route A">Route A</option>
                  <option value="Route B">Route B</option>
                  <option value="Route C">Route C</option>
                </select>
                {errors.route && (
                  <div className="mt-1 flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.route}</span>
                  </div>
                )}
              </div>

              {/* Seating Capacity */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-deep-navy)] mb-2">
                  Seating Capacity *
                </label>
                <input
                  type="number"
                  placeholder="e.g., 40"
                  min="1"
                  max="100"
                  value={formData.no_of_seats}
                  onChange={(e) => handleInputChange("no_of_seats", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.no_of_seats ? "border-red-500 bg-red-50" : "border-gray-400"
                  }`}
                />
                {errors.no_of_seats && (
                  <div className="mt-1 flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.no_of_seats}</span>
                  </div>
                )}
              </div>

              {/* Air Conditioned */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-deep-navy)] mb-2">
                  Air Conditioned *
                </label>
                <input
                  type="checkbox"
                  checked={formData.air_conditioned}
                  onChange={(e) => handleInputChange("air_conditioned", String(e.target.checked))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                {errors.air_conditioned && (
                  <div className="mt-1 flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.air_conditioned}</span>
                  </div>
                )}
              </div>

              {/* Assistant */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-deep-navy)] mb-2">
                  Assistant *
                </label>
                <input
                  type="checkbox"
                  checked={formData.assistant}
                  onChange={(e) => handleInputChange("assistant", String(e.target.checked))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                {errors.assistant && (
                  <div className="mt-1 flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.assistant}</span>
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
              } ${errors.rear_picture || errors.front_picture || errors.side_picture || errors.inside_picture || errors.revenue_license || errors.insurance_front || errors.insurance_back || errors.vehicle_reg ? "border-red-500 bg-red-50" : ""}`}
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
                      onChange={(e) => handleFileUpload("rear_picture", e.target.files)}
                      className="hidden"
                    />
                  </label>
                </p>
                <p className="text-xs text-gray-400">
                  Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 5MB each)
                </p>
              </div>
            </div>

            {errors.rear_picture && (
              <div className="mt-2 flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.rear_picture}</span>
              </div>
            )}
            {errors.front_picture && (
              <div className="mt-2 flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.front_picture}</span>
              </div>
            )}
            {errors.side_picture && (
              <div className="mt-2 flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.side_picture}</span>
              </div>
            )}
            {errors.inside_picture && (
              <div className="mt-2 flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.inside_picture}</span>
              </div>
            )}
            {errors.revenue_license && (
              <div className="mt-2 flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.revenue_license}</span>
              </div>
            )}
            {errors.insurance_front && (
              <div className="mt-2 flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.insurance_front}</span>
              </div>
            )}
            {errors.insurance_back && (
              <div className="mt-2 flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.insurance_back}</span>
              </div>
            )}
            {errors.vehicle_reg && (
              <div className="mt-2 flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.vehicle_reg}</span>
              </div>
            )}

            {/* Uploaded Files List */}
            {formData.rear_picture && (
              <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{formData.rear_picture.name}</p>
                    <p className="text-xs text-gray-500">
                      {(formData.rear_picture.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile("rear_picture")}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {formData.front_picture && (
              <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{formData.front_picture.name}</p>
                    <p className="text-xs text-gray-500">
                      {(formData.front_picture.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile("front_picture")}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {formData.side_picture && (
              <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{formData.side_picture.name}</p>
                    <p className="text-xs text-gray-500">
                      {(formData.side_picture.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile("side_picture")}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {formData.inside_picture && (
              <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{formData.inside_picture.name}</p>
                    <p className="text-xs text-gray-500">
                      {(formData.inside_picture.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile("inside_picture")}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {formData.revenue_license && (
              <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{formData.revenue_license.name}</p>
                    <p className="text-xs text-gray-500">
                      {(formData.revenue_license.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile("revenue_license")}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {formData.insurance_front && (
              <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{formData.insurance_front.name}</p>
                    <p className="text-xs text-gray-500">
                      {(formData.insurance_front.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile("insurance_front")}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {formData.insurance_back && (
              <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{formData.insurance_back.name}</p>
                    <p className="text-xs text-gray-500">
                      {(formData.insurance_back.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile("insurance_back")}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {formData.vehicle_reg && (
              <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{formData.vehicle_reg.name}</p>
                    <p className="text-xs text-gray-500">
                      {(formData.vehicle_reg.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile("vehicle_reg")}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
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
