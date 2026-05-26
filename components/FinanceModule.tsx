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
  Building2,
  ChevronDown,
  ChevronUp,
  Database,
  FileText,
  IndianRupee,
  Landmark,
  PieChart as PieIcon,
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
    <div style={{ padding: "28px", textAlign: "center", color: "var(--text-3)" }}>
      <Database size={24} color="var(--text-3)" style={{ margin: "0 auto 8px" }} />
      <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: 700, color: "var(--text-1)" }}>{title}</p>
      <p style={{ margin: 0, fontSize: "12px" }}>{body}</p>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h2 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-1)", margin: 0 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: "11.5px", color: "var(--text-3)", margin: "2px 0 0" }}>{subtitle}</p>}
    </div>
  );
}

function KpiCard({ label, value, sub, icon: Icon }: {
  label: string;
  value: string;
  sub: string;
  icon: typeof IndianRupee;
}) {
  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid var(--border)",
      borderRadius: "8px",
      padding: "16px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      minWidth: 0,
    }}>
      <div style={{
        width: "36px",
        height: "36px",
        borderRadius: "8px",
        background: "#1B4332",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon size={16} color="#C9A96E" />
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: "0 0 4px", fontSize: "10px", color: "var(--text-3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
        <p style={{ margin: 0, fontSize: "22px", color: "var(--text-1)", fontWeight: 800, lineHeight: 1 }}>{value}</p>
        <p style={{ margin: "4px 0 0", fontSize: "11px", color: "var(--text-3)" }}>{sub}</p>
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
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
      <select
        value={propertyFilter}
        onChange={event => setPropertyFilter(event.target.value)}
        style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border)", background: "#FFFFFF", color: "var(--text-1)", fontSize: "12px" }}
      >
        <option value="all">All Properties</option>
        {properties.map(property => (
          <option key={property.id} value={property.id}>{property.name}</option>
        ))}
      </select>
      <select
        value={entityFilter}
        onChange={event => setEntityFilter(event.target.value as EntityFilter)}
        style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border)", background: "#FFFFFF", color: "var(--text-1)", fontSize: "12px" }}
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
    <div className="glass-card" style={{ padding: "18px" }}>
      <SectionHeader title="Revenue Trend" subtitle="From finance_records grouped by record_date" />
      {data.length === 0 ? (
        <EmptyState title="No finance records" body="Add finance_records rows to populate the revenue trend." />
      ) : (
        <ResponsiveContainer width="100%" height={260} minWidth={1} minHeight={1}>
          <LineChart data={data} margin={{ top: 18, right: 20, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--text-3)" }} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={fmtINR} tick={{ fontSize: 11, fill: "var(--text-3)" }} tickLine={false} axisLine={false} width={72} />
            <Tooltip formatter={(value) => fmtINR(Number(value))} contentStyle={{ borderRadius: "8px", border: "1px solid var(--border)" }} />
            <Line type="monotone" dataKey="totalRevenue" name="Total Revenue" stroke="#C9A96E" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="roomRevenue" name="Room Revenue" stroke="#1B4332" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="fnbRevenue" name="F&B Revenue" stroke="#2d6a4f" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function RevenueMix({ data }: { data: DashboardPayload["revenueMix"] }) {
  return (
    <div className="glass-card" style={{ padding: "18px" }}>
      <SectionHeader title="Revenue Mix" subtitle="Latest finance record per property" />
      {data.length === 0 ? (
        <EmptyState title="No revenue mix yet" body="Room, F&B, events, adventure, and other revenue will appear here." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "18px", alignItems: "center" }}>
          <ResponsiveContainer width="100%" height={210} minWidth={1} minHeight={1}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={54} outerRadius={84} dataKey="value" paddingAngle={2}>
                {data.map(item => <Cell key={item.name} fill={item.color} />)}
              </Pie>
              <Tooltip formatter={(value) => fmtINR(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {data.map(item => (
              <div key={item.name} style={{ display: "flex", justifyContent: "space-between", gap: "12px", fontSize: "12px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "7px", color: "var(--text-2)" }}>
                  <span style={{ width: "9px", height: "9px", borderRadius: "3px", background: item.color }} />
                  {item.name}
                </span>
                <strong style={{ color: "var(--text-1)" }}>{fmtINR(item.value)}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EntitySummary({ data }: { data: DashboardPayload["entitySummary"] }) {
  return (
    <div className="glass-card" style={{ padding: "18px" }}>
      <SectionHeader title="Entity Summary" subtitle="From finance_records.entity" />
      {data.length === 0 ? (
        <EmptyState title="No entity finance data" body="Entity totals will appear after finance records are inserted." />
      ) : (
        <ResponsiveContainer width="100%" height={220} minWidth={1} minHeight={1}>
          <BarChart data={data} margin={{ top: 14, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
            <XAxis dataKey="entity" tickFormatter={entityLabel} tick={{ fontSize: 10, fill: "var(--text-3)" }} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={fmtINR} tick={{ fontSize: 11, fill: "var(--text-3)" }} tickLine={false} axisLine={false} width={72} />
            <Tooltip labelFormatter={(label) => entityLabel(String(label ?? ""))} formatter={(value) => fmtINR(Number(value))} />
            <Bar dataKey="totalRevenue" name="Total Revenue" fill="#C9A96E" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
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
    <div className="glass-card" style={{ overflow: "hidden" }}>
      <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border)" }}>
        <SectionHeader title="Property Finance Records" subtitle="Latest finance record per property" />
      </div>
      {sorted.length === 0 ? (
        <EmptyState title="No property finance rows" body="Insert finance_records rows to populate this table." />
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ background: "var(--surface-2)" }}>
                {headers.map(header => {
                  const active = sortKey === header.key;
                  const Icon = active && sortDir === "asc" ? ChevronUp : ChevronDown;
                  return (
                    <th
                      key={header.key}
                      onClick={() => toggle(header.key)}
                      style={{
                        padding: "9px 12px",
                        textAlign: header.right ? "right" : "left",
                        fontSize: "10px",
                        color: "var(--text-3)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                        {header.label}
                        <Icon size={10} color={active ? "var(--gold)" : "#CBD5E1"} />
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {sorted.map((property, index) => (
                <tr key={property.id} style={{ background: index % 2 === 0 ? "#FFFFFF" : "var(--surface-2)" }}>
                  <td style={{ padding: "11px 12px", borderTop: "1px solid var(--border)", fontWeight: 700, color: "var(--text-1)" }}>{property.name}</td>
                  <td style={{ padding: "11px 12px", borderTop: "1px solid var(--border)", color: "var(--text-2)" }}>{entityLabel(property.entity)}</td>
                  <td style={{ padding: "11px 12px", borderTop: "1px solid var(--border)", textAlign: "right" }}>{property.rooms}</td>
                  <td style={{ padding: "11px 12px", borderTop: "1px solid var(--border)", textAlign: "right" }}>{pct(property.occ)}</td>
                  <td style={{ padding: "11px 12px", borderTop: "1px solid var(--border)", textAlign: "right" }}>{fmtINR(property.roomRev)}</td>
                  <td style={{ padding: "11px 12px", borderTop: "1px solid var(--border)", textAlign: "right" }}>{fmtINR(property.fnbRev)}</td>
                  <td style={{ padding: "11px 12px", borderTop: "1px solid var(--border)", textAlign: "right" }}>{fmtINR(property.eventsRev)}</td>
                  <td style={{ padding: "11px 12px", borderTop: "1px solid var(--border)", textAlign: "right", fontWeight: 800, color: "var(--text-1)" }}>{fmtINR(property.totalRev)}</td>
                  <td style={{ padding: "11px 12px", borderTop: "1px solid var(--border)", textAlign: "right" }}>{fmtINR(property.adr)}</td>
                  <td style={{ padding: "11px 12px", borderTop: "1px solid var(--border)", textAlign: "right" }}>{fmtINR(property.revpar)}</td>
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
    <div className="glass-card" style={{ padding: "18px" }}>
      <SectionHeader title="Latest Tally Imports" subtitle="From finance_records.tally_file_name and tally_received_at" />
      {imports.length === 0 ? (
        <EmptyState title="No Tally import metadata" body="When finance_records include tally file metadata, it will be listed here." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "14px" }}>
          {imports.map(item => (
            <div key={`${item.property}-${item.fileName}-${item.receivedAt}`} style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              background: "var(--surface-2)",
            }}>
              <FileText size={14} color="#1B4332" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: "12.5px", fontWeight: 700, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.fileName}</p>
                <p style={{ margin: "2px 0 0", fontSize: "11px", color: "var(--text-3)" }}>{item.property} · {item.source}</p>
              </div>
              <span style={{ fontSize: "11px", color: "var(--text-3)", whiteSpace: "nowrap" }}>{item.receivedAt}</span>
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
    <div className="finance-module" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div className="glass-card" style={{ padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "12px" }} className="finance-kpi-grid">
        <KpiCard label="Total Revenue" value={fmtINR(totalRevenue)} sub={`${properties.length} property records`} icon={IndianRupee} />
        <KpiCard label="Occupancy" value={pct(avgOccupancy)} sub={`${occupiedRooms}/${totalRooms} rooms`} icon={Building2} />
        <KpiCard label="ADR" value={fmtINR(avgAdr)} sub="Average daily rate" icon={Landmark} />
        <KpiCard label="Receivables" value={fmtINR(totalOutstanding)} sub="Outstanding receivables" icon={PieIcon} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(320px, 0.8fr)", gap: "12px" }} className="finance-chart-grid">
        <RevenueTrend data={data?.financeTrend ?? []} />
        <RevenueMix data={data?.revenueMix ?? []} />
      </div>

      <EntitySummary data={data?.entitySummary ?? []} />
      <FinancePropertyTable properties={properties} />
      <TallyImports imports={data?.latestTallyImports ?? []} />

      <style>{`
        @media (max-width: 1100px) {
          .finance-kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .finance-chart-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .finance-kpi-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
