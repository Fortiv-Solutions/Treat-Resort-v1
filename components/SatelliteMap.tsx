"use client";

import { useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { type Property, type PropertyStatus } from "@/lib/data";
import {
  X, Star, MessageCircle, Users, AlertTriangle, MapPin,
} from "lucide-react";

/* ── ESRI free satellite tiles (no API key) ─────────── */
const SAT_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const SAT_ATTR = "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics";

/* ── Labels overlay (keeps country/city names on sat) ── */
const LABELS_URL =
  "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";

/* ── India view config ──────────────────────────────── */
const INDIA_CENTER: [number, number] = [22.5, 80.5];
const INDIA_ZOOM = 5;
// Hard-lock panning inside India
const INDIA_BOUNDS: [[number, number], [number, number]] = [
  [6.5, 67.0],   // SW
  [37.5, 98.0],  // NE
];

/* ── Property coords [lat, lng] ─────────────────────── */
const COORDS: Record<string, [number, number]> = {
  silvassa:      [20.28, 73.02],
  dahanu:        [19.97, 72.72],
  kumbhalgarh:   [25.15, 73.59],
  sambhajinagar: [19.88, 75.34],
  jimcorbett:    [29.53, 78.77],
  pushkar:       [26.49, 74.55],
  udaipur:       [24.58, 73.68],
  rajkot:        [22.30, 70.80],
  pune:          [18.52, 73.86],
  nashik:        [20.01, 73.79],
  surat:         [21.17, 72.83],
  ahmedabad:     [23.02, 72.57],
};

const SHORT: Record<string, string> = {
  silvassa: "Silvassa", dahanu: "Dahanu", kumbhalgarh: "Kumbhalgarh",
  sambhajinagar: "Sambhajinagar", jimcorbett: "Jim Corbett", pushkar: "Pushkar",
  udaipur: "Udaipur", rajkot: "Rajkot", pune: "Pune",
  nashik: "Nashik", surat: "Surat", ahmedabad: "Ahmedabad",
};

const PIN: Record<PropertyStatus, { fill: string; border: string; glow: string }> = {
  "Excellent":        { fill: "#C9A96E", border: "#FFFFFF", glow: "rgba(201,169,110,0.7)" },
  "Good":             { fill: "#60A5FA", border: "#FFFFFF", glow: "rgba(96,165,250,0.7)"  },
  "Needs Attention":  { fill: "#F87171", border: "#FFFFFF", glow: "rgba(248,113,113,0.7)" },
};

/* ── Detail panel ────────────────────────────────────── */
function DetailPanel({ prop, onClose }: { prop: Property; onClose: () => void }) {
  const p = PIN[prop.status];
  return (
    <div style={{
      position: "absolute", top: "12px", right: "12px", zIndex: 1000,
      width: "220px",
      background: "rgba(10,22,15,0.97)",
      backdropFilter: "blur(16px)",
      border: `1px solid ${p.fill}40`,
      borderRadius: "14px",
      boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${p.fill}20`,
      animation: "scaleIn 200ms cubic-bezier(0.16,1,0.3,1) both",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "12px 14px 10px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px",
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "3px" }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: p.fill, flexShrink: 0, boxShadow: `0 0 5px ${p.glow}` }} />
            <span style={{ fontSize: "9.5px", fontWeight: 700, color: p.fill, letterSpacing: "0.07em", textTransform: "uppercase" }}>
              {prop.status}
            </span>
          </div>
          <p style={{ fontSize: "12.5px", fontWeight: 700, color: "#FFFFFF", lineHeight: 1.3 }}>
            {prop.name.replace("Treat ", "")}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{ background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer", width: "24px", height: "24px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.16)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
        >
          <X size={11} color="rgba(255,255,255,0.6)" />
        </button>
      </div>

      {/* Metrics */}
      <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {[
          { icon: Users,         label: "Checkouts",     val: prop.checkouts.toLocaleString(),                      color: "#C9A96E" },
          { icon: MessageCircle, label: "Response",      val: `${prop.responseRate}%`,                              color: prop.responseRate >= 90 ? "#34D399" : prop.responseRate >= 75 ? "#FBBF24" : "#F87171" },
          { icon: Star,          label: "Reviews",       val: `${prop.googleReviews}`,                              color: "#FBBF24" },
          { icon: AlertTriangle, label: "Complaints",    val: prop.negativeComplaints > 0 ? `${prop.negativeComplaints}` : "None", color: prop.negativeComplaints > 0 ? "#F87171" : "#34D399" },
        ].map(({ icon: Icon, label, val, color }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Icon size={11} color="rgba(255,255,255,0.35)" />
              <span style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.45)" }}>{label}</span>
            </div>
            <span style={{ fontSize: "12.5px", fontWeight: 700, color }}>{val}</span>
          </div>
        ))}

        {/* Response bar */}
        <div style={{ paddingTop: "4px" }}>
          <div style={{ height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${prop.responseRate}%`, borderRadius: "2px", background: `linear-gradient(90deg, ${p.fill}, ${p.fill}80)`, transition: "width 700ms cubic-bezier(0.16,1,0.3,1)" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
            <span style={{ fontSize: "9.5px", color: "rgba(255,255,255,0.25)" }}>Feedback rate</span>
            <span style={{ fontSize: "9.5px", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>{prop.feedbackSent}/{prop.checkouts}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Summary card (no selection) ─────────────────────── */
function SummaryCard({ properties }: { properties: Property[] }) {
  const counts = {
    Excellent:         properties.filter(p => p.status === "Excellent").length,
    Good:              properties.filter(p => p.status === "Good").length,
    "Needs Attention": properties.filter(p => p.status === "Needs Attention").length,
  };
  return (
    <div style={{
      position: "absolute", top: "12px", right: "12px", zIndex: 1000,
      width: "200px",
      background: "rgba(10,22,15,0.95)",
      backdropFilter: "blur(14px)",
      border: "1px solid rgba(201,169,110,0.18)",
      borderRadius: "14px",
      overflow: "hidden",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    }}>
      <div style={{ padding: "12px 14px 9px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase" }}>KEY PROPERTIES</p>
        <p style={{ fontSize: "20px", fontWeight: 800, color: "#C9A96E", marginTop: "2px", lineHeight: 1 }}>
          {properties.length}
          <span style={{ fontSize: "11px", fontWeight: 500, color: "rgba(255,255,255,0.35)", marginLeft: "5px" }}>locations</span>
        </p>
      </div>
      <div style={{ padding: "10px 14px" }}>
        {(Object.entries(counts) as [PropertyStatus, number][]).map(([status, count]) => {
          const pct = properties.length ? Math.round((count / properties.length) * 100) : 0;
          return (
            <div key={status} style={{ marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                <span style={{ fontSize: "11px", color: PIN[status].fill, fontWeight: 600 }}>{status}</span>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>{count} · {pct}%</span>
              </div>
              <div style={{ height: "3px", borderRadius: "2px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, borderRadius: "2px", background: PIN[status].fill }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────── */
export default function SatelliteMap({ properties }: { properties: Property[] }) {
  const [selected, setSelected] = useState<Property | null>(null);

  return (
    <div style={{
      background: "#0a1a10",
      borderRadius: "10px",
      overflow: "hidden",
      border: "1px solid rgba(201,169,110,0.14)",
      boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
    }}>
      {/* Header bar */}
      <div style={{
        padding: "11px 18px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        flexWrap: "wrap", gap: "10px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "rgba(201,169,110,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MapPin size={13} color="#C9A96E" />
          </div>
          <div>
            <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF", lineHeight: 1 }}>Property Locations</h2>
            <p style={{ fontSize: "10.5px", color: "rgba(255,255,255,0.35)", marginTop: "1px" }}>India · 12 hotels · satellite view</p>
          </div>
        </div>

        {/* Mini legend */}
        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
          {(Object.entries(PIN) as [PropertyStatus, typeof PIN[PropertyStatus]][]).map(([status, { fill }]) => (
            <div key={status} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: fill, boxShadow: `0 0 4px ${fill}` }} />
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)" }}>{status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map area */}
      <div style={{ position: "relative", height: "280px" }}>
        <MapContainer
          key="satellite-map"
          center={INDIA_CENTER}
          zoom={INDIA_ZOOM}
          minZoom={5}
          maxZoom={5}
          maxBounds={INDIA_BOUNDS}
          maxBoundsViscosity={1.0}
          dragging={false}
          zoomControl={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          touchZoom={false}
          keyboard={false}
          attributionControl={false}
          style={{ width: "100%", height: "100%" }}
        >
          {/* Satellite layer */}
          <TileLayer url={SAT_URL} attribution={SAT_ATTR} />
          {/* Place name labels overlay */}
          <TileLayer url={LABELS_URL} opacity={0.7} />

          {/* Property markers */}
          {properties.map(prop => {
            const coords: [number, number] | undefined =
              prop.latitude != null && prop.longitude != null
                ? [prop.latitude, prop.longitude]
                : COORDS[prop.id];
            if (!coords) return null;
            const pin = PIN[prop.status];
            const isSelected = selected?.id === prop.id;

            return (
              <CircleMarker
                key={prop.id}
                center={coords}
                radius={isSelected ? 11 : 8}
                pathOptions={{
                  fillColor: pin.fill,
                  fillOpacity: 1,
                  color: isSelected ? "#FFFFFF" : "rgba(255,255,255,0.6)",
                  weight: isSelected ? 2.5 : 1.5,
                }}
                eventHandlers={{
                  click: () => setSelected(selected?.id === prop.id ? null : prop),
                }}
              >
                <Tooltip
                  permanent={false}
                  direction="top"
                  offset={[0, -10]}
                  className="property-tooltip"
                >
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 600 }}>
                    {SHORT[prop.id] ?? prop.name} · {prop.status}
                  </span>
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Overlay panels */}
        {selected
          ? <DetailPanel prop={selected} onClose={() => setSelected(null)} />
          : <SummaryCard properties={properties} />
        }

        {/* Attribution overlay */}
        <div style={{
          position: "absolute", bottom: "6px", left: "8px", zIndex: 999,
          fontSize: "9px", color: "rgba(255,255,255,0.3)",
          background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: "4px",
        }}>
          © Esri
        </div>
      </div>

      {/* Bottom strip — clickable property chips */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "9px 16px",
        display: "flex", gap: "6px", overflowX: "auto",
      }}>
        {properties.map(prop => {
          const active = selected?.id === prop.id;
          const pin = PIN[prop.status];
          return (
            <button
              key={prop.id}
              onClick={() => setSelected(active ? null : prop)}
              style={{
                display: "flex", alignItems: "center", gap: "5px",
                padding: "5px 10px", borderRadius: "20px", border: "1px solid",
                borderColor: active ? `${pin.fill}60` : "rgba(255,255,255,0.08)",
                background: active ? `${pin.fill}18` : "rgba(255,255,255,0.04)",
                cursor: "pointer", flexShrink: 0,
                transition: "all 150ms ease", fontFamily: "'Inter', sans-serif",
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.09)"; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? `${pin.fill}18` : "rgba(255,255,255,0.04)"; }}
            >
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: pin.fill, flexShrink: 0 }} />
              <span style={{ fontSize: "11px", fontWeight: active ? 700 : 500, color: active ? "#FFFFFF" : "rgba(255,255,255,0.45)", whiteSpace: "nowrap" }}>
                {SHORT[prop.id] ?? prop.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tooltip styles */}
      <style>{`
        .property-tooltip {
          background: rgba(10,22,15,0.95) !important;
          border: 1px solid rgba(201,169,110,0.3) !important;
          color: #FFFFFF !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.4) !important;
          padding: 4px 10px !important;
          font-size: 12px !important;
        }
        .property-tooltip::before { display: none !important; }
        .leaflet-container { background: #1a3326 !important; }
      `}</style>
    </div>
  );
}
