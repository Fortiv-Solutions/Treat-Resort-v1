export type Role = "MD" | "GM_SILVASSA" | "GM_DAHANU" | "GM_KUMBHALGARH";

export const ROLES: { label: string; value: Role }[] = [
  { label: "MD View - Aditya", value: "MD" },
  { label: "GM View - Silvassa", value: "GM_SILVASSA" },
  { label: "GM View - Dahanu", value: "GM_DAHANU" },
  { label: "GM View - Kumbhalgarh", value: "GM_KUMBHALGARH" },
];

export type PropertyStatus = "Excellent" | "Good" | "Needs Attention";

export interface Property {
  id: string;
  name: string;
  role: Role;
  checkouts: number;
  feedbackSent: number;
  responseRate: number;
  googleReviews: number;
  negativeComplaints: number;
  status: PropertyStatus;
  occupancyRate: number;
  avgRating: number;
  responseSLAHours: number;
  lastComplaint: string | null;
  gmName: string;
  lastSync: string;
  latitude?: number | null;
  longitude?: number | null;
}

export const PROPERTIES: Property[] = [];

export type FeedbackStatus = "Review Requested" | "Review Posted" | "Manager Alerted" | "Resolved";
export type FeedbackSentiment = "POSITIVE" | "NEGATIVE" | "NEUTRAL";
export type FeedbackResponseStatus = "Unassigned" | "Assigned" | "Resolved" | "Escalated";

export interface FeedbackEntry {
  id: number;
  guest: string;
  property: string;
  propertyId: string;
  checkoutDate: string;
  rating: number;
  snippet: string;
  status: FeedbackStatus;
  timestamp: string;
  sentiment: FeedbackSentiment;
  responseStatus: FeedbackResponseStatus;
  assignedManager: string | null;
  escalationMins: number | null;
}

export type EmailPriority = "Urgent" | "Normal" | "FYI";
export type EmailCategory = "Booking Inquiry" | "Wedding Lead" | "Guest Complaint" | "Vendor" | "Finance" | "General";
export type EmailStatus = "Unread" | "Read" | "Replied" | "Escalated";
export type AISentiment = "Positive" | "Neutral" | "Negative" | "Critical";

export interface Email {
  id: number;
  dbId: string;
  priority: EmailPriority;
  property: string;
  propertyId: string;
  category: EmailCategory;
  from: string;
  fromEmail: string;
  subject: string;
  received: string;
  receivedHoursAgo: number;
  status: EmailStatus;
  assignedTo: string;
  body: string;
  aiScore: number;
  aiSentiment: AISentiment;
  aiNote: string;
  aiCategoryConf: number;
  lastUpdatedBy?: string;
}
