"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Key,
  ChevronDown,
  ChevronUp,
  Database,
  FileText,
  Wallet,
  Coins,
  Receipt,
} from "lucide-react";
import type { DashboardPayload } from "@/lib/dashboardData";
import { FINANCE_PROPERTIES, type EntityFilter, type FinanceProperty } from "@/lib/financeData";

function fmtINR(value: number) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value.toLocaleString("en-IN")}`;
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

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="p-8 text-center text-brand-text-3">
      <Database className="w-8 h-8 text-brand-border mx-auto mb-3" />
      <p className="text-sm font-bold text-brand-text-1 mb-1">{title}</p>
      <p className="text-[13px] m-0">{body}</p>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h2 className="text-sm font-bold text-brand-text-1 m-0">{title}</h2>
      {subtitle && <p className="text-xs text-brand-text-3 mt-1 m-0">{subtitle}</p>}
    </div>
  );
}

function KpiCard({ label, value, sub, icon: Icon }: {
  label: string;
  value: string;
  sub: string;
  icon: typeof Wallet;
}) {
  const match = value.match(/^([^0-9.-]*)([0-9.,]+)([^0-9]*)$/);
  const prefix = match ? match[1].trim() : "";
  const num = match ? match[2] : value;
  const suffix = match ? match[3].trim() : "";

  return (
    <div className="glass-card flex flex-col justify-between overflow-hidden cursor-default group">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[15px] font-medium text-brand-text-2 mb-3">{label}</p>
            <div className="flex items-baseline gap-1 leading-none">
              {prefix && <span className="text-2xl font-bold text-brand-text-3">{prefix}</span>}
              <span className="text-4xl xl:text-[42px] font-bold text-brand-text-1 tabular-nums tracking-tight">{num}</span>
              {suffix && <span className="text-xl font-bold text-brand-text-3 ml-0.5">{suffix}</span>}
            </div>
          </div>
          <div className="w-[46px] h-[46px] rounded-[14px] bg-brand-green-900 flex items-center justify-center shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
            <Icon className="w-5 h-5 text-brand-gold" strokeWidth={2.5} />
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[13px] text-brand-text-3 font-medium truncate">{sub}</span>
        </div>
      </div>
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
  return (
    <div className="flex gap-2 flex-wrap">
      <select
        value={propertyFilter}
        onChange={event => setPropertyFilter(event.target.value)}
        className="px-3 py-2 rounded-lg border border-brand-border bg-white text-brand-text-1 text-[13px] outline-none cursor-pointer focus:border-brand-gold focus:ring-1 focus:ring-brand-gold shadow-sm"
      >
        <option value="all">All Properties</option>
        {properties.map(property => (
          <option key={property.id} value={property.id}>{property.name}</option>
        ))}
      </select>
      <select
        value={entityFilter}
        onChange={event => setEntityFilter(event.target.value as EntityFilter)}
        className="px-3 py-2 rounded-lg border border-brand-border bg-white text-brand-text-1 text-[13px] outline-none cursor-pointer focus:border-brand-gold focus:ring-1 focus:ring-brand-gold shadow-sm"
      >
        <option value="all">All Entities</option>
        <option value="mundra">Mundra Hotels & Resorts</option>
        <option value="tirupati">Tirupati Shelters</option>
        <option value="ras">RAS Resorts</option>
      </select>
    </div>
  );
}

function RevenueTrend({ data }: { data: DashboardPayload["financeTrend"] }) {
  return (
    <div className="glass-card p-5 lg:p-6 flex flex-col h-full">
      <SectionHeader title="Revenue Trend" subtitle="From finance_records grouped by record_date" />
      <div className="flex-1 mt-6 min-h-[260px]">
        {data.length === 0 ? (
          <EmptyState title="No finance records" body="Add finance_records rows to populate the revenue trend." />
        ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={260}>
            <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--color-brand-text-3)", fontFamily: "var(--font-inter)" }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={fmtINR} tick={{ fontSize: 11, fill: "var(--color-brand-text-3)", fontFamily: "var(--font-inter)" }} tickLine={false} axisLine={false} width={60} />
              <Tooltip formatter={(value) => fmtINR(Number(value))} contentStyle={{ borderRadius: "8px", border: "1px solid var(--color-brand-border)", fontFamily: "var(--font-inter)", fontSize: "12px" }} />
              <Line type="monotone" dataKey="totalRevenue" name="Total Revenue" stroke="#C9A96E" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="roomRevenue" name="Room Revenue" stroke="#1B4332" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="fnbRevenue" name="F&B Revenue" stroke="#2d6a4f" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function RevenueMix({ data }: { data: DashboardPayload["revenueMix"] }) {
  return (
    <div className="glass-card p-5 lg:p-6 flex flex-col h-full">
      <SectionHeader title="Revenue Mix" subtitle="Latest finance record per property" />
      <div className="flex-1 mt-4 flex items-center justify-center">
        {data.length === 0 ? (
          <EmptyState title="No revenue mix yet" body="Room, F&B, events, adventure, and other revenue will appear here." />
        ) : (
          <div className="flex flex-col items-center gap-6 w-full mt-2">
            <div className="w-[180px] h-[180px] shrink-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <PieChart>
                  <Pie data={data} cx="50%" cy="50%" innerRadius={58} outerRadius={88} dataKey="value" paddingAngle={2}>
                    {data.map(item => <Cell key={item.name} fill={item.color} />)}
                  </Pie>
                  <Tooltip formatter={(value) => fmtINR(Number(value))} contentStyle={{ borderRadius: "8px", border: "1px solid var(--color-brand-border)", fontFamily: "var(--font-inter)", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-3 w-full">
              {data.map(item => (
                <div key={item.name} className="flex justify-between items-center gap-3 text-[13px]">
                  <span className="flex items-center gap-2 text-brand-text-2 font-medium whitespace-nowrap">
                    <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: item.color }} />
                    {item.name}
                  </span>
                  <strong className="text-brand-text-1 tabular-nums whitespace-nowrap">{fmtINR(item.value)}</strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EntitySummary({ data }: { data: DashboardPayload["entitySummary"] }) {
  return (
    <div className="glass-card p-5 lg:p-6">
      <SectionHeader title="Entity Summary" subtitle="From finance_records.entity" />
      <div className="mt-6 min-h-[220px]">
        {data.length === 0 ? (
          <EmptyState title="No entity finance data" body="Entity totals will appear after finance records are inserted." />
        ) : (
          <ResponsiveContainer width="100%" height={220} minWidth={1} minHeight={1}>
            <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
              <XAxis dataKey="entity" tickFormatter={entityLabel} tick={{ fontSize: 11, fill: "var(--color-brand-text-3)", fontFamily: "var(--font-inter)" }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={fmtINR} tick={{ fontSize: 11, fill: "var(--color-brand-text-3)", fontFamily: "var(--font-inter)" }} tickLine={false} axisLine={false} width={60} />
              <Tooltip labelFormatter={(label) => entityLabel(String(label ?? ""))} formatter={(value) => fmtINR(Number(value))} contentStyle={{ borderRadius: "8px", border: "1px solid var(--color-brand-border)", fontFamily: "var(--font-inter)", fontSize: "12px" }} />
              <Bar dataKey="totalRevenue" name="Total Revenue" fill="#C9A96E" radius={[4, 4, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function FinancePropertyTable({ properties }: { properties: FinanceProperty[] }) {
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
    { key: "rooms", label: "Rooms", right: true },
    { key: "occ", label: "Occ %", right: true },
    { key: "roomRev", label: "Room Rev", right: true },
    { key: "fnbRev", label: "F&B", right: true },
    { key: "eventsRev", label: "Events", right: true },
    { key: "totalRev", label: "Total", right: true },
    { key: "adr", label: "ADR", right: true },
    { key: "revpar", label: "RevPAR", right: true },
  ];

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-brand-border-soft/60 bg-white/50">
        <SectionHeader title="Property Finance Records" subtitle="Latest finance record per property" />
      </div>
      {sorted.length === 0 ? (
        <EmptyState title="No property finance rows" body="Insert finance_records rows to populate this table." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-brand-surface-2 border-b border-brand-border">
              <tr>
                {headers.map(header => {
                  const active = sortKey === header.key;
                  const Icon = active && sortDir === "asc" ? ChevronUp : ChevronDown;
                  return (
                    <th
                      key={header.key}
                      onClick={() => toggle(header.key)}
                      className={`px-4 py-3 text-[10px] sm:text-xs font-semibold text-brand-text-3 uppercase tracking-wider cursor-pointer select-none whitespace-nowrap ${header.right ? "text-right" : "text-left"}`}
                    >
                      <span className={`inline-flex items-center gap-1.5 ${header.right ? "justify-end w-full" : ""}`}>
                        {header.label}
                        <Icon className={`w-3 h-3 ${active ? "text-brand-gold" : "text-brand-border"}`} />
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {sorted.map((property, index) => (
                <tr key={property.id} className={`premium-table-row ${index % 2 === 0 ? "bg-white" : "bg-brand-surface-2"}`}>
                  <td className="premium-table-cell font-bold text-brand-text-1">{property.name}</td>
                  <td className="premium-table-cell text-brand-text-2">{entityLabel(property.entity)}</td>
                  <td className="premium-table-cell text-right tabular-nums">{property.rooms}</td>
                  <td className="premium-table-cell text-right tabular-nums text-emerald-700 font-medium">{pct(property.occ)}</td>
                  <td className="premium-table-cell text-right tabular-nums text-brand-text-2">{fmtINR(property.roomRev)}</td>
                  <td className="premium-table-cell text-right tabular-nums text-brand-text-2">{fmtINR(property.fnbRev)}</td>
                  <td className="premium-table-cell text-right tabular-nums text-brand-text-2">{fmtINR(property.eventsRev)}</td>
                  <td className="premium-table-cell text-right tabular-nums font-bold text-brand-green-900 bg-brand-gold/5">{fmtINR(property.totalRev)}</td>
                  <td className="premium-table-cell text-right tabular-nums text-brand-text-2">{fmtINR(property.adr)}</td>
                  <td className="premium-table-cell text-right tabular-nums text-brand-text-2">{fmtINR(property.revpar)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TallyImports({ imports }: { imports: DashboardPayload["latestTallyImports"] }) {
  return (
    <div className="glass-card p-5 lg:p-6">
      <SectionHeader title="Latest Tally Imports" subtitle="From finance_records.tally_file_name and tally_received_at" />
      {imports.length === 0 ? (
        <EmptyState title="No Tally import metadata" body="When finance_records include tally file metadata, it will be listed here." />
      ) : (
        <div className="flex flex-col gap-3 mt-5">
          {imports.map(item => (
            <div key={`${item.property}-${item.fileName}-${item.receivedAt}`} className="flex items-center gap-4 p-3 rounded-xl border border-brand-border-soft bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-emerald-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-brand-text-1 truncate m-0">{item.fileName}</p>
                <p className="text-[11px] text-brand-text-3 m-0 mt-0.5 truncate">{item.property} · {item.source}</p>
              </div>
              <span className="text-xs font-medium text-brand-text-3 whitespace-nowrap bg-brand-surface-2 px-2.5 py-1 rounded-md border border-brand-border-soft">
                {item.receivedAt}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FinanceModule({ role, data }: { role: string; data: DashboardPayload | null }) {
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState<EntityFilter>("all");
  const allProperties = data?.financeProperties ?? FINANCE_PROPERTIES;
  const isGM = role.startsWith("GM_");
  const gmProperty = role === "GM_SILVASSA" ? "silvassa" : role === "GM_DAHANU" ? "dahanu" : role === "GM_KUMBHALGARH" ? "kumbhalgarh" : null;

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

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="glass-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 anim-fade-up">
        <SectionHeader
          title="Finance Intelligence"
          subtitle={data?.configured ? "Connected to Supabase finance_records" : "Waiting for Supabase environment variables"}
        />
        {!isGM && (
          <PropertyFilters
            properties={allProperties}
            propertyFilter={propertyFilter}
            setPropertyFilter={setPropertyFilter}
            entityFilter={entityFilter}
            setEntityFilter={setEntityFilter}
          />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 anim-fade-up" style={{ animationDelay: "50ms" }}>
        <KpiCard label="Total Revenue" value={fmtINR(totalRevenue)} sub={`${properties.length} property records`} icon={Wallet} />
        <KpiCard label="Occupancy" value={pct(avgOccupancy)} sub={`${occupiedRooms}/${totalRooms} rooms`} icon={Key} />
        <KpiCard label="ADR" value={fmtINR(avgAdr)} sub="Average daily rate" icon={Coins} />
        <KpiCard label="Receivables" value={fmtINR(totalOutstanding)} sub="Outstanding receivables" icon={Receipt} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 anim-fade-up" style={{ animationDelay: "100ms" }}>
        <RevenueTrend data={data?.financeTrend ?? []} />
        <RevenueMix data={data?.revenueMix ?? []} />
      </div>

      <div className="anim-fade-up" style={{ animationDelay: "150ms" }}>
        <EntitySummary data={data?.entitySummary ?? []} />
      </div>
      
      <div className="anim-fade-up" style={{ animationDelay: "200ms" }}>
        <FinancePropertyTable properties={properties} />
      </div>
      
      <div className="anim-fade-up" style={{ animationDelay: "250ms" }}>
        <TallyImports imports={data?.latestTallyImports ?? []} />
      </div>
    </div>
  );
}
