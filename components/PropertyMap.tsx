"use client";

import { useState } from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — no types package available
import {
  ComposableMap, Geographies, Geography,
  Marker, ZoomableGroup,
} from "react-simple-maps";
import { type Property, type PropertyStatus } from "@/lib/data";
import { X, MapPin, Star, MessageCircle, Users, AlertTriangle, TrendingUp } from "lucide-react";

/* ── Geo data ───────────────────────────────────────── */
const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

/* ── Property coordinates [lng, lat] ────────────────── */
const COORDS: Record<string, [number, number]> = {
  silvassa:      [73.02, 20.28],
  dahanu:        [72.72, 19.97],
  kumbhalgarh:   [73.59, 25.15],
  sambhajinagar: [75.34, 19.88],
  jimcorbett:    [78.77, 29.53],
  pushkar:       [74.55, 26.49],
  udaipur:       [73.68, 24.58],
  rajkot:        [70.80, 22.30],
  pune:          [73.86, 18.52],
  nashik:        [73.79, 20.01],
  surat:         [72.83, 21.17],
  ahmedabad:     [72.57, 23.02],
};

const SHORT_NAMES: Record<string, string> = {
  silvassa: "Silvassa", dahanu: "Dahanu", kumbhalgarh: "Kumbhalgarh",
  sambhajinagar: "Sambhajinagar", jimcorbett: "Jim Corbett", pushkar: "Pushkar",
  udaipur: "Udaipur", rajkot: "Rajkot", pune: "Pune",
  nashik: "Nashik", surat: "Surat", ahmedabad: "Ahmedabad",
};

/* ── Status tokens ───────────────────────────────────── */
const PIN: Record<PropertyStatus, { fill: string; ring: string; glow: string; label: string }> = {
  "Excellent":       { fill: "#C9A96E", ring: "rgba(201,169,110,0.3)", glow: "rgba(201,169,110,0.6)", label: "#C9A96E" },
  "Good":            { fill: "#3B82F6", ring: "rgba(59,130,246,0.3)",  glow: "rgba(59,130,246,0.6)",  label: "#60A5FA" },
  "Needs Attention": { fill: "#EF4444", ring: "rgba(239,68,68,0.3)",   glow: "rgba(239,68,68,0.6)",   label: "#F87171" },
};

/* ── Property Detail Panel ───────────────────────────── */
function PropertyPanel({ prop, onClose }: { prop: Property; onClose: () => void }) {
  const pin = PIN[prop.status];
  return (
    <div style={{
      width: "240px", flexShrink: 0,
      background: "rgba(15,27,20,0.95)",
      border: `1px solid ${pin.fill}30`,
      borderRadius: "14px",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
      animation: "scaleIn 220ms cubic-bezier(0.16,1,0.3,1) both",
    }}>
      {/* Header */}
      <div style={{
        padding: "14px 16px 12px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
      }}>
        <div style={{ flex: 1, minWidth: 0, paddingRight: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
            <span style={{
              width: "8px", height: "8px", borderRadius: "50%",
              background: pin.fill, boxShadow: `0 0 6px ${pin.glow}`,
              flexShrink: 0,
            }} />
            <span style={{
              fontSize: "10px", fontWeight: 700, letterSpacing: "0.07em",
              textTransform: "uppercase", color: pin.label,
            }}>{prop.status}</span>
          </div>
          <h3 style={{
            fontSize: "13px", fontWeight: 700, color: "#FFFFFF",
            lineHeight: 1.3, overflow: "hidden",
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}>
            {prop.name}
          </h3>
        </div>
        <button onClick={onClose} style={{
          background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer",
          width: "26px", height: "26px", borderRadius: "6px",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, transition: "background 150ms",
        }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.14)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
        >
          <X size={12} color="rgba(255,255,255,0.5)" />
        </button>
      </div>

      {/* Stats */}
      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {[
          { icon: Users,         label: "Checkouts",      value: prop.checkouts.toLocaleString(),   color: "#C9A96E" },
          { icon: MessageCircle, label: "Response Rate",  value: `${prop.responseRate}%`,           color: prop.responseRate >= 90 ? "#34D399" : prop.responseRate >= 75 ? "#FBBF24" : "#F87171" },
          { icon: Star,          label: "Google Reviews", value: prop.googleReviews.toLocaleString(), color: "#FBBF24" },
          { icon: AlertTriangle, label: "Complaints",     value: prop.negativeComplaints > 0 ? `${prop.negativeComplaints} open` : "None", color: prop.negativeComplaints > 0 ? "#F87171" : "#34D399" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <span style={{
                width: "26px", height: "26px", borderRadius: "7px",
                background: "rgba(255,255,255,0.06)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={12} color="rgba(255,255,255,0.4)" />
              </span>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontWeight: 400 }}>{label}</span>
            </div>
            <span style={{ fontSize: "13px", fontWeight: 700, color }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Response rate bar */}
      <div style={{ padding: "0 16px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
          <span style={{ fontSize: "10.5px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.04em" }}>FEEDBACK SENT</span>
          <span style={{ fontSize: "10.5px", fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>{prop.feedbackSent} / {prop.checkouts}</span>
        </div>
        <div style={{ height: "5px", borderRadius: "3px", background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: "3px",
            background: `linear-gradient(90deg, ${pin.fill}, ${pin.fill}88)`,
            width: `${prop.responseRate}%`,
            transition: "width 600ms cubic-bezier(0.16,1,0.3,1)",
          }} />
        </div>
      </div>
    </div>
  );
}

/* ── Summary Panel (no selection) ───────────────────── */
function SummaryPanel({ properties }: { properties: Property[] }) {
  const counts = {
    Excellent:        properties.filter(p => p.status === "Excellent").length,
    Good:             properties.filter(p => p.status === "Good").length,
    "Needs Attention":properties.filter(p => p.status === "Needs Attention").length,
  };
  const topReviews = [...properties].sort((a, b) => b.googleReviews - a.googleReviews).slice(0, 3);

  return (
    <div style={{
      width: "240px", flexShrink: 0,
      background: "rgba(15,27,20,0.85)",
      border: "1px solid rgba(201,169,110,0.15)",
      borderRadius: "14px",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <p style={{ fontSize: "10.5px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.07em", textTransform: "uppercase" }}>KEY PROPERTIES</p>
        <p style={{ fontSize: "22px", fontWeight: 800, color: "#C9A96E", lineHeight: 1.1, marginTop: "4px" }}>
          {properties.length}
          <span style={{ fontSize: "12px", fontWeight: 500, color: "rgba(255,255,255,0.4)", marginLeft: "6px" }}>Locations</span>
        </p>
      </div>

      {/* Status breakdown */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "10px" }}>STATUS BREAKDOWN</p>
        {(Object.entries(counts) as [PropertyStatus, number][]).map(([status, count]) => {
          const pct = Math.round((count / properties.length) * 100);
          return (
            <div key={status} style={{ marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "11.5px", color: PIN[status].label, fontWeight: 600 }}>{status}</span>
                <span style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>
                  {count} · <span style={{ color: PIN[status].fill }}>{pct}%</span>
                </span>
              </div>
              <div style={{ height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: "2px",
                  background: `linear-gradient(90deg, ${PIN[status].fill}, ${PIN[status].fill}70)`,
                  width: `${pct}%`, transition: "width 800ms cubic-bezier(0.16,1,0.3,1)",
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Top reviewers */}
      <div style={{ padding: "12px 16px" }}>
        <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "10px" }}>TOP REVIEW GENERATORS</p>
        {topReviews.map((p, i) => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span style={{
              width: "20px", height: "20px", borderRadius: "50%",
              background: i === 0 ? "#C9A96E" : "rgba(255,255,255,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "10px", fontWeight: 800,
              color: i === 0 ? "#1B4332" : "rgba(255,255,255,0.4)",
              flexShrink: 0,
            }}>{i + 1}</span>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {SHORT_NAMES[p.id]}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "12px", fontWeight: 700, color: "#FBBF24", flexShrink: 0 }}>
              <Star size={10} fill="#FBBF24" color="#FBBF24" /> {p.googleReviews}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main Map Component ──────────────────────────────── */
export default function PropertyMap({ properties }: { properties: Property[] }) {
  const [selected, setSelected] = useState<Property | null>(null);
  const [hovered, setHovered]   = useState<string | null>(null);

  const totals = {
    checkouts:  properties.reduce((s, p) => s + p.checkouts, 0),
    reviews:    properties.reduce((s, p) => s + p.googleReviews, 0),
    avgResp:    (properties.reduce((s, p) => s + p.responseRate, 0) / properties.length).toFixed(1),
  };

  return (
    <div style={{
      background: "linear-gradient(160deg, #0d2018 0%, #0f2a20 50%, #091a13 100%)",
      borderRadius: "18px",
      overflow: "hidden",
      border: "1px solid rgba(201,169,110,0.12)",
      boxShadow: "0 8px 40px rgba(0,0,0,0.35)",
    }}>

      {/* ── Top bar ── */}
      <div style={{
        padding: "16px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        flexWrap: "wrap", gap: "12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "9px",
            background: "rgba(201,169,110,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <MapPin size={15} color="#C9A96E" />
          </div>
          <div>
            <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", lineHeight: 1 }}>Property Map</h2>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>India · 12 locations · click any pin</p>
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ display: "flex", gap: "20px" }}>
          {[
            { label: "Total Checkouts", value: totals.checkouts.toLocaleString(), icon: TrendingUp, color: "#C9A96E" },
            { label: "Google Reviews",  value: totals.reviews.toLocaleString(),   icon: Star,       color: "#FBBF24" },
            { label: "Avg Response",    value: `${totals.avgResp}%`,              icon: MessageCircle, color: "#34D399" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", justifyContent: "center" }}>
                <Icon size={12} color={color} />
                <span style={{ fontSize: "16px", fontWeight: 800, color: "#FFFFFF", fontVariantNumeric: "tabular-nums" }}>{value}</span>
              </div>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", marginTop: "1px", letterSpacing: "0.04em" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: "14px" }}>
          {(Object.entries(PIN) as [PropertyStatus, typeof PIN[PropertyStatus]][]).map(([status, { fill }]) => (
            <div key={status} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: fill, display: "inline-block" }} />
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)" }}>{status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Body: map + panel ── */}
      <div style={{ display: "flex", position: "relative", minHeight: "420px" }}>

        {/* Map */}
        <div style={{ flex: 1, position: "relative", minWidth: 0, minHeight: "420px" }}>
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ center: [75.5, 22.5], scale: 980 }}
            width={700} height={420}
            style={{ width: "100%", height: "100%" }}
          >
            <ZoomableGroup zoom={1} minZoom={0.8} maxZoom={3}>
              <Geographies geography={GEO_URL}>
                {({ geographies }: { geographies: Array<{ rsmKey: string; properties: { name?: string } }> }) =>
                  geographies.map(geo => {
                    const isIndia = geo.properties.name === "India";
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        style={{
                          default: {
                            fill: isIndia ? "#1e4a35" : "#162b22",
                            stroke: "#0d2018",
                            strokeWidth: 0.6,
                            outline: "none",
                          },
                          hover: {
                            fill: isIndia ? "#225a40" : "#162b22",
                            stroke: "#0d2018",
                            strokeWidth: 0.6,
                            outline: "none",
                          },
                          pressed: {
                            fill: isIndia ? "#1e4a35" : "#162b22",
                            outline: "none",
                          },
                        }}
                      />
                    );
                  })
                }
              </Geographies>

              {/* Grid lines overlay feel — subtle latitude lines */}
              {properties.map(prop => {
                const coords = COORDS[prop.id];
                if (!coords) return null;
                const isSelected = selected?.id === prop.id;
                const isHovered  = hovered === prop.id;
                const pin = PIN[prop.status];
                const r = isSelected ? 9 : isHovered ? 8 : 7;

                return (
                  <Marker
                    key={prop.id}
                    coordinates={coords}
                    onClick={() => setSelected(selected?.id === prop.id ? null : prop)}
                    onMouseEnter={() => {
                      setHovered(prop.id);
                    }}
                    onMouseLeave={() => { setHovered(null); }}
                    style={{ cursor: "pointer" }}
                  >
                    {/* Glow ring */}
                    <circle
                      r={r + 5}
                      fill={pin.ring}
                      style={{
                        opacity: isSelected || isHovered ? 1 : 0,
                        transition: "opacity 200ms ease, r 200ms ease",
                      }}
                    />
                    {/* Outer pulse ring (selected) */}
                    {isSelected && (
                      <circle
                        r={r + 10}
                        fill="none"
                        stroke={pin.fill}
                        strokeWidth={1}
                        opacity={0.4}
                      />
                    )}
                    {/* Pin body */}
                    <circle
                      r={r}
                      fill={pin.fill}
                      stroke={isSelected ? "#FFFFFF" : "rgba(255,255,255,0.3)"}
                      strokeWidth={isSelected ? 2 : 1}
                      style={{
                        filter: `drop-shadow(0 0 ${isSelected ? 8 : isHovered ? 5 : 3}px ${pin.glow})`,
                        transition: "r 200ms cubic-bezier(0.16,1,0.3,1)",
                      }}
                    />
                    {/* Pin label */}
                    <text
                      textAnchor="middle"
                      y={-(r + 5)}
                      style={{
                        fontSize: "8px",
                        fill: isSelected || isHovered ? "#FFFFFF" : "rgba(255,255,255,0.6)",
                        fontWeight: isSelected ? 700 : 400,
                        fontFamily: "'Inter', sans-serif",
                        pointerEvents: "none",
                        transition: "fill 150ms, font-weight 150ms",
                        textShadow: "0 1px 3px rgba(0,0,0,0.9)",
                      }}
                    >
                      {SHORT_NAMES[prop.id]}
                    </text>
                  </Marker>
                );
              })}
            </ZoomableGroup>
          </ComposableMap>

          {/* Zoom hint */}
          <div style={{
            position: "absolute", bottom: "12px", left: "12px",
            fontSize: "10px", color: "rgba(255,255,255,0.25)",
            background: "rgba(0,0,0,0.3)", padding: "4px 8px", borderRadius: "6px",
          }}>
            Scroll to zoom · Drag to pan
          </div>
        </div>

        {/* Side Panel */}
        <div style={{ padding: "16px", display: "flex", alignItems: "flex-start" }}>
          {selected
            ? <PropertyPanel prop={selected} onClose={() => setSelected(null)} />
            : <SummaryPanel properties={properties} />
          }
        </div>
      </div>

      {/* ── Bottom property strip ── */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "12px 20px",
        display: "flex", gap: "8px", overflowX: "auto",
      }}>
        {properties.map(prop => {
          const isActive = selected?.id === prop.id;
          const pin = PIN[prop.status];
          return (
            <button
              key={prop.id}
              onClick={() => setSelected(isActive ? null : prop)}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "6px 12px", borderRadius: "20px", border: "none", cursor: "pointer",
                background: isActive ? `${pin.fill}22` : "rgba(255,255,255,0.05)",
                borderWidth: "1px", borderStyle: "solid",
                borderColor: isActive ? `${pin.fill}60` : "rgba(255,255,255,0.08)",
                transition: "all 180ms ease",
                flexShrink: 0,
                fontFamily: "'Inter', sans-serif",
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.09)"; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
            >
              <span style={{
                width: "6px", height: "6px", borderRadius: "50%",
                background: pin.fill, flexShrink: 0,
                boxShadow: isActive ? `0 0 5px ${pin.glow}` : "none",
              }} />
              <span style={{
                fontSize: "11.5px", fontWeight: isActive ? 700 : 500,
                color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.5)",
                whiteSpace: "nowrap",
              }}>
                {SHORT_NAMES[prop.id]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
