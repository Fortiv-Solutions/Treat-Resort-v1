import { NextResponse } from "next/server";
import {
  buildDashboardPayload,
  type DbProperty,
  type EmailRow,
  type FeedbackRow,
  type FinanceRow,
  type LeaderboardRow,
  type AuditLogRow,
  type SubmissionRow,
  type TicketRow,
  type WebhookLogRow,
} from "@/lib/dashboardData";
import { isSupabaseConfigured, supabaseSelect } from "@/lib/supabaseRest";

export async function GET() {
  const configured = isSupabaseConfigured();

  if (!configured) {
    return NextResponse.json(buildDashboardPayload({
      configured: false,
      properties: [],
      leaderboard: [],
      feedback: [],
      emails: [],
      finance: [],
      submissions: [],
      tickets: [],
      webhookLogs: [],
      auditLogs: [],
    }));
  }

  const [properties, leaderboard, feedback, emails, finance, submissions, tickets, webhookLogs, auditLogs] = await Promise.all([
    supabaseSelect<DbProperty>("properties", "select=*&is_active=eq.true&order=name.asc"),
    supabaseSelect<LeaderboardRow>("vw_property_leaderboard", "select=*"),
    supabaseSelect<FeedbackRow>("vw_live_feedback_feed", "select=*&limit=30"),
    supabaseSelect<EmailRow>("email_threads", "select=*&order=received_at.desc&limit=100"),
    supabaseSelect<FinanceRow>("finance_records", "select=*&order=record_date.desc&limit=300"),
    supabaseSelect<SubmissionRow>("submissions", "select=id,property_id,guest_email,guest_phone,overall_rating,nps_score,sentiment,review_link_shown,submitted_at&order=submitted_at.desc&limit=500"),
    supabaseSelect<TicketRow>("complaint_tickets", "select=id,property_id,status,assigned_to,sla_deadline,resolved_at,escalated_at,created_at&order=created_at.desc&limit=500"),
    supabaseSelect<WebhookLogRow>("n8n_webhook_logs", "select=id,workflow_name,status,error_message,received_at,processed_at&order=received_at.desc&limit=300"),
    supabaseSelect<AuditLogRow>("audit_logs", "select=table_name,action,changed_at&order=changed_at.desc&limit=300"),
  ]);

  const failed = [properties, leaderboard, feedback, emails, finance, submissions, tickets, webhookLogs, auditLogs].find(result => !result.ok);
  if (failed && !failed.ok) {
    return NextResponse.json({ error: failed.error }, { status: failed.status });
  }

  return NextResponse.json(buildDashboardPayload({
    configured: true,
    properties: properties.ok ? properties.data : [],
    leaderboard: leaderboard.ok ? leaderboard.data : [],
    feedback: feedback.ok ? feedback.data : [],
    emails: emails.ok ? emails.data : [],
    finance: finance.ok ? finance.data : [],
    submissions: submissions.ok ? submissions.data : [],
    tickets: tickets.ok ? tickets.data : [],
    webhookLogs: webhookLogs.ok ? webhookLogs.data : [],
    auditLogs: auditLogs.ok ? auditLogs.data : [],
  }));
}
