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
    "h-10 rounded-xl border border-brand-gold/35 bg-brand-green-950/70 px-3 text-[13px] font-bold text-white outline-none transition focus:border-brand-gold";

  return (
    <div className="flex flex-wrap gap-2">
      <select value={propertyFilter} onChange={event => setPropertyFilter(event.target.value)} className={selectClass}>
        <option value="all" className="bg-brand-green-950 text-white">All properties</option>
        {properties.map(property => (
          <option key={property.id} value={property.id} className="bg-brand-green-950 text-white">{property.name}</option>
        ))}
      </select>
      <select value={entityFilter} onChange={event => setEntityFilter(event.target.value as EntityFilter)} className={selectClass}>
        <option value="all" className="bg-brand-green-950 text-white">All entities</option>
        <option value="mundra" className="bg-brand-green-950 text-white">Mundra Hotels & Resorts</option>
        <option value="tirupati" className="bg-brand-green-950 text-white">Tirupati Shelters</option>
        <option value="ras" className="bg-brand-green-950 text-white">RAS Resorts</option>
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
  totalRevenue,
  avgOccupancy,
  totalOutstanding,
}: {
  data: DashboardPayload | null;
  properties: FinanceProperty[];
  propertyFilter: string;
  setPropertyFilter: (value: string) => void;
  entityFilter: EntityFilter;
  setEntityFilter: (value: EntityFilter) => void;
  isGM: boolean;
  totalRevenue: number;
  avgOccupancy: number;
  totalOutstanding: number;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-brand-gold/30 bg-brand-green-950 shadow-premium-lg">
      <div className="border-b border-brand-gold/20 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-gold/25 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-gold">
              <Landmark className="h-3.5 w-3.5" />
              Finance command center
            </div>
            <h1 className="m-0 font-display text-2xl font-bold text-white sm:text-3xl">Finance Intelligence</h1>
            <p className="m-0 mt-2 max-w-2xl text-sm leading-relaxed text-white/65">
              Revenue, occupancy, receivables, and Tally import health across the Treat portfolio.
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

      <div className="grid grid-cols-1 divide-y divide-brand-gold/20 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {[
          { label: "Scoped revenue", value: fmtINR(totalRevenue), icon: WalletCards },
          { label: "Portfolio occupancy", value: pct(avgOccupancy), icon: Percent },
          { label: "Open receivables", value: fmtINR(totalOutstanding), icon: ReceiptText },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
            <div>
              <p className="m-0 text-[11px] font-bold uppercase tracking-wider text-white/45">{label}</p>
              <p className="m-0 mt-1 text-xl font-black tabular-nums text-brand-gold">{value}</p>
            </div>
            <Icon className="h-5 w-5 text-brand-gold/70" />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 bg-black/16 px-5 py-3 text-xs sm:px-6">
        <span className="inline-flex items-center gap-2 font-semibold text-white/60">
          <Sparkles className="h-3.5 w-3.5 text-brand-gold" />
          {data?.configured ? "Connected to Supabase finance_records" : "Waiting for Supabase environment variables"}
        </span>
        <span className="font-bold text-white/45">{properties.length} property records in current scope</span>
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
}: {
  properties: FinanceProperty[];
  totalRevenue: number;
  avgOccupancy: number;
  avgAdr: number;
  totalOutstanding: number;
  totalRooms: number;
  occupiedRooms: number;
}) {
  const revpar = properties.length ? Math.round(properties.reduce((sum, property) => sum + property.revpar, 0) / properties.length) : 0;
  const roomRevenue = properties.reduce((sum, property) => sum + property.roomRev, 0);
  const roomShare = totalRevenue ? Math.round((roomRevenue / totalRevenue) * 100) : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricTile label="Total revenue" value={fmtINR(totalRevenue)} sub={`${properties.length} active property records`} icon={CircleDollarSign} tone="gold" />
      <MetricTile label="Occupancy" value={pct(avgOccupancy)} sub={`${occupiedRooms}/${totalRooms} rooms occupied`} icon={Hotel} tone="green" />
      <MetricTile label="ADR / RevPAR" value={`${fmtINR(avgAdr)} / ${fmtINR(revpar)}`} sub={`${roomShare}% revenue from rooms`} icon={Banknote} tone="teal" />
      <MetricTile label="Receivables" value={fmtINR(totalOutstanding)} sub="Outstanding across imported records" icon={ReceiptText} tone={totalOutstanding > 0 ? "red" : "green"} />
    </div>
  );
}

function RevenueTrend({ data }: { data: DashboardPayload["financeTrend"] }) {
  return (
    <DataPanel className="flex min-h-[390px] flex-col p-5 lg:p-6">
      <PanelHeader title="Revenue Runway" subtitle="Total, room, F&B, and event revenue over the latest imported dates" />
      <div className="mt-6 min-h-[300px] flex-1">
        {data.length === 0 ? (
          <EmptyState title="No revenue timeline" body="Finance trend appears after dated finance_records rows are imported." />
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
      <PanelHeader title="Revenue Mix" subtitle="Latest imported revenue by stream" />
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
          <EmptyState title="No entity finance data" body="Entity totals will appear after finance records are inserted." />
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
        <EmptyState title="No property finance rows" body="Insert finance_records rows to populate the property yield board." />
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
      <PanelHeader title="Import Reconciliation" subtitle="Latest Tally files received by property" />
      {imports.length === 0 ? (
        <EmptyState title="No Tally import metadata" body="When finance_records include tally file metadata, import status will be listed here." />
      ) : (
        <div className="mt-5 grid gap-3">
          {imports.map(item => (
            <div key={`${item.property}-${item.fileName}-${item.receivedAt}`} className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-brand-border-soft bg-brand-ivory p-3 shadow-premium-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green-900 text-brand-gold">
                <FileCheck2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="m-0 truncate text-[13px] font-black text-brand-text-1">{item.fileName}</p>
                <p className="m-0 mt-0.5 truncate text-[11px] font-semibold text-brand-text-3">{item.property} - {item.source}</p>
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
        <h2 className="m-0 font-display text-2xl font-bold text-brand-text-1">Finance records are not available yet</h2>
        <p className="m-0 mt-3 text-sm leading-relaxed text-brand-text-3">
          Once Supabase finance_records are imported, this page will show revenue runway, entity health, property yield, receivables, and Tally reconciliation.
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
  const avgAdr = properties.length ? Math.round(properties.reduce((sum, property) => sum + property.adr, 0) / properties.length) : 0;
  const totalOutstanding = data?.financeKpis.outstandingReceivables ?? 0;
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
        totalRevenue={totalRevenue}
        avgOccupancy={avgOccupancy}
        totalOutstanding={totalOutstanding}
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
          />

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
