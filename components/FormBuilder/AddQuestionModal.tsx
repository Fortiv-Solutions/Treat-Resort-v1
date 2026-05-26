"use client";

import type { QuestionType } from "@/lib/formBuilderTypes";
import { QUESTION_TYPE_META } from "@/lib/formBuilderConstants";
import { X } from "lucide-react";

interface Props {
  onAdd: (type: QuestionType) => void;
  onClose: () => void;
}

const TYPE_GROUPS: { label: string; types: QuestionType[] }[] = [
  { label: "Rating & Scale",  types: ["rating", "nps"] },
  { label: "Text Input",      types: ["text", "textarea"] },
  { label: "Choice",          types: ["select", "multiselect", "yesno"] },
  { label: "Contact & Other", types: ["email", "phone", "date"] },
];

export default function AddQuestionModal({ onAdd, onClose }: Props) {
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 500,
        background: "rgba(15,42,32,0.75)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px",
        animation: "fadeIn 160ms ease both",
      }}
    >
      <div style={{
        background: "#152d22",
        border: "1px solid rgba(201,169,110,0.25)",
        borderRadius: "18px",
        width: "100%", maxWidth: "480px",
        boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
        animation: "scaleIn 220ms cubic-bezier(0.16,1,0.3,1) both",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>Add a Question</div>
            <div style={{ fontSize: "11px", color: "rgba(201,169,110,0.6)", marginTop: "2px" }}>Choose a question type to add</div>
          </div>
          <button onClick={onClose} style={{
            width: "28px", height: "28px", borderRadius: "8px",
            background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            color: "rgba(255,255,255,0.5)",
          }}>
            <X size={13} />
          </button>
        </div>

        {/* Groups */}
        <div style={{ padding: "16px 20px 20px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {TYPE_GROUPS.map(group => (
            <div key={group.label}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
                {group.label}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "6px" }}>
                {group.types.map(type => {
                  const m = QUESTION_TYPE_META[type];
                  return (
                    <button
                      key={type}
                      onClick={() => { onAdd(type); onClose(); }}
                      style={{
                        display: "flex", flexDirection: "column", alignItems: "flex-start",
                        gap: "4px", padding: "10px 12px", borderRadius: "10px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        cursor: "pointer", textAlign: "left",
                        transition: "background 150ms, border-color 150ms",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(201,169,110,0.1)"; e.currentTarget.style.borderColor = "rgba(201,169,110,0.25)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                    >
                      <span style={{ fontSize: "16px", lineHeight: 1 }}>{m.icon}</span>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "#FFFFFF", lineHeight: 1.2 }}>{m.label}</div>
                      <div style={{ fontSize: "10.5px", color: "rgba(255,255,255,0.4)", lineHeight: 1.3 }}>{m.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
