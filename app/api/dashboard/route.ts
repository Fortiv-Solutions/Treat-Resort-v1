import { NextResponse } from "next/server";
import {
  buildDashboardPayload,
  type DbProperty,
  type EmailRow,
  type FeedbackRow,
  type FinanceRow,
  type LeaderboardRow,
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
    }));
  }

  const [properties, leaderboard, feedback, emails, finance] = await Promise.all([
    supabaseSelect<DbProperty>("properties", "select=*&is_active=eq.true&order=name.asc"),
    supabaseSelect<LeaderboardRow>("vw_property_leaderboard", "select=*"),
    supabaseSelect<FeedbackRow>("vw_live_feedback_feed", "select=*&limit=30"),
    supabaseSelect<EmailRow>("email_threads", "select=*&order=received_at.desc&limit=100"),
    supabaseSelect<FinanceRow>("finance_records", "select=*&order=record_date.desc&limit=300"),
  ]);

  const failed = [properties, leaderboard, feedback, emails, finance].find(result => !result.ok);
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
  }));
}
