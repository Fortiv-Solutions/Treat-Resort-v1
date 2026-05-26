"use client";

import { useState } from "react";
import { type Role } from "@/lib/data";
import Sidebar from "@/components/Sidebar";
import FeedbackModule from "@/components/FeedbackModule";
import InboxModule from "@/components/InboxModule";
import FinanceModule from "@/components/FinanceModule";
import { LayoutDashboard, Inbox, Bell, Search, TrendingUp } from "lucide-react";

type Module = "feedback" | "inbox" | "finance";

const MODULE_META: Record<Module, { title: string; subtitle: string; icon: typeof LayoutDashboard }> = {
  feedback: { title: "Guest Feedback & Reviews", subtitle: "Automated feedback collection, Google review funnelling & complaint alerts", icon: LayoutDashboard },
  inbox:    { title: "Unified Email Inbox",       subtitle: "All 12 properties · centralized email management & response tracking",    icon: Inbox },
  finance:  { title: "Finance Intelligence",      subtitle: "Revenue · occupancy · receivables · all 12 properties from Tally ERP",   icon: TrendingUp },
};

export default function Dashboard() {
  const [activeModule, setActiveModule] = useState<Module>("feedback");
  const [role, setRole] = useState<Role>("MD");

  const meta = MODULE_META[activeModule];
  const Icon = meta.icon;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>

      {/* ── Sidebar ── */}
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        role={role}
        setRole={setRole}
      />

      {/* ── Main ── */}
      <div style={{
        flex: 1,
        marginLeft: "var(--sidebar-current-w)",
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        transition: "margin-left var(--dur-slow) var(--ease-out-expo)",
      }} className="main-area">

        {/* Top Header */}
        <header style={{
          position: "sticky", top: 0, zIndex: 200,
          background: "rgba(246,242,234,0.92)",
          backdropFilter: "blur(20px) saturate(160%)",
          WebkitBackdropFilter: "blur(20px) saturate(160%)",
          borderBottom: "1px solid var(--border-soft)",
          padding: "0 32px",
          height: "68px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}>
          {/* Page title */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: 0 }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "11px",
              background: "linear-gradient(135deg, #1B4332 0%, #2d6a4f 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 2px 8px rgba(27,67,50,0.25)",
            }}>
              <Icon size={17} color="#C9A96E" />
            </div>
            <div style={{ minWidth: 0 }}>
              <h1 style={{
                fontSize: "14px", fontWeight: 700, color: "var(--text-1)",
                lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis",
                whiteSpace: "nowrap", margin: 0,
                fontFamily: "'Karla', sans-serif", letterSpacing: "0.01em",
              }}>
                {meta.title}
              </h1>
              <p style={{
                fontSize: "11px", color: "var(--text-3)", marginTop: "2px",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                letterSpacing: "0.01em",
              }}>
                {meta.subtitle}
              </p>
            </div>
          </div>

          {/* Right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            {/* Search */}
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "rgba(255,255,255,0.8)", border: "1.5px solid var(--border)",
              borderRadius: "10px", padding: "8px 14px",
              transition: "border-color 150ms ease, box-shadow 150ms ease",
            }}
              onFocus={e => { e.currentTarget.style.borderColor = "#C9A96E"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(201,169,110,0.14)"; }}
              onBlur={e  => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <Search size={13} color="var(--text-3)" />
              <input
                placeholder="Search…"
                style={{
                  border: "none", background: "transparent", outline: "none",
                  fontSize: "13px", color: "var(--text-1)", width: "130px",
                  fontFamily: "'Karla', 'Inter', sans-serif",
                }}
              />
            </div>

            {/* Notifications */}
            <button style={{
              width: "40px", height: "40px", borderRadius: "10px",
              background: "rgba(255,255,255,0.8)", border: "1.5px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", position: "relative",
              transition: "border-color 150ms, background 150ms, box-shadow 150ms",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#C9A96E"; e.currentTarget.style.background = "#FFFFFF"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(201,169,110,0.15)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "rgba(255,255,255,0.8)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <Bell size={15} color="var(--text-2)" />
              <span style={{
                position: "absolute", top: "8px", right: "8px",
                width: "7px", height: "7px", borderRadius: "50%",
                background: "#DC2626", border: "1.5px solid var(--bg)",
              }} />
            </button>

            {/* Date badge */}
            <div style={{
              padding: "8px 16px", borderRadius: "10px",
              background: "rgba(255,255,255,0.8)", border: "1.5px solid var(--border)",
              fontSize: "12px", fontWeight: 600, color: "var(--text-2)",
              whiteSpace: "nowrap", letterSpacing: "0.02em",
            }}>
              May 2026
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{
          flex: 1, padding: "28px 32px",
          maxWidth: "1400px", width: "100%", margin: "0 auto",
        }}>
          {activeModule === "feedback"
            ? <FeedbackModule key={role} role={role} />
            : activeModule === "inbox"
            ? <InboxModule    key={role} role={role} />
            : <FinanceModule  key={role} role={role} />
          }
        </main>
      </div>

      {/* Responsive sidebar margin */}
      <style>{`
        @media (max-width: 1023px) {
          .main-area { margin-left: var(--sidebar-w-col) !important; }
        }
        @media (max-width: 767px) {
          .main-area { margin-left: 0 !important; padding-top: 68px; }
        }
      `}</style>
    </div>
  );
}
