"use client";

import { useState, useCallback, useId } from "react";
import type { FormConfig, Toast, Question } from "@/lib/formBuilderTypes";
import { DEFAULT_FORM } from "@/lib/formBuilderConstants";
import BuilderHeader from "./BuilderHeader";
import ToastContainer from "./Toast";
import CollapsibleSection from "./CollapsibleSection";
import FormSettingsSection from "./sections/FormSettingsSection";
import QuestionsSection from "./sections/QuestionsSection";
import RoutingRulesSection from "./sections/RoutingRulesSection";
import BrandingSection from "./sections/BrandingSection";
import ShareSection from "./sections/ShareSection";
import LivePreview from "./LivePreview";
import { Settings, List, GitBranch, Palette, Share2 } from "lucide-react";

const SECTIONS = [
  { key: "settings",  label: "Form Settings",   icon: Settings,   subtitle: "Property, title & guest details" },
  { key: "questions", label: "Questions",        icon: List,       subtitle: "Drag, add & configure questions" },
  { key: "routing",   label: "Routing Rules",    icon: GitBranch,  subtitle: "Auto-actions based on responses" },
  { key: "branding",  label: "Branding",         icon: Palette,    subtitle: "Colors, logo & thank you message" },
  { key: "share",     label: "Share & Embed",    icon: Share2,     subtitle: "Link, QR code & embed snippet" },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];

export default function FormBuilderApp() {
  const [form, setForm] = useState<FormConfig>(DEFAULT_FORM);
  const [openSection, setOpenSection] = useState<SectionKey | null>("settings");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const uid = useId();

  const updateForm = useCallback((updater: (prev: FormConfig) => FormConfig) => {
    setForm(updater);
  }, []);

  const addToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = `${uid}-${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, [uid]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toggleSection = useCallback((key: SectionKey) => {
    setOpenSection(prev => prev === key ? null : key);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0f2a20 0%, #1B4332 40%, #1e3a2f 100%)",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <BuilderHeader form={form} updateForm={updateForm} addToast={addToast} />

      {/* Two-panel content */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr) 420px",
        gap: "0",
        flex: 1,
        maxWidth: "1440px",
        width: "100%",
        margin: "0 auto",
        padding: "24px 24px 32px",
        alignItems: "start",
      }} className="fb-grid">

        {/* Left builder panel */}
        <div style={{
          paddingRight: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          minWidth: 0,
        }}>
          {SECTIONS.map((sec, i) => {
            const Icon = sec.icon;
            return (
              <CollapsibleSection
                key={sec.key}
                icon={<Icon size={15} />}
                label={sec.label}
                subtitle={sec.subtitle}
                isOpen={openSection === sec.key}
                onToggle={() => toggleSection(sec.key)}
                index={i}
              >
                {sec.key === "settings" && (
                  <FormSettingsSection form={form} updateForm={updateForm} />
                )}
                {sec.key === "questions" && (
                  <QuestionsSection form={form} updateForm={updateForm} addToast={addToast} />
                )}
                {sec.key === "routing" && (
                  <RoutingRulesSection form={form} updateForm={updateForm} />
                )}
                {sec.key === "branding" && (
                  <BrandingSection form={form} updateForm={updateForm} />
                )}
                {sec.key === "share" && (
                  <ShareSection form={form} updateForm={updateForm} addToast={addToast} />
                )}
              </CollapsibleSection>
            );
          })}
        </div>

        {/* Right preview panel */}
        <div style={{
          position: "sticky",
          top: "24px",
        }} className="fb-preview-sticky">
          <LivePreview form={form} />
        </div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <style>{`
        @media (max-width: 960px) {
          .fb-grid { grid-template-columns: 1fr !important; padding: 16px !important; }
          .fb-preview-sticky { position: static !important; }
        }
      `}</style>
    </div>
  );
}
