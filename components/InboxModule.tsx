"use client";

import { useState } from "react";
import {
  type Role, EMAILS, type Email,
  type EmailPriority, type EmailCategory, type EmailStatus,
} from "@/lib/data";
import StatCard from "./StatCard";
import {
  Mail, Clock, AlertCircle, Timer,
  X, Reply, ArrowUpCircle, TrendingUp, AlertTriangle, Target,
  ChevronRight, User, Sparkles, MessageSquare, Bell, StickyNote,
  CheckCircle2, DollarSign, Zap,
} from "lucide-react";

const ROLE_MAP: Record<Role, string> = {
  MD: "", GM_SILVASSA: "silvassa", GM_DAHANU: "dahanu", GM_KUMBHALGARH: "kumbhalgarh",
};

const PRI_STYLE: Record<EmailPriority, { bg: string; color: string; label: string; dot: string }> = {
  Urgent: { bg: "#FEF2F2", color: "#991B1B", label: "Urgent",  dot: "#DC2626" },
  Normal: { bg: "#FFFBEB", color: "#92400E", label: "Normal",  dot: "#D97706" },
  FYI:    { bg: "#F3F4F6", color: "#6B7280", label: "FYI",     dot: "#9CA3AF" },
};

const CAT_STYLE: Record<EmailCategory, { bg: string; color: string }> = {
  "Booking Inquiry": { bg: "#EFF6FF", color: "#1D4ED8" },
  "Wedding Lead":    { bg: "#F5F3FF", color: "#7C3AED" },
  "Guest Complaint": { bg: "#FEF2F2", color: "#DC2626" },
  "Vendor":          { bg: "#F3F4F6", color: "#6B7280" },
  "Finance":         { bg: "#ECFDF5", color: "#065F46" },
  "General":         { bg: "#F8FAFC", color: "#475569" },
};

const STATUS_STYLE: Record<EmailStatus, { color: string; weight: number }> = {
  Unread:    { color: "#111827", weight: 700 },
  Read:      { color: "#6B7280", weight: 400 },
  Replied:   { color: "#059669", weight: 600 },
  Escalated: { color: "#DC2626", weight: 700 },
};

const AI_SENTIMENT_STYLE: Record<string, { bg: string; color: string; dot: string }> = {
  Positive: { bg: "#ECFDF5", color: "#065F46", dot: "#059669" },
  Neutral:  { bg: "#F3F4F6", color: "#6B7280", dot: "#9CA3AF" },
  Negative: { bg: "#FEF2F2", color: "#991B1B", dot: "#DC2626" },
  Critical: { bg: "#FEF2F2", color: "#7F1D1D", dot: "#DC2626" },
};

/* ── Inbox Business KPIs ─────────────────────────────── */
function InboxKPIs({
  leadsSaved, avgSLA, revenueAtRisk, escalationsPrevented,
}: {
  leadsSaved: number; avgSLA: number; revenueAtRisk: string; escalationsPrevented: number;
}) {
  const kpis = [
    { icon: DollarSign, label: "Leads Saved",         value: `${leadsSaved}`, sub: "wedding + booking leads", color: "#7C3AED", bg: "#F5F3FF" },
    { icon: Clock,      label: "Avg Response SLA",     value: `${avgSLA}h`,    sub: "target: under 2h",         color: avgSLA > 2 ? "#DC2626" : "#059669", bg: avgSLA > 2 ? "#FEF2F2" : "#ECFDF5" },
    { icon: AlertTriangle, label: "Revenue at Risk",   value: revenueAtRisk,   sub: "from unresolved complaints", color: "#DC2626", bg: "#FEF2F2" },
    { icon: Zap,        label: "Escalations Prevented", value: `${escalationsPrevented}`, sub: "this month via quick response", color: "#D97706", bg: "#FFFBEB" },
  ];

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
      background: "#FFFFFF", border: "1px solid var(--border)",
      borderRadius: "10px", overflow: "hidden",
    }} className="biz-kpi-grid">
      {kpis.map(({ icon: Icon, label, value, sub, color, bg }, i) => (
        <div key={label} style={{
          padding: "12px 16px",
          borderRight: i < kpis.length - 1 ? "1px solid var(--border)" : "none",
          display: "flex", alignItems: "center", gap: "12px",
        }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
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
        style={{
          position: "fixed", inset: 0, zIndex: 490,
          background: "rgba(15,42,32,0.3)",
          animation: "fadeIn 200ms ease both",
        }}
      />
      <aside
        className="anim-slide-right"
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 500,
          width: "min(480px, 100vw)",
          background: "#FFFFFF",
          display: "flex", flexDirection: "column",
          boxShadow: "-4px 0 32px rgba(0,0,0,0.12)",
          borderLeft: "1px solid var(--border)",
        }}
      >
        {/* Header */}
        <div style={{
          background: "linear-gradient(160deg, #1e5040 0%, #1B4332 100%)",
          padding: "18px 20px 14px", flexShrink: 0,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", gap: "5px", marginBottom: "8px", flexWrap: "wrap" }}>
                <span className="badge" style={{ background: PRI_STYLE[email.priority].bg, color: PRI_STYLE[email.priority].color }}>
                  {email.priority}
                </span>
                <span className="badge" style={{ background: CAT_STYLE[email.category].bg, color: CAT_STYLE[email.category].color }}>
                  {email.category}
                </span>
              </div>
              <h3 style={{ color: "#FFFFFF", fontWeight: 700, fontSize: "14px", lineHeight: 1.4 }}>{email.subject}</h3>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer",
                width: "30px", height: "30px", borderRadius: "7px",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
            >
              <X size={14} color="rgba(255,255,255,0.8)" />
            </button>
          </div>
          <div style={{ marginTop: "10px", fontSize: "12px", color: "rgba(255,255,255,0.55)" }}>
            <span style={{ color: "#C9A96E", fontWeight: 600 }}>{email.from}</span>
            {" · "}{email.property.replace("Treat ", "")} · {email.received}
          </div>
          {email.lastUpdatedBy && (
            <div style={{ marginTop: "4px", fontSize: "10.5px", color: "rgba(255,255,255,0.35)" }}>
              {email.lastUpdatedBy}
            </div>
          )}
        </div>

        {/* AI Insight bar */}
        <div style={{
          padding: "10px 20px",
          background: "#F8FAFC",
          borderBottom: "1px solid var(--border)",
          display: "flex", gap: "10px", alignItems: "flex-start",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0 }}>
            <Sparkles size={12} color="#7C3AED" />
            <span style={{ fontSize: "10.5px", fontWeight: 700, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.05em" }}>AI</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "12px", color: "var(--text-1)", margin: "0 0 4px", fontWeight: 500 }}>{email.aiNote}</p>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <span style={{ padding: "1px 6px", borderRadius: "3px", fontSize: "10.5px", fontWeight: 600, background: aiStyle.bg, color: aiStyle.color }}>
                <span style={{ display: "inline-block", width: "5px", height: "5px", borderRadius: "50%", background: aiStyle.dot, marginRight: "4px", verticalAlign: "middle" }} />
                {email.aiSentiment}
              </span>
              <span style={{ padding: "1px 6px", borderRadius: "3px", fontSize: "10.5px", fontWeight: 600, background: "#EFF6FF", color: "#1D4ED8" }}>
                {email.aiCategoryConf}% confidence · {email.category}
              </span>
              <span style={{ padding: "1px 6px", borderRadius: "3px", fontSize: "10.5px", fontWeight: 700, background: email.aiScore >= 70 ? "#F5F3FF" : "#F3F4F6", color: email.aiScore >= 70 ? "#7C3AED" : "#6B7280" }}>
                Score {email.aiScore}/100
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px" }}>
          <pre style={{
            fontFamily: "'Inter', sans-serif", fontSize: "13px",
            color: "var(--text-2)", lineHeight: 1.7,
            whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0,
          }}>
            {email.body}
          </pre>
        </div>

        {/* Internal note */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", background: "#FFFBEB" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "6px" }}>
            <StickyNote size={11} color="#D97706" />
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#92400E" }}>Internal Note</span>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <input
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Add a note for your team…"
              style={{
                flex: 1, padding: "6px 10px", border: "1px solid #FCD34D",
                borderRadius: "6px", fontSize: "12px", color: "var(--text-1)",
                background: "#FFFFFF", outline: "none", fontFamily: "'Inter', sans-serif",
              }}
              onFocus={e => (e.currentTarget.style.borderColor = "#C9A96E")}
              onBlur={e => (e.currentTarget.style.borderColor = "#FCD34D")}
            />
            <button
              onClick={saveNote}
              style={{
                padding: "6px 12px", background: noteSaved ? "#059669" : "#1B4332",
                color: "#FFFFFF", border: "none", borderRadius: "6px", cursor: "pointer",
                fontSize: "11.5px", fontWeight: 600, fontFamily: "'Inter', sans-serif",
                transition: "background 200ms ease",
              }}
            >
              {noteSaved ? "Saved!" : "Save"}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div style={{
          padding: "14px 20px", borderTop: "1px solid var(--border)",
          background: "#FAFAFA", flexShrink: 0,
          display: "flex", gap: "8px", flexWrap: "wrap",
        }}>
          <button style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "9px 18px", background: "#1B4332",
            color: "#C9A96E", border: "none", borderRadius: "8px",
            cursor: "pointer", fontWeight: 600, fontSize: "12.5px",
            fontFamily: "'Inter', sans-serif",
          }}>
            <Reply size={13} /> Reply
          </button>
          <button style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "9px 14px", background: "#FEF2F2",
            color: "#DC2626", border: "1px solid #FECACA", borderRadius: "8px",
            cursor: "pointer", fontWeight: 600, fontSize: "12.5px",
            fontFamily: "'Inter', sans-serif",
          }}>
            <ArrowUpCircle size={13} /> Escalate
          </button>
          <button style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "9px 14px", background: "#EFF6FF",
            color: "#1D4ED8", border: "1px solid #BFDBFE", borderRadius: "8px",
            cursor: "pointer", fontWeight: 600, fontSize: "12.5px",
            fontFamily: "'Inter', sans-serif",
          }}>
            <Bell size={13} /> Snooze
          </button>
          <select style={{
            flex: 1, minWidth: "120px", padding: "9px 10px",
            border: "1px solid var(--border)", borderRadius: "8px",
            fontSize: "12px", color: "var(--text-2)",
            fontFamily: "'Inter', sans-serif", background: "#FFFFFF",
            cursor: "pointer", outline: "none",
          }}>
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
interface InboxModuleProps { role: Role; }

export default function InboxModule({ role }: InboxModuleProps) {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [filterPri, setFilterPri] = useState<EmailPriority | "All">("All");
  const [filterCat, setFilterCat] = useState<EmailCategory | "All">("All");
  const [snoozedIds, setSnoozedIds] = useState<Set<number>>(new Set());

  const allScope = role === "MD" ? EMAILS : EMAILS.filter(e => e.propertyId === ROLE_MAP[role]);

  const visibleEmails = allScope
    .filter(e => !snoozedIds.has(e.id))
    .filter(e => filterPri === "All" || e.priority === filterPri)
    .filter(e => filterCat === "All" || e.category === filterCat);

  const unread      = allScope.filter(e => e.status === "Unread").length;
  const highPriUr   = allScope.filter(e => e.status === "Unread" && e.priority === "Urgent").length;
  const pending2h   = allScope.filter(e => e.status === "Unread" && e.receivedHoursAgo >= 2);
  const avgResp     = 3.2;
  const leadEmails  = allScope.filter(e => e.category === "Wedding Lead" || e.category === "Booking Inquiry");
  const urgentRevenue = "₹8,000";

  return (
    <div className="module-stack inbox-module" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

      {/* Business KPIs */}
      <div className="anim-fade-up" style={{ animationDelay: "0ms" }}>
        <InboxKPIs
          leadsSaved={leadEmails.filter(e => e.status === "Replied" || e.status === "Read").length}
          avgSLA={avgResp}
          revenueAtRisk={urgentRevenue}
          escalationsPrevented={7}
        />
      </div>

      {/* Operational Stats */}
      <div className="stat-cards-panel" style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        background: "#FFFFFF", borderRadius: "10px",
        border: "1px solid var(--border)", overflow: "hidden",
      }}>
        <StatCard
          title="Total Emails Today"
          value={allScope.length}
          subtitle="Across all properties"
          icon={Mail}
          accent="gold"
          trend={{ label: "+2 from yesterday", direction: "up", positive: true }}
          delay={0}
        />
        <StatCard
          title="Unread / Pending"
          value={unread}
          subtitle={`${allScope.length - unread} already handled`}
          icon={Clock}
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
        <div style={{
          background: "#FFFBEB", border: "1px solid #FCD34D",
          borderRadius: "8px", padding: "12px 16px",
          display: "flex", alignItems: "flex-start", gap: "10px",
        }}>
          <AlertTriangle size={16} color="#D97706" style={{ flexShrink: 0, marginTop: "1px" }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: "13px", color: "#92400E", margin: "0 0 2px" }}>
              {pending2h.length} email{pending2h.length > 1 ? "s" : ""} pending over 2 hours
            </p>
            <p style={{ fontSize: "12px", color: "#A16207", margin: 0 }}>
              {pending2h.slice(0, 3).map(e => e.property.replace("Treat ", "")).join(" · ")}
              {pending2h.length > 3 && ` · +${pending2h.length - 3} more`}
            </p>
          </div>
          <ChevronRight size={14} color="#D97706" style={{ flexShrink: 0, marginTop: "2px" }} />
        </div>
      )}

      {/* Filter Bar */}
      <div className="glass-card anim-fade-up" style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-3)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Filter</span>
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {(["All", "Urgent", "Normal", "FYI"] as const).map(p => (
              <button key={p} onClick={() => setFilterPri(p)} style={{
                padding: "4px 10px", borderRadius: "5px", border: "1px solid",
                fontSize: "11.5px", fontWeight: filterPri === p ? 600 : 400, cursor: "pointer",
                background: filterPri === p
                  ? (p === "Urgent" ? "#FEF2F2" : p === "Normal" ? "#FFFBEB" : p === "FYI" ? "#F3F4F6" : "#1B4332")
                  : "transparent",
                color: filterPri === p
                  ? (p === "Urgent" ? "#991B1B" : p === "Normal" ? "#92400E" : p === "FYI" ? "#6B7280" : "#C9A96E")
                  : "var(--text-3)",
                borderColor: filterPri === p
                  ? (p === "Urgent" ? "#FECACA" : p === "Normal" ? "#FDE68A" : p === "FYI" ? "#E5E7EB" : "#1B4332")
                  : "var(--border)",
                transition: "all 120ms ease",
                fontFamily: "'Inter', sans-serif",
              }}>{p}</button>
            ))}
          </div>
          <div style={{ width: "1px", height: "18px", background: "var(--border)" }} />
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {(["All", "Booking Inquiry", "Wedding Lead", "Guest Complaint", "Vendor", "Finance"] as const).map(c => (
              <button key={c} onClick={() => setFilterCat(c)} style={{
                padding: "4px 10px", borderRadius: "5px", border: "1px solid",
                fontSize: "11.5px", fontWeight: filterCat === c ? 600 : 400, cursor: "pointer",
                background: filterCat === c ? (c === "All" ? "#1B4332" : CAT_STYLE[c as EmailCategory]?.bg ?? "#F3F4F6") : "transparent",
                color: filterCat === c ? (c === "All" ? "#C9A96E" : CAT_STYLE[c as EmailCategory]?.color ?? "#6B7280") : "var(--text-3)",
                borderColor: filterCat === c ? (c === "All" ? "#1B4332" : CAT_STYLE[c as EmailCategory]?.color ?? "#9CA3AF") + "44" : "var(--border)",
                transition: "all 120ms ease",
                fontFamily: "'Inter', sans-serif",
              }}>{c}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Email Table */}
      <div className="glass-card anim-fade-up" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "12px 18px 10px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-1)" }}>Email Inbox</h2>
            <p style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "1px" }}>Click any row to read & respond</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {snoozedIds.size > 0 && (
              <button
                onClick={() => setSnoozedIds(new Set())}
                style={{ fontSize: "11px", color: "#D97706", background: "#FFFBEB", border: "1px solid #FCD34D", padding: "3px 9px", borderRadius: "5px", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
              >
                {snoozedIds.size} snoozed — show all
              </button>
            )}
            <span style={{ background: "#F5EDD9", color: "#92400E", padding: "3px 9px", borderRadius: "5px", fontSize: "11.5px", fontWeight: 600 }}>
              {visibleEmails.length} emails
            </span>
          </div>
        </div>

        {visibleEmails.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <CheckCircle2 size={28} color="#059669" style={{ margin: "0 auto 10px" }} />
            <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-1)", margin: "0 0 4px" }}>Inbox clear</p>
            <p style={{ fontSize: "12px", color: "var(--text-3)", margin: 0 }}>No emails match this filter. Try "All" to see everything.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
              <thead>
                <tr style={{ background: "var(--surface-2)" }}>
                  {["Priority", "AI", "Property", "Category", "From", "Subject", "Received", "Status", "Assigned", "Actions"].map(h => (
                    <th key={h} style={{
                      padding: "8px 12px", textAlign: "left", fontSize: "10px",
                      fontWeight: 600, color: "var(--text-3)", letterSpacing: "0.06em",
                      textTransform: "uppercase", borderBottom: "1px solid var(--border)",
                      whiteSpace: "nowrap",
                    }}>{h}</th>
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
                      className={`trow clickable${isSelected ? " active" : ""}`}
                      onClick={() => setSelectedEmail(isSelected ? null : email)}
                      style={{ background: isSelected ? "#FEF9F0" : i % 2 === 0 ? "#FFFFFF" : "var(--surface-2)" }}
                    >
                      {/* Priority */}
                      <td style={{ padding: "9px 12px", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>
                        <span className="badge" style={{ background: PRI_STYLE[email.priority].bg, color: PRI_STYLE[email.priority].color }}>
                          <span className="pulse-dot" style={{ background: PRI_STYLE[email.priority].dot, animationPlayState: email.priority === "Urgent" && isUnread ? "running" : "paused" }} />
                          {email.priority}
                        </span>
                      </td>
                      {/* AI Score + Sentiment */}
                      <td style={{ padding: "9px 12px", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: "3px",
                            fontSize: "10.5px", fontWeight: 700,
                            color: email.aiScore >= 70 ? "#7C3AED" : email.aiScore >= 40 ? "#D97706" : "#6B7280",
                          }}>
                            <Sparkles size={9} color="currentColor" />
                            {email.aiScore}
                          </span>
                          <span style={{ padding: "1px 5px", borderRadius: "3px", fontSize: "9.5px", fontWeight: 600, background: aiStyle.bg, color: aiStyle.color, width: "fit-content" }}>
                            {email.aiSentiment}
                          </span>
                        </div>
                      </td>
                      {/* Property */}
                      <td style={{ padding: "9px 12px", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap", maxWidth: "130px" }}>
                        <span style={{ fontSize: "12px", color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", display: "block" }} title={email.property}>
                          {email.property.replace("Treat ", "")}
                        </span>
                      </td>
                      {/* Category */}
                      <td style={{ padding: "9px 12px", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>
                        <span className="badge" style={{ background: CAT_STYLE[email.category].bg, color: CAT_STYLE[email.category].color }}>
                          {email.category}
                        </span>
                      </td>
                      {/* From */}
                      <td style={{ padding: "9px 12px", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>
                        <div style={{ fontWeight: isUnread ? 700 : 500, color: "var(--text-1)", fontSize: "12px" }}>{email.from}</div>
                        <div style={{ fontSize: "10.5px", color: "var(--text-3)" }}>{email.fromEmail}</div>
                      </td>
                      {/* Subject */}
                      <td style={{ padding: "9px 12px", borderBottom: "1px solid var(--border)", maxWidth: "240px" }}>
                        <span style={{
                          fontWeight: isUnread ? 700 : 400, color: isUnread ? "var(--text-1)" : "var(--text-2)",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          display: "block", fontSize: "12.5px",
                        }} title={email.subject}>
                          {isUnread && (
                            <span style={{ display: "inline-block", width: "5px", height: "5px", borderRadius: "50%", background: "#1B4332", marginRight: "6px", verticalAlign: "middle" }} />
                          )}
                          {email.subject.length > 52 ? email.subject.substring(0, 52) + "…" : email.subject}
                        </span>
                        {/* AI note snippet */}
                        <span style={{ fontSize: "10.5px", color: "#7C3AED", display: "block", marginTop: "1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          ✦ {email.aiNote}
                        </span>
                      </td>
                      {/* Received */}
                      <td style={{
                        padding: "9px 12px", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap",
                        fontSize: "11.5px",
                        color: email.receivedHoursAgo >= 2 && isUnread ? "#DC2626" : "var(--text-3)",
                        fontWeight: email.receivedHoursAgo >= 2 && isUnread ? 600 : 400,
                      }}>
                        {email.received}
                        {email.receivedHoursAgo >= 2 && isUnread && (
                          <span style={{ display: "block", fontSize: "10px", color: "#DC2626" }}>⚠ SLA breach</span>
                        )}
                      </td>
                      {/* Status */}
                      <td style={{ padding: "9px 12px", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>
                        <span style={{ fontWeight: STATUS_STYLE[email.status].weight, color: STATUS_STYLE[email.status].color, fontSize: "12px" }}>
                          {email.status}
                        </span>
                      </td>
                      {/* Assigned */}
                      <td style={{ padding: "9px 12px", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap", fontSize: "11.5px", color: "var(--text-2)" }}>
                        {email.assignedTo === "Unassigned"
                          ? <span style={{ color: "#DC2626", fontWeight: 600, fontSize: "11px" }}>⚠ Unassigned</span>
                          : email.assignedTo
                        }
                        {email.lastUpdatedBy && (
                          <div style={{ fontSize: "9.5px", color: "var(--text-3)", marginTop: "1px" }}>{email.lastUpdatedBy.split("·")[0].trim()}</div>
                        )}
                      </td>
                      {/* Quick actions */}
                      <td style={{ padding: "9px 12px", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button
                            onClick={() => setSelectedEmail(email)}
                            title="Reply"
                            style={{ padding: "4px 7px", borderRadius: "5px", border: "1px solid var(--border)", background: "#FFFFFF", cursor: "pointer", display: "flex", alignItems: "center" }}
                            onMouseEnter={e => (e.currentTarget.style.borderColor = "#1B4332")}
                            onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
                          >
                            <Reply size={11} color="#1B4332" />
                          </button>
                          <button
                            onClick={() => setSnoozedIds(s => { const n = new Set(s); n.add(email.id); return n; })}
                            title="Snooze"
                            style={{ padding: "4px 7px", borderRadius: "5px", border: "1px solid var(--border)", background: "#FFFFFF", cursor: "pointer", display: "flex", alignItems: "center" }}
                            onMouseEnter={e => (e.currentTarget.style.borderColor = "#D97706")}
                            onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
                          >
                            <Bell size={11} color="#D97706" />
                          </button>
                          <button
                            onClick={() => setSelectedEmail(email)}
                            title="Escalate"
                            style={{ padding: "4px 7px", borderRadius: "5px", border: "1px solid var(--border)", background: "#FFFFFF", cursor: "pointer", display: "flex", alignItems: "center" }}
                            onMouseEnter={e => (e.currentTarget.style.borderColor = "#DC2626")}
                            onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
                          >
                            <ArrowUpCircle size={11} color="#DC2626" />
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

      <style>{`
        @media (max-width: 700px) {
          .biz-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
