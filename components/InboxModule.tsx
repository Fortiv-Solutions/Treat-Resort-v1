"use client";

import { useState } from "react";
import {
  type Role, type Email,
  type EmailPriority, type EmailCategory, type EmailStatus,
} from "@/lib/data";
import type { DashboardPayload } from "@/lib/dashboardData";
import StatCard from "./StatCard";
import {
  Mail, Clock, AlertCircle, Timer,
  X, Reply, ArrowUpCircle, AlertTriangle,
  ChevronRight, Sparkles, Bell, StickyNote,
  CheckCircle2, Target, MailWarning,
} from "lucide-react";

const ROLE_MAP: Record<Role, string> = {
  MD: "", GM_SILVASSA: "silvassa", GM_DAHANU: "dahanu", GM_KUMBHALGARH: "kumbhalgarh",
};

const PRI_STYLE: Record<EmailPriority, { badge: string; dot: string }> = {
  Urgent: { badge: "badge-red",   dot: "bg-red-500" },
  Normal: { badge: "badge-amber", dot: "bg-amber-500" },
  FYI:    { badge: "badge-gray",  dot: "bg-gray-400" },
};

const CAT_STYLE: Record<EmailCategory, { badge: string }> = {
  "Booking Inquiry": { badge: "badge-blue" },
  "Wedding Lead":    { badge: "badge-purple" },
  "Guest Complaint": { badge: "badge-red" },
  "Vendor":          { badge: "badge-gray" },
  "Finance":         { badge: "badge-emerald" },
  "General":         { badge: "badge-gray" },
};

const STATUS_STYLE: Record<EmailStatus, { color: string; weight: string }> = {
  Unread:    { color: "text-brand-text-1", weight: "font-bold" },
  Read:      { color: "text-brand-text-3", weight: "font-medium" },
  Replied:   { color: "text-emerald-700",  weight: "font-semibold" },
  Escalated: { color: "text-red-700",      weight: "font-bold" },
};

const AI_SENTIMENT_STYLE: Record<string, { badge: string; dot: string }> = {
  Positive: { badge: "badge-emerald", dot: "bg-emerald-500" },
  Neutral:  { badge: "badge-gray",    dot: "bg-gray-400" },
  Negative: { badge: "badge-red",     dot: "bg-red-500" },
  Critical: { badge: "badge-red",     dot: "bg-red-700" },
};

/* ── Inbox Business KPIs ─────────────────────────────── */
function InboxKPIs({
  leadsSaved, avgSLA, revenueAtRisk, escalationsPrevented,
}: {
  leadsSaved: number; avgSLA: number; revenueAtRisk: string; escalationsPrevented: number;
}) {
  const kpis = [
    { icon: Target, label: "Leads Saved",         value: `${leadsSaved}`, sub: "wedding + booking leads", colorClass: "text-brand-gold-rich", bgClass: "bg-brand-gold-light" },
    { icon: Clock,      label: "Avg Response SLA",     value: `${avgSLA}h`,    sub: "target: under 2h",         colorClass: avgSLA > 2 ? "text-red-600" : "text-emerald-600", bgClass: avgSLA > 2 ? "bg-red-50" : "bg-emerald-50" },
    { icon: AlertTriangle, label: "Urgent Open",       value: revenueAtRisk,   sub: "urgent unread threads", colorClass: "text-red-600", bgClass: "bg-red-50" },
    { icon: CheckCircle2,        label: "Replied Threads",       value: `${escalationsPrevented}`, sub: "status from email_threads", colorClass: "text-amber-600", bgClass: "bg-amber-50" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {kpis.map(({ icon: Icon, label, value, sub, colorClass, bgClass }) => {
        const match = String(value).match(/^([^0-9.-]*)([0-9.,]+)([^0-9]*)$/);
        const prefix = match ? match[1].trim() : "";
        const num = match ? match[2] : value;
        const suffix = match ? match[3].trim() : "";

        return (
          <div key={label} className="glass-card p-6 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 ${bgClass} shadow-sm`}>
              <Icon className={`w-5 h-5 ${colorClass}`} strokeWidth={2.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-brand-text-2 mb-1">{label}</p>
              <div className="flex items-baseline leading-tight">
                {prefix && <span className="text-lg font-bold text-brand-text-3 mr-0.5">{prefix}</span>}
                <span className="text-3xl xl:text-4xl font-bold text-brand-text-1 tabular-nums tracking-tight">{num}</span>
                {suffix && <span className="text-base font-bold text-brand-text-3 ml-0.5">{suffix}</span>}
              </div>
              <p className="text-[11px] text-brand-text-3 mt-1 truncate">{sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Side Panel ─────────────────────────────────────── */
function SidePanel({ email, onClose }: { email: Email; onClose: () => void }) {
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);

  function saveNote() {
    if (!note.trim()) return;
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  }

  const aiStyle = AI_SENTIMENT_STYLE[email.aiSentiment] ?? AI_SENTIMENT_STYLE.Neutral;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[490] bg-brand-green-950/40 backdrop-blur-sm animate-fade-in"
      />
      <aside className="fixed inset-y-0 right-0 z-[500] w-full md:w-[480px] bg-brand-surface flex flex-col shadow-2xl border-l border-brand-gold/30 anim-slide-right">
        {/* Header */}
        <div className="bg-gradient-to-br from-brand-green-900 to-brand-green-950 p-5 shrink-0 relative">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex gap-2 mb-3 flex-wrap">
                <span className={PRI_STYLE[email.priority].badge}>{email.priority}</span>
                <span className={CAT_STYLE[email.category].badge}>{email.category}</span>
              </div>
              <h3 className="text-white font-bold text-base leading-snug">{email.subject}</h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4 text-white/80" />
            </button>
          </div>
          <div className="mt-3 text-[13px] text-white/60">
            <span className="text-brand-gold font-semibold">{email.from}</span>
            {" · "}{email.property.replace("Treat ", "")} · {email.received}
          </div>
          {email.lastUpdatedBy && (
            <div className="mt-1 text-xs text-white/40">
              {email.lastUpdatedBy}
            </div>
          )}
        </div>

        {/* AI Insight bar */}
        <div className="px-5 py-3 bg-brand-surface-2 border-b border-brand-border flex gap-3 items-start">
          <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-gold-rich" />
            <span className="text-[11px] font-bold text-brand-gold-rich uppercase tracking-wider">AI</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-brand-text-1 mb-2 font-medium leading-snug">{email.aiNote}</p>
            <div className="flex gap-2 flex-wrap">
              <span className={aiStyle.badge}>
                <span className={`w-1.5 h-1.5 rounded-full inline-block ${aiStyle.dot}`} />
                {email.aiSentiment}
              </span>
              <span className="badge-blue">
                {email.aiCategoryConf}% conf · {email.category}
              </span>
              <span className={email.aiScore >= 70 ? "badge-purple" : "badge-gray"}>
                Score {email.aiScore}/100
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6">
          <pre className="font-sans text-sm text-brand-text-2 leading-relaxed whitespace-pre-wrap break-words">
            {email.body}
          </pre>
        </div>

        {/* Internal note */}
        <div className="p-5 border-t border-brand-border-soft bg-amber-50/50">
          <div className="flex items-center gap-1.5 mb-2">
            <StickyNote className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-xs font-bold text-amber-800">Internal Note</span>
          </div>
          <div className="flex gap-2">
            <input
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Add a note for your team…"
              className="flex-1 px-3 py-2 rounded-lg border border-brand-gold/40 bg-brand-ivory text-[13px] text-brand-text-1 outline-none transition-colors focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
            />
            <button
              onClick={saveNote}
              className={`px-4 py-2 rounded-lg text-[13px] font-bold text-white transition-colors ${noteSaved ? "bg-emerald-600" : "bg-brand-green-900 hover:bg-brand-green-800"}`}
            >
              {noteSaved ? "Saved!" : "Save"}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 md:p-5 border-t border-brand-border bg-brand-surface-2 shrink-0 flex gap-2.5 flex-wrap items-center">
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-green-900 text-brand-gold rounded-lg font-bold text-[13px] hover:bg-brand-green-800 transition-colors shadow-sm">
            <Reply className="w-4 h-4" /> Reply
          </button>
          <button className="flex items-center gap-2 px-3.5 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg font-bold text-[13px] hover:bg-red-100 transition-colors shadow-sm">
            <ArrowUpCircle className="w-4 h-4" /> Escalate
          </button>
          <button className="flex items-center gap-2 px-3.5 py-2 bg-brand-green-50 text-brand-teal border border-brand-teal/20 rounded-lg font-bold text-[13px] hover:bg-brand-green-100 transition-colors shadow-sm">
            <Bell className="w-4 h-4" /> Snooze
          </button>
          <select className="flex-1 min-w-[120px] px-3 py-2 bg-brand-ivory border border-brand-border rounded-lg text-[13px] text-brand-text-2 font-medium outline-none cursor-pointer focus:border-brand-gold">
            <option>Assign To…</option>
            <option>Preethi (Sales)</option>
            <option>Amit (Reservations)</option>
            <option>Ravi (Finance)</option>
            <option>GM — Property</option>
          </select>
        </div>
      </aside>
    </>
  );
}

/* ── Main Module ─────────────────────────────────────── */
interface InboxModuleProps { role: Role; data: DashboardPayload | null; }

export default function InboxModule({ role, data }: InboxModuleProps) {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [filterPri, setFilterPri] = useState<EmailPriority | "All">("All");
  const [filterCat, setFilterCat] = useState<EmailCategory | "All">("All");
  const [snoozedIds, setSnoozedIds] = useState<Set<number>>(new Set());

  const dbEmails = data?.emails ?? [];
  const allScope = role === "MD" ? dbEmails : dbEmails.filter(e => e.propertyId === ROLE_MAP[role]);

  const visibleEmails = allScope
    .filter(e => !snoozedIds.has(e.id))
    .filter(e => filterPri === "All" || e.priority === filterPri)
    .filter(e => filterCat === "All" || e.category === filterCat);

  const unread      = allScope.filter(e => e.status === "Unread").length;
  const highPriUr   = allScope.filter(e => e.status === "Unread" && e.priority === "Urgent").length;
  const pending2h   = allScope.filter(e => e.status === "Unread" && e.receivedHoursAgo >= 2);
  const pendingUnread = allScope.filter(e => e.status === "Unread");
  const avgResp = pendingUnread.length
    ? Math.round((pendingUnread.reduce((sum, email) => sum + email.receivedHoursAgo, 0) / pendingUnread.length) * 10) / 10
    : 0;
  const leadEmails  = allScope.filter(e => e.category === "Wedding Lead" || e.category === "Booking Inquiry");
  const urgentUnread = allScope.filter(e => e.status === "Unread" && e.priority === "Urgent").length;
  const repliedThreads = allScope.filter(e => e.status === "Replied").length;

  return (
    <div className="flex flex-col gap-6 w-full">

      {/* Business KPIs */}
      <div className="anim-fade-up">
        <InboxKPIs
          leadsSaved={leadEmails.filter(e => e.status === "Replied" || e.status === "Read").length}
          avgSLA={avgResp}
          revenueAtRisk={String(urgentUnread)}
          escalationsPrevented={repliedThreads}
        />
      </div>

      {/* Operational Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 anim-fade-up" style={{ animationDelay: "50ms" }}>
        <StatCard
          title="Email Threads"
          value={allScope.length}
          subtitle="From email_threads"
          icon={Mail}
          accent="gold"
          delay={0}
        />
        <StatCard
          title="Unread / Pending"
          value={unread}
          subtitle={`${allScope.length - unread} already handled`}
          icon={MailWarning}
          accent={unread > 5 ? "red" : unread > 2 ? "amber" : "green"}
          trend={{ label: `${unread} need response`, direction: unread > 3 ? "up" : "down", positive: false }}
          delay={50}
        />
        <StatCard
          title="High Priority Unread"
          value={highPriUr}
          subtitle="Urgent — act immediately"
          icon={AlertCircle}
          accent={highPriUr >= 3 ? "red" : highPriUr > 0 ? "amber" : "green"}
          trend={highPriUr > 0
            ? { label: `${highPriUr} urgent unread`, direction: "up", positive: false }
            : { label: "All urgent handled", direction: "down", positive: true }
          }
          delay={100}
        />
        <StatCard
          title="Avg Response Time"
          value={`${avgResp}h`}
          subtitle="Target: under 2 hours"
          icon={Timer}
          accent={avgResp > 3 ? "red" : avgResp > 2 ? "amber" : "green"}
          trend={{
            label: avgResp > 2 ? `${(avgResp - 2).toFixed(1)}h over target` : "Within target",
            direction: avgResp > 2 ? "up" : "down",
            positive: false,
          }}
          animateNumber={false}
          delay={150}
        />
      </div>

      {/* SLA alert banner */}
      {pending2h.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4 flex items-start gap-3 shadow-sm anim-fade-up">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-sm text-amber-900 mb-0.5">
              {pending2h.length} email{pending2h.length > 1 ? "s" : ""} pending over 2 hours
            </p>
            <p className="text-[13px] text-amber-700 mb-0 font-medium">
              {pending2h.slice(0, 3).map(e => e.property.replace("Treat ", "")).join(" · ")}
              {pending2h.length > 3 && ` · +${pending2h.length - 3} more`}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-600 shrink-0 mt-1" />
        </div>
      )}

      {/* Filter Bar */}
      <div className="glass-card p-3 sm:p-4 anim-fade-up" style={{ animationDelay: "150ms" }}>
        <div className="flex gap-4 items-center flex-wrap">
          <span className="text-[11px] font-bold text-brand-text-3 tracking-wider uppercase whitespace-nowrap">Filter</span>
          <div className="flex gap-2 flex-wrap">
            {(["All", "Urgent", "Normal", "FYI"] as const).map(p => (
              <button key={p} onClick={() => setFilterPri(p)} className={`px-3 py-1.5 rounded-lg border text-[12px] font-semibold transition-all focus:outline-none shadow-sm
                ${filterPri === p
                  ? (p === "Urgent" ? "bg-red-50 text-red-700 border-red-200" : p === "Normal" ? "bg-amber-50 text-amber-700 border-amber-200" : p === "FYI" ? "bg-gray-100 text-gray-700 border-gray-300" : "bg-brand-green-900 text-brand-gold border-brand-green-900")
                  : "bg-brand-ivory text-brand-text-2 border-brand-border hover:bg-brand-surface-2"
                }`}>
                {p}
              </button>
            ))}
          </div>
          <div className="w-[1px] h-6 bg-brand-border hidden sm:block" />
          <div className="flex gap-2 flex-wrap">
            {(["All", "Booking Inquiry", "Wedding Lead", "Guest Complaint", "Vendor", "Finance"] as const).map(c => (
              <button key={c} onClick={() => setFilterCat(c)} className={`px-3 py-1.5 rounded-lg border text-[12px] font-semibold transition-all focus:outline-none shadow-sm
                ${filterCat === c
                  ? (c === "All" ? "bg-brand-green-900 text-brand-gold border-brand-green-900" : "bg-brand-surface-3 text-brand-text-1 border-brand-border-soft")
                  : "bg-brand-ivory text-brand-text-2 border-brand-border hover:bg-brand-surface-2"
                }`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Email Table */}
      <div className="glass-card overflow-hidden anim-fade-up" style={{ animationDelay: "200ms" }}>
          <div className="p-5 sm:p-6 border-b border-brand-border-soft/60 flex justify-between items-center bg-brand-champagne/55">
          <div>
            <h2 className="text-sm font-bold text-brand-text-1">Email Inbox</h2>
            <p className="text-xs text-brand-text-3 mt-0.5">Click any row to read & respond</p>
          </div>
          <div className="flex items-center gap-3">
            {snoozedIds.size > 0 && (
              <button
                onClick={() => setSnoozedIds(new Set())}
                className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-md hover:bg-amber-100 transition-colors"
              >
                {snoozedIds.size} snoozed — show all
              </button>
            )}
            <span className="badge-amber">
              {visibleEmails.length} emails
            </span>
          </div>
        </div>

        {visibleEmails.length === 0 ? (
          <div className="p-10 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
            <p className="text-base font-bold text-brand-text-1 mb-1">Inbox clear</p>
            <p className="text-sm text-brand-text-3">No emails match this filter. Try &quot;All&quot; to see everything.</p>
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10">
                <tr>
                  {["Priority", "AI", "Property", "Category", "From", "Subject", "Received", "Status", "Assigned", "Actions"].map(h => (
                    <th key={h} className="premium-table-header">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleEmails.map((email, i) => {
                  const isSelected = selectedEmail?.id === email.id;
                  const isUnread   = email.status === "Unread";
                  const aiStyle    = AI_SENTIMENT_STYLE[email.aiSentiment] ?? AI_SENTIMENT_STYLE.Neutral;
                  return (
                    <tr
                      key={email.id}
                      className={`premium-table-row ${isSelected ? "bg-brand-gold/10 border-brand-gold/20" : i % 2 === 0 ? "bg-brand-ivory" : "bg-brand-surface-2"}`}
                      onClick={() => setSelectedEmail(isSelected ? null : email)}
                    >
                      {/* Priority */}
                      <td className="premium-table-cell whitespace-nowrap">
                        <span className={PRI_STYLE[email.priority].badge}>
                          <span className={`pulse-dot ${PRI_STYLE[email.priority].dot}`} style={{ animationPlayState: email.priority === "Urgent" && isUnread ? "running" : "paused" }} />
                          {email.priority}
                        </span>
                      </td>
                      {/* AI Score + Sentiment */}
                      <td className="premium-table-cell">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${email.aiScore >= 70 ? "text-brand-gold-rich" : email.aiScore >= 40 ? "text-amber-600" : "text-gray-500"}`}>
                            <Sparkles className="w-3 h-3" />
                            {email.aiScore}
                          </span>
                          <span className={aiStyle.badge}>
                            {email.aiSentiment}
                          </span>
                        </div>
                      </td>
                      {/* Property */}
                      <td className="premium-table-cell max-w-[140px]">
                        <span className="text-[13px] text-brand-text-2 truncate block" title={email.property}>
                          {email.property.replace("Treat ", "")}
                        </span>
                      </td>
                      {/* Category */}
                      <td className="premium-table-cell whitespace-nowrap">
                        <span className={CAT_STYLE[email.category].badge}>
                          {email.category}
                        </span>
                      </td>
                      {/* From */}
                      <td className="premium-table-cell">
                        <div className={`text-[13px] ${isUnread ? "font-bold text-brand-text-1" : "font-medium text-brand-text-1"}`}>{email.from}</div>
                        <div className="text-[11px] text-brand-text-3">{email.fromEmail}</div>
                      </td>
                      {/* Subject */}
                      <td className="premium-table-cell max-w-[320px]">
                        <span className={`text-[13px] leading-relaxed ${isUnread ? "font-bold text-brand-text-1" : "font-medium text-brand-text-2"}`} title={email.subject}>
                          {isUnread && (
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-green-900 mr-1.5 align-middle" />
                          )}
                          {email.subject}
                        </span>
                        {/* AI note snippet */}
                        <span className="text-[11px] text-brand-gold-rich block mt-1">
                          ✦ {email.aiNote}
                        </span>
                      </td>
                      {/* Received */}
                      <td className={`premium-table-cell text-xs whitespace-nowrap ${email.receivedHoursAgo >= 2 && isUnread ? "text-red-600 font-bold" : "text-brand-text-3 font-medium"}`}>
                        {email.received}
                        {email.receivedHoursAgo >= 2 && isUnread && (
                          <span className="block text-[10px] text-red-600 mt-1 uppercase tracking-wide">⚠ SLA breach</span>
                        )}
                      </td>
                      {/* Status */}
                      <td className="premium-table-cell whitespace-nowrap">
                        <span className={`text-[13px] ${STATUS_STYLE[email.status].weight} ${STATUS_STYLE[email.status].color}`}>
                          {email.status}
                        </span>
                      </td>
                      {/* Assigned */}
                      <td className="premium-table-cell text-xs text-brand-text-2 whitespace-nowrap">
                        {email.assignedTo === "Unassigned"
                          ? <span className="text-red-600 font-bold inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Unassigned</span>
                          : <span className="font-medium">{email.assignedTo}</span>
                        }
                        {email.lastUpdatedBy && (
                          <div className="text-[10px] text-brand-text-3 mt-1 truncate max-w-[120px]">{email.lastUpdatedBy.split("·")[0].trim()}</div>
                        )}
                      </td>
                      {/* Quick actions */}
                      <td className="premium-table-cell" onClick={e => e.stopPropagation()}>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => setSelectedEmail(email)}
                            title="Reply"
                            className="p-1.5 rounded-md border border-brand-border bg-brand-ivory hover:border-brand-green-900 hover:bg-brand-green-50 transition-colors shadow-sm"
                          >
                            <Reply className="w-3.5 h-3.5 text-brand-green-900" />
                          </button>
                          <button
                            onClick={() => setSnoozedIds(s => { const n = new Set(s); n.add(email.id); return n; })}
                            title="Snooze"
                            className="p-1.5 rounded-md border border-brand-border bg-brand-ivory hover:border-brand-gold hover:bg-brand-gold-light transition-colors shadow-sm"
                          >
                            <Bell className="w-3.5 h-3.5 text-amber-600" />
                          </button>
                          <button
                            onClick={() => setSelectedEmail(email)}
                            title="Escalate"
                            className="p-1.5 rounded-md border border-brand-border bg-brand-ivory hover:border-red-600 hover:bg-red-50 transition-colors shadow-sm"
                          >
                            <ArrowUpCircle className="w-3.5 h-3.5 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Side Panel */}
      {selectedEmail && (
        <SidePanel email={selectedEmail} onClose={() => setSelectedEmail(null)} />
      )}
    </div>
  );
}
