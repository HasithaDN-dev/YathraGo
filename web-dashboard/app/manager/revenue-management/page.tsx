"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard,
  Building,
  Users,
} from "lucide-react";

interface RevenueData {
  period: string;
  totalRevenue: number;
  collections: number;
  pending: number;
  expenses: number;
  netProfit: number;
  growthRate: number;
}

interface PaymentEntry {
  id: string;
  schoolName: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: "paid" | "pending" | "overdue";
  ownerName: string;
  vehicleCount: number;
}

const mockRevenueData: RevenueData[] = [
  {
    period: "July 2025",
    totalRevenue: 2450000,
    collections: 2200000,
    pending: 250000,
    expenses: 1800000,
    netProfit: 400000,
    growthRate: 12.5,
  },
  {
    period: "June 2025",
    totalRevenue: 2180000,
    collections: 2050000,
    pending: 130000,
    expenses: 1650000,
    netProfit: 400000,
    growthRate: 8.2,
  },
  {
    period: "May 2025",
    totalRevenue: 2015000,
    collections: 1900000,
    pending: 115000,
    expenses: 1580000,
    netProfit: 320000,
    growthRate: 5.8,
  },
];

const mockPayments: PaymentEntry[] = [
  {
    id: "1",
    schoolName: "Greenwood Elementary School",
    amount: 245000,
    dueDate: "2025-07-25",
    paidDate: "2025-07-23",
    status: "paid",
    ownerName: "Rajesh Kumar",
    vehicleCount: 3,
  },
  {
    id: "2",
    schoolName: "Riverside High School",
    amount: 320000,
    dueDate: "2025-07-28",
    status: "pending",
    ownerName: "Priya Sharma",
    vehicleCount: 4,
  },
  {
    id: "3",
    schoolName: "Oak Valley Middle School",
    amount: 185000,
    dueDate: "2025-07-20",
    status: "overdue",
    ownerName: "Mohammed Ali",
    vehicleCount: 2,
  },
  {
    id: "4",
    schoolName: "Sunset Primary Academy",
    amount: 210000,
    dueDate: "2025-07-30",
    status: "pending",
    ownerName: "Sunita Reddy",
    vehicleCount: 2,
  },
];

export default function RevenueManagementPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("July 2025");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const currentData = mockRevenueData.find(data => data.period === selectedPeriod) || mockRevenueData[0];
  
  const filteredPayments = mockPayments.filter(payment => {
    if (paymentFilter === "") return true;
    return payment.status === paymentFilter;
  });

  const getStatusBadge = (status: PaymentEntry["status"]) => {
    const config = {
      paid: { bg: "bg-[var(--success-bg)]", text: "text-[var(--success-green)]", icon: CheckCircle },
      pending: { bg: "bg-[var(--warm-yellow)]/20", text: "text-[var(--warning-amber)]", icon: Clock },
      overdue: { bg: "bg-[var(--error-bg)]", text: "text-[var(--error-red)]", icon: AlertTriangle },
    };

    const statusConfig = config[status];
    const IconComponent = statusConfig.icon;

    return (
      <Badge variant="secondary" className={`${statusConfig.bg} ${statusConfig.text} flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleExportRevenue = () => {
    // Simulate export functionality
    alert("Exporting revenue report...");
  };

  const handleSendReminder = (paymentId: string) => {
    alert(`Sending payment reminder for payment ID: ${paymentId}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-[var(--neutral-gray)] p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-deep-navy)]">Revenue Management</h1>
            <p className="text-[var(--neutral-gray)] mt-2">
              Monitor fleet revenue, collections, and financial performance
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-[var(--neutral-gray)] rounded-lg focus:ring-2 focus:ring-[var(--bright-orange)] focus:border-transparent"
            >
              {mockRevenueData.map((data) => (
                <option key={data.period} value={data.period}>
                  {data.period}
                </option>
              ))}
            </select>
            <Button
              onClick={handleExportRevenue}
              className="bg-[var(--bright-orange)] hover:bg-[var(--warm-yellow)] text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm border border-[var(--neutral-gray)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[var(--neutral-gray)]">
              Total Revenue
            </CardTitle>
            <DollarSign className="w-4 h-4 text-[var(--bright-orange)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--color-deep-navy)]">
              {formatCurrency(currentData.totalRevenue)}
            </div>
            <div className="flex items-center space-x-1 mt-1">
              {currentData.growthRate > 0 ? (
                <TrendingUp className="w-3 h-3 text-[var(--success-green)]" />
              ) : (
                <TrendingDown className="w-3 h-3 text-[var(--error-red)]" />
              )}
              <span className={`text-xs ${currentData.growthRate > 0 ? 'text-[var(--success-green)]' : 'text-[var(--error-red)]'}`}>
                {currentData.growthRate > 0 ? '+' : ''}{currentData.growthRate}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-[var(--neutral-gray)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[var(--neutral-gray)]">
              Collections
            </CardTitle>
            <CheckCircle className="w-4 h-4 text-[var(--success-green)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--color-deep-navy)]">
              {formatCurrency(currentData.collections)}
            </div>
            <div className="text-xs text-[var(--neutral-gray)] mt-1">
              {Math.round((currentData.collections / currentData.totalRevenue) * 100)}% of total revenue
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-[var(--neutral-gray)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[var(--neutral-gray)]">
              Pending Amount
            </CardTitle>
            <Clock className="w-4 h-4 text-[var(--warning-amber)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--color-deep-navy)]">
              {formatCurrency(currentData.pending)}
            </div>
            <div className="text-xs text-[var(--neutral-gray)] mt-1">
              {filteredPayments.filter(p => p.status !== 'paid').length} outstanding payments
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-[var(--neutral-gray)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[var(--neutral-gray)]">
              Net Profit
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-[var(--success-green)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--color-deep-navy)]">
              {formatCurrency(currentData.netProfit)}
            </div>
            <div className="text-xs text-[var(--neutral-gray)] mt-1">
              {Math.round((currentData.netProfit / currentData.totalRevenue) * 100)}% profit margin
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Breakdown Chart Placeholder */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm border border-[var(--neutral-gray)]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[var(--color-deep-navy)]">
                Revenue Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Revenue vs Expenses */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-[var(--neutral-gray)]">Revenue</span>
                    <span className="text-sm font-medium text-[var(--color-deep-navy)]">
                      {formatCurrency(currentData.totalRevenue)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-[var(--bright-orange)] h-3 rounded-full"
                      style={{ width: '100%' }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-[var(--neutral-gray)]">Expenses</span>
                    <span className="text-sm font-medium text-[var(--color-deep-navy)]">
                      {formatCurrency(currentData.expenses)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-[var(--error-red)] h-3 rounded-full"
                      style={{ width: `${(currentData.expenses / currentData.totalRevenue) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-[var(--neutral-gray)]">Net Profit</span>
                    <span className="text-sm font-medium text-[var(--color-deep-navy)]">
                      {formatCurrency(currentData.netProfit)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-[var(--success-green)] h-3 rounded-full"
                      style={{ width: `${(currentData.netProfit / currentData.totalRevenue) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <Card className="shadow-sm border border-[var(--neutral-gray)]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[var(--color-deep-navy)]">
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-[var(--bright-orange)]" />
                  <span className="text-sm text-[var(--neutral-gray)]">Active Schools</span>
                </div>
                <span className="text-sm font-medium text-[var(--color-deep-navy)]">{mockPayments.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-[var(--neutral-gray)]">Fleet Owners</span>
                </div>
                <span className="text-sm font-medium text-[var(--color-deep-navy)]">
                  {new Set(mockPayments.map(p => p.ownerName)).size}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-[var(--error-red)]" />
                  <span className="text-sm text-[var(--neutral-gray)]">Overdue Payments</span>
                </div>
                <span className="text-sm font-medium text-[var(--error-red)]">
                  {filteredPayments.filter(p => p.status === 'overdue').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-[var(--success-green)]" />
                  <span className="text-sm text-[var(--neutral-gray)]">Collection Rate</span>
                </div>
                <span className="text-sm font-medium text-[var(--success-green)]">
                  {Math.round((currentData.collections / currentData.totalRevenue) * 100)}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Management */}
      <Card className="shadow-sm border border-[var(--neutral-gray)]">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold text-[var(--color-deep-navy)]">
              Payment Management
            </CardTitle>
            <div className="flex items-center space-x-3">
              <Filter className="w-4 h-4 text-[var(--neutral-gray)]" />
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="px-3 py-1 border border-[var(--neutral-gray)] rounded focus:ring-2 focus:ring-[var(--bright-orange)] focus:border-transparent text-sm"
              >
                <option value="">All Payments</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-[var(--neutral-gray)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--neutral-gray)] uppercase tracking-wider">
                    School Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--neutral-gray)] uppercase tracking-wider">
                    Owner Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--neutral-gray)] uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--neutral-gray)] uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--neutral-gray)] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--neutral-gray)] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[var(--neutral-gray)]">
                {filteredPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Building className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--color-deep-navy)]">
                            {payment.schoolName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-[var(--color-deep-navy)]">
                          {payment.ownerName}
                        </p>
                        <p className="text-xs text-[var(--neutral-gray)]">
                          {payment.vehicleCount} vehicle{payment.vehicleCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-[var(--color-deep-navy)]">
                        {formatCurrency(payment.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-[var(--neutral-gray)]" />
                          <span className="text-sm text-[var(--neutral-gray)]">
                            {new Date(payment.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                        {payment.paidDate && (
                          <div className="flex items-center space-x-1 mt-1">
                            <CheckCircle className="w-3 h-3 text-[var(--success-green)]" />
                            <span className="text-xs text-[var(--success-green)]">
                              Paid: {new Date(payment.paidDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-500 text-blue-600 hover:bg-blue-50"
                          onClick={() => setShowDetails(showDetails === payment.id ? null : payment.id)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Details
                        </Button>
                        {payment.status !== 'paid' && (
                          <Button
                            size="sm"
                            onClick={() => handleSendReminder(payment.id)}
                            className="bg-[var(--warning-amber)] hover:bg-yellow-600 text-white"
                          >
                            Send Reminder
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-[var(--neutral-gray)] mx-auto mb-4" />
              <p className="text-[var(--neutral-gray)]">No payments found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
