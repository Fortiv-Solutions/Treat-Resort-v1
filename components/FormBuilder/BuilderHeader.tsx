"use client";

import { useState } from "react";
import type { FormConfig, Toast } from "@/lib/formBuilderTypes";
import { Download, Save, Sparkles, ChevronLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  form: FormConfig;
  updateForm: (updater: (prev: FormConfig) => FormConfig) => void;
  addToast: (msg: string, type?: Toast["type"]) => void;
}

export default function BuilderHeader({ form, updateForm, addToast }: Props) {
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || `Save failed with status ${response.status}`);
      }

      if (!data?.form) {
        throw new Error("Save response did not include the saved form.");
      }

      updateForm(() => data.form);
      addToast("Form saved to database", "success");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown save error";
      addToast(`Failed to save: ${message}`, "error");
    } finally {
      setSaving(false);
    }
  }

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

  return (
    <header style={{
      background: "rgba(255,255,255,0.85)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(0,0,0,0.05)",
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
          color: "rgba(0,0,0,0.6)", textDecoration: "none",
          fontSize: "12px", fontWeight: 500,
          transition: "color 150ms",
          whiteSpace: "nowrap",
        }}
          onMouseEnter={e => (e.currentTarget.style.color = "#000")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(0,0,0,0.6)")}
        >
          <ChevronLeft size={14} />
          Dashboard
        </Link>

        <div style={{ width: "1px", height: "20px", background: "rgba(0,0,0,0.1)" }} />

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "9px",
            background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <Sparkles size={14} color="#ffffff" strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
              Feedback Form Builder
            </div>
            <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.5)", marginTop: "1px" }}>
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
          background: "rgba(5,150,105,0.12)",
          border: "1px solid rgba(5,150,105,0.2)",
          fontSize: "11.5px", fontWeight: 600,
          color: "#064e3b",
          whiteSpace: "nowrap",
          display: "inline-flex", alignItems: "center", gap: "5px",
        }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#059669", flexShrink: 0 }} />
          {form.settings.propertyName}
        </span>

        <button
          onClick={handleExport}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "8px 14px", borderRadius: "9px",
            background: "rgba(0,0,0,0.03)",
            border: "1px solid rgba(0,0,0,0.08)",
            color: "rgba(0,0,0,0.7)", fontSize: "12px", fontWeight: 500,
            cursor: "pointer", transition: "background 150ms, border-color 150ms",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,0,0,0.06)"; e.currentTarget.style.borderColor = "rgba(0,0,0,0.12)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,0,0,0.03)"; e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)"; }}
        >
          <Download size={13} />
          Export
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "8px 16px", borderRadius: "9px",
            background: saving ? "rgba(5,150,105,0.6)" : "linear-gradient(135deg, #059669 0%, #047857 100%)",
            border: "none",
            color: "#ffffff", fontSize: "12px", fontWeight: 700,
            cursor: saving ? "not-allowed" : "pointer",
            transition: "opacity 150ms",
            boxShadow: "0 2px 12px rgba(5,150,105,0.35)",
            whiteSpace: "nowrap",
          }}
        >
          <Save size={13} />
          {saving ? "Saving..." : "Save Form"}
        </button>
      </div>
    </header>
  );
}
