"use client";
import React from 'react';
import { Card } from '../../../components/ui/card';

export default function VerifyDriversPage() {
  const pending = [
    { id: 'DRV-A1', name: 'Ramesh', nic: '123456789V' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Verify Drivers</h1>
      <div className="space-y-3">
        {pending.map(d => (
          <Card key={d.id}>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{d.name}</div>
                <div className="text-sm text-muted-foreground">NIC: {d.nic}</div>
              </div>
              <div>
                <button className="btn btn-primary mr-2">Verify</button>
                <button className="btn">Request More Info</button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
