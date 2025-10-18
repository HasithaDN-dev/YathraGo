"use client";
import React, { useState } from 'react';
import { Card } from '../../../components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Activity, CreditCard, AlertTriangle } from 'lucide-react';

interface AlertItem {
  id: string;
  type: 'trip' | 'system' | 'payment';
  message: string;
  status: 'new' | 'acknowledged' | 'escalated';
  timestamp: string;
  details?: string;
}

const mockAlerts: AlertItem[] = [
  { id: 'A1', type: 'trip', message: 'Trip #T-123 is running late (ETA +20 mins)', status: 'new', timestamp: '2025-10-17T08:12:00Z', details: 'Driver: Kasun, Route: School A to B' },
  { id: 'A2', type: 'trip', message: 'Trip #T-124 completed', status: 'acknowledged', timestamp: '2025-10-17T07:50:00Z', details: 'Driver: Nimal' },
  { id: 'A3', type: 'payment', message: 'Payout P-1001 pending approval', status: 'escalated', timestamp: '2025-10-17T06:30:00Z' },
];

export default function ReceiveAlertsPage() {
  const [alerts] = useState<AlertItem[]>(mockAlerts);
  const [sortBy, setSortBy] = useState<'date' | 'type' | 'severity'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const getTypeIcon = (type: AlertItem['type']) => {
    switch(type) {
      case 'trip': return <Activity className="w-4 h-4 text-[var(--bright-orange)]" />;
      case 'system': return <Bell className="w-4 h-4 text-blue-600" />;
      case 'payment': return <CreditCard className="w-4 h-4 text-green-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-[var(--warning-amber)]" />;
    }
  }

  const getStatusBadge = (status: AlertItem['status']) => {
    if (status === 'new') return <Badge className="bg-[var(--warning-amber)]/20 text-[var(--warning-amber)]">NEW</Badge>;
    if (status === 'acknowledged') return <Badge className="bg-[var(--success-bg)] text-[var(--success-green)]">ACK</Badge>;
    if (status === 'escalated') return <Badge className="bg-[var(--error-bg)] text-[var(--error-red)]">ESC</Badge>;
    return <Badge>UNKNOWN</Badge>;
  }

  const sortedAlerts = [...alerts].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortBy === 'date') return dir * (new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    if (sortBy === 'type') return dir * a.type.localeCompare(b.type);
    if (sortBy === 'severity') {
      const score = (s: AlertItem['status']) => s === 'new' ? 3 : s === 'escalated' ? 2 : 1;
      return dir * (score(a.status) - score(b.status));
    }
    // removed message sorting per UX request
    return 0;
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Receive Alerts</h1>

      <Card className="p-0 overflow-auto border-2 border-[var(--neutral-gray)] rounded-md">
        <div className="p-4 border-b border-[var(--neutral-gray)] bg-white">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-[var(--warning-amber)]/20 text-[var(--warning-amber)]">NEW</Badge>
              <span className="text-sm text-[var(--neutral-gray)]">New alerts require attention</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-[var(--success-bg)] text-[var(--success-green)]">ACK</Badge>
              <span className="text-sm text-[var(--neutral-gray)]">Acknowledged alerts</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-[var(--error-bg)] text-[var(--error-red)]">ESC</Badge>
              <span className="text-sm text-[var(--neutral-gray)]">Escalated alerts</span>
            </div>
          </div>
        </div>
        <table className="w-full table-fixed min-w-[640px]">
          <thead>
            <tr className="text-left bg-gray-100">
              <th className="px-4 py-3 cursor-pointer" onClick={() => { setSortBy('date'); setSortDir(sortBy === 'date' ? (sortDir === 'asc' ? 'desc' : 'asc') : 'desc'); }}>
                Date {sortBy === 'date' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th className="px-4 py-3 cursor-pointer" onClick={() => { setSortBy('type'); setSortDir(sortBy === 'type' ? (sortDir === 'asc' ? 'desc' : 'asc') : 'asc'); }}>
                Source {sortBy === 'type' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th className="px-4 py-3 cursor-pointer" onClick={() => { setSortBy('severity'); setSortDir(sortBy === 'severity' ? (sortDir === 'asc' ? 'desc' : 'asc') : 'desc'); }}>
                Severity {sortBy === 'severity' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th className="px-4 py-3">
                Message
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedAlerts.map(alert => (
              <tr key={alert.id} className="border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 align-top text-sm text-[var(--neutral-gray)]">
                  {new Date(alert.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-md bg-gray-50">{getTypeIcon(alert.type)}</div>
                    <div className="capitalize text-sm font-medium text-[var(--color-deep-navy)]">{alert.type}</div>
                  </div>
                </td>
                <td className="px-4 py-3 align-top">
                  {getStatusBadge(alert.status)}
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="font-medium text-[var(--color-deep-navy)]">{alert.message}</div>
                  {alert.details && <div className="text-sm text-[var(--neutral-gray)] mt-1 whitespace-pre-wrap">{alert.details}</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
