"use client";

import { useEffect, useState } from "react";
import type { FormConfig } from "@/lib/formBuilderTypes";

interface Props {
  form: FormConfig;
  updateForm: (updater: (prev: FormConfig) => FormConfig) => void;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.55)", marginBottom: "6px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
      {children}
    </label>
  );
}

function inputStyle(focused?: boolean): React.CSSProperties {
  return {
    width: "100%", padding: "9px 12px",
    background: "rgba(255,255,255,0.06)",
    border: `1.5px solid ${focused ? "rgba(201,169,110,0.5)" : "rgba(255,255,255,0.1)"}`,
    borderRadius: "9px", fontSize: "13px",
    color: "#FFFFFF", outline: "none",
    fontFamily: "'Inter', sans-serif",
    transition: "border-color 150ms",
    boxSizing: "border-box",
  };
}

type PropertyOption = {
  id: string;
  name: string;
  gm_email: string;
  whatsapp_number: string | null;
  google_review_link: string | null;
};

export default function FormSettingsSection({ form, updateForm }: Props) {
  const s = form.settings;
  const [properties, setProperties] = useState<PropertyOption[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/properties")
      .then(response => response.ok ? response.json() : [])
      .then((rows: PropertyOption[]) => {
        if (!active) return;
        setProperties(rows);
        if (!s.propertyId && rows[0]) {
          updateForm(prev => ({
            ...prev,
            settings: {
              ...prev.settings,
              propertyId: rows[0].id,
              propertyName: rows[0].name,
            },
            routing: {
              ...prev.routing,
              gmEmail: rows[0].gm_email,
              reviewLink: rows[0].google_review_link ?? prev.routing.reviewLink,
              whatsappNumber: rows[0].whatsapp_number ?? prev.routing.whatsappNumber,
            },
          }));
        } else if (!s.propertyId && rows.length === 0) {
          updateForm(prev => ({
            ...prev,
            settings: {
              ...prev.settings,
              propertyId: "treat-resorts",
              propertyName: "Treat Resorts",
            },
          }));
        }
      })
      .catch(() => {
        if (active) setProperties([]);
      });
    return () => { active = false; };
  }, [s.propertyId, updateForm]);

  function setField<K extends keyof typeof s>(key: K, value: typeof s[K]) {
    updateForm(prev => ({ ...prev, settings: { ...prev.settings, [key]: value } }));
  }

  function handlePropertyChange(id: string) {
    const prop = properties.find(p => p.id === id);
    if (!prop) return;
    updateForm(prev => ({
      ...prev,
      settings: { ...prev.settings, propertyId: id, propertyName: prop.name },
      routing: {
        ...prev.routing,
        gmEmail: prop.gm_email,
        reviewLink: prop.google_review_link ?? prev.routing.reviewLink,
        whatsappNumber: prop.whatsapp_number ?? prev.routing.whatsappNumber,
      },
    }));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* Property */}
      <div>
        <FieldLabel>Property</FieldLabel>
        <select
          value={s.propertyId}
          onChange={e => handlePropertyChange(e.target.value)}
          disabled={properties.length === 0}
          style={{ ...inputStyle(), cursor: "pointer" }}
        >
          {properties.length === 0 && (
            <option value="" style={{ background: "#1B4332", color: "#fff" }}>
              No active properties in database
            </option>
          )}
          {properties.map(p => (
            <option key={p.id} value={p.id} style={{ background: "#1B4332", color: "#fff" }}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {properties.length === 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "10px" }}>
          <div>
            <FieldLabel>Property ID</FieldLabel>
            <input
              type="text"
              value={s.propertyId}
              onChange={e => setField("propertyId", e.target.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
              style={inputStyle()}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(201,169,110,0.5)")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>
          <div>
            <FieldLabel>Property Name</FieldLabel>
            <input
              type="text"
              value={s.propertyName}
              onChange={e => setField("propertyName", e.target.value)}
              style={inputStyle()}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(201,169,110,0.5)")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>
        </div>
      )}

      {/* Title */}
      <div>
        <FieldLabel>Form Title</FieldLabel>
        <input
          type="text"
          value={s.title}
          onChange={e => setField("title", e.target.value)}
          placeholder="Tell Us About Your Stay"
          style={inputStyle()}
          onFocus={e => (e.currentTarget.style.borderColor = "rgba(201,169,110,0.5)")}
          onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
        />
      </div>

      {/* Description */}
      <div>
        <FieldLabel>Form Description</FieldLabel>
        <textarea
          value={s.description}
          onChange={e => setField("description", e.target.value)}
          placeholder="Short subtitle shown below the form title…"
          rows={2}
          style={{ ...inputStyle(), resize: "vertical", lineHeight: 1.5 }}
          onFocus={e => (e.currentTarget.style.borderColor = "rgba(201,169,110,0.5)")}
          onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
        />
      </div>

      {/* Language */}
      <div>
        <FieldLabel>Language</FieldLabel>
        <select
          value={s.language}
          onChange={e => setField("language", e.target.value)}
          style={{ ...inputStyle(), cursor: "pointer" }}
        >
          {["English", "Hindi", "Gujarati", "Marathi"].map(l => (
            <option key={l} value={l} style={{ background: "#1B4332", color: "#fff" }}>{l}</option>
          ))}
        </select>
      </div>

      {/* Collect fields */}
      <div>
        <FieldLabel>Collect from Guest</FieldLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {([
            ["collectGuestName",  "Guest Name"],
            ["collectGuestEmail", "Email Address"],
            ["collectGuestPhone", "Phone Number"],
            ["collectRoomNumber", "Room Number"],
          ] as const).map(([key, label]) => (
            <label key={key} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
              <div
                onClick={() => setField(key, !s[key])}
                style={{
                  width: "36px", height: "20px", borderRadius: "10px", flexShrink: 0,
                  background: s[key] ? "#C9A96E" : "rgba(255,255,255,0.12)",
                  position: "relative", cursor: "pointer",
                  transition: "background 200ms",
                }}
              >
                <div style={{
                  position: "absolute", top: "3px",
                  left: s[key] ? "18px" : "3px",
                  width: "14px", height: "14px", borderRadius: "50%",
                  background: s[key] ? "#1B4332" : "rgba(255,255,255,0.5)",
                  transition: "left 200ms var(--ease-out-expo)",
                }} />
              </div>
              <span style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.75)", userSelect: "none" }}>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Expiry */}
      <div>
        <FieldLabel>Expiry Date (optional)</FieldLabel>
        <input
          type="datetime-local"
          value={s.expiresAt ? s.expiresAt.slice(0, 16) : ""}
          onChange={e => setField("expiresAt", e.target.value)}
          style={inputStyle()}
          onFocus={e => (e.currentTarget.style.borderColor = "rgba(201,169,110,0.5)")}
          onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
        />
      </div>

      {/* Active toggle */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 14px", borderRadius: "10px",
        background: s.isActive ? "rgba(5,150,105,0.12)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${s.isActive ? "rgba(5,150,105,0.25)" : "rgba(255,255,255,0.08)"}`,
      }}>
        <div>
          <div style={{ fontSize: "12.5px", fontWeight: 600, color: s.isActive ? "#6EE7B7" : "rgba(255,255,255,0.5)" }}>
            {s.isActive ? "Form is Active" : "Form is Inactive"}
          </div>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>
            {s.isActive ? "Accepting responses" : "Not accepting responses"}
          </div>
        </div>
        <div
          onClick={() => setField("isActive", !s.isActive)}
          style={{
            width: "40px", height: "22px", borderRadius: "11px", flexShrink: 0,
            background: s.isActive ? "#059669" : "rgba(255,255,255,0.12)",
            position: "relative", cursor: "pointer",
            transition: "background 200ms",
          }}
        >
          <div style={{
            position: "absolute", top: "3px",
            left: s.isActive ? "20px" : "3px",
            width: "16px", height: "16px", borderRadius: "50%",
            background: "#FFFFFF",
            transition: "left 200ms var(--ease-out-expo)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          }} />
        </div>
      </div>

    </div>
  );
}
