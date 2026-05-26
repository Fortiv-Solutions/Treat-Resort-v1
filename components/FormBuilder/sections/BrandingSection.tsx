"use client";

import type { FormConfig } from "@/lib/formBuilderTypes";

interface Props {
  form: FormConfig;
  updateForm: (updater: (prev: FormConfig) => FormConfig) => void;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display: "block", fontSize: "10.5px", fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: "6px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
      {children}
    </label>
  );
}

function iStyle(): React.CSSProperties {
  return {
    width: "100%", padding: "9px 12px",
    background: "rgba(255,255,255,0.06)",
    border: "1.5px solid rgba(255,255,255,0.1)",
    borderRadius: "9px", fontSize: "13px",
    color: "#FFFFFF", outline: "none",
    fontFamily: "'Inter', sans-serif",
    boxSizing: "border-box",
  };
}

export default function BrandingSection({ form, updateForm }: Props) {
  const b = form.branding;

  function setB<K extends keyof typeof b>(key: K, val: typeof b[K]) {
    updateForm(prev => ({ ...prev, branding: { ...prev.branding, [key]: val } }));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* Header text */}
      <div>
        <FieldLabel>Header Text</FieldLabel>
        <input type="text" value={b.headerText} onChange={e => setB("headerText", e.target.value)}
          placeholder="Treat Hotels & Resorts" style={iStyle()}
          onFocus={e => (e.currentTarget.style.borderColor = "rgba(201,169,110,0.4)")}
          onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
        />
      </div>

      {/* Logo URL */}
      <div>
        <FieldLabel>Logo URL (optional)</FieldLabel>
        <input type="url" value={b.logoUrl} onChange={e => setB("logoUrl", e.target.value)}
          placeholder="https://…/logo.png" style={iStyle()}
          onFocus={e => (e.currentTarget.style.borderColor = "rgba(201,169,110,0.4)")}
          onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
        />
      </div>

      {/* Colors */}
      <div>
        <FieldLabel>Colors</FieldLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
          {([
            ["Primary", "primaryColor"],
            ["Accent",  "accentColor"],
            ["Background", "bgColor"],
          ] as const).map(([label, key]) => (
            <div key={key} style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <div style={{ fontSize: "10.5px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{label}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <input
                  type="color"
                  value={b[key]}
                  onChange={e => setB(key, e.target.value)}
                  style={{
                    width: "32px", height: "32px", padding: "2px",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "8px", cursor: "pointer",
                    background: "rgba(255,255,255,0.06)",
                  }}
                />
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>
                  {b[key]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Font */}
      <div>
        <FieldLabel>Font Family</FieldLabel>
        <select value={b.fontFamily} onChange={e => setB("fontFamily", e.target.value)}
          style={{ ...iStyle(), cursor: "pointer" }}>
          {["Professional Sans", "Aptos", "Segoe UI", "Helvetica Neue"].map(f => (
            <option key={f} value={f} style={{ background: "#1a3d2c" }}>{f}</option>
          ))}
        </select>
      </div>

      {/* Thank you */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <FieldLabel>Thank You Screen</FieldLabel>
        <div>
          <div style={{ fontSize: "10.5px", color: "rgba(255,255,255,0.4)", fontWeight: 500, marginBottom: "5px" }}>Title</div>
          <input type="text" value={b.thankYouTitle} onChange={e => setB("thankYouTitle", e.target.value)}
            placeholder="Thank You for Your Feedback!" style={iStyle()}
            onFocus={e => (e.currentTarget.style.borderColor = "rgba(201,169,110,0.4)")}
            onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
          />
        </div>
        <div>
          <div style={{ fontSize: "10.5px", color: "rgba(255,255,255,0.4)", fontWeight: 500, marginBottom: "5px" }}>Message</div>
          <textarea value={b.thankYouMessage} onChange={e => setB("thankYouMessage", e.target.value)}
            placeholder="Your experience matters…" rows={2}
            style={{ ...iStyle(), resize: "vertical", lineHeight: 1.5 }}
            onFocus={e => (e.currentTarget.style.borderColor = "rgba(201,169,110,0.4)")}
            onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
          />
        </div>
      </div>

      {/* Preview chip */}
      <div style={{
        padding: "12px 14px", borderRadius: "11px",
        background: `${b.primaryColor}22`,
        border: `1px solid ${b.primaryColor}44`,
        display: "flex", alignItems: "center", gap: "10px",
      }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: b.primaryColor, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: "12.5px", fontWeight: 700, color: b.accentColor }}>{b.headerText}</div>
          <div style={{ fontSize: "10.5px", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>Brand preview</div>
        </div>
        <div style={{ marginLeft: "auto", width: "24px", height: "24px", borderRadius: "6px", background: b.accentColor, flexShrink: 0 }} />
      </div>
    </div>
  );
}
