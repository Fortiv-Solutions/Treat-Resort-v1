"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { type Role } from "@/lib/data";
import { Phone, Mail, LifeBuoy } from "lucide-react";

export default function HelpDeskPage() {
  const [role, setRole] = useState<Role>("MD");
  // Dummy module state
  const [activeModule, setActiveModule] = useState<"feedback" | "inbox" | "finance">("feedback");

  const FAQS = [
    { q: "How do I add a new team member?", a: "Go to Settings > Account Profile and click 'Invite Member'. They will receive an email invitation to join." },
    { q: "Can I export my finance data?", a: "Finance export is planned. Today, the Finance Intelligence module shows live imported records, revenue mix, entity health, receivables, and Tally import status." },
    { q: "How are Google Reviews tracked?", a: "The dashboard currently tracks when a Google review link is shown to a guest. Posted review sync requires a Google Business Profile integration." },
    { q: "What happens to unresolved complaints?", a: "Low-rating submissions create complaint tickets with SLA deadlines. Open SLA breaches are surfaced in the operations dashboard for manager follow-up." },
  ];

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      {/* ── Sidebar ── */}
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        role={role}
        setRole={setRole}
      />

      {/* ── Main ── */}
      <div className="app-content-shell">
        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1200px] mx-auto">
          
          {/* Hero Section */}
          <div className="bg-brand-green-950 rounded-2xl p-10 md:p-14 text-center mb-8 relative overflow-hidden shadow-premium-lg border border-brand-gold/30">
            <div className="absolute inset-x-0 top-0 h-1 bg-brand-gold pointer-events-none" />
            <LifeBuoy className="w-12 h-12 text-brand-gold mx-auto mb-6 opacity-90" />
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">How can we help you today?</h2>
            <p className="text-white/70 text-[15px] md:text-[17px] max-w-2xl mx-auto mb-8 font-medium">Search our knowledge base or browse categories below to find answers to common questions about TreatOS.</p>
            
          </div>



          {/* Two column layout for bottom section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="glass-card p-8">
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
              <div className="glass-card p-6">
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
