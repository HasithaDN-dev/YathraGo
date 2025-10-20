"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { mockDriverInquiries, DriverInquiry } from '@/lib/drivers';
import {
  MessageSquare,
  Search,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  Phone,
  Send,
  MessageCircle,
  FileText
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function DriverInquiriesPage() {
  const [inquiries, setInquiries] = useState<DriverInquiry[]>(mockDriverInquiries);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<DriverInquiry | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [response, setResponse] = useState('');
  const [selectedTab, setSelectedTab] = useState('pending');

  // Filter inquiries based on tab and search
  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = 
      inquiry.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.driverPhone.includes(searchTerm);

    const matchesStatus = filterStatus === '' || inquiry.status === filterStatus;
    const matchesCategory = filterCategory === '' || inquiry.category === filterCategory;

    let tabMatch = true;
    switch (selectedTab) {
      case 'pending':
        tabMatch = inquiry.status === 'PENDING';
        break;
      case 'in-progress':
        tabMatch = inquiry.status === 'IN_PROGRESS';
        break;
      case 'resolved':
        tabMatch = inquiry.status === 'RESOLVED';
        break;
    }

    return matchesSearch && matchesStatus && matchesCategory && tabMatch;
  });

  const handleRespondToInquiry = (inquiryId: string) => {
    setInquiries(prev => prev.map(inquiry => 
      inquiry.id === inquiryId 
        ? { 
            ...inquiry, 
            status: 'RESOLVED',
            response: response,
            responseDate: new Date().toISOString(),
            assignedTo: 'Driver Coordinator'
          }
        : inquiry
    ));
    setShowResponseModal(false);
    setResponse('');
    setSelectedInquiry(null);
  };

  const handleAssignInquiry = (inquiryId: string) => {
    setInquiries(prev => prev.map(inquiry => 
      inquiry.id === inquiryId 
        ? { 
            ...inquiry, 
            status: 'IN_PROGRESS',
            assignedTo: 'Driver Coordinator'
          }
        : inquiry
    ));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>;
      case 'RESOLVED':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    const categoryColors = {
      'SYSTEM': 'bg-purple-50 text-purple-700 border-purple-200',
      'DRIVER': 'bg-orange-50 text-orange-700 border-orange-200',
      'PAYMENT': 'bg-green-50 text-green-700 border-green-200',
      'OTHER': 'bg-gray-50 text-gray-700 border-gray-200'
    };
    
    return (
      <Badge variant="outline" className={categoryColors[category as keyof typeof categoryColors] || categoryColors.OTHER}>
        {category}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      case 'HIGH':
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case 'MEDIUM':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'LOW':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const renderInquiryCard = (inquiry: DriverInquiry) => (
    <Card key={inquiry.id} className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              inquiry.inquiryType === 'COMPLAINT' ? 'bg-red-100' : 'bg-blue-100'
            }`}>
              {inquiry.inquiryType === 'COMPLAINT' ? 
                <AlertTriangle className="w-6 h-6 text-red-600" /> :
                <MessageSquare className="w-6 h-6 text-blue-600" />
              }
            </div>
            <div>
              <h3 className="text-lg font-semibold">{inquiry.subject}</h3>
              <p className="text-gray-600">ID: {inquiry.id}</p>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge(inquiry.status)}
              {getCategoryBadge(inquiry.category)}
              {getPriorityBadge(inquiry.priority)}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{inquiry.driverName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{inquiry.driverPhone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{new Date(inquiry.submittedDate).toLocaleDateString()}</span>
            </div>
            {inquiry.vehicleRegNo && (
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{inquiry.vehicleRegNo}</span>
              </div>
            )}
          </div>

          <div className="mb-4">
            <p className="text-gray-700">{inquiry.description}</p>
          </div>

          {inquiry.customerName && (
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-800">Related Customer:</span>
              </div>
              <p className="text-sm text-gray-700">{inquiry.customerName}</p>
              {inquiry.customerPhone && (
                <p className="text-sm text-gray-600">{inquiry.customerPhone}</p>
              )}
            </div>
          )}

          {inquiry.response && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <MessageCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Response:</span>
              </div>
              <p className="text-sm text-green-700">{inquiry.response}</p>
              {inquiry.responseDate && (
                <p className="text-xs text-green-600 mt-1">
                  Responded on {new Date(inquiry.responseDate).toLocaleDateString()} by {inquiry.assignedTo}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-2 ml-4">
          {inquiry.status === 'PENDING' && (
            <>
              <Button 
                size="sm" 
                onClick={() => handleAssignInquiry(inquiry.id)}
                className="flex items-center space-x-1"
              >
                <Eye className="w-4 h-4" />
                <span>Assign to Me</span>
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  setSelectedInquiry(inquiry);
                  setShowResponseModal(true);
                }}
                className="flex items-center space-x-1"
              >
                <Send className="w-4 h-4" />
                <span>Respond</span>
              </Button>
            </>
          )}
          
          {inquiry.status === 'IN_PROGRESS' && (
            <Button 
              size="sm" 
              onClick={() => {
                setSelectedInquiry(inquiry);
                setShowResponseModal(true);
              }}
              className="flex items-center space-x-1"
            >
              <Send className="w-4 h-4" />
              <span>Respond</span>
            </Button>
          )}
          
          {inquiry.status === 'RESOLVED' && (
            <Button 
              size="sm" 
              variant="outline"
              disabled
              className="flex items-center space-x-1"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Resolved</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Driver Inquiries</h1>
        <p className="text-gray-600">Handle driver complaints and inquiries redirected from general manager</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Inquiries</p>
              <p className="text-3xl font-bold text-yellow-600">
                {inquiries.filter(i => i.status === 'PENDING').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">In Progress</p>
              <p className="text-3xl font-bold text-blue-600">
                {inquiries.filter(i => i.status === 'IN_PROGRESS').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Resolved</p>
              <p className="text-3xl font-bold text-green-600">
                {inquiries.filter(i => i.status === 'RESOLVED').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Inquiries</p>
              <p className="text-3xl font-bold text-purple-600">{inquiries.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search inquiries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          <option value="SYSTEM">System</option>
          <option value="DRIVER">Driver</option>
          <option value="PAYMENT">Payment</option>
          <option value="OTHER">Other</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      {/* Inquiry Management Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Pending ({inquiries.filter(i => i.status === 'PENDING').length})</span>
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>In Progress ({inquiries.filter(i => i.status === 'IN_PROGRESS').length})</span>
          </TabsTrigger>
          <TabsTrigger value="resolved" className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>Resolved ({inquiries.filter(i => i.status === 'RESOLVED').length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <div className="space-y-4">
            {filteredInquiries.length > 0 ? (
              filteredInquiries.map(renderInquiryCard)
            ) : (
              <Card className="p-8 text-center">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Inquiries</h3>
                <p className="text-gray-600">All inquiries have been processed or assigned.</p>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="in-progress" className="mt-6">
          <div className="space-y-4">
            {filteredInquiries.length > 0 ? (
              filteredInquiries.map(renderInquiryCard)
            ) : (
              <Card className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Inquiries In Progress</h3>
                <p className="text-gray-600">No inquiries are currently being processed.</p>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="resolved" className="mt-6">
          <div className="space-y-4">
            {filteredInquiries.length > 0 ? (
              filteredInquiries.map(renderInquiryCard)
            ) : (
              <Card className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Resolved Inquiries</h3>
                <p className="text-gray-600">No inquiries have been resolved yet.</p>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Response Modal */}
      <Dialog open={showResponseModal} onOpenChange={setShowResponseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to Inquiry: {selectedInquiry?.subject}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Driver: {selectedInquiry?.driverName}</p>
              <p className="text-sm text-gray-800">{selectedInquiry?.description}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Response:
              </label>
              <Textarea
                placeholder="Type your response here..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResponseModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedInquiry && handleRespondToInquiry(selectedInquiry.id)}
              disabled={!response.trim()}
            >
              Send Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
