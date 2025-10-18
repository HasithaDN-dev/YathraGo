"use client";
import React from 'react';
import { Card } from '../../../components/ui/card';

export default function RefundsPage() {
  const refunds = [
    { id: 'R-001', customer: 'John Silva', amount: 'LKR 5000', reason: 'Trip Cancelled' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Handle Refunds</h1>
      <div className="space-y-3">
        {refunds.map(r => (
          <Card key={r.id}>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{r.customer} — {r.amount}</div>
                <div className="text-sm text-muted-foreground">{r.reason}</div>
              </div>
              <div>
                <button className="btn btn-primary mr-2">Approve Refund</button>
                <button className="btn">Decline</button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
