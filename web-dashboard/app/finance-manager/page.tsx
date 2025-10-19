"use client";
import React from 'react';

export default function FinanceManagerDashboard() {
  const recentPayments = [
    {
      id: 'TXN-12345',
      customerPhone: '+94771234567',
      childName: 'Emma Johnson',
      amount: 15000.00,
      status: 'Pending Approval',
      timestamp: '2 hours ago'
    },
    {
      id: 'TXN-12346',
      customerPhone: '+94771234568',
      childName: 'Alex Brown',
      amount: 12500.00,
      status: 'Completed',
      timestamp: '4 hours ago'
    },
    {
      id: 'TXN-12347',
      customerPhone: '+94771234569',
      childName: 'Sofia Davis',
      amount: 18000.00,
      status: 'Failed',
      timestamp: '6 hours ago'
    }
  ];

  const pendingPayouts = [
    {
      id: 'PO-001',
      payeeName: 'Kasun Perera',
      type: 'Driver',
      amount: 85000.00,
      period: 'September 2025'
    },
    {
      id: 'PO-002',
      payeeName: 'Kumar Transport',
      type: 'Owner',
      amount: 450000.00,
      period: 'September 2025'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending Approval': return 'text-yellow-600 bg-yellow-100';
      case 'Completed': return 'text-green-600 bg-green-100';
      case 'Failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Finance Manager Dashboard</h1>
        <p className="text-gray-600">Monitor payments, approve payouts, and manage financial operations</p>
      </div>

      {/* Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-sm text-gray-600 mb-1">Today&apos;s Revenue</div>
          <div className="text-3xl font-bold text-green-600">LKR 485K</div>
          <div className="text-sm text-green-600">+12.5% from yesterday</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-sm text-gray-600 mb-1">Pending Payments</div>
          <div className="text-3xl font-bold text-yellow-600">23</div>
          <div className="text-sm text-gray-600">Worth LKR 340K</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-sm text-gray-600 mb-1">Monthly Revenue</div>
          <div className="text-3xl font-bold text-blue-600">LKR 8.2M</div>
          <div className="text-sm text-blue-600">October 2025</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-sm text-gray-600 mb-1">Pending Payouts</div>
          <div className="text-3xl font-bold text-purple-600">8</div>
          <div className="text-sm text-gray-600">Worth LKR 2.1M</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <a 
          href="/finance-manager/payments" 
          className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              💳
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Handle Payments</h3>
              <p className="text-sm text-gray-600">Process incoming payments</p>
            </div>
          </div>
          <div className="text-sm text-blue-600">23 pending verification →</div>
        </a>

        <a 
          href="/finance-manager/approve-payouts" 
          className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center mb-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              💰
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Approve Payouts</h3>
              <p className="text-sm text-gray-600">Review payout requests</p>
            </div>
          </div>
          <div className="text-sm text-green-600">8 awaiting approval →</div>
        </a>

        <a 
          href="/finance-manager/refunds" 
          className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center mb-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
              🔄
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Handle Refunds</h3>
              <p className="text-sm text-gray-600">Process refund requests</p>
            </div>
          </div>
          <div className="text-sm text-yellow-600">3 pending review →</div>
        </a>

        <a 
          href="/finance-manager/payment-reports" 
          className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center mb-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              📊
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
            <div className="space-y-4">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="flex justify-between items-start border-b pb-4 last:border-b-0">
                  <div>
                    <div className="font-medium text-gray-900">{payment.id}</div>
                    <div className="text-sm text-gray-600">Customer: {payment.customerPhone}</div>
                    <div className="text-sm text-gray-600">Child: {payment.childName}</div>
                    <div className="text-xs text-gray-500">{payment.timestamp}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{formatCurrency(payment.amount)}</div>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
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
          </div>
        </div>

        {/* Pending Payouts */}
        <div className="bg-white rounded-lg shadow border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Pending Payouts</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {pendingPayouts.map((payout) => (
                <div key={payout.id} className="flex justify-between items-start border-b pb-4 last:border-b-0">
                  <div>
                    <div className="font-medium text-gray-900">{payout.payeeName}</div>
                    <div className="text-sm text-gray-600">{payout.type} • {payout.id}</div>
                    <div className="text-sm text-gray-600">Period: {payout.period}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{formatCurrency(payout.amount)}</div>
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
