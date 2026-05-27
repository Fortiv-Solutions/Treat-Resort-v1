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
  MessageSquare, Clock, RefreshCw, ShieldCheck,
  RotateCcw,
} from "lucide-react";

const SatelliteMap = dynamic(() => import("./SatelliteMap"), {
  ssr: false,
  loading: () => (
    <div className="bg-brand-green-950 rounded-xl h-[280px] border border-brand-gold/10 flex flex-col items-center justify-center gap-2">
      <div className="w-6 h-6 rounded-full border-2 border-brand-gold border-t-transparent animate-spin" />
      <p className="text-brand-text-3 text-xs">Loading map…</p>
    </div>
  ),
});

const STATUS_STYLE: Record<PropertyStatus, { badge: string; dot: string }> = {
  "Excellent":       { badge: "badge-emerald", dot: "bg-emerald-500" },
  "Good":            { badge: "badge-amber",   dot: "bg-amber-500" },
  "Needs Attention": { badge: "badge-red",     dot: "bg-red-500" },
};

const SENTIMENT_STYLE: Record<FeedbackSentiment, { badge: string }> = {
  POSITIVE: { badge: "badge-emerald" },
  NEGATIVE: { badge: "badge-red" },
  NEUTRAL:  { badge: "badge-gray" },
};

const ROLE_MAP: Record<Role, string> = {
  MD: "", GM_SILVASSA: "silvassa", GM_DAHANU: "dahanu", GM_KUMBHALGARH: "kumbhalgarh",
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`text-xs ${i <= rating ? "text-brand-gold" : "text-brand-border-soft"}`}>★</span>
      ))}
    </span>
  );
}

function ProgressBar({ value }: { value: number }) {
  const color = value >= 90 ? "bg-emerald-600" : value >= 75 ? "bg-amber-600" : "bg-red-600";
  const textColor = value >= 90 ? "text-emerald-700" : value >= 75 ? "text-amber-700" : "text-red-700";
  return (
    <div className="flex items-center gap-2">
      <div className="w-14 h-1.5 rounded-full bg-brand-border-soft overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className={`font-semibold text-xs tabular-nums ${textColor}`}>{value.toFixed(1)}%</span>
    </div>
  );
}

function SLABadge({ hours }: { hours: number }) {
  const ok    = hours <= 2;
  const warn  = hours > 2 && hours <= 3.5;
  const badgeClass = ok ? "badge-emerald" : warn ? "badge-amber" : "badge-red";
  return (
    <span className={badgeClass}>
      <Clock className="w-3 h-3" />
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
      value: `${automationPct.toFixed(1)}%`, sub: "of checkouts automated",
      colorClass: "text-emerald-600", bgClass: "bg-emerald-50",
    },
    {
      icon: Star, label: "Reviews Generated",
      value: reviewsGenerated.toLocaleString(), sub: "via WhatsApp funnel",
      colorClass: "text-brand-gold-rich", bgClass: "bg-amber-50",
    },
    {
      icon: ShieldCheck, label: "Complaint Recovery",
      value: `${complaintRecovery}%`, sub: "resolved within SLA",
      colorClass: "text-blue-600", bgClass: "bg-blue-50",
    },
    {
      icon: RotateCcw, label: "Repeat Guest Est.",
      value: `${repeatGuestEst}%`, sub: "returning guests (30d)",
      colorClass: "text-purple-600", bgClass: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 bg-white border border-brand-border rounded-xl shadow-premium-sm overflow-hidden">
      {kpis.map(({ icon: Icon, label, value, sub, colorClass, bgClass }, i) => (
        <div key={label} className={`p-4 flex items-center gap-3 ${i < kpis.length - 1 ? "border-r border-brand-border-soft" : ""}`}>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${bgClass}`}>
            <Icon className={`w-4 h-4 ${colorClass}`} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-brand-text-3 uppercase tracking-wider mb-0.5">{label}</p>
            <p className="text-xl font-bold text-brand-text-1 leading-tight tabular-nums">{value}</p>
            <p className="text-[11px] text-brand-text-3 mt-0.5 truncate">{sub}</p>
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
      ? sortDir === "desc" ? <ChevronDown className="w-3 h-3 text-brand-gold" /> : <ChevronUp className="w-3 h-3 text-brand-gold" />
      : <ChevronDown className="w-3 h-3 text-brand-text-3/40" />;

  const TABLE_COLS = [
    { key: "name",               label: "Property",    sortable: false, w: "w-48" },
    { key: "occupancyRate",      label: "Occ %",       sortable: true,  w: "w-20" },
    { key: "checkouts",          label: "Submissions", sortable: true,  w: "w-28" },
    { key: "responseRate",       label: "Response",    sortable: true,  w: "w-32" },
    { key: "googleReviews",      label: "Reviews",     sortable: true,  w: "w-24" },
    { key: "avgRating",          label: "Avg ★",       sortable: true,  w: "w-20" },
    { key: "negativeComplaints", label: "Complaints",  sortable: true,  w: "w-28" },
    { key: "responseSLAHours",   label: "SLA",         sortable: true,  w: "w-24" },
    { key: "status",             label: "Status",      sortable: false, w: "w-32" },
  ];

  const syncFailProps = allProps.filter(p => p.lastSync === "Sync failed");

  return (
    <div className="flex flex-col gap-6 w-full">

      {/* ── Business KPI strip ── */}
      <div className="anim-fade-up">
        <BusinessKPIs
          automationPct={automationPct}
          reviewsGenerated={totalReviews}
          complaintRecovery={complaintRecovery}
          repeatGuestEst={0}
        />
      </div>

      {/* ── Row 1: Operational Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 bg-white border border-brand-border rounded-xl shadow-premium-sm overflow-hidden anim-fade-up" style={{ animationDelay: "50ms" }}>
        <StatCard
          title="Submissions"       value={totalCheckouts} subtitle="Last 30 days from Supabase"
          icon={Hotel}              accent="gold"
          delay={0}
        />
        <StatCard
          title="Feedback Received" value={totalFeedback}  subtitle={`${feedbackPct.toFixed(1)}% response rate`}
          icon={MessageCircle}      accent={feedbackPct >= 85 ? "green" : feedbackPct >= 70 ? "amber" : "red"}
          trend={{ label: `${feedbackPct.toFixed(1)}% of checkouts`, direction: "up", positive: true }}
          delay={50}
        />
        <StatCard
          title="Google Reviews"    value={totalReviews}   subtitle="via automated WhatsApp flow"
          icon={Star}               accent="green"
          delay={100}
        />
        <StatCard
          title="Open Complaints"   value={totalComplaints} subtitle={totalComplaints > 0 ? "Require GM attention" : "All clear this month"}
          icon={AlertTriangle}      accent={totalComplaints >= 5 ? "red" : totalComplaints > 0 ? "amber" : "green"}
          trend={totalComplaints > 0
            ? { label: `${totalComplaints} unresolved`, direction: "up", positive: false }
            : { label: "0 open complaints", direction: "down", positive: true }
          }
          delay={150}
        />
      </div>

      {/* ── Sync error alert ── */}
      {syncFailProps.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-3 shadow-sm anim-fade-up">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <span className="text-amber-900 text-sm font-medium">
            <strong>Sync failed</strong> — {syncFailProps.map(p => p.name.replace("Treat ", "")).join(", ")}. Data may be up to 20 min stale.
          </span>
        </div>
      )}

      {/* ── Row 2: Map + Chart ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
        <div className="anim-fade-up min-w-0" style={{ animationDelay: "160ms" }}>
          <SatelliteMap properties={allProps} />
        </div>
        <div className="anim-fade-up" style={{ animationDelay: "200ms" }}>
          <PerformanceChart properties={allProps} />
        </div>
      </div>

      {/* ── Row 3: Property Table + Feedback Feed ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6 items-start">

        {/* Property Performance Table */}
        <div className="glass-card overflow-hidden anim-fade-up" style={{ animationDelay: "220ms" }}>
          <div className="p-4 sm:p-5 border-b border-brand-border-soft flex justify-between items-center bg-white/50">
            <div>
              <h2 className="text-sm font-bold text-brand-text-1">Property Performance</h2>
              <p className="text-xs text-brand-text-3 mt-0.5">Supabase aggregates · click headers to sort</p>
            </div>
            <div className="flex items-center gap-3">
              {role === "MD" && (
                <span className="badge-amber">
                  {allProps.length} Properties
                </span>
              )}
              <span className="text-xs text-brand-text-3 flex items-center gap-1.5 font-medium">
                <RefreshCw className="w-3.5 h-3.5" />
                Backend data
              </span>
            </div>
          </div>
          <div className="overflow-x-auto max-h-[400px]">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10">
                <tr>
                  {TABLE_COLS.map(col => (
                    <th
                      key={col.key}
                      onClick={() => col.sortable && toggleSort(col.key)}
                      className={`premium-table-header ${col.w}`}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {col.label} {col.sortable && <SortIcon col={col.key} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((prop, i) => (
                  <tr key={prop.id} className={`premium-table-row ${i % 2 === 0 ? "bg-white" : "bg-brand-surface-2"}`}>
                    {/* Property name */}
                    <td className="premium-table-cell">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_STYLE[prop.status].dot}`} />
                        <span className="font-semibold text-brand-text-1 truncate max-w-[140px]">
                          {prop.name.replace("Treat ", "")}
                        </span>
                      </div>
                      <div className="text-[11px] text-brand-text-3 mt-1 pl-4.5">
                        GM: {prop.gmName}
                      </div>
                    </td>
                    {/* Occ % */}
                    <td className="premium-table-cell tabular-nums">
                      <span className={`font-semibold ${prop.occupancyRate >= 85 ? "text-emerald-600" : prop.occupancyRate >= 70 ? "text-amber-600" : "text-red-600"}`}>
                        {prop.occupancyRate}%
                      </span>
                    </td>
                    {/* Checkouts */}
                    <td className="premium-table-cell font-semibold text-brand-text-1 tabular-nums">
                      {prop.checkouts}
                    </td>
                    {/* Response rate */}
                    <td className="premium-table-cell">
                      <ProgressBar value={prop.responseRate} />
                    </td>
                    {/* Reviews */}
                    <td className="premium-table-cell">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-brand-text-1">
                        <Star className="w-3.5 h-3.5 text-brand-gold fill-brand-gold" />
                        {prop.googleReviews}
                      </span>
                    </td>
                    {/* Avg rating */}
                    <td className="premium-table-cell tabular-nums">
                      <span className={`font-bold ${prop.avgRating >= 4.5 ? "text-emerald-600" : prop.avgRating >= 4.0 ? "text-amber-600" : "text-red-600"}`}>
                        {prop.avgRating.toFixed(1)}
                      </span>
                    </td>
                    {/* Complaints */}
                    <td className="premium-table-cell text-center">
                      {prop.negativeComplaints > 0
                        ? <span className={`font-bold ${prop.negativeComplaints >= 5 ? "text-red-600" : "text-amber-600"}`}>
                            {prop.negativeComplaints}
                          </span>
                        : <span className="text-emerald-600 font-semibold">—</span>
                      }
                    </td>
                    {/* SLA */}
                    <td className="premium-table-cell">
                      <SLABadge hours={prop.responseSLAHours} />
                    </td>
                    {/* Status */}
                    <td className="premium-table-cell">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={STATUS_STYLE[prop.status].badge}>
                          {prop.status}
                        </span>
                        {prop.lastSync === "Sync failed" ? (
                          <span className="text-[10px] font-semibold text-red-600">⚠ Sync failed</span>
                        ) : (
                          <span className="text-[10px] text-brand-text-3">Sync {prop.lastSync}</span>
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
            <div className="p-8 text-center text-sm text-brand-text-3">
              No properties to display.
            </div>
          )}
        </div>

        {/* Live Feedback Feed */}
        <div className="glass-card overflow-hidden anim-fade-up flex flex-col" style={{ animationDelay: "240ms", maxHeight: "500px" }}>
          <div className="p-4 sm:p-5 border-b border-brand-border-soft flex justify-between items-center bg-white/50 shrink-0">
            <div>
              <h2 className="text-sm font-bold text-brand-text-1">Live Feedback</h2>
              <p className="text-xs text-brand-text-3 mt-0.5">From vw_live_feedback_feed</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="pulse-dot bg-emerald-500" />
              <span className="text-[11px] font-medium text-brand-text-3">Backend</span>
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {visibleFeed.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                <p className="text-sm font-bold text-brand-text-1 mb-1">All clear</p>
                <p className="text-sm text-brand-text-3">No feedback submissions are available yet.</p>
              </div>
            ) : visibleFeed.map((entry, i) => {
              const sentStyle     = SENTIMENT_STYLE[entry.sentiment];
              const isResolved    = resolvedIds.has(entry.id);
              const isAssigned    = assignedIds.has(entry.id);
              return (
                <div
                  key={entry.id}
                  className={`p-4 sm:p-5 border-b border-brand-border-soft transition-opacity duration-300 ${isResolved ? "opacity-60 bg-brand-surface-2" : "bg-white hover:bg-brand-gold/5"}`}
                >
                  {/* Header row */}
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={sentStyle.badge}>
                        {entry.sentiment}
                      </span>
                      <span className="font-bold text-sm text-brand-text-1 truncate">
                        {entry.guest}
                      </span>
                      <span className="text-brand-border-soft shrink-0">·</span>
                      <span className="text-xs text-brand-text-3 truncate font-medium">
                        {entry.property.replace("Treat ", "").replace(" Resort", "").replace(" Imperial", "").replace(" Beach", "")}
                      </span>
                    </div>
                    <Stars rating={entry.rating} />
                  </div>

                  {/* Snippet */}
                  <p className="text-sm text-brand-text-2 mb-3 leading-relaxed line-clamp-2 italic">
                    &quot;{entry.snippet}&quot;
                  </p>

                  {/* Meta row: assigned manager + escalation + time */}
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    {entry.assignedManager ? (
                      <span className="text-xs text-brand-text-3 flex items-center gap-1.5 font-medium">
                        <UserCheck className="w-3.5 h-3.5" />
                        {isAssigned ? "Reassigned" : entry.assignedManager}
                      </span>
                    ) : (
                      <span className="text-xs text-red-600 font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Unassigned
                      </span>
                    )}
                    {entry.escalationMins && !isResolved && (
                      <span className="text-xs text-red-600 font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {entry.escalationMins}m escalated
                      </span>
                    )}
                    {isResolved && (
                      <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Resolved
                      </span>
                    )}
                    <span className="text-[11px] text-brand-text-3 ml-auto font-medium">
                      {entry.timestamp} · {entry.checkoutDate}
                    </span>
                  </div>

                  {/* Quick actions */}
                  {!isResolved && (
                    <div className="flex gap-2 flex-wrap mt-1">
                      <button
                        onClick={() => {
                          const wa = window.open(`https://wa.me/?text=Dear+${entry.guest}`, "_blank");
                          if (wa) wa.focus();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-brand-border-soft bg-white text-xs font-semibold text-brand-text-2 hover:border-emerald-600/50 hover:bg-emerald-50 hover:text-emerald-700 transition-all shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp
                      </button>
                      <button
                        onClick={() => { const p = dbProperties.find(x => x.id === entry.propertyId); if (p) window.alert(`Calling GM: ${p.gmName}`); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-brand-border-soft bg-white text-xs font-semibold text-brand-text-2 hover:border-blue-600/50 hover:bg-blue-50 hover:text-blue-700 transition-all shadow-sm"
                      >
                        <Phone className="w-3.5 h-3.5 text-blue-600" /> Call GM
                      </button>
                      <button
                        onClick={() => setAssignedIds(s => { const n = new Set(s); n.add(entry.id); return n; })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-brand-border-soft bg-white text-xs font-semibold text-brand-text-2 hover:border-emerald-600/50 hover:bg-emerald-50 hover:text-emerald-700 transition-all shadow-sm"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Assign
                      </button>
                      <button
                        onClick={() => setResolvedIds(s => { const n = new Set(s); n.add(entry.id); return n; })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-brand-border-soft bg-white text-xs font-semibold text-brand-text-2 hover:border-red-600/50 hover:bg-red-50 hover:text-red-700 transition-all shadow-sm ml-auto"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-text-3" /> Resolve
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Show more / less */}
          {totalFeedSource.length > 5 && (
            <div className="p-3 border-t border-brand-border-soft text-center bg-brand-surface-2 shrink-0">
              <button
                onClick={() => setFeedLimit(l => l === 5 ? 10 : 5)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-text-2 hover:text-brand-gold-rich transition-colors"
              >
                {feedLimit === 5 ? `Show ${Math.min(5, totalFeedSource.length - 5)} more` : "Show less"}
                {feedLimit === 5 ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
