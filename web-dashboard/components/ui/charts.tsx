"use client";

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Color palette
const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  teal: '#14b8a6',
  pink: '#ec4899',
};

const PIE_COLORS = [COLORS.primary, COLORS.success, COLORS.warning, COLORS.danger, COLORS.purple];

// Revenue Line Chart
interface RevenueData {
  date: string;
  revenue: number;
  payments: number;
}

export function RevenueChart({ data }: { data: RevenueData[] }) {
  // Custom formatter to handle NaN values
  const formatValue = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) return '0';
    return value.toLocaleString();
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8} />
            <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
        <YAxis stroke="#6b7280" fontSize={12} tickFormatter={formatValue} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
          formatter={formatValue}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke={COLORS.primary}
          fillOpacity={1}
          fill="url(#colorRevenue)"
          name="Revenue (LKR)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Payment Status Bar Chart
interface PaymentStatusData {
  status: string;
  count: number;
  amount: number;
}

export function PaymentStatusChart({ data }: { data: PaymentStatusData[] }) {
  // Custom formatter to handle NaN values
  const formatValue = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) return '0';
    return value.toLocaleString();
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="status" stroke="#6b7280" fontSize={12} />
        <YAxis stroke="#6b7280" fontSize={12} tickFormatter={formatValue} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}
          formatter={formatValue}
        />
        <Legend />
        <Bar dataKey="count" fill={COLORS.primary} name="Transactions" radius={[8, 8, 0, 0]} />
        <Bar dataKey="amount" fill={COLORS.success} name="Amount (LKR)" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Complaints by Category Pie Chart
interface CategoryData {
  name: string;
  value: number;
}

export function ComplaintsCategoryChart({ data }: { data: CategoryData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

// Monthly Trend Line Chart
interface TrendData {
  month: string;
  payments: number;
  payouts: number;
  refunds: number;
}

export function MonthlyTrendChart({ data }: { data: TrendData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
        <YAxis stroke="#6b7280" fontSize={12} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="payments"
          stroke={COLORS.primary}
          strokeWidth={2}
          name="Payments"
          dot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="payouts"
          stroke={COLORS.success}
          strokeWidth={2}
          name="Payouts"
          dot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="refunds"
          stroke={COLORS.warning}
          strokeWidth={2}
          name="Refunds"
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Driver Performance Chart
interface DriverPerformanceData {
  name: string;
  trips: number;
  rating: number;
  revenue: number;
}

export function DriverPerformanceChart({ data }: { data: DriverPerformanceData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis type="number" stroke="#6b7280" fontSize={12} />
        <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={12} width={100} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}
        />
        <Legend />
        <Bar dataKey="trips" fill={COLORS.primary} name="Trips" radius={[0, 8, 8, 0]} />
        <Bar dataKey="revenue" fill={COLORS.success} name="Revenue (LKR)" radius={[0, 8, 8, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Vehicle Utilization Chart
interface VehicleUtilizationData {
  vehicle: string;
  utilization: number;
  capacity: number;
}

export function VehicleUtilizationChart({ data }: { data: VehicleUtilizationData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="vehicle" stroke="#6b7280" fontSize={12} />
        <YAxis stroke="#6b7280" fontSize={12} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}
        />
        <Legend />
        <Bar dataKey="utilization" fill={COLORS.success} name="Current" radius={[8, 8, 0, 0]} />
        <Bar dataKey="capacity" fill={COLORS.warning} name="Capacity" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Complaints Resolution Time Chart
interface ResolutionTimeData {
  category: string;
  avgHours: number;
}

export function ResolutionTimeChart({ data }: { data: ResolutionTimeData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="category" stroke="#6b7280" fontSize={12} />
        <YAxis stroke="#6b7280" fontSize={12} label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}
        />
        <Bar 
          dataKey="avgHours" 
          fill={COLORS.purple} 
          name="Avg Resolution Time (hrs)" 
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
