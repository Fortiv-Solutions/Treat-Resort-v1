"use client";

import { useId, useState } from "react";
import type { Question, QuestionType } from "@/lib/formBuilderTypes";
import { QUESTION_TYPE_META } from "@/lib/formBuilderConstants";
import { ChevronDown, GripVertical, Plus, Trash2, X } from "lucide-react";

interface Props {
  question: Question;
  index: number;
  onChange: (q: Question) => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  isDragging: boolean;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

const TYPE_OPTIONS: QuestionType[] = ["rating", "nps", "text", "textarea", "select", "multiselect", "yesno", "date", "email", "phone"];
const PLACEHOLDER_TYPES: QuestionType[] = ["text", "textarea", "email", "phone", "date", "select"];

function iStyle(): React.CSSProperties {
  return {
    width: "100%",
    padding: "8px 10px",
    background: "#ffffff",
    border: "1.5px solid rgba(0,0,0,0.1)",
    borderRadius: "8px",
    fontSize: "12px",
    color: "#111827",
    outline: "none",
    fontFamily: "'Inter', sans-serif",
    boxSizing: "border-box",
  };
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: "10.5px",
      fontWeight: 650,
      color: "rgba(0,0,0,0.5)",
      marginBottom: "5px",
      letterSpacing: "0.04em",
      textTransform: "uppercase",
    }}>
      {children}
    </div>
  );
}

export default function QuestionCard({
  question: q,
  index,
  onChange,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
  expanded,
  onExpandedChange,
}: Props) {
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
      placeholder: PLACEHOLDER_TYPES.includes(type) ? q.placeholder : undefined,
      options: type === "select" || type === "multiselect"
        ? (q.options?.length ? q.options : [{ id: `${fallbackOptionId}-option-1`, label: "Option 1" }, { id: `${fallbackOptionId}-option-2`, label: "Option 2" }])
        : undefined,
      minRating: type === "rating" ? 1 : type === "nps" ? 0 : undefined,
      maxRating: type === "rating" ? 5 : type === "nps" ? 10 : undefined,
      lowLabel: type === "rating" || type === "nps" ? (q.lowLabel ?? "Low") : undefined,
      highLabel: type === "rating" || type === "nps" ? (q.highLabel ?? "High") : undefined,
    };
    onChange(next);
    onExpandedChange(true);
  }

  function addOption() {
    const opts = q.options ?? [];
    onChange({ ...q, options: [...opts, { id: `opt-${Date.now()}`, label: `Option ${opts.length + 1}` }] });
  }

  function removeOption(id: string) {
    const nextOptions = (q.options ?? []).filter(option => option.id !== id);
    onChange({
      ...q,
      options: nextOptions.length ? nextOptions : [{ id: `opt-${Date.now()}-fallback`, label: "Option 1" }],
    });
  }

  function updateOption(id: string, label: string) {
    onChange({ ...q, options: (q.options ?? []).map(option => option.id === id ? { ...option, label } : option) });
  }

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, index)}
      onDragOver={e => { e.preventDefault(); onDragOver(e); }}
      onDrop={e => onDrop(e, index)}
      style={{
        background: "#ffffff",
        border: `1px solid ${expanded ? "rgba(5,150,105,0.5)" : "rgba(0,0,0,0.08)"}`,
        borderRadius: "12px",
        overflow: "visible",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        opacity: isDragging ? 0.4 : 1,
        transition: "opacity 150ms, border-color 150ms, background 150ms",
        cursor: "default",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px" }}>
        <div style={{ cursor: "grab", color: "rgba(0,0,0,0.2)", flexShrink: 0, display: "flex", alignItems: "center" }}>
          <GripVertical size={14} />
        </div>

        <div style={{
          width: "20px",
          height: "20px",
          borderRadius: "6px",
          flexShrink: 0,
          background: "rgba(5,150,105,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "10px",
          fontWeight: 700,
          color: "#059669",
        }}>
          {index + 1}
        </div>

        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setTypeOpen(v => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "4px 8px",
              borderRadius: "7px",
              background: "rgba(5,150,105,0.12)",
              border: "1px solid rgba(5,150,105,0.2)",
              color: "#059669",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <span>{meta.icon}</span>
            {meta.label}
            <ChevronDown size={10} style={{ transform: typeOpen ? "rotate(180deg)" : "none", transition: "transform 200ms" }} />
          </button>
          {typeOpen && (
            <div style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              background: "#ffffff",
              border: "1px solid rgba(0,0,0,0.1)",
              borderRadius: "10px",
              padding: "4px",
              zIndex: 80,
              minWidth: "170px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            }}>
              {TYPE_OPTIONS.map(type => {
                const optionMeta = QUESTION_TYPE_META[type];
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => { changeType(type); setTypeOpen(false); }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "7px 10px",
                      borderRadius: "7px",
                      border: "none",
                      background: q.type === type ? "rgba(5,150,105,0.1)" : "transparent",
                      color: q.type === type ? "#064e3b" : "rgba(0,0,0,0.7)",
                      fontSize: "12px",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <span style={{ width: "16px", textAlign: "center", fontWeight: 700 }}>{optionMeta.icon}</span>
                    {optionMeta.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => onExpandedChange(!expanded)}
          style={{
            flex: 1,
            minWidth: 0,
            background: "transparent",
            border: "none",
            padding: 0,
            textAlign: "left",
            fontSize: "12.5px",
            color: "#111827",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            cursor: "pointer",
          }}
        >
          {q.label || <span style={{ color: "rgba(0,0,0,0.3)" }}>Untitled question</span>}
        </button>

        <button
          type="button"
          onClick={() => setQ("required", !q.required)}
          style={{
            padding: "3px 8px",
            borderRadius: "20px",
            fontSize: "10.5px",
            fontWeight: 600,
            background: q.required ? "rgba(220,38,38,0.1)" : "rgba(0,0,0,0.04)",
            border: `1px solid ${q.required ? "rgba(220,38,38,0.2)" : "rgba(0,0,0,0.1)"}`,
            color: q.required ? "#DC2626" : "rgba(0,0,0,0.5)",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {q.required ? "Required" : "Optional"}
        </button>

        <button
          type="button"
          onClick={() => onExpandedChange(!expanded)}
          aria-label={expanded ? "Collapse question editor" : "Expand question editor"}
          style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(0,0,0,0.4)", padding: "2px", display: "flex", alignItems: "center" }}
        >
          <ChevronDown size={14} style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 250ms" }} />
        </button>

        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete question"
          style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(239,68,68,0.5)", padding: "2px", display: "flex", alignItems: "center" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#EF4444")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(239,68,68,0.5)")}
        >
          <Trash2 size={13} />
        </button>
      </div>

      {expanded && (
        <div style={{
          padding: "12px",
          borderTop: "1px solid rgba(0,0,0,0.06)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}>
          <div>
            <FieldLabel>Question Label</FieldLabel>
            <input
              type="text"
              value={q.label}
              onChange={e => setQ("label", e.target.value)}
              placeholder={meta.defaultLabel}
              style={iStyle()}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(5,150,105,0.4)")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.1)")}
            />
          </div>

          {PLACEHOLDER_TYPES.includes(q.type) && (
            <div>
              <FieldLabel>Placeholder</FieldLabel>
              <input
                type="text"
                value={q.placeholder ?? ""}
                onChange={e => setQ("placeholder", e.target.value)}
                placeholder="Hint text shown inside the input..."
                style={iStyle()}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(5,150,105,0.4)")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.1)")}
              />
            </div>
          )}

          {(q.type === "rating" || q.type === "nps") && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "8px" }}>
              <div>
                <FieldLabel>Min</FieldLabel>
                <input
                  type="number"
                  min={q.type === "nps" ? 0 : 1}
                  max={9}
                  value={q.minRating ?? (q.type === "nps" ? 0 : 1)}
                  onChange={e => setQ("minRating", Number(e.target.value))}
                  style={iStyle()}
                />
              </div>
              <div>
                <FieldLabel>Max</FieldLabel>
                <input
                  type="number"
                  min={2}
                  max={10}
                  value={q.maxRating ?? (q.type === "nps" ? 10 : 5)}
                  onChange={e => setQ("maxRating", Number(e.target.value))}
                  style={iStyle()}
                />
              </div>
              {([
                ["Low Label", "lowLabel", "e.g. Poor"],
                ["High Label", "highLabel", "e.g. Excellent"],
              ] as const).map(([label, key, placeholder]) => (
                <div key={key}>
                  <FieldLabel>{label}</FieldLabel>
                  <input
                    type="text"
                    value={q[key] ?? ""}
                    onChange={e => setQ(key, e.target.value)}
                    placeholder={placeholder}
                    style={iStyle()}
                  />
                </div>
              ))}
            </div>
          )}

          {(q.type === "select" || q.type === "multiselect") && (
            <div>
              <FieldLabel>Options</FieldLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                {(q.options ?? []).map((option, optionIndex) => (
                  <div key={option.id} style={{ display: "grid", gridTemplateColumns: "24px minmax(0, 1fr) 34px", gap: "6px", alignItems: "center" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "7px", display: "grid", placeItems: "center", background: "rgba(5,150,105,0.15)", color: "#064e3b", fontSize: "10px", fontWeight: 700 }}>
                      {optionIndex + 1}
                    </div>
                    <input
                      type="text"
                      value={option.label}
                      onChange={e => updateOption(option.id, e.target.value)}
                      placeholder={`Option ${optionIndex + 1}`}
                      style={iStyle()}
                      onFocus={e => (e.currentTarget.style.borderColor = "rgba(5,150,105,0.4)")}
                      onBlur={e => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.1)")}
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(option.id)}
                      aria-label={`Remove option ${optionIndex + 1}`}
                      style={{ height: "34px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", cursor: "pointer", color: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addOption}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    justifyContent: "center",
                    padding: "8px",
                    borderRadius: "8px",
                    background: "rgba(0,0,0,0.02)",
                    border: "1px dashed rgba(0,0,0,0.1)",
                    color: "#064e3b",
                    fontSize: "11.5px",
                    cursor: "pointer",
                  }}
                >
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
