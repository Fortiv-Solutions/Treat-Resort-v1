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
          <h2 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-1)", lineHeight: 1.2, fontFamily: "var(--font-roboto-slab)" }}>
            Performance Overview
          </h2>
          <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "3px" }}>
            Occupancy, response rate, and review score across properties
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "20px", marginBottom: "16px", flexWrap: "wrap" }}>
        {[
          { label: "Occupancy", color: "#055C4C" },
          { label: "Response Rate", color: "#C8AC61" },
          { label: "Review Score", color: "#0F7069" },
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
                <stop offset="5%" stopColor="#055C4C" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#055C4C" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradResp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C8AC61" stopOpacity={0.34} />
                <stop offset="95%" stopColor="#C8AC61" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0F7069" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#0F7069" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(83,65,28,0.12)" vertical={false} />
            <XAxis dataKey="property" tick={{ fontSize: 10, fill: "#7D7463" }} axisLine={false} tickLine={false} dy={6} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#7D7463" }} axisLine={false} tickLine={false} tickFormatter={value => `${value}%`} />
            <Tooltip formatter={(value) => `${value}%`} contentStyle={{ borderRadius: "8px", border: "1px solid var(--border)", background: "#fffdf7", boxShadow: "var(--shadow-premium-popover)" }} />
            <Area type="monotone" dataKey="occupancy" name="Occupancy" stroke="#055C4C" strokeWidth={2.5} fill="url(#gradOcc)" dot={false} />
            <Area type="monotone" dataKey="responseRate" name="Response Rate" stroke="#C8AC61" strokeWidth={2.5} fill="url(#gradResp)" dot={false} />
            <Area type="monotone" dataKey="reviewScore" name="Review Score" stroke="#0F7069" strokeWidth={2} fill="url(#gradRev)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
