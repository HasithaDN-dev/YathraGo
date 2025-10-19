"use client";
import React, { useState } from 'react';

export default function ApprovePayoutsPage() {
  const [selectedTab, setSelectedTab] = useState('pending');

  const pendingPayouts = [
    {
      id: 'PO-001',
      payeeType: 'Driver',
      payeeName: 'Kasun Perera',
      payeeId: 'DRV-123',
      amount: 85000.00,
      period: 'September 2025',
      totalTrips: 42,
      commission: 15.0,
      grossEarnings: 100000.00,
      deductions: 15000.00,
      requestDate: '2025-10-01',
      bankAccount: '**** **** **** 1234',
      status: 'Pending Review'
    },
    {
      id: 'PO-002',
      payeeType: 'Owner',
      payeeName: 'Kumar Transport Services',
      payeeId: 'OWN-456',
      amount: 450000.00,
      period: 'September 2025',
      totalTrips: 156,
      commission: 20.0,
      grossEarnings: 562500.00,
      deductions: 112500.00,
      requestDate: '2025-10-02',
      bankAccount: '**** **** **** 5678',
      status: 'Pending Approval'
    },
    {
      id: 'PO-003',
      payeeType: 'Driver',
      payeeName: 'Nimal Silva',
      payeeId: 'DRV-789',
      amount: 72000.00,
      period: 'September 2025',
      totalTrips: 38,
      commission: 15.0,
      grossEarnings: 84700.00,
      deductions: 12700.00,
      requestDate: '2025-10-03',
      bankAccount: '**** **** **** 9012',
      status: 'Pending Review'
    }
  ];

  const approvedPayouts = [
    {
      id: 'PO-050',
      payeeName: 'Sunil Fernando',
      amount: 78000.00,
      period: 'August 2025',
      approvedDate: '2025-09-15',
      processedDate: '2025-09-16',
      status: 'Processed'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending Review': return 'bg-yellow-100 text-yellow-800';
      case 'Pending Approval': return 'bg-blue-100 text-blue-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Processed': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPayeeTypeColor = (type: string) => {
    return type === 'Driver' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
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
        <h1 className="text-2xl font-semibold mb-2">Payout Approval</h1>
        <p className="text-gray-600">Review and approve driver and owner payout requests</p>
      </div>

      {/* Payout Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm text-gray-600">Pending Approvals</div>
          <div className="text-2xl font-bold text-yellow-600">8</div>
          <div className="text-xs text-gray-500">Awaiting review</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm text-gray-600">Total Amount</div>
          <div className="text-2xl font-bold text-blue-600">LKR 2.1M</div>
          <div className="text-xs text-gray-500">Pending payouts</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm text-gray-600">Processed Today</div>
          <div className="text-2xl font-bold text-green-600">15</div>
          <div className="text-xs text-gray-500">LKR 850K disbursed</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm text-gray-600">Monthly Payouts</div>
          <div className="text-2xl font-bold text-purple-600">LKR 8.5M</div>
          <div className="text-xs text-gray-500">October 2025</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm text-gray-600">Success Rate</div>
          <div className="text-2xl font-bold text-teal-600">98.5%</div>
          <div className="text-xs text-gray-500">This month</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-4 rounded-lg shadow border mb-6">
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Bulk Approve Selected
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Generate Payout Report
          </button>
          <button className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">
            Export to Bank File
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
            Payment Schedule
          </button>
        </div>
      </div>

      {/* Payout Tabs */}
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
              Pending Approval ({pendingPayouts.length})
            </button>
            <button
              onClick={() => setSelectedTab('approved')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'approved'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Approved & Processed
            </button>
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === 'pending' && (
            <div className="space-y-6">
              {pendingPayouts.map((payout) => (
                <div key={payout.id} className="border rounded-lg p-6 bg-gray-50">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{payout.payeeName}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPayeeTypeColor(payout.payeeType)}`}>
                          {payout.payeeType}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">ID: {payout.payeeId} • Payout ID: {payout.id}</p>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-2 ${getStatusColor(payout.status)}`}>
                        {payout.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{formatCurrency(payout.amount)}</div>
                      <div className="text-sm text-gray-600">Period: {payout.period}</div>
                      <div className="text-sm text-gray-600">Requested: {payout.requestDate}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Earnings Breakdown</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Trips:</span>
                          <span className="font-medium">{payout.totalTrips}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Gross Earnings:</span>
                          <span className="font-medium">{formatCurrency(payout.grossEarnings)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Commission ({payout.commission}%):</span>
                          <span className="font-medium text-red-600">-{formatCurrency(payout.grossEarnings * payout.commission / 100)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Other Deductions:</span>
                          <span className="font-medium text-red-600">-{formatCurrency(payout.deductions - (payout.grossEarnings * payout.commission / 100))}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 font-semibold">
                          <span>Net Payout:</span>
                          <span className="text-green-600">{formatCurrency(payout.amount)}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Payment Details</h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="text-gray-600">Bank Account:</span> {payout.bankAccount}</div>
                        <div><span className="text-gray-600">Payment Method:</span> Bank Transfer</div>
                        <div><span className="text-gray-600">Processing Time:</span> 1-2 Business Days</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <input type="checkbox" className="mr-2" />
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                      View Details
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                      Approve Payout
                    </button>
                    <button className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">
                      Request Clarification
                    </button>
                    <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedTab === 'approved' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payee</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approved Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Processed Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {approvedPayouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900">{payout.payeeName}</div>
                        <div className="text-sm text-gray-500">ID: {payout.id}</div>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{formatCurrency(payout.amount)}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{payout.period}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{payout.approvedDate}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{payout.processedDate}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payout.status)}`}>
                          {payout.status}
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
        </div>
      </div>
    </div>
  );
}
