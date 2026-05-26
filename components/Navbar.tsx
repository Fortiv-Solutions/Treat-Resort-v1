"use client";

import { type Role, ROLES } from "@/lib/data";
import { ChevronDown } from "lucide-react";

type Module = "feedback" | "inbox";

interface NavbarProps {
  activeModule: Module;
  setActiveModule: (m: Module) => void;
  role: Role;
  setRole: (r: Role) => void;
}

export default function Navbar({ activeModule, setActiveModule, role, setRole }: NavbarProps) {
  return (
    <nav style={{
      backgroundColor: "#1B4332",
      padding: "0 32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: "68px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
        <span style={{ color: "#C9A96E", fontWeight: 800, fontSize: "17px", letterSpacing: "0.06em" }}>
          TREAT
        </span>
        <span style={{ color: "#C9A96E", fontWeight: 400, fontSize: "11px", letterSpacing: "0.12em", opacity: 0.85 }}>
          HOTELS & RESORTS
        </span>
      </div>

      {/* Module Tabs */}
      <div style={{
        display: "flex",
        gap: "4px",
        backgroundColor: "rgba(255,255,255,0.08)",
        borderRadius: "10px",
        padding: "4px",
      }}>
        {([
          { key: "feedback", label: "Guest Feedback & Reviews" },
          { key: "inbox", label: "Unified Inbox" },
        ] as { key: Module; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveModule(key)}
            style={{
              padding: "8px 22px",
              borderRadius: "7px",
              border: "none",
              cursor: "pointer",
              fontSize: "13.5px",
              fontWeight: activeModule === key ? 600 : 400,
              backgroundColor: activeModule === key ? "#C9A96E" : "transparent",
              color: activeModule === key ? "#1B4332" : "rgba(255,255,255,0.75)",
              transition: "all 0.2s ease",
              fontFamily: "'Inter', sans-serif",
              letterSpacing: "0.01em",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Role Selector */}
      <div style={{ position: "relative" }}>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          style={{
            appearance: "none",
            backgroundColor: "rgba(201,169,110,0.15)",
            border: "1.5px solid rgba(201,169,110,0.5)",
            borderRadius: "8px",
            color: "#C9A96E",
            fontSize: "13px",
            fontWeight: 500,
            padding: "8px 36px 8px 14px",
            cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
            outline: "none",
            minWidth: "200px",
          }}
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value} style={{ backgroundColor: "#1B4332", color: "#C9A96E" }}>
              {r.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#C9A96E",
            pointerEvents: "none",
          }}
        />
      </div>
    </nav>
  );
}
