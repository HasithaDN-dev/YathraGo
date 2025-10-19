export type Complaint = {
  id: string;
  subject: string;
  description: string;
  category: "service" | "safety" | "billing" | "driver" | "vehicle" | "app" | "other";
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in-progress" | "resolved" | "closed";
  complainantType: "parent" | "school" | "driver" | "owner";
  complainantName: string;
  complainantContact: string;
  schoolName?: string;
  vehicleNo?: string;
  driverName?: string;
  submissionDate: string;
  responseDate?: string;
  resolution?: string;
  assignedTo?: string;
  rating?: number;
  feedback?: string;
};

export const mockComplaints: Complaint[] = [
  {
    id: "1",
    subject: "Driver arrived 15 minutes late consistently",
    description:
      "My child's school bus has been arriving 15 minutes late for the past week. This is causing issues with school attendance. Please address this urgently.",
    category: "service",
    priority: "high",
    status: "in-progress",
    complainantType: "parent",
    complainantName: "Priya Sharma",
    complainantContact: "+91-9876543210",
    schoolName: "Greenwood Elementary",
    vehicleNo: "KA-01-AB-1234",
    driverName: "Ramesh Kumar",
    submissionDate: "2025-07-20",
    assignedTo: "Manager - South Zone",
  },
  {
    id: "2",
    subject: "Vehicle cleanliness issues",
    description:
      "The bus interior is not being cleaned properly. Seats are dusty and floor has debris. Please ensure daily cleaning is maintained.",
    category: "vehicle",
    priority: "medium",
    status: "resolved",
    complainantType: "school",
    complainantName: "Mrs. Sunitha (Principal)",
    complainantContact: "principal@riverside.edu",
    schoolName: "Riverside High School",
    vehicleNo: "KA-02-CD-5678",
    submissionDate: "2025-07-18",
    responseDate: "2025-07-19",
    resolution:
      "Vehicle cleaning protocol has been updated and additional cleaning supplies provided to the driver. Daily inspection will be conducted.",
    assignedTo: "Fleet Maintenance Team",
    rating: 4,
    feedback: "Quick response and effective solution. Thank you.",
  },
  {
    id: "3",
    subject: "Payment discrepancy in monthly bill",
    description:
      "There's an extra charge of Rs 500 in this month's billing that wasn't explained. Please clarify the billing breakdown.",
    category: "billing",
    priority: "medium",
    status: "open",
    complainantType: "owner",
    complainantName: "Mohammed Ali",
    complainantContact: "+91-9876543212",
    submissionDate: "2025-07-21",
  },
  {
    id: "4",
    subject: "App not showing real-time location",
    description:
      "The mobile app hasn't been showing real-time bus location for the past 3 days. Parents are unable to track their children's bus.",
    category: "app",
    priority: "critical",
    status: "in-progress",
    complainantType: "school",
    complainantName: "IT Admin - Oak Valley",
    complainantContact: "admin@oakvalley.edu",
    schoolName: "Oak Valley Middle School",
    submissionDate: "2025-07-20",
    assignedTo: "Technical Team",
  },
];
