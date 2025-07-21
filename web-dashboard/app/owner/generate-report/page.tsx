"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Download,
  Calendar,
  Users,
  Car,
  DollarSign,
  Clock,
  Filter,
  CheckCircle,
  TrendingUp,
  MapPin,
  Fuel,
  Settings,
  Eye,
  Loader2,
} from "lucide-react";

interface ReportType {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: "financial" | "operational" | "compliance" | "analytics";
  estimatedTime: string;
  dataPoints: string[];
}

interface ReportFilters {
  dateFrom: string;
  dateTo: string;
  vehicles: string[];
  drivers: string[];
  routes: string[];
  reportFormat: "pdf" | "csv" | "excel";
}

const reportTypes: ReportType[] = [
  {
    id: "revenue-summary",
    title: "Revenue Summary",
    description: "Comprehensive financial overview with earnings, expenses, and profit analysis",
    icon: DollarSign,
    category: "financial",
    estimatedTime: "2-3 min",
    dataPoints: ["Total Revenue", "Operating Costs", "Net Profit", "Payment Status", "Monthly Trends"]
  },
  {
    id: "fleet-utilization",
    title: "Fleet Utilization Report",
    description: "Vehicle usage statistics, mileage, and efficiency metrics",
    icon: Car,
    category: "operational",
    estimatedTime: "3-4 min",
    dataPoints: ["Vehicle Uptime", "Distance Covered", "Fuel Consumption", "Maintenance Costs", "Route Efficiency"]
  },
  {
    id: "driver-performance",
    title: "Driver Performance Analysis",
    description: "Driver ratings, punctuality, and safety record evaluation",
    icon: Users,
    category: "operational",
    estimatedTime: "2-3 min",
    dataPoints: ["Performance Ratings", "Punctuality Score", "Safety Incidents", "Customer Feedback", "Hours Worked"]
  },
  {
    id: "compliance-status",
    title: "Compliance & Documentation",
    description: "Vehicle registrations, insurance status, and license validations",
    icon: FileText,
    category: "compliance",
    estimatedTime: "1-2 min",
    dataPoints: ["Insurance Status", "License Validity", "Vehicle Registration", "Safety Inspections", "Documentation"]
  },
  {
    id: "route-analytics",
    title: "Route Performance Analytics",
    description: "Route efficiency, timing analysis, and optimization suggestions",
    icon: MapPin,
    category: "analytics",
    estimatedTime: "4-5 min",
    dataPoints: ["Route Timing", "Passenger Load", "Fuel Efficiency", "Traffic Analysis", "Optimization Tips"]
  },
  {
    id: "maintenance-schedule",
    title: "Maintenance & Service Report",
    description: "Vehicle maintenance history and upcoming service requirements",
    icon: Settings,
    category: "operational",
    estimatedTime: "2-3 min",
    dataPoints: ["Service History", "Upcoming Maintenance", "Cost Analysis", "Downtime Tracking", "Warranty Status"]
  },
  {
    id: "customer-feedback",
    title: "Customer Satisfaction Report",
    description: "Parent and student feedback analysis with satisfaction metrics",
    icon: TrendingUp,
    category: "analytics",
    estimatedTime: "3-4 min",
    dataPoints: ["Satisfaction Scores", "Feedback Categories", "Complaint Resolution", "Service Quality", "Improvement Areas"]
  },
  {
    id: "fuel-consumption",
    title: "Fuel Consumption Analysis",
    description: "Detailed fuel usage patterns and cost optimization insights",
    icon: Fuel,
    category: "operational",
    estimatedTime: "2-3 min",
    dataPoints: ["Fuel Usage", "Cost Per Mile", "Efficiency Trends", "Vehicle Comparison", "Optimization Tips"]
  }
];

const mockVehicles = [
  { id: "ABC-123", name: "ABC-123 - Bus (40 seats)" },
  { id: "XYZ-789", name: "XYZ-789 - Van (15 seats)" },
  { id: "DEF-456", name: "DEF-456 - Mini Bus (25 seats)" },
  { id: "GHI-321", name: "GHI-321 - Bus (35 seats)" },
];

const mockDrivers = [
  { id: "driver-1", name: "John Smith" },
  { id: "driver-2", name: "Maria Garcia" },
  { id: "driver-3", name: "David Johnson" },
  { id: "driver-4", name: "Sarah Wilson" },
];

export default function GenerateReportPage() {
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: "",
    dateTo: "",
    vehicles: [],
    drivers: [],
    routes: [],
    reportFormat: "pdf",
  });
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<{ [key: string]: boolean }>({});
  const [showPreview, setShowPreview] = useState<string | null>(null);

  const categories = [
    { id: "all", name: "All Reports", count: reportTypes.length },
    { id: "financial", name: "Financial", count: reportTypes.filter(r => r.category === "financial").length },
    { id: "operational", name: "Operational", count: reportTypes.filter(r => r.category === "operational").length },
    { id: "compliance", name: "Compliance", count: reportTypes.filter(r => r.category === "compliance").length },
    { id: "analytics", name: "Analytics", count: reportTypes.filter(r => r.category === "analytics").length },
  ];

  const filteredReports = activeCategory === "all" 
    ? reportTypes 
    : reportTypes.filter(report => report.category === activeCategory);

  const handleReportToggle = (reportId: string) => {
    setSelectedReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleArrayFilterChange = (key: keyof ReportFilters, value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [key]: checked 
        ? [...(prev[key] as string[]), value]
        : (prev[key] as string[]).filter(item => item !== value)
    }));
  };

  const validateFilters = (): boolean => {
    if (!filters.dateFrom || !filters.dateTo) {
      alert("Please select both start and end dates");
      return false;
    }
    
    if (new Date(filters.dateFrom) > new Date(filters.dateTo)) {
      alert("Start date cannot be after end date");
      return false;
    }
    
    if (selectedReports.length === 0) {
      alert("Please select at least one report to generate");
      return false;
    }
    
    return true;
  };

  const generateReports = async () => {
    if (!validateFilters()) return;
    
    setIsGenerating(true);
    setGenerationProgress({});
    
    try {
      // Simulate report generation with progress
      for (const reportId of selectedReports) {
        setGenerationProgress(prev => ({ ...prev, [reportId]: false }));
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
        
        setGenerationProgress(prev => ({ ...prev, [reportId]: true }));
      }
      
      // Simulate final compilation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real application, this would trigger actual file downloads
      alert(`${selectedReports.length} report(s) generated successfully!`);
      
    } catch (error) {
      console.error("Error generating reports:", error);
      alert("Error generating reports. Please try again.");
    } finally {
      setIsGenerating(false);
      setGenerationProgress({});
    }
  };

  const previewReport = (reportId: string) => {
    setShowPreview(reportId);
    // In a real app, this would show actual report preview
    setTimeout(() => setShowPreview(null), 3000);
  };

  const ReportCard: React.FC<{ report: ReportType }> = ({ report }) => {
    const isSelected = selectedReports.includes(report.id);
    const isGenerating = generationProgress.hasOwnProperty(report.id);
    const isCompleted = generationProgress[report.id] === true;
    const IconComponent = report.icon;

    return (
      <Card 
        className={`cursor-pointer transition-all duration-200 ${
          isSelected 
            ? "border-[var(--bright-orange)] bg-[var(--bright-orange)]/5 shadow-md" 
            : "border-[var(--neutral-gray)] hover:shadow-md"
        }`}
        onClick={() => !isGenerating && handleReportToggle(report.id)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                isSelected ? "bg-[var(--bright-orange)] text-white" : "bg-gray-100 text-[var(--neutral-gray)]"
              }`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-[var(--color-deep-navy)]">
                  {report.title}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge 
                    variant="secondary" 
                    className="capitalize text-xs bg-gray-100 text-[var(--neutral-gray)]"
                  >
                    {report.category}
                  </Badge>
                  <span className="text-xs text-[var(--neutral-gray)] flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {report.estimatedTime}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isGenerating && (
                <div className="flex items-center">
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-[var(--success-green)]" />
                  ) : (
                    <Loader2 className="w-5 h-5 text-[var(--bright-orange)] animate-spin" />
                  )}
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  previewReport(report.id);
                }}
                className="p-1 text-[var(--neutral-gray)] hover:text-[var(--bright-orange)] transition-colors"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--neutral-gray)] mb-3">
            {report.description}
          </p>
          <div className="space-y-1">
            <p className="text-xs font-medium text-[var(--color-deep-navy)]">Includes:</p>
            <div className="flex flex-wrap gap-1">
              {report.dataPoints.slice(0, 3).map((point, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className="text-xs border-[var(--neutral-gray)] text-[var(--neutral-gray)]"
                >
                  {point}
                </Badge>
              ))}
              {report.dataPoints.length > 3 && (
                <Badge 
                  variant="outline" 
                  className="text-xs border-[var(--neutral-gray)] text-[var(--neutral-gray)]"
                >
                  +{report.dataPoints.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-[var(--neutral-gray)] p-6">
        <h1 className="text-2xl font-bold text-[var(--color-deep-navy)]">Generate Reports</h1>
        <p className="text-[var(--neutral-gray)] mt-2">
          Create comprehensive reports for fleet management, compliance, and analytics
        </p>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="text-center">
              <FileText className="w-12 h-12 text-[var(--bright-orange)] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[var(--color-deep-navy)] mb-2">
                Report Preview
              </h3>
              <p className="text-[var(--neutral-gray)] mb-4">
                Generating preview for {reportTypes.find(r => r.id === showPreview)?.title}...
              </p>
              <Loader2 className="w-6 h-6 text-[var(--bright-orange)] animate-spin mx-auto" />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="space-y-6">
          {/* Date Range */}
          <Card className="shadow-sm border border-[var(--neutral-gray)]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[var(--color-deep-navy)] flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Date Range
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-deep-navy)] mb-2">
                  From Date *
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--neutral-gray)] rounded-lg focus:ring-2 focus:ring-[var(--bright-orange)] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-deep-navy)] mb-2">
                  To Date *
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--neutral-gray)] rounded-lg focus:ring-2 focus:ring-[var(--bright-orange)] focus:border-transparent"
                />
              </div>
            </CardContent>
          </Card>

          {/* Format Selection */}
          <Card className="shadow-sm border border-[var(--neutral-gray)]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[var(--color-deep-navy)]">
                Report Format
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { value: "pdf", label: "PDF Document", desc: "Formatted for viewing and printing" },
                  { value: "excel", label: "Excel Spreadsheet", desc: "Data analysis and manipulation" },
                  { value: "csv", label: "CSV File", desc: "Raw data for custom processing" }
                ].map((format) => (
                  <label key={format.value} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="reportFormat"
                      value={format.value}
                      checked={filters.reportFormat === format.value}
                      onChange={(e) => handleFilterChange("reportFormat", e.target.value as "pdf" | "csv" | "excel")}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-sm font-medium text-[var(--color-deep-navy)]">{format.label}</p>
                      <p className="text-xs text-[var(--neutral-gray)]">{format.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card className="shadow-sm border border-[var(--neutral-gray)]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[var(--color-deep-navy)] flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Vehicles Filter */}
              <div>
                <p className="text-sm font-medium text-[var(--color-deep-navy)] mb-2">Vehicles</p>
                <div className="space-y-1">
                  {mockVehicles.map((vehicle) => (
                    <label key={vehicle.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.vehicles.includes(vehicle.id)}
                        onChange={(e) => handleArrayFilterChange("vehicles", vehicle.id, e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm text-[var(--neutral-gray)]">{vehicle.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Drivers Filter */}
              <div>
                <p className="text-sm font-medium text-[var(--color-deep-navy)] mb-2">Drivers</p>
                <div className="space-y-1">
                  {mockDrivers.map((driver) => (
                    <label key={driver.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.drivers.includes(driver.id)}
                        onChange={(e) => handleArrayFilterChange("drivers", driver.id, e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm text-[var(--neutral-gray)]">{driver.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeCategory === category.id
                    ? "bg-[var(--bright-orange)] text-white"
                    : "bg-gray-100 text-[var(--neutral-gray)] hover:bg-gray-200"
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>

          {/* Report Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>

          {/* Selected Reports Summary */}
          {selectedReports.length > 0 && (
            <Card className="shadow-sm border border-[var(--bright-orange)] bg-[var(--bright-orange)]/5">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[var(--color-deep-navy)]">
                  Selected Reports ({selectedReports.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedReports.map((reportId) => {
                    const report = reportTypes.find(r => r.id === reportId);
                    return (
                      <Badge 
                        key={reportId}
                        variant="secondary" 
                        className="bg-[var(--bright-orange)] text-white flex items-center gap-1"
                      >
                        {report?.title}
                        <button
                          onClick={() => handleReportToggle(reportId)}
                          className="ml-1 hover:text-gray-300"
                        >
                          ×
                        </button>
                      </Badge>
                    );
                  })}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-[var(--neutral-gray)]">
                    <p>Estimated generation time: {Math.max(2, selectedReports.length * 2)} - {selectedReports.length * 3} minutes</p>
                    <p>Format: {filters.reportFormat.toUpperCase()}</p>
                  </div>
                  
                  <Button
                    onClick={generateReports}
                    disabled={isGenerating || selectedReports.length === 0}
                    className="bg-[var(--bright-orange)] hover:bg-[var(--warm-yellow)] text-white font-medium"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Generate Reports
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generation Progress */}
          {isGenerating && Object.keys(generationProgress).length > 0 && (
            <Card className="shadow-sm border border-[var(--neutral-gray)]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[var(--color-deep-navy)]">
                  Generation Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(generationProgress).map(([reportId, completed]) => {
                    const report = reportTypes.find(r => r.id === reportId);
                    return (
                      <div key={reportId} className="flex items-center justify-between">
                        <span className="text-sm text-[var(--neutral-gray)]">{report?.title}</span>
                        <div className="flex items-center space-x-2">
                          {completed ? (
                            <CheckCircle className="w-5 h-5 text-[var(--success-green)]" />
                          ) : (
                            <Loader2 className="w-5 h-5 text-[var(--bright-orange)] animate-spin" />
                          )}
                          <span className="text-xs text-[var(--neutral-gray)]">
                            {completed ? "Complete" : "Processing..."}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
