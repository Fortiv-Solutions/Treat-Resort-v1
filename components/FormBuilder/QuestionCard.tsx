"use client";

import { useId, useState } from "react";
import type { Question, QuestionType } from "@/lib/formBuilderTypes";
import { QUESTION_TYPE_META } from "@/lib/formBuilderConstants";
import { GripVertical, Trash2, ChevronDown, Plus, X } from "lucide-react";

interface Props {
  question: Question;
  index: number;
  onChange: (q: Question) => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  isDragging: boolean;
}

const TYPE_OPTIONS: QuestionType[] = ["rating", "nps", "text", "textarea", "select", "multiselect", "yesno", "date", "email", "phone"];

function iStyle(): React.CSSProperties {
  return {
    width: "100%", padding: "7px 10px",
    background: "rgba(255,255,255,0.06)",
    border: "1.5px solid rgba(255,255,255,0.1)",
    borderRadius: "8px", fontSize: "12px",
    color: "#FFFFFF", outline: "none",
    fontFamily: "'Inter', sans-serif",
    boxSizing: "border-box",
  };
}

export default function QuestionCard({ question: q, index, onChange, onDelete, onDragStart, onDragOver, onDrop, isDragging }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const fallbackOptionId = useId();

  const meta = QUESTION_TYPE_META[q.type];

  function setQ<K extends keyof Question>(key: K, val: Question[K]) {
    onChange({ ...q, [key]: val });
  }

  function changeType(type: QuestionType) {
    const next: Question = {
      ...q,
      type,
      options: type === "select" || type === "multiselect" ? (q.options?.length ? q.options : [{ id: `${fallbackOptionId}-option-1`, label: "Option 1" }]) : undefined,
      minRating: type === "rating" ? 1 : type === "nps" ? 0 : undefined,
      maxRating: type === "rating" ? 5 : type === "nps" ? 10 : undefined,
      lowLabel: type === "rating" || type === "nps" ? (q.lowLabel ?? "Low") : undefined,
      highLabel: type === "rating" || type === "nps" ? (q.highLabel ?? "High") : undefined,
    };
    onChange(next);
  }

  function addOption() {
    const opts = q.options ?? [];
    onChange({ ...q, options: [...opts, { id: `opt-${Date.now()}`, label: `Option ${opts.length + 1}` }] });
  }

  function removeOption(id: string) {
    onChange({ ...q, options: (q.options ?? []).filter(o => o.id !== id) });
  }

  function updateOption(id: string, label: string) {
    onChange({ ...q, options: (q.options ?? []).map(o => o.id === id ? { ...o, label } : o) });
  }

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, index)}
      onDragOver={e => { e.preventDefault(); onDragOver(e); }}
      onDrop={e => onDrop(e, index)}
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "12px",
        overflow: "hidden",
        opacity: isDragging ? 0.4 : 1,
        transition: "opacity 150ms, border-color 150ms",
        cursor: "default",
      }}
    >
      {/* Card header row */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px" }}>
        {/* Drag handle */}
        <div style={{ cursor: "grab", color: "rgba(255,255,255,0.25)", flexShrink: 0, display: "flex", alignItems: "center" }}>
          <GripVertical size={14} />
        </div>

        {/* Index badge */}
        <div style={{
          width: "20px", height: "20px", borderRadius: "6px", flexShrink: 0,
          background: "rgba(201,169,110,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "10px", fontWeight: 700, color: "#C9A96E",
        }}>
          {index + 1}
        </div>

        {/* Type badge */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setTypeOpen(v => !v)}
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "4px 8px", borderRadius: "7px",
              background: "rgba(201,169,110,0.12)",
              border: "1px solid rgba(201,169,110,0.2)",
              color: "#C9A96E", fontSize: "11px", fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <span>{meta.icon}</span>
            {meta.label}
            <ChevronDown size={10} style={{ transform: typeOpen ? "rotate(180deg)" : "none", transition: "transform 200ms" }} />
          </button>
          {typeOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 4px)", left: 0,
              background: "#1a3d2c", border: "1px solid rgba(201,169,110,0.25)",
              borderRadius: "10px", padding: "4px",
              zIndex: 50, minWidth: "160px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}>
              {TYPE_OPTIONS.map(t => {
                const m = QUESTION_TYPE_META[t];
                return (
                  <button key={t} onClick={() => { changeType(t); setTypeOpen(false); }} style={{
                    width: "100%", display: "flex", alignItems: "center", gap: "8px",
                    padding: "7px 10px", borderRadius: "7px", border: "none",
                    background: q.type === t ? "rgba(201,169,110,0.15)" : "transparent",
                    color: q.type === t ? "#C9A96E" : "rgba(255,255,255,0.7)",
                    fontSize: "12px", cursor: "pointer", textAlign: "left",
                  }}>
                    <span style={{ width: "16px", textAlign: "center", fontWeight: 700 }}>{m.icon}</span>
                    {m.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Label preview */}
        <div style={{ flex: 1, minWidth: 0, fontSize: "12.5px", color: "rgba(255,255,255,0.8)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {q.label || <span style={{ color: "rgba(255,255,255,0.3)" }}>Untitled question</span>}
        </div>

        {/* Required badge */}
        <button
          onClick={() => setQ("required", !q.required)}
          style={{
            padding: "3px 8px", borderRadius: "20px", fontSize: "10.5px", fontWeight: 600,
            background: q.required ? "rgba(220,38,38,0.15)" : "rgba(255,255,255,0.07)",
            border: `1px solid ${q.required ? "rgba(220,38,38,0.3)" : "rgba(255,255,255,0.1)"}`,
            color: q.required ? "#FCA5A5" : "rgba(255,255,255,0.4)",
            cursor: "pointer", whiteSpace: "nowrap",
          }}
        >
          {q.required ? "Required" : "Optional"}
        </button>

        {/* Expand */}
        <button onClick={() => setExpanded(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: "2px", display: "flex", alignItems: "center" }}>
          <ChevronDown size={14} style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 250ms" }} />
        </button>

        {/* Delete */}
        <button onClick={onDelete} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(239,68,68,0.5)", padding: "2px", display: "flex", alignItems: "center" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#EF4444")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(239,68,68,0.5)")}
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Expanded editor */}
      {expanded && (
        <div style={{ padding: "0 12px 14px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* Label */}
          <div>
            <div style={{ fontSize: "10.5px", fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: "5px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Question Label</div>
            <input
              type="text"
              value={q.label}
              onChange={e => setQ("label", e.target.value)}
              placeholder={meta.defaultLabel}
              style={iStyle()}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(201,169,110,0.4)")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>

          {/* Placeholder (text/textarea) */}
          {(q.type === "text" || q.type === "textarea") && (
            <div>
              <div style={{ fontSize: "10.5px", fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: "5px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Placeholder</div>
              <input
                type="text"
                value={q.placeholder ?? ""}
                onChange={e => setQ("placeholder", e.target.value)}
                placeholder="Hint text shown inside the input…"
                style={iStyle()}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(201,169,110,0.4)")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>
          )}

          {/* Rating scale labels */}
          {(q.type === "rating" || q.type === "nps") && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {[["Low Label", "lowLabel", "e.g. Poor"], ["High Label", "highLabel", "e.g. Excellent"]] .map(([label, key, ph]) => (
                <div key={key}>
                  <div style={{ fontSize: "10.5px", fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: "5px", letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</div>
                  <input type="text" value={(q as unknown as Record<string, string>)[key] ?? ""} onChange={e => onChange({ ...q, [key]: e.target.value })} placeholder={ph} style={iStyle()}
                    onFocus={e => (e.currentTarget.style.borderColor = "rgba(201,169,110,0.4)")}
                    onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Options (select/multiselect) */}
          {(q.type === "select" || q.type === "multiselect") && (
            <div>
              <div style={{ fontSize: "10.5px", fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: "8px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Options</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {(q.options ?? []).map(opt => (
                  <div key={opt.id} style={{ display: "flex", gap: "6px" }}>
                    <input type="text" value={opt.label} onChange={e => updateOption(opt.id, e.target.value)} style={{ ...iStyle(), flex: 1 }}
                      onFocus={e => (e.currentTarget.style.borderColor = "rgba(201,169,110,0.4)")}
                      onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                    />
                    <button onClick={() => removeOption(opt.id)} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "7px", padding: "0 8px", cursor: "pointer", color: "#FCA5A5", display: "flex", alignItems: "center" }}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <button onClick={addOption} style={{
                  display: "flex", alignItems: "center", gap: "6px", justifyContent: "center",
                  padding: "7px", borderRadius: "8px",
                  background: "rgba(201,169,110,0.08)", border: "1px dashed rgba(201,169,110,0.25)",
                  color: "rgba(201,169,110,0.7)", fontSize: "11.5px", cursor: "pointer",
                }}>
                  <Plus size={12} /> Add Option
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
