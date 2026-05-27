"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      role="presentation"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(7,21,15,0.74)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        overflowY: "auto",
        animation: "fadeIn 160ms ease both",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-question-title"
        style={{
          background: "linear-gradient(180deg, #142d22 0%, #10261c 100%)",
          border: "1px solid rgba(201,169,110,0.28)",
          borderRadius: "14px",
          width: "min(680px, 100%)",
          maxHeight: "calc(100vh - 48px)",
          boxShadow: "0 28px 90px rgba(0,0,0,0.58), 0 0 0 1px rgba(255,255,255,0.04)",
          animation: "scaleIn 180ms cubic-bezier(0.16,1,0.3,1) both",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: "14px",
          padding: "16px 18px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          flexShrink: 0,
        }}>
          <div>
            <div id="add-question-title" style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>Add a Question</div>
            <div style={{ fontSize: "11px", color: "rgba(201,169,110,0.6)", marginTop: "2px" }}>Choose a question type to add</div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Close question picker"
            onClick={onClose}
            style={{
            width: "28px", height: "28px", borderRadius: "8px",
            background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            color: "rgba(255,255,255,0.5)",
            flexShrink: 0,
          }}>
            <X size={13} />
          </button>
        </div>

        {/* Groups */}
        <div style={{
          padding: "16px 18px 18px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          overflowY: "auto",
        }}>
          {TYPE_GROUPS.map(group => (
            <div key={group.label}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.38)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
                {group.label}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "8px" }}>
                {group.types.map(type => {
                  const m = QUESTION_TYPE_META[type];
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => { onAdd(type); onClose(); }}
                      style={{
                        display: "flex", flexDirection: "column", alignItems: "flex-start",
                        gap: "6px", padding: "12px 14px", borderRadius: "10px",
                        minHeight: "92px",
                        background: "rgba(255,255,255,0.055)",
                        border: "1px solid rgba(255,255,255,0.095)",
                        cursor: "pointer", textAlign: "left",
                        transition: "background 150ms, border-color 150ms, box-shadow 150ms",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = "rgba(201,169,110,0.12)";
                        e.currentTarget.style.borderColor = "rgba(201,169,110,0.32)";
                        e.currentTarget.style.boxShadow = "0 10px 22px rgba(0,0,0,0.18)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.055)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.095)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <span style={{ fontSize: "16px", lineHeight: 1, color: "#C9A96E", fontWeight: 800 }}>{m.icon}</span>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "#FFFFFF", lineHeight: 1.2 }}>{m.label}</div>
                      <div style={{ fontSize: "10.5px", color: "rgba(255,255,255,0.48)", lineHeight: 1.35 }}>{m.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
