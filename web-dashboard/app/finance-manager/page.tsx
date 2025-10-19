"use client";
import React from 'react';
import { Card } from '../../components/ui/card';

export default function FinanceManagerDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Finance Manager Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <h2 className="text-lg font-medium">Generate Reports</h2>
          <p className="text-sm text-muted-foreground">Run financial and payment reports.</p>
        </Card>
        <Card>
          <h2 className="text-lg font-medium">Payment Reports</h2>
          <p className="text-sm text-muted-foreground">View transaction summaries and payouts.</p>
        </Card>
        <Card>
          <h2 className="text-lg font-medium">Approve Payouts</h2>
          <p className="text-sm text-muted-foreground">Approve driver/owner payouts.</p>
        </Card>
      </div>

      <section className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Recent Payment Events (mock)</h3>
        <div className="space-y-2">
          <Card>
            <div className="flex justify-between">
              <div>
                <div className="font-medium">Txn #12345</div>
                <div className="text-sm text-muted-foreground">Customer: +9477xxxxxxx</div>
              </div>
              <div className="text-right">
                <div className="font-medium">LKR 2,500.00</div>
                <div className="text-sm text-muted-foreground">Pending approval</div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
