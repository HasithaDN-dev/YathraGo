import { API_BASE_URL } from '../../config/api';

export interface ComplaintInquiry {
  id: number;
  senderId: number;
  senderUserType: 'CHILD' | 'STAFF';
  type: 'COMPLAINT' | 'INQUIRY';
  description: string;
  category: 'SYSTEM' | 'DRIVER' | 'PAYMENT' | 'OTHER';
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
}

export interface CreateComplaintInquiryDto {
  senderId: number;
  senderUserType: 'CHILD' | 'STAFF';
  type: 'COMPLAINT' | 'INQUIRY';
  description: string;
  category: 'SYSTEM' | 'DRIVER' | 'PAYMENT' | 'OTHER';
}

export interface ComplaintInquiryResponse {
  success: boolean;
  data: ComplaintInquiry;
  message: string;
}

export interface ComplaintsInquiriesListResponse {
  success: boolean;
  count: number;
  data: ComplaintInquiry[];
}

/**
 * Create a new complaint or inquiry
 */
export const createComplaintInquiry = async (
  dto: CreateComplaintInquiryDto,
  token: string,
): Promise<ComplaintInquiryResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/complaints-inquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create complaint/inquiry');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating complaint/inquiry:', error);
    throw error;
  }
};

/**
 * Get all complaints and inquiries for a specific sender
 */
export const getComplaintsInquiries = async (
  senderId: number,
  senderUserType: 'CHILD' | 'STAFF',
  token: string,
): Promise<ComplaintsInquiriesListResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/complaints-inquiries/sender/${senderId}?senderUserType=${senderUserType}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch complaints/inquiries');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching complaints/inquiries:', error);
    throw error;
  }
};
