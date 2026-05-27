"use client";

import { useState } from "react";
import type { FormConfig, Question } from "@/lib/formBuilderTypes";
import { Star, CheckCircle, ChevronRight } from "lucide-react";

interface Props {
  form: FormConfig;
}

function StarRating({ max = 5, value, onChange }: { max?: number; value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: "4px" }}>
      {Array.from({ length: max }, (_, i) => i + 1).map(i => (
        <button
          key={i}
          aria-label={`Set rating to ${i}`}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
          style={{
            background: "none", border: "none", cursor: "pointer", padding: "2px",
            color: i <= (hover || value) ? "#059669" : "#D1D5DB",
            transition: "color 100ms, transform 100ms",
            transform: i === (hover || value) ? "scale(1.15)" : "scale(1)",
          }}
        >
          <Star size={24} fill={i <= (hover || value) ? "#059669" : "none"} strokeWidth={1.8} />
        </button>
      ))}
    </div>
  );
}

function NPSRow({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <div style={{ display: "flex", gap: "3px" }}>
        {Array.from({ length: 11 }, (_, i) => i).map(i => (
          <button key={i} aria-label={`Set score to ${i}`} onClick={() => onChange(i)} style={{
            flex: 1, padding: "7px 0", borderRadius: "6px", border: "none", cursor: "pointer",
            background: value === i ? "#1B4332" : "#F3F4F6",
            color: value === i ? "#059669" : "#6B7280",
            fontSize: "11px", fontWeight: 700,
            transition: "background 150ms",
          }}>
            {i}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: "10.5px", color: "#9CA3AF" }}>Not likely</span>
        <span style={{ fontSize: "10.5px", color: "#9CA3AF" }}>Very likely</span>
      </div>
    </div>
  );
}

function QuestionPreview({ q, branding, onAnswerChange }: { q: Question; branding: FormConfig["branding"], onAnswerChange: (id: string, val: number) => void }) {
  const [textVal, setTextVal] = useState("");
  const [ratingVal, setRatingVal] = useState(0);
  const [npsVal, setNpsVal] = useState(-1);
  const [selectVal, setSelectVal] = useState<string[]>([]);
  const [yesno, setYesno] = useState<"yes" | "no" | null>(null);

  const iStyle: React.CSSProperties = {
    width: "100%", padding: "10px 13px",
    background: "#FFFFFF", border: "1.5px solid #E4DDD4",
    borderRadius: "10px", fontSize: "13px", color: "#1A2B4A",
    fontFamily: branding.fontFamily + ", Inter, sans-serif",
    outline: "none", resize: "vertical" as const, boxSizing: "border-box" as const,
    lineHeight: 1.5,
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{ display: "flex", gap: "4px", marginBottom: "8px", alignItems: "baseline" }}>
        <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#1A2B4A", lineHeight: 1.4, fontFamily: branding.fontFamily + ", Inter, sans-serif", flex: 1 }}>
          {q.label}
        </div>
        {q.required && (
          <span style={{ color: "#DC2626", fontSize: "14px", flexShrink: 0 }}>*</span>
        )}
      </div>

      {q.type === "rating" && (
        <div>
          <StarRating max={q.maxRating ?? 5} value={ratingVal} onChange={(v) => { setRatingVal(v); onAnswerChange(q.id, v); }} />
          {(q.lowLabel || q.highLabel) && (
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
              <span style={{ fontSize: "10.5px", color: "#9CA3AF" }}>{q.lowLabel}</span>
              <span style={{ fontSize: "10.5px", color: "#9CA3AF" }}>{q.highLabel}</span>
            </div>
          )}
        </div>
      )}

      {q.type === "nps" && (
        <NPSRow value={npsVal} onChange={(v) => { setNpsVal(v); onAnswerChange(q.id, v); }} />
      )}

      {q.type === "text" && (
        <input type="text" value={textVal} onChange={e => setTextVal(e.target.value)}
          placeholder={q.placeholder ?? "Your answer…"} style={iStyle}
          onFocus={e => (e.currentTarget.style.borderColor = branding.primaryColor)}
          onBlur={e => (e.currentTarget.style.borderColor = "#E4DDD4")}
        />
      )}

      {q.type === "textarea" && (
        <textarea value={textVal} onChange={e => setTextVal(e.target.value)} rows={3}
          placeholder={q.placeholder ?? "Your answer…"} style={iStyle}
          onFocus={e => (e.currentTarget.style.borderColor = branding.primaryColor)}
          onBlur={e => (e.currentTarget.style.borderColor = "#E4DDD4")}
        />
      )}

      {q.type === "select" && (
        <select value={selectVal[0] ?? ""} onChange={e => setSelectVal([e.target.value])}
          style={{ ...iStyle, cursor: "pointer" }}>
          <option value="">Choose an option…</option>
          {(q.options ?? []).map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
      )}

      {q.type === "multiselect" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {(q.options ?? []).map(o => {
            const checked = selectVal.includes(o.id);
            return (
              <label key={o.id} onClick={() => setSelectVal(prev => checked ? prev.filter(v => v !== o.id) : [...prev, o.id])}
                style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "9px 12px",
                  borderRadius: "9px", border: `1.5px solid ${checked ? branding.primaryColor + "60" : "#E4DDD4"}`,
                  background: checked ? branding.primaryColor + "0A" : "#FAFAFA",
                  transition: "all 150ms",
                }}>
                <div style={{ width: "18px", height: "18px", borderRadius: "5px", flexShrink: 0,
                  border: `2px solid ${checked ? branding.primaryColor : "#D1D5DB"}`,
                  background: checked ? branding.primaryColor : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 150ms",
                }}>
                  {checked && <div style={{ width: "6px", height: "6px", borderRadius: "2px", background: "#FFFFFF" }} />}
                </div>
                <span style={{ fontSize: "13px", color: "#374151" }}>{o.label}</span>
              </label>
            );
          })}
        </div>
      )}

      {q.type === "yesno" && (
        <div style={{ display: "flex", gap: "8px" }}>
          {(["Yes", "No"] as const).map(opt => {
            const val = opt.toLowerCase() as "yes" | "no";
            const active = yesno === val;
            return (
              <button key={opt} onClick={() => setYesno(val)} style={{
                flex: 1, padding: "10px", borderRadius: "10px", border: "none", cursor: "pointer",
                background: active ? branding.primaryColor : "#F3F4F6",
                color: active ? "#FFFFFF" : "#374151",
                fontSize: "14px", fontWeight: 600,
                transition: "all 150ms",
                boxShadow: active ? `0 2px 8px ${branding.primaryColor}40` : "none",
              }}>
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {q.type === "date" && (
        <input type="date" style={{ ...iStyle, cursor: "pointer" }} />
      )}

      {q.type === "email" && (
        <input type="email" placeholder="name@email.com" style={iStyle}
          onFocus={e => (e.currentTarget.style.borderColor = branding.primaryColor)}
          onBlur={e => (e.currentTarget.style.borderColor = "#E4DDD4")}
        />
      )}

      {q.type === "phone" && (
        <input type="tel" placeholder="+91 98765 43210" style={iStyle}
          onFocus={e => (e.currentTarget.style.borderColor = branding.primaryColor)}
          onBlur={e => (e.currentTarget.style.borderColor = "#E4DDD4")}
        />
      )}
    </div>
  );
}

export default function LivePreview({ form }: Props) {
  const [previewPage, setPreviewPage] = useState<"form" | "thankyou">("form");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [triggeredActions, setTriggeredActions] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState<string | null>(null);

  const { settings, branding } = form;

  function handleAnswerChange(id: string, val: number) {
    setAnswers(prev => ({ ...prev, [id]: val }));
  }

  function handleSubmit() {
    const actions = new Set<string>();
    let cMsg = null;
    
    if (form.routing.enabled) {
      for (const rule of form.routing.rules) {
        const val = answers[rule.questionId];
        if (typeof val === "number") {
          let matches = false;
          if (rule.condition === "gte" && val >= rule.value) matches = true;
          if (rule.condition === "lte" && val <= rule.value) matches = true;
          if (rule.condition === "eq" && val === rule.value) matches = true;
          if (rule.condition === "between" && rule.value2 !== undefined && val >= rule.value && val <= rule.value2) matches = true;

          if (matches) {
            actions.add(rule.action);
            if (rule.action === "custom_message" && rule.customMessage) {
              cMsg = rule.customMessage;
            }
          }
        }
      }
    }
    
    setTriggeredActions(Array.from(actions));
    setCustomMessage(cMsg);
    setPreviewPage("thankyou");
  }

  return (
    <div>
      {/* Preview label */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <div style={{ fontSize: "11.5px", fontWeight: 600, color: "rgba(0,0,0,0.4)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Live Preview
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          {(["form", "thankyou"] as const).map(p => (
            <button key={p} onClick={() => setPreviewPage(p)} style={{
              padding: "4px 10px", borderRadius: "20px", border: "none", cursor: "pointer",
              background: previewPage === p ? "rgba(5,150,105,0.2)" : "transparent",
              color: previewPage === p ? "#059669" : "rgba(0,0,0,0.4)",
              fontSize: "11px", fontWeight: 600,
              transition: "all 150ms",
            }}>
              {p === "form" ? "Form" : "Thank You"}
            </button>
          ))}
        </div>
      </div>

      {/* Phone frame */}
      <div style={{
        width: "100%",
        background: "#1a1a1a",
        borderRadius: "44px",
        padding: "12px",
        boxShadow: "0 24px 80px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.08)",
      }}>
        {/* Notch bar */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
          <div style={{ width: "80px", height: "24px", borderRadius: "12px", background: "#2a2a2a", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3a3a3a" }} />
            <div style={{ width: "32px", height: "8px", borderRadius: "4px", background: "#3a3a3a" }} />
          </div>
        </div>

        {/* Screen */}
        <div style={{
          borderRadius: "32px",
          overflow: "hidden",
          background: branding.bgColor,
          height: "640px",
          overflowY: "auto",
          position: "relative",
        }}>
          {previewPage === "form" ? (
            <>
              {/* Form header */}
              <div style={{
                background: `linear-gradient(160deg, ${branding.primaryColor} 0%, ${branding.primaryColor}dd 100%)`,
                padding: "20px 18px 16px",
              }}>
                {branding.logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={branding.logoUrl} alt="Logo" style={{ height: "32px", marginBottom: "10px", objectFit: "contain" }} />
                )}
                {!branding.logoUrl && (
                  <div style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: branding.accentColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Star size={13} color={branding.primaryColor} fill={branding.primaryColor} />
                    </div>
                    <span style={{ fontSize: "12.5px", fontWeight: 700, color: branding.accentColor, fontFamily: branding.fontFamily + ", Inter, sans-serif" }}>
                      {branding.headerText}
                    </span>
                  </div>
                )}
                <h1 style={{ fontSize: "17px", fontWeight: 800, color: "#FFFFFF", margin: 0, lineHeight: 1.3, fontFamily: branding.fontFamily + ", Inter, sans-serif" }}>
                  {settings.title}
                </h1>
                {settings.description && (
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", margin: "6px 0 0", lineHeight: 1.5 }}>
                    {settings.description}
                  </p>
                )}
                {branding.showPropertyName && (
                  <div style={{ marginTop: "8px", display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 9px", borderRadius: "20px", background: "rgba(5,150,105,0.2)", border: "1px solid rgba(5,150,105,0.3)" }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: branding.accentColor, flexShrink: 0 }} />
                    <span style={{ fontSize: "10.5px", fontWeight: 600, color: branding.accentColor }}>{settings.propertyName}</span>
                  </div>
                )}
              </div>

              {/* Guest info fields */}
              {(settings.collectGuestName || settings.collectGuestEmail || settings.collectGuestPhone || settings.collectRoomNumber) && (
                <div style={{ padding: "16px 16px 0" }}>
                  <div style={{
                    background: "#FFFFFF", borderRadius: "12px",
                    border: "1px solid #E4DDD4",
                    padding: "14px",
                    marginBottom: "4px",
                  }}>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
                      Guest Details
                    </div>
                    {settings.collectGuestName && (
                      <div style={{ marginBottom: "8px" }}>
                        <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: "4px" }}>Full Name</div>
                        <div style={{ padding: "8px 10px", borderRadius: "8px", border: "1.5px solid #E4DDD4", fontSize: "12px", color: "#9CA3AF", background: "#FAFAFA" }}>Your name…</div>
                      </div>
                    )}
                    {settings.collectGuestEmail && (
                      <div style={{ marginBottom: "8px" }}>
                        <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: "4px" }}>Email</div>
                        <div style={{ padding: "8px 10px", borderRadius: "8px", border: "1.5px solid #E4DDD4", fontSize: "12px", color: "#9CA3AF", background: "#FAFAFA" }}>name@email.com…</div>
                      </div>
                    )}
                    {settings.collectGuestPhone && (
                      <div style={{ marginBottom: "8px" }}>
                        <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: "4px" }}>Phone</div>
                        <div style={{ padding: "8px 10px", borderRadius: "8px", border: "1.5px solid #E4DDD4", fontSize: "12px", color: "#9CA3AF", background: "#FAFAFA" }}>+91 98765 43210</div>
                      </div>
                    )}
                    {settings.collectRoomNumber && (
                      <div>
                        <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: "4px" }}>Room Number</div>
                        <div style={{ padding: "8px 10px", borderRadius: "8px", border: "1.5px solid #E4DDD4", fontSize: "12px", color: "#9CA3AF", background: "#FAFAFA" }}>e.g. 204…</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Questions */}
              <div style={{ padding: "12px 16px 16px" }}>
                {form.questions.length === 0 ? (
                  <div style={{ padding: "28px 0", textAlign: "center" }}>
                    <div style={{ fontSize: "24px", marginBottom: "8px" }}>📋</div>
                    <div style={{ fontSize: "12px", color: "#9CA3AF" }}>Add questions to see preview</div>
                  </div>
                ) : (
                  <div style={{ background: "#FFFFFF", borderRadius: "12px", border: "1px solid #E4DDD4", padding: "16px" }}>
                    {form.questions.map(q => (
                      <QuestionPreview key={q.id} q={q} branding={branding} onAnswerChange={handleAnswerChange} />
                    ))}
                  </div>
                )}

                {form.questions.length > 0 && (
                  <button
                    onClick={handleSubmit}
                    style={{
                      width: "100%", marginTop: "14px", padding: "14px",
                      borderRadius: "12px", border: "none", cursor: "pointer",
                      background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.primaryColor}cc 100%)`,
                      color: branding.accentColor, fontSize: "14px", fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                      boxShadow: `0 4px 16px ${branding.primaryColor}50`,
                      transition: "opacity 150ms",
                      fontFamily: branding.fontFamily + ", Inter, sans-serif",
                    }}
                  >
                    Submit Feedback
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </>
          ) : (
            /* Thank you page */
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              height: "100%", padding: "32px 24px", textAlign: "center",
            }}>
              <div style={{
                width: "72px", height: "72px", borderRadius: "50%",
                background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.primaryColor}aa 100%)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "20px",
                boxShadow: `0 8px 32px ${branding.primaryColor}50`,
              }}>
                <CheckCircle size={32} color={branding.accentColor} strokeWidth={2} />
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1A2B4A", margin: "0 0 10px", fontFamily: branding.fontFamily + ", Inter, sans-serif", lineHeight: 1.3 }}>
                {branding.thankYouTitle}
              </h2>
              <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.6, margin: "0 0 28px" }}>
                {branding.thankYouMessage}
              </p>

              {customMessage && (
                <div style={{
                  background: "#EFF6FF", border: "1px solid #BFDBFE",
                  borderRadius: "12px", padding: "14px 16px", width: "100%", marginBottom: "16px"
                }}>
                  <p style={{ fontSize: "12.5px", color: "#1D4ED8", margin: 0, fontWeight: 500 }}>
                    {customMessage}
                  </p>
                </div>
              )}

              {form.routing.enabled && form.routing.reviewLink && triggeredActions.includes("show_review_link") && (
                <div style={{
                  background: "#ECFDF5", border: "1px solid #A7F3D0",
                  borderRadius: "12px", padding: "14px 16px", width: "100%",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "8px" }}>
                    <Star size={14} color="#059669" fill="#059669" />
                    <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#065F46" }}>Love your experience?</span>
                  </div>
                  <p style={{ fontSize: "11.5px", color: "#059669", margin: "0 0 10px" }}>
                    Share your thoughts on Google — it helps other travellers find us!
                  </p>
                  <button style={{
                    width: "100%", padding: "9px", borderRadius: "9px", border: "none",
                    background: "#059669", color: "#FFFFFF",
                    fontSize: "12.5px", fontWeight: 700, cursor: "pointer",
                  }}>
                    Write a Google Review ★
                  </button>
                </div>
              )}

              <button
                onClick={() => setPreviewPage("form")}
                style={{
                  marginTop: "16px", padding: "10px 20px", borderRadius: "10px", border: "none",
                  background: "#F3F4F6", color: "#6B7280",
                  fontSize: "12.5px", fontWeight: 600, cursor: "pointer",
                }}
              >
                ← Back to form
              </button>
            </div>
          )}
        </div>

        {/* Home indicator */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: "8px" }}>
          <div style={{ width: "100px", height: "4px", borderRadius: "2px", background: "#3a3a3a" }} />
        </div>
      </div>

      {/* Preview footer note */}
      <div style={{ textAlign: "center", marginTop: "10px" }}>
        <span style={{ fontSize: "10.5px", color: "rgba(0,0,0,0.4)" }}>
          Interactive preview · Changes reflect in real time
        </span>
      </div>
    </div>
  );
}
