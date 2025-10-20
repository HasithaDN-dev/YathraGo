"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { api } from '../../../lib/api';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Filter,
  Search,
  Download,
  TrendingUp,
  AlertCircle,
  DollarSign,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF } from '../../../lib/export-utils';

interface RefundItem {
  id: number;
  paymentId: number;
  childId: number;
  customerId: number;
  driverId: number;
  refundAmount: number;
  refundReason: string;
  refundType: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedBy: number;
  requestedByType: string;
  requestedAt: string;
  approvedBy?: number;
  approvedByType?: string;
  approvedAt?: string;
  rejectedBy?: number;
  rejectionReason?: string;
  refundMethod?: string;
  transactionRef?: string;
}

interface RefundStats {
  overview: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  totalRefundAmount: number;
}

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<RefundItem[]>([]);
  const [statistics, setStatistics] = useState<RefundStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRefund, setSelectedRefund] = useState<RefundItem | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [refundMethod, setRefundMethod] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const limit = 10;

  useEffect(() => {
    fetchRefunds();
    fetchStatistics();
  }, [page, statusFilter]);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const params: { page: number; limit: number; status?: string } = {
        page,
        limit,
      };
      
      // Only add status if it's not empty
      if (statusFilter && statusFilter.trim() !== '') {
        params.status = statusFilter;
      }
      
      const response = await api.refunds.getAll(params);
      setRefunds(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      console.error('Failed to fetch refunds:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const stats = await api.refunds.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const handleApprove = async (refund: RefundItem) => {
    setSelectedRefund(refund);
    setShowApprovalModal(true);
  };

  const confirmApproval = async () => {
    if (!selectedRefund) return;

    try {
      await api.refunds.approve(
        selectedRefund.id,
        1, // Replace with actual admin ID from auth context
        'FINANCE_MANAGER',
        refundMethod,
        transactionRef
      );
      
      setShowApprovalModal(false);
      setRefundMethod('');
      setTransactionRef('');
      setSelectedRefund(null);
      
      // Refresh data
      fetchRefunds();
      fetchStatistics();
    } catch (error) {
      console.error('Failed to approve refund:', error);
      alert('Failed to approve refund. Please try again.');
    }
  };

  const handleReject = async (refund: RefundItem) => {
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;

    try {
      await api.refunds.reject(
        refund.id,
        1, // Replace with actual admin ID from auth context
        reason
      );
      
      // Refresh data
      fetchRefunds();
      fetchStatistics();
    } catch (error) {
      console.error('Failed to reject refund:', error);
      alert('Failed to reject refund. Please try again.');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      APPROVED: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      REJECTED: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    const exportData = refunds.map(r => ({
      'Refund ID': r.id,
      'Amount': `LKR ${(r.refundAmount || 0).toLocaleString()}`,
      'Reason': r.refundReason,
      'Type': r.refundType,
      'Status': r.status,
      'Requested At': new Date(r.requestedAt).toLocaleString(),
      'Approved At': r.approvedAt ? new Date(r.approvedAt).toLocaleString() : '-',
      'Transaction Ref': r.transactionRef || '-',
    }));

    const fileName = `refunds-${statusFilter.toLowerCase()}-${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      exportToCSV(exportData, fileName);
    } else if (format === 'excel') {
      exportToExcel(exportData, fileName, 'Refunds');
    } else {
      exportToPDF(exportData, fileName, 'Refund Report');
    }
  };

  const filteredRefunds = refunds.filter(r => 
    r.refundReason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.id.toString().includes(searchTerm)
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Handle Refunds</h1>
          <p className="text-muted-foreground mt-1">Review and process refund requests</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('excel')}>
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Refunds</p>
                  <h3 className="text-2xl font-bold mt-1">{statistics.overview.total}</h3>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <h3 className="text-2xl font-bold mt-1 text-yellow-600">{statistics.overview.pending}</h3>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <h3 className="text-2xl font-bold mt-1 text-green-600">{statistics.overview.approved}</h3>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <h3 className="text-2xl font-bold mt-1">LKR {(statistics.totalRefundAmount || 0).toLocaleString()}</h3>
                </div>
                <DollarSign className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ID or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === '' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('PENDING')}
              >
                <Clock className="w-4 h-4 mr-2" />
                Pending
              </Button>
              <Button
                variant={statusFilter === 'APPROVED' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('APPROVED')}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approved
              </Button>
              <Button
                variant={statusFilter === 'REJECTED' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('REJECTED')}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Rejected
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Refunds List */}
      <Card>
        <CardHeader>
          <CardTitle>Refund Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading refunds...</p>
            </div>
          ) : filteredRefunds.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No refunds found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRefunds.map((refund) => (
                <div key={refund.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">Refund #{refund.id}</h3>
                        {getStatusBadge(refund.status)}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Amount</p>
                          <p className="font-semibold text-lg">LKR {(refund.refundAmount || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Type</p>
                          <p className="font-medium">{refund.refundType}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-muted-foreground">Reason</p>
                          <p className="font-medium">{refund.refundReason}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Requested</p>
                          <p>{new Date(refund.requestedAt).toLocaleString()}</p>
                        </div>
                        {refund.approvedAt && (
                          <div>
                            <p className="text-muted-foreground">Approved</p>
                            <p>{new Date(refund.approvedAt).toLocaleString()}</p>
                          </div>
                        )}
                        {refund.transactionRef && (
                          <div className="col-span-2">
                            <p className="text-muted-foreground">Transaction Reference</p>
                            <p className="font-mono text-sm">{refund.transactionRef}</p>
                          </div>
                        )}
                        {refund.rejectionReason && (
                          <div className="col-span-2">
                            <p className="text-muted-foreground">Rejection Reason</p>
                            <p className="text-red-600">{refund.rejectionReason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {refund.status === 'PENDING' && (
                      <div className="flex gap-2 ml-4">
                        <Button
                          onClick={() => handleApprove(refund)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleReject(refund)}
                          variant="destructive"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Modal */}
      {showApprovalModal && selectedRefund && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Approve Refund #{selectedRefund.id}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Refund Amount</p>
                <p className="text-2xl font-bold">LKR {(selectedRefund.refundAmount || 0).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Refund Method</label>
                <Input
                  placeholder="e.g., Bank Transfer, Cash, Card"
                  value={refundMethod}
                  onChange={(e) => setRefundMethod(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Transaction Reference</label>
                <Input
                  placeholder="e.g., TXN123456"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={confirmApproval}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={!refundMethod}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm Approval
                </Button>
                <Button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setRefundMethod('');
                    setTransactionRef('');
                    setSelectedRefund(null);
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
