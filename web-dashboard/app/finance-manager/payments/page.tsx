"use client";
import React, { useState } from 'react'

export default function PaymentsPage() {
  const [selectedTab, setSelectedTab] = useState('pending');

  const pendingPayments = [
    {
      id: 'PAY-001',
      customerName: 'Sarah Johnson',
      childName: 'Emma Johnson',
      amount: 15000.00,
      month: 'October 2025',
      dueDate: '2025-10-25',
      paymentMethod: 'Bank Transfer',
      status: 'Pending Verification',
      transactionRef: 'TXN123456789',
      submittedDate: '2025-10-19'
    },
    {
      id: 'PAY-002',
      customerName: 'Michael Brown',
      childName: 'Alex Brown',
      amount: 12500.00,
      month: 'October 2025',
      dueDate: '2025-10-25',
      paymentMethod: 'Online Payment',
      status: 'Processing',
      transactionRef: 'TXN987654321',
      submittedDate: '2025-10-18'
    }
  ];

  const processedPayments = [
    {
      id: 'PAY-050',
      customerName: 'David Wilson',
      childName: 'Lucy Wilson',
      amount: 18000.00,
      month: 'September 2025',
      processedDate: '2025-09-15',
      status: 'Completed'
    }
  ];

  const failedPayments = [
    {
      id: 'PAY-100',
      customerName: 'Lisa Davis',
      childName: 'Tom Davis',
      amount: 14000.00,
      month: 'October 2025',
      failureReason: 'Insufficient Funds',
      failedDate: '2025-10-17',
      status: 'Failed'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending Verification': return 'bg-yellow-100 text-yellow-800';
      case 'Processing': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Payment Management</h1>
        <p className="text-gray-600">Process, verify, and manage customer payments</p>
      </div>

      {/* Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm text-gray-600">Pending Payments</div>
          <div className="text-2xl font-bold text-yellow-600">23</div>
          <div className="text-xs text-gray-500">Awaiting verification</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm text-gray-600">Today&apos;s Revenue</div>
          <div className="text-2xl font-bold text-green-600">LKR 450K</div>
          <div className="text-xs text-gray-500">+12% from yesterday</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm text-gray-600">Failed Payments</div>
          <div className="text-2xl font-bold text-red-600">5</div>
          <div className="text-xs text-gray-500">Require attention</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm text-gray-600">Monthly Total</div>
          <div className="text-2xl font-bold text-blue-600">LKR 2.1M</div>
          <div className="text-xs text-gray-500">October 2025</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm text-gray-600">Success Rate</div>
          <div className="text-2xl font-bold text-purple-600">94.2%</div>
          <div className="text-xs text-gray-500">This month</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-4 rounded-lg shadow border mb-6">
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Bulk Approve Payments
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Generate Payment Report
          </button>
          <button className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">
            Send Payment Reminders
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
            Export Financial Data
          </button>
        </div>
      </div>

      {/* Payment Tabs */}
      <div className="bg-white rounded-lg shadow border">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setSelectedTab('pending')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Pending Verification ({pendingPayments.length})
            </button>
            <button
              onClick={() => setSelectedTab('processed')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'processed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Processed Payments
            </button>
            <button
              onClick={() => setSelectedTab('failed')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'failed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Failed Payments ({failedPayments.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === 'pending' && (
            <div className="space-y-4">
              {pendingPayments.map((payment) => (
                <div key={payment.id} className="border rounded-lg p-6 bg-gray-50">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{payment.customerName}</h3>
                      <p className="text-sm text-gray-600">Child: {payment.childName}</p>
                      <p className="text-sm text-gray-600">Payment ID: {payment.id}</p>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-2 ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{formatCurrency(payment.amount)}</div>
                      <div className="text-sm text-gray-600">Due: {payment.dueDate}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Payment Details</h4>
                      <div className="space-y-1 text-sm">
                        <div><span className="text-gray-600">Month:</span> {payment.month}</div>
                        <div><span className="text-gray-600">Method:</span> {payment.paymentMethod}</div>
                        <div><span className="text-gray-600">Reference:</span> {payment.transactionRef}</div>
                        <div><span className="text-gray-600">Submitted:</span> {payment.submittedDate}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                      View Receipt
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                      Approve Payment
                    </button>
                    <button className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">
                      Request Clarification
                    </button>
                    <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                      Reject Payment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedTab === 'processed' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Child</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Processed Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {processedPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900">{payment.customerName}</div>
                        <div className="text-sm text-gray-500">ID: {payment.id}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">{payment.childName}</td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{formatCurrency(payment.amount)}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{payment.month}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{payment.processedDate}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-800 text-sm">View Receipt</button>
                          <button className="text-gray-600 hover:text-gray-800 text-sm">Download</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selectedTab === 'failed' && (
            <div className="space-y-4">
              {failedPayments.map((payment) => (
                <div key={payment.id} className="border rounded-lg p-6 bg-red-50 border-red-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{payment.customerName}</h3>
                      <p className="text-sm text-gray-600">Child: {payment.childName}</p>
                      <p className="text-sm text-gray-600">Payment ID: {payment.id}</p>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-2 ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{formatCurrency(payment.amount)}</div>
                      <div className="text-sm text-red-600">Failed: {payment.failedDate}</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm">
                      <span className="text-gray-600">Failure Reason:</span> 
                      <span className="text-red-600 font-medium ml-1">{payment.failureReason}</span>
                    </div>
                    <div className="text-sm text-gray-600">Month: {payment.month}</div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-red-200">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                      Contact Customer
                    </button>
                    <button className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">
                      Retry Payment
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                      Manual Adjustment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
