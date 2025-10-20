"use client";

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  BarChart3,
  Activity,
} from 'lucide-react';

interface StatCard {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ElementType;
  colorClass: string;
}

interface PaymentStatusData {
  status: string;
  count: number;
  amount: number;
  percentage: string;
  color: string;
}

interface RecentPayment {
  id: string;
  customerName: string;
  childName: string;
  amount: number;
  status: string;
  date: string;
  paymentMethod: string;
}

interface TopCustomer {
  name: string;
  totalPaid: number;
  paymentsCount: number;
  reliability: number;
}

interface StatisticsResponse {
  primaryMetrics: {
    todayRevenue: { amount: number; count: number };
    periodRevenue: { amount: number; count: number };
    pendingPayments: { amount: number; count: number };
    overduePayments: { amount: number; count: number };
  };
  secondaryMetrics: {
    collectionRate: string;
    gracePeriodPayments: { amount: number; count: number };
    prepaidRevenue: { amount: number; count: number };
    failedPayments: { count: number };
  };
  additionalStats: {
    averagePaymentPerChild: number;
    onTimePaymentRate: string;
    averageDaysToPayment: number;
  };
}

interface RiskIndicatorsData {
  multipleOverdue: { count: number; customerIds: number[] };
  highCarryForward: { amount: number; count: number };
  gracePeriodExpiring: { count: number };
}

interface QuickInsightsData {
  avgPaymentPerChild: number;
  onTimeRate: string;
  avgDaysToPayment: number;
  priceAdjustments: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function FinanceStatisticsPage() {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<StatisticsResponse | null>(null);
  const [paymentStatusData, setPaymentStatusData] = useState<PaymentStatusData[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);
  const [riskIndicators, setRiskIndicators] = useState<RiskIndicatorsData | null>(null);
  const [quickInsights, setQuickInsights] = useState<QuickInsightsData | null>(null);

  interface PaymentStatusItem {
    status: string;
    count: number;
    amount: number;
    percentage: string;
  }

  const mapPaymentStatusData = React.useCallback((data: PaymentStatusItem[] | unknown): PaymentStatusData[] => {
    // Handle if data is not an array
    if (!Array.isArray(data)) {
      return [];
    }

    const colorMap: Record<string, string> = {
      PAID: 'bg-green-500',
      PENDING: 'bg-yellow-500',
      OVERDUE: 'bg-red-500',
      GRACE_PERIOD: 'bg-orange-500',
      CANCELLED: 'bg-gray-500',
      NOT_DUE: 'bg-blue-500',
      AWAITING_CONFIRMATION: 'bg-purple-500',
    };

    return data.map(item => ({
      status: item.status,
      count: item.count || 0,
      amount: item.amount || 0,
      percentage: item.percentage || '0%',
      color: colorMap[item.status] || 'bg-gray-500',
    }));
  }, []);

  const fetchAllData = React.useCallback(async () => {
    setLoading(true);
    try {
      const fetchWithErrorHandling = async (url: string) => {
        try {
          const response = await fetch(url);
          if (!response.ok) {
            return null;
          }
          return await response.json();
        } catch {
          return null;
        }
      };

      const [stats, statusDist, topCust, recentPay, riskInd, insights] = await Promise.all([
        fetchWithErrorHandling(`${API_BASE_URL}/finance-statistics/overview?timeRange=${timeRange}`),
        fetchWithErrorHandling(`${API_BASE_URL}/finance-statistics/payment-status-distribution`),
        fetchWithErrorHandling(`${API_BASE_URL}/finance-statistics/top-customers?limit=5`),
        fetchWithErrorHandling(`${API_BASE_URL}/finance-statistics/recent-payments?limit=5`),
        fetchWithErrorHandling(`${API_BASE_URL}/finance-statistics/risk-indicators`),
        fetchWithErrorHandling(`${API_BASE_URL}/finance-statistics/quick-insights`),
      ]);

      setStatistics(stats || null);
      setPaymentStatusData(statusDist ? mapPaymentStatusData(statusDist) : []);
      setTopCustomers(Array.isArray(topCust) ? topCust : []);
      setRecentPayments(Array.isArray(recentPay) ? recentPay : []);
      setRiskIndicators(riskInd || null);
      setQuickInsights(insights || null);
    } catch {
      // Error fetching statistics
    } finally {
      setLoading(false);
    }
  }, [timeRange, mapPaymentStatusData]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Build primary stats from API data
  const primaryStats: StatCard[] = statistics ? [
    {
      title: "Today's Revenue",
      value: formatCurrency(statistics.primaryMetrics.todayRevenue.amount),
      change: `${statistics.primaryMetrics.todayRevenue.count} payments`,
      changeType: "positive",
      icon: DollarSign,
      colorClass: "bg-green-50 text-green-600"
    },
    {
      title: "Pending Payments",
      value: statistics.primaryMetrics.pendingPayments.count.toString(),
      change: formatCurrency(statistics.primaryMetrics.pendingPayments.amount),
      changeType: "neutral",
      icon: Clock,
      colorClass: "bg-yellow-50 text-yellow-600"
    },
    {
      title: timeRange === 'today' ? "Today's Revenue" : "Period Revenue",
      value: formatCurrency(statistics.primaryMetrics.periodRevenue.amount),
      change: `${statistics.primaryMetrics.periodRevenue.count} payments`,
      changeType: "positive",
      icon: TrendingUp,
      colorClass: "bg-blue-50 text-blue-600"
    },
    {
      title: "Overdue Amount",
      value: formatCurrency(statistics.primaryMetrics.overduePayments.amount),
      change: `${statistics.primaryMetrics.overduePayments.count} payments`,
      changeType: "negative",
      icon: AlertCircle,
      colorClass: "bg-red-50 text-red-600"
    }
  ] : [];

  // Secondary stats from API data
  const secondaryStats: StatCard[] = statistics ? [
    {
      title: "Collection Rate",
      value: `${statistics.secondaryMetrics.collectionRate}%`,
      change: "Of expected revenue",
      changeType: "positive",
      icon: CheckCircle,
      colorClass: "bg-emerald-50 text-emerald-600"
    },
    {
      title: "Grace Period",
      value: statistics.secondaryMetrics.gracePeriodPayments.count.toString(),
      change: formatCurrency(statistics.secondaryMetrics.gracePeriodPayments.amount),
      changeType: "neutral",
      icon: Calendar,
      colorClass: "bg-orange-50 text-orange-600"
    },
    {
      title: "Prepaid Revenue",
      value: formatCurrency(statistics.secondaryMetrics.prepaidRevenue.amount),
      change: `${statistics.secondaryMetrics.prepaidRevenue.count} payments`,
      changeType: "positive",
      icon: TrendingUp,
      colorClass: "bg-purple-50 text-purple-600"
    },
    {
      title: "Failed Payments",
      value: statistics.secondaryMetrics.failedPayments.count.toString(),
      change: "Cancelled status",
      changeType: "neutral",
      icon: XCircle,
      colorClass: "bg-pink-50 text-pink-600"
    }
  ] : [];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PAID: "text-green-700 bg-green-100",
      PENDING: "text-yellow-700 bg-yellow-100",
      OVERDUE: "text-red-700 bg-red-100",
      GRACE_PERIOD: "text-orange-700 bg-orange-100",
      CANCELLED: "text-gray-700 bg-gray-100"
    };
    return colors[status] || "text-gray-700 bg-gray-100";
  };

  const getChangeIcon = (changeType?: 'positive' | 'negative' | 'neutral') => {
    if (changeType === 'positive') return <ArrowUpRight className="w-4 h-4" />;
    if (changeType === 'negative') return <ArrowDownRight className="w-4 h-4" />;
    return null;
  };

  const getChangeColor = (changeType?: 'positive' | 'negative' | 'neutral') => {
    if (changeType === 'positive') return "text-green-600";
    if (changeType === 'negative') return "text-red-600";
    return "text-gray-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Statistics</h1>
          <p className="text-gray-600 mt-1">Comprehensive financial analytics and insights</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex gap-2 bg-white p-1 rounded-lg shadow-sm border">
          {(['today', 'week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {primaryStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.colorClass}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              {stat.change && (
                <div className={`flex items-center gap-1 text-sm font-medium ${getChangeColor(stat.changeType)}`}>
                  {getChangeIcon(stat.changeType)}
                  <span>{stat.change}</span>
                </div>
              )}
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {secondaryStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.colorClass}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              {stat.change && (
                <div className={`flex items-center gap-1 text-sm font-medium ${getChangeColor(stat.changeType)}`}>
                  {getChangeIcon(stat.changeType)}
                  <span>{stat.change}</span>
                </div>
              )}
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Payment Status Distribution & Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Status Distribution */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-gray-700" />
            <h2 className="text-xl font-semibold text-gray-900">Payment Status Distribution</h2>
          </div>
          <div className="space-y-4">
            {paymentStatusData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-700">{item.status}</span>
                  <div className="text-right">
                    <span className="font-semibold text-gray-900">{item.count} payments</span>
                    <span className="text-gray-500 ml-2">({item.percentage}%)</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full ${item.color}`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 min-w-[100px] text-right">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700">Total</span>
              <div className="text-right">
                <span className="text-lg font-bold text-gray-900">
                  {paymentStatusData.reduce((sum, item) => sum + item.count, 0)} payments
                </span>
                <p className="text-sm text-gray-600">
                  {formatCurrency(paymentStatusData.reduce((sum, item) => sum + item.amount, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Paying Customers */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-gray-700" />
            <h2 className="text-xl font-semibold text-gray-900">Top Paying Customers</h2>
          </div>
          <div className="space-y-4">
            {topCustomers.map((customer, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{customer.name}</p>
                    <p className="text-sm text-gray-600">{customer.paymentsCount} payments</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatCurrency(customer.totalPaid)}</p>
                  <div className="flex items-center gap-1 text-sm">
                    <div className="w-12 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${customer.reliability}%` }}
                      />
                    </div>
                    <span className="text-gray-600 text-xs">{customer.reliability}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Payments & Monthly Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Payments - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-gray-700" />
              <h2 className="text-xl font-semibold text-gray-900">Recent Payments</h2>
            </div>
            <a href="/finance-manager/payments" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All →
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Payment ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Child</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Method</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{payment.id}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{payment.customerName}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{payment.childName}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{payment.paymentMethod}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-gray-700" />
            <h2 className="text-xl font-semibold text-gray-900">Quick Insights</h2>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">Avg. Payment/Child</span>
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-900">
                {quickInsights ? formatCurrency(quickInsights.avgPaymentPerChild) : 'Loading...'}
              </p>
              <p className="text-xs text-blue-700 mt-1">Per month per child</p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-900">On-time Payment Rate</span>
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-900">
                {quickInsights ? `${quickInsights.onTimeRate}%` : 'Loading...'}
              </p>
              <p className="text-xs text-green-700 mt-1">Paid on or before due date</p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-900">Avg. Days to Payment</span>
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-900">
                {quickInsights ? `${quickInsights.avgDaysToPayment.toFixed(1)} days` : 'Loading...'}
              </p>
              <p className="text-xs text-purple-700 mt-1">From due date to payment</p>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-orange-900">Price Adjustments</span>
                <AlertCircle className="w-4 h-4 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-orange-900">
                {quickInsights ? quickInsights.priceAdjustments : 'Loading...'}
              </p>
              <p className="text-xs text-orange-700 mt-1">Active adjustments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Indicators */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <h2 className="text-xl font-semibold text-gray-900">Risk Indicators</h2>
        </div>
        {riskIndicators ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border-l-4 border-red-500 bg-red-50 rounded">
              <p className="text-sm font-medium text-red-900 mb-1">Multiple Overdue Payments</p>
              <p className="text-2xl font-bold text-red-900">
                {riskIndicators.multipleOverdue.count} customers
              </p>
              <p className="text-xs text-red-700 mt-1">Requires immediate attention</p>
            </div>
            <div className="p-4 border-l-4 border-orange-500 bg-orange-50 rounded">
              <p className="text-sm font-medium text-orange-900 mb-1">High Carry-Forward Due</p>
              <p className="text-2xl font-bold text-orange-900">
                {formatCurrency(riskIndicators.highCarryForward.amount)}
              </p>
              <p className="text-xs text-orange-700 mt-1">
                {riskIndicators.highCarryForward.count} accounts affected
              </p>
            </div>
            <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 rounded">
              <p className="text-sm font-medium text-yellow-900 mb-1">Grace Period Expiring</p>
              <p className="text-2xl font-bold text-yellow-900">
                {riskIndicators.gracePeriodExpiring.count} payments
              </p>
              <p className="text-xs text-yellow-700 mt-1">Within next 7 days</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">Loading risk indicators...</div>
        )}
      </div>
    </div>
  );
}
