"use client";

import { Suspense, useEffect, useState } from "react";
import { type Role } from "@/lib/data";
import type { DashboardPayload } from "@/lib/dashboardData";
import Sidebar from "@/components/Sidebar";
import FeedbackModule from "@/components/FeedbackModule";
import InboxModule from "@/components/InboxModule";
import FinanceModule from "@/components/FinanceModule";
import { useSearchParams } from "next/navigation";

type Module = "feedback" | "inbox" | "finance";

const MODULE_META: Record<Module, { title: string; subtitle: string }> = {
  feedback: { title: "Guest Feedback & Reviews", subtitle: "Automated feedback collection, Google review funneling, and complaint alerts" },
  inbox:    { title: "Unified Email Inbox",       subtitle: "Email thread management from Supabase" },
  finance:  { title: "Finance Intelligence",      subtitle: "Revenue, occupancy, receivables, and Tally metadata from Supabase" },
};

function getModuleFromParam(value: string | null): Module | null {
  return value === "feedback" || value === "inbox" || value === "finance" ? value : null;
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-bg" />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const [selectedModule, setSelectedModule] = useState<Module>("feedback");
  const [role, setRole] = useState<Role>("MD");
  const [dashboardData, setDashboardData] = useState<DashboardPayload | null>(null);

  const activeModule = getModuleFromParam(searchParams.get("module")) ?? selectedModule;
  const meta = MODULE_META[activeModule];

  useEffect(() => {
    let active = true;
    fetch("/api/dashboard")
      .then(response => response.ok ? response.json() : null)
      .then(data => { if (active) setDashboardData(data); })
      .catch(() => { if (active) setDashboardData(null); });
    return () => { active = false; };
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      {/* ── Sidebar ── */}
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setSelectedModule}
        role={role}
        setRole={setRole}
      />

      {/* ── Main ── */}
      <div className="app-content-shell">
        {/* Top Header */}
        <header className="bg-transparent px-4 sm:px-8 h-[88px] flex items-center gap-4">
          {/* Page title */}
          <div className="flex items-center min-w-0">
            <h1 className="text-xl sm:text-[22px] font-bold text-brand-text-1 leading-tight truncate">
              {activeModule === "feedback" ? "Guest Feedback" : meta.title === "Finance Intelligence" ? "Dashboard" : meta.title}
            </h1>
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
