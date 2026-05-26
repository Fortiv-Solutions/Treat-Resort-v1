"use client";

import { useState } from "react";
import { Link2, Star, AlertTriangle, Check, Copy, Zap, ChevronRight } from "lucide-react";

export default function AutomationPanel() {
  const [formUrl,    setFormUrl]    = useState("");
  const [reviewUrl,  setReviewUrl]  = useState("");
  const [copiedField, setCopiedField] = useState<"form" | "review" | null>(null);

  function copy(field: "form" | "review") {
    const val = field === "form" ? formUrl : reviewUrl;
    if (!val) return;
    navigator.clipboard.writeText(val).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1800);
    });
  }

  const isActive = formUrl.trim().length > 0 && reviewUrl.trim().length > 0;

  const cardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.92)",
    border: "1px solid var(--border)",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(26,43,74,0.06), 0 8px 32px rgba(26,43,74,0.07)",
    overflow: "hidden",
  };

  return (
    <div className="anim-fade-up" style={{ ...cardStyle, animationDelay: "300ms" }}>

      {/* Header */}
      <div style={{
        padding: "14px 20px 12px",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
          <div style={{
            width: "30px", height: "30px", borderRadius: "8px",
            background: "linear-gradient(135deg, #1B4332, #2d6a4f)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Zap size={14} color="#C9A96E" strokeWidth={2.2} />
          </div>
          <div>
            <h2 style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--text-1)", lineHeight: 1.2 }}>
              Feedback Automation
            </h2>
            <p style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "1px" }}>
              Fortiv Form → routing rules → guest & manager actions
            </p>
          </div>
        </div>

        <span style={{
          display: "inline-flex", alignItems: "center", gap: "5px",
          padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600,
          background: isActive ? "#ECFDF5" : "#F3F4F6",
          color: isActive ? "#065F46" : "#6B7280",
          border: `1px solid ${isActive ? "#A7F3D0" : "#E5E7EB"}`,
          flexShrink: 0,
        }}>
          <span style={{
            width: "6px", height: "6px", borderRadius: "50%",
            background: isActive ? "#059669" : "#9CA3AF",
            boxShadow: isActive ? "0 0 5px rgba(5,150,105,0.6)" : "none",
          }} />
          {isActive ? "Active" : "Setup required"}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: "16px 20px 18px" }}>

        {/* Two URL inputs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }} className="auto-inputs-row">

          {/* Fortiv Form URL */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "7px" }}>
              <Link2 size={12} color="#6B7280" />
              <label style={{ fontSize: "11px", fontWeight: 600, color: "#374151" }}>
                Fortiv Form Link
              </label>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <input
                type="url"
                value={formUrl}
                onChange={e => setFormUrl(e.target.value)}
                placeholder="https://forms.fortiv.in/…"
                style={{
                  flex: 1, padding: "8px 11px",
                  border: `1.5px solid ${formUrl ? "#A7F3D0" : "var(--border)"}`,
                  borderRadius: "9px", fontSize: "12px", color: "var(--text-1)",
                  background: formUrl ? "#F7FEFF" : "#FAFAFA",
                  outline: "none", fontFamily: "'Inter', sans-serif",
                  transition: "border-color 150ms, background 150ms, box-shadow 150ms",
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = "#C9A96E";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(201,169,110,0.1)";
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = e.currentTarget.value ? "#A7F3D0" : "var(--border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <button
                onClick={() => copy("form")}
                disabled={!formUrl}
                title="Copy link"
                style={{
                  width: "34px", height: "34px", borderRadius: "9px", flexShrink: 0,
                  border: "1.5px solid var(--border)",
                  background: copiedField === "form" ? "#ECFDF5" : "#FFFFFF",
                  cursor: formUrl ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: formUrl ? 1 : 0.4,
                  transition: "background 150ms",
                }}
              >
                {copiedField === "form"
                  ? <Check size={13} color="#059669" strokeWidth={2.5} />
                  : <Copy size={13} color="#6B7280" />
                }
              </button>
            </div>
            <p style={{ fontSize: "10.5px", color: "#9CA3AF", marginTop: "5px" }}>
              Sent to guests 30 min after checkout via WhatsApp
            </p>
          </div>

          {/* Google Review URL */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "7px" }}>
              <Star size={12} color="#C9A96E" fill="#C9A96E" />
              <label style={{ fontSize: "11px", fontWeight: 600, color: "#374151" }}>
                Google Review Link
              </label>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <input
                type="url"
                value={reviewUrl}
                onChange={e => setReviewUrl(e.target.value)}
                placeholder="https://g.page/r/…/review"
                style={{
                  flex: 1, padding: "8px 11px",
                  border: `1.5px solid ${reviewUrl ? "#A7F3D0" : "var(--border)"}`,
                  borderRadius: "9px", fontSize: "12px", color: "var(--text-1)",
                  background: reviewUrl ? "#F7FEFF" : "#FAFAFA",
                  outline: "none", fontFamily: "'Inter', sans-serif",
                  transition: "border-color 150ms, background 150ms, box-shadow 150ms",
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = "#C9A96E";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(201,169,110,0.1)";
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = e.currentTarget.value ? "#A7F3D0" : "var(--border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <button
                onClick={() => copy("review")}
                disabled={!reviewUrl}
                title="Copy link"
                style={{
                  width: "34px", height: "34px", borderRadius: "9px", flexShrink: 0,
                  border: "1.5px solid var(--border)",
                  background: copiedField === "review" ? "#ECFDF5" : "#FFFFFF",
                  cursor: reviewUrl ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: reviewUrl ? 1 : 0.4,
                  transition: "background 150ms",
                }}
              >
                {copiedField === "review"
                  ? <Check size={13} color="#059669" strokeWidth={2.5} />
                  : <Copy size={13} color="#6B7280" />
                }
              </button>
            </div>
            <p style={{ fontSize: "10.5px", color: "#9CA3AF", marginTop: "5px" }}>
              Auto-shared with guests who rate 4–5 stars
            </p>
          </div>
        </div>

        {/* Routing rules */}
        <div style={{
          background: "#F8F7F5",
          border: "1px solid #EDE8E1",
          borderRadius: "11px",
          padding: "12px 16px",
          display: "flex", alignItems: "center",
          gap: "8px", flexWrap: "wrap",
        }}>
          <span style={{
            fontSize: "10px", fontWeight: 700, color: "#9CA3AF",
            letterSpacing: "0.08em", textTransform: "uppercase",
          }}>
            Rules
          </span>

          <div style={{
            background: "#1B4332", borderRadius: "8px", padding: "5px 11px",
            boxShadow: "0 2px 8px rgba(27,67,50,0.2)",
          }}>
            <span style={{ fontSize: "11.5px", fontWeight: 600, color: "#C9A96E" }}>Form Response</span>
          </div>

          <ChevronRight size={13} color="#C0B8AE" />

          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{
                background: "#ECFDF5", border: "1px solid #A7F3D0",
                borderRadius: "7px", padding: "3px 10px",
                fontSize: "11px", fontWeight: 600, color: "#065F46",
                whiteSpace: "nowrap",
              }}>
                ★★★★ 4–5 stars
              </span>
              <ChevronRight size={12} color="#C0B8AE" />
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "4px",
                background: "#ECFDF5", border: "1px solid #6EE7B7",
                borderRadius: "7px", padding: "3px 10px",
                fontSize: "11px", fontWeight: 600, color: "#065F46",
                whiteSpace: "nowrap",
              }}>
                <Star size={10} color="#059669" fill="#059669" />
                Google Review link sent to guest
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{
                background: "#FEF2F2", border: "1px solid #FECACA",
                borderRadius: "7px", padding: "3px 10px",
                fontSize: "11px", fontWeight: 600, color: "#991B1B",
                whiteSpace: "nowrap",
              }}>
                ★★ 1–3 stars
              </span>
              <ChevronRight size={12} color="#C0B8AE" />
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "4px",
                background: "#FEF2F2", border: "1px solid #FECACA",
                borderRadius: "7px", padding: "3px 10px",
                fontSize: "11px", fontWeight: 600, color: "#991B1B",
                whiteSpace: "nowrap",
              }}>
                <AlertTriangle size={10} color="#DC2626" />
                GM + MD alerted via WhatsApp
              </span>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .auto-inputs-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
