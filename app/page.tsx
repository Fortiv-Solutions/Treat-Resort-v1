"use client";

import { useEffect, useState } from "react";
import { type Role, ROLES } from "@/lib/data";
import type { DashboardPayload } from "@/lib/dashboardData";
import Sidebar from "@/components/Sidebar";
import FeedbackModule from "@/components/FeedbackModule";
import InboxModule from "@/components/InboxModule";
import FinanceModule from "@/components/FinanceModule";
import { LayoutDashboard, Inbox, Bell, Search, PieChart, HelpCircle, ChevronDown } from "lucide-react";

type Module = "feedback" | "inbox" | "finance";

const MODULE_META: Record<Module, { title: string; subtitle: string; icon: typeof LayoutDashboard }> = {
  feedback: { title: "Guest Feedback & Reviews", subtitle: "Automated feedback collection, Google review funneling, and complaint alerts", icon: LayoutDashboard },
  inbox:    { title: "Unified Email Inbox",       subtitle: "Email thread management from Supabase",   icon: Inbox },
  finance:  { title: "Finance Intelligence",      subtitle: "Revenue, occupancy, receivables, and Tally metadata from Supabase", icon: PieChart },
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
    <div className="min-h-screen bg-[#f6f8fa] flex">
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
        <header className="sticky top-0 z-40 bg-[#f6f8fa] px-4 sm:px-8 h-[88px] flex items-center justify-between gap-4">
          {/* Page title */}
          <div className="flex items-center min-w-0">
            <h1 className="text-xl sm:text-[22px] font-bold text-brand-text-1 leading-tight truncate">
              {meta.title === "Finance Intelligence" ? "Dashboard" : meta.title}
            </h1>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-white rounded-full px-4 h-10 shadow-sm transition-all duration-200 focus-within:ring-2 focus-within:ring-brand-gold/20 w-[240px] lg:w-[280px]">
              <Search className="w-4 h-4 text-brand-text-3 shrink-0" />
              <input
                placeholder="Search anything..."
                className="border-none bg-transparent outline-none text-[13px] text-brand-text-1 flex-1 min-w-0 placeholder:text-brand-text-3 h-full"
              />
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[10px] font-bold text-brand-text-3 bg-brand-surface-2 px-1.5 py-0.5 rounded leading-none flex items-center justify-center h-5">K</span>
                <span className="text-[10px] font-bold text-brand-text-3 bg-brand-surface-2 px-1.5 py-0.5 rounded leading-none flex items-center justify-center h-5">⌘</span>
              </div>
            </div>

            {/* Notifications */}
            <button
              className="w-10 h-10 shrink-0 rounded-full bg-white flex items-center justify-center relative transition-all duration-200 hover:shadow-md shadow-sm text-brand-text-2 hover:text-brand-text-1"
              aria-label="Open notifications"
            >
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            {/* Help */}
            <button
              className="w-10 h-10 shrink-0 rounded-full bg-white flex items-center justify-center transition-all duration-200 hover:shadow-md shadow-sm text-brand-text-2 hover:text-brand-text-1"
              aria-label="Help desk"
            >
              <HelpCircle className="w-[18px] h-[18px]" />
            </button>

            {/* Profile / Role Selector */}
            <div className="relative group cursor-pointer h-10 flex items-center">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <div className="flex items-center gap-2.5 bg-white rounded-full p-1 pr-3.5 shadow-sm group-hover:shadow-md transition-shadow h-10">
                <div className="w-8 h-8 shrink-0 rounded-full bg-brand-green-900 flex items-center justify-center text-brand-gold text-xs font-bold overflow-hidden">
                  <img src="https://ui-avatars.com/api/?name=Admin&background=0F5132&color=fff" alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div className="hidden sm:flex flex-col justify-center min-w-0">
                  <div className="text-[13px] font-bold text-brand-text-1 leading-none mb-0.5">
                    {ROLES.find(r => r.value === role)?.label.split(" - ")[1] ?? "Admin"}
                  </div>
                  <div className="text-[10px] text-brand-text-3 leading-none">
                    {ROLES.find(r => r.value === role)?.label.split(" - ")[0]}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-brand-text-3 shrink-0 hidden sm:block" />
              </div>
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
