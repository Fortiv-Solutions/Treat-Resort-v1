"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  type Role, PROPERTIES,
  type PropertyStatus, type FeedbackSentiment,
} from "@/lib/data";
import type { DashboardPayload } from "@/lib/dashboardData";
import StatCard from "./StatCard";
import PerformanceChart from "./PerformanceChart";
import {
  Hotel, MessageCircle, Star, AlertTriangle,
  ChevronDown, ChevronUp, Phone, UserCheck, CheckCircle2,
  MessageSquare, Clock, RefreshCw, TrendingUp, ShieldCheck,
  RotateCcw, Users,
} from "lucide-react";

const SatelliteMap = dynamic(() => import("./SatelliteMap"), {
  ssr: false,
  loading: () => (
    <div style={{
      background: "#0f1f15", borderRadius: "10px", height: "280px",
      border: "1px solid rgba(201,169,110,0.12)",
      display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "8px",
    }}>
      <div style={{ width: "22px", height: "22px", borderRadius: "50%", border: "2px solid #C9A96E", borderTopColor: "transparent", animation: "spin 700ms linear infinite" }} />
      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}>Loading map…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  ),
});

const STATUS_STYLE: Record<PropertyStatus, { bg: string; color: string; dot: string }> = {
  "Excellent":       { bg: "#ECFDF5", color: "#065F46", dot: "#059669" },
  "Good":            { bg: "#FFFBEB", color: "#92400E", dot: "#D97706" },
  "Needs Attention": { bg: "#FEF2F2", color: "#991B1B", dot: "#DC2626" },
};

const SENTIMENT_STYLE: Record<FeedbackSentiment, { bg: string; color: string; label: string }> = {
  POSITIVE: { bg: "#ECFDF5", color: "#065F46", label: "POSITIVE" },
  NEGATIVE: { bg: "#FEF2F2", color: "#991B1B", label: "NEGATIVE" },
  NEUTRAL:  { bg: "#F3F4F6", color: "#6B7280", label: "NEUTRAL"  },
};

const ROLE_MAP: Record<Role, string> = {
  MD: "", GM_SILVASSA: "silvassa", GM_DAHANU: "dahanu", GM_KUMBHALGARH: "kumbhalgarh",
};

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ display: "inline-flex", gap: "1px" }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= rating ? "#C9A96E" : "#E5E7EB", fontSize: "11px" }}>★</span>
      ))}
    </span>
  );
}

function ProgressBar({ value }: { value: number }) {
  const color = value >= 90 ? "#059669" : value >= 75 ? "#D97706" : "#DC2626";
  const textColor = value >= 90 ? "#065F46" : value >= 75 ? "#92400E" : "#991B1B";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <div style={{ width: "52px", height: "4px", borderRadius: "2px", background: "#E5E7EB", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: "2px" }} />
      </div>
      <span style={{ fontWeight: 600, fontSize: "11.5px", color: textColor, fontVariantNumeric: "tabular-nums" }}>{value.toFixed(1)}%</span>
    </div>
  );
}

function SLABadge({ hours }: { hours: number }) {
  const ok    = hours <= 2;
  const warn  = hours > 2 && hours <= 3.5;
  const bad   = hours > 3.5;
  const bg    = ok ? "#ECFDF5" : warn ? "#FFFBEB" : "#FEF2F2";
  const color = ok ? "#065F46" : warn ? "#92400E" : "#991B1B";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", padding: "2px 6px", borderRadius: "4px", fontSize: "11px", fontWeight: 600, background: bg, color }}>
      <Clock size={9} color={color} />
      {hours.toFixed(1)}h
    </span>
  );
}

/* ── Business KPI strip ─────────────────────────────── */
function BusinessKPIs({
  automationPct, reviewsGenerated, complaintRecovery, repeatGuestEst,
}: {
  automationPct: number; reviewsGenerated: number;
  complaintRecovery: number; repeatGuestEst: number;
}) {
  const kpis = [
    {
      icon: RefreshCw, label: "Guest Automation",
      value: `${automationPct.toFixed(1)}%`,
      sub: "of checkouts automated",
      color: "#059669",
      bg: "#ECFDF5",
    },
    {
      icon: Star, label: "Reviews Generated",
      value: reviewsGenerated.toLocaleString(),
      sub: "via WhatsApp funnel",
      color: "#C9A96E",
      bg: "#FFFBEB",
    },
    {
      icon: ShieldCheck, label: "Complaint Recovery",
      value: `${complaintRecovery}%`,
      sub: "resolved within SLA",
      color: "#1D4ED8",
      bg: "#EFF6FF",
    },
    {
      icon: RotateCcw, label: "Repeat Guest Est.",
      value: `${repeatGuestEst}%`,
      sub: "returning guests (30d)",
      color: "#7C3AED",
      bg: "#F5F3FF",
    },
  ];

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
      background: "#FFFFFF",
      border: "1px solid var(--border)",
      borderRadius: "10px",
      overflow: "hidden",
    }} className="biz-kpi-grid">
      {kpis.map(({ icon: Icon, label, value, sub, color, bg }, i) => (
        <div key={label} style={{
          padding: "12px 16px",
          borderRight: i < kpis.length - 1 ? "1px solid var(--border)" : "none",
          display: "flex", alignItems: "center", gap: "12px",
        }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px",
            background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Icon size={15} color={color} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>{label}</p>
            <p style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-1)", lineHeight: 1.2, margin: "2px 0 0", fontVariantNumeric: "tabular-nums" }}>{value}</p>
            <p style={{ fontSize: "10.5px", color: "var(--text-3)", margin: 0 }}>{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Module ──────────────────────────────────────────── */
interface Props { role: Role; data: DashboardPayload | null; }

export default function FeedbackModule({ role, data }: Props) {
  const [sortCol, setSortCol]   = useState("checkouts");
  const [sortDir, setSortDir]   = useState<"asc"|"desc">("desc");
  const [feedLimit, setFeedLimit] = useState(5);
  const [resolvedIds, setResolvedIds] = useState<Set<number>>(new Set());
  const [assignedIds, setAssignedIds] = useState<Set<number>>(new Set());

  const dbProperties = data?.properties ?? PROPERTIES;
  const dbFeedback = data?.feedback ?? [];

  const allProps = role === "MD"
    ? dbProperties
    : dbProperties.filter(p => p.id === ROLE_MAP[role]);

  const sorted = [...allProps].sort((a, b) => {
    const k = sortCol as keyof typeof a;
    const va = a[k] as number, vb = b[k] as number;
    return sortDir === "desc" ? vb - va : va - vb;
  });

  const totalCheckouts   = allProps.reduce((s, p) => s + p.checkouts, 0);
  const totalFeedback    = allProps.reduce((s, p) => s + p.feedbackSent, 0);
  const totalReviews     = allProps.reduce((s, p) => s + p.googleReviews, 0);
  const totalComplaints  = allProps.reduce((s, p) => s + p.negativeComplaints, 0);
  const feedbackPct      = totalCheckouts > 0 ? (totalFeedback / totalCheckouts) * 100 : 0;
  const automationPct    = feedbackPct;
  const visibleFeed = (role === "MD"
    ? dbFeedback
    : dbFeedback.filter(f => f.propertyId === ROLE_MAP[role])
  ).slice(0, feedLimit);

  const totalFeedSource = role === "MD"
    ? dbFeedback
    : dbFeedback.filter(f => f.propertyId === ROLE_MAP[role]);
  const resolvedFeedback = totalFeedSource.filter(entry => entry.responseStatus === "Resolved").length;
  const complaintRecovery = totalFeedSource.length > 0 ? Math.round((resolvedFeedback / totalFeedSource.length) * 100) : 0;

  function toggleSort(col: string) {
    if (sortCol === col) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortCol(col); setSortDir("desc"); }
  }

  const SortIcon = ({ col }: { col: string }) =>
    sortCol === col
      ? sortDir === "desc" ? <ChevronDown size={10} color="var(--gold)" /> : <ChevronUp size={10} color="var(--gold)" />
      : <ChevronDown size={10} color="#D1D5DB" />;

  const TABLE_COLS = [
    { key: "name",               label: "Property",    sortable: false, w: "160px" },
    { key: "occupancyRate",      label: "Occ %",       sortable: true,  w: "60px"  },
    { key: "checkouts",          label: "Submissions", sortable: true,  w: "90px"  },
    { key: "responseRate",       label: "Response",    sortable: true,  w: "110px" },
    { key: "googleReviews",      label: "Reviews",     sortable: true,  w: "70px"  },
    { key: "avgRating",          label: "Avg ★",       sortable: true,  w: "60px"  },
    { key: "negativeComplaints", label: "Complaints",  sortable: true,  w: "80px"  },
    { key: "responseSLAHours",   label: "SLA",         sortable: true,  w: "65px"  },
    { key: "status",             label: "Status",      sortable: false, w: "130px" },
  ];

  const syncFailProps = allProps.filter(p => p.lastSync === "Sync failed");

  return (
    <div className="module-stack feedback-module" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

      {/* ── Business KPI strip ── */}
      <div className="anim-fade-up" style={{ animationDelay: "0ms" }}>
        <BusinessKPIs
          automationPct={automationPct}
          reviewsGenerated={totalReviews}
          complaintRecovery={complaintRecovery}
          repeatGuestEst={0}
        />
      </div>

      {/* ── Row 1: Operational Stat cards ── */}
      <div className="stat-cards-panel" style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        background: "#FFFFFF",
        borderRadius: "10px",
        border: "1px solid var(--border)",
        overflow: "hidden",
      }}>
        <StatCard
          title="Submissions"       value={totalCheckouts} subtitle="Last 30 days from Supabase"
          icon={Hotel}              accent="gold"
          delay={0}
        />
        <StatCard
          title="Feedback Received" value={totalFeedback}  subtitle={`${feedbackPct.toFixed(1)}% response rate`}
          icon={MessageCircle}      accent={feedbackPct >= 85 ? "green" : feedbackPct >= 70 ? "amber" : "red"}
          trend={{ label: `${feedbackPct.toFixed(1)}% of checkouts`, direction: "up", positive: true }}
          delay={60}
        />
        <StatCard
          title="Google Reviews"    value={totalReviews}   subtitle="via automated WhatsApp flow"
          icon={Star}               accent="green"
          delay={120}
        />
        <StatCard
          title="Open Complaints"   value={totalComplaints} subtitle={totalComplaints > 0 ? "Require GM attention" : "All clear this month"}
          icon={AlertTriangle}      accent={totalComplaints >= 5 ? "red" : totalComplaints > 0 ? "amber" : "green"}
          trend={totalComplaints > 0
            ? { label: `${totalComplaints} unresolved`, direction: "up", positive: false }
            : { label: "0 open complaints", direction: "down", positive: true }
          }
          delay={180}
        />
      </div>

      {/* ── Sync error alert ── */}
      {syncFailProps.length > 0 && (
        <div style={{
          background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: "8px",
          padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px",
          fontSize: "12.5px",
        }}>
          <AlertTriangle size={14} color="#D97706" />
          <span style={{ color: "#92400E", fontWeight: 500 }}>
            <strong>Sync failed</strong> — {syncFailProps.map(p => p.name.replace("Treat ", "")).join(", ")}. Data may be up to 20 min stale.
          </span>
        </div>
      )}

      {/* ── Row 2: Map + Chart ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "12px" }} className="map-chart-row">
        <div className="anim-fade-up" style={{ animationDelay: "160ms", minWidth: 0 }}>
          <SatelliteMap properties={allProps} />
        </div>
        <div className="anim-fade-up" style={{ animationDelay: "200ms" }}>
          <PerformanceChart properties={allProps} />
        </div>
      </div>

      {/* ── Row 3: Property Table + Feedback Feed ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "12px", alignItems: "start" }} className="table-feed-row">

        {/* Property Performance Table */}
        <div className="glass-card anim-fade-up" style={{ padding: 0, overflow: "hidden", animationDelay: "220ms" }}>
          <div style={{ padding: "12px 16px 10px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-1)" }}>Property Performance</h2>
              <p style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "1px" }}>Supabase aggregates · click headers to sort</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {role === "MD" && (
                <span style={{ fontSize: "11px", background: "#F5EDD9", color: "#92400E", padding: "2px 8px", borderRadius: "5px", fontWeight: 600 }}>
                  {allProps.length} Properties
                </span>
              )}
              <span style={{ fontSize: "10.5px", color: "var(--text-3)", display: "flex", alignItems: "center", gap: "3px" }}>
                <RefreshCw size={10} color="var(--text-3)" />
                Backend data
              </span>
            </div>
          </div>
          <div style={{ overflowX: "auto", maxHeight: "340px", overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                <tr style={{ background: "var(--surface-2)" }}>
                  {TABLE_COLS.map(col => (
                    <th
                      key={col.key}
                      onClick={() => col.sortable && toggleSort(col.key)}
                      style={{
                        padding: "7px 12px", textAlign: "left", fontSize: "10px",
                        fontWeight: 600, color: "var(--text-3)", letterSpacing: "0.06em",
                        textTransform: "uppercase", borderBottom: "1px solid var(--border)",
                        cursor: col.sortable ? "pointer" : "default", whiteSpace: "nowrap",
                        userSelect: "none", width: col.w,
                      }}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                        {col.label} {col.sortable && <SortIcon col={col.key} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((prop, i) => (
                  <tr
                    key={prop.id}
                    className="trow"
                    style={{ background: i % 2 === 0 ? "#FFFFFF" : "var(--surface-2)" }}
                  >
                    {/* Property name */}
                    <td style={{ padding: "7px 12px", borderBottom: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{
                          width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0,
                          background: STATUS_STYLE[prop.status].dot,
                        }} />
                        <span style={{ fontWeight: 600, color: "var(--text-1)", fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "140px" }}>
                          {prop.name.replace("Treat ", "")}
                        </span>
                      </div>
                      <div style={{ fontSize: "10px", color: "var(--text-3)", marginTop: "1px", paddingLeft: "12px" }}>
                        GM: {prop.gmName}
                      </div>
                    </td>
                    {/* Occ % */}
                    <td style={{ padding: "7px 12px", borderBottom: "1px solid var(--border)", fontVariantNumeric: "tabular-nums" }}>
                      <span style={{
                        fontSize: "12px", fontWeight: 600,
                        color: prop.occupancyRate >= 85 ? "#059669" : prop.occupancyRate >= 70 ? "#D97706" : "#DC2626",
                      }}>
                        {prop.occupancyRate}%
                      </span>
                    </td>
                    {/* Checkouts */}
                    <td style={{ padding: "7px 12px", borderBottom: "1px solid var(--border)", fontWeight: 600, color: "var(--text-1)", fontVariantNumeric: "tabular-nums", fontSize: "12px" }}>
                      {prop.checkouts}
                    </td>
                    {/* Response rate */}
                    <td style={{ padding: "7px 12px", borderBottom: "1px solid var(--border)" }}>
                      <ProgressBar value={prop.responseRate} />
                    </td>
                    {/* Reviews */}
                    <td style={{ padding: "7px 12px", borderBottom: "1px solid var(--border)" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                        <Star size={10} color="#C9A96E" fill="#C9A96E" />
                        <span style={{ fontWeight: 600, color: "var(--text-1)", fontSize: "12px" }}>{prop.googleReviews}</span>
                      </span>
                    </td>
                    {/* Avg rating */}
                    <td style={{ padding: "7px 12px", borderBottom: "1px solid var(--border)", fontVariantNumeric: "tabular-nums" }}>
                      <span style={{
                        fontSize: "12px", fontWeight: 700,
                        color: prop.avgRating >= 4.5 ? "#059669" : prop.avgRating >= 4.0 ? "#D97706" : "#DC2626",
                      }}>
                        {prop.avgRating.toFixed(1)}
                      </span>
                    </td>
                    {/* Complaints */}
                    <td style={{ padding: "7px 12px", borderBottom: "1px solid var(--border)", textAlign: "center" }}>
                      {prop.negativeComplaints > 0
                        ? <span style={{ fontWeight: 700, color: prop.negativeComplaints >= 5 ? "#DC2626" : "#D97706", fontSize: "12px" }}>
                            {prop.negativeComplaints}
                          </span>
                        : <span style={{ color: "#059669", fontSize: "12px", fontWeight: 600 }}>—</span>
                      }
                    </td>
                    {/* SLA */}
                    <td style={{ padding: "7px 12px", borderBottom: "1px solid var(--border)" }}>
                      <SLABadge hours={prop.responseSLAHours} />
                    </td>
                    {/* Status */}
                    <td style={{ padding: "7px 12px", borderBottom: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span className="badge" style={{ background: STATUS_STYLE[prop.status].bg, color: STATUS_STYLE[prop.status].color }}>
                          {prop.status}
                        </span>
                        {prop.lastSync === "Sync failed" && (
                          <span style={{ fontSize: "10px", color: "#DC2626", fontWeight: 500 }}>⚠ Sync failed</span>
                        )}
                        {prop.lastSync !== "Sync failed" && (
                          <span style={{ fontSize: "10px", color: "var(--text-3)" }}>Sync {prop.lastSync}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Empty state */}
          {sorted.length === 0 && (
            <div style={{ padding: "32px", textAlign: "center", color: "var(--text-3)", fontSize: "13px" }}>
              No properties to display.
            </div>
          )}
        </div>

        {/* Live Feedback Feed */}
        <div className="glass-card anim-fade-up" style={{ padding: 0, overflow: "hidden", animationDelay: "240ms" }}>
          <div style={{ padding: "12px 16px 10px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-1)" }}>Live Feedback</h2>
              <p style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "1px" }}>From vw_live_feedback_feed</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#059669", animation: "pulse-dot 2s infinite" }} />
              <span style={{ fontSize: "10.5px", color: "var(--text-3)" }}>Backend</span>
            </div>
          </div>

          <div style={{ maxHeight: "420px", overflowY: "auto" }}>
            {visibleFeed.length === 0 ? (
              <div style={{ padding: "32px 20px", textAlign: "center" }}>
                <CheckCircle2 size={28} color="#059669" style={{ margin: "0 auto 8px" }} />
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-1)", margin: "0 0 4px" }}>All clear</p>
                <p style={{ fontSize: "12px", color: "var(--text-3)", margin: 0 }}>No feedback submissions are available yet.</p>
              </div>
            ) : visibleFeed.map((entry, i) => {
              const sentStyle     = SENTIMENT_STYLE[entry.sentiment];
              const isResolved    = resolvedIds.has(entry.id);
              const isAssigned    = assignedIds.has(entry.id);
              return (
                <div
                  key={entry.id}
                  style={{
                    padding: "10px 14px",
                    borderBottom: i < visibleFeed.length - 1 ? "1px solid var(--border)" : "none",
                    opacity: isResolved ? 0.55 : 1,
                    transition: "opacity 200ms ease",
                  }}
                >
                  {/* Header row */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px", marginBottom: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", minWidth: 0 }}>
                      {/* Sentiment badge */}
                      <span style={{
                        fontSize: "9.5px", fontWeight: 700, padding: "1px 6px",
                        borderRadius: "3px", background: sentStyle.bg, color: sentStyle.color,
                        letterSpacing: "0.04em", flexShrink: 0,
                      }}>
                        {sentStyle.label}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: "12px", color: "var(--text-1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {entry.guest}
                      </span>
                      <span style={{ color: "var(--border)", flexShrink: 0 }}>·</span>
                      <span style={{ fontSize: "11px", color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {entry.property.replace("Treat ", "").replace(" Resort", "").replace(" Imperial", "").replace(" Beach", "")}
                      </span>
                    </div>
                    <Stars rating={entry.rating} />
                  </div>

                  {/* Snippet */}
                  <p style={{ fontSize: "12px", color: "var(--text-2)", margin: "0 0 5px", lineHeight: 1.45, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    "{entry.snippet}"
                  </p>

                  {/* Meta row: assigned manager + escalation + time */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "7px", flexWrap: "wrap" }}>
                    {entry.assignedManager ? (
                      <span style={{ fontSize: "10.5px", color: "var(--text-3)", display: "flex", alignItems: "center", gap: "3px" }}>
                        <UserCheck size={10} color="var(--text-3)" />
                        {isAssigned ? "Reassigned" : entry.assignedManager}
                      </span>
                    ) : (
                      <span style={{ fontSize: "10.5px", color: "#DC2626", fontWeight: 600, display: "flex", alignItems: "center", gap: "3px" }}>
                        <AlertTriangle size={10} color="#DC2626" />
                        Unassigned
                      </span>
                    )}
                    {entry.escalationMins && !isResolved && (
                      <span style={{ fontSize: "10.5px", color: "#DC2626", fontWeight: 600, display: "flex", alignItems: "center", gap: "3px" }}>
                        <Clock size={10} color="#DC2626" />
                        {entry.escalationMins}m escalated
                      </span>
                    )}
                    {isResolved && (
                      <span style={{ fontSize: "10.5px", color: "#059669", fontWeight: 600, display: "flex", alignItems: "center", gap: "3px" }}>
                        <CheckCircle2 size={10} color="#059669" />
                        Resolved
                      </span>
                    )}
                    <span style={{ fontSize: "10px", color: "var(--text-3)", marginLeft: "auto" }}>
                      {entry.timestamp} · {entry.checkoutDate}
                    </span>
                  </div>

                  {/* Quick actions */}
                  {!isResolved && (
                    <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                      <button
                        onClick={() => {
                          const wa = window.open(`https://wa.me/?text=Dear+${entry.guest}`, "_blank");
                          if (wa) wa.focus();
                        }}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "4px",
                          padding: "4px 9px", borderRadius: "5px", border: "1px solid #E5E7EB",
                          background: "#FFFFFF", cursor: "pointer", fontSize: "11px", fontWeight: 500,
                          color: "var(--text-2)", fontFamily: "'Inter', sans-serif",
                          transition: "border-color 120ms, background 120ms",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#C9A96E"; e.currentTarget.style.background = "#FFFBEB"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.background = "#FFFFFF"; }}
                      >
                        <MessageSquare size={11} color="#059669" /> WhatsApp
                      </button>
                      <button
                        onClick={() => { const p = dbProperties.find(x => x.id === entry.propertyId); if (p) window.alert(`Calling GM: ${p.gmName}`); }}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "4px",
                          padding: "4px 9px", borderRadius: "5px", border: "1px solid #E5E7EB",
                          background: "#FFFFFF", cursor: "pointer", fontSize: "11px", fontWeight: 500,
                          color: "var(--text-2)", fontFamily: "'Inter', sans-serif",
                          transition: "border-color 120ms, background 120ms",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#93C5FD"; e.currentTarget.style.background = "#EFF6FF"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.background = "#FFFFFF"; }}
                      >
                        <Phone size={11} color="#1D4ED8" /> Call GM
                      </button>
                      <button
                        onClick={() => setAssignedIds(s => { const n = new Set(s); n.add(entry.id); return n; })}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "4px",
                          padding: "4px 9px", borderRadius: "5px", border: "1px solid #E5E7EB",
                          background: "#FFFFFF", cursor: "pointer", fontSize: "11px", fontWeight: 500,
                          color: "var(--text-2)", fontFamily: "'Inter', sans-serif",
                          transition: "border-color 120ms, background 120ms",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#A7F3D0"; e.currentTarget.style.background = "#ECFDF5"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.background = "#FFFFFF"; }}
                      >
                        <UserCheck size={11} color="#059669" /> Assign
                      </button>
                      <button
                        onClick={() => setResolvedIds(s => { const n = new Set(s); n.add(entry.id); return n; })}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "4px",
                          padding: "4px 9px", borderRadius: "5px", border: "1px solid #E5E7EB",
                          background: "#FFFFFF", cursor: "pointer", fontSize: "11px", fontWeight: 500,
                          color: "var(--text-2)", fontFamily: "'Inter', sans-serif",
                          transition: "border-color 120ms, background 120ms",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#FCA5A5"; e.currentTarget.style.background = "#FEF2F2"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.background = "#FFFFFF"; }}
                      >
                        <CheckCircle2 size={11} color="#6B7280" /> Resolve
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Show more / less */}
          {totalFeedSource.length > 5 && (
            <div style={{ padding: "8px 16px", borderTop: "1px solid var(--border)", textAlign: "center" }}>
              <button
                onClick={() => setFeedLimit(l => l === 5 ? 10 : 5)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: "11.5px", fontWeight: 600, color: "var(--text-2)",
                  fontFamily: "'Inter', sans-serif",
                  display: "inline-flex", alignItems: "center", gap: "4px",
                }}
              >
                {feedLimit === 5 ? `Show ${Math.min(5, totalFeedSource.length - 5)} more` : "Show less"}
                {feedLimit === 5 ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 1100px) {
          .map-chart-row  { grid-template-columns: 1fr !important; }
          .table-feed-row { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 700px) {
          .biz-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
