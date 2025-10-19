"use client";
import React from 'react';
import { Card } from '../../../components/ui/card';

export default function DriverInquiriesPage() {
  const inquiries = [
    { id: 'I-100', driver: 'Nimal', issue: 'Low ratings' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Driver Inquiries & Complaints</h1>
      <div className="space-y-3">
        {inquiries.map(i => (
          <Card key={i.id}>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{i.driver}</div>
                <div className="text-sm text-muted-foreground">{i.issue}</div>
              </div>
              <div>
                <button className="btn btn-primary mr-2">Respond</button>
                <button className="btn">Escalate</button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
