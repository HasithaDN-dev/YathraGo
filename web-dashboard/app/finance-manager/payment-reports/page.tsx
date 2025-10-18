"use client";
import React from 'react';
import { Card } from '../../../components/ui/card';

export default function PaymentReportsPage() {
  const mockReports = [
    { id: 'PR-001', period: '2025-09', total: 'LKR 125,000', status: 'Completed' },
    { id: 'PR-002', period: '2025-08', total: 'LKR 98,500', status: 'Completed' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Payment Reports</h1>
      <Card>
        <div className="space-y-2">
          {mockReports.map(r => (
            <div key={r.id} className="flex justify-between items-center">
              <div>
                <div className="font-medium">{r.id} — {r.period}</div>
                <div className="text-sm text-muted-foreground">{r.status}</div>
              </div>
              <div className="text-right">
                <div className="font-medium">{r.total}</div>
                <button className="btn btn-outline mt-2">Export CSV</button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
