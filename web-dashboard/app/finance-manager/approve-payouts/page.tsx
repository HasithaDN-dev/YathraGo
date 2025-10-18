"use client";
import React from 'react';
import { Card } from '../../../components/ui/card';

export default function ApprovePayoutsPage() {
  const payouts = [
    { id: 'P-1001', payee: 'Driver: Kasun', amount: 'LKR 40,000', status: 'Pending' },
    { id: 'P-1002', payee: 'Owner: Kumar Transport', amount: 'LKR 120,000', status: 'Pending' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Approve Payouts</h1>
      <div className="space-y-3">
        {payouts.map(p => (
          <Card key={p.id}>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{p.payee} — {p.amount}</div>
                <div className="text-sm text-muted-foreground">{p.status}</div>
              </div>
              <div>
                <button className="btn btn-primary mr-2">Approve</button>
                <button className="btn">Reject</button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
