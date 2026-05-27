"use client";

import { useState, useEffect } from "react";
import { type Role, ROLES } from "@/lib/data";
import {
  LayoutDashboard, Inbox, ChevronLeft, ChevronRight,
  Menu, Bell, Settings, ChevronDown, Sparkles,
  TrendingUp,
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

const OTHER_NAV_ITEMS = [
  { key: "inbox"   as Module, icon: Inbox,       label: "Unified Inbox", sub: "All Properties"     },
  { key: "finance" as Module, icon: TrendingUp,  label: "Finance",       sub: "Revenue & Analytics" },
];

export default function Sidebar({ activeModule, setActiveModule, role, setRole }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(true);

  const pathname = usePathname();

  /* Auto-collapse on tablet */
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    setCollapsed(mq.matches);
    const handler = (e: MediaQueryListEvent) => setCollapsed(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  /* Keep --sidebar-current-w in sync so main area margin animates correctly */
  useEffect(() => {
    document.documentElement.dataset.collapsed = String(collapsed);
  }, [collapsed]);

  const currentRole = ROLES.find(r => r.value === role);
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
        className="md:hidden fixed top-4 left-4 z-[400] w-10 h-10 rounded-lg bg-brand-green-800 border-none flex items-center justify-center shadow-premium-md"
      >
        <Menu className="w-5 h-5 text-brand-gold" />
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
        className={`fixed inset-y-0 left-0 z-[500] flex flex-col bg-gradient-to-b from-brand-green-950 via-brand-green-900 to-[#0a1812] border-r border-brand-gold/10 shadow-premium-lg overflow-hidden transition-all duration-300 ease-out-expo
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${collapsed ? "w-[72px]" : "w-[248px]"}`}
      >
        {/* Logo Area */}
        <div className={`flex items-center border-b border-brand-gold/10 min-h-[80px] gap-2
          ${collapsed ? "justify-center py-5" : "justify-between py-[18px] px-4"}`}>
          
          {collapsed ? (
            <button
              onClick={() => setCollapsed(false)}
              className="bg-transparent border-none p-0 flex items-center justify-center cursor-pointer"
              aria-label="Expand sidebar"
            >
              <div className="w-10 h-10 rounded-lg bg-brand-gold/10 flex items-center justify-center overflow-hidden hover:bg-brand-gold/20 transition-colors">
                <img
                  src="/treat-resort-logo.webp"
                  alt="Treat Hotels & Resorts"
                  className="w-8 h-8 object-contain brightness-0 invert"
                />
              </div>
            </button>
          ) : (
            <>
              <div className="overflow-hidden flex-1 min-w-0 flex items-center">
                <img
                  src="/treat-resort-logo.webp"
                  alt="Treat Hotels & Resorts"
                  className="h-10 w-auto max-w-[160px] object-contain brightness-0 invert sepia saturate-200 hue-rotate-[5deg]"
                />
              </div>
              <button
                onClick={() => setCollapsed(true)}
                className="w-[30px] h-[30px] rounded-lg bg-brand-gold/10 flex items-center justify-center shrink-0 hover:bg-brand-gold/20 transition-colors"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4 text-brand-gold" />
              </button>
            </>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2.5 py-3 overflow-y-auto overflow-x-hidden">
          
          {/* Guest Feedback (Accordion Parent) */}
          {(() => {
            const isFeedbackActive = activeModule === "feedback" && pathname === "/";
            const isFormBuilderActive = pathname === "/form-builder";
            const parentHighlighted = isFeedbackActive || isFormBuilderActive;
            const subOpen = feedbackOpen && !collapsed;

            return (
              <div className="mb-1">
                <button
                  onClick={() => {
                    switchModule("feedback");
                    setFeedbackOpen(o => !o);
                  }}
                  className={`w-full flex items-center rounded-xl border-none cursor-pointer relative transition-colors duration-150 group
                    ${collapsed ? "justify-center py-3 px-0 gap-0" : "justify-start py-[11px] px-3 gap-3"}
                    ${parentHighlighted ? "bg-gradient-to-br from-brand-gold/20 to-brand-gold/10" : "bg-transparent hover:bg-white/5"}`}
                >
                  {parentHighlighted && (
                    <span className="absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-r-md bg-brand-gold" />
                  )}
                  <span className={`w-[34px] h-[34px] rounded-[9px] shrink-0 flex items-center justify-center transition-colors duration-150
                    ${parentHighlighted ? "bg-brand-gold/20" : "bg-white/5 group-hover:bg-white/10"}`}>
                    <LayoutDashboard className={`w-4 h-4 ${parentHighlighted ? "text-brand-gold" : "text-white/50"}`} />
                  </span>
                  
                  {!collapsed && (
                    <>
                      <div className="text-left min-w-0 flex-1">
                        <div className={`text-[13px] leading-tight ${parentHighlighted ? "font-semibold text-brand-gold" : "font-medium text-white/70"}`}>
                          Guest Feedback
                        </div>
                        <div className="text-[11px] text-white/40 mt-[1px]">Reviews & Insights</div>
                      </div>
                      <ChevronDown
                        className={`w-[14px] h-[14px] text-white/40 shrink-0 transition-transform duration-200 ${feedbackOpen ? "rotate-180" : "rotate-0"}`}
                      />
                    </>
                  )}
                </button>

                {/* Sub-items */}
                {subOpen && (
                  <div className="mt-0.5 ml-4 pl-2.5 border-l border-brand-gold/20 animate-fade-up">
                    <button
                      onClick={() => switchModule("feedback")}
                      className={`w-full flex items-center gap-2.5 py-2 px-2.5 rounded-lg border-none cursor-pointer text-left mb-0.5 transition-colors duration-150
                        ${isFeedbackActive ? "bg-brand-gold/15" : "bg-transparent hover:bg-white/5"}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-150 ${isFeedbackActive ? "bg-brand-gold" : "bg-white/25"}`} />
                      <span className={`text-[12.5px] leading-snug ${isFeedbackActive ? "font-semibold text-brand-gold" : "font-normal text-white/60"}`}>
                        Reviews & Insights
                      </span>
                    </button>

                    <Link
                      href="/form-builder"
                      className={`w-full flex items-center gap-2.5 py-2 px-2.5 rounded-lg no-underline mb-0.5 transition-colors duration-150
                        ${isFormBuilderActive ? "bg-brand-gold/15" : "bg-transparent hover:bg-white/5"}`}
                    >
                      <Sparkles className={`w-[11px] h-[11px] shrink-0 ${isFormBuilderActive ? "text-brand-gold" : "text-white/35"}`} />
                      <span className={`text-[12.5px] leading-snug ${isFormBuilderActive ? "font-semibold text-brand-gold" : "font-normal text-white/60"}`}>
                        Form Builder
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Other Nav Items */}
          {OTHER_NAV_ITEMS.map(({ key, icon: Icon, label, sub }) => {
            const active = activeModule === key && pathname === "/";
            return (
              <button
                key={key}
                onClick={() => switchModule(key)}
                className={`w-full flex items-center rounded-xl border-none cursor-pointer relative transition-colors duration-150 mb-1 group
                  ${collapsed ? "justify-center py-3 px-0 gap-0" : "justify-start py-[11px] px-3 gap-3"}
                  ${active ? "bg-gradient-to-br from-brand-gold/20 to-brand-gold/10" : "bg-transparent hover:bg-white/5"}`}
              >
                {active && (
                  <span className="absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-r-md bg-brand-gold" />
                )}
                <span className={`w-[34px] h-[34px] rounded-[9px] shrink-0 flex items-center justify-center transition-colors duration-150
                  ${active ? "bg-brand-gold/20" : "bg-white/5 group-hover:bg-white/10"}`}>
                  <Icon className={`w-4 h-4 ${active ? "text-brand-gold" : "text-white/50"}`} />
                </span>
                
                {!collapsed && (
                  <div className="text-left min-w-0">
                    <div className={`text-[13px] leading-tight ${active ? "font-semibold text-brand-gold" : "font-medium text-white/70"}`}>
                      {label}
                    </div>
                    <div className="text-[11px] text-white/40 mt-[1px]">{sub}</div>
                  </div>
                )}
              </button>
            );
          })}


        </nav>

        {/* Collapsed Expand Button */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="my-2 mx-auto w-9 h-9 flex items-center justify-center bg-brand-gold/10 border border-brand-gold/15 rounded-[9px] cursor-pointer hover:bg-brand-gold/20 hover:border-brand-gold/30 transition-all shrink-0"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-3.5 h-3.5 text-brand-gold" />
          </button>
        )}

        {/* Role Selector */}
        <div className={`border-t border-brand-gold/10 relative ${collapsed ? "py-4 px-2" : "py-3.5 px-3"}`}>
          <button
            onClick={() => setRoleOpen(o => !o)}
            className={`w-full flex items-center rounded-xl border-none cursor-pointer transition-colors duration-150
              ${collapsed ? "justify-center py-1.5 px-0 gap-0" : "justify-start py-2 px-2.5 gap-2.5"}
              ${roleOpen ? "bg-brand-gold/10" : "bg-white/5 hover:bg-white/10"}`}
          >
            <span className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-gold to-[#8B6914] flex items-center justify-center shrink-0 text-[13px] font-bold text-white">
              {(currentRole?.label ?? "MD").charAt(0)}
            </span>
            
            {!collapsed && (
              <>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-[12px] font-semibold text-white/85 truncate">
                    {currentRole?.label.split(" - ")[1] ?? currentRole?.label}
                  </div>
                  <div className="text-[10.5px] text-white/35 mt-[1px]">
                    {currentRole?.label.split(" - ")[0]}
                  </div>
                </div>
                <ChevronDown className={`w-[14px] h-[14px] text-white/40 transition-transform duration-200 ${roleOpen ? "rotate-180" : ""}`} />
              </>
            )}
          </button>

          {/* Role Dropdown */}
          {roleOpen && !collapsed && (
            <div className="absolute bottom-[calc(100%-8px)] left-3 right-3 bg-gradient-to-br from-brand-green-800 to-brand-green-950 border border-brand-gold/20 rounded-xl overflow-hidden shadow-premium-popover z-10 animate-fade-up">
              {ROLES.map(r => (
                <button
                  key={r.value}
                  onClick={() => { setRole(r.value); setRoleOpen(false); }}
                  className={`w-full flex items-center gap-2.5 py-2.5 px-3.5 border-none cursor-pointer text-left transition-colors duration-150
                    ${r.value === role ? "bg-brand-gold/15 border-l-4 border-l-brand-gold" : "bg-transparent border-l-4 border-l-transparent hover:bg-white/5"}`}
                >
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0
                    ${r.value === role ? "bg-gradient-to-br from-brand-gold to-[#8B6914] text-white" : "bg-white/10 text-white/50"}`}>
                    {r.label.charAt(0)}
                  </span>
                  <div>
                    <div className={`text-[12px] ${r.value === role ? "font-semibold text-brand-gold" : "font-normal text-white/70"}`}>
                      {r.label.split(" - ")[1] ?? r.label}
                    </div>
                    <div className="text-[10.5px] text-white/30 mt-0.5">
                      {r.label.split(" - ")[0]}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
