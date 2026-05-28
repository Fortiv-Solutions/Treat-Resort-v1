"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { type Role } from "@/lib/data";
import {
  LayoutDashboard, Inbox, ChevronLeft, ChevronRight,
  Menu, ClipboardList, PieChart, ChevronDown,
  Settings, HelpCircle, LogOut, Rocket
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Module = "feedback" | "inbox" | "finance";

interface SidebarProps {
  activeModule: Module;
  setActiveModule: (m: Module) => void;
  role: Role;
  setRole: (r: Role) => void;
}

const NAV_ITEMS = [
  { key: "finance" as Module, icon: PieChart,  label: "Finance",       sub: "Revenue & Analytics" },
  { key: "inbox"   as Module, icon: Inbox,       label: "Message",       sub: "Unified Inbox" },
];

const SIDEBAR_AUTO_COLLAPSE_QUERY = "(max-width: 1023px)";

function subscribeToSidebarMedia(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const mq = window.matchMedia(SIDEBAR_AUTO_COLLAPSE_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSidebarMediaSnapshot() {
  return typeof window !== "undefined" && window.matchMedia(SIDEBAR_AUTO_COLLAPSE_QUERY).matches;
}

function getSidebarServerSnapshot() {
  return false;
}

export default function Sidebar({ activeModule, setActiveModule, role, setRole }: SidebarProps) {
  const [userCollapsed, setUserCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const autoCollapsed = useSyncExternalStore(
    subscribeToSidebarMedia,
    getSidebarMediaSnapshot,
    getSidebarServerSnapshot
  );
  const collapsed = autoCollapsed || userCollapsed;

  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.dataset.collapsed = String(collapsed);
  }, [collapsed]);

  const switchModule = (module: Module) => {
    setActiveModule(module);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
        className="md:hidden fixed top-4 left-4 z-[400] w-10 h-10 rounded-lg bg-white border border-brand-border-soft flex items-center justify-center shadow-sm"
      >
        <Menu className="w-5 h-5 text-brand-text-1" />
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[490] bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-[500] flex flex-col bg-white border-r border-brand-border-soft overflow-hidden transition-all duration-300 ease-out-expo
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${collapsed ? "w-[72px]" : "w-[248px]"}`}
      >
        {/* Logo Area */}
        <div className={`flex items-center min-h-[88px] gap-3
          ${collapsed ? "justify-center py-5" : "justify-between py-[24px] px-6"}`}>
          
          {collapsed ? (
            <button
              onClick={() => setUserCollapsed(false)}
              className="bg-transparent border-none p-0 flex items-center justify-center cursor-pointer group"
              aria-label="Expand sidebar"
            >
              <img
                src="/treat-resort-logo.webp"
                alt="Treat Hotels & Resorts"
                className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
                style={{ filter: "brightness(0)" }}
              />
            </button>
          ) : (
            <>
              <div className="overflow-hidden flex-1 min-w-0 flex items-center gap-3">
                <img
                  src="/treat-resort-logo.webp"
                  alt="Logo"
                  className="h-9 w-auto object-contain shrink-0"
                  style={{ filter: "brightness(0)" }}
                />
                <div className="flex flex-col min-w-0 justify-center mt-0.5">
                  <span className="font-extrabold text-[14.5px] leading-tight tracking-tight text-slate-900 truncate">Treat Hotels</span>
                  <span className="font-bold text-[12px] leading-tight tracking-tight text-slate-500 truncate">& Resorts</span>
                </div>
              </div>
              <button
                onClick={() => setUserCollapsed(true)}
                className="w-8 h-8 rounded-lg bg-brand-surface-2 flex items-center justify-center shrink-0 hover:bg-brand-green-700/10 hover:text-brand-green-700 transition-colors text-brand-text-3"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-2 overflow-y-auto overflow-x-hidden">
          
          {/* MENU SECTION */}
          {!collapsed && (
            <div className="text-[10px] font-bold text-brand-text-3 uppercase tracking-wider mb-3 mt-2 px-2">
              Menu
            </div>
          )}

          {/* Dashboard */}
          <button
            onClick={() => switchModule("feedback")}
            className={`w-full flex items-center rounded-xl border-none cursor-pointer transition-colors duration-150 mb-1 group
              ${collapsed ? "justify-center py-3 px-0 gap-0" : "justify-start py-2.5 px-3 gap-3"}
              ${activeModule === "feedback" && pathname === "/" ? "bg-brand-green-700/10" : "bg-transparent hover:bg-brand-surface-2"}`}
          >
            <span className={`w-[28px] h-[28px] rounded-lg shrink-0 flex items-center justify-center transition-colors duration-150
              ${activeModule === "feedback" && pathname === "/" ? "text-brand-green-700" : "text-brand-text-3 group-hover:text-brand-text-2"}`}>
              <LayoutDashboard className="w-[18px] h-[18px]" />
            </span>
            
            {!collapsed && (
              <div className="text-left min-w-0">
                <div className={`text-[13px] leading-tight font-medium ${activeModule === "feedback" && pathname === "/" ? "text-brand-green-700" : "text-brand-text-2"}`}>
                  Dashboard
                </div>
              </div>
            )}
          </button>

          {/* Form Builder */}
          <Link
            href="/form-builder"
            className={`w-full flex items-center rounded-xl no-underline transition-colors duration-150 mb-1 group
              ${collapsed ? "justify-center py-3 px-0 gap-0" : "justify-start py-2.5 px-3 gap-3"}
              ${pathname === "/form-builder" ? "bg-brand-green-700/10" : "bg-transparent hover:bg-brand-surface-2"}`}
          >
            <span className={`w-[28px] h-[28px] rounded-lg shrink-0 flex items-center justify-center transition-colors duration-150
              ${pathname === "/form-builder" ? "text-brand-green-700" : "text-brand-text-3 group-hover:text-brand-text-2"}`}>
              <ClipboardList className="w-[18px] h-[18px]" />
            </span>
            
            {!collapsed && (
              <div className="text-left min-w-0">
                <div className={`text-[13px] leading-tight font-medium ${pathname === "/form-builder" ? "text-brand-green-700" : "text-brand-text-2"}`}>
                  Form Builder
                </div>
              </div>
            )}
          </Link>

          {/* Other Nav Items */}
          {NAV_ITEMS.map(({ key, icon: Icon, label }) => {
            const active = activeModule === key && pathname === "/";
            return (
              <button
                key={key}
                onClick={() => switchModule(key)}
                className={`w-full flex items-center rounded-xl border-none cursor-pointer transition-colors duration-150 mb-1 group
                  ${collapsed ? "justify-center py-3 px-0 gap-0" : "justify-start py-2.5 px-3 gap-3"}
                  ${active ? "bg-brand-green-700/10" : "bg-transparent hover:bg-brand-surface-2"}`}
              >
                <span className={`w-[28px] h-[28px] rounded-lg shrink-0 flex items-center justify-center transition-colors duration-150
                  ${active ? "text-brand-green-700" : "text-brand-text-3 group-hover:text-brand-text-2"}`}>
                  <Icon className="w-[18px] h-[18px]" />
                </span>
                
                {!collapsed && (
                  <div className="text-left min-w-0">
                    <div className={`text-[13px] leading-tight font-medium ${active ? "text-brand-green-700" : "text-brand-text-2"}`}>
                      {label}
                    </div>
                  </div>
                )}
              </button>
            );
          })}

          {/* GENERAL SECTION */}
          {!collapsed && (
            <div className="text-[10px] font-bold text-brand-text-3 uppercase tracking-wider mb-3 mt-6 px-2">
              General
            </div>
          )}

          <Link
            href="/settings"
            className={`w-full flex items-center rounded-xl no-underline transition-colors duration-150 mb-1 group
              ${collapsed ? "justify-center py-3 px-0 gap-0" : "justify-start py-2.5 px-3 gap-3"}
              ${pathname === "/settings" ? "bg-brand-green-700/10" : "bg-transparent hover:bg-brand-surface-2"}`}
          >
            <span className={`w-[28px] h-[28px] rounded-lg shrink-0 flex items-center justify-center transition-colors duration-150
              ${pathname === "/settings" ? "text-brand-green-700" : "text-brand-text-3 group-hover:text-brand-text-2"}`}>
              <Settings className="w-[18px] h-[18px]" />
            </span>
            {!collapsed && (
              <div className="text-left min-w-0">
                <div className={`text-[13px] leading-tight font-medium ${pathname === "/settings" ? "text-brand-green-700" : "text-brand-text-2"}`}>
                  Settings
                </div>
              </div>
            )}
          </Link>

          <Link
            href="/help-desk"
            className={`w-full flex items-center rounded-xl no-underline transition-colors duration-150 mb-1 group
              ${collapsed ? "justify-center py-3 px-0 gap-0" : "justify-start py-2.5 px-3 gap-3"}
              ${pathname === "/help-desk" ? "bg-brand-green-700/10" : "bg-transparent hover:bg-brand-surface-2"}`}
          >
            <span className={`w-[28px] h-[28px] rounded-lg shrink-0 flex items-center justify-center transition-colors duration-150
              ${pathname === "/help-desk" ? "text-brand-green-700" : "text-brand-text-3 group-hover:text-brand-text-2"}`}>
              <HelpCircle className="w-[18px] h-[18px]" />
            </span>
            {!collapsed && (
              <div className="text-left min-w-0">
                <div className={`text-[13px] leading-tight font-medium ${pathname === "/help-desk" ? "text-brand-green-700" : "text-brand-text-2"}`}>
                  Help Desk
                </div>
              </div>
            )}
          </Link>

        </nav>

        {/* Collapsed Expand Button */}
        {collapsed && (
          <button
            onClick={() => setUserCollapsed(false)}
            className="my-2 mx-auto w-9 h-9 flex items-center justify-center bg-brand-surface-2 rounded-[9px] cursor-pointer hover:bg-brand-border-soft transition-all shrink-0"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4 text-brand-text-3" />
          </button>
        )}

        {/* Bottom Actions */}
        <div className={`mt-auto ${collapsed ? "p-2 pb-4" : "p-4 pb-6"}`}>
          <button className={`w-full flex items-center rounded-xl border-none cursor-pointer transition-colors duration-150 group ${collapsed ? "justify-center py-3 px-0 gap-0" : "justify-start py-2.5 px-3 gap-3"} bg-transparent hover:bg-red-50`}>
            <span className="w-[28px] h-[28px] rounded-lg shrink-0 flex items-center justify-center text-red-500 group-hover:text-red-600 transition-colors">
              <LogOut className="w-[18px] h-[18px]" />
            </span>
            {!collapsed && <div className="text-[13px] leading-tight font-medium text-red-500 group-hover:text-red-600 transition-colors">Log out</div>}
          </button>
        </div>
      </aside>
    </>
  );
}
