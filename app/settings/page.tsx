"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { type Role, ROLES } from "@/lib/data";
import { Search, Bell, HelpCircle, ChevronDown, User, Shield, BellRing, CreditCard, Building, MonitorSmartphone } from "lucide-react";

type SettingsTab = "account" | "notifications" | "security" | "billing" | "appearance";

export default function SettingsPage() {
  const [role, setRole] = useState<Role>("MD");
  // Dummy module state just to satisfy Sidebar props. 
  // It won't highlight because pathname !== "/"
  const [activeModule, setActiveModule] = useState<"feedback" | "inbox" | "finance">("feedback");
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");

  const TABS = [
    { id: "account", label: "Account Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: BellRing },
  ];

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
      <div className="app-content-shell">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-[#f6f8fa] px-4 sm:px-8 h-[88px] flex items-center justify-between gap-4">
          <div className="flex items-center min-w-0">
            <h1 className="text-xl sm:text-[22px] font-bold text-brand-text-1 leading-tight truncate">
              Settings
            </h1>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-white rounded-full px-4 h-10 shadow-sm transition-all duration-200 focus-within:ring-2 focus-within:ring-brand-gold/20 w-[240px] lg:w-[280px]">
              <Search className="w-4 h-4 text-brand-text-3 shrink-0" />
              <input
                placeholder="Search settings..."
                className="border-none bg-transparent outline-none text-[13px] text-brand-text-1 flex-1 min-w-0 placeholder:text-brand-text-3 h-full"
              />
            </div>
            {/* Notifications */}
            <button className="w-10 h-10 shrink-0 rounded-full bg-white flex items-center justify-center relative transition-all duration-200 hover:shadow-md shadow-sm text-brand-text-2">
              <Bell className="w-[18px] h-[18px]" />
            </button>
            {/* Profile */}
            <div className="flex items-center gap-2.5 bg-white rounded-full p-1 pr-3.5 shadow-sm h-10">
              <div className="w-8 h-8 shrink-0 rounded-full bg-brand-green-900 flex items-center justify-center overflow-hidden">
                <img src="https://ui-avatars.com/api/?name=Admin&background=0F5132&color=fff" alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="hidden sm:flex flex-col justify-center min-w-0">
                <div className="text-[13px] font-bold text-brand-text-1 leading-none mb-0.5">Admin</div>
                <div className="text-[10px] text-brand-text-3 leading-none">Treat Hotels</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1200px] mx-auto">
          
          <div className="bg-white rounded-2xl shadow-sm border border-brand-border-soft overflow-hidden flex flex-col md:flex-row min-h-[600px]">
            {/* Sidebar inside Settings */}
            <div className="w-full md:w-[280px] bg-brand-surface-1 border-r border-brand-border-soft p-6 flex flex-col gap-2">
              <h2 className="text-[11px] font-bold text-brand-text-3 uppercase tracking-wider mb-4 px-2">Settings Menu</h2>
              {TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as SettingsTab)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group
                      ${isActive ? "bg-brand-green-700/10 text-brand-green-700" : "hover:bg-brand-surface-2 text-brand-text-2"}
                    `}
                  >
                    <Icon className={`w-[18px] h-[18px] ${isActive ? "text-brand-green-700" : "text-brand-text-3 group-hover:text-brand-text-2"}`} />
                    <span className="text-[13px] font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8 md:p-12">
              {activeTab === "account" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out-expo">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-brand-text-1 mb-2">Account Profile</h2>
                    <p className="text-brand-text-3 text-[14px]">Manage your personal information and preferences.</p>
                  </div>

                  <div className="flex items-center gap-6 mb-10 pb-10 border-b border-brand-border-soft">
                    <div className="w-24 h-24 rounded-full bg-brand-surface-2 overflow-hidden border-4 border-white shadow-sm shrink-0">
                      <img src="https://ui-avatars.com/api/?name=Admin&background=0F5132&color=fff" alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <button className="bg-white border border-brand-border-soft px-4 py-2 rounded-lg text-[13px] font-medium text-brand-text-2 hover:bg-brand-surface-2 transition-colors mb-2 shadow-sm">
                        Change Avatar
                      </button>
                      <p className="text-[12px] text-brand-text-3">JPG, GIF or PNG. Max size of 800K</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-brand-text-2">First Name</label>
                      <input type="text" defaultValue="Arjun" className="h-11 bg-brand-surface-1 border border-brand-border-soft rounded-xl px-4 text-[14px] text-brand-text-1 focus:outline-none focus:border-brand-green-500 focus:ring-1 focus:ring-brand-green-500 transition-all" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-brand-text-2">Last Name</label>
                      <input type="text" defaultValue="Kapoor" className="h-11 bg-brand-surface-1 border border-brand-border-soft rounded-xl px-4 text-[14px] text-brand-text-1 focus:outline-none focus:border-brand-green-500 focus:ring-1 focus:ring-brand-green-500 transition-all" />
                    </div>
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-[13px] font-medium text-brand-text-2">Email Address</label>
                      <input type="email" defaultValue="admin@treatresorts.com" className="h-11 bg-brand-surface-1 border border-brand-border-soft rounded-xl px-4 text-[14px] text-brand-text-1 focus:outline-none focus:border-brand-green-500 focus:ring-1 focus:ring-brand-green-500 transition-all" />
                    </div>
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-[13px] font-medium text-brand-text-2">Role / Title</label>
                      <input type="text" defaultValue="Managing Director" readOnly className="h-11 bg-brand-surface-2 border border-brand-border-soft rounded-xl px-4 text-[14px] text-brand-text-3 cursor-not-allowed" />
                    </div>
                  </div>

                  <div className="mt-10 flex justify-end">
                    <button className="bg-brand-green-800 text-white px-6 py-2.5 rounded-xl text-[14px] font-medium hover:bg-brand-green-900 transition-all shadow-sm">
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out-expo">
                   <div className="mb-8">
                    <h2 className="text-2xl font-bold text-brand-text-1 mb-2">Notifications</h2>
                    <p className="text-brand-text-3 text-[14px]">Choose what you want to be notified about.</p>
                  </div>
                  <div className="space-y-6">
                    {/* Dummy switches */}
                    {[
                      { title: "Guest Reviews", desc: "Get notified when a new review is posted." },
                      { title: "Daily Digest", desc: "Receive a daily summary of key metrics." },
                      { title: "Financial Alerts", desc: "Alerts for sudden revenue drops or spikes." },
                      { title: "System Updates", desc: "News about product and feature updates." },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between pb-6 border-b border-brand-border-soft last:border-0">
                        <div>
                          <div className="text-[14px] font-medium text-brand-text-1 mb-1">{item.title}</div>
                          <div className="text-[13px] text-brand-text-3">{item.desc}</div>
                        </div>
                        <div className="w-11 h-6 bg-brand-green-700 rounded-full relative cursor-pointer shadow-inner">
                          <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
