"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { type Role, ROLES } from "@/lib/data";
import { Search, Bell, ChevronRight, BookOpen, MessageSquare, Phone, Mail, FileText, LifeBuoy } from "lucide-react";

export default function HelpDeskPage() {
  const [role, setRole] = useState<Role>("MD");
  // Dummy module state
  const [activeModule, setActiveModule] = useState<"feedback" | "inbox" | "finance">("feedback");

  const FAQS = [
    { q: "How do I add a new team member?", a: "Go to Settings > Account Profile and click 'Invite Member'. They will receive an email invitation to join." },
    { q: "Can I export my finance data?", a: "Yes, navigate to the Finance Intelligence module and click the 'Export' button in the top right to download a CSV or PDF." },
    { q: "How are Google Reviews synced?", a: "Our system automatically pulls new reviews from your connected Google Business Profile every 6 hours." },
    { q: "What happens to unresolved complaints?", a: "Complaints not marked as resolved within 24 hours are automatically escalated to the Managing Director via email and SMS." },
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
              Help Desk
            </h1>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-white rounded-full px-4 h-10 shadow-sm transition-all duration-200 focus-within:ring-2 focus-within:ring-brand-gold/20 w-[240px] lg:w-[280px]">
              <Search className="w-4 h-4 text-brand-text-3 shrink-0" />
              <input
                placeholder="Search help articles..."
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
          
          {/* Hero Section */}
          <div className="bg-brand-green-900 rounded-2xl p-10 md:p-14 text-center mb-8 relative overflow-hidden shadow-lg border border-brand-green-800">
            {/* Decorative background circles */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

            <LifeBuoy className="w-12 h-12 text-brand-gold mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">How can we help you today?</h2>
            <p className="text-brand-green-100/80 text-[15px] md:text-[17px] max-w-2xl mx-auto mb-8 font-medium">Search our knowledge base or browse categories below to find answers to common questions about TreatOS.</p>
            
          </div>



          {/* Two column layout for bottom section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-brand-border-soft p-8">
                <h3 className="text-xl font-bold text-brand-text-1 mb-6">Frequently Asked Questions</h3>
                <div className="space-y-6">
                  {FAQS.map((faq, i) => (
                    <div key={i} className="pb-6 border-b border-brand-border-soft last:border-0 last:pb-0">
                      <h4 className="text-[15px] font-bold text-brand-text-1 mb-2">{faq.q}</h4>
                      <p className="text-[14px] text-brand-text-2 leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 flex flex-col gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-brand-border-soft p-6">
                <h3 className="text-[16px] font-bold text-brand-text-1 mb-4">Contact Us Directly</h3>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-surface-2 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-brand-text-2" />
                    </div>
                    <div>
                      <div className="text-[12px] font-medium text-brand-text-3 mb-0.5">Call Support</div>
                      <div className="text-[14px] font-bold text-brand-text-1">+91 1800 123 4567</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-surface-2 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-brand-text-2" />
                    </div>
                    <div>
                      <div className="text-[12px] font-medium text-brand-text-3 mb-0.5">Email Support</div>
                      <div className="text-[14px] font-bold text-brand-text-1">support@treatresorts.com</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
