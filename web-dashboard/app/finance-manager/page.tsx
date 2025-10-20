"use client";

import React, { useEffect, useState } from 'react';
import { CreditCard, DollarSign, RefreshCw, FileText } from 'lucide-react';
import { api } from '@/lib/api';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Button } from '@/components/ui/button';
import type { Payment, Payout } from '@/types/api';

export default function FinanceManagerDashboard() {
  const [statistics, setStatistics] = useState({
    totalPayments: 0,
    pendingVerification: 0,
    pendingPayouts: 0,
    pendingRefunds: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
  });
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [pendingPayouts, setPendingPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch payment statistics
      const paymentStats = await api.payments.getStatistics();
      
      // Fetch recent payments
      const paymentsResponse = await api.payments.getAll({ limit: 5 });
      
      // Fetch pending payouts
      const payouts = await api.payouts.getPending();

      // Fetch refund statistics
      const refundStats = await api.refunds.getStatistics();

      setStatistics({
        totalPayments: paymentStats.overview.total || 0,
        pendingVerification: paymentStats.overview.pending || 0,
        pendingPayouts: payouts.length || 0,
        pendingRefunds: refundStats.overview.pending || 0,
        totalRevenue: paymentStats.revenue.thisMonth || 0,
        monthlyRevenue: paymentStats.revenue.thisMonth || 0,
      });

      setRecentPayments(paymentsResponse.data.slice(0, 3));
      setPendingPayouts(payouts.slice(0, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load finance data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Finance Manager Dashboard</h1>
        <p className="text-gray-600">Manage payments, payouts, and refunds for the YathraGo platform</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6">
          <ErrorAlert 
            message={error} 
            type="error" 
            onDismiss={() => setError(null)}
          />
          <div className="mt-3">
            <Button onClick={fetchData} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-blue-100 text-sm">Total Payments</p>
              <h3 className="text-3xl font-bold">
                {loading ? '...' : statistics.totalPayments}
              </h3>
            </div>
            <CreditCard className="w-8 h-8" />
          </div>
          <p className="text-sm text-blue-100">
            {loading ? '...' : formatCurrency(statistics.totalRevenue)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-green-100 text-sm">Monthly Revenue</p>
              <h3 className="text-3xl font-bold">
                {loading ? '...' : formatCurrency(statistics.monthlyRevenue)}
              </h3>
            </div>
            <DollarSign className="w-8 h-8" />
          </div>
          <p className="text-sm text-green-100">This month</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow p-6 text-white">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-yellow-100 text-sm">Pending Actions</p>
              <h3 className="text-3xl font-bold">
                {loading ? '...' : (statistics.pendingVerification + statistics.pendingPayouts + statistics.pendingRefunds)}
              </h3>
            </div>
            <RefreshCw className="w-8 h-8" />
          </div>
          <p className="text-sm text-yellow-100">Require attention</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-purple-100 text-sm">Pending Payouts</p>
              <h3 className="text-3xl font-bold">
                {loading ? '...' : statistics.pendingPayouts}
              </h3>
            </div>
            <FileText className="w-8 h-8" />
          </div>
          <p className="text-sm text-purple-100">Awaiting approval</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <a 
          href="/finance-manager/payments" 
          className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Handle Payments</h3>
              <p className="text-sm text-gray-600">Process incoming payments</p>
            </div>
          </div>
          <div className="text-sm text-blue-600">
            {loading ? '...' : statistics.pendingVerification} pending verification →
          </div>
        </a>

        <a 
          href="/finance-manager/approve-payouts" 
          className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center mb-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Approve Payouts</h3>
              <p className="text-sm text-gray-600">Review payout requests</p>
            </div>
          </div>
          <div className="text-sm text-green-600">
            {loading ? '...' : statistics.pendingPayouts} awaiting approval →
          </div>
        </a>

        <a 
          href="/finance-manager/refunds" 
          className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center mb-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
              <RefreshCw className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Handle Refunds</h3>
              <p className="text-sm text-gray-600">Process refund requests</p>
            </div>
          </div>
          <div className="text-sm text-yellow-600">
            {loading ? '...' : statistics.pendingRefunds} pending review →
          </div>
        </a>

        <a 
          href="/finance-manager/payment-reports" 
          className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center mb-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Payment Reports</h3>
              <p className="text-sm text-gray-600">View financial reports</p>
            </div>
          </div>
          <div className="text-sm text-purple-600">Generate reports →</div>
        </a>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Payments */}
        <div className="bg-white rounded-lg shadow border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Recent Payments</h3>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading payments...</div>
            ) : recentPayments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No recent payments</div>
            ) : (
              <>
                <div className="space-y-4">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {recentPayments.map((payment: any, index) => (
                    <div key={payment.id || index} className="flex justify-between items-start border-b pb-4 last:border-b-0">
                      <div>
                        <div className="font-medium text-gray-900">Payment #{payment.id}</div>
                        <div className="text-sm text-gray-600">
                          {payment.child?.name || 'N/A'} • {payment.child?.parent?.phoneNumber || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {payment.createdAt ? new Date(payment.createdAt).toLocaleString() : 'N/A'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{formatCurrency(Number(payment.amount) || 0)}</div>
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(String(payment.status))}`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <a href="/finance-manager/payments" className="text-blue-600 hover:text-blue-800 text-sm">
                    View all payments →
                  </a>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Pending Payouts */}
        <div className="bg-white rounded-lg shadow border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Pending Payouts</h3>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading payouts...</div>
            ) : pendingPayouts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No pending payouts</div>
            ) : (
              <>
                <div className="space-y-4">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {pendingPayouts.map((payout: any, index) => (
                    <div key={payout.id || index} className="flex justify-between items-start border-b pb-4 last:border-b-0">
                      <div>
                        <div className="font-medium text-gray-900">
                          {payout.driver?.name || payout.owner?.username || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {payout.type} • Payout #{payout.id}
                        </div>
                        <div className="text-sm text-gray-600">
                          Period: {payout.periodStart ? new Date(payout.periodStart).toLocaleDateString() : 'N/A'} - {payout.periodEnd ? new Date(payout.periodEnd).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{formatCurrency(Number(payout.amount) || 0)}</div>
                        <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <a href="/finance-manager/approve-payouts" className="text-blue-600 hover:text-blue-800 text-sm">
                    View all payouts →
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Financial Summary Charts Placeholder */}
      <div className="mt-8 bg-white rounded-lg shadow border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">94.2%</div>
            <div className="text-sm text-gray-600">Payment Success Rate</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">2.1 days</div>
            <div className="text-sm text-gray-600">Avg. Processing Time</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">LKR 18.5K</div>
            <div className="text-sm text-gray-600">Avg. Transaction Value</div>
          </div>
        </div>
      </div>
    </div>
  );
}
