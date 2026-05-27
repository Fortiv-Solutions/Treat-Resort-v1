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
    background: "#ffffff",
    border: "1.5px solid rgba(0,0,0,0.1)",
    borderRadius: "8px", fontSize: "12px",
    color: "#111827", outline: "none",
    fontFamily: "'Inter', sans-serif",
    boxSizing: "border-box",
  };
}

const ACTION_LABELS: Record<RoutingRule["action"], { label: string; icon: typeof Star; color: string }> = {
  show_review_link: { label: "Send Google Review link", icon: Star,          color: "#059669" },
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
  const numericQuestions = form.questions.filter(question => question.type === "rating" || question.type === "nps");
  const numericQuestionIds = new Set(numericQuestions.map(question => question.id));
  const visibleRules = r.rules.filter(rule => numericQuestionIds.has(rule.questionId));

  function setRouting<K extends keyof typeof r>(key: K, val: typeof r[K]) {
    updateForm(prev => ({ ...prev, routing: { ...prev.routing, [key]: val } }));
  }

  function addRule() {
    const firstNumericQuestion = numericQuestions[0];
    if (!firstNumericQuestion) return;
    const nextRuleNumber = r.rules.reduce((max, rule) => {
      const idNumber = Number(rule.id.replace(/^r-/, ""));
      return Number.isFinite(idNumber) ? Math.max(max, idNumber) : max;
    }, 0) + 1;

    const newRule: RoutingRule = {
      id: `r-${nextRuleNumber}`,
      condition: "gte",
      value: 4,
      action: "show_review_link",
      questionId: firstNumericQuestion.id,
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
        background: r.enabled ? "rgba(5,150,105,0.08)" : "rgba(0,0,0,0.02)",
        border: `1px solid ${r.enabled ? "rgba(5,150,105,0.2)" : "rgba(0,0,0,0.06)"}`,
      }}>
        <div>
          <div style={{ fontSize: "12.5px", fontWeight: 600, color: r.enabled ? "#059669" : "rgba(0,0,0,0.5)" }}>
            Smart Routing
          </div>
          <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.4)", marginTop: "2px" }}>
            Auto-trigger actions on submission
          </div>
        </div>
        <div onClick={() => setRouting("enabled", !r.enabled)} style={{
          width: "40px", height: "22px", borderRadius: "11px",
          background: r.enabled ? "#059669" : "rgba(0,0,0,0.1)",
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
            {visibleRules.length === 0 && (
              <div style={{
                padding: "14px",
                borderRadius: "11px",
                background: "rgba(0,0,0,0.02)",
                border: "1px dashed rgba(0,0,0,0.1)",
                color: "rgba(0,0,0,0.6)",
                fontSize: "12px",
                lineHeight: 1.5,
              }}>
                Add a Star Rating or NPS Score question before creating routing rules.
              </div>
            )}

            {visibleRules.map((rule, i) => {
              const actionMeta = ACTION_LABELS[rule.action];
              return (
                <div key={rule.id} style={{
                  background: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.08)",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  borderRadius: "11px",
                  padding: "12px",
                  display: "flex", flexDirection: "column", gap: "10px",
                }}>
                  {/* Rule header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                      <div style={{
                        width: "22px", height: "22px", borderRadius: "6px",
                        background: "rgba(5,150,105,0.15)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "10px", fontWeight: 700, color: "#064e3b",
                      }}>
                        {i + 1}
                      </div>
                      <span style={{ fontSize: "11.5px", fontWeight: 600, color: "#111827" }}>Rule</span>
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
                      {numericQuestions.map(q => (
                        <option key={q.id} value={q.id} style={{ background: "#ffffff", color: "#111827" }}>
                          {q.label.slice(0, 32)}{q.label.length > 32 ? "..." : ""}
                        </option>
                      ))}
                    </select>

                    {/* Condition */}
                    <select value={rule.condition} onChange={e => updateRule(rule.id, { condition: e.target.value as RoutingRule["condition"] })}
                      style={{ ...iStyle(), cursor: "pointer" }}>
                      {(Object.keys(CONDITION_LABELS) as RoutingRule["condition"][]).map(c => (
                        <option key={c} value={c} style={{ background: "#ffffff", color: "#111827" }}>{CONDITION_LABELS[c]}</option>
                      ))}
                    </select>

                    {/* Value */}
                    {rule.condition === "between" ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <input type="number" min={0} max={10} value={rule.value}
                          onChange={e => updateRule(rule.id, { value: Number(e.target.value) })}
                          placeholder="Min"
                          style={{ ...iStyle(), width: "48px", padding: "7px 4px", textAlign: "center" }}
                          onFocus={e => (e.currentTarget.style.borderColor = "rgba(5,150,105,0.4)")}
                          onBlur={e => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.1)")}
                        />
                        <span style={{ color: "rgba(0,0,0,0.3)", fontSize: "10px" }}>-</span>
                        <input type="number" min={0} max={10} value={rule.value2 ?? 5}
                          onChange={e => updateRule(rule.id, { value2: Number(e.target.value) })}
                          placeholder="Max"
                          style={{ ...iStyle(), width: "48px", padding: "7px 4px", textAlign: "center" }}
                          onFocus={e => (e.currentTarget.style.borderColor = "rgba(5,150,105,0.4)")}
                          onBlur={e => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.1)")}
                        />
                      </div>
                    ) : (
                      <input type="number" min={0} max={10} value={rule.value}
                        onChange={e => updateRule(rule.id, { value: Number(e.target.value) })}
                        style={{ ...iStyle(), textAlign: "center" }}
                        onFocus={e => (e.currentTarget.style.borderColor = "rgba(5,150,105,0.4)")}
                        onBlur={e => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.1)")}
                      />
                    )}
                  </div>

                  {/* Action */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <ChevronRight size={12} color="rgba(0,0,0,0.3)" />
                    <select value={rule.action} onChange={e => updateRule(rule.id, { action: e.target.value as RoutingRule["action"] })}
                      style={{ ...iStyle(), flex: 1, cursor: "pointer", color: actionMeta.color, background: `rgba(${actionMeta.color === "#059669" ? "5,150,105" : actionMeta.color === "#EF4444" ? "239,68,68" : "245,158,11"},0.1)`, border: `1.5px solid ${actionMeta.color}30` }}>
                      {(Object.keys(ACTION_LABELS) as RoutingRule["action"][]).map(a => (
                        <option key={a} value={a} style={{ background: "#ffffff", color: "#111827" }}>{ACTION_LABELS[a].label}</option>
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

            <button disabled={numericQuestions.length === 0} onClick={addRule} style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
              padding: "9px", borderRadius: "10px",
              background: "rgba(0,0,0,0.02)", border: "1px dashed rgba(0,0,0,0.1)",
              color: "rgba(0,0,0,0.6)", fontSize: "12px",
              cursor: numericQuestions.length === 0 ? "not-allowed" : "pointer",
              opacity: numericQuestions.length === 0 ? 0.55 : 1,
            }}
              onMouseEnter={e => {
                if (!e.currentTarget.disabled) e.currentTarget.style.borderColor = "rgba(0,0,0,0.2)";
              }}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.1)")}
            >
              <Plus size={13} /> Add Rule
            </button>
          </div>

          {/* URLs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              ["Google Review Link", "reviewLink", "https://g.page/r/.../review"],
              ["GM Email / WhatsApp", "gmEmail", "gm@treatresorts.com"],
              ["MD Email", "mdEmail", "md@treatresorts.com"],
              ["WhatsApp Number", "whatsappNumber", "+91 98765 43210"],
            ].map(([label, key, ph]) => (
              <div key={key}>
                <div style={{ fontSize: "10.5px", fontWeight: 600, color: "rgba(0,0,0,0.5)", marginBottom: "5px", letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</div>
                <input type="text" value={(r as unknown as Record<string, string>)[key] ?? ""} onChange={e => setRouting(key as keyof typeof r, e.target.value as never)}
                  placeholder={ph} style={{ ...iStyle(), width: "100%" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "rgba(5,150,105,0.4)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.1)")}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
