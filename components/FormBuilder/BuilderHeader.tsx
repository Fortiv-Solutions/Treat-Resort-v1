"use client";

import type { FormConfig, Toast } from "@/lib/formBuilderTypes";
import { AlertCircle, CheckCircle2, Download, Loader2, Sparkles, ChevronLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  form: FormConfig;
  autosaveStatus: "idle" | "saving" | "saved" | "error";
  autosaveMessage: string;
  addToast: (msg: string, type?: Toast["type"]) => void;
}

export default function BuilderHeader({ form, autosaveStatus, autosaveMessage, addToast }: Props) {
  function handleExport() {
    const json = JSON.stringify(form, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `treat-feedback-form-${form.settings.propertyId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("Form exported as JSON", "info");
  }

  const StatusIcon =
    autosaveStatus === "saving" ? Loader2 :
    autosaveStatus === "error" ? AlertCircle :
    CheckCircle2;
  const statusColor =
    autosaveStatus === "error" ? "#FCA5A5" :
    autosaveStatus === "saving" ? "#FDE68A" :
    "#6EE7B7";

  return (
    <header style={{
      background: "rgba(15,42,32,0.85)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(201,169,110,0.2)",
      padding: "0 24px",
      height: "64px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "16px",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      {/* Left: back + brand */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <Link href="/" style={{
          display: "flex", alignItems: "center", gap: "6px",
          color: "rgba(201,169,110,0.7)", textDecoration: "none",
          fontSize: "12px", fontWeight: 500,
          transition: "color 150ms",
          whiteSpace: "nowrap",
        }}
          onMouseEnter={e => (e.currentTarget.style.color = "#C9A96E")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(201,169,110,0.7)")}
        >
          <ChevronLeft size={14} />
          Dashboard
        </Link>

        <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.1)" }} />

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "9px",
            background: "linear-gradient(135deg, #C9A96E 0%, #b8935a 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <Sparkles size={14} color="#1B4332" strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#FFFFFF", lineHeight: 1.2 }}>
              Feedback Form Builder
            </div>
            <div style={{ fontSize: "11px", color: "rgba(201,169,110,0.75)", marginTop: "1px" }}>
              Treat Hotels & Resorts
            </div>
          </div>
        </div>
      </div>

      {/* Right: actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Property badge */}
        <span style={{
          padding: "5px 12px", borderRadius: "20px",
          background: "rgba(201,169,110,0.12)",
          border: "1px solid rgba(201,169,110,0.2)",
          fontSize: "11.5px", fontWeight: 500,
          color: "rgba(201,169,110,0.9)",
          whiteSpace: "nowrap",
          display: "inline-flex", alignItems: "center", gap: "5px",
        }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#C9A96E", flexShrink: 0 }} />
          {form.settings.propertyName}
        </span>

        <button
          onClick={handleExport}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "8px 14px", borderRadius: "9px",
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.8)", fontSize: "12px", fontWeight: 500,
            cursor: "pointer", transition: "background 150ms, border-color 150ms",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
        >
          <Download size={13} />
          Export
        </button>

        <div style={{
          display: "flex", alignItems: "center", gap: "7px",
          padding: "8px 12px", borderRadius: "9px",
          background: "rgba(255,255,255,0.07)",
          border: `1px solid ${autosaveStatus === "error" ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.12)"}`,
          color: statusColor,
          fontSize: "11.5px", fontWeight: 650,
          maxWidth: "260px",
          whiteSpace: "nowrap",
        }}>
          <StatusIcon size={13} style={{ flexShrink: 0, animation: autosaveStatus === "saving" ? "spin 900ms linear infinite" : "none" }} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{autosaveMessage}</span>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </header>
  );
}
