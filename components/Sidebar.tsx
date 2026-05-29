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
  { key: "inbox" as Module, icon: Inbox, label: "Inbox" },
  { key: "finance" as Module, icon: PieChart, label: "Finance" },
];

export default function Sidebar({ activeModule, setActiveModule, role, setRole }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isGuestFeedback = pathname === "/form-builder" || (pathname === "/" && activeModule === "feedback");
  const roleLabel = ROLES.find(r => r.value === role)?.label;
  const roleName = roleLabel?.split(" - ")[1] ?? "Aditya";
  const roleScope = roleLabel?.split(" - ")[0] ?? "MD View";

  function switchModule(module: Module) {
    setActiveModule(module);
    setMobileOpen(false);
    setProfileOpen(false);
    router.push(`/?module=${module}`);
  }

  const moduleButtonClass = (active: boolean) =>
    `inline-flex h-11 items-center gap-2 rounded-[12px] px-4 text-sm font-bold transition-all ${
      active
        ? "bg-brand-gold text-brand-ink shadow-[0_12px_26px_rgba(200,172,97,0.28)]"
        : "text-white/78 hover:bg-white/10 hover:text-brand-gold"
    }`;

  return (
    <header className="sticky top-0 z-[500] border-b border-brand-gold/25 bg-brand-green-950/92 backdrop-blur-xl shadow-[0_18px_44px_-30px_rgba(0,0,0,0.8)]">
      <div className="mx-auto flex h-[76px] w-full max-w-[1920px] items-center justify-between gap-4 px-4 sm:px-8">
        <Link href="/?module=feedback" onClick={() => setActiveModule("feedback")} className="flex min-w-0 items-center gap-3 no-underline">
          <img
            src="/treat-resort-logo.webp"
            alt="Treat Hotels & Resorts"
            className="h-11 w-auto shrink-0 object-contain"
          />
          <div className="hidden min-w-0 flex-col leading-tight sm:flex">
            <span className="truncate font-display text-[15px] font-bold text-white">Treat Hotels</span>
            <span className="truncate text-xs font-bold uppercase tracking-wider text-brand-gold">& Resorts</span>
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
            <div className="invisible absolute left-0 top-[calc(100%+10px)] w-52 translate-y-1 rounded-2xl border border-brand-gold/30 bg-brand-green-950/95 p-2 opacity-0 shadow-premium-popover backdrop-blur-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              <Link
                href="/?module=feedback"
                onClick={() => setActiveModule("feedback")}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/75 no-underline hover:bg-white/10 hover:text-brand-gold"
              >
                <LayoutDashboard className="h-4 w-4" />
                Overview
              </Link>
              <Link
                href="/form-builder"
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/75 no-underline hover:bg-white/10 hover:text-brand-gold"
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

        </nav>

        <div className="flex items-center gap-3">
          <div className="relative flex h-11 items-center">
            <button
              type="button"
              onClick={() => setProfileOpen(open => !open)}
              className="flex h-11 items-center gap-2.5 rounded-full border border-brand-gold/30 bg-white/10 p-1 pr-3.5 shadow-sm transition hover:border-brand-gold/60 hover:bg-white/15"
              aria-haspopup="menu"
              aria-expanded={profileOpen}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-gold text-xs font-bold text-brand-ink">
                {roleName.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden min-w-0 flex-col justify-center md:flex">
                <div className="max-w-[120px] truncate text-[13px] font-bold leading-none text-white">
                  {roleName}
                </div>
                <div className="mt-1 text-[10px] leading-none text-brand-gold/80">
                  {roleScope}
                </div>
              </div>
              <ChevronDown className="hidden h-3.5 w-3.5 shrink-0 text-brand-gold/80 md:block" />
            </button>

            {profileOpen && (
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+12px)] w-72 rounded-2xl border border-brand-gold/30 bg-brand-green-950/95 p-2 shadow-premium-popover backdrop-blur-xl"
              >
                <div className="border-b border-brand-gold/20 px-3 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-brand-gold">Profile</p>
                  <p className="mt-1 truncate text-sm font-bold text-white">{roleName}</p>
                  <p className="mt-0.5 text-xs text-white/55">{roleScope}</p>
                </div>

                <div className="px-3 py-3">
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/50">
                    View As
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="h-10 w-full rounded-xl border border-brand-gold/25 bg-white/10 px-3 text-sm font-semibold text-white outline-none focus:border-brand-gold"
                    aria-label="Select role"
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value} className="bg-brand-green-950 text-white">{r.label}</option>
                    ))}
                  </select>
                </div>

                <div className="border-t border-brand-gold/20 p-1">
                  <Link
                    href="/settings"
                    onClick={() => {
                      setProfileOpen(false);
                      setMobileOpen(false);
                    }}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold no-underline transition ${
                      pathname === "/settings"
                        ? "bg-brand-gold text-brand-ink"
                        : "text-white/75 hover:bg-white/10 hover:text-brand-gold"
                    }`}
                    role="menuitem"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <Link
                    href="/help-desk"
                    onClick={() => {
                      setProfileOpen(false);
                      setMobileOpen(false);
                    }}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold no-underline transition ${
                      pathname === "/help-desk"
                        ? "bg-brand-gold text-brand-ink"
                        : "text-white/75 hover:bg-white/10 hover:text-brand-gold"
                    }`}
                    role="menuitem"
                  >
                    <HelpCircle className="h-4 w-4" />
                    Help Desk
                  </Link>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(open => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-gold/30 bg-white/10 text-white shadow-sm lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-brand-gold/25 bg-brand-green-950/95 px-4 py-3 shadow-premium-lg lg:hidden">
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
              className="inline-flex h-11 items-center justify-start gap-2 rounded-[12px] px-4 text-sm font-bold text-white/78 no-underline hover:bg-white/10 hover:text-brand-gold"
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
          </div>
        </nav>
      )}
    </header>
  );
}
