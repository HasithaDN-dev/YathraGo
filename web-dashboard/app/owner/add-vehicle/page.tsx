"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, CheckCircle, AlertCircle, Calendar } from "lucide-react";

interface FormData {
  vehicleNo: string;
  type: string;
  brand: string;
  model: string;
  startingCity: string;
  endingCity: string;
  no_of_seats: string;
  seatingCapacity: string;
  insuranceExpiry: string;
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
  uploadedFiles: File[];
}

interface FormErrors {
  vehicleNo?: string;
  type?: string;
  brand?: string;
  model?: string;
  startingCity?: string;
  endingCity?: string;
  no_of_seats?: string;
  seatingCapacity?: string;
  insuranceExpiry?: string;
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
  uploadedFiles?: string;
}

export default function AddVehiclePage() {
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showEndingCityDropdown, setShowEndingCityDropdown] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [endingCitySearch, setEndingCitySearch] = useState("");
  const [cities, setCities] = useState<{ id: number; name: string }[]>([]);
  React.useEffect(() => {
    fetch("/cities")
      .then((res) => res.json())
      .then((data) => setCities(data));
  }, []);
  const [formData, setFormData] = useState<FormData>({
    vehicleNo: "",
    type: "",
    brand: "",
    model: "",
    startingCity: "",
    endingCity: "",
    no_of_seats: "",
    seatingCapacity: "",
    insuranceExpiry: "",
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
    uploadedFiles: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [dragOverField, setDragOverField] = useState<string | null>(null);

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

    // Brand validation
    if (!formData.brand.trim()) {
      newErrors.brand = "Brand is required";
    }

    // Model validation
    if (!formData.model.trim()) {
      newErrors.model = "Model is required";
    }

    // Starting City validation
    if (!formData.startingCity.trim()) {
      newErrors.startingCity = "Starting city is required";
    }

    // Ending City validation
    if (!formData.endingCity.trim()) {
      newErrors.endingCity = "Ending city is required";
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

  const handleInputChange = (field: keyof FormData, value: string | boolean | string[]) => {
    if (field === 'air_conditioned' || field === 'assistant') {
      setFormData((prev) => ({ ...prev, [field]: value === 'true' || value === true }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileUpload = (field: keyof FormData, files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // File type validation
    const allowedTypes = field === 'revenue_license' || field === 'insurance_front' || field === 'insurance_back' || field === 'vehicle_reg'
      ? ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
      : ['image/jpeg', 'image/png', 'image/jpg'];
    
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({ 
        ...prev, 
        [field]: `Please upload a valid ${field.includes('picture') ? 'image' : 'image or PDF'} file`
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
    
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const removeIndividualFile = (field: keyof FormData) => {
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
      formDataToSend.append("startingCity", formData.startingCity);
      formDataToSend.append("endingCity", formData.endingCity);
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

      // API call
      const token = typeof document !== 'undefined' ? document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1] : undefined;
      const response = await fetch("http://localhost:3000/owner/add-vehicle", {
        method: "POST",
        body: formDataToSend,
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        let msg = "Failed to add vehicle";
        try {
          const data = await response.json();
          msg = data.message || JSON.stringify(data);
        } catch {
          // fallback to text
          try {
            msg = await response.text();
          } catch {}
        }
        throw new Error(msg);
      }
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      
      // Reset form
      setFormData({
        vehicleNo: "",
        type: "",
        brand: "",
        model: "",
        startingCity: "",
        endingCity: "",
        no_of_seats: "",
        seatingCapacity: "",
        insuranceExpiry: "",
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
      brand: "",
      model: "",
      startingCity: "",
      endingCity: "",
      no_of_seats: "",
      seatingCapacity: "",
      insuranceExpiry: "",
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
            </div>

            {/* Route Section */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-[var(--color-deep-navy)] mb-4">Route Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Starting City Searchable Dropdown */}
                <div className="relative">
                  <label className="block text-sm font-medium text-[var(--color-deep-navy)] mb-2">Starting City *</label>
                  <div>
                    <button
                      type="button"
                      className={`w-full px-3 py-2 border rounded-lg text-left focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.startingCity ? "border-red-500 bg-red-50" : "border-gray-400"}`}
                      onClick={() => setShowCityDropdown((v) => !v)}
                    >
                      {formData.startingCity ? formData.startingCity : "Select City"}
                    </button>
                    {showCityDropdown && (
                      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1">
                        <input
                          type="text"
                          autoFocus
                          placeholder="Search city..."
                          value={citySearch}
                          onChange={e => setCitySearch(e.target.value)}
                          className="w-full px-3 py-2 border-b border-gray-200 rounded-t-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="max-h-48 overflow-y-auto">
                          {cities.filter(city => city.name.toLowerCase().includes(citySearch.toLowerCase())).length === 0 ? (
                            <div className="px-3 py-2 text-gray-400">No cities found</div>
                          ) : (
                            cities.filter(city => city.name.toLowerCase().includes(citySearch.toLowerCase())).map(city => (
                              <div
                                key={city.id}
                                className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${formData.startingCity === city.name ? "bg-blue-100" : ""}`}
                                onClick={() => {
                                  handleInputChange("startingCity", city.name);
                                  setShowCityDropdown(false);
                                }}
                              >
                                {city.name}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.startingCity && (
                    <div className="mt-1 flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.startingCity}</span>
                    </div>
                  )}
                </div>

                {/* Ending City Searchable Dropdown */}
                <div className="relative">
                  <label className="block text-sm font-medium text-[var(--color-deep-navy)] mb-2">Ending City *</label>
                  <div>
                    <button
                      type="button"
                      className={`w-full px-3 py-2 border rounded-lg text-left focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.endingCity ? "border-red-500 bg-red-50" : "border-gray-400"}`}
                      onClick={() => setShowEndingCityDropdown((v) => !v)}
                    >
                      {formData.endingCity ? formData.endingCity : "Select City"}
                    </button>
                    {showEndingCityDropdown && (
                      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1">
                        <input
                          type="text"
                          autoFocus
                          placeholder="Search city..."
                          value={endingCitySearch}
                          onChange={e => setEndingCitySearch(e.target.value)}
                          className="w-full px-3 py-2 border-b border-gray-200 rounded-t-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="max-h-48 overflow-y-auto">
                          {cities.filter(city => city.name.toLowerCase().includes(endingCitySearch.toLowerCase())).length === 0 ? (
                            <div className="px-3 py-2 text-gray-400">No cities found</div>
                          ) : (
                            cities.filter(city => city.name.toLowerCase().includes(endingCitySearch.toLowerCase())).map(city => (
                              <div
                                key={city.id}
                                className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${formData.endingCity === city.name ? "bg-blue-100" : ""}`}
                                onClick={() => {
                                  handleInputChange("endingCity", city.name);
                                  setShowEndingCityDropdown(false);
                                }}
                              >
                                {city.name}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.endingCity && (
                    <div className="mt-1 flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.endingCity}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              Please upload all required vehicle documents. You can click to select files or drag and drop them directly onto the upload areas.
            </p>
          </CardHeader>
          <CardContent>
            {/* Rear Picture */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--color-deep-navy)] mb-2">Rear Picture *</label>
              <div 
                className={`flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 transition-colors ${
                  dragOverField === 'rear_picture' ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'
                }`}
                onDragOver={(e) => handleDragOver(e, 'rear_picture')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'rear_picture')}
              >
                <label className="cursor-pointer flex items-center gap-2 text-[var(--bright-orange)] font-medium hover:underline">
                  <Upload className="w-5 h-5" />
                  {formData.rear_picture ? 'Change File' : 'Select File or Drag & Drop'}
                  <input type="file" accept="image/*" onChange={e => handleFileUpload('rear_picture', e.target.files)} className="hidden" />
                </label>
                {formData.rear_picture && (
                  <span className="text-sm text-gray-700 bg-white px-2 py-1 rounded border border-gray-200 flex items-center gap-1">
                    {formData.rear_picture.name}
                    <button type="button" onClick={() => removeIndividualFile('rear_picture')} className="ml-1 text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
                  </span>
                )}
              </div>
            </div>
            {/* Front Picture */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--color-deep-navy)] mb-2">Front Picture *</label>
              <div 
                className={`flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 transition-colors ${
                  dragOverField === 'front_picture' ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'
                }`}
                onDragOver={(e) => handleDragOver(e, 'front_picture')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'front_picture')}
              >
                <label className="cursor-pointer flex items-center gap-2 text-[var(--bright-orange)] font-medium hover:underline">
                  <Upload className="w-5 h-5" />
                  {formData.front_picture ? 'Change File' : 'Select File or Drag & Drop'}
                  <input type="file" accept="image/*" onChange={e => handleFileUpload('front_picture', e.target.files)} className="hidden" />
                </label>
                {formData.front_picture && (
                  <span className="text-sm text-gray-700 bg-white px-2 py-1 rounded border border-gray-200 flex items-center gap-1">
                    {formData.front_picture.name}
                    <button type="button" onClick={() => removeIndividualFile('front_picture')} className="ml-1 text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
                  </span>
                )}
              </div>
              {errors.front_picture && <div className="mt-1 text-red-600 text-sm">{errors.front_picture}</div>}
            </div>
            {/* Side Picture */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--color-deep-navy)] mb-2">Side Picture *</label>
              <div 
                className={`flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 transition-colors ${
                  dragOverField === 'side_picture' ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'
                }`}
                onDragOver={(e) => handleDragOver(e, 'side_picture')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'side_picture')}
              >
                <label className="cursor-pointer flex items-center gap-2 text-[var(--bright-orange)] font-medium hover:underline">
                  <Upload className="w-5 h-5" />
                  {formData.side_picture ? 'Change File' : 'Select File or Drag & Drop'}
                  <input type="file" accept="image/*" onChange={e => handleFileUpload('side_picture', e.target.files)} className="hidden" />
                </label>
                {formData.side_picture && (
                  <span className="text-sm text-gray-700 bg-white px-2 py-1 rounded border border-gray-200 flex items-center gap-1">
                    {formData.side_picture.name}
                    <button type="button" onClick={() => removeIndividualFile('side_picture')} className="ml-1 text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
                  </span>
                )}
              </div>
              {errors.side_picture && <div className="mt-1 text-red-600 text-sm">{errors.side_picture}</div>}
            </div>
            {/* Inside Picture */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--color-deep-navy)] mb-2">Inside Picture *</label>
              <div 
                className={`flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 transition-colors ${
                  dragOverField === 'inside_picture' ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'
                }`}
                onDragOver={(e) => handleDragOver(e, 'inside_picture')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'inside_picture')}
              >
                <label className="cursor-pointer flex items-center gap-2 text-[var(--bright-orange)] font-medium hover:underline">
                  <Upload className="w-5 h-5" />
                  {formData.inside_picture ? 'Change File' : 'Select File or Drag & Drop'}
                  <input type="file" accept="image/*" onChange={e => handleFileUpload('inside_picture', e.target.files)} className="hidden" />
                </label>
                {formData.inside_picture && (
                  <span className="text-sm text-gray-700 bg-white px-2 py-1 rounded border border-gray-200 flex items-center gap-1">
                    {formData.inside_picture.name}
                    <button type="button" onClick={() => removeIndividualFile('inside_picture')} className="ml-1 text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
                  </span>
                )}
              </div>
              {errors.inside_picture && <div className="mt-1 text-red-600 text-sm">{errors.inside_picture}</div>}
            </div>
            {/* Revenue License */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--color-deep-navy)] mb-2">Revenue License *</label>
              <div 
                className={`flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 transition-colors ${
                  dragOverField === 'revenue_license' ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'
                }`}
                onDragOver={(e) => handleDragOver(e, 'revenue_license')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'revenue_license')}
              >
                <label className="cursor-pointer flex items-center gap-2 text-[var(--bright-orange)] font-medium hover:underline">
                  <Upload className="w-5 h-5" />
                  {formData.revenue_license ? 'Change File' : 'Select File or Drag & Drop'}
                  <input type="file" accept="image/*,application/pdf" onChange={e => handleFileUpload('revenue_license', e.target.files)} className="hidden" />
                </label>
                {formData.revenue_license && (
                  <span className="text-sm text-gray-700 bg-white px-2 py-1 rounded border border-gray-200 flex items-center gap-1">
                    {formData.revenue_license.name}
                    <button type="button" onClick={() => removeIndividualFile('revenue_license')} className="ml-1 text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
                  </span>
                )}
              </div>
              {errors.revenue_license && <div className="mt-1 text-red-600 text-sm">{errors.revenue_license}</div>}
            </div>
            {/* Insurance Front */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--color-deep-navy)] mb-2">Insurance Front *</label>
              <div 
                className={`flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 transition-colors ${
                  dragOverField === 'insurance_front' ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'
                }`}
                onDragOver={(e) => handleDragOver(e, 'insurance_front')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'insurance_front')}
              >
                <label className="cursor-pointer flex items-center gap-2 text-[var(--bright-orange)] font-medium hover:underline">
                  <Upload className="w-5 h-5" />
                  {formData.insurance_front ? 'Change File' : 'Select File or Drag & Drop'}
                  <input type="file" accept="image/*,application/pdf" onChange={e => handleFileUpload('insurance_front', e.target.files)} className="hidden" />
                </label>
                {formData.insurance_front && (
                  <span className="text-sm text-gray-700 bg-white px-2 py-1 rounded border border-gray-200 flex items-center gap-1">
                    {formData.insurance_front.name}
                    <button type="button" onClick={() => removeIndividualFile('insurance_front')} className="ml-1 text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
                  </span>
                )}
              </div>
              {errors.insurance_front && <div className="mt-1 text-red-600 text-sm">{errors.insurance_front}</div>}
            </div>
            {/* Insurance Back */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--color-deep-navy)] mb-2">Insurance Back *</label>
              <div 
                className={`flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 transition-colors ${
                  dragOverField === 'insurance_back' ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'
                }`}
                onDragOver={(e) => handleDragOver(e, 'insurance_back')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'insurance_back')}
              >
                <label className="cursor-pointer flex items-center gap-2 text-[var(--bright-orange)] font-medium hover:underline">
                  <Upload className="w-5 h-5" />
                  {formData.insurance_back ? 'Change File' : 'Select File or Drag & Drop'}
                  <input type="file" accept="image/*,application/pdf" onChange={e => handleFileUpload('insurance_back', e.target.files)} className="hidden" />
                </label>
                {formData.insurance_back && (
                  <span className="text-sm text-gray-700 bg-white px-2 py-1 rounded border border-gray-200 flex items-center gap-1">
                    {formData.insurance_back.name}
                    <button type="button" onClick={() => removeIndividualFile('insurance_back')} className="ml-1 text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
                  </span>
                )}
              </div>
              {errors.insurance_back && <div className="mt-1 text-red-600 text-sm">{errors.insurance_back}</div>}
            </div>
            {/* Vehicle Registration */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--color-deep-navy)] mb-2">Vehicle Registration *</label>
              <div 
                className={`flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 transition-colors ${
                  dragOverField === 'vehicle_reg' ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'
                }`}
                onDragOver={(e) => handleDragOver(e, 'vehicle_reg')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'vehicle_reg')}
              >
                <label className="cursor-pointer flex items-center gap-2 text-[var(--bright-orange)] font-medium hover:underline">
                  <Upload className="w-5 h-5" />
                  {formData.vehicle_reg ? 'Change File' : 'Select File or Drag & Drop'}
                  <input type="file" accept="image/*,application/pdf" onChange={e => handleFileUpload('vehicle_reg', e.target.files)} className="hidden" />
                </label>
                {formData.vehicle_reg && (
                  <span className="text-sm text-gray-700 bg-white px-2 py-1 rounded border border-gray-200 flex items-center gap-1">
                    {formData.vehicle_reg.name}
                    <button type="button" onClick={() => removeIndividualFile('vehicle_reg')} className="ml-1 text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
                  </span>
                )}
              </div>
              {errors.vehicle_reg && <div className="mt-1 text-red-600 text-sm">{errors.vehicle_reg}</div>}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="border-[var(--neutral-gray)] text-[var(--neutral-gray)] hover:bg-[var(--neutral-gray)] hover:text-white"
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
