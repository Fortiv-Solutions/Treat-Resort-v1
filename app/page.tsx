"use client";

import { useEffect, useState } from "react";
import { type Role } from "@/lib/data";
import type { DashboardPayload } from "@/lib/dashboardData";
import Sidebar from "@/components/Sidebar";
import FeedbackModule from "@/components/FeedbackModule";
import InboxModule from "@/components/InboxModule";
import FinanceModule from "@/components/FinanceModule";
import { LayoutDashboard, Inbox, Bell, Search, TrendingUp } from "lucide-react";

type Module = "feedback" | "inbox" | "finance";

const MODULE_META: Record<Module, { title: string; subtitle: string; icon: typeof LayoutDashboard }> = {
  feedback: { title: "Guest Feedback & Reviews", subtitle: "Automated feedback collection, Google review funneling, and complaint alerts", icon: LayoutDashboard },
  inbox:    { title: "Unified Email Inbox",       subtitle: "Email thread management from Supabase",   icon: Inbox },
  finance:  { title: "Finance Intelligence",      subtitle: "Revenue, occupancy, receivables, and Tally metadata from Supabase", icon: TrendingUp },
};

export default function Dashboard() {
  const [activeModule, setActiveModule] = useState<Module>("feedback");
  const [role, setRole] = useState<Role>("MD");
  const [dashboardData, setDashboardData] = useState<DashboardPayload | null>(null);

  const meta = MODULE_META[activeModule];
  const Icon = meta.icon;
  const dateLabel = new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" });

  useEffect(() => {
    let active = true;
    fetch("/api/dashboard")
      .then(response => response.ok ? response.json() : null)
      .then(data => { if (active) setDashboardData(data); })
      .catch(() => { if (active) setDashboardData(null); });
    return () => { active = false; };
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg flex">
      {/* ── Sidebar ── */}
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        role={role}
        setRole={setRole}
      />

      {/* ── Main ── */}
      <div className="flex flex-col flex-1 min-h-screen w-full transition-all duration-300 ease-out-expo lg:ml-[248px] peer-data-[collapsed=true]:lg:ml-[72px]">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-brand-border-soft px-4 sm:px-8 h-[72px] flex items-center justify-between gap-4 shadow-sm">
          {/* Page title */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-brand-green-900 to-brand-green-700 flex items-center justify-center shrink-0 shadow-md ring-1 ring-brand-gold/20">
              <Icon className="w-[18px] h-[18px] text-brand-gold" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-bold text-brand-gold-rich tracking-widest uppercase mb-0.5">
                Treat Operations
              </p>
              <h1 className="text-sm sm:text-base font-bold text-brand-text-1 leading-tight truncate font-display">
                {meta.title}
              </h1>
              <p className="hidden sm:block text-[11px] sm:text-xs text-brand-text-3 mt-0.5 truncate">
                {meta.subtitle}
              </p>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-white/60 border border-brand-border rounded-lg px-3 py-2 transition-all duration-200 focus-within:border-brand-gold focus-within:ring-2 focus-within:ring-brand-gold/20 focus-within:bg-white">
              <Search className="w-[14px] h-[14px] text-brand-text-3" />
              <input
                placeholder="Search..."
                className="border-none bg-transparent outline-none text-sm text-brand-text-1 w-[140px] placeholder:text-brand-text-3"
              />
            </div>

            {/* Notifications */}
            <button
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white/60 border border-brand-border flex items-center justify-center relative transition-all duration-200 hover:border-brand-gold hover:bg-white hover:shadow-md"
              aria-label="Open notifications"
            >
              <Bell className="w-[16px] h-[16px] text-brand-text-2" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white" />
            </button>

            {/* Date badge */}
            <div className="hidden sm:block px-3 py-2 rounded-lg bg-white/60 border border-brand-border text-xs font-semibold text-brand-text-2 whitespace-nowrap">
              {dateLabel}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto">
          {activeModule === "feedback"
            ? <FeedbackModule key={role} role={role} data={dashboardData} />
            : activeModule === "inbox"
            ? <InboxModule    key={role} role={role} data={dashboardData} />
            : <FinanceModule  key={role} role={role} data={dashboardData} />
          }
        </main>
      </div>
    </div>
  );
}
