"use client";

import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const WEEKLY_DATA = [
  { day: "Sun", occupancy: 72, responseRate: 81, reviewScore: 74 },
  { day: "Mon", occupancy: 68, responseRate: 78, reviewScore: 71 },
  { day: "Tue", occupancy: 79, responseRate: 84, reviewScore: 80 },
  { day: "Wed", occupancy: 83, responseRate: 88, reviewScore: 85 },
  { day: "Thu", occupancy: 91, responseRate: 93, reviewScore: 88 },
  { day: "Fri", occupancy: 94, responseRate: 95, reviewScore: 92 },
  { day: "Sat", occupancy: 97, responseRate: 96, reviewScore: 94 },
];

const MONTHLY_DATA = [
  { day: "W1",  occupancy: 74, responseRate: 80, reviewScore: 76 },
  { day: "W2",  occupancy: 81, responseRate: 85, reviewScore: 82 },
  { day: "W3",  occupancy: 88, responseRate: 91, reviewScore: 87 },
  { day: "W4",  occupancy: 93, responseRate: 95, reviewScore: 91 },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(27,67,50,0.95)", backdropFilter: "blur(12px)",
      border: "1px solid rgba(201,169,110,0.3)", borderRadius: "10px",
      padding: "10px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
    }}>
      <p style={{ color: "#C9A96E", fontWeight: 700, fontSize: "12px", marginBottom: "6px" }}>{label}</p>
      {payload.map((p) => (
        <div key={p.name} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: p.color, display: "inline-block" }} />
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "11.5px" }}>{p.name}:</span>
          <span style={{ color: "#fff", fontWeight: 600, fontSize: "11.5px" }}>{p.value}%</span>
        </div>
      ))}
    </div>
  );
}

export default function PerformanceChart() {
  const [range, setRange] = useState<"weekly" | "monthly">("weekly");
  const data = range === "weekly" ? WEEKLY_DATA : MONTHLY_DATA;

  return (
    <div className="glass-card" style={{ padding: "22px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-1)", lineHeight: 1.2 }}>
            Performance Overview
          </h2>
          <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "3px" }}>
            Occupancy · Response Rate · Review Score — all properties
          </p>
        </div>
        <div style={{ display: "flex", gap: "4px", background: "var(--bg)", borderRadius: "8px", padding: "3px" }}>
          {(["weekly", "monthly"] as const).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{
                padding: "5px 14px", borderRadius: "6px", border: "none", cursor: "pointer",
                fontSize: "12px", fontWeight: range === r ? 600 : 400,
                background: range === r ? "#FFFFFF" : "transparent",
                color: range === r ? "var(--text-1)" : "var(--text-3)",
                boxShadow: range === r ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                transition: "all 150ms ease",
              }}
            >
              {r === "weekly" ? "Weekly" : "Monthly"}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "16px", flexWrap: "wrap" }}>
        {[
          { label: "Occupancy",      color: "#1B4332" },
          { label: "Response Rate",  color: "#C9A96E" },
          { label: "Review Score",   color: "var(--teal)" },
        ].map(({ label, color }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: color, display: "inline-block" }} />
            <span style={{ fontSize: "12px", color: "var(--text-2)", fontWeight: 500 }}>{label}</span>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={200} minWidth={1} minHeight={1}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradOcc" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#1B4332" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#1B4332" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradResp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#C9A96E" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#C9A96E" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="var(--teal)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="var(--teal)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.05)" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} dy={6} />
          <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(201,169,110,0.2)", strokeWidth: 2 }} />
          <Area type="monotone" dataKey="occupancy"    name="Occupancy"     stroke="#1B4332" strokeWidth={2.5} fill="url(#gradOcc)"  dot={false} activeDot={{ r: 5, fill: "#1B4332", strokeWidth: 0 }} />
          <Area type="monotone" dataKey="responseRate" name="Response Rate" stroke="#C9A96E" strokeWidth={2.5} fill="url(#gradResp)" dot={false} activeDot={{ r: 5, fill: "#C9A96E", strokeWidth: 0 }} />
          <Area type="monotone" dataKey="reviewScore"  name="Review Score"  stroke="var(--teal)" strokeWidth={2}   fill="url(#gradRev)"  dot={false} activeDot={{ r: 5, fill: "var(--teal)", strokeWidth: 0 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
