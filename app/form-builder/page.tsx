"use client";

import { useState } from "react";
import FormBuilderApp from "@/components/FormBuilder/FormBuilderApp";
import Sidebar from "@/components/Sidebar";
import { type Role } from "@/lib/data";

export default function FormBuilderPage() {
  const [role, setRole] = useState<Role>("MD");
  const [activeModule, setActiveModule] = useState<"feedback" | "inbox" | "finance">("feedback");

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        role={role}
        setRole={setRole}
      />
      <FormBuilderApp />
    </div>
  );
}
