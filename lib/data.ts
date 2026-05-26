export type Role = "MD" | "GM_SILVASSA" | "GM_DAHANU" | "GM_KUMBHALGARH";

export const ROLES: { label: string; value: Role }[] = [
  { label: "MD View — Aditya", value: "MD" },
  { label: "GM View — Silvassa", value: "GM_SILVASSA" },
  { label: "GM View — Dahanu", value: "GM_DAHANU" },
  { label: "GM View — Kumbhalgarh", value: "GM_KUMBHALGARH" },
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
}

export const PROPERTIES: Property[] = [
  { id: "silvassa",      name: "Treat Resort Silvassa",         role: "GM_SILVASSA",      checkouts: 187, feedbackSent: 162, responseRate: 86.6, googleReviews: 41,  negativeComplaints: 2, status: "Good",            occupancyRate: 79, avgRating: 4.2, responseSLAHours: 2.8, lastComplaint: "5 hours ago",   gmName: "Rajiv Sharma",   lastSync: "3 min ago" },
  { id: "dahanu",        name: "Treat Beach Resort Dahanu",     role: "GM_DAHANU",        checkouts: 143, feedbackSent: 138, responseRate: 96.5, googleReviews: 57,  negativeComplaints: 0, status: "Excellent",       occupancyRate: 91, avgRating: 4.7, responseSLAHours: 1.4, lastComplaint: null,            gmName: "Priya Nair",     lastSync: "2 min ago" },
  { id: "kumbhalgarh",   name: "Treat Resort Kumbhalgarh",      role: "GM_KUMBHALGARH",   checkouts: 211, feedbackSent: 189, responseRate: 89.6, googleReviews: 63,  negativeComplaints: 1, status: "Good",            occupancyRate: 84, avgRating: 4.5, responseSLAHours: 1.9, lastComplaint: "1 day ago",     gmName: "Amit Khanna",    lastSync: "1 min ago" },
  { id: "sambhajinagar", name: "Treat Imperial Sambhajinagar",  role: "MD",               checkouts: 97,  feedbackSent: 71,  responseRate: 73.2, googleReviews: 18,  negativeComplaints: 5, status: "Needs Attention", occupancyRate: 61, avgRating: 3.6, responseSLAHours: 4.7, lastComplaint: "2 hours ago",   gmName: "Sunita Rao",     lastSync: "Sync failed" },
  { id: "jimcorbett",    name: "Treat Imperial Jim Corbett",    role: "MD",               checkouts: 264, feedbackSent: 251, responseRate: 95.1, googleReviews: 89,  negativeComplaints: 1, status: "Excellent",       occupancyRate: 96, avgRating: 4.8, responseSLAHours: 1.2, lastComplaint: "2 days ago",    gmName: "Vikram Iyer",    lastSync: "Just now" },
  { id: "pushkar",       name: "Treat Resort Pushkar",          role: "MD",               checkouts: 178, feedbackSent: 154, responseRate: 86.5, googleReviews: 44,  negativeComplaints: 3, status: "Good",            occupancyRate: 77, avgRating: 4.3, responseSLAHours: 2.1, lastComplaint: "3 hours ago",   gmName: "Deepa Menon",    lastSync: "5 min ago" },
  { id: "udaipur",       name: "Treat Imperial Udaipur",        role: "MD",               checkouts: 302, feedbackSent: 298, responseRate: 98.7, googleReviews: 112, negativeComplaints: 0, status: "Excellent",       occupancyRate: 97, avgRating: 4.9, responseSLAHours: 0.9, lastComplaint: null,            gmName: "Rohan Malhotra", lastSync: "Just now" },
  { id: "rajkot",        name: "Treat Resort Rajkot",           role: "MD",               checkouts: 89,  feedbackSent: 61,  responseRate: 68.5, googleReviews: 14,  negativeComplaints: 7, status: "Needs Attention", occupancyRate: 58, avgRating: 3.4, responseSLAHours: 5.1, lastComplaint: "1 hour ago",    gmName: "Kavita Joshi",   lastSync: "18 min ago" },
  { id: "pune",          name: "Treat Resort Pune",             role: "MD",               checkouts: 156, feedbackSent: 141, responseRate: 90.4, googleReviews: 49,  negativeComplaints: 2, status: "Good",            occupancyRate: 82, avgRating: 4.4, responseSLAHours: 1.7, lastComplaint: "1 day ago",     gmName: "Arun Desai",     lastSync: "4 min ago" },
  { id: "nashik",        name: "Treat Resort Nashik",           role: "MD",               checkouts: 121, feedbackSent: 109, responseRate: 90.1, googleReviews: 38,  negativeComplaints: 1, status: "Good",            occupancyRate: 78, avgRating: 4.3, responseSLAHours: 2.0, lastComplaint: "3 days ago",    gmName: "Meena Patil",    lastSync: "7 min ago" },
  { id: "surat",         name: "Treat Resort Surat",            role: "MD",               checkouts: 74,  feedbackSent: 49,  responseRate: 62.2, googleReviews: 11,  negativeComplaints: 6, status: "Needs Attention", occupancyRate: 54, avgRating: 3.5, responseSLAHours: 4.3, lastComplaint: "30 min ago",   gmName: "Nikhil Shah",    lastSync: "Sync failed" },
  { id: "ahmedabad",     name: "Treat Resort Ahmedabad",        role: "MD",               checkouts: 193, feedbackSent: 184, responseRate: 95.3, googleReviews: 67,  negativeComplaints: 0, status: "Excellent",       occupancyRate: 88, avgRating: 4.6, responseSLAHours: 1.3, lastComplaint: null,            gmName: "Pooja Mehta",    lastSync: "2 min ago" },
];

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

export const FEEDBACK_FEED: FeedbackEntry[] = [
  { id: 1,  guest: "Priya Sharma",   property: "Treat Imperial Udaipur",       propertyId: "udaipur",       checkoutDate: "22 May", rating: 5, snippet: "Absolutely stunning property. The staff were incredibly warm and attentive throughout our stay.",       status: "Review Posted",     timestamp: "2 hrs ago",  sentiment: "POSITIVE", responseStatus: "Resolved",    assignedManager: "Rohan Malhotra", escalationMins: null },
  { id: 2,  guest: "Rohan Mehta",    property: "Treat Imperial Jim Corbett",   propertyId: "jimcorbett",    checkoutDate: "22 May", rating: 4, snippet: "Great jungle experience. Morning safari was brilliant. Breakfast could be improved.",                   status: "Review Requested",  timestamp: "3 hrs ago",  sentiment: "POSITIVE", responseStatus: "Assigned",    assignedManager: "Vikram Iyer",    escalationMins: null },
  { id: 3,  guest: "Anita Desai",    property: "Treat Resort Silvassa",        propertyId: "silvassa",      checkoutDate: "21 May", rating: 2, snippet: "Room was not cleaned properly and the AC was noisy all night. Very disappointed.",                    status: "Manager Alerted",   timestamp: "5 hrs ago",  sentiment: "NEGATIVE", responseStatus: "Assigned",    assignedManager: "Rajiv Sharma",   escalationMins: 72 },
  { id: 4,  guest: "Vikram Nair",    property: "Treat Resort Kumbhalgarh",     propertyId: "kumbhalgarh",   checkoutDate: "21 May", rating: 5, snippet: "Breathtaking views of the fort. Service exceeded expectations. Will definitely return.",               status: "Review Posted",     timestamp: "6 hrs ago",  sentiment: "POSITIVE", responseStatus: "Resolved",    assignedManager: "Amit Khanna",    escalationMins: null },
  { id: 5,  guest: "Sunita Patel",   property: "Treat Beach Resort Dahanu",    propertyId: "dahanu",        checkoutDate: "21 May", rating: 5, snippet: "The beachfront location is unbeatable. Seafood dinner was exceptional. Highly recommend.",             status: "Review Posted",     timestamp: "8 hrs ago",  sentiment: "POSITIVE", responseStatus: "Resolved",    assignedManager: "Priya Nair",     escalationMins: null },
  { id: 6,  guest: "Arjun Reddy",    property: "Treat Resort Ahmedabad",       propertyId: "ahmedabad",     checkoutDate: "20 May", rating: 4, snippet: "Business-friendly hotel with excellent conference facilities. Food quality is top-notch.",              status: "Review Requested",  timestamp: "10 hrs ago", sentiment: "POSITIVE", responseStatus: "Unassigned",  assignedManager: null,             escalationMins: null },
  { id: 7,  guest: "Kavitha Iyer",   property: "Treat Resort Rajkot",          propertyId: "rajkot",        checkoutDate: "20 May", rating: 1, snippet: "Terrible experience. Housekeeping was rude and the pool was closed without prior notice.",            status: "Manager Alerted",   timestamp: "12 hrs ago", sentiment: "NEGATIVE", responseStatus: "Escalated",   assignedManager: "Kavita Joshi",   escalationMins: 185 },
  { id: 8,  guest: "Deepak Joshi",   property: "Treat Resort Pushkar",         propertyId: "pushkar",       checkoutDate: "20 May", rating: 4, snippet: "Spiritual ambiance perfectly complemented our Pushkar visit. Rooftop dining was magical.",            status: "Review Posted",     timestamp: "14 hrs ago", sentiment: "POSITIVE", responseStatus: "Resolved",    assignedManager: "Deepa Menon",    escalationMins: null },
  { id: 9,  guest: "Meera Krishnan", property: "Treat Imperial Sambhajinagar", propertyId: "sambhajinagar", checkoutDate: "19 May", rating: 3, snippet: "Average stay. Location is good but the interiors feel dated. Staff were helpful though.",              status: "Resolved",           timestamp: "1 day ago",  sentiment: "NEUTRAL",  responseStatus: "Resolved",    assignedManager: "Sunita Rao",     escalationMins: null },
  { id: 10, guest: "Rahul Agarwal",  property: "Treat Resort Pune",            propertyId: "pune",          checkoutDate: "19 May", rating: 5, snippet: "Perfect weekend getaway from the city. Spa treatment was world-class. Loved every moment.",           status: "Review Posted",     timestamp: "1 day ago",  sentiment: "POSITIVE", responseStatus: "Resolved",    assignedManager: "Arun Desai",     escalationMins: null },
];

export type EmailPriority = "Urgent" | "Normal" | "FYI";
export type EmailCategory = "Booking Inquiry" | "Wedding Lead" | "Guest Complaint" | "Vendor" | "Finance" | "General";
export type EmailStatus = "Unread" | "Read" | "Replied" | "Escalated";
export type AISentiment = "Positive" | "Neutral" | "Negative" | "Critical";

export interface Email {
  id: number;
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

export const EMAILS: Email[] = [
  {
    id: 1, priority: "Urgent", property: "Treat Imperial Udaipur", propertyId: "udaipur",
    category: "Wedding Lead", from: "Radhika Malhotra", fromEmail: "radhika.malhotra@gmail.com",
    subject: "Wedding Inquiry — 200 Guests, December 2026 — Urgent Response Needed",
    received: "Just now", receivedHoursAgo: 0, status: "Unread", assignedTo: "Preethi (Sales)",
    aiScore: 92, aiSentiment: "Positive", aiNote: "Wedding lead · ₹45–55L budget · high conversion probability", aiCategoryConf: 97,
    lastUpdatedBy: "Auto-routed by AI",
    body: `Dear Team,\n\nI am writing on behalf of our family to enquire about hosting our daughter Ananya's wedding at Treat Imperial Udaipur in December 2026. We are looking at a 3-day celebration with approximately 200 guests.\n\nWe would need:\n- Block booking for 80 rooms for 3 nights (Dec 12-15, 2026)\n- Grand Ballroom for the main wedding ceremony\n- Poolside venue for the Sangeet function\n- Catering for all 3 days\n- Floral décor coordination\n\nWe have a budget of ₹45-55 lakhs for the venue. Please send us a detailed proposal at the earliest. We are also looking at 2 other properties and would like to finalize by end of this month.\n\nLooking forward to your response.\n\nWarm regards,\nRadhika Malhotra\n+91 98765 43210`
  },
  {
    id: 2, priority: "Urgent", property: "Treat Imperial Jim Corbett", propertyId: "jimcorbett",
    category: "Guest Complaint", from: "Sanjay Bhatt", fromEmail: "sanjay.bhatt@yahoo.in",
    subject: "Complaint: AC Not Working — Room 214 — Checked In Yesterday",
    received: "2 hours ago", receivedHoursAgo: 2, status: "Unread", assignedTo: "Unassigned",
    aiScore: 88, aiSentiment: "Critical", aiNote: "Active stay · TripAdvisor review threat · escalate immediately", aiCategoryConf: 99,
    lastUpdatedBy: "Unassigned",
    body: `Dear Manager,\n\nI am extremely disappointed with my stay at Treat Imperial Jim Corbett. I checked in yesterday (22 May) and the AC in Room 214 has not been working since last night. Despite complaining to the front desk TWICE, no technician has visited.\n\nIt was 34 degrees last night and my family including my 6-year-old daughter had a terrible night. This is completely unacceptable for a hotel of this calibre charging ₹12,000/night.\n\nI request immediate action. If not resolved in the next 2 hours, I will be posting reviews on TripAdvisor, Google, and MakeMyTrip.\n\nVery disappointed,\nSanjay Bhatt\nRoom 214`
  },
  {
    id: 3, priority: "Normal", property: "Treat Resort Silvassa", propertyId: "silvassa",
    category: "Booking Inquiry", from: "Neha Kapoor", fromEmail: "neha.kapoor@infosys.com",
    subject: "Corporate Room Block — Q3 Training Programme — 35 Rooms",
    received: "2 hours ago", receivedHoursAgo: 2.5, status: "Unread", assignedTo: "Amit (Reservations)",
    aiScore: 74, aiSentiment: "Positive", aiNote: "Corporate repeat client · INF-2024-TH-007 · high close probability", aiCategoryConf: 94,
    lastUpdatedBy: "Amit (Reservations)",
    body: `Hello,\n\nI am the HR Manager at Infosys Pune. We are planning our Q3 leadership training programme and are looking to block rooms at Treat Resort Silvassa for the period July 14-18, 2026.\n\nRequirement:\n- 35 rooms for 4 nights\n- Conference hall for 50 pax\n- All meals included\n- Airport transfers from Mumbai\n\nPlease share your corporate rate card and availability. We have a standing corporate agreement with Treat Hotels — Account ID: INF-2024-TH-007.\n\nBest regards,\nNeha Kapoor\nHR Manager — Infosys`
  },
  {
    id: 4, priority: "Normal", property: "Treat Resort Ahmedabad", propertyId: "ahmedabad",
    category: "Booking Inquiry", from: "Zydus Pharmaceuticals", fromEmail: "events@zyduslife.com",
    subject: "Group Booking Request — Pharma Conference — 60 Delegates — June 2026",
    received: "3 hours ago", receivedHoursAgo: 3, status: "Read", assignedTo: "Pooja (Sales)",
    aiScore: 68, aiSentiment: "Neutral", aiNote: "Conference group · 60 delegates · standard corporate rate", aiCategoryConf: 91,
    lastUpdatedBy: "Pooja (Sales) · 1 hr ago",
    body: `Dear Reservations Team,\n\nZydus Life Sciences is organizing our Annual Sales Conference in Ahmedabad on June 28-30, 2026. We require accommodation and conference facilities for 60 delegates.\n\nRequirements:\n- 60 Standard/Deluxe rooms for 2 nights\n- Main hall for plenary sessions (capacity 80)\n- 4 breakout rooms\n- Cocktail dinner on June 28\n- Gala dinner on June 29\n\nWe would appreciate a group rate proposal by Monday. Budget reference: ₹2,500/delegate/night.\n\nThank you,\nEvents Team\nZydus Life Sciences`
  },
  {
    id: 5, priority: "Urgent", property: "Treat Resort Silvassa", propertyId: "silvassa",
    category: "Guest Complaint", from: "Pradeep Choudhary", fromEmail: "pradeep.c@hotmail.com",
    subject: "Re: Poor Housekeeping & Rude Staff — Escalating to MD",
    received: "4 hours ago", receivedHoursAgo: 4, status: "Escalated", assignedTo: "GM Silvassa",
    aiScore: 95, aiSentiment: "Critical", aiNote: "Loyalty Gold member · 3rd escalation · MD-level response required", aiCategoryConf: 99,
    lastUpdatedBy: "Escalated by GM Silvassa · 2 hrs ago",
    body: `This is my third email on this matter. My stay from May 19-21 was marred by poor housekeeping and an incredibly rude interaction with your housekeeping supervisor Mr. Rajan.\n\nDespite requesting towel replacement and room cleaning by 10am, it was not done until 3pm. When I complained, Mr. Rajan was dismissive and even argumentative.\n\nI am a Treat Loyalty Gold member (ID: TH-GLM-7823) and have stayed at your properties 8 times. This is by far the worst experience.\n\nI am now escalating this to the MD's office. I expect a formal written apology and compensation.\n\nPradeep Choudhary`
  },
  {
    id: 6, priority: "Normal", property: "Treat Imperial Jim Corbett", propertyId: "jimcorbett",
    category: "Vendor", from: "Spotless Linen Services", fromEmail: "billing@spotlesslinen.co.in",
    subject: "Invoice #SL-2026-0489 — May Linen Services — ₹1,84,500",
    received: "4 hours ago", receivedHoursAgo: 4, status: "Read", assignedTo: "Ravi (Finance)",
    aiScore: 22, aiSentiment: "Neutral", aiNote: "Routine vendor invoice · due Jun 22 · 3rd property complaint this month", aiCategoryConf: 96,
    lastUpdatedBy: "Ravi (Finance) · 3 hrs ago",
    body: `Dear Accounts Team,\n\nPlease find attached Invoice #SL-2026-0489 for linen services rendered during May 1-31, 2026 at Treat Imperial Jim Corbett.\n\nInvoice Summary:\n- Daily linen changeover: ₹95,000\n- Guest laundry services: ₹54,500\n- Linen damage replacement: ₹35,000\nTotal: ₹1,84,500\n\nPayment Terms: Net 30 days\nDue Date: June 22, 2026\n\nBank details remain the same as previous invoices. Please do not hesitate to contact us if you have any queries.\n\nRegards,\nSpotless Linen Services`
  },
  {
    id: 7, priority: "Normal", property: "Treat Resort Kumbhalgarh", propertyId: "kumbhalgarh",
    category: "Wedding Lead", from: "Suresh Agarwal", fromEmail: "suresh.agarwal@agarwalfamily.com",
    subject: "Follow-up: Floral Arrangements Discussion — Agarwal Wedding Dec 5-7",
    received: "5 hours ago", receivedHoursAgo: 5, status: "Unread", assignedTo: "Meena (Events)",
    aiScore: 81, aiSentiment: "Positive", aiNote: "Confirmed wedding · florist advance needed · site visit Jun 3 requested", aiCategoryConf: 98,
    lastUpdatedBy: "Unassigned",
    body: `Hi Meena,\n\nFollowing up on our call last Thursday regarding the floral arrangements for Agarwal-Sharma wedding on December 5-7, 2026.\n\nAs discussed, we would like:\n- Marigold and rose mandap decoration in traditional Rajasthani style\n- Table centrepieces for 25 tables (dinner)\n- Floral pathway for the ceremony\n- Bride's bouquet and groom's garland\n\nCould you please share the quotation from your preferred vendor by this Friday? We need to finalize as the florist has asked for a 40% advance to block the dates.\n\nAlso, is it possible to arrange a site visit on June 3?\n\nThank you,\nSuresh Agarwal`
  },
  {
    id: 8, priority: "FYI", property: "Treat Resort Pune", propertyId: "pune",
    category: "General", from: "TripAdvisor Business", fromEmail: "noreply@tripadvisor.com",
    subject: "New Review Notification — Treat Resort Pune — 5 Stars by Anjali R.",
    received: "5 hours ago", receivedHoursAgo: 5, status: "Read", assignedTo: "Reena (PR)",
    aiScore: 45, aiSentiment: "Positive", aiNote: "5-star review · management response recommended within 24h", aiCategoryConf: 89,
    lastUpdatedBy: "Reena (PR) · 4 hrs ago",
    body: `New Review on TripAdvisor\n\nProperty: Treat Resort Pune\nReviewer: Anjali R.\nRating: ★★★★★ (5/5)\nTitle: "A hidden gem near the city!"\n\nReview: "Spent a wonderful anniversary weekend at Treat Resort Pune. The rooms are spacious and beautifully decorated. The spa is world-class — I had the signature treatment and felt completely rejuvenated. The restaurant has fantastic food. Staff were attentive without being intrusive. Would definitely come back!"\n\nManagement Response Recommended: Yes\nView full review: [TripAdvisor Dashboard]`
  },
  {
    id: 9, priority: "Normal", property: "Treat Resort Nashik", propertyId: "nashik",
    category: "Booking Inquiry", from: "Vijay Tours & Travels", fromEmail: "groups@vijaytours.com",
    subject: "Group Rates Request — Wine Tourism Package — 40 Pax — July-August",
    received: "6 hours ago", receivedHoursAgo: 6, status: "Replied", assignedTo: "Karan (Reservations)",
    aiScore: 61, aiSentiment: "Positive", aiNote: "Travel agent · 8-10 groups/season · partnership opportunity", aiCategoryConf: 93,
    lastUpdatedBy: "Karan (Reservations) · replied 1 hr ago",
    body: `Dear Team,\n\nWe are a Pune-based travel agency specializing in wine tourism packages to Nashik. We are looking to partner with Treat Resort Nashik for our upcoming tours.\n\nWe plan to operate 3-day/2-night packages for groups of 35-45 people every alternate weekend from July through September.\n\nCan you provide:\n- Special group rates for minimum 35 rooms\n- Package pricing including vineyard tours\n- Commission structure for travel agents\n- Availability calendar for July-September\n\nWe can potentially bring 8-10 groups per season.\n\nLooking forward to exploring a partnership.\n\nVijay Patil\nVijay Tours & Travels`
  },
  {
    id: 10, priority: "Urgent", property: "Treat Resort Surat", propertyId: "surat",
    category: "Guest Complaint", from: "Manish Shah", fromEmail: "manish.shah.surat@gmail.com",
    subject: "Unacceptable: Overcharged by ₹8,000 on Final Bill — Demanding Refund",
    received: "7 hours ago", receivedHoursAgo: 7, status: "Unread", assignedTo: "Unassigned",
    aiScore: 91, aiSentiment: "Critical", aiNote: "Billing dispute · ₹8,000 overcharge · bank dispute raised · immediate action", aiCategoryConf: 99,
    lastUpdatedBy: "Unassigned · 7 hrs overdue",
    body: `To the Management,\n\nI checked out of Treat Resort Surat on May 21, 2026 (Booking ID: TH-SRT-88234) and have just noticed that my credit card was charged ₹8,000 more than the agreed room rate.\n\nBreakdown of dispute:\n- Agreed room rate: ₹6,500/night × 3 nights = ₹19,500\n- Amount charged: ₹27,500\n- Excess charge: ₹8,000\n\nI have the booking confirmation email showing the agreed price. This appears to be either a billing error or fraud. I have already raised a dispute with my bank but want to give you a chance to resolve this directly first.\n\nI require a full refund of ₹8,000 within 48 hours.\n\nManish Shah`
  },
  {
    id: 11, priority: "FYI", property: "Treat Resort Rajkot", propertyId: "rajkot",
    category: "General", from: "Ritesh Soni (Front Desk)", fromEmail: "ritesh.soni@treatresorts.com",
    subject: "FWD: Staff Leave Request — Rajesh Kumar — May 26-30 [Sent to Wrong Inbox]",
    received: "8 hours ago", receivedHoursAgo: 8, status: "Read", assignedTo: "HR Team",
    aiScore: 5, aiSentiment: "Neutral", aiNote: "Internal admin · misdirected to general inbox · low priority", aiCategoryConf: 82,
    lastUpdatedBy: "HR Team · 6 hrs ago",
    body: `Hi,\n\nApologies — this leave request was mistakenly forwarded to the general enquiries inbox. Forwarding to HR for processing.\n\n--- Forwarded Message ---\nFrom: Rajesh Kumar (Housekeeping)\nTo: Front Desk\n\nDear Sir,\n\nI would like to apply for casual leave from May 26-30, 2026 (5 days) due to my sister's wedding at my hometown in Saurashtra. I have completed all pending tasks and arranged a substitute.\n\nPlease approve at the earliest.\n\nRajesh Kumar\nHousekeeping Department`
  },
  {
    id: 12, priority: "Normal", property: "Treat Resort Silvassa", propertyId: "silvassa",
    category: "Booking Inquiry", from: "Aryan Kapadia", fromEmail: "aryan.kapadia@gmail.com",
    subject: "Early Check-in Request — Booking TH-SLV-44729 — Arriving 7AM Tomorrow",
    received: "9 hours ago", receivedHoursAgo: 9, status: "Read", assignedTo: "Front Desk",
    aiScore: 38, aiSentiment: "Neutral", aiNote: "Early check-in · Deluxe room · luggage storage fallback option", aiCategoryConf: 88,
    lastUpdatedBy: "Front Desk · 8 hrs ago",
    body: `Hello,\n\nI have a booking at Treat Resort Silvassa from May 24-26 (Booking ID: TH-SLV-44729, Deluxe Room). I will be arriving from Mumbai by car and expect to reach by 7:00-7:30 AM.\n\nCould you please arrange an early check-in? I understand there may be a charge — please let me know the cost.\n\nAlternatively, could you arrange for my luggage to be stored and a breakfast to be served upon arrival while I wait?\n\nThank you for your help.\n\nAryan Kapadia\n+91 98221 67345`
  },
  {
    id: 13, priority: "Normal", property: "Treat Imperial Udaipur", propertyId: "udaipur",
    category: "Finance", from: "Accounts — Udaipur", fromEmail: "accounts.udaipur@treatresorts.com",
    subject: "Monthly Revenue Report — Treat Imperial Udaipur — April 2026",
    received: "10 hours ago", receivedHoursAgo: 10, status: "Read", assignedTo: "CFO Office",
    aiScore: 18, aiSentiment: "Positive", aiNote: "Revenue report · ₹1.24Cr · +14.8% YoY · for CFO review", aiCategoryConf: 97,
    lastUpdatedBy: "CFO Office · 9 hrs ago",
    body: `Dear Team,\n\nPlease find attached the Monthly Revenue Report for Treat Imperial Udaipur for April 2026.\n\nHighlights:\n- Total Revenue: ₹1.24 Crores (vs ₹1.08 Cr in April 2025, +14.8% YoY)\n- Occupancy Rate: 87.3% (vs 79.1% last year)\n- Average Daily Rate: ₹14,200\n- RevPAR: ₹12,396\n- F&B Revenue: ₹31.5 Lakhs (+22% YoY)\n- Spa Revenue: ₹8.7 Lakhs (new high)\n\nNotes: Peak season performance strong. May forecast looking positive with confirmed weddings.\n\nDetailed P&L attached.\n\nAccounts Team — Treat Imperial Udaipur`
  },
  {
    id: 14, priority: "Normal", property: "Treat Resort Pushkar", propertyId: "pushkar",
    category: "Booking Inquiry", from: "Insight Tours Mumbai", fromEmail: "reservations@insighttours.in",
    subject: "Group Rate Inquiry — 25-Room Block — Pushkar Camel Fair Package — Nov 2026",
    received: "11 hours ago", receivedHoursAgo: 11, status: "Replied", assignedTo: "Rohit (Sales)",
    aiScore: 55, aiSentiment: "Positive", aiNote: "Inbound tour operator · 40 intl tourists · 7-night block", aiCategoryConf: 92,
    lastUpdatedBy: "Rohit (Sales) · replied 2 hrs ago",
    body: `Dear Reservations,\n\nWe are one of the leading inbound tour operators in India and regularly bring foreign tourist groups to Pushkar during the Camel Fair.\n\nFor November 5-12, 2026 (Camel Fair dates), we would like to enquire about:\n- Block booking for 25 rooms for 7 nights\n- Arrangements for cultural evenings\n- Desert campfire experiences\n- Camel safari coordination\n\nThis would be for a mixed group of 40 international tourists (UK, Germany, Australia). Please share your best rates and availability for this period.\n\nRegards,\nInsight Tours Mumbai`
  },
  {
    id: 15, priority: "Normal", property: "Treat Resort Ahmedabad", propertyId: "ahmedabad",
    category: "General", from: "Shilpa Verma", fromEmail: "shilpa.v@gmail.com",
    subject: "Catering Query — Corporate Lunch — 50 Persons — June 5, 2026",
    received: "12 hours ago", receivedHoursAgo: 12, status: "Unread", assignedTo: "Unassigned",
    aiScore: 42, aiSentiment: "Neutral", aiNote: "Corporate lunch · 50 pax · ₹1,200-1,500pp budget · June 5", aiCategoryConf: 85,
    lastUpdatedBy: "Unassigned · 12 hrs overdue",
    body: `Hello,\n\nI am organising a corporate lunch for 50 persons at your hotel on June 5, 2026 (Friday), 1:00 PM - 3:00 PM.\n\nWe would need:\n- Private dining room or section\n- 3-course meal (vegetarian + non-vegetarian options)\n- Welcome drinks and refreshments\n- AV equipment for a 15-minute presentation\n- Parking for approximately 30 cars\n\nBudget: ₹1,200-1,500 per person (all-inclusive)\n\nCould you please share your banquet menu and availability?\n\nThank you,\nShilpa Verma\nAdmin Manager — Reliance Retail`
  },
];

export const PERF_CHART_DATA = [
  { day: "Sun", theory: 62, practice: 58, lexicon: 45 },
  { day: "Mon", theory: 71, practice: 65, lexicon: 52 },
  { day: "Tue", theory: 68, practice: 72, lexicon: 61 },
  { day: "Wed", theory: 75, practice: 69, lexicon: 58 },
  { day: "Thu", theory: 82, practice: 78, lexicon: 67 },
  { day: "Fri", theory: 79, practice: 83, lexicon: 72 },
  { day: "Sat", theory: 88, practice: 85, lexicon: 78 },
];
