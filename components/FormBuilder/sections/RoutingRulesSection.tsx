"use client";

import type { FormConfig, RoutingRule } from "@/lib/formBuilderTypes";
import { Plus, Trash2, Star, AlertTriangle, MessageSquare, ChevronRight } from "lucide-react";

interface Props {
  form: FormConfig;
  updateForm: (updater: (prev: FormConfig) => FormConfig) => void;
}

function iStyle(): React.CSSProperties {
  return {
    padding: "7px 10px",
    background: "rgba(255,255,255,0.06)",
    border: "1.5px solid rgba(255,255,255,0.1)",
    borderRadius: "8px", fontSize: "12px",
    color: "#FFFFFF", outline: "none",
    fontFamily: "'Inter', sans-serif",
    boxSizing: "border-box",
  };
}

const ACTION_LABELS: Record<RoutingRule["action"], { label: string; icon: typeof Star; color: string }> = {
  show_review_link: { label: "Send Google Review link", icon: Star,          color: "#C9A96E" },
  alert_gm:         { label: "Alert GM via WhatsApp",   icon: AlertTriangle, color: "#F59E0B" },
  alert_md:         { label: "Alert MD via WhatsApp",   icon: AlertTriangle, color: "#EF4444" },
  alert_gm_md:      { label: "Alert GM & MD",           icon: AlertTriangle, color: "#EF4444" },
  custom_message:   { label: "Custom message",          icon: MessageSquare, color: "#60A5FA" },
};

const CONDITION_LABELS: Record<RoutingRule["condition"], string> = {
  gte: "is >=",
  lte: "is <=",
  eq: "equals",
  between: "is between",
};

export default function RoutingRulesSection({ form, updateForm }: Props) {
  const r = form.routing;

  function setRouting<K extends keyof typeof r>(key: K, val: typeof r[K]) {
    updateForm(prev => ({ ...prev, routing: { ...prev.routing, [key]: val } }));
  }

  function addRule() {
    const newRule: RoutingRule = {
      id: `r-${Date.now()}`,
      condition: "gte",
      value: 4,
      action: "show_review_link",
      questionId: form.questions.find(q => q.type === "rating" || q.type === "nps")?.id ?? form.questions[0]?.id ?? "",
    };
    setRouting("rules", [...r.rules, newRule]);
  }

  function updateRule(id: string, patch: Partial<RoutingRule>) {
    setRouting("rules", r.rules.map(rule => rule.id === id ? { ...rule, ...patch } : rule));
  }

  function deleteRule(id: string) {
    setRouting("rules", r.rules.filter(rule => rule.id !== id));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Enable toggle */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 14px", borderRadius: "10px",
        background: r.enabled ? "rgba(5,150,105,0.1)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${r.enabled ? "rgba(5,150,105,0.2)" : "rgba(255,255,255,0.08)"}`,
      }}>
        <div>
          <div style={{ fontSize: "12.5px", fontWeight: 600, color: r.enabled ? "#6EE7B7" : "rgba(255,255,255,0.5)" }}>
            Smart Routing
          </div>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>
            Auto-trigger actions on submission
          </div>
        </div>
        <div onClick={() => setRouting("enabled", !r.enabled)} style={{
          width: "40px", height: "22px", borderRadius: "11px",
          background: r.enabled ? "#059669" : "rgba(255,255,255,0.12)",
          position: "relative", cursor: "pointer",
          transition: "background 200ms",
        }}>
          <div style={{
            position: "absolute", top: "3px",
            left: r.enabled ? "20px" : "3px",
            width: "16px", height: "16px", borderRadius: "50%",
            background: "#FFFFFF",
            transition: "left 200ms var(--ease-out-expo)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          }} />
        </div>
      </div>

      {r.enabled && (
        <>
          {/* Rules */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {r.rules.map((rule, i) => {
              const actionMeta = ACTION_LABELS[rule.action];
              return (
                <div key={rule.id} style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: "11px",
                  padding: "12px",
                  display: "flex", flexDirection: "column", gap: "10px",
                }}>
                  {/* Rule header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                      <div style={{
                        width: "22px", height: "22px", borderRadius: "6px",
                        background: "rgba(201,169,110,0.15)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "10px", fontWeight: 700, color: "#C9A96E",
                      }}>
                        {i + 1}
                      </div>
                      <span style={{ fontSize: "11.5px", fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>Rule</span>
                    </div>
                    <button onClick={() => deleteRule(rule.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(239,68,68,0.4)", padding: "2px", display: "flex" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "#EF4444")}
                      onMouseLeave={e => (e.currentTarget.style.color = "rgba(239,68,68,0.4)")}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {/* Rule body */}
                  <div style={{ display: "grid", gridTemplateColumns: rule.condition === "between" ? "1fr auto 120px" : "1fr auto 80px", gap: "6px", alignItems: "center" }}>
                    {/* Question */}
                    <select value={rule.questionId} onChange={e => updateRule(rule.id, { questionId: e.target.value })}
                      style={{ ...iStyle(), cursor: "pointer" }}>
                      {form.questions.map(q => (
                        <option key={q.id} value={q.id} style={{ background: "#1a3d2c" }}>
                          {q.label.slice(0, 32)}{q.label.length > 32 ? "…" : ""}
                        </option>
                      ))}
                    </select>

                    {/* Condition */}
                    <select value={rule.condition} onChange={e => updateRule(rule.id, { condition: e.target.value as RoutingRule["condition"] })}
                      style={{ ...iStyle(), cursor: "pointer" }}>
                      {(Object.keys(CONDITION_LABELS) as RoutingRule["condition"][]).map(c => (
                        <option key={c} value={c} style={{ background: "#1a3d2c" }}>{CONDITION_LABELS[c]}</option>
                      ))}
                    </select>

                    {/* Value */}
                    {rule.condition === "between" ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <input type="number" min={0} max={10} value={rule.value}
                          onChange={e => updateRule(rule.id, { value: Number(e.target.value) })}
                          placeholder="Min"
                          style={{ ...iStyle(), width: "48px", padding: "7px 4px", textAlign: "center" }}
                          onFocus={e => (e.currentTarget.style.borderColor = "rgba(201,169,110,0.4)")}
                          onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                        />
                        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>-</span>
                        <input type="number" min={0} max={10} value={rule.value2 ?? 5}
                          onChange={e => updateRule(rule.id, { value2: Number(e.target.value) })}
                          placeholder="Max"
                          style={{ ...iStyle(), width: "48px", padding: "7px 4px", textAlign: "center" }}
                          onFocus={e => (e.currentTarget.style.borderColor = "rgba(201,169,110,0.4)")}
                          onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                        />
                      </div>
                    ) : (
                      <input type="number" min={0} max={10} value={rule.value}
                        onChange={e => updateRule(rule.id, { value: Number(e.target.value) })}
                        style={{ ...iStyle(), textAlign: "center" }}
                        onFocus={e => (e.currentTarget.style.borderColor = "rgba(201,169,110,0.4)")}
                        onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                      />
                    )}
                  </div>

                  {/* Action */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <ChevronRight size={12} color="rgba(255,255,255,0.3)" />
                    <select value={rule.action} onChange={e => updateRule(rule.id, { action: e.target.value as RoutingRule["action"] })}
                      style={{ ...iStyle(), flex: 1, cursor: "pointer", color: actionMeta.color, background: `rgba(${actionMeta.color === "#C9A96E" ? "201,169,110" : actionMeta.color === "#EF4444" ? "239,68,68" : "245,158,11"},0.1)`, border: `1.5px solid ${actionMeta.color}30` }}>
                      {(Object.keys(ACTION_LABELS) as RoutingRule["action"][]).map(a => (
                        <option key={a} value={a} style={{ background: "#1a3d2c", color: "#fff" }}>{ACTION_LABELS[a].label}</option>
                      ))}
                    </select>
                  </div>

                  {rule.action === "custom_message" && (
                    <textarea
                      value={rule.customMessage ?? ""}
                      onChange={e => updateRule(rule.id, { customMessage: e.target.value })}
                      placeholder="Message shown after submission"
                      rows={2}
                      style={{ ...iStyle(), width: "100%", resize: "vertical", lineHeight: 1.4 }}
                    />
                  )}
                </div>
              );
            })}

            <button onClick={addRule} style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
              padding: "9px", borderRadius: "10px",
              background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.14)",
              color: "rgba(255,255,255,0.45)", fontSize: "12px", cursor: "pointer",
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)")}
            >
              <Plus size={13} /> Add Rule
            </button>
          </div>

          {/* URLs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              ["Google Review Link", "reviewLink", "https://g.page/r/…/review"],
              ["GM Email / WhatsApp", "gmEmail", "gm@treatresorts.com"],
              ["MD Email", "mdEmail", "md@treatresorts.com"],
              ["WhatsApp Number", "whatsappNumber", "+91 98765 43210"],
            ].map(([label, key, ph]) => (
              <div key={key}>
                <div style={{ fontSize: "10.5px", fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: "5px", letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</div>
                <input type="text" value={(r as unknown as Record<string, string>)[key] ?? ""} onChange={e => setRouting(key as keyof typeof r, e.target.value as never)}
                  placeholder={ph} style={{ ...iStyle(), width: "100%" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "rgba(201,169,110,0.4)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
