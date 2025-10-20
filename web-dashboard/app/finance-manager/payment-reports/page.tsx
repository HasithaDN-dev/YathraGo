"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { api } from '../../../lib/api';
import { 
  Download, 
  TrendingUp,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Filter,
  Search
} from 'lucide-react';
import { 
  RevenueChart, 
  PaymentStatusChart,
  MonthlyTrendChart 
} from '../../../components/ui/charts';
import { exportToCSV, exportToExcel, exportToPDF } from '../../../lib/export-utils';

interface Payment {
  id: number;
  amount: number;
  paymentMonth: number;
  paymentYear: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  paidAt?: string;
  verifiedAt?: string;
  child?: {
    name: string;
  };
  customer?: {
    firstName: string;
    lastName: string;
  };
  driver?: {
    name: string;
  };
}

interface PaymentStats {
  overview: {
    total: number;
    pending: number;
    paid: number;
    overdue: number;
  };
  revenue: {
    today: number;
    thisMonth: number;
  };
}

export default function PaymentReportsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [statistics, setStatistics] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    fetchPayments();
    fetchStatistics();
  }, [selectedMonth, selectedYear, statusFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params: {
        paymentMonth: number;
        paymentYear: number;
        status?: string;
        limit: number;
      } = {
        paymentMonth: selectedMonth,
        paymentYear: selectedYear,
        limit: 100,
      };
      
      // Only add status if it's not empty
      if (statusFilter && statusFilter.trim() !== '') {
        params.status = statusFilter;
      }
      
      const response = await api.payments.getAll(params);
      setPayments(response.data);
      prepareChartData(response.data);
    } catch (error) {
      } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const stats = await api.payments.getStatistics();
      setStatistics(stats);
    } catch (error) {
      }
  };

  const prepareChartData = (paymentsData: Payment[]) => {
    // Prepare data for revenue chart (last 6 months)
    const monthlyData: { [key: string]: { revenue: number; payments: number } } = {};
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleString('default', { month: 'short' });
      
      monthlyData[monthKey] = {
        revenue: 0,
        payments: 0,
      };
    }

    paymentsData.forEach(payment => {
      const monthKey = `${payment.paymentYear}-${String(payment.paymentMonth || 0).padStart(2, '0')}`;
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].revenue += (payment.amount || 0);
        monthlyData[monthKey].payments += 1;
      }
    });

    const chartDataArray = Object.entries(monthlyData).map(([key, value]) => {
      const [year, month] = key.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return {
        date: date.toLocaleString('default', { month: 'short' }),
        revenue: value.revenue || 0,
        payments: value.payments || 0,
      };
    });

    setChartData(chartDataArray);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      PAID: { color: 'bg-green-100 text-green-800', label: 'Paid' },
      OVERDUE: { color: 'bg-red-100 text-red-800', label: 'Overdue' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    const exportData = filteredPayments.map(p => ({
      'Payment ID': p.id,
      'Child': p.child?.name || '-',
      'Customer': `${p.customer?.firstName || ''} ${p.customer?.lastName || ''}`.trim() || '-',
      'Driver': p.driver?.name || '-',
      'Amount': `LKR ${(p.amount || 0).toLocaleString()}`,
      'Month': `${p.paymentMonth || 0}/${p.paymentYear || 0}`,
      'Status': p.status,
      'Paid At': p.paidAt ? new Date(p.paidAt).toLocaleString() : '-',
      'Verified At': p.verifiedAt ? new Date(p.verifiedAt).toLocaleString() : '-',
    }));

    const fileName = `payment-report-${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

    if (format === 'csv') {
      exportToCSV(exportData, fileName);
    } else if (format === 'excel') {
      exportToExcel(exportData, fileName, 'Payment Report');
    } else {
      exportToPDF(exportData, fileName, `Payment Report - ${selectedMonth}/${selectedYear}`);
    }
  };

  const filteredPayments = payments.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    return (
      p.id.toString().includes(searchTerm) ||
      p.child?.name.toLowerCase().includes(searchLower) ||
      p.driver?.name.toLowerCase().includes(searchLower) ||
      `${p.customer?.firstName} ${p.customer?.lastName}`.toLowerCase().includes(searchLower)
    );
  });

  const totalAmount = filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const paidAmount = filteredPayments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingAmount = filteredPayments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + (p.amount || 0), 0);

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  // Prepare payment status chart data
  const paymentStatusData = statistics ? [
    { status: 'Paid', count: statistics.overview.paid || 0, amount: paidAmount || 0 },
    { status: 'Pending', count: statistics.overview.pending || 0, amount: pendingAmount || 0 },
    { status: 'Overdue', count: statistics.overview.overdue || 0, amount: 0 },
  ] : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payment Reports</h1>
          <p className="text-muted-foreground mt-1">Analyze payment trends and generate reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('excel')}>
            <Download className="w-4 h-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <Download className="w-4 h-4 mr-2" />
            PDF
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
                  <p className="text-sm text-muted-foreground">Total Payments</p>
                  <h3 className="text-2xl font-bold mt-1">{statistics.overview.total || 0}</h3>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <h3 className="text-2xl font-bold mt-1">
                    LKR {(statistics.revenue?.thisMonth || 0).toLocaleString()}
                  </h3>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today&apos;s Revenue</p>
                  <h3 className="text-2xl font-bold mt-1">
                    LKR {(statistics.revenue?.today || 0).toLocaleString()}
                  </h3>
                </div>
                <DollarSign className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Paid</p>
                  <h3 className="text-2xl font-bold mt-1 text-green-600">{statistics.overview.paid || 0}</h3>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Revenue Trend (Last 6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <RevenueChart data={chartData} />
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Payment Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paymentStatusData.length > 0 ? (
              <PaymentStatusChart data={paymentStatusData} />
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-3 py-2 border rounded-md bg-background"
              >
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-2 border rounded-md bg-background"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ID, child, customer, or driver..."
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
                variant={statusFilter === 'PAID' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('PAID')}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Paid
              </Button>
              <Button
                variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('PENDING')}
              >
                <Clock className="w-4 h-4 mr-2" />
                Pending
              </Button>
              <Button
                variant={statusFilter === 'OVERDUE' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('OVERDUE')}
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Overdue
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Report Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
              <p className="text-3xl font-bold text-blue-600">LKR {totalAmount.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">{filteredPayments.length} payments</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Paid Amount</p>
              <p className="text-3xl font-bold text-green-600">LKR {paidAmount.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {Math.round((paidAmount / totalAmount) * 100) || 0}% of total
              </p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Pending Amount</p>
              <p className="text-3xl font-bold text-yellow-600">LKR {pendingAmount.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {Math.round((pendingAmount / totalAmount) * 100) || 0}% of total
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading payments...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No payments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">ID</th>
                    <th className="text-left p-3 font-semibold">Child</th>
                    <th className="text-left p-3 font-semibold">Customer</th>
                    <th className="text-left p-3 font-semibold">Driver</th>
                    <th className="text-right p-3 font-semibold">Amount</th>
                    <th className="text-center p-3 font-semibold">Period</th>
                    <th className="text-center p-3 font-semibold">Status</th>
                    <th className="text-left p-3 font-semibold">Paid At</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-accent/50 transition-colors">
                      <td className="p-3 font-medium">#{payment.id}</td>
                      <td className="p-3">{payment.child?.name || '-'}</td>
                      <td className="p-3">
                        {payment.customer 
                          ? `${payment.customer.firstName} ${payment.customer.lastName}`
                          : '-'}
                      </td>
                      <td className="p-3">{payment.driver?.name || '-'}</td>
                      <td className="p-3 text-right font-semibold">
                        LKR {(payment.amount || 0).toLocaleString()}
                      </td>
                      <td className="p-3 text-center">
                        {String(payment.paymentMonth || 0).padStart(2, '0')}/{payment.paymentYear || 0}
                      </td>
                      <td className="p-3 text-center">{getStatusBadge(payment.status)}</td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {payment.paidAt 
                          ? new Date(payment.paidAt).toLocaleDateString()
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
