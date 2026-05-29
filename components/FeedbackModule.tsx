"use client";

import { type ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  type Role, PROPERTIES, type Property, type FeedbackEntry,
  type PropertyStatus, type FeedbackSentiment,
} from "@/lib/data";
import type { DashboardPayload } from "@/lib/dashboardData";
import PerformanceChart from "./PerformanceChart";
import {
  FileText, MessageSquare, Star, AlertTriangle, ShieldAlert,
  ChevronDown, ChevronUp, Phone, UserCheck, CheckCircle2,
  Clock, Bot, ShieldCheck, RefreshCw, ArrowUpRight, X
} from "lucide-react";



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
  MD: "", GM_SILVASSA: "treat-silvassa", GM_DAHANU: "treat-gokarna", GM_KUMBHALGARH: "kumbhalgarh",
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

type DetailSelection =
  | { type: "property"; item: Property }
  | { type: "feedback"; item: FeedbackEntry };

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg border border-brand-border-soft bg-brand-ivory px-3.5 py-3 shadow-premium-sm">
      <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-brand-text-3">{label}</div>
      <div className="mt-1.5 min-h-[20px] text-sm font-semibold leading-snug text-brand-text-1">{value}</div>
    </div>
  );
}

function DetailDrawer({ selection, onClose }: { selection: DetailSelection | null; onClose: () => void }) {
  const zoomAdjustedViewport = "calc(100dvh / 0.9)";

  useEffect(() => {
    if (!selection) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selection, onClose]);

  if (!selection || typeof document === "undefined") return null;

  const isProperty = selection.type === "property";
  const title = isProperty ? selection.item.name.replace("Treat ", "") : selection.item.guest;
  const subtitle = isProperty ? "Property performance details" : selection.item.property;

  return createPortal(
    <div
      className="fixed left-0 top-0 z-[900] w-[calc(100vw/0.9)]"
      style={{ height: zoomAdjustedViewport }}
    >
      <button
        type="button"
        aria-label="Close details"
        className="fixed left-0 top-0 w-[calc(100vw/0.9)] bg-slate-950/35 backdrop-blur-[3px]"
        style={{ height: zoomAdjustedViewport }}
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-detail-title"
        className="fixed right-0 top-0 z-[901] flex w-full max-w-[520px] flex-col border-l border-brand-gold/30 bg-brand-surface shadow-2xl"
        style={{ height: zoomAdjustedViewport, maxHeight: zoomAdjustedViewport }}
      >
        <div className="shrink-0 border-b border-brand-gold/25 bg-brand-green-950 px-6 py-4 shadow-premium-lg backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wide text-brand-gold">
                {isProperty ? "Property" : "Feedback"}
              </p>
              <h2 id="feedback-detail-title" className="mt-1 truncate font-serif text-lg font-black text-white">
                {title}
              </h2>
              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-white/65">{subtitle}</p>
            </div>
            <button
              type="button"
              aria-label="Close details"
              onClick={onClose}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-gold/30 bg-white/10 text-white/70 shadow-sm transition hover:border-brand-gold hover:text-brand-gold"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5">
          {isProperty ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailRow label="Occupancy" value={`${selection.item.occupancyRate}%`} />
                <DetailRow label="Response Rate" value={`${selection.item.responseRate.toFixed(1)}%`} />
                <DetailRow label="Submissions" value={selection.item.checkouts} />
                <DetailRow label="Feedback Sent" value={selection.item.feedbackSent} />
                <DetailRow label="Google Reviews" value={selection.item.googleReviews} />
                <DetailRow label="Average Rating" value={selection.item.avgRating.toFixed(1)} />
                <DetailRow label="Open Complaints" value={selection.item.negativeComplaints} />
                <DetailRow label="SLA" value={`${selection.item.responseSLAHours.toFixed(1)}h`} />
              </div>

              <div className="rounded-xl border border-brand-border-soft bg-brand-ivory p-4 shadow-premium-sm">
                <h3 className="text-sm font-bold text-brand-text-1">Management</h3>
                <div className="mt-3 grid gap-3">
                  <DetailRow label="GM" value={selection.item.gmName} />
                  <DetailRow label="Status" value={<span className={STATUS_STYLE[selection.item.status].badge}>{selection.item.status}</span>} />
                  <DetailRow label="Last Complaint" value={selection.item.lastComplaint ?? "No open complaint noted"} />
                  <DetailRow label="Last Sync" value={selection.item.lastSync} />
                </div>
              </div>

              {(selection.item.latitude || selection.item.longitude) && (
                <div className="rounded-xl border border-brand-border-soft bg-brand-ivory p-4 shadow-premium-sm">
                  <h3 className="text-sm font-bold text-brand-text-1">Location</h3>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <DetailRow label="Latitude" value={selection.item.latitude ?? "Not set"} />
                    <DetailRow label="Longitude" value={selection.item.longitude ?? "Not set"} />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-xl border border-brand-border-soft bg-brand-ivory p-4 shadow-premium-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className={SENTIMENT_STYLE[selection.item.sentiment].badge}>{selection.item.sentiment}</span>
                    <p className="mt-3 text-base italic leading-relaxed text-brand-text-2">
                      &quot;{selection.item.snippet}&quot;
                    </p>
                  </div>
                  <Stars rating={selection.item.rating} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailRow label="Rating" value={`${selection.item.rating}/5`} />
                <DetailRow label="Status" value={selection.item.status} />
                <DetailRow label="Response" value={selection.item.responseStatus} />
                <DetailRow label="Assigned To" value={selection.item.assignedManager ?? "Unassigned"} />
                <DetailRow label="Submitted" value={selection.item.timestamp} />
                <DetailRow label="Checkout Date" value={selection.item.checkoutDate} />
              </div>

              <div className="rounded-xl border border-brand-border-soft bg-brand-ivory p-4 shadow-premium-sm">
                <h3 className="text-sm font-bold text-brand-text-1">Escalation</h3>
                <div className="mt-3 grid gap-3">
                  <DetailRow label="Property" value={selection.item.property} />
                  <DetailRow label="Escalation Time" value={selection.item.escalationMins ? `${selection.item.escalationMins} minutes` : "No active escalation"} />
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>,
    document.body
  );
}

/* ── Bento Grid Pattern ─────────────────────────────── */

/* ── Module ──────────────────────────────────────────── */
interface Props { role: Role; data: DashboardPayload | null; }

export default function FeedbackModule({ role, data }: Props) {
  const [sortCol, setSortCol]   = useState("checkouts");
  const [sortDir, setSortDir]   = useState<"asc"|"desc">("desc");
  const [feedLimit, setFeedLimit] = useState(5);
  const [resolvedIds, setResolvedIds] = useState<Set<number>>(new Set());
  const [assignedIds, setAssignedIds] = useState<Set<number>>(new Set());
  const [selectedDetail, setSelectedDetail] = useState<DetailSelection | null>(null);

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
    { key: "name",               label: "Property",    sortable: false, w: "w-[220px]" },
    { key: "occupancyRate",      label: "Occ %",       sortable: true,  w: "w-[74px]" },
    { key: "checkouts",          label: "Submissions", sortable: true,  w: "w-[108px]" },
    { key: "responseRate",       label: "Response",    sortable: true,  w: "w-[134px]" },
    { key: "googleReviews",      label: "Reviews",     sortable: true,  w: "w-[88px]" },
    { key: "avgRating",          label: "Avg ★",       sortable: true,  w: "w-[78px]" },
    { key: "negativeComplaints", label: "Complaints",  sortable: true,  w: "w-[112px]" },
    { key: "responseSLAHours",   label: "SLA",         sortable: true,  w: "w-[90px]" },
    { key: "status",             label: "Status",      sortable: false, w: "w-[126px]" },
  ];

  const syncFailProps = allProps.filter(p => p.lastSync === "Sync failed");

  return (
    <div className="flex flex-col gap-6 w-full">

      {/* ── Bento Grid Dashboard Top ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 anim-fade-up">
        
        {/* 1. Hero Card: Guest Automation (col-span-2, row-span-2) */}
        <div className="col-span-1 md:col-span-2 xl:col-span-2 xl:row-span-2 glass-card relative overflow-hidden group">
          <div className="absolute inset-x-0 top-0 h-1 bg-brand-gold pointer-events-none" />
          <div className="p-6 sm:p-8 flex flex-col justify-between h-full relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-green-900 text-brand-gold text-xs font-bold mb-6 border border-brand-gold/30 shadow-sm">
                <Bot className="w-4 h-4" /> Guest Automation
              </div>
              <p className="text-[15px] font-medium text-brand-text-2 mb-2">Automated Checkouts</p>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black text-brand-text-1 tracking-tighter">{automationPct.toFixed(1)}</span>
                <span className="text-3xl font-bold text-brand-gold-rich">%</span>
              </div>
              <p className="text-sm text-brand-text-3 mt-4 max-w-xs leading-relaxed">
                Successfully automated checkout workflows through the WhatsApp funnel, reducing manual front-desk effort.
              </p>
            </div>
            
            <div className="mt-8 flex items-center gap-6 bg-brand-ivory/75 p-5 rounded-2xl border border-brand-border-soft shadow-sm backdrop-blur-md">
               <div className="flex-1">
                 <div className="flex items-center gap-2 mb-1">
                   <FileText className="w-4 h-4 text-brand-green-800" />
                   <p className="text-xs text-brand-text-3 font-medium">Submissions</p>
                 </div>
                 <p className="text-2xl font-bold text-brand-text-1">{totalCheckouts}</p>
               </div>
               <div className="w-px h-10 bg-brand-border-soft" />
               <div className="flex-1">
                 <div className="flex items-center gap-2 mb-1">
                   <MessageSquare className="w-4 h-4 text-brand-green-800" />
                   <p className="text-xs text-brand-text-3 font-medium">Feedback</p>
                 </div>
                 <p className="text-2xl font-bold text-brand-text-1">{totalFeedback}</p>
               </div>
            </div>
          </div>
        </div>

        {/* 2. Reviews Generated */}
        <div className="col-span-1 glass-card p-6 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-brand-gold pointer-events-none" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-[15px] font-medium text-brand-text-2 mb-1">Google Reviews</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-brand-text-1 tracking-tight">{totalReviews}</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-100 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
            </div>
          </div>
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" /> via WhatsApp funnel
            </span>
          </div>
        </div>

        {/* 3. Open Complaints */}
        <div className="col-span-1 glass-card p-6 flex flex-col justify-between group relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-32 h-32 ${totalComplaints > 0 ? "bg-red-500/10" : "bg-emerald-500/10"} blur-2xl rounded-full pointer-events-none`} />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-[15px] font-medium text-brand-text-2 mb-1">Open Complaints</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-brand-text-1 tracking-tight">{totalComplaints}</span>
              </div>
            </div>
            <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center shadow-sm border group-hover:scale-105 transition-transform ${totalComplaints > 0 ? "bg-gradient-to-br from-red-100 to-red-50 border-red-100" : "bg-gradient-to-br from-emerald-100 to-emerald-50 border-emerald-100"}`}>
              <ShieldAlert className={`w-6 h-6 ${totalComplaints > 0 ? "text-red-600" : "text-emerald-600"}`} />
            </div>
          </div>
          <div className="relative z-10">
            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold ${totalComplaints > 0 ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
              {totalComplaints > 0 ? <><ArrowUpRight className="w-3.5 h-3.5" /> Require attention</> : <><CheckCircle2 className="w-3.5 h-3.5" /> All clear</>}
            </span>
          </div>
        </div>

        {/* 4. Complaint Recovery */}
        <div className="col-span-1 glass-card p-6 flex flex-col justify-between group relative overflow-hidden">
           <div className="absolute inset-x-0 top-0 h-1 bg-brand-teal pointer-events-none" />
           <div className="flex justify-between items-start mb-6 relative z-10">
             <div>
               <p className="text-[15px] font-medium text-brand-text-2 mb-1">Complaint Recovery</p>
               <div className="flex items-baseline gap-1">
                 <span className="text-4xl font-extrabold text-brand-text-1 tracking-tight">{complaintRecovery}</span>
                 <span className="text-xl font-bold text-brand-teal">%</span>
               </div>
             </div>
             <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-brand-green-100 to-brand-green-50 border border-brand-green-100 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
               <ShieldCheck className="w-6 h-6 text-brand-teal" />
             </div>
           </div>
           <div className="relative z-10">
             <div className="flex items-center justify-between text-xs font-medium mb-2">
               <span className="text-brand-text-3">Resolved within SLA</span>
             </div>
             <div className="w-full h-2 bg-brand-surface-2 rounded-full overflow-hidden shadow-inner border border-brand-border-soft">
               <div className="h-full bg-brand-teal rounded-full transition-all duration-1000 ease-out" style={{ width: `${complaintRecovery}%` }} />
             </div>
           </div>
        </div>

        {/* 5. Repeat Guest Est. */}
        <div className="col-span-1 glass-card p-6 flex flex-col justify-between group relative overflow-hidden">
           <div className="absolute inset-x-0 top-0 h-1 bg-brand-gold pointer-events-none" />
           <div className="flex justify-between items-start mb-6 relative z-10">
             <div>
               <p className="text-[15px] font-medium text-brand-text-2 mb-1">Repeat Guests</p>
               <div className="flex items-baseline gap-1">
                 <span className="text-4xl font-extrabold text-brand-text-1 tracking-tight">0</span>
                 <span className="text-xl font-bold text-brand-gold-rich">%</span>
               </div>
             </div>
             <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-brand-gold-light to-brand-surface border border-brand-gold/25 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
               <UserCheck className="w-6 h-6 text-brand-gold-rich" />
             </div>
           </div>
           <div className="relative z-10">
             <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-brand-gold-light text-brand-gold-rich text-xs font-semibold">
               <Clock className="w-3.5 h-3.5" /> 30-day returning est.
             </span>
           </div>
        </div>

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

      {/* ── Main Dashboard Layout ── */}
      <div className="grid grid-cols-1 gap-6 items-start">

        {/* Property Performance Table */}
        <div className="order-2 glass-card overflow-hidden anim-fade-up" style={{ animationDelay: "240ms" }}>
          <div className="p-5 sm:p-6 border-b border-brand-border-soft/60 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-brand-champagne/55">
            <div>
              <h2 className="text-sm font-bold text-brand-text-1">Property Performance</h2>
              <p className="text-xs text-brand-text-3 mt-0.5">Supabase aggregates · click headers to sort</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
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
          <div className="overflow-x-auto">
            <table className="performance-table w-full min-w-[1040px] border-collapse table-fixed">
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
                  <tr
                    key={prop.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open details for ${prop.name}`}
                    onClick={() => setSelectedDetail({ type: "property", item: prop })}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedDetail({ type: "property", item: prop });
                      }
                    }}
                    className={`premium-table-row cursor-pointer outline-none transition-colors hover:bg-brand-gold-light focus-visible:bg-brand-gold-light focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-gold/45 ${i % 2 === 0 ? "bg-brand-ivory" : "bg-brand-surface-2"}`}
                  >
                    {/* Property name */}
                    <td className="premium-table-cell">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_STYLE[prop.status].dot}`} />
                        <span className="font-semibold text-brand-text-1 truncate max-w-[170px]">
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
          {sorted.length === 0 && (
            <div className="p-8 text-center text-sm text-brand-text-3">
              No properties to display.
            </div>
          )}
        </div>

        {/* Overview Insights */}
        <div className="order-1 grid grid-cols-1 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] gap-6 w-full items-stretch">
          {/* Performance Chart */}
          <div className="anim-fade-up h-full" style={{ animationDelay: "220ms" }}>
            <PerformanceChart properties={allProps} />
          </div>

          {/* Live Feedback Feed */}
          <div className="glass-card overflow-hidden anim-fade-up flex flex-col h-[420px]" style={{ animationDelay: "230ms" }}>
          <div className="p-5 sm:p-6 border-b border-brand-border-soft/60 flex justify-between items-center bg-brand-champagne/55 shrink-0">
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
            ) : visibleFeed.map((entry) => {
              const sentStyle     = SENTIMENT_STYLE[entry.sentiment];
              const isResolved    = resolvedIds.has(entry.id);
              const isAssigned    = assignedIds.has(entry.id);
              return (
                <div
                  key={entry.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open feedback details for ${entry.guest}`}
                  onClick={() => setSelectedDetail({ type: "feedback", item: entry })}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedDetail({ type: "feedback", item: entry });
                    }
                  }}
                  className={`p-4 sm:p-5 border-b border-brand-border-soft cursor-pointer outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-gold/45 ${isResolved ? "opacity-60 bg-brand-surface-2 hover:bg-brand-gold-light" : "bg-brand-ivory hover:bg-brand-gold-light"}`}
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
                        onClick={(event) => {
                          event.stopPropagation();
                          const wa = window.open(`https://wa.me/?text=Dear+${entry.guest}`, "_blank");
                          if (wa) wa.focus();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-brand-border-soft bg-brand-ivory text-xs font-semibold text-brand-text-2 hover:border-brand-green-800/50 hover:bg-brand-green-50 hover:text-brand-green-800 transition-all shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-brand-green-800" /> WhatsApp
                      </button>
                      <button
                        onClick={(event) => { event.stopPropagation(); const p = dbProperties.find(x => x.id === entry.propertyId); if (p) window.alert(`Calling GM: ${p.gmName}`); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-brand-border-soft bg-brand-ivory text-xs font-semibold text-brand-text-2 hover:border-brand-teal/50 hover:bg-brand-green-50 hover:text-brand-teal transition-all shadow-sm"
                      >
                        <Phone className="w-3.5 h-3.5 text-brand-teal" /> Call GM
                      </button>
                      <button
                        onClick={(event) => { event.stopPropagation(); setAssignedIds(s => { const n = new Set(s); n.add(entry.id); return n; }); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-brand-border-soft bg-brand-ivory text-xs font-semibold text-brand-text-2 hover:border-brand-green-800/50 hover:bg-brand-green-50 hover:text-brand-green-800 transition-all shadow-sm"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-brand-green-800" /> Assign
                      </button>
                      <button
                        onClick={(event) => { event.stopPropagation(); setResolvedIds(s => { const n = new Set(s); n.add(entry.id); return n; }); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-brand-border-soft bg-brand-ivory text-xs font-semibold text-brand-text-2 hover:border-red-600/50 hover:bg-red-50 hover:text-red-700 transition-all shadow-sm ml-auto"
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
      <DetailDrawer selection={selectedDetail} onClose={() => setSelectedDetail(null)} />
    </div>
  );
}
