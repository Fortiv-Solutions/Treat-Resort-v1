"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  Database,
  FileCheck2,
  FileText,
  Hotel,
  Landmark,
  Percent,
  ReceiptText,
  Sparkles,
  WalletCards,
} from "lucide-react";
import type { DashboardPayload } from "@/lib/dashboardData";
import { FINANCE_PROPERTIES, type EntityFilter, type FinanceProperty } from "@/lib/financeData";

type MetricTone = "gold" | "green" | "teal" | "red";

const MIX_COLORS = ["#C8AC61", "#055C4C", "#0F7069", "#9F7731", "#7D7463"];

function fmtINR(value: number) {
  if (value >= 10000000) return `Rs ${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `Rs ${(value / 100000).toFixed(2)} L`;
  if (value >= 1000) return `Rs ${(value / 1000).toFixed(1)}K`;
  return `Rs ${value.toLocaleString("en-IN")}`;
}

function pct(value: number) {
  return `${Math.round(value)}%`;
}

function entityLabel(entity: string) {
  if (entity === "mundra") return "Mundra Hotels & Resorts";
  if (entity === "tirupati") return "Tirupati Shelters";
  if (entity === "ras") return "RAS Resorts";
  return entity;
}

function compactDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center px-6 py-10 text-center">
      <Database className="mb-3 h-8 w-8 text-brand-border" />
      <p className="m-0 text-sm font-bold text-brand-text-1">{title}</p>
      <p className="m-0 mt-1 max-w-sm text-[13px] leading-relaxed text-brand-text-3">{body}</p>
    </div>
  );
}

function PanelHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 className="m-0 font-serif text-[15px] font-extrabold text-brand-text-1">{title}</h2>
        {subtitle && <p className="m-0 mt-1 text-xs font-medium text-brand-text-3">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function DataPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-brand-border-soft bg-brand-surface/95 shadow-premium-card ${className}`}>
      {children}
    </section>
  );
}

function MetricTile({
  label,
  value,
  sub,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  icon: typeof Banknote;
  tone: MetricTone;
}) {
  const toneClass: Record<MetricTone, string> = {
    gold: "bg-brand-gold text-brand-ink",
    green: "bg-brand-green-900 text-brand-gold",
    teal: "bg-brand-teal text-white",
    red: "bg-red-900 text-red-100",
  };

  return (
    <div className="min-w-0 rounded-2xl border border-brand-border-soft bg-brand-ivory p-4 shadow-premium-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="m-0 text-[11px] font-bold uppercase tracking-wider text-brand-text-3">{label}</p>
          <p className="m-0 mt-2 truncate text-2xl font-black tabular-nums text-brand-text-1">{value}</p>
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneClass[tone]}`}>
          <Icon className="h-4 w-4" strokeWidth={2.4} />
        </div>
      </div>
      <p className="m-0 mt-3 truncate text-xs font-semibold text-brand-text-3">{sub}</p>
    </div>
  );
}

function PropertyFilters({
  properties,
  propertyFilter,
  setPropertyFilter,
  entityFilter,
  setEntityFilter,
}: {
  properties: FinanceProperty[];
  propertyFilter: string;
  setPropertyFilter: (value: string) => void;
  entityFilter: EntityFilter;
  setEntityFilter: (value: EntityFilter) => void;
}) {
  const selectClass =
    "h-10 rounded-xl border border-brand-border-soft bg-brand-ivory px-3 text-[13px] font-bold text-brand-text-1 outline-none transition focus:border-brand-gold";

  return (
    <div className="flex flex-wrap gap-2">
      <select value={propertyFilter} onChange={event => setPropertyFilter(event.target.value)} className={selectClass}>
        <option value="all">All properties</option>
        {properties.map(property => (
          <option key={property.id} value={property.id}>{property.name}</option>
        ))}
      </select>
      <select value={entityFilter} onChange={event => setEntityFilter(event.target.value as EntityFilter)} className={selectClass}>
        <option value="all">All entities</option>
        <option value="mundra">Mundra Hotels & Resorts</option>
        <option value="tirupati">Tirupati Shelters</option>
        <option value="ras">RAS Resorts</option>
      </select>
    </div>
  );
}

function FinanceCommandHeader({
  data,
  properties,
  propertyFilter,
  setPropertyFilter,
  entityFilter,
  setEntityFilter,
  isGM,
}: {
  data: DashboardPayload | null;
  properties: FinanceProperty[];
  propertyFilter: string;
  setPropertyFilter: (value: string) => void;
  entityFilter: EntityFilter;
  setEntityFilter: (value: EntityFilter) => void;
  isGM: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-brand-border-soft bg-brand-surface/95 shadow-premium-card">
      <div className="px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-border-soft bg-brand-ivory px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-gold-rich">
              <Landmark className="h-3.5 w-3.5" />
              Finance command center
            </div>
            <h1 className="m-0 font-display text-2xl font-bold text-brand-text-1 sm:text-3xl">Finance Intelligence</h1>
            <p className="m-0 mt-2 max-w-2xl text-sm leading-relaxed text-brand-text-3">
              Portfolio yield, revenue movement, receivables risk, and import freshness.
            </p>
          </div>
          {!isGM && (
            <PropertyFilters
              properties={properties}
              propertyFilter={propertyFilter}
              setPropertyFilter={setPropertyFilter}
              entityFilter={entityFilter}
              setEntityFilter={setEntityFilter}
            />
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-brand-border-soft bg-brand-surface-2 px-5 py-3 text-xs sm:px-6">
        <span className="inline-flex items-center gap-2 font-semibold text-brand-text-3">
          <Sparkles className="h-3.5 w-3.5 text-brand-gold-rich" />
          {data?.configured ? "Connected to live finance data" : "Waiting for finance data connection"}
        </span>
        <span className="font-bold text-brand-text-3">{properties.length} properties in current scope</span>
      </div>
    </section>
  );
}

function ExecutiveMetrics({
  properties,
  totalRevenue,
  avgOccupancy,
  avgAdr,
  totalOutstanding,
  totalRooms,
  occupiedRooms,
  revenueChangePct,
}: {
  properties: FinanceProperty[];
  totalRevenue: number;
  avgOccupancy: number;
  avgAdr: number;
  totalOutstanding: number;
  totalRooms: number;
  occupiedRooms: number;
  revenueChangePct: number;
}) {
  const roomRevenue = properties.reduce((sum, property) => sum + property.roomRev, 0);
  const roomShare = totalRevenue ? Math.round((roomRevenue / totalRevenue) * 100) : 0;
  const revpar = totalRooms ? Math.round(roomRevenue / totalRooms) : 0;
  const revenueTone: MetricTone = revenueChangePct < 0 ? "red" : "gold";
  const revenueDirection = revenueChangePct > 0 ? "+" : "";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <MetricTile label="Revenue" value={fmtINR(totalRevenue)} sub={`${properties.length} properties in scope`} icon={CircleDollarSign} tone="gold" />
      <MetricTile label="Revenue movement" value={`${revenueDirection}${revenueChangePct.toFixed(1)}%`} sub="Latest date vs previous import date" icon={revenueChangePct < 0 ? ArrowDownRight : ArrowUpRight} tone={revenueTone} />
      <MetricTile label="Occupancy" value={pct(avgOccupancy)} sub={`${occupiedRooms}/${totalRooms} rooms occupied`} icon={Hotel} tone="green" />
      <MetricTile label="ADR / RevPAR" value={`${fmtINR(avgAdr)} / ${fmtINR(revpar)}`} sub={`${roomShare}% revenue from rooms`} icon={Banknote} tone="teal" />
      <MetricTile label="Receivables risk" value={fmtINR(totalOutstanding)} sub="Latest snapshot by property" icon={ReceiptText} tone={totalOutstanding > 0 ? "red" : "green"} />
    </div>
  );
}

function FinanceDiagnostics({
  properties,
  totalRevenue,
  totalOutstanding,
  revenueChangePct,
  freshnessHours,
  staleProperties,
}: {
  properties: FinanceProperty[];
  totalRevenue: number;
  totalOutstanding: number;
  revenueChangePct: number;
  freshnessHours: number | null | undefined;
  staleProperties: number;
}) {
  const roomRevenue = properties.reduce((sum, property) => sum + property.roomRev, 0);
  const fnbRevenue = properties.reduce((sum, property) => sum + property.fnbRev, 0);
  const eventsRevenue = properties.reduce((sum, property) => sum + property.eventsRev, 0);
  const avgRevpar = properties.length ? Math.round(properties.reduce((sum, property) => sum + property.revpar, 0) / properties.length) : 0;
  const weakYield = properties.filter(property => property.occ < 60 || property.revpar < avgRevpar * 0.85);
  const bestProperty = [...properties].sort((a, b) => b.revpar - a.revpar)[0];
  const roomShare = totalRevenue ? Math.round((roomRevenue / totalRevenue) * 100) : 0;
  const ancillaryShare = totalRevenue ? Math.round(((fnbRevenue + eventsRevenue) / totalRevenue) * 100) : 0;
  const receivableShare = totalRevenue ? Math.round((totalOutstanding / totalRevenue) * 100) : 0;

  const diagnostics = [
    {
      label: "Yield watchlist",
      value: weakYield.length,
      detail: weakYield.length ? `${weakYield.length} properties below occupancy or RevPAR threshold` : "All scoped properties are above the yield threshold",
      tone: weakYield.length ? "text-red-700" : "text-emerald-700",
      icon: Hotel,
    },
    {
      label: "Best RevPAR",
      value: bestProperty ? fmtINR(bestProperty.revpar) : "No data",
      detail: bestProperty ? bestProperty.name : "Add finance data to rank properties",
      tone: "text-brand-green-800",
      icon: Landmark,
    },
    {
      label: "Room revenue mix",
      value: `${roomShare}%`,
      detail: `${ancillaryShare}% from F&B and events`,
      tone: "text-brand-gold-rich",
      icon: WalletCards,
    },
    {
      label: "Receivables intensity",
      value: `${receivableShare}%`,
      detail: totalOutstanding > 0 ? `${fmtINR(totalOutstanding)} open against scoped revenue` : "No outstanding balance in latest snapshot",
      tone: totalOutstanding > 0 ? "text-red-700" : "text-emerald-700",
      icon: ReceiptText,
    },
    {
      label: "Import freshness",
      value: freshnessHours === null || freshnessHours === undefined ? "Unknown" : `${freshnessHours}h`,
      detail: staleProperties ? `${staleProperties} stale property imports` : "No stale import detected",
      tone: staleProperties ? "text-red-700" : "text-brand-text-1",
      icon: FileCheck2,
    },
    {
      label: "Revenue direction",
      value: `${revenueChangePct > 0 ? "+" : ""}${revenueChangePct.toFixed(1)}%`,
      detail: "Latest import date compared with previous import date",
      tone: revenueChangePct < 0 ? "text-red-700" : "text-emerald-700",
      icon: Percent,
    },
  ];

  return (
    <DataPanel className="p-5 lg:p-6">
      <PanelHeader title="Finance Diagnostics" subtitle="Action cues for yield, mix, receivables, and data freshness" />
      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {diagnostics.map(({ label, value, detail, tone, icon: Icon }) => (
          <div key={label} className="grid grid-cols-[36px_minmax(0,1fr)] gap-3 rounded-xl border border-brand-border-soft bg-brand-ivory p-4 shadow-premium-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-surface-2 text-brand-text-2">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="m-0 text-[11px] font-bold uppercase tracking-wider text-brand-text-3">{label}</p>
              <p className={`m-0 mt-1 text-xl font-black tabular-nums ${tone}`}>{value}</p>
              <p className="m-0 mt-1 truncate text-xs font-semibold text-brand-text-3">{detail}</p>
            </div>
          </div>
        ))}
      </div>
    </DataPanel>
  );
}

function FinancePulse({
  properties,
  totalRevenue,
  totalOutstanding,
  totalRooms,
  occupiedRooms,
}: {
  properties: FinanceProperty[];
  totalRevenue: number;
  totalOutstanding: number;
  totalRooms: number;
  occupiedRooms: number;
}) {
  const sortedByRevenue = [...properties].sort((a, b) => b.totalRev - a.totalRev);
  const topRevenue = sortedByRevenue[0]?.totalRev ?? 0;
  const topRevenueShare = totalRevenue ? Math.round((topRevenue / totalRevenue) * 100) : 0;
  const roomRevenue = properties.reduce((sum, property) => sum + property.roomRev, 0);
  const avgAdr = occupiedRooms ? Math.round(roomRevenue / occupiedRooms) : 0;
  const unsoldRooms = Math.max(0, totalRooms - occupiedRooms);
  const unsoldRoomOpportunity = unsoldRooms * avgAdr;
  const revpars = properties.map(property => property.revpar).filter(value => value > 0);
  const bestRevpar = revpars.length ? Math.max(...revpars) : 0;
  const weakestRevpar = revpars.length ? Math.min(...revpars) : 0;
  const yieldSpread = bestRevpar - weakestRevpar;
  const receivablesPressure = totalRevenue ? Math.round((totalOutstanding / totalRevenue) * 100) : 0;
  const fnbRevenue = properties.reduce((sum, property) => sum + property.fnbRev, 0);
  const eventsRevenue = properties.reduce((sum, property) => sum + property.eventsRev, 0);
  const ancillaryPerOccupiedRoom = occupiedRooms ? Math.round((fnbRevenue + eventsRevenue) / occupiedRooms) : 0;

  const pulse = [
    {
      label: "Top property dependency",
      value: `${topRevenueShare}%`,
      detail: sortedByRevenue[0] ? `${sortedByRevenue[0].name} share of scoped revenue` : "No property revenue yet",
      tone: topRevenueShare >= 45 ? "text-red-700" : "text-brand-text-1",
      icon: Landmark,
    },
    {
      label: "Unsold room opportunity",
      value: fmtINR(unsoldRoomOpportunity),
      detail: `${unsoldRooms} room nights valued at scoped ADR`,
      tone: unsoldRooms > 0 ? "text-brand-gold-rich" : "text-emerald-700",
      icon: Hotel,
    },
    {
      label: "Yield spread",
      value: fmtINR(yieldSpread),
      detail: "Gap between strongest and weakest RevPAR",
      tone: yieldSpread > 0 ? "text-brand-text-1" : "text-brand-text-3",
      icon: Percent,
    },
    {
      label: "Receivables pressure",
      value: `${receivablesPressure}%`,
      detail: "Outstanding balance as a share of scoped revenue",
      tone: receivablesPressure >= 10 ? "text-red-700" : "text-emerald-700",
      icon: ReceiptText,
    },
    {
      label: "Ancillary yield",
      value: fmtINR(ancillaryPerOccupiedRoom),
      detail: "F&B and events revenue per occupied room",
      tone: "text-brand-green-800",
      icon: WalletCards,
    },
    {
      label: "Room monetization",
      value: totalRooms ? pct((occupiedRooms / totalRooms) * 100) : "0%",
      detail: `${occupiedRooms} occupied out of ${totalRooms} available rooms`,
      tone: "text-brand-text-1",
      icon: Banknote,
    },
  ];

  return (
    <DataPanel className="p-5 lg:p-6">
      <PanelHeader title="Finance Pulse" subtitle="Concentration, opportunity, yield gap, and collection pressure" />
      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {pulse.map(({ label, value, detail, tone, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-brand-border-soft bg-brand-ivory p-4 shadow-premium-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="m-0 text-[11px] font-bold uppercase tracking-wider text-brand-text-3">{label}</p>
                <p className={`m-0 mt-1 text-xl font-black tabular-nums ${tone}`}>{value}</p>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-surface-2 text-brand-text-2">
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <p className="m-0 mt-3 truncate text-xs font-semibold text-brand-text-3">{detail}</p>
          </div>
        ))}
      </div>
    </DataPanel>
  );
}

function PropertyRiskBoard({ properties }: { properties: FinanceProperty[] }) {
  const avgRevpar = properties.length ? properties.reduce((sum, property) => sum + property.revpar, 0) / properties.length : 0;
  const rows = [...properties]
    .map(property => {
      const nonRoomRevenue = property.fnbRev + property.eventsRev;
      const nonRoomShare = property.totalRev ? Math.round((nonRoomRevenue / property.totalRev) * 100) : 0;
      const riskScore =
        (property.occ < 60 ? 35 : property.occ < 75 ? 18 : 0) +
        (avgRevpar && property.revpar < avgRevpar * 0.85 ? 28 : 0) +
        (nonRoomShare < 20 ? 15 : 0) +
        (property.totalRev === 0 ? 22 : 0);
      const cue = riskScore >= 55
        ? "Immediate yield review"
        : riskScore >= 30
        ? "Monitor pricing and mix"
        : "Healthy operating range";
      return { ...property, nonRoomShare, riskScore, cue };
    })
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 6);

  return (
    <DataPanel className="overflow-hidden">
      <div className="border-b border-brand-border-soft/70 bg-brand-champagne/55 p-5 sm:p-6">
        <PanelHeader title="Property Risk Board" subtitle="Properties ranked by occupancy, RevPAR, and revenue-mix pressure" />
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No risk signals yet" body="Property risk signals will appear after finance data is available." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse">
            <thead>
              <tr>
                {["Property", "Risk", "Occ", "RevPAR", "Non-room mix", "Cue"].map(header => (
                  <th key={header} className={`premium-table-header ${header === "Cue" || header === "Property" ? "text-left" : "text-right"}`}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((property, index) => {
                const riskTone = property.riskScore >= 55
                  ? "text-red-700"
                  : property.riskScore >= 30
                  ? "text-brand-gold-rich"
                  : "text-brand-green-800";
                return (
                  <tr key={property.id} className={`premium-table-row ${index % 2 === 0 ? "bg-brand-ivory" : "bg-brand-surface-2"}`}>
                    <td className="premium-table-cell">
                      <div className="flex items-center gap-2.5">
                        <AlertTriangle className={`h-3.5 w-3.5 ${riskTone}`} />
                        <span className="font-black text-brand-text-1">{property.name}</span>
                      </div>
                    </td>
                    <td className={`premium-table-cell text-right font-black tabular-nums ${riskTone}`}>{property.riskScore}</td>
                    <td className="premium-table-cell text-right font-bold tabular-nums text-brand-text-2">{pct(property.occ)}</td>
                    <td className="premium-table-cell text-right font-bold tabular-nums text-brand-text-2">{fmtINR(property.revpar)}</td>
                    <td className="premium-table-cell text-right font-bold tabular-nums text-brand-text-2">{property.nonRoomShare}%</td>
                    <td className="premium-table-cell text-left text-xs font-semibold text-brand-text-3">{property.cue}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </DataPanel>
  );
}

function RevenueTrend({ data }: { data: DashboardPayload["financeTrend"] }) {
  return (
    <DataPanel className="flex min-h-[390px] flex-col p-5 lg:p-6">
      <PanelHeader title="Revenue Runway" subtitle="Total, room, F&B, and event revenue over the latest reporting dates" />
      <div className="mt-6 min-h-[300px] flex-1">
        {data.length === 0 ? (
          <EmptyState title="No revenue timeline" body="Finance trend appears after dated revenue entries are available." />
        ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={300}>
            <AreaChart data={data} margin={{ top: 8, right: 14, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="financeGold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C8AC61" stopOpacity={0.32} />
                  <stop offset="95%" stopColor="#C8AC61" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="financeGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#055C4C" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#055C4C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(83,65,28,0.12)" vertical={false} />
              <XAxis dataKey="date" tickFormatter={compactDate} tick={{ fontSize: 11, fill: "#7D7463", fontFamily: "var(--font-inter)" }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={fmtINR} tick={{ fontSize: 11, fill: "#7D7463", fontFamily: "var(--font-inter)" }} tickLine={false} axisLine={false} width={72} />
              <Tooltip formatter={(value) => fmtINR(Number(value))} labelFormatter={(label) => compactDate(String(label))} contentStyle={{ borderRadius: "10px", border: "1px solid #D3BF8A", background: "#FFFDF7", fontFamily: "var(--font-inter)", fontSize: "12px", boxShadow: "var(--shadow-premium-popover)" }} />
              <Area type="monotone" dataKey="totalRevenue" name="Total" stroke="#C8AC61" strokeWidth={3} fill="url(#financeGold)" dot={false} />
              <Area type="monotone" dataKey="roomRevenue" name="Rooms" stroke="#055C4C" strokeWidth={2.2} fill="url(#financeGreen)" dot={false} />
              <Area type="monotone" dataKey="fnbRevenue" name="F&B" stroke="#0F7069" strokeWidth={2} fill="transparent" dot={false} />
              <Area type="monotone" dataKey="eventsRevenue" name="Events" stroke="#9F7731" strokeWidth={2} fill="transparent" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </DataPanel>
  );
}

function RevenueMix({ data }: { data: DashboardPayload["revenueMix"] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const enriched = data.map((item, index) => ({
    ...item,
    color: MIX_COLORS[index % MIX_COLORS.length],
    share: total ? Math.round((item.value / total) * 100) : 0,
  }));

  return (
    <DataPanel className="p-5 lg:p-6">
      <PanelHeader title="Revenue Mix" subtitle="Latest revenue by stream" />
      {enriched.length === 0 ? (
        <EmptyState title="No channel mix yet" body="Room, F&B, events, adventure, and other revenue will appear here." />
      ) : (
        <div className="mt-5 grid gap-5">
          <div className="mx-auto h-[190px] w-[190px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <PieChart>
                <Pie data={enriched} cx="50%" cy="50%" innerRadius={64} outerRadius={92} dataKey="value" paddingAngle={3}>
                  {enriched.map(item => <Cell key={item.name} fill={item.color} />)}
                </Pie>
                <Tooltip formatter={(value) => fmtINR(Number(value))} contentStyle={{ borderRadius: "10px", border: "1px solid #D3BF8A", background: "#FFFDF7", fontFamily: "var(--font-inter)", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-3">
            {enriched.map(item => (
              <div key={item.name} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: item.color }} />
                    <span className="truncate text-[13px] font-bold text-brand-text-2">{item.name}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-brand-surface-2">
                    <div className="h-full rounded-full" style={{ width: `${item.share}%`, background: item.color }} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="m-0 text-sm font-black tabular-nums text-brand-text-1">{fmtINR(item.value)}</p>
                  <p className="m-0 text-[11px] font-bold text-brand-text-3">{item.share}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DataPanel>
  );
}

function EntityHealth({ data }: { data: DashboardPayload["entitySummary"] }) {
  return (
    <DataPanel className="p-5 lg:p-6">
      <PanelHeader title="Entity Health" subtitle="Revenue and average occupancy by legal entity" />
      <div className="mt-6 min-h-[220px]">
        {data.length === 0 ? (
          <EmptyState title="No entity finance data" body="Entity totals will appear after finance data is available." />
        ) : (
          <ResponsiveContainer width="100%" height={230} minWidth={1} minHeight={1}>
            <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(83,65,28,0.12)" vertical={false} />
              <XAxis dataKey="entity" tickFormatter={entityLabel} tick={{ fontSize: 11, fill: "#7D7463", fontFamily: "var(--font-inter)" }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="revenue" tickFormatter={fmtINR} tick={{ fontSize: 11, fill: "#7D7463", fontFamily: "var(--font-inter)" }} tickLine={false} axisLine={false} width={72} />
              <YAxis yAxisId="occ" orientation="right" tickFormatter={pct} tick={{ fontSize: 11, fill: "#7D7463", fontFamily: "var(--font-inter)" }} tickLine={false} axisLine={false} width={42} />
              <Tooltip labelFormatter={(label) => entityLabel(String(label ?? ""))} formatter={(value, name) => name === "Avg occupancy" ? pct(Number(value)) : fmtINR(Number(value))} contentStyle={{ borderRadius: "10px", border: "1px solid #D3BF8A", background: "#FFFDF7", fontFamily: "var(--font-inter)", fontSize: "12px" }} />
              <Bar yAxisId="revenue" dataKey="totalRevenue" name="Revenue" fill="#C8AC61" radius={[5, 5, 0, 0]} maxBarSize={58} />
              <Bar yAxisId="occ" dataKey="avgOccupancy" name="Avg occupancy" fill="#055C4C" radius={[5, 5, 0, 0]} maxBarSize={58} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </DataPanel>
  );
}

function PropertyYieldBoard({ properties }: { properties: FinanceProperty[] }) {
  const [sortKey, setSortKey] = useState<keyof FinanceProperty>("totalRev");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => [...properties].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    const diff = typeof av === "number" && typeof bv === "number"
      ? av - bv
      : String(av).localeCompare(String(bv));
    return sortDir === "desc" ? -diff : diff;
  }), [properties, sortDir, sortKey]);

  function toggle(key: keyof FinanceProperty) {
    if (sortKey === key) setSortDir(value => value === "desc" ? "asc" : "desc");
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const headers: Array<{ key: keyof FinanceProperty; label: string; right?: boolean }> = [
    { key: "name", label: "Property" },
    { key: "entity", label: "Entity" },
    { key: "occ", label: "Occ", right: true },
    { key: "roomRev", label: "Rooms", right: true },
    { key: "fnbRev", label: "F&B", right: true },
    { key: "eventsRev", label: "Events", right: true },
    { key: "totalRev", label: "Total", right: true },
    { key: "adr", label: "ADR", right: true },
    { key: "revpar", label: "RevPAR", right: true },
  ];

  return (
    <DataPanel className="overflow-hidden">
      <div className="border-b border-brand-border-soft/70 bg-brand-champagne/55 p-5 sm:p-6">
        <PanelHeader
          title="Property Yield Board"
          subtitle="Sortable operational finance view for revenue, occupancy, ADR, and RevPAR"
          action={<span className="badge-amber">{sorted.length} rows</span>}
        />
      </div>
      {sorted.length === 0 ? (
        <EmptyState title="No property finance rows" body="Add finance data to populate the property yield board." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1060px] border-collapse">
            <thead>
              <tr>
                {headers.map(header => {
                  const active = sortKey === header.key;
                  const Icon = active && sortDir === "asc" ? ChevronUp : ChevronDown;
                  return (
                    <th
                      key={header.key}
                      onClick={() => toggle(header.key)}
                      className={`premium-table-header ${header.right ? "text-right" : "text-left"}`}
                    >
                      <span className={`inline-flex items-center gap-1.5 ${header.right ? "justify-end w-full" : ""}`}>
                        {header.label}
                        <Icon className={`h-3 w-3 ${active ? "text-brand-gold-rich" : "text-brand-border"}`} />
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {sorted.map((property, index) => {
                const margin = property.totalRev ? Math.round(((property.totalRev - property.roomRev) / property.totalRev) * 100) : 0;
                return (
                  <tr key={property.id} className={`premium-table-row ${index % 2 === 0 ? "bg-brand-ivory" : "bg-brand-surface-2"}`}>
                    <td className="premium-table-cell">
                      <div className="flex items-center gap-2.5">
                        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${property.status === "attention" ? "bg-red-600" : property.status === "watch" ? "bg-brand-gold" : "bg-brand-green-800"}`} />
                        <div className="min-w-0">
                          <p className="m-0 truncate text-sm font-black text-brand-text-1">{property.name}</p>
                          <p className="m-0 mt-0.5 text-[11px] font-semibold text-brand-text-3">{property.rooms} rooms</p>
                        </div>
                      </div>
                    </td>
                    <td className="premium-table-cell text-brand-text-2">{entityLabel(property.entity)}</td>
                    <td className="premium-table-cell text-right tabular-nums">
                      <span className={`font-black ${property.occ < 60 ? "text-red-700" : property.occ < 75 ? "text-brand-gold-rich" : "text-brand-green-800"}`}>{pct(property.occ)}</span>
                    </td>
                    <td className="premium-table-cell text-right tabular-nums text-brand-text-2">{fmtINR(property.roomRev)}</td>
                    <td className="premium-table-cell text-right tabular-nums text-brand-text-2">{fmtINR(property.fnbRev)}</td>
                    <td className="premium-table-cell text-right tabular-nums text-brand-text-2">{fmtINR(property.eventsRev)}</td>
                    <td className="premium-table-cell bg-brand-gold/10 text-right font-black tabular-nums text-brand-green-900">{fmtINR(property.totalRev)}</td>
                    <td className="premium-table-cell text-right tabular-nums text-brand-text-2">{fmtINR(property.adr)}</td>
                    <td className="premium-table-cell text-right tabular-nums">
                      <div className="flex items-center justify-end gap-1.5">
                        {margin >= 35 ? <ArrowUpRight className="h-3.5 w-3.5 text-brand-green-800" /> : <ArrowDownRight className="h-3.5 w-3.5 text-brand-gold-rich" />}
                        <span className="font-bold text-brand-text-1">{fmtINR(property.revpar)}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </DataPanel>
  );
}

function TallyImports({ imports }: { imports: DashboardPayload["latestTallyImports"] }) {
  return (
    <DataPanel className="p-5 lg:p-6">
      <PanelHeader title="Import Reconciliation" subtitle="Latest finance files received by property" />
      {imports.length === 0 ? (
        <EmptyState title="No finance import metadata" body="When finance file details are available, import status will be listed here." />
      ) : (
        <div className="mt-5 grid gap-3">
          {imports.map(item => (
            <div key={`${item.property}-${item.fileName}-${item.receivedAt}`} className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-brand-border-soft bg-brand-ivory p-3 shadow-premium-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green-900 text-brand-gold">
                <FileCheck2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="m-0 truncate text-[13px] font-black text-brand-text-1">{item.fileName}</p>
                <p className="m-0 mt-0.5 truncate text-[11px] font-semibold text-brand-text-3">{item.property} - finance file</p>
              </div>
              <span className="rounded-lg border border-brand-border-soft bg-brand-surface-2 px-2.5 py-1 text-xs font-bold text-brand-text-3">
                {item.receivedAt}
              </span>
            </div>
          ))}
        </div>
      )}
    </DataPanel>
  );
}

function NoDataLedger() {
  return (
    <DataPanel className="p-8">
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-green-900 text-brand-gold">
          <FileText className="h-6 w-6" />
        </div>
        <h2 className="m-0 font-display text-2xl font-bold text-brand-text-1">Finance data is not available yet</h2>
        <p className="m-0 mt-3 text-sm leading-relaxed text-brand-text-3">
          Once finance data is available, this page will show revenue runway, entity health, property yield, receivables, and import reconciliation.
        </p>
      </div>
    </DataPanel>
  );
}

export default function FinanceModule({ role, data }: { role: string; data: DashboardPayload | null }) {
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState<EntityFilter>("all");
  const allProperties = data?.financeProperties ?? FINANCE_PROPERTIES;
  const isGM = role.startsWith("GM_");
  const gmProperty = role === "GM_SILVASSA" ? "treat-silvassa" : role === "GM_DAHANU" ? "treat-gokarna" : role === "GM_KUMBHALGARH" ? "kumbhalgarh" : null;

  const properties = useMemo(() => {
    let rows = allProperties;
    if (isGM && gmProperty) rows = rows.filter(row => row.id === gmProperty);
    if (!isGM && propertyFilter !== "all") rows = rows.filter(row => row.id === propertyFilter);
    if (!isGM && entityFilter !== "all") rows = rows.filter(row => row.entity === entityFilter);
    return rows;
  }, [allProperties, entityFilter, gmProperty, isGM, propertyFilter]);

  const totalRevenue = properties.reduce((sum, property) => sum + property.totalRev, 0);
  const totalRooms = properties.reduce((sum, property) => sum + property.rooms, 0);
  const occupiedRooms = properties.reduce((sum, property) => sum + Math.round((property.rooms * property.occ) / 100), 0);
  const avgOccupancy = totalRooms ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
  const roomRevenue = properties.reduce((sum, property) => sum + property.roomRev, 0);
  const avgAdr = occupiedRooms ? Math.round(roomRevenue / occupiedRooms) : 0;
  const totalOutstanding = data?.financeKpis.outstandingReceivables ?? 0;
  const revenueChangePct = data?.financeKpis.revenueChangePct ?? 0;
  const hasFinanceData = properties.length > 0 || (data?.financeTrend.length ?? 0) > 0 || (data?.entitySummary.length ?? 0) > 0;

  return (
    <div className="flex w-full flex-col gap-5">
      <FinanceCommandHeader
        data={data}
        properties={allProperties}
        propertyFilter={propertyFilter}
        setPropertyFilter={setPropertyFilter}
        entityFilter={entityFilter}
        setEntityFilter={setEntityFilter}
        isGM={isGM}
      />

      {!hasFinanceData ? (
        <NoDataLedger />
      ) : (
        <>
          <ExecutiveMetrics
            properties={properties}
            totalRevenue={totalRevenue}
            avgOccupancy={avgOccupancy}
            avgAdr={avgAdr}
            totalOutstanding={totalOutstanding}
            totalRooms={totalRooms}
            occupiedRooms={occupiedRooms}
            revenueChangePct={revenueChangePct}
          />

          <FinanceDiagnostics
            properties={properties}
            totalRevenue={totalRevenue}
            totalOutstanding={totalOutstanding}
            revenueChangePct={revenueChangePct}
            freshnessHours={data?.analytics.systemHealth.financeFreshnessHours}
            staleProperties={data?.analytics.systemHealth.staleFinanceProperties ?? 0}
          />

          <FinancePulse
            properties={properties}
            totalRevenue={totalRevenue}
            totalOutstanding={totalOutstanding}
            totalRooms={totalRooms}
            occupiedRooms={occupiedRooms}
          />

          <PropertyRiskBoard properties={properties} />

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
            <RevenueTrend data={data?.financeTrend ?? []} />
            <RevenueMix data={data?.revenueMix ?? []} />
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <EntityHealth data={data?.entitySummary ?? []} />
            <TallyImports imports={data?.latestTallyImports ?? []} />
          </div>

          <PropertyYieldBoard properties={properties} />
        </>
      )}
    </div>
  );
}
