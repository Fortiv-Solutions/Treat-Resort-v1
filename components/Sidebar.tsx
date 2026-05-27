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
  { key: "inbox"   as Module, icon: Inbox,      label: "Unified Inbox", sub: "All Properties"     },
  { key: "finance" as Module, icon: TrendingUp,  label: "Finance",       sub: "Revenue & Analytics" },
];

export default function Sidebar({ activeModule, setActiveModule, role, setRole }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 1023px)").matches : false
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(true);

  const pathname = usePathname();

  /* Auto-collapse on tablet */
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setCollapsed(true);
      else setCollapsed(false);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  /* Keep --sidebar-current-w in sync so main area margin animates correctly */
  useEffect(() => {
    const w = collapsed ? "72px" : "248px";
    document.documentElement.style.setProperty("--sidebar-current-w", w);
  }, [collapsed]);

  const isCollapsed = collapsed;
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
        style={{
          display: "none",
          position: "fixed", top: "16px", left: "16px", zIndex: 400,
          width: "42px", height: "42px", borderRadius: "10px",
          background: "var(--green-800)", border: "none", cursor: "pointer",
          alignItems: "center", justifyContent: "center",
          boxShadow: "0 10px 24px rgba(7,21,15,0.28)",
        }}
        className="mobile-hamburger"
      >
        <Menu size={20} color="#C9A96E" />
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          style={{ display: "block" }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar${mobileOpen ? " mobile-open" : ""}`}
        style={{ width: isCollapsed ? "72px" : "248px" }}
      >
        {/* Logo */}
        <div style={{
          padding: isCollapsed ? "20px 0" : "18px 16px 18px 20px",
          display: "flex", alignItems: "center",
          justifyContent: isCollapsed ? "center" : "space-between",
          borderBottom: "1px solid rgba(201,169,110,0.18)",
          minHeight: "80px",
          gap: "8px",
        }}>
          {isCollapsed ? (
            <button
              onClick={() => setCollapsed(false)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
              aria-label="Expand sidebar"
            >
              <div style={{
                width: "40px", height: "40px", borderRadius: "10px",
                background: "rgba(201,169,110,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden",
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://treatresorts.com/wp-content/uploads/2025/05/cropped-Treat-Resort-main.webp"
                  alt="Treat Hotels & Resorts"
                  style={{ width: "32px", height: "32px", objectFit: "contain", filter: "brightness(0) invert(1)" }}
                />
              </div>
            </button>
          ) : (
            <>
              <div style={{ overflow: "hidden", flex: 1, minWidth: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://treatresorts.com/wp-content/uploads/2025/05/cropped-Treat-Resort-main.webp"
                  alt="Treat Hotels & Resorts"
                  style={{
                    height: "42px",
                    width: "auto",
                    maxWidth: "160px",
                    objectFit: "contain",
                    filter: "brightness(0) invert(1) sepia(1) saturate(2) hue-rotate(5deg) brightness(1.05)",
                  }}
                />
              </div>
              <button
                onClick={() => setCollapsed(true)}
                style={{
                  background: "rgba(201,169,110,0.1)", border: "none", cursor: "pointer",
                  width: "30px", height: "30px", borderRadius: "8px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 150ms ease", flexShrink: 0,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(201,169,110,0.22)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(201,169,110,0.1)")}
                aria-label="Collapse sidebar"
              >
                <ChevronLeft size={14} color="#C9A96E" />
              </button>
            </>
          )}
        </div>

        {/* Nav items */}
        <nav style={{ padding: "12px 10px", flex: 1, overflowY: "auto", overflowX: "hidden" }}>

          {/* ── Guest Feedback (accordion parent) ── */}
          {(() => {
            const isFeedbackActive = activeModule === "feedback" && pathname === "/";
            const isFormBuilderActive = pathname === "/form-builder";
            const parentHighlighted = isFeedbackActive || isFormBuilderActive;
            const subOpen = feedbackOpen && !isCollapsed;

            return (
              <div style={{ marginBottom: "4px" }}>
                {/* Parent row */}
                <button
                  onClick={() => {
                    switchModule("feedback");
                    setFeedbackOpen(o => !o);
                  }}
                  aria-current={isFeedbackActive ? "page" : undefined}
                  style={{
                    width: "100%", display: "flex", alignItems: "center",
                    gap: isCollapsed ? "0" : "12px",
                    justifyContent: isCollapsed ? "center" : "flex-start",
                    padding: isCollapsed ? "12px 0" : "11px 12px",
                    borderRadius: "10px", border: "none", cursor: "pointer",
                    position: "relative",
                    background: parentHighlighted
                      ? "linear-gradient(135deg, rgba(201,169,110,0.22) 0%, rgba(201,169,110,0.12) 100%)"
                      : "transparent",
                    transition: "background var(--dur-fast) ease",
                  }}
                  onMouseEnter={e => { if (!parentHighlighted) e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                  onMouseLeave={e => { if (!parentHighlighted) e.currentTarget.style.background = "transparent"; }}
                >
                  {parentHighlighted && (
                    <span style={{
                      position: "absolute", left: 0, top: "20%", bottom: "20%",
                      width: "3px", borderRadius: "0 3px 3px 0", background: "#C9A96E",
                    }} />
                  )}
                  <span style={{
                    width: "34px", height: "34px", borderRadius: "9px", flexShrink: 0,
                    background: parentHighlighted ? "rgba(201,169,110,0.25)" : "rgba(255,255,255,0.07)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background var(--dur-fast) ease",
                  }}>
                    <LayoutDashboard size={16} color={parentHighlighted ? "#C9A96E" : "rgba(255,255,255,0.55)"} />
                  </span>
                  {!isCollapsed && (
                    <>
                      <div style={{ textAlign: "left", minWidth: 0, flex: 1 }}>
                        <div style={{
                          fontSize: "13px", fontWeight: parentHighlighted ? 600 : 500,
                          color: parentHighlighted ? "#C9A96E" : "rgba(255,255,255,0.75)",
                          lineHeight: 1.2,
                        }}>Guest Feedback</div>
                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "1px" }}>Reviews & Insights</div>
                      </div>
                      <ChevronDown
                        size={13}
                        color="rgba(255,255,255,0.4)"
                        style={{
                          flexShrink: 0,
                          transform: feedbackOpen ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 220ms var(--ease-out-expo)",
                        }}
                      />
                    </>
                  )}
                </button>

                {/* Sub-items (accordion body) */}
                {subOpen && (
                  <div style={{
                    marginTop: "2px", marginLeft: "16px",
                    borderLeft: "1px solid rgba(201,169,110,0.2)",
                    paddingLeft: "10px",
                    animation: "fadeUp 180ms var(--ease-out-expo) both",
                  }}>
                    {/* Reviews & Insights */}
                    <button
                      onClick={() => { switchModule("feedback"); }}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: "10px",
                        padding: "8px 10px", borderRadius: "8px", border: "none", cursor: "pointer",
                        marginBottom: "2px", textAlign: "left",
                        background: isFeedbackActive
                          ? "rgba(201,169,110,0.14)"
                          : "transparent",
                        transition: "background var(--dur-fast) ease",
                      }}
                      onMouseEnter={e => { if (!isFeedbackActive) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                      onMouseLeave={e => { if (!isFeedbackActive) e.currentTarget.style.background = "transparent"; }}
                    >
                      <span style={{
                        width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0,
                        background: isFeedbackActive ? "#C9A96E" : "rgba(255,255,255,0.25)",
                        transition: "background var(--dur-fast) ease",
                      }} />
                      <span style={{
                        fontSize: "12.5px", fontWeight: isFeedbackActive ? 600 : 400,
                        color: isFeedbackActive ? "#C9A96E" : "rgba(255,255,255,0.6)",
                        lineHeight: 1.3,
                      }}>Reviews & Insights</span>
                    </button>

                    {/* Form Builder */}
                    <Link
                      href="/form-builder"
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: "10px",
                        padding: "8px 10px", borderRadius: "8px", textDecoration: "none",
                        marginBottom: "2px",
                        background: isFormBuilderActive
                          ? "rgba(201,169,110,0.14)"
                          : "transparent",
                        transition: "background var(--dur-fast) ease",
                      }}
                      onMouseEnter={e => { if (!isFormBuilderActive) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                      onMouseLeave={e => { if (!isFormBuilderActive) e.currentTarget.style.background = "transparent"; }}
                    >
                      <Sparkles
                        size={11}
                        color={isFormBuilderActive ? "#C9A96E" : "rgba(255,255,255,0.35)"}
                        style={{ flexShrink: 0 }}
                      />
                      <span style={{
                        fontSize: "12.5px", fontWeight: isFormBuilderActive ? 600 : 400,
                        color: isFormBuilderActive ? "#C9A96E" : "rgba(255,255,255,0.6)",
                        lineHeight: 1.3,
                      }}>Form Builder</span>
                    </Link>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── Other nav items ── */}
          {OTHER_NAV_ITEMS.map(({ key, icon: Icon, label, sub }) => {
            const active = activeModule === key && pathname === "/";
            return (
              <button
                key={key}
                onClick={() => switchModule(key)}
                aria-current={active ? "page" : undefined}
                style={{
                  width: "100%", display: "flex", alignItems: "center",
                  gap: isCollapsed ? "0" : "12px",
                  justifyContent: isCollapsed ? "center" : "flex-start",
                  padding: isCollapsed ? "12px 0" : "11px 12px",
                  borderRadius: "10px", border: "none", cursor: "pointer",
                  marginBottom: "4px", position: "relative",
                  background: active
                    ? "linear-gradient(135deg, rgba(201,169,110,0.22) 0%, rgba(201,169,110,0.12) 100%)"
                    : "transparent",
                  transition: "background var(--dur-fast) ease",
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                {active && (
                  <span style={{
                    position: "absolute", left: 0, top: "20%", bottom: "20%",
                    width: "3px", borderRadius: "0 3px 3px 0", background: "#C9A96E",
                  }} />
                )}
                <span style={{
                  width: "34px", height: "34px", borderRadius: "9px",
                  background: active ? "rgba(201,169,110,0.25)" : "rgba(255,255,255,0.07)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, transition: "background var(--dur-fast) ease",
                }}>
                  <Icon size={16} color={active ? "#C9A96E" : "rgba(255,255,255,0.55)"} />
                </span>
                {!isCollapsed && (
                  <div style={{ textAlign: "left", minWidth: 0 }}>
                    <div style={{
                      fontSize: "13px", fontWeight: active ? 600 : 500,
                      color: active ? "#C9A96E" : "rgba(255,255,255,0.75)",
                      lineHeight: 1.2,
                    }}>{label}</div>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "1px" }}>{sub}</div>
                  </div>
                )}
              </button>
            );
          })}

          {/* Divider */}
          {!isCollapsed && (
            <div style={{ margin: "14px 4px", borderBottom: "1px solid rgba(255,255,255,0.08)" }} />
          )}

          {/* Notifications & Settings (decorative) */}
          {[
            { icon: Bell,     label: "Notifications", badge: "3" },
            { icon: Settings, label: "Settings",      badge: null },
          ].map(({ icon: Icon, label, badge }) => (
            <button
              key={label}
              style={{
                width: "100%", display: "flex", alignItems: "center",
                gap: isCollapsed ? "0" : "12px",
                justifyContent: isCollapsed ? "center" : "flex-start",
                padding: isCollapsed ? "12px 0" : "10px 12px",
                borderRadius: "10px", border: "none", cursor: "pointer",
                background: "transparent", marginBottom: "2px", position: "relative",
                transition: "background var(--dur-fast) ease",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ position: "relative", flexShrink: 0 }}>
                <Icon size={16} color="rgba(255,255,255,0.4)" />
                {badge && (
                  <span style={{
                    position: "absolute", top: "-5px", right: "-6px",
                    width: "14px", height: "14px", borderRadius: "50%",
                    background: "#DC2626", fontSize: "8px", fontWeight: 700,
                    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{badge}</span>
                )}
              </span>
              {!isCollapsed && (
                <span style={{ fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.45)" }}>{label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Collapsed expand button */}
        {isCollapsed && (
          <button
            onClick={() => setCollapsed(false)}
            style={{
              margin: "8px auto", width: "36px", height: "36px",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(201,169,110,0.1)", border: "1px solid rgba(201,169,110,0.15)",
              cursor: "pointer", borderRadius: "9px",
              transition: "background 150ms ease, border-color 150ms ease", flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(201,169,110,0.2)"; e.currentTarget.style.borderColor = "rgba(201,169,110,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(201,169,110,0.1)"; e.currentTarget.style.borderColor = "rgba(201,169,110,0.15)"; }}
            aria-label="Expand sidebar"
          >
            <ChevronRight size={14} color="#C9A96E" />
          </button>
        )}

        {/* Role Selector at bottom */}
        <div style={{
          padding: isCollapsed ? "16px 8px" : "14px 12px",
          borderTop: "1px solid rgba(201,169,110,0.12)",
          position: "relative",
        }}>
          <button
            onClick={() => setRoleOpen(o => !o)}
            style={{
              width: "100%", display: "flex", alignItems: "center",
              gap: isCollapsed ? "0" : "10px",
              justifyContent: isCollapsed ? "center" : "flex-start",
              padding: isCollapsed ? "6px 0" : "8px 10px",
              borderRadius: "10px", border: "none", cursor: "pointer",
              background: roleOpen ? "rgba(201,169,110,0.12)" : "rgba(255,255,255,0.06)",
              transition: "background var(--dur-fast) ease",
            }}
          >
            <span style={{
              width: "32px", height: "32px", borderRadius: "50%",
              background: "linear-gradient(135deg, #C9A96E 0%, #8B6914 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, fontSize: "13px", fontWeight: 700, color: "#fff",
            }}>
              {(currentRole?.label ?? "MD").charAt(0)}
            </span>
            {!isCollapsed && (
              <>
                <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.85)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {currentRole?.label.split(" - ")[1] ?? currentRole?.label}
                  </div>
                  <div style={{ fontSize: "10.5px", color: "rgba(255,255,255,0.35)", marginTop: "1px" }}>
                    {currentRole?.label.split(" - ")[0]}
                  </div>
                </div>
                <ChevronDown size={13} color="rgba(255,255,255,0.4)" style={{ transform: roleOpen ? "rotate(180deg)" : "none", transition: "transform 200ms ease" }} />
              </>
            )}
          </button>

          {/* Role dropdown */}
          {roleOpen && !isCollapsed && (
            <div style={{
              position: "absolute", bottom: "calc(100% - 8px)", left: "12px", right: "12px",
              background: "linear-gradient(160deg, var(--green-800), var(--green-950))",
              border: "1px solid rgba(201,169,110,0.2)",
              borderRadius: "12px", overflow: "hidden",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              zIndex: 10,
              animation: "fadeUp 200ms var(--ease-out-expo) both",
            }}>
              {ROLES.map(r => (
                <button
                  key={r.value}
                  onClick={() => { setRole(r.value); setRoleOpen(false); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: "10px",
                    padding: "10px 14px", border: "none", cursor: "pointer", textAlign: "left",
                    background: r.value === role ? "rgba(201,169,110,0.15)" : "transparent",
                    transition: "background 120ms ease",
                    borderLeft: r.value === role ? "3px solid #C9A96E" : "3px solid transparent",
                  }}
                  onMouseEnter={e => { if (r.value !== role) e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                  onMouseLeave={e => { if (r.value !== role) e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{
                    width: "28px", height: "28px", borderRadius: "50%",
                    background: r.value === role
                      ? "linear-gradient(135deg, #C9A96E 0%, #8B6914 100%)"
                      : "rgba(255,255,255,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "11px", fontWeight: 700,
                    color: r.value === role ? "#fff" : "rgba(255,255,255,0.5)",
                    flexShrink: 0,
                  }}>
                    {r.label.charAt(0)}
                  </span>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: r.value === role ? 600 : 400, color: r.value === role ? "#C9A96E" : "rgba(255,255,255,0.7)" }}>
                      {r.label.split(" - ")[1] ?? r.label}
                    </div>
                    <div style={{ fontSize: "10.5px", color: "rgba(255,255,255,0.3)" }}>
                      {r.label.split(" - ")[0]}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      <style>{`
        @media (max-width: 767px) {
          .mobile-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}
