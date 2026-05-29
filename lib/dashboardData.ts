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
  replied_at?: string | null;
  sla_deadline?: string | null;
  sla_breached?: boolean | null;
  updated_at: string;
  property_hint?: string | null;
  ai_score?: number | null;
  ai_confidence?: number | null;
  ai_note?: string | null;
  internal_notes?: string | null;
};

export type SubmissionRow = {
  id: string;
  property_id: string;
  guest_email: string | null;
  guest_phone: string | null;
  overall_rating: number | string | null;
  nps_score: number | string | null;
  sentiment: string | null;
  review_link_shown: boolean;
  submitted_at: string;
};

export type TicketRow = {
  id: string;
  property_id: string;
  status: string;
  assigned_to: string | null;
  sla_deadline: string;
  resolved_at: string | null;
  escalated_at: string | null;
  created_at: string;
};

export type WebhookLogRow = {
  id: string;
  workflow_name: string;
  status: string;
  error_message: string | null;
  received_at: string;
  processed_at: string | null;
};

export type AuditLogRow = {
  table_name: string;
  action: string;
  changed_at: string;
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
    revenueChangePct: number;
    occupancy: number;
    occupiedRooms: number;
    totalRooms: number;
    adr: number;
    revpar: number;
    outstandingReceivables: number;
  };
  analytics: {
    executive: {
      portfolioRevenue: number;
      revenueChangePct: number;
      occupancy: number;
      adr: number;
      revpar: number;
      avgRating: number;
      nps: number;
      openComplaints: number;
      slaBreaches: number;
      automationSuccessRate: number;
      reviewLinksShown: number;
      healthScore: number;
    };
    feedbackFunnel: {
      submissions: number;
      identifiedGuests: number;
      contactCaptureRate: number;
      positive: number;
      neutral: number;
      negative: number;
      promoters: number;
      passives: number;
      detractors: number;
      reviewLinksShown: number;
      reviewLinkRate: number;
    };
    operations: {
      totalTickets: number;
      openTickets: number;
      activeTickets: number;
      resolvedTickets: number;
      escalatedTickets: number;
      slaBreaches: number;
      complaintRecoveryPct: number;
      avgResolutionHours: number;
      unassignedTickets: number;
    };
    inbox: {
      totalThreads: number;
      unreadThreads: number;
      urgentUnread: number;
      leadThreads: number;
      handledLeadThreads: number;
      repliedThreads: number;
      avgUnreadAgeHours: number;
      avgActualResponseHours: number;
      emailSlaBreaches: number;
      unassignedThreads: number;
    };
    automation: {
      received: number;
      processed: number;
      failed: number;
      skipped: number;
      successRate: number;
      avgProcessingSeconds: number;
      recentFailures: Array<{ workflow: string; error: string; received: string }>;
    };
    systemHealth: {
      auditEvents: number;
      lastAuditAt: string | null;
      financeFreshnessHours: number | null;
      staleFinanceProperties: number;
    };
  };
};

function num(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
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

function pct(numerator: number, denominator: number) {
  return denominator > 0 ? Math.round((numerator / denominator) * 1000) / 10 : 0;
}

function hoursBetween(start: string, end: string) {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  if (!Number.isFinite(diff)) return 0;
  return Math.max(0, Math.round((diff / 3_600_000) * 10) / 10);
}

export function buildDashboardPayload(input: {
  configured: boolean;
  properties: DbProperty[];
  leaderboard: LeaderboardRow[];
  feedback: FeedbackRow[];
  emails: EmailRow[];
  finance: FinanceRow[];
  submissions?: SubmissionRow[];
  tickets?: TicketRow[];
  webhookLogs?: WebhookLogRow[];
  auditLogs?: AuditLogRow[];
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
    const propertySubmissions = (input.submissions ?? []).filter(submission => submission.property_id === row.id);
    const identifiedSubmissions = propertySubmissions.filter(submission => submission.guest_email || submission.guest_phone).length;
    const responseRate = pct(identifiedSubmissions, propertySubmissions.length || submissions);
    const propertyTickets = (input.tickets ?? []).filter(ticket => ticket.property_id === row.id);
    const resolvedTickets = propertyTickets.filter(ticket => ticket.resolved_at);
    const avgResolutionHours = resolvedTickets.length
      ? Math.round((resolvedTickets.reduce((sum, ticket) => sum + hoursBetween(ticket.created_at, ticket.resolved_at ?? ticket.created_at), 0) / resolvedTickets.length) * 10) / 10
      : 0;

    return {
      id: row.id,
      name: row.name,
      role: (row.id === "silvassa" || row.id === "treat-silvassa") ? "GM_SILVASSA" : (row.id === "dahanu" || row.id === "treat-gokarna") ? "GM_DAHANU" : row.id === "kumbhalgarh" ? "GM_KUMBHALGARH" : "MD",
      checkouts: submissions,
      feedbackSent: submissions,
      responseRate,
      googleReviews: reviews,
      negativeComplaints: complaints,
      status: propertyStatus(avgRating || 0, complaints),
      occupancyRate: occupancy,
      avgRating,
      responseSLAHours: avgResolutionHours,
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
    let prop = row.property_id ? propertyById.get(row.property_id) : undefined;
    
    // If property_id is null but property_hint is provided, try to match it
    if (!prop && row.property_hint) {
      const hint = row.property_hint.toLowerCase().trim();
      if (hint === "silvassa") {
        prop = propertyById.get("treat-silvassa");
      } else if (hint === "gokarna") {
        prop = propertyById.get("treat-gokarna");
      } else if (hint === "ras") {
        prop = propertyById.get("ras-resorts");
      } else if (hint === "tarapur") {
        prop = propertyById.get("tarapur-resort");
      } else {
        // Fallback: search for any property whose ID or Name contains the hint
        prop = input.properties.find(
          p => p.id.toLowerCase().includes(hint) || p.name.toLowerCase().includes(hint)
        );
      }
    }

    const age = hoursAgo(row.received_at);
    const sentiment = row.ai_sentiment === "critical" ? "Critical" : row.ai_sentiment === "negative" ? "Negative" : row.ai_sentiment === "positive" ? "Positive" : "Neutral";

    return {
      id: index + 1,
      dbId: row.id,
      priority: emailPriority(row.priority),
      property: prop?.name ?? (row.property_hint ? `Unassigned (${row.property_hint})` : "Unassigned Property"),
      propertyId: prop?.id ?? (row.property_hint ? row.property_hint.toLowerCase() : ""),
      category: emailCategory(row.category),
      from: row.from_name ?? row.from_email,
      fromEmail: row.from_email,
      subject: row.subject,
      received: relTime(row.received_at),
      receivedHoursAgo: age,
      status: emailStatus(row.status),
      assignedTo: row.assigned_to ?? "Unassigned",
      body: row.body_preview ?? "",
      aiScore: row.ai_score ?? (row.priority === "urgent" ? 90 : row.category === "uncategorized" ? 20 : 60),
      aiSentiment: sentiment,
      aiNote: row.ai_note ?? row.ai_summary ?? "No AI summary available.",
      aiCategoryConf: row.ai_confidence ?? (row.category === "uncategorized" ? 0 : 85),
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
  const sortedFinanceDates = Array.from(financeByDate.values()).sort((a, b) => a.date.localeCompare(b.date));
  const latestDateBucket = sortedFinanceDates.at(-1);
  const previousDateBucket = sortedFinanceDates.at(-2);
  const revenueChangePct = latestDateBucket && previousDateBucket && previousDateBucket.totalRevenue > 0
    ? Math.round(((latestDateBucket.totalRevenue - previousDateBucket.totalRevenue) / previousDateBucket.totalRevenue) * 1000) / 10
    : 0;
  const roomRevenue = latestFinanceRows.reduce((sum, row) => sum + num(row.room_revenue), 0);
  const fnbRevenue = latestFinanceRows.reduce((sum, row) => sum + num(row.fnb_revenue), 0);
  const eventsRevenue = latestFinanceRows.reduce((sum, row) => sum + num(row.events_revenue), 0);
  const adventureRevenue = latestFinanceRows.reduce((sum, row) => sum + num(row.adventure_revenue), 0);
  const otherRevenue = latestFinanceRows.reduce((sum, row) => sum + num(row.other_revenue), 0);

  const submissions = input.submissions ?? [];
  const tickets = input.tickets ?? [];
  const webhookLogs = input.webhookLogs ?? [];
  const auditLogs = input.auditLogs ?? [];
  const positive = submissions.filter(row => row.sentiment === "excellent" || num(row.overall_rating) >= 4).length;
  const negative = submissions.filter(row => row.sentiment === "poor" || (row.overall_rating !== null && num(row.overall_rating) < 3)).length;
  const neutral = Math.max(0, submissions.length - positive - negative);
  const promoters = submissions.filter(row => num(row.nps_score) >= 9).length;
  const passives = submissions.filter(row => num(row.nps_score) >= 7 && num(row.nps_score) <= 8).length;
  const detractors = submissions.filter(row => row.nps_score !== null && num(row.nps_score) <= 6).length;
  const reviewLinksShown = submissions.filter(row => row.review_link_shown).length;
  const avgRating = submissions.length
    ? Math.round((submissions.reduce((sum, row) => sum + num(row.overall_rating), 0) / submissions.length) * 10) / 10
    : 0;
  const npsRespondents = promoters + passives + detractors;
  const nps = npsRespondents ? Math.round(((promoters - detractors) / npsRespondents) * 100) : 0;
  const resolvedTickets = tickets.filter(row => row.status === "resolved" || row.status === "closed" || row.resolved_at);
  const activeTickets = tickets.filter(row => row.status !== "resolved" && row.status !== "closed");
  const slaBreaches = tickets.filter(row => new Date(row.sla_deadline).getTime() < Date.now() && row.status !== "resolved" && row.status !== "closed").length;
  const avgResolutionHours = resolvedTickets.length
    ? Math.round((resolvedTickets.reduce((sum, row) => sum + hoursBetween(row.created_at, row.resolved_at ?? row.created_at), 0) / resolvedTickets.length) * 10) / 10
    : 0;
  const unreadEmails = emails.filter(row => emailStatus(row.status) === "Unread");
  const repliedEmails = input.emails.filter(row => row.replied_at);
  const avgActualResponseHours = repliedEmails.length
    ? Math.round((repliedEmails.reduce((sum, row) => sum + hoursBetween(row.received_at, row.replied_at ?? row.received_at), 0) / repliedEmails.length) * 10) / 10
    : 0;
  const emailSlaBreaches = input.emails.filter(row =>
    row.sla_breached ||
    (row.sla_deadline && new Date(row.sla_deadline).getTime() < Date.now() && row.status !== "replied" && row.status !== "archived")
  ).length;
  const processedWebhooks = webhookLogs.filter(row => row.status === "processed").length;
  const failedWebhooks = webhookLogs.filter(row => row.status === "failed").length;
  const skippedWebhooks = webhookLogs.filter(row => row.status === "skipped").length;
  const automationSuccessRate = pct(processedWebhooks, webhookLogs.length);
  const webhookDurations = webhookLogs
    .filter(row => row.processed_at)
    .map(row => hoursBetween(row.received_at, row.processed_at ?? row.received_at) * 3600);
  const avgProcessingSeconds = webhookDurations.length
    ? Math.round(webhookDurations.reduce((sum, value) => sum + value, 0) / webhookDurations.length)
    : 0;
  const financeFreshnessHours = latestFinanceRows.length
    ? Math.min(...latestFinanceRows.map(row => row.tally_received_at ? hoursAgo(String(row.tally_received_at)) : hoursAgo(`${row.record_date}T00:00:00`)))
    : null;
  const staleFinanceProperties = latestFinanceRows.filter(row => {
    const freshness = row.tally_received_at ? hoursAgo(String(row.tally_received_at)) : hoursAgo(`${row.record_date}T00:00:00`);
    return freshness > 30;
  }).length;
  const healthScore = Math.max(0, Math.min(100, Math.round(
    (pct(processedWebhooks, webhookLogs.length || 1) * 0.2) +
    ((100 - pct(slaBreaches, Math.max(tickets.length, 1))) * 0.25) +
    (pct(positive, Math.max(submissions.length, 1)) * 0.2) +
    (Math.min(100, financeKpiOccupancy(totalRooms, occupiedRooms)) * 0.2) +
    ((100 - Math.max(0, -revenueChangePct)) * 0.15)
  )));

  return {
    configured: input.configured,
    properties,
    feedback,
    emails,
    financeProperties,
    financeTrend: sortedFinanceDates.slice(-30),
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
      revenueChangePct,
      occupancy: totalRooms ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
      occupiedRooms,
      totalRooms,
      adr: totalRooms ? Math.round(roomRevenue / Math.max(occupiedRooms, 1)) : 0,
      revpar: totalRooms ? Math.round(roomRevenue / totalRooms) : 0,
      outstandingReceivables: latestFinanceRows.reduce((sum, row) => sum + num(row.outstanding_receivables), 0),
    },
    analytics: {
      executive: {
        portfolioRevenue: totalRevenueToday,
        revenueChangePct,
        occupancy: totalRooms ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
        adr: totalRooms ? Math.round(roomRevenue / Math.max(occupiedRooms, 1)) : 0,
        revpar: totalRooms ? Math.round(roomRevenue / totalRooms) : 0,
        avgRating,
        nps,
        openComplaints: activeTickets.length,
        slaBreaches,
        automationSuccessRate,
        reviewLinksShown,
        healthScore,
      },
      feedbackFunnel: {
        submissions: submissions.length,
        identifiedGuests: submissions.filter(row => row.guest_email || row.guest_phone).length,
        contactCaptureRate: pct(submissions.filter(row => row.guest_email || row.guest_phone).length, submissions.length),
        positive,
        neutral,
        negative,
        promoters,
        passives,
        detractors,
        reviewLinksShown,
        reviewLinkRate: pct(reviewLinksShown, submissions.length),
      },
      operations: {
        totalTickets: tickets.length,
        openTickets: tickets.filter(row => row.status === "open").length,
        activeTickets: activeTickets.length,
        resolvedTickets: resolvedTickets.length,
        escalatedTickets: tickets.filter(row => row.status === "escalated" || row.escalated_at).length,
        slaBreaches,
        complaintRecoveryPct: pct(resolvedTickets.length, tickets.length),
        avgResolutionHours,
        unassignedTickets: tickets.filter(row => !row.assigned_to && row.status !== "resolved" && row.status !== "closed").length,
      },
      inbox: {
        totalThreads: emails.length,
        unreadThreads: unreadEmails.length,
        urgentUnread: emails.filter(row => row.priority === "Urgent" && row.status === "Unread").length,
        leadThreads: emails.filter(row => row.category === "Wedding Lead" || row.category === "Booking Inquiry").length,
        handledLeadThreads: emails.filter(row => (row.category === "Wedding Lead" || row.category === "Booking Inquiry") && (row.status === "Read" || row.status === "Replied")).length,
        repliedThreads: emails.filter(row => row.status === "Replied").length,
        avgUnreadAgeHours: unreadEmails.length ? Math.round((unreadEmails.reduce((sum, row) => sum + row.receivedHoursAgo, 0) / unreadEmails.length) * 10) / 10 : 0,
        avgActualResponseHours,
        emailSlaBreaches,
        unassignedThreads: emails.filter(row => row.assignedTo === "Unassigned").length,
      },
      automation: {
        received: webhookLogs.length,
        processed: processedWebhooks,
        failed: failedWebhooks,
        skipped: skippedWebhooks,
        successRate: automationSuccessRate,
        avgProcessingSeconds,
        recentFailures: webhookLogs
          .filter(row => row.status === "failed")
          .sort((a, b) => b.received_at.localeCompare(a.received_at))
          .slice(0, 5)
          .map(row => ({
            workflow: row.workflow_name,
            error: row.error_message ?? "Unknown failure",
            received: relTime(row.received_at),
          })),
      },
      systemHealth: {
        auditEvents: auditLogs.length,
        lastAuditAt: auditLogs[0]?.changed_at ? relTime(auditLogs[0].changed_at) : null,
        financeFreshnessHours,
        staleFinanceProperties,
      },
    },
  };
}

function financeKpiOccupancy(totalRooms: number, occupiedRooms: number) {
  return totalRooms ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
}
