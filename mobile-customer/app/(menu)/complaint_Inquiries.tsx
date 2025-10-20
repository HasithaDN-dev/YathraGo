import React, { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { CaretDown, CaretUp, Plus } from 'phosphor-react-native';
import { useProfileStore } from '@/lib/stores/profile.store';
import { useAuthStore } from '@/lib/stores/auth.store';
import { getComplaintsInquiries, ComplaintInquiry } from '@/lib/api/complaints-inquiries.api';
import { useFocusEffect } from '@react-navigation/native';

type ComplaintItem = {
  id: string;
  complaintId: string;
  message: string;
  date: string;
  time: string;
  status: string;
  expanded: boolean;
};

type InquiryItem = {
  id: string;
  inquiryId: string;
  message: string;
  date: string;
  time: string;
  status: string;
  expanded: boolean;
};

// Helper function to format date and time
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const formattedDate = date.toISOString().split('T')[0];
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'p.m.' : 'a.m.';
  const formattedTime = `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  return { date: formattedDate, time: formattedTime };
};

// Helper function to get status badge color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-500';
    case 'IN_PROGRESS':
      return 'bg-blue-500';
    case 'RESOLVED':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

// Helper function to format status text
const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ');
};

export default function ComplaintInquiriesScreen() {
  const router = useRouter();
  const { activeProfile } = useProfileStore();
  const { accessToken } = useAuthStore();
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [showAllComplaints, setShowAllComplaints] = useState(false);
  const [showAllInquiries, setShowAllInquiries] = useState(false);
  const [activeTab, setActiveTab] = useState<'Complaints' | 'Inquiries'>('Complaints');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch complaints and inquiries from backend
  const fetchData = useCallback(async () => {
    if (!activeProfile || !accessToken) {
      setError('No active profile or authentication token');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Map profile type to backend UserType ('child' -> 'CHILD', 'staff' -> 'STAFF')
      const senderUserType = activeProfile.type === 'child' ? 'CHILD' : 'STAFF';
      const senderId = parseInt(activeProfile.id.split('-')[1]);

      const response = await getComplaintsInquiries(senderId, senderUserType, accessToken);

      if (response.success) {
        // Separate complaints and inquiries
        const complaintsData: ComplaintItem[] = [];
        const inquiriesData: InquiryItem[] = [];

        response.data.forEach((item: ComplaintInquiry) => {
          const { date, time } = formatDateTime(item.createdAt);
          
          if (item.type === 'COMPLAINT') {
            complaintsData.push({
              id: item.id.toString(),
              complaintId: item.id.toString(),
              message: item.description,
              date,
              time,
              status: item.status,
              expanded: false,
            });
          } else if (item.type === 'INQUIRY') {
            inquiriesData.push({
              id: item.id.toString(),
              inquiryId: item.id.toString(),
              message: item.description,
              date,
              time,
              status: item.status,
              expanded: false,
            });
          }
        });

        setComplaints(complaintsData);
        setInquiries(inquiriesData);
      }
    } catch (err) {
      console.error('Error fetching complaints/inquiries:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, [activeProfile, accessToken]);

  // Fetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const toggleExpand = (id: string) => {
    setComplaints((prev: ComplaintItem[]) =>
      prev.map((c: ComplaintItem) => (c.id === id ? { ...c, expanded: !c.expanded } : c))
    );
  };
  const toggleExpandInquiry = (id: string) => {
    setInquiries((prev: InquiryItem[]) =>
      prev.map((c: InquiryItem) => (c.id === id ? { ...c, expanded: !c.expanded } : c))
    );
  };

  // Select which array to show
  const itemsToShow = activeTab === 'Complaints' ? complaints : inquiries;
  const isComplaintsTab = activeTab === 'Complaints';
  const visibleItems = (isComplaintsTab
    ? (showAllComplaints ? itemsToShow : itemsToShow.slice(0, 3))
    : (showAllInquiries ? itemsToShow : itemsToShow.slice(0, 3)));

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ScreenHeader title="Complaint and Inquiries" showBackButton />

        {/* Tabs */}
        <View className="flex-row border-b border-gray-200 mb-4 mt-3">
          <TouchableOpacity
            className={`flex-1 items-center pb-2 ${activeTab === 'Complaints' ? 'border-b-4 border-yellow-400' : ''}`}
            onPress={() => setActiveTab('Complaints')}
          >
            <Typography variant="subhead" className="text-black">
              Complains
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 items-center pb-2 ${activeTab === 'Inquiries' ? 'border-b-4 border-yellow-400' : ''}`}
            onPress={() => setActiveTab('Inquiries')}
          >
            <Typography variant="body" className="text-black">
              Inquiries
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Loading State */}
        {isLoading && (
          <View className="flex-1 items-center justify-center py-10">
            <ActivityIndicator size="large" color="#FFD700" />
            <Typography variant="body" className="text-gray-500 mt-4">
              Loading...
            </Typography>
          </View>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <View className="mx-4 mb-4 p-4 bg-red-100 rounded-lg">
            <Typography variant="body" className="text-red-600">
              {error}
            </Typography>
          </View>
        )}

        {/* Empty State */}
        {!isLoading && !error && visibleItems.length === 0 && (
          <View className="flex-1 items-center justify-center py-10">
            <Typography variant="body" className="text-gray-500">
              No {activeTab.toLowerCase()} found
            </Typography>
          </View>
        )}

        {/* Large Scrollable Card for Complaints/Inquiries */}
        {!isLoading && visibleItems.length > 0 && (
          <Card className="mb-6 p-2">
            <ScrollView className="max-h-[520px]" showsVerticalScrollIndicator={false}>
              {visibleItems.map((item: ComplaintItem | InquiryItem, idx: number) => (
                <View key={item.id} style={{ marginBottom: idx === visibleItems.length - 1 ? 0 : 16 }}>
                  <Card className="px-4 py-3 shadow-md mt-2">
                    {isComplaintsTab ? (
                      <TouchableOpacity
                        className="flex-row items-center justify-between mb-2"
                        onPress={() => toggleExpand(item.id)}
                        activeOpacity={0.8}
                      >
                        <Typography variant="subhead" weight="bold" className="text-black">
                          Complaint ID : {'complaintId' in item ? item.complaintId : ''}
                        </Typography>
                        {item.expanded ? (
                          <CaretUp size={20} color="#222" weight="regular" />
                        ) : (
                          <CaretDown size={20} color="#222" weight="regular" />
                        )}
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        className="flex-row items-center justify-between mb-2"
                        onPress={() => toggleExpandInquiry(item.id)}
                        activeOpacity={0.8}
                      >
                        <Typography variant="subhead" weight="bold" className="text-black">
                          Inquiry ID : {'inquiryId' in item ? item.inquiryId : ''}
                        </Typography>
                        {item.expanded ? (
                          <CaretUp size={20} color="#222" weight="regular" />
                        ) : (
                          <CaretDown size={20} color="#222" weight="regular" />
                        )}
                      </TouchableOpacity>
                    )}
                    
                    {/* Status Badge */}
                    <View className={`self-start px-3 py-1 rounded-full mb-2 ${getStatusColor(item.status)}`}>
                      <Typography variant="caption-1" className="text-white font-semibold">
                        {formatStatus(item.status)}
                      </Typography>
                    </View>

                    <Typography
                      variant="subhead"
                      className="text-black mb-2"
                      numberOfLines={item.expanded ? undefined : 2}
                    >
                      {item.message}
                    </Typography>
                    <View className="flex-row justify-between items-center mt-2">
                      <Typography variant="caption-1" className="text-gray-500">
                        Date : {item.date}
                      </Typography>
                      <Typography variant="caption-1" className="text-gray-500">
                        Time : {item.time}
                      </Typography>
                    </View>
                  </Card>
                </View>
              ))}
            </ScrollView>
          </Card>
        )}

        {/* See more button for complaints/inquiries only, if more than 3 and not showing all */}
        {isComplaintsTab && !showAllComplaints && complaints.length > 3 && (
          <TouchableOpacity
            className="mt-4 mb-1 self-center px-6 py-2 bg-brand-deepNavy rounded-full"
            onPress={() => setShowAllComplaints(true)}
          >
            <Typography variant="subhead" className="text-white">
              see more
            </Typography>
          </TouchableOpacity>
        )}
        {!isComplaintsTab && !showAllInquiries && inquiries.length > 3 && (
          <TouchableOpacity
            className="mt-4 mb-1 self-center px-6 py-2 bg-brand-deepNavy rounded-full"
            onPress={() => setShowAllInquiries(true)}
          >
            <Typography variant="subhead" className="text-white">
              see more
            </Typography>
          </TouchableOpacity>
        )}

        {/* Add Complain/Inquiry Card */}
        <TouchableOpacity
          className="mb-8"
          activeOpacity={0.85}
          onPress={() => {
            // Navigate to the correct tab in add_complaint_inquiries
            router.push({
              pathname: '/(menu)/(complaintInquiries)/add_complaint_inquiries',
              params: {
                type: activeTab === 'Complaints' ? 'Complaints' : 'Inquiries',
              },
            });
          }}
        >
          <Card className="flex-row items-center justify-between px-4 py-5">
            <Typography variant="subhead" className="text-black">
              {activeTab === 'Complaints' ? 'Add Complaint' : 'Add Inquiry'}
            </Typography>
            <View className="bg-black rounded-full w-8 h-8 items-center justify-center">
              <Plus size={20} color="#fff" weight="bold" />
            </View>
          </Card>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}