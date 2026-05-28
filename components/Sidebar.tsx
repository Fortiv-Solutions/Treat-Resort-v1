"use client";

import { useState } from "react";
import { type Role, ROLES } from "@/lib/data";
import {
  LayoutDashboard,
  Inbox,
  Menu,
  ClipboardList,
  PieChart,
  ChevronDown,
  Settings,
  HelpCircle,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type Module = "feedback" | "inbox" | "finance";

interface SidebarProps {
  activeModule: Module;
  setActiveModule: (m: Module) => void;
  role: Role;
  setRole: (r: Role) => void;
}

const MODULE_ITEMS = [
  { key: "inbox" as Module, icon: Inbox, label: "Message" },
  { key: "finance" as Module, icon: PieChart, label: "Finance" },
];

export default function Sidebar({ activeModule, setActiveModule, role, setRole }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isGuestFeedback = pathname === "/form-builder" || (pathname === "/" && activeModule === "feedback");
  const roleLabel = ROLES.find(r => r.value === role)?.label;
  const roleName = roleLabel?.split(" - ")[1] ?? "Aditya";
  const roleScope = roleLabel?.split(" - ")[0] ?? "MD View";

  function switchModule(module: Module) {
    setActiveModule(module);
    setMobileOpen(false);
    router.push(`/?module=${module}`);
  }

  const moduleButtonClass = (active: boolean) =>
    `inline-flex h-11 items-center gap-2 rounded-[14px] px-4 text-sm font-bold transition-all ${
      active
        ? "bg-[#00735F] text-white shadow-[0_10px_24px_rgba(0,115,95,0.22)]"
        : "text-brand-text-2 hover:bg-brand-green-700/10 hover:text-brand-green-800"
    }`;

  return (
    <header className="sticky top-0 z-[500] border-b border-white/70 bg-white/75 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,115,95,0.08)]">
      <div className="mx-auto flex h-[76px] w-full max-w-[1920px] items-center justify-between gap-4 px-4 sm:px-8">
        <Link href="/?module=feedback" onClick={() => setActiveModule("feedback")} className="flex min-w-0 items-center gap-3 no-underline">
          <img
            src="/treat-resort-logo.webp"
            alt="Treat Hotels & Resorts"
            className="h-10 w-auto shrink-0 object-contain"
            style={{ filter: "brightness(0)" }}
          />
          <div className="hidden min-w-0 flex-col leading-tight sm:flex">
            <span className="truncate text-[15px] font-extrabold tracking-tight text-brand-text-1">Treat Hotels</span>
            <span className="truncate text-xs font-bold text-brand-text-3">& Resorts</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          <div className="group relative">
            <Link
              href="/?module=feedback"
              onClick={() => setActiveModule("feedback")}
              className={`${moduleButtonClass(isGuestFeedback)} no-underline`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Guest Feedback
              <ChevronDown className="h-4 w-4 opacity-70" />
            </Link>
            <div className="invisible absolute left-0 top-[calc(100%+10px)] w-52 translate-y-1 rounded-2xl border border-brand-border-soft bg-white/95 p-2 opacity-0 shadow-premium-popover backdrop-blur-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              <Link
                href="/?module=feedback"
                onClick={() => setActiveModule("feedback")}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-brand-text-2 no-underline hover:bg-brand-green-700/10 hover:text-brand-green-800"
              >
                <LayoutDashboard className="h-4 w-4" />
                Overview
              </Link>
              <Link
                href="/form-builder"
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-brand-text-2 no-underline hover:bg-brand-green-700/10 hover:text-brand-green-800"
              >
                <ClipboardList className="h-4 w-4" />
                Form Builder
              </Link>
            </div>
          </div>

          {MODULE_ITEMS.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => switchModule(key)}
              className={moduleButtonClass(pathname === "/" && activeModule === key)}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}

          <Link href="/settings" className={`${moduleButtonClass(pathname === "/settings")} no-underline`}>
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <Link href="/help-desk" className={`${moduleButtonClass(pathname === "/help-desk")} no-underline`}>
            <HelpCircle className="h-4 w-4" />
            Help Desk
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <div className="relative hidden h-11 items-center sm:flex">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              aria-label="Select role"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <div className="flex h-11 items-center gap-2.5 rounded-full border border-brand-border-soft bg-white/90 p-1 pr-3.5 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-green-900 text-xs font-bold text-white">
                {roleName.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden min-w-0 flex-col justify-center md:flex">
                <div className="max-w-[120px] truncate text-[13px] font-bold leading-none text-brand-text-1">
                  {roleName}
                </div>
                <div className="mt-1 text-[10px] leading-none text-brand-text-3">
                  {roleScope}
                </div>
              </div>
              <ChevronDown className="hidden h-3.5 w-3.5 shrink-0 text-brand-text-3 md:block" />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(open => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-border-soft bg-white/90 text-brand-text-2 shadow-sm lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-brand-border-soft bg-brand-green-50/95 px-4 py-3 shadow-premium-lg lg:hidden">
          <div className="flex flex-col gap-2">
            <Link
              href="/?module=feedback"
              onClick={() => {
                setActiveModule("feedback");
                setMobileOpen(false);
              }}
              className={`${moduleButtonClass(isGuestFeedback)} justify-start no-underline`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Guest Feedback
            </Link>
            <Link
              href="/form-builder"
              onClick={() => setMobileOpen(false)}
              className="inline-flex h-11 items-center justify-start gap-2 rounded-[14px] px-4 text-sm font-bold text-brand-text-2 no-underline hover:bg-brand-green-700/10 hover:text-brand-green-800"
            >
              <ClipboardList className="h-4 w-4" />
              Form Builder
            </Link>
            {MODULE_ITEMS.map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => switchModule(key)}
                className={`${moduleButtonClass(pathname === "/" && activeModule === key)} justify-start`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
            <Link href="/settings" onClick={() => setMobileOpen(false)} className={`${moduleButtonClass(pathname === "/settings")} justify-start no-underline`}>
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <Link href="/help-desk" onClick={() => setMobileOpen(false)} className={`${moduleButtonClass(pathname === "/help-desk")} justify-start no-underline`}>
              <HelpCircle className="h-4 w-4" />
              Help Desk
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
