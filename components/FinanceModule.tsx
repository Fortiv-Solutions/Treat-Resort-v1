"use client";

import { useState, useMemo, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
  BarChart, Bar, LabelList,
} from "recharts";
import {
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Building2, ChevronDown, ChevronUp, ChevronRight, ChevronLeft,
  AlertTriangle, CheckCircle2, Clock, XCircle,
  Mail, FileText, Zap, Calendar, CreditCard,
  Download, MoreHorizontal, Search, SlidersHorizontal,
} from "lucide-react";
import {
  FINANCE_PROPERTIES, FINANCE_KPIS, REVENUE_MIX, CHART_DATA,
  OUTSTANDING_CLIENTS, PAYABLES, EXPENSE_DATA, OTA_DATA,
  SALES_EMAILS, UNIT_TYPES, ENTITY_LABELS,
  type DateRange, type EntityFilter, type FinanceProperty,
} from "@/lib/financeData";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtINR(val: number): string {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000)   return `₹${(val / 100000).toFixed(2)} L`;
  if (val >= 1000)     return `₹${(val / 1000).toFixed(1)}K`;
  return `₹${val}`;
}
function fmtINRFull(val: number): string {
  return "₹" + new Intl.NumberFormat("en-IN").format(val);
}
function fmtK(val: number): string {
  if (val >= 1000000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000)    return `₹${(val / 1000).toFixed(0)}K`;
  return `₹${val}`;
}
function pct(val: number): string {
  return (val >= 0 ? "+" : "") + val + "%";
}
function getDynTimestamp(): string {
  return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

// ── Constants ─────────────────────────────────────────────────────────────────

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_SHORT   = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const TODAY_DEMO  = new Date(2026, 4, 25); // May 25, 2026

const ENTITY_DATA = [
  { id: "mundra",   name: "Mundra Hotels",    fullName: "Mundra Hotels & Resorts", props: 6, revenue: 1004000, trend: 7,  color: "#C9A96E" },
  { id: "ras",      name: "RAS Resorts",       fullName: "RAS Resorts",             props: 4, revenue: 864000,  trend: 9,  color: "#2d6a4f" },
  { id: "tirupati", name: "Tirupati Shelters", fullName: "Tirupati Shelters",       props: 2, revenue: 216000,  trend: -8, color: "#6B7280" },
];

const RECENT_ACTIVITIES = [
  { id: "REV-001", property: "Treat Imperial Jim Corbett", type: "Room Revenue",   amount: 312000,  status: "collected", time: "Today 8:01 AM"   },
  { id: "REV-002", property: "Treat Imperial Udaipur",     type: "Room Revenue",   amount: 276000,  status: "collected", time: "Today 8:01 AM"   },
  { id: "REV-003", property: "Treat Resort Surat",         type: "Room Revenue",   amount: 224000,  status: "collected", time: "Today 8:01 AM"   },
  { id: "REV-004", property: "Treat Resort Silvassa",      type: "Room Revenue",   amount: 185000,  status: "collected", time: "Today 8:01 AM"   },
  { id: "INV-001", property: "Raj Enterprises",            type: "Invoice Due",    amount: 1250000, status: "overdue",   time: "Due 10 Apr 2026" },
  { id: "OTA-001", property: "MakeMyTrip Commission",      type: "OTA Payout",     amount: 277500,  status: "pending",   time: "Processing"      },
];

// ── Chart tooltip ─────────────────────────────────────────────────────────────

function TrendTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(15,42,32,0.97)", border: "1px solid rgba(201,169,110,0.3)",
      borderRadius: "10px", padding: "10px 14px", boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
    }}>
      <p style={{ color: "#C9A96E", fontWeight: 700, fontSize: "11px", marginBottom: "8px", letterSpacing: "0.06em" }}>{label}</p>
      {payload.map(p => (
        <div key={p.name} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: p.color, display: "inline-block" }} />
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px" }}>{p.name}:</span>
          <span style={{ color: "#fff", fontWeight: 600, fontSize: "11px" }}>{fmtINR(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <h2 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-1)", margin: 0 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: "11.5px", color: "var(--text-3)", margin: "2px 0 0" }}>{subtitle}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: FinanceProperty["status"] }) {
  const c = {
    "on-track": { label: "On Track",  bg: "#ECFDF5", color: "#065F46", dot: "#059669" },
    "watch":    { label: "Watch",     bg: "#FFFBEB", color: "#92400E", dot: "#D97706" },
    "attention":{ label: "Attention", bg: "#FEF2F2", color: "#991B1B", dot: "#DC2626" },
  }[status];
  return (
    <span className="badge" style={{ background: c.bg, color: c.color }}>
      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: c.dot, display: "inline-block" }} />
      {c.label}
    </span>
  );
}

function OutBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
    current:    { label: "Current",   bg: "#ECFDF5", color: "#065F46", icon: <CheckCircle2 size={11} /> },
    "due-soon": { label: "Due Soon",  bg: "#FFFBEB", color: "#92400E", icon: <Clock size={11} /> },
    overdue:    { label: "Overdue",   bg: "#FEF2F2", color: "#991B1B", icon: <AlertTriangle size={11} /> },
    critical:   { label: "Critical",  bg: "#450A0A", color: "#FCA5A5", icon: <XCircle size={11} /> },
  };
  const c = cfg[status] ?? cfg.current;
  return <span className="badge" style={{ background: c.bg, color: c.color, gap: "4px" }}>{c.icon}{c.label}</span>;
}

function ActivityBadge({ status }: { status: string }) {
  if (status === "collected") return <span className="badge" style={{ background: "#ECFDF5", color: "#065F46", gap: "4px" }}><span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#059669", display: "inline-block" }} /> Collected</span>;
  if (status === "pending")   return <span className="badge" style={{ background: "#FFFBEB", color: "#92400E", gap: "4px" }}><span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#D97706", display: "inline-block" }} /> Pending</span>;
  return <span className="badge" style={{ background: "#FEF2F2", color: "#991B1B", gap: "4px" }}><span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#DC2626", display: "inline-block" }} /> Overdue</span>;
}

// ── ① Greeting Banner ─────────────────────────────────────────────────────────

function GreetingBanner({ role, selectedDate, totalRev, avgOcc }: {
  role: string; selectedDate: Date; totalRev: number; avgOcc: number;
}) {
  const [liveTime, setLiveTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setLiveTime(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const hour     = liveTime.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const name     = role === "MD" ? "Aditya" : role.replace("GM_", "").charAt(0) + role.replace("GM_", "").slice(1).toLowerCase();
  const timeStr  = liveTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  const dateStr  = selectedDate.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div style={{
      background: "linear-gradient(135deg, #0f2a20 0%, #1B4332 50%, #2d6a4f 100%)",
      borderRadius: "16px", padding: "24px 28px",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      position: "relative", overflow: "hidden",
    }}>
      {/* Decorative blobs */}
      <div style={{ position: "absolute", top: "-40px", right: "320px", width: "160px", height: "160px", borderRadius: "50%", background: "rgba(201,169,110,0.07)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-50px", right: "120px", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(201,169,110,0.05)", pointerEvents: "none" }} />

      <div>
        <p style={{ margin: "0 0 4px", fontSize: "12px", color: "rgba(201,169,110,0.65)", fontWeight: 500, letterSpacing: "0.04em" }}>{dateStr}</p>
        <h1 style={{ margin: "0 0 6px", fontSize: "26px", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>
          {greeting}, {name} 👋
        </h1>
        <p style={{ margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>
          Finance Intelligence · All 12 properties · Tally ERP synced 8:01 AM
        </p>
      </div>

      {/* Right stat strip */}
      <div style={{ display: "flex", gap: "10px", alignItems: "stretch", flexShrink: 0 }}>
        {[
          { label: "Today's Revenue", val: fmtINR(totalRev), sub: `+${FINANCE_KPIS.vsYesterday}% vs yesterday`, subColor: "#6EE7B7" },
          { label: "Occupancy",       val: `${avgOcc}%`,     sub: `+${FINANCE_KPIS.occVsYesterday}% vs yesterday`, subColor: "#6EE7B7" },
          { label: "Properties Live", val: "12 / 12",        sub: "All synced · 3 entities", subColor: "rgba(255,255,255,0.4)" },
        ].map(({ label, val, sub, subColor }) => (
          <div key={label} style={{ padding: "12px 18px", background: "rgba(255,255,255,0.07)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", textAlign: "center", minWidth: "120px" }}>
            <div style={{ fontSize: "9.5px", color: "rgba(201,169,110,0.65)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "5px" }}>{label}</div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#C9A96E", letterSpacing: "-0.02em", lineHeight: 1 }}>{val}</div>
            <div style={{ fontSize: "10px", color: subColor, marginTop: "4px", fontWeight: 500 }}>{sub}</div>
          </div>
        ))}
        {/* Live clock */}
        <div style={{ padding: "12px 18px", background: "rgba(201,169,110,0.12)", borderRadius: "12px", border: "1px solid rgba(201,169,110,0.2)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#C9A96E", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>{timeStr}</div>
          <div style={{ fontSize: "9.5px", color: "rgba(201,169,110,0.6)", marginTop: "3px", fontWeight: 600, letterSpacing: "0.06em" }}>IST · LIVE</div>
        </div>
      </div>
    </div>
  );
}

// ── ② Hero Revenue Card ────────────────────────────────────────────────────────

function HeroRevenueCard({ totalRev, propertyFilter, setPropertyFilter, entityFilter, setEntityFilter }: {
  totalRev: number;
  propertyFilter: string; setPropertyFilter: (p: string) => void;
  entityFilter: EntityFilter; setEntityFilter: (e: EntityFilter) => void;
}) {
  const [showProp, setShowProp]     = useState(false);
  const [showEntity, setShowEntity] = useState(false);

  const propName = propertyFilter === "all"
    ? "All Properties"
    : FINANCE_PROPERTIES.find(p => p.id === propertyFilter)?.name?.replace("Treat ", "") ?? "Select";

  function Dropdown({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
    if (!open) return null;
    return (
      <>
        <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={onClose} />
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 50,
          background: "#132b22", border: "1px solid rgba(201,169,110,0.25)",
          borderRadius: "10px", overflow: "hidden", boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
          maxHeight: "220px", overflowY: "auto",
        }}>
          {children}
        </div>
      </>
    );
  }

  function DropItem({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
      <button onClick={onClick} style={{
        width: "100%", padding: "8px 12px", border: "none", textAlign: "left", cursor: "pointer",
        fontFamily: "inherit", fontSize: "11.5px", transition: "background 100ms",
        background: active ? "rgba(201,169,110,0.15)" : "transparent",
        color: active ? "#C9A96E" : "rgba(255,255,255,0.8)",
        borderLeft: active ? "2px solid #C9A96E" : "2px solid transparent",
      }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
      >
        {label}
      </button>
    );
  }

  return (
    <div style={{
      background: "linear-gradient(145deg, #1B4332 0%, #122d22 100%)",
      borderRadius: "16px", padding: "22px",
      position: "relative", overflow: "visible",
    }}>
      {/* Decorative */}
      <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "120px", height: "120px", borderRadius: "50%", background: "rgba(201,169,110,0.08)", pointerEvents: "none" }} />

      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
        <div>
          <div style={{ fontSize: "10px", color: "rgba(201,169,110,0.65)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>Total Revenue</div>
          <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>Today's collection</div>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <button style={{ display: "flex", alignItems: "center", gap: "4px", padding: "5px 10px", borderRadius: "7px", border: "1px solid rgba(201,169,110,0.3)", background: "rgba(201,169,110,0.1)", cursor: "pointer", fontSize: "10.5px", fontWeight: 600, color: "#C9A96E", fontFamily: "inherit" }}>
            <Download size={10} /> Export
          </button>
          <button style={{ width: "28px", height: "28px", borderRadius: "7px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MoreHorizontal size={13} color="rgba(255,255,255,0.5)" />
          </button>
        </div>
      </div>

      {/* Revenue figure */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "34px", fontWeight: 900, color: "#C9A96E", letterSpacing: "-0.03em", lineHeight: 1 }}>
          {fmtINRFull(totalRev)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "7px" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "12px", fontWeight: 700, color: "#6EE7B7" }}>
            <ArrowUpRight size={13} /> +{FINANCE_KPIS.vsYesterday}% vs yesterday
          </span>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>·</span>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>+{FINANCE_KPIS.vsLastWeek}% vs last week</span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginBottom: "14px" }} />

      {/* Dropdowns */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {/* Property dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => { setShowProp(!showProp); setShowEntity(false); }}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", cursor: "pointer", fontFamily: "inherit" }}
          >
            <Building2 size={12} color="rgba(201,169,110,0.7)" style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, textAlign: "left", fontSize: "11.5px", color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{propName}</span>
            <ChevronDown size={11} color="rgba(255,255,255,0.4)" style={{ flexShrink: 0, transform: showProp ? "rotate(180deg)" : "none", transition: "transform 150ms" }} />
          </button>
          <Dropdown open={showProp} onClose={() => setShowProp(false)}>
            <DropItem label="All Properties" active={propertyFilter === "all"} onClick={() => { setPropertyFilter("all"); setShowProp(false); }} />
            {FINANCE_PROPERTIES.map(p => (
              <DropItem key={p.id} label={p.name.replace("Treat ", "")} active={propertyFilter === p.id} onClick={() => { setPropertyFilter(p.id); setShowProp(false); }} />
            ))}
          </Dropdown>
        </div>

        {/* Entity dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => { setShowEntity(!showEntity); setShowProp(false); }}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", cursor: "pointer", fontFamily: "inherit" }}
          >
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#C9A96E", flexShrink: 0, display: "inline-block" }} />
            <span style={{ flex: 1, textAlign: "left", fontSize: "11.5px", color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {entityFilter === "all" ? "All Legal Entities" : ENTITY_LABELS[entityFilter]}
            </span>
            <ChevronDown size={11} color="rgba(255,255,255,0.4)" style={{ flexShrink: 0, transform: showEntity ? "rotate(180deg)" : "none", transition: "transform 150ms" }} />
          </button>
          <Dropdown open={showEntity} onClose={() => setShowEntity(false)}>
            {(["all", "mundra", "tirupati", "ras"] as const).map(e => (
              <DropItem key={e} label={ENTITY_LABELS[e]} active={e === entityFilter} onClick={() => { setEntityFilter(e); setShowEntity(false); }} />
            ))}
          </Dropdown>
        </div>
      </div>
    </div>
  );
}

// ── ③ Entity Breakdown (wallet style) ─────────────────────────────────────────

function EntityBreakdownCards() {
  return (
    <div className="glass-card" style={{ padding: "16px 18px" }}>
      <div style={{ fontSize: "10.5px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "12px" }}>
        Legal Entity Breakdown
      </div>
      {ENTITY_DATA.map((e, i) => (
        <div key={e.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: i < ENTITY_DATA.length - 1 ? "1px solid var(--border)" : "none" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: `${e.color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Building2 size={16} color={e.color} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--text-1)", lineHeight: 1.2 }}>{e.name}</div>
            <div style={{ fontSize: "10.5px", color: "var(--text-3)", marginTop: "1px" }}>{e.props} properties · Active</div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-1)" }}>{fmtINR(e.revenue)}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "2px", marginTop: "2px" }}>
              <span style={{ fontSize: "10.5px", fontWeight: 700, color: e.trend >= 0 ? "#059669" : "#DC2626", display: "flex", alignItems: "center", gap: "2px" }}>
                {e.trend >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                {pct(e.trend)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── ④ Mini Stat Cards (2×2 grid) ──────────────────────────────────────────────

function MiniStatCard({ label, value, sub, delta, deltaLabel, featured }: {
  label: string; value: string; sub?: string;
  delta: number; deltaLabel: string; featured?: boolean;
}) {
  return (
    <div style={{
      padding: "16px 18px", borderRadius: "13px",
      background: featured ? "linear-gradient(145deg, #1B4332, #2a5c45)" : "#fff",
      border: featured ? "none" : "1px solid var(--border)",
      boxShadow: featured ? "0 8px 24px rgba(27,67,50,0.3)" : "0 1px 3px rgba(0,0,0,0.05)",
      transition: "transform 150ms, box-shadow 150ms",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = featured ? "0 14px 32px rgba(27,67,50,0.4)" : "0 6px 16px rgba(0,0,0,0.1)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = featured ? "0 8px 24px rgba(27,67,50,0.3)" : "0 1px 3px rgba(0,0,0,0.05)"; }}
    >
      <div style={{ fontSize: "10px", fontWeight: 700, color: featured ? "rgba(201,169,110,0.65)" : "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px" }}>{label}</div>
      <div style={{ fontSize: "24px", fontWeight: 900, color: featured ? "#C9A96E" : "var(--text-1)", letterSpacing: "-0.02em", lineHeight: 1, marginBottom: "3px" }}>{value}</div>
      {sub && <div style={{ fontSize: "10.5px", color: featured ? "rgba(255,255,255,0.35)" : "var(--text-3)", marginBottom: "8px" }}>{sub}</div>}
      <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "8px" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "2px", fontSize: "11px", fontWeight: 700, color: delta >= 0 ? (featured ? "#6EE7B7" : "#059669") : (featured ? "#FCA5A5" : "#DC2626") }}>
          {delta >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {pct(delta)}
        </span>
        <span style={{ fontSize: "10.5px", color: featured ? "rgba(255,255,255,0.35)" : "var(--text-3)" }}>{deltaLabel}</span>
      </div>
    </div>
  );
}

// ── ⑤ Calendar Card ───────────────────────────────────────────────────────────

function CalendarCard({ selectedDate, onSelect }: { selectedDate: Date; onSelect: (d: Date) => void }) {
  const [viewYear, setViewYear]   = useState(TODAY_DEMO.getFullYear());
  const [viewMonth, setViewMonth] = useState(TODAY_DEMO.getMonth());

  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrev  = new Date(viewYear, viewMonth, 0).getDate();

  const cells: { day: number; inMonth: boolean; date: Date }[] = [];
  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ day: daysInPrev - i, inMonth: false, date: new Date(viewYear, viewMonth - 1, daysInPrev - i) });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: d, inMonth: true, date: new Date(viewYear, viewMonth, d) });
  let fill = 1;
  while (cells.length < 42)
    cells.push({ day: fill++, inMonth: false, date: new Date(viewYear, viewMonth + 1, fill - 1) });

  function sameDay(a: Date, b: Date) {
    return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  }
  function prev() { viewMonth === 0 ? (setViewMonth(11), setViewYear(y => y - 1)) : setViewMonth(m => m - 1); }
  function next() { viewMonth === 11 ? (setViewMonth(0), setViewYear(y => y + 1)) : setViewMonth(m => m + 1); }

  return (
    <div className="glass-card" style={{ padding: "16px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Calendar size={13} color="#C9A96E" />
          <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-1)" }}>Finance Calendar</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <button onClick={prev} style={{ width: "24px", height: "24px", borderRadius: "6px", border: "1.5px solid var(--border)", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ChevronLeft size={11} color="var(--text-2)" />
          </button>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-1)", minWidth: "88px", textAlign: "center" }}>
            {MONTH_NAMES[viewMonth].slice(0, 3)} {viewYear}
          </span>
          <button onClick={next} style={{ width: "24px", height: "24px", borderRadius: "6px", border: "1.5px solid var(--border)", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ChevronRight size={11} color="var(--text-2)" />
          </button>
        </div>
      </div>

      {/* Day names */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: "6px" }}>
        {DAY_SHORT.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: "9px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.04em", padding: "2px 0" }}>{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
        {cells.map((cell, i) => {
          const isSel    = sameDay(cell.date, selectedDate);
          const isToday  = sameDay(cell.date, TODAY_DEMO);
          const isFuture = cell.date > TODAY_DEMO;
          const clickable = cell.inMonth && !isFuture;
          return (
            <button key={i} onClick={() => clickable && onSelect(cell.date)} style={{
              textAlign: "center", fontSize: "11.5px", padding: "5px 0", borderRadius: "7px",
              border: isSel ? "none" : isToday ? "1.5px solid #C9A96E" : "none",
              cursor: clickable ? "pointer" : "default",
              background: isSel ? "#1B4332" : "transparent",
              color: isSel ? "#C9A96E" : !cell.inMonth || isFuture ? "var(--text-3)" : isToday ? "#C9A96E" : "var(--text-1)",
              fontWeight: isSel || isToday ? 700 : 400,
              opacity: !cell.inMonth || isFuture ? 0.35 : 1,
              transition: "background 100ms",
            }}
              onMouseEnter={e => { if (clickable && !isSel) e.currentTarget.style.background = "rgba(201,169,110,0.1)"; }}
              onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = "transparent"; }}
            >
              {cell.day}
            </button>
          );
        })}
      </div>

      {/* Selected date chip */}
      <div style={{ marginTop: "12px", padding: "9px 12px", borderRadius: "9px", background: "rgba(27,67,50,0.06)", border: "1px solid rgba(201,169,110,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <Calendar size={11} color="#C9A96E" />
          <span style={{ fontSize: "10.5px", color: "var(--text-3)" }}>Viewing data for</span>
        </div>
        <span style={{ fontSize: "12px", fontWeight: 800, color: "#1B4332" }}>
          {selectedDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
        </span>
      </div>
    </div>
  );
}

// ── ⑥ Budget Progress Card ────────────────────────────────────────────────────

function BudgetProgressCard() {
  const collected   = 52684000;
  const totalBudget = 58500000;
  const pctDone     = Math.round((collected / totalBudget) * 100);

  return (
    <div className="glass-card" style={{ padding: "16px 18px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <div>
          <div style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--text-1)" }}>Monthly Budget</div>
          <div style={{ fontSize: "10.5px", color: "var(--text-3)", marginTop: "1px" }}>May 2026 · 25 of 30 days</div>
        </div>
        <span className="badge" style={{ background: "#ECFDF5", color: "#065F46" }}>
          <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#059669", display: "inline-block" }} /> On Track
        </span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "7px" }}>
        <span style={{ fontSize: "20px", fontWeight: 900, color: "var(--text-1)", letterSpacing: "-0.02em" }}>{fmtINR(collected)}</span>
        <span style={{ fontSize: "12px", color: "var(--text-3)", alignSelf: "flex-end", marginBottom: "3px" }}>of {fmtINR(totalBudget)}</span>
      </div>

      <div style={{ height: "8px", borderRadius: "4px", background: "#E9ECEF", overflow: "hidden", marginBottom: "7px" }}>
        <div style={{ height: "100%", width: `${pctDone}%`, borderRadius: "4px", background: "linear-gradient(90deg, #1B4332 0%, #C9A96E 100%)", transition: "width 1s ease" }} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, color: "#059669" }}>{pctDone}% collected</span>
        <span style={{ fontSize: "11px", color: "var(--text-3)" }}>{fmtINR(totalBudget - collected)} remaining</span>
      </div>
    </div>
  );
}

// ── ⑦ Recent Activity Table ───────────────────────────────────────────────────

function RecentActivityTable() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilterDrop, setShowFilterDrop] = useState(false);

  const filtered = RECENT_ACTIVITIES.filter(a => {
    const matchSearch = search === "" || a.property.toLowerCase().includes(search.toLowerCase()) || a.type.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="glass-card" style={{ overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
        <div>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-1)" }}>Recent Activities</div>
          <div style={{ fontSize: "10.5px", color: "var(--text-3)", marginTop: "1px" }}>Today's collections & alerts</div>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--surface-2)", border: "1.5px solid var(--border)", borderRadius: "8px", padding: "5px 10px" }}>
            <Search size={12} color="var(--text-3)" />
            <input
              placeholder="Search…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ border: "none", background: "transparent", outline: "none", fontSize: "11.5px", color: "var(--text-1)", width: "90px", fontFamily: "inherit" }}
            />
          </div>
          {/* Filter dropdown */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowFilterDrop(!showFilterDrop)}
              style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 10px", borderRadius: "8px", border: "1.5px solid var(--border)", background: "#fff", cursor: "pointer", fontSize: "11.5px", fontWeight: 500, color: "var(--text-2)", fontFamily: "inherit" }}
            >
              <SlidersHorizontal size={11} /> Filter <ChevronDown size={10} />
            </button>
            {showFilterDrop && (
              <>
                <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setShowFilterDrop(false)} />
                <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 50, background: "#fff", border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", minWidth: "130px" }}>
                  {["all", "collected", "pending", "overdue"].map(s => (
                    <button key={s} onClick={() => { setFilterStatus(s); setShowFilterDrop(false); }} style={{ width: "100%", padding: "8px 14px", border: "none", background: filterStatus === s ? "rgba(27,67,50,0.07)" : "transparent", cursor: "pointer", fontSize: "12px", textAlign: "left", fontFamily: "inherit", fontWeight: filterStatus === s ? 700 : 400, color: filterStatus === s ? "#1B4332" : "var(--text-1)", textTransform: "capitalize" }}>
                      {s === "all" ? "All Status" : s}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Table header */}
      <div style={{ display: "grid", gridTemplateColumns: "28px auto 1fr auto auto auto", gap: "0 10px", alignItems: "center", padding: "8px 16px", background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
        <div />
        <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>ID</div>
        <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Activity</div>
        <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "right" }}>Amount</div>
        <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Status</div>
        <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Date</div>
      </div>

      {/* Rows */}
      {filtered.map((a, i) => (
        <div key={a.id} className="trow" style={{ display: "grid", gridTemplateColumns: "28px auto 1fr auto auto auto", gap: "0 10px", alignItems: "center", padding: "10px 16px", borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none" }}>
          <div style={{ width: "24px", height: "24px", borderRadius: "7px", background: a.status === "collected" ? "#ECFDF5" : a.status === "pending" ? "#FFFBEB" : "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {a.status === "collected" ? <TrendingUp size={11} color="#059669" /> : a.status === "pending" ? <Clock size={11} color="#D97706" /> : <AlertTriangle size={11} color="#DC2626" />}
          </div>
          <div style={{ fontSize: "10.5px", color: "var(--text-3)", fontFamily: "monospace", whiteSpace: "nowrap" }}>{a.id}</div>
          <div>
            <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.property}</div>
            <div style={{ fontSize: "10px", color: "var(--text-3)" }}>{a.type}</div>
          </div>
          <div style={{ fontSize: "13px", fontWeight: 700, color: a.status === "overdue" ? "#DC2626" : "var(--text-1)", textAlign: "right", whiteSpace: "nowrap" }}>
            {fmtINR(a.amount)}
          </div>
          <ActivityBadge status={a.status} />
          <div style={{ fontSize: "10.5px", color: "var(--text-3)", whiteSpace: "nowrap" }}>{a.time}</div>
        </div>
      ))}
      {filtered.length === 0 && (
        <div style={{ padding: "24px", textAlign: "center", fontSize: "12px", color: "var(--text-3)" }}>No activities match your filter.</div>
      )}
    </div>
  );
}

// ── Revenue Trend Chart ────────────────────────────────────────────────────────

const DATE_RANGES: { key: DateRange; label: string }[] = [
  { key: "today",     label: "Today"      },
  { key: "yesterday", label: "Yesterday"  },
  { key: "last7",     label: "Last 7 Days"},
  { key: "thisMonth", label: "This Month" },
  { key: "lastMonth", label: "Last Month" },
];

function RevenueTrendChart({ dateRange, setDateRange }: { dateRange: DateRange; setDateRange: (d: DateRange) => void }) {
  const data = CHART_DATA[dateRange];
  return (
    <div className="glass-card" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-1)", margin: "0 0 3px" }}>Revenue Trend</h3>
          <p style={{ fontSize: "11px", color: "var(--text-3)", margin: 0 }}>Daily revenue across all properties</p>
        </div>
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          {DATE_RANGES.map(({ key, label }) => {
            const active = dateRange === key;
            return (
              <button key={key} onClick={() => setDateRange(key)} style={{ padding: "5px 11px", borderRadius: "7px", border: active ? "none" : "1.5px solid var(--border)", cursor: "pointer", fontSize: "11.5px", fontWeight: active ? 700 : 400, background: active ? "#1B4332" : "#fff", color: active ? "#C9A96E" : "var(--text-2)", transition: "all 150ms" }}>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", gap: "16px", marginBottom: "12px", flexWrap: "wrap" }}>
        {[
          { color: "#C9A96E", label: "This Period", dash: "" },
          { color: "#1B4332", label: "Last Month",  dash: "6 3" },
          { color: "#D1D5DB", label: "Budget",      dash: "3 3" },
        ].map(({ color, label, dash }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <svg width="18" height="4"><line x1="0" y1="2" x2="18" y2="2" stroke={color} strokeWidth="2" strokeDasharray={dash} /></svg>
            <span style={{ fontSize: "10.5px", color: "var(--text-3)" }}>{label}</span>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--text-3)" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tickFormatter={fmtK} tick={{ fontSize: 10, fill: "var(--text-3)" }} tickLine={false} axisLine={false} width={48} />
          <Tooltip content={<TrendTooltip />} />
          <Line type="monotone" dataKey="thisPeriod" stroke="#C9A96E" strokeWidth={2.5} dot={false} name="This Period" />
          <Line type="monotone" dataKey="lastMonth"  stroke="#1B4332" strokeWidth={1.5} strokeDasharray="6 3" dot={false} name="Last Month" />
          <Line type="monotone" dataKey="budget"     stroke="#D1D5DB" strokeWidth={1.5} strokeDasharray="3 3" dot={false} name="Budget" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Revenue Mix Donut ─────────────────────────────────────────────────────────

function RevenueMixDonut() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  return (
    <div className="glass-card" style={{ padding: "18px" }}>
      <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-1)", margin: "0 0 3px" }}>Revenue Mix</h3>
      <p style={{ fontSize: "11px", color: "var(--text-3)", margin: "0 0 12px" }}>Breakdown by category</p>

      <div style={{ position: "relative", height: "160px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={REVENUE_MIX} cx="50%" cy="50%" innerRadius={48} outerRadius={70} paddingAngle={2} dataKey="value"
              onMouseEnter={(_, idx) => setActiveIdx(idx)}
              onMouseLeave={() => setActiveIdx(null)}
            >
              {REVENUE_MIX.map((entry, i) => (
                <Cell key={i} fill={entry.color} opacity={activeIdx === null || activeIdx === i ? 1 : 0.4}
                  stroke={activeIdx === i ? "#fff" : "none"} strokeWidth={activeIdx === i ? 2 : 0} />
              ))}
            </Pie>
            <Tooltip formatter={(val) => [`${val}%`, ""]} contentStyle={{ background: "rgba(15,42,32,0.97)", border: "1px solid rgba(201,169,110,0.3)", borderRadius: "8px", fontSize: "11px", color: "#fff" }} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center", pointerEvents: "none" }}>
          <div style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-1)" }}>₹20.8L</div>
          <div style={{ fontSize: "9px", color: "var(--text-3)", letterSpacing: "0.05em" }}>TODAY</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginTop: "10px" }}>
        {REVENUE_MIX.map((item, i) => (
          <div key={item.name} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
            onMouseEnter={() => setActiveIdx(i)} onMouseLeave={() => setActiveIdx(null)}>
            <span style={{ width: "9px", height: "9px", borderRadius: "3px", background: item.color, flexShrink: 0, display: "inline-block" }} />
            <span style={{ fontSize: "11px", color: "var(--text-2)", flex: 1 }}>{item.name}</span>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-1)" }}>{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Property Table ────────────────────────────────────────────────────────────

type SortCol = "name" | "occ" | "roomRev" | "fnbRev" | "eventsRev" | "totalRev" | "adr" | "revpar" | "vsYesterday";

function PropertyTable({ properties, expandedId, setExpandedId }: {
  properties: FinanceProperty[];
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
}) {
  const [sortCol, setSortCol] = useState<SortCol>("totalRev");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => [...properties].sort((a, b) => {
    const av = a[sortCol] as number, bv = b[sortCol] as number;
    return sortDir === "desc" ? bv - av : av - bv;
  }), [properties, sortCol, sortDir]);

  const totals = useMemo(() => ({
    occ:      Math.round(properties.reduce((s, p) => s + p.occ, 0) / properties.length),
    roomRev:  properties.reduce((s, p) => s + p.roomRev, 0),
    fnbRev:   properties.reduce((s, p) => s + p.fnbRev, 0),
    eventsRev:properties.reduce((s, p) => s + p.eventsRev, 0),
    totalRev: properties.reduce((s, p) => s + p.totalRev, 0),
    adr:      Math.round(properties.reduce((s, p) => s + p.adr, 0) / properties.length),
    revpar:   Math.round(properties.reduce((s, p) => s + p.revpar, 0) / properties.length),
  }), [properties]);

  function toggleSort(col: SortCol) {
    if (sortCol === col) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortCol(col); setSortDir("desc"); }
  }

  function Th({ col, label, right }: { col: SortCol; label: string; right?: boolean }) {
    const active = sortCol === col;
    return (
      <th onClick={() => toggleSort(col)} style={{ padding: "9px 12px", fontSize: "10.5px", fontWeight: 600, color: active ? "#C9A96E" : "var(--text-3)", cursor: "pointer", whiteSpace: "nowrap", userSelect: "none", textAlign: right ? "right" : "left", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
          {label}
          {active ? (sortDir === "desc" ? <ChevronDown size={10} /> : <ChevronUp size={10} />) : <ChevronDown size={10} style={{ opacity: 0.3 }} />}
        </span>
      </th>
    );
  }

  return (
    <div className="glass-card" style={{ overflow: "hidden" }}>
      <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--border)" }}>
        <SectionHeader title="Property-wise Revenue" subtitle={`${properties.length} properties · click any row to expand`} />
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
              <Th col="name"       label="Property" />
              <Th col="occ"        label="Occ %" right />
              <Th col="roomRev"    label="Room Rev" right />
              <Th col="fnbRev"     label="F&B" right />
              <Th col="eventsRev"  label="Events" right />
              <Th col="totalRev"   label="Total Rev" right />
              <Th col="adr"        label="ADR" right />
              <Th col="revpar"     label="RevPAR" right />
              <Th col="vsYesterday" label="vs Yest." right />
              <th style={{ padding: "9px 12px", fontSize: "10.5px", fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Status</th>
              <th style={{ width: "32px" }} />
            </tr>
          </thead>
          <tbody>
            {sorted.map(prop => (
              <>
                <tr key={prop.id} className={`trow clickable${expandedId === prop.id ? " active" : ""}`}
                  onClick={() => setExpandedId(expandedId === prop.id ? null : prop.id)}
                  style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "11px 12px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-1)", whiteSpace: "nowrap" }}>{prop.name}</div>
                    <div style={{ fontSize: "10.5px", color: "var(--text-3)", marginTop: "1px" }}>{prop.rooms} rooms · {ENTITY_LABELS[prop.entity]}</div>
                  </td>
                  <td style={{ padding: "11px 12px", textAlign: "right" }}>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-1)" }}>{prop.occ}%</div>
                    <div style={{ marginTop: "4px" }}>
                      <div className="pbar-track">
                        <div className="pbar-fill" style={{ width: `${prop.occ}%`, background: prop.occ >= 80 ? "#059669" : prop.occ >= 65 ? "#D97706" : "#DC2626" }} />
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "11px 12px", textAlign: "right", fontSize: "13px", fontWeight: 500, color: "var(--text-1)" }}>{fmtINR(prop.roomRev)}</td>
                  <td style={{ padding: "11px 12px", textAlign: "right", fontSize: "13px", fontWeight: 500, color: "var(--text-1)" }}>{fmtINR(prop.fnbRev)}</td>
                  <td style={{ padding: "11px 12px", textAlign: "right", fontSize: "13px", fontWeight: 500, color: "var(--text-1)" }}>{fmtINR(prop.eventsRev)}</td>
                  <td style={{ padding: "11px 12px", textAlign: "right" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-1)" }}>{fmtINR(prop.totalRev)}</div>
                    <div style={{ fontSize: "10px", color: "var(--text-3)", marginTop: "1px" }}>Bgt: {fmtINR(prop.budget)}</div>
                  </td>
                  <td style={{ padding: "11px 12px", textAlign: "right", fontSize: "13px", color: "var(--text-1)" }}>₹{prop.adr.toLocaleString("en-IN")}</td>
                  <td style={{ padding: "11px 12px", textAlign: "right", fontSize: "13px", color: "var(--text-1)" }}>₹{prop.revpar.toLocaleString("en-IN")}</td>
                  <td style={{ padding: "11px 12px", textAlign: "right" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "12px", fontWeight: 600, color: prop.vsYesterday >= 0 ? "#059669" : "#DC2626" }}>
                      {prop.vsYesterday >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {pct(prop.vsYesterday)}
                    </span>
                  </td>
                  <td style={{ padding: "11px 12px" }}><StatusBadge status={prop.status} /></td>
                  <td style={{ padding: "11px 12px", textAlign: "center" }}>
                    {expandedId === prop.id ? <ChevronUp size={14} color="var(--text-3)" /> : <ChevronRight size={14} color="var(--text-3)" />}
                  </td>
                </tr>
                {expandedId === prop.id && (
                  <tr key={`${prop.id}-exp`}>
                    <td colSpan={11} style={{ padding: 0, background: "#F9FBF9" }}>
                      <div style={{ padding: "14px 20px", borderBottom: "2px solid rgba(201,169,110,0.2)" }}>
                        <p style={{ fontSize: "11.5px", fontWeight: 700, color: "#1B4332", marginBottom: "10px" }}>Unit breakdown — {prop.name}</p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
                          {[
                            { label: "Room Revenue",  val: fmtINRFull(prop.roomRev)  },
                            { label: "F&B Revenue",   val: fmtINRFull(prop.fnbRev)   },
                            { label: "Events Revenue",val: fmtINRFull(prop.eventsRev)},
                            { label: "Occupancy",     val: `${prop.occ}% (${Math.round(prop.rooms * prop.occ / 100)}/${prop.rooms})` },
                          ].map(({ label, val }) => (
                            <div key={label} style={{ background: "#fff", borderRadius: "8px", padding: "10px 12px", border: "1px solid var(--border)" }}>
                              <div style={{ fontSize: "10px", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>{label}</div>
                              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-1)" }}>{val}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            <tr style={{ background: "rgba(201,169,110,0.06)", borderTop: "2px solid rgba(201,169,110,0.25)" }}>
              <td style={{ padding: "12px", fontSize: "12px", fontWeight: 700, color: "var(--text-1)" }}>Total — {properties.length} Properties</td>
              <td style={{ padding: "12px", textAlign: "right", fontSize: "13px", fontWeight: 700, color: "var(--text-1)" }}>{totals.occ}%</td>
              <td style={{ padding: "12px", textAlign: "right", fontSize: "13px", fontWeight: 700, color: "#1B4332" }}>{fmtINR(totals.roomRev)}</td>
              <td style={{ padding: "12px", textAlign: "right", fontSize: "13px", fontWeight: 700, color: "#1B4332" }}>{fmtINR(totals.fnbRev)}</td>
              <td style={{ padding: "12px", textAlign: "right", fontSize: "13px", fontWeight: 700, color: "#1B4332" }}>{fmtINR(totals.eventsRev)}</td>
              <td style={{ padding: "12px", textAlign: "right", fontSize: "15px", fontWeight: 800, color: "#1B4332" }}>{fmtINR(totals.totalRev)}</td>
              <td style={{ padding: "12px", textAlign: "right", fontSize: "13px", fontWeight: 600, color: "var(--text-1)" }}>₹{totals.adr.toLocaleString("en-IN")}</td>
              <td style={{ padding: "12px", textAlign: "right", fontSize: "13px", fontWeight: 600, color: "var(--text-1)" }}>₹{totals.revpar.toLocaleString("en-IN")}</td>
              <td colSpan={3} />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Unit Table ────────────────────────────────────────────────────────────────

function UnitTable() {
  return (
    <div className="glass-card" style={{ overflow: "hidden" }}>
      <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--border)" }}>
        <SectionHeader title="Unit-wise Sales Breakdown" subtitle="Revenue by room / unit category" />
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
              {["Unit Type","Total","Occupied","Vacant","Occ %","Avg Rate","Revenue","vs Yesterday"].map((h, i) => (
                <th key={h} style={{ padding: "9px 14px", fontSize: "10.5px", fontWeight: 600, color: "var(--text-3)", textAlign: i > 0 ? "right" : "left", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {UNIT_TYPES.map(u => {
              const vacant = u.total - u.occupied;
              const occPct = Math.round((u.occupied / u.total) * 100);
              return (
                <tr key={u.type} className="trow" style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "10px 14px", fontSize: "13px", fontWeight: 600, color: "var(--text-1)" }}>{u.type}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right", fontSize: "13px", color: "var(--text-2)" }}>{u.total}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right", fontSize: "13px", fontWeight: 600, color: "#059669" }}>{u.occupied}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right", fontSize: "13px", color: "#DC2626" }}>{vacant}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                      <div className="pbar-track">
                        <div className="pbar-fill" style={{ width: `${occPct}%`, background: occPct >= 80 ? "#059669" : occPct >= 65 ? "#D97706" : "#DC2626" }} />
                      </div>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-1)", minWidth: "30px", textAlign: "right" }}>{occPct}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "right", fontSize: "13px", color: "var(--text-1)" }}>₹{u.avgRate.toLocaleString("en-IN")}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right", fontSize: "13px", fontWeight: 700, color: "#1B4332" }}>{fmtINR(u.revenue)}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "12px", fontWeight: 600, color: u.vsYesterday >= 0 ? "#059669" : "#DC2626" }}>
                      {u.vsYesterday >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {pct(u.vsYesterday)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Outstanding Panel ─────────────────────────────────────────────────────────

function OutstandingPanel() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "16px" }}>
      <div className="glass-card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <SectionHeader title="Outstanding Receivables" subtitle="Amounts owed to Treat Hotels" />
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <XCircle size={13} color="#DC2626" />
            <span style={{ fontSize: "11px", color: "#DC2626", fontWeight: 600 }}>2 Critical</span>
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
              {["Client","Invoice","Amount","Due Date","Days","Status"].map((h, i) => (
                <th key={h} style={{ padding: "9px 14px", fontSize: "10.5px", fontWeight: 600, color: "var(--text-3)", textAlign: i >= 2 && i <= 4 ? "right" : "left", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {OUTSTANDING_CLIENTS.map(c => (
              <tr key={c.invoice} className="trow" style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "10px 14px", fontSize: "13px", fontWeight: 600, color: "var(--text-1)", whiteSpace: "nowrap" }}>{c.client}</td>
                <td style={{ padding: "10px 14px", fontSize: "11px", color: "var(--text-3)", fontFamily: "monospace" }}>{c.invoice}</td>
                <td style={{ padding: "10px 14px", textAlign: "right", fontSize: "13px", fontWeight: 700, color: "var(--text-1)" }}>{fmtINR(c.amount)}</td>
                <td style={{ padding: "10px 14px", textAlign: "right", fontSize: "12px", color: "var(--text-2)", whiteSpace: "nowrap" }}>{c.dueDate}</td>
                <td style={{ padding: "10px 14px", textAlign: "right" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: c.daysOverdue > 30 ? "#DC2626" : c.daysOverdue > 0 ? "#D97706" : "#059669" }}>
                    {c.daysOverdue > 0 ? `+${c.daysOverdue}d` : `${Math.abs(c.daysOverdue)}d`}
                  </span>
                </td>
                <td style={{ padding: "10px 14px" }}><OutBadge status={c.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "var(--text-3)" }}>Total outstanding</span>
          <span style={{ fontSize: "16px", fontWeight: 800, color: "#DC2626" }}>₹84,20,000</span>
        </div>
      </div>

      <div className="glass-card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--border)" }}>
          <SectionHeader title="Payables Summary" subtitle="What Treat Hotels owes vendors" />
        </div>
        <div style={{ padding: "12px" }}>
          {PAYABLES.map(p => (
            <div key={p.vendor} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: "8px", marginBottom: "6px", background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div>
                <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-1)" }}>{p.vendor}</div>
                <div style={{ display: "flex", gap: "8px", marginTop: "3px", alignItems: "center" }}>
                  <span className="badge" style={{ background: "rgba(201,169,110,0.12)", color: "#92400E", padding: "1px 6px", fontSize: "10px" }}>{p.category}</span>
                  <span style={{ fontSize: "10.5px", color: "var(--text-3)" }}>Due {p.dueDate}</span>
                </div>
              </div>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-1)" }}>{fmtINR(p.amount)}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: "12px", color: "var(--text-3)" }}>Total payables</span>
          <span style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-1)" }}>{fmtINR(PAYABLES.reduce((s, p) => s + p.amount, 0))}</span>
        </div>
      </div>
    </div>
  );
}

// ── Expense vs Revenue ────────────────────────────────────────────────────────

function ExpenseRevenueChart() {
  return (
    <div className="glass-card" style={{ padding: "20px" }}>
      <SectionHeader title="Expense vs Revenue" subtitle="Gross margin by category · current month" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "24px", alignItems: "center" }}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={EXPENSE_DATA} layout="vertical" margin={{ top: 0, right: 60, bottom: 0, left: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" horizontal={false} />
            <XAxis type="number" tickFormatter={fmtK} tick={{ fontSize: 10, fill: "var(--text-3)" }} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="category" tick={{ fontSize: 12, fill: "var(--text-1)", fontWeight: 600 }} tickLine={false} axisLine={false} width={70} />
            <Tooltip formatter={(val, name) => [fmtINR(val as number), name]} contentStyle={{ background: "rgba(15,42,32,0.97)", border: "1px solid rgba(201,169,110,0.3)", borderRadius: "8px", fontSize: "11px", color: "#fff" }} />
            <Bar dataKey="revenue" fill="#C9A96E" name="Revenue" radius={[0, 3, 3, 0]} maxBarSize={16}>
              <LabelList dataKey="margin" position="right" formatter={(v: unknown) => `${v}%`} style={{ fontSize: "11px", fontWeight: 700, fill: "#059669" }} />
            </Bar>
            <Bar dataKey="expense" fill="rgba(27,67,50,0.25)" name="Expense" radius={[0, 3, 3, 0]} maxBarSize={16} />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "130px" }}>
          {EXPENSE_DATA.map(d => (
            <div key={d.category} style={{ padding: "8px 12px", borderRadius: "8px", background: d.category === "Overall" ? "rgba(27,67,50,0.08)" : "var(--surface-2)", border: `1px solid ${d.category === "Overall" ? "rgba(201,169,110,0.3)" : "var(--border)"}` }}>
              <div style={{ fontSize: "10px", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{d.category}</div>
              <div style={{ fontSize: "16px", fontWeight: 800, color: d.margin >= 50 ? "#059669" : d.margin >= 35 ? "#D97706" : "#DC2626" }}>{d.margin}%</div>
              <div style={{ fontSize: "9.5px", color: "var(--text-3)" }}>Gross Margin</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
        {[{ bg: "#C9A96E", label: "Revenue" }, { bg: "rgba(27,67,50,0.25)", label: "Expense" }].map(({ bg, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "12px", height: "12px", borderRadius: "3px", background: bg, display: "inline-block" }} />
            <span style={{ fontSize: "11.5px", color: "var(--text-3)" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── OTA Tracker ───────────────────────────────────────────────────────────────

function OtaTracker() {
  const total       = OTA_DATA.reduce((s, o) => s + o.bookings, 0);
  const directEntry = OTA_DATA.find(o => o.platform === "Direct");
  const directPct   = directEntry ? Math.round((directEntry.bookings / total) * 100) : 0;
  const totalComm   = OTA_DATA.reduce((s, o) => s + o.commission, 0);

  return (
    <div className="glass-card" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
        <SectionHeader title="OTA Commission Tracker" subtitle="Channel-wise bookings & commission · current month" />
        <div style={{ padding: "8px 14px", borderRadius: "10px", background: "rgba(5,150,105,0.1)", border: "1px solid rgba(5,150,105,0.25)", textAlign: "center" }}>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "#059669" }}>{directPct}%</div>
          <div style={{ fontSize: "10px", color: "#059669", fontWeight: 600 }}>Direct</div>
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
              {["Platform","Bookings","Revenue","Commission %","Commission ₹","Share"].map((h, i) => (
                <th key={h} style={{ padding: "9px 14px", fontSize: "10.5px", fontWeight: 600, color: "var(--text-3)", textAlign: i > 0 ? "right" : "left", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {OTA_DATA.map(o => {
              const share  = Math.round((o.bookings / total) * 100);
              const direct = o.platform === "Direct";
              return (
                <tr key={o.platform} className="trow" style={{ borderBottom: "1px solid var(--border)", background: direct ? "rgba(5,150,105,0.03)" : undefined }}>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: direct ? "#059669" : "#C9A96E", display: "inline-block" }} />
                      <span style={{ fontSize: "13px", fontWeight: direct ? 700 : 600, color: direct ? "#059669" : "var(--text-1)" }}>{o.platform}</span>
                      {direct && <span className="badge" style={{ background: "rgba(5,150,105,0.1)", color: "#059669", fontSize: "9px" }}>Best Margin</span>}
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "right", fontSize: "13px", fontWeight: 600, color: "var(--text-1)" }}>{o.bookings}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right", fontSize: "13px", color: "var(--text-1)" }}>{fmtINR(o.revenue)}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: o.commissionPct === 0 ? "#059669" : o.commissionPct >= 17 ? "#DC2626" : "#D97706" }}>
                      {o.commissionPct === 0 ? "0% — FREE" : `${o.commissionPct}%`}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "right", fontSize: "13px", fontWeight: 700, color: o.commission === 0 ? "#059669" : "#DC2626" }}>
                    {o.commission === 0 ? "—" : fmtINR(o.commission)}
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "right" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                      <div className="pbar-track" style={{ width: "56px" }}>
                        <div className="pbar-fill" style={{ width: `${share}%`, background: direct ? "#059669" : "#C9A96E" }} />
                      </div>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-2)", minWidth: "28px", textAlign: "right" }}>{share}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ padding: "12px 0 0", display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border)", marginTop: "8px" }}>
        <span style={{ fontSize: "12px", color: "var(--text-3)" }}>Total commission paid this month</span>
        <span style={{ fontSize: "16px", fontWeight: 800, color: "#DC2626" }}>{fmtINR(totalComm)}</span>
      </div>
    </div>
  );
}

// ── Sales Email Feed ──────────────────────────────────────────────────────────

function SalesEmailFeed() {
  return (
    <div className="glass-card" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
        <SectionHeader title="Daily Tally Report Feed" subtitle="Last 7 emails received from the Tally system" />
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span className="pulse-dot" style={{ background: "#059669" }} />
          <span style={{ fontSize: "11px", color: "#059669", fontWeight: 600 }}>System Active</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
        {SALES_EMAILS.map((e, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 14px", borderRadius: "9px", background: "var(--surface-2)", border: "1px solid var(--border)", transition: "background 150ms" }}
            onMouseEnter={ev => (ev.currentTarget.style.background = "#F0F4F2")}
            onMouseLeave={ev => (ev.currentTarget.style.background = "var(--surface-2)")}>
            <Mail size={14} color={i === 0 ? "#C9A96E" : "var(--text-3)"} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.attachment}</div>
              <div style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "2px" }}>{e.date} · {e.properties} properties</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
              <span className="badge" style={{ background: "#ECFDF5", color: "#065F46" }}><CheckCircle2 size={11} /> Processed</span>
              <button style={{ fontSize: "11px", color: "#1B4332", fontWeight: 600, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "3px" }}>
                <FileText size={11} /> View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main FinanceModule ────────────────────────────────────────────────────────

export default function FinanceModule({ role }: { role: string }) {
  const [dateRange, setDateRange]           = useState<DateRange>("today");
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  const [entityFilter, setEntityFilter]     = useState<EntityFilter>("all");
  const [expandedId, setExpandedId]         = useState<string | null>(null);
  const [selectedDate, setSelectedDate]     = useState<Date>(new Date(2026, 4, 25));

  const timestamp = getDynTimestamp();

  const isGM       = role.startsWith("GM_");
  const gmProperty = role === "GM_SILVASSA" ? "silvassa" : role === "GM_DAHANU" ? "dahanu" : role === "GM_KUMBHALGARH" ? "kumbhalgarh" : null;

  const filteredProperties = useMemo(() => {
    let props = FINANCE_PROPERTIES;
    if (isGM && gmProperty) return props.filter(p => p.id === gmProperty);
    if (propertyFilter !== "all") props = props.filter(p => p.id === propertyFilter);
    if (entityFilter !== "all")   props = props.filter(p => p.entity === entityFilter);
    return props;
  }, [propertyFilter, entityFilter, isGM, gmProperty]);

  const totalRev  = filteredProperties.reduce((s, p) => s + p.totalRev, 0);
  const totalRooms = filteredProperties.reduce((s, p) => s + p.rooms, 0);
  const occRooms  = filteredProperties.reduce((s, p) => s + Math.round(p.rooms * p.occ / 100), 0);
  const avgOcc    = totalRooms ? Math.round((occRooms / totalRooms) * 100) : 0;
  const avgAdr    = filteredProperties.length ? Math.round(filteredProperties.reduce((s, p) => s + p.adr, 0) / filteredProperties.length) : 0;
  const avgRevpar = filteredProperties.length ? Math.round(filteredProperties.reduce((s, p) => s + p.revpar, 0) / filteredProperties.length) : 0;
  const totalBudget = filteredProperties.reduce((s, p) => s + p.budget, 0);
  const budgetAtt = totalBudget ? Math.round((totalRev / totalBudget) * 100) : 0;

  function handleDateSelect(date: Date) {
    setSelectedDate(date);
    const isToday = date.getDate() === TODAY_DEMO.getDate() && date.getMonth() === TODAY_DEMO.getMonth();
    setDateRange(isToday ? "today" : "last7");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* ① Greeting Banner */}
      {!isGM && <GreetingBanner role={role} selectedDate={selectedDate} totalRev={totalRev} avgOcc={avgOcc} />}

      {/* ② 3-column dashboard grid */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr 280px", gap: "16px", alignItems: "start" }}>

        {/* LEFT — Hero card + entity breakdown */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <HeroRevenueCard
            totalRev={totalRev}
            propertyFilter={propertyFilter} setPropertyFilter={setPropertyFilter}
            entityFilter={entityFilter} setEntityFilter={setEntityFilter}
          />
          {!isGM && <EntityBreakdownCards />}
        </div>

        {/* CENTER — 2×2 mini stats + budget progress + recent activity */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <MiniStatCard
              label="Occupancy Rate" value={`${avgOcc}%`}
              sub={`${occRooms}/${totalRooms} rooms`}
              delta={FINANCE_KPIS.occVsYesterday} deltaLabel="vs yesterday"
              featured
            />
            <MiniStatCard
              label="ADR" value={`₹${avgAdr.toLocaleString("en-IN")}`}
              sub="Avg daily rate"
              delta={FINANCE_KPIS.adrVsYesterday} deltaLabel="vs yesterday"
            />
            <MiniStatCard
              label="RevPAR" value={`₹${avgRevpar.toLocaleString("en-IN")}`}
              sub="ADR × Occ%"
              delta={FINANCE_KPIS.revparVsYesterday} deltaLabel="vs yesterday"
            />
            <MiniStatCard
              label="Budget Attainment" value={`${budgetAtt}%`}
              sub="vs daily target"
              delta={budgetAtt - 100} deltaLabel="vs target"
            />
          </div>
          <BudgetProgressCard />
          <RecentActivityTable />
        </div>

        {/* RIGHT — Calendar + revenue mix */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <CalendarCard selectedDate={selectedDate} onSelect={handleDateSelect} />
          <RevenueMixDonut />
        </div>
      </div>

      {/* ③ Full-width revenue trend chart (with built-in date filter) */}
      <RevenueTrendChart dateRange={dateRange} setDateRange={setDateRange} />

      {/* ④ Detailed sections */}
      <PropertyTable properties={filteredProperties} expandedId={expandedId} setExpandedId={setExpandedId} />
      <UnitTable />
      {!isGM && <OutstandingPanel />}
      <ExpenseRevenueChart />
      <OtaTracker />
      <SalesEmailFeed />
    </div>
  );
}
