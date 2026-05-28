"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Property } from "@/lib/data";

function EmptyChart() {
  return (
    <div style={{ minHeight: "250px", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", color: "var(--text-3)", fontSize: "12px" }}>
      No property performance data yet.
    </div>
  );
}

export default function PerformanceChart({ properties }: { properties: Property[] }) {
  const data = properties.map(property => ({
    property: property.name.replace("Treat ", ""),
    occupancy: property.occupancyRate,
    responseRate: property.responseRate,
    reviewScore: property.avgRating ? Math.round((property.avgRating / 5) * 100) : 0,
  }));

  return (
    <div className="glass-card h-full min-h-[420px] flex flex-col" style={{ padding: "22px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-1)", lineHeight: 1.2 }}>
            Performance Overview
          </h2>
          <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "3px" }}>
            Occupancy, response rate, and review score from Supabase aggregates
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "20px", marginBottom: "16px", flexWrap: "wrap" }}>
        {[
          { label: "Occupancy", color: "#1B4332" },
          { label: "Response Rate", color: "#C9A96E" },
          { label: "Review Score", color: "var(--teal)" },
        ].map(({ label, color }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: color, display: "inline-block" }} />
            <span style={{ fontSize: "12px", color: "var(--text-2)", fontWeight: 500 }}>{label}</span>
          </div>
        ))}
      </div>

      {data.length === 0 ? (
        <EmptyChart />
      ) : (
        <div style={{ flex: 1, minHeight: "250px" }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradOcc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1B4332" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#1B4332" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradResp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C9A96E" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#C9A96E" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--teal)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--teal)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.05)" vertical={false} />
            <XAxis dataKey="property" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} dy={6} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={value => `${value}%`} />
            <Tooltip formatter={(value) => `${value}%`} contentStyle={{ borderRadius: "8px", border: "1px solid var(--border)" }} />
            <Area type="monotone" dataKey="occupancy" name="Occupancy" stroke="#1B4332" strokeWidth={2.5} fill="url(#gradOcc)" dot={false} />
            <Area type="monotone" dataKey="responseRate" name="Response Rate" stroke="#C9A96E" strokeWidth={2.5} fill="url(#gradResp)" dot={false} />
            <Area type="monotone" dataKey="reviewScore" name="Review Score" stroke="var(--teal)" strokeWidth={2} fill="url(#gradRev)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
