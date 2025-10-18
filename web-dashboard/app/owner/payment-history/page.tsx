"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  Filter,
  Download,
  FileText,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Payment {
  id: string;
  paymentId: string;
  date: string;
  schoolName: string;
  amount: number;
  status: "Paid" | "Failed" | "Pending";
  invoiceUrl?: string;
}

const mockPayments: Payment[] = [
  {
    id: "1",
    paymentId: "PAY-001234",
    date: "2025-07-15",
    schoolName: "Greenwood Elementary School",
    amount: 2450.00,
    status: "Paid",
    invoiceUrl: "/invoices/PAY-001234.pdf",
  },
  {
    id: "2",
    paymentId: "PAY-001235",
    date: "2025-07-14",
    schoolName: "Riverside High School",
    amount: 3200.00,
    status: "Paid",
    invoiceUrl: "/invoices/PAY-001235.pdf",
  },
  {
    id: "3",
    paymentId: "PAY-001236",
    date: "2025-07-13",
    schoolName: "Oak Valley Middle School",
    amount: 1850.00,
    status: "Pending",
  },
  {
    id: "4",
    paymentId: "PAY-001237",
    date: "2025-07-12",
    schoolName: "Sunset Primary Academy",
    amount: 2100.00,
    status: "Failed",
  },
  {
    id: "5",
    paymentId: "PAY-001238",
    date: "2025-07-11",
    schoolName: "Mountain View School",
    amount: 2750.00,
    status: "Paid",
    invoiceUrl: "/invoices/PAY-001238.pdf",
  },
  {
    id: "6",
    paymentId: "PAY-001239",
    date: "2025-07-10",
    schoolName: "Pine Grove Elementary",
    amount: 1920.00,
    status: "Pending",
  },
  {
    id: "7",
    paymentId: "PAY-001240",
    date: "2025-07-09",
    schoolName: "Westfield Academy",
    amount: 3450.00,
    status: "Paid",
    invoiceUrl: "/invoices/PAY-001240.pdf",
  },
  {
    id: "8",
    paymentId: "PAY-001241",
    date: "2025-07-08",
    schoolName: "Heritage Middle School",
    amount: 2650.00,
    status: "Failed",
  },
];

export default function PaymentHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredPayments, setFilteredPayments] = useState(mockPayments);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayments = filteredPayments.slice(startIndex, endIndex);

  // Calculate monthly summary
  const totalRevenue = filteredPayments
    .filter((payment) => payment.status === "Paid")
    .reduce((sum, payment) => sum + payment.amount, 0);

  const pendingDues = filteredPayments
    .filter((payment) => payment.status === "Pending")
    .reduce((sum, payment) => sum + payment.amount, 0);

  const failedPayments = filteredPayments
    .filter((payment) => payment.status === "Failed")
    .reduce((sum, payment) => sum + payment.amount, 0);

  const handleFilter = () => {
    let filtered = mockPayments;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (payment) =>
          payment.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.paymentId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (selectedStatus) {
      filtered = filtered.filter((payment) => payment.status === selectedStatus);
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter((payment) => payment.date >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter((payment) => payment.date <= dateTo);
    }

    setFilteredPayments(filtered);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStatus("");
    setDateFrom("");
    setDateTo("");
    setFilteredPayments(mockPayments);
    setCurrentPage(1);
  };

  const handleExport = (format: "csv" | "pdf") => {
    // Simulate export functionality
    console.log(`Exporting ${format.toUpperCase()}...`);
    
    if (format === "csv") {
      // Create CSV content
      const headers = ["Payment ID", "Date", "School Name", "Amount", "Status"];
      const csvContent = [
        headers.join(","),
        ...filteredPayments.map(payment => [
          payment.paymentId,
          payment.date,
          `"${payment.schoolName}"`,
          payment.amount,
          payment.status
        ].join(","))
      ].join("\n");

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payment-history-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      // For PDF, you would typically use a library like jsPDF
      alert("PDF export functionality would be implemented with a PDF library");
    }
  };

  const downloadInvoice = (paymentId: string, invoiceUrl?: string) => {
    if (invoiceUrl) {
      // Simulate invoice download
      console.log(`Downloading invoice for ${paymentId}`);
      // In a real app, you would handle the actual file download
      alert(`Downloading invoice for ${paymentId}`);
    }
  };

  const PaymentStatusBadge: React.FC<{ status: Payment["status"] }> = ({ status }) => {
    const statusConfig = {
      Paid: "bg-[var(--success-bg)] text-[var(--success-green)]",
      Failed: "bg-[var(--error-bg)] text-[var(--error-red)]",
      Pending: "bg-[var(--warm-yellow)]/20 text-[var(--warning-amber)]",
    };

    return (
      <Badge variant="secondary" className={statusConfig[status]}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-[var(--neutral-gray)] p-6">
        <h1 className="text-2xl font-bold text-[var(--color-deep-navy)]">Payment History</h1>
        <p className="text-[var(--neutral-gray)] mt-2">
          View all payment transactions and earnings
        </p>
      </div>

      {/* Monthly Summary */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Monthly Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Revenue */}
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-xl font-bold text-blue-900">
                  Rs {totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Pending Dues */}
            <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg">
              <div className="p-2 bg-yellow-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Dues</p>
                <p className="text-xl font-bold text-red-600">
                  Rs {pendingDues.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Failed Payments */}
            <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg">
              <div className="p-2 bg-red-100 rounded-full">
                <DollarSign className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Failed Payments</p>
                <p className="text-xl font-bold text-red-600">
                  Rs {failedPayments.toLocaleString()}
                </p>
              </div>
            </div>
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
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--neutral-gray)] w-4 h-4" />
              <input
                type="text"
                placeholder="Search school name or payment ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[var(--neutral-gray)] rounded-lg focus:ring-2 focus:ring-[var(--bright-orange)] focus:border-transparent"
              />
            </div>

            {/* Date From */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                placeholder="From Date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Date To */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                placeholder="To Date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Payment Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>

            {/* Filter Button */}
            <div className="flex gap-2">
              <Button
                onClick={handleFilter}
                variant="outline"
                className="border-gray-400 text-gray-700 hover:bg-gray-700 hover:text-white"
              >
                <Filter className="w-4 h-4 mr-2" />
                Apply
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <Button
              onClick={clearFilters}
              variant="outline"
              className="border-gray-400 text-gray-700 hover:bg-gray-700 hover:text-white"
            >
              Clear Filters
            </Button>

            {/* Export Options */}
            <div className="flex gap-2">
              <Button
                onClick={() => handleExport("csv")}
                variant="outline"
                className="border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button
                onClick={() => handleExport("pdf")}
                variant="outline"
                className="border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  School Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentPayments.map((payment) => (
                <tr
                  key={payment.id}
                  className="hover:bg-blue-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {payment.paymentId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(payment.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {payment.schoolName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    Rs {payment.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PaymentStatusBadge status={payment.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {payment.invoiceUrl ? (
                      <button
                        onClick={() => downloadInvoice(payment.paymentId, payment.invoiceUrl)}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredPayments.length)} of{" "}
                {filteredPayments.length} payments
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-blue-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      currentPage === page
                        ? "bg-blue-900 text-white"
                        : "text-blue-600 hover:bg-blue-900 hover:text-white"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-blue-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No payments found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
