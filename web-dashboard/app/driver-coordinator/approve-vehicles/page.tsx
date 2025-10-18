"use client";
import React from 'react';
import { Card } from '../../../components/ui/card';

export default function ApproveVehiclesPage() {
  const vehicles = [
    { id: 'V-1001', owner: 'Kumar', plate: 'ABC-1234', status: 'Pending' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Approve Vehicles</h1>
      <div className="space-y-3">
        {vehicles.map(v => (
          <Card key={v.id}>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{v.owner} — {v.plate}</div>
                <div className="text-sm text-muted-foreground">{v.status}</div>
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
