import type {
  Email,
  EmailCategory,
  EmailPriority,
  EmailStatus,
  FeedbackEntry,
  FeedbackResponseStatus,
  FeedbackSentiment,
  Property,
  PropertyStatus,
} from "@/lib/data";
import type { FinanceProperty } from "@/lib/financeData";

export type DbProperty = {
  id: string;
  name: string;
  entity: string;
  gm_name: string | null;
  gm_email: string;
  whatsapp_number: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  is_active: boolean;
  updated_at: string;
};

export type LeaderboardRow = {
  id: string;
  total_submissions: number | string | null;
  avg_rating: number | string | null;
  google_reviews: number | string | null;
  open_complaints: number | string | null;
  today_revenue: number | string | null;
  today_occupancy_pct: number | string | null;
};

export type FeedbackRow = {
  id: string;
  submitted_at: string;
  guest_name: string | null;
  guest_email: string | null;
  room_number: string | null;
  overall_rating: number | string | null;
  sentiment: string | null;
  review_link_shown: boolean;
  property_name: string;
  ticket_status: string | null;
  sla_deadline: string | null;
};

export type EmailRow = {
  id: string;
  property_id: string | null;
  from_email: string;
  from_name: string | null;
  subject: string;
  body_preview: string | null;
  category: string;
  priority: string;
  status: string;
  ai_summary: string | null;
  ai_sentiment: string | null;
  assigned_to: string | null;
  received_at: string;
  updated_at: string;
};

export type FinanceRow = {
  property_id: string;
  entity: string;
  record_date: string;
  total_revenue: number | string | null;
  room_revenue: number | string | null;
  fnb_revenue: number | string | null;
  events_revenue: number | string | null;
  adventure_revenue: number | string | null;
  other_revenue: number | string | null;
  total_rooms: number | string | null;
  rooms_occupied: number | string | null;
  occupancy_pct: number | string | null;
  adr: number | string | null;
  revpar: number | string | null;
  outstanding_receivables: number | string | null;
  tally_file_name: string | null;
  tally_received_at: string | null;
  source: string | null;
};

export type DashboardPayload = {
  configured: boolean;
  properties: Property[];
  feedback: FeedbackEntry[];
  emails: Email[];
  financeProperties: FinanceProperty[];
  financeTrend: Array<{ date: string; totalRevenue: number; roomRevenue: number; fnbRevenue: number; eventsRevenue: number }>;
  revenueMix: Array<{ name: string; value: number; color: string }>;
  entitySummary: Array<{ entity: string; propertyCount: number; totalRevenue: number; avgOccupancy: number }>;
  latestTallyImports: Array<{ property: string; fileName: string; receivedAt: string; source: string }>;
  financeKpis: {
    totalRevenueToday: number;
    occupancy: number;
    occupiedRooms: number;
    totalRooms: number;
    adr: number;
    revpar: number;
    outstandingReceivables: number;
  };
};

function num(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function daysAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  return Math.max(0, Math.round(diff / 86_400_000));
}

function hoursAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  return Math.max(0, Math.round((diff / 3_600_000) * 10) / 10);
}

function relTime(date: string) {
  const hours = hoursAgo(date);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${Math.round(hours)} hour${Math.round(hours) === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function propertyStatus(avgRating: number, complaints: number): PropertyStatus {
  if (complaints >= 5 || avgRating < 3.8) return "Needs Attention";
  if (avgRating >= 4.5 && complaints === 0) return "Excellent";
  return "Good";
}

function feedbackSentiment(value: string | null, rating: number): FeedbackSentiment {
  if (value === "excellent" || rating >= 4) return "POSITIVE";
  if (value === "poor" || rating <= 2) return "NEGATIVE";
  return "NEUTRAL";
}

function responseStatus(status: string | null): FeedbackResponseStatus {
  if (status === "resolved" || status === "closed") return "Resolved";
  if (status === "escalated") return "Escalated";
  if (status) return "Assigned";
  return "Unassigned";
}

function emailPriority(value: string): EmailPriority {
  if (value === "urgent") return "Urgent";
  if (value === "fyi") return "FYI";
  return "Normal";
}

function emailCategory(value: string): EmailCategory {
  const map: Record<string, EmailCategory> = {
    booking_inquiry: "Booking Inquiry",
    wedding_lead: "Wedding Lead",
    guest_complaint: "Guest Complaint",
    vendor: "Vendor",
    finance: "Finance",
    general: "General",
  };
  return map[value] ?? "General";
}

function emailStatus(value: string): EmailStatus {
  if (value === "read") return "Read";
  if (value === "replied") return "Replied";
  if (value === "snoozed" || value === "archived") return "Read";
  return "Unread";
}

function entitySlug(value: string): FinanceProperty["entity"] {
  if (value === "Tirupati Shelters") return "tirupati";
  if (value === "RAS Resorts") return "ras";
  return "mundra";
}

export function buildDashboardPayload(input: {
  configured: boolean;
  properties: DbProperty[];
  leaderboard: LeaderboardRow[];
  feedback: FeedbackRow[];
  emails: EmailRow[];
  finance: FinanceRow[];
}): DashboardPayload {
  const leaderboardById = new Map(input.leaderboard.map(row => [row.id, row]));
  const propertyById = new Map(input.properties.map(row => [row.id, row]));

  const properties: Property[] = input.properties.map(row => {
    const leader = leaderboardById.get(row.id);
    const submissions = num(leader?.total_submissions);
    const avgRating = num(leader?.avg_rating);
    const complaints = num(leader?.open_complaints);
    const occupancy = num(leader?.today_occupancy_pct);
    const reviews = num(leader?.google_reviews);
    const responseRate = submissions > 0 ? 100 : 0;

    return {
      id: row.id,
      name: row.name,
      role: row.id === "silvassa" ? "GM_SILVASSA" : row.id === "dahanu" ? "GM_DAHANU" : row.id === "kumbhalgarh" ? "GM_KUMBHALGARH" : "MD",
      checkouts: submissions,
      feedbackSent: submissions,
      responseRate,
      googleReviews: reviews,
      negativeComplaints: complaints,
      status: propertyStatus(avgRating || 0, complaints),
      occupancyRate: occupancy,
      avgRating,
      responseSLAHours: complaints > 0 ? 2 : 0,
      lastComplaint: complaints > 0 ? "Open" : null,
      gmName: row.gm_name ?? row.gm_email,
      lastSync: row.updated_at ? relTime(row.updated_at) : "No sync",
      latitude: row.latitude === null ? null : num(row.latitude),
      longitude: row.longitude === null ? null : num(row.longitude),
    };
  });

  const feedback: FeedbackEntry[] = input.feedback.map((row, index) => {
    const rating = Math.round(num(row.overall_rating));
    return {
      id: index + 1,
      guest: row.guest_name ?? "Anonymous",
      property: row.property_name,
      propertyId: input.properties.find(prop => prop.name === row.property_name)?.id ?? "",
      checkoutDate: new Date(row.submitted_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      rating,
      snippet: row.guest_email ? `Feedback from ${row.guest_email}` : "Guest feedback submitted.",
      status: row.review_link_shown ? "Review Requested" : row.ticket_status ? "Manager Alerted" : "Resolved",
      timestamp: relTime(row.submitted_at),
      sentiment: feedbackSentiment(row.sentiment, rating),
      responseStatus: responseStatus(row.ticket_status),
      assignedManager: row.ticket_status ? "Property GM" : null,
      escalationMins: row.sla_deadline && new Date(row.sla_deadline).getTime() < Date.now() ? Math.round((Date.now() - new Date(row.sla_deadline).getTime()) / 60_000) : null,
    };
  });

  const emails: Email[] = input.emails.map((row, index) => {
    const prop = row.property_id ? propertyById.get(row.property_id) : undefined;
    const age = hoursAgo(row.received_at);
    const sentiment = row.ai_sentiment === "critical" ? "Critical" : row.ai_sentiment === "negative" ? "Negative" : row.ai_sentiment === "positive" ? "Positive" : "Neutral";

    return {
      id: index + 1,
      priority: emailPriority(row.priority),
      property: prop?.name ?? "Unassigned Property",
      propertyId: row.property_id ?? "",
      category: emailCategory(row.category),
      from: row.from_name ?? row.from_email,
      fromEmail: row.from_email,
      subject: row.subject,
      received: relTime(row.received_at),
      receivedHoursAgo: age,
      status: emailStatus(row.status),
      assignedTo: row.assigned_to ?? "Unassigned",
      body: row.body_preview ?? "",
      aiScore: row.priority === "urgent" ? 90 : row.category === "uncategorized" ? 20 : 60,
      aiSentiment: sentiment,
      aiNote: row.ai_summary ?? "No AI summary available.",
      aiCategoryConf: row.category === "uncategorized" ? 0 : 85,
      lastUpdatedBy: row.updated_at ? `Updated ${relTime(row.updated_at)}` : undefined,
    };
  });

  const latestFinanceByProperty = new Map<string, FinanceRow>();
  for (const row of input.finance) {
    const existing = latestFinanceByProperty.get(row.property_id);
    if (!existing || row.record_date > existing.record_date) latestFinanceByProperty.set(row.property_id, row);
  }

  const financeProperties: FinanceProperty[] = Array.from(latestFinanceByProperty.values()).map(row => {
    const prop = propertyById.get(row.property_id);
    const totalRevenue = num(row.total_revenue);
    const totalRooms = num(row.total_rooms);
    const occupied = num(row.rooms_occupied);
    const occ = num(row.occupancy_pct);
    return {
      id: row.property_id,
      name: prop?.name ?? row.property_id,
      entity: entitySlug(row.entity),
      rooms: totalRooms,
      occ,
      adr: num(row.adr),
      revpar: num(row.revpar),
      roomRev: num(row.room_revenue),
      fnbRev: num(row.fnb_revenue),
      eventsRev: num(row.events_revenue),
      totalRev: totalRevenue,
      vsYesterday: 0,
      budget: 0,
      status: occ < 60 ? "attention" : occ < 75 ? "watch" : "on-track",
    };
  });

  const totalRooms = financeProperties.reduce((sum, row) => sum + row.rooms, 0);
  const occupiedRooms = financeProperties.reduce((sum, row) => sum + Math.round((row.rooms * row.occ) / 100), 0);
  const totalRevenueToday = financeProperties.reduce((sum, row) => sum + row.totalRev, 0);
  const financeByDate = new Map<string, { date: string; totalRevenue: number; roomRevenue: number; fnbRevenue: number; eventsRevenue: number }>();
  const entityAccumulator = new Map<string, { propertyIds: Set<string>; totalRevenue: number; occupancySum: number; occupancyCount: number }>();

  for (const row of input.finance) {
    const dateBucket = financeByDate.get(row.record_date) ?? {
      date: row.record_date,
      totalRevenue: 0,
      roomRevenue: 0,
      fnbRevenue: 0,
      eventsRevenue: 0,
    };
    dateBucket.totalRevenue += num(row.total_revenue);
    dateBucket.roomRevenue += num(row.room_revenue);
    dateBucket.fnbRevenue += num(row.fnb_revenue);
    dateBucket.eventsRevenue += num(row.events_revenue);
    financeByDate.set(row.record_date, dateBucket);

    const entityBucket = entityAccumulator.get(row.entity) ?? {
      propertyIds: new Set<string>(),
      totalRevenue: 0,
      occupancySum: 0,
      occupancyCount: 0,
    };
    entityBucket.propertyIds.add(row.property_id);
    entityBucket.totalRevenue += num(row.total_revenue);
    entityBucket.occupancySum += num(row.occupancy_pct);
    entityBucket.occupancyCount += 1;
    entityAccumulator.set(row.entity, entityBucket);
  }

  const latestFinanceRows = Array.from(latestFinanceByProperty.values());
  const roomRevenue = latestFinanceRows.reduce((sum, row) => sum + num(row.room_revenue), 0);
  const fnbRevenue = latestFinanceRows.reduce((sum, row) => sum + num(row.fnb_revenue), 0);
  const eventsRevenue = latestFinanceRows.reduce((sum, row) => sum + num(row.events_revenue), 0);
  const adventureRevenue = latestFinanceRows.reduce((sum, row) => sum + num(row.adventure_revenue), 0);
  const otherRevenue = latestFinanceRows.reduce((sum, row) => sum + num(row.other_revenue), 0);

  return {
    configured: input.configured,
    properties,
    feedback,
    emails,
    financeProperties,
    financeTrend: Array.from(financeByDate.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30),
    revenueMix: [
      { name: "Room Revenue", value: roomRevenue, color: "#C9A96E" },
      { name: "F&B", value: fnbRevenue, color: "#1B4332" },
      { name: "Events", value: eventsRevenue, color: "#2d6a4f" },
      { name: "Adventure", value: adventureRevenue, color: "#64748B" },
      { name: "Other", value: otherRevenue, color: "#94A3B8" },
    ].filter(item => item.value > 0),
    entitySummary: Array.from(entityAccumulator.entries()).map(([entity, bucket]) => ({
      entity,
      propertyCount: bucket.propertyIds.size,
      totalRevenue: bucket.totalRevenue,
      avgOccupancy: bucket.occupancyCount ? Math.round(bucket.occupancySum / bucket.occupancyCount) : 0,
    })),
    latestTallyImports: latestFinanceRows
      .filter(row => row.tally_file_name || row.tally_received_at)
      .sort((a, b) => String(b.tally_received_at ?? "").localeCompare(String(a.tally_received_at ?? "")))
      .slice(0, 10)
      .map(row => ({
        property: propertyById.get(row.property_id)?.name ?? row.property_id,
        fileName: String(row.tally_file_name ?? "Tally import"),
        receivedAt: row.tally_received_at ? relTime(String(row.tally_received_at)) : "No received timestamp",
        source: String(row.source ?? "tally"),
      })),
    financeKpis: {
      totalRevenueToday,
      occupancy: totalRooms ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
      occupiedRooms,
      totalRooms,
      adr: financeProperties.length ? Math.round(financeProperties.reduce((sum, row) => sum + row.adr, 0) / financeProperties.length) : 0,
      revpar: financeProperties.length ? Math.round(financeProperties.reduce((sum, row) => sum + row.revpar, 0) / financeProperties.length) : 0,
      outstandingReceivables: input.finance.reduce((sum, row) => sum + num(row.outstanding_receivables), 0),
    },
  };
}
