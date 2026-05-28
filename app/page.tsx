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
