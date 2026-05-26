"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import type { FormConfig, Question, RoutingRule } from "@/lib/formBuilderTypes";
import { Star, CheckCircle, ChevronRight, AlertCircle } from "lucide-react";

// Star rating interactive helper matching LivePreview
function StarRating({ max = 5, value, onChange }: { max?: number; value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: "4px" }}>
      {Array.from({ length: max }, (_, i) => i + 1).map(i => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
          style={{
            background: "none", border: "none", cursor: "pointer", padding: "2px",
            color: i <= (hover || value) ? "#C9A96E" : "#D1D5DB",
            transition: "color 100ms, transform 100ms",
            transform: i === (hover || value) ? "scale(1.15)" : "scale(1)",
          }}
        >
          <Star size={24} fill={i <= (hover || value) ? "#C9A96E" : "none"} strokeWidth={1.8} />
        </button>
      ))}
    </div>
  );
}

// NPS pills matching LivePreview
function NPSRow({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <div style={{ display: "flex", gap: "3px" }}>
        {Array.from({ length: 11 }, (_, i) => i).map(i => (
          <button 
            key={i} 
            type="button"
            onClick={() => onChange(i)} 
            style={{
              flex: 1, padding: "7px 0", borderRadius: "6px", border: "none", cursor: "pointer",
              background: value === i ? "#1B4332" : "#F3F4F6",
              color: value === i ? "#C9A96E" : "#6B7280",
              fontSize: "11px", fontWeight: 700,
              transition: "background 150ms",
            }}
          >
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

export default function GuestFormPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [form, setForm] = useState<FormConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // Form responses state
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Submission state
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [triggeredActions, setTriggeredActions] = useState<any[]>([]);

  // Formatted Review Link helper to prevent relative redirect issues
  const formattedReviewLink = useMemo(() => {
    let link = form?.routing.reviewLink;
    if (!link) return "";
    link = link.trim();
    if (!/^https?:\/\//i.test(link)) {
      return `https://${link}`;
    }
    return link;
  }, [form?.routing.reviewLink]);

  // Fetch form details
  useEffect(() => {
    if (!slug) return;

    async function loadForm() {
      try {
        setLoading(true);
        const res = await fetch(`/api/forms?slug=${slug}`);
        if (!res.ok) {
          setForm(null);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setForm(data);
      } catch (err: any) {
        console.error("Failed to load form config:", err);
        setForm(null);
      } finally {
        setLoading(false);
      }
    }

    loadForm();
  }, [slug]);

  // Handle answers input change
  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    if (validationErrors[questionId]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[questionId];
        return updated;
      });
    }
  };

  // Evaluate routing rules
  const evaluateRoutingRules = (currentForm: FormConfig, currentAnswers: Record<string, any>) => {
    if (!currentForm.routing || !currentForm.routing.enabled) return [];

    const actions: any[] = [];
    currentForm.routing.rules.forEach((rule: RoutingRule) => {
      const ansVal = currentAnswers[rule.questionId];
      if (ansVal === undefined || ansVal === null) return;

      const numericVal = Number(ansVal);
      let isTriggered = false;

      switch (rule.condition) {
        case "gte":
          isTriggered = numericVal >= rule.value;
          break;
        case "lte":
          isTriggered = numericVal <= rule.value;
          break;
        case "eq":
          isTriggered = numericVal === rule.value;
          break;
        case "between":
          const maxVal = rule.value2 ?? 10;
          isTriggered = numericVal >= rule.value && numericVal <= maxVal;
          break;
      }

      if (isTriggered) {
        actions.push({
          action: rule.action,
          triggered: true,
          reason: `Evaluated Rule for ${rule.questionId}: ${ansVal} matching condition ${rule.condition} (${rule.value}${rule.value2 ? ` and ${rule.value2}` : ""})`,
        });
      }
    });

    return actions;
  };

  // Validate form submission
  const validateForm = (): boolean => {
    if (!form) return false;
    const errors: Record<string, string> = {};

    if (guestEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
      errors["guestEmail"] = "Please enter a valid email address";
    }

    form.questions.forEach((q: Question) => {
      const val = answers[q.id];
      const isEmpty = val === undefined || val === null || (typeof val === "string" && val.trim() === "") || (Array.isArray(val) && val.length === 0);

      if (q.required && isEmpty) {
        errors[q.id] = "This question is required";
      }
    });

    setValidationErrors(errors);
    
    // Scroll to the first error if present
    const firstErrKey = Object.keys(errors)[0];
    if (firstErrKey) {
      const el = document.getElementById(`q-container-${firstErrKey}`) || document.getElementById(firstErrKey);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || submitting) return;

    if (!validateForm()) return;

    setSubmitting(true);

    // Evaluate rules
    const triggered = evaluateRoutingRules(form, answers);
    setTriggeredActions(triggered);

    // Assemble payload
    const submissionPayload = {
      formId: form.id,
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim(),
      roomNumber: roomNumber.trim(),
      answers: form.questions.map(q => ({
        questionId: q.id,
        questionLabel: q.label,
        questionType: q.type,
        value: answers[q.id] ?? "",
      })),
      routingActions: triggered,
    };

    try {
      const response = await fetch("/api/forms/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionPayload),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      alert("Submission encountered an issue. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f2a20",
        fontFamily: "sans-serif"
      }}>
        <div style={{
          width: "40px", height: "40px",
          borderRadius: "50%",
          border: "3px solid #C9A96E",
          borderTopColor: "transparent",
          animation: "spin 1s linear infinite",
          marginBottom: "16px"
        }} />
        <div style={{ color: "#C9A96E", fontSize: "14px", fontWeight: 600 }}>Loading feedback form…</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!form) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f2a20",
        color: "#fff",
        padding: "24px"
      }}>
        <AlertCircle size={40} color="#EF4444" style={{ marginBottom: "12px" }} />
        <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Form Unavailable</h2>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px" }}>This form could not be loaded or is inactive.</p>
      </div>
    );
  }

  const { branding, settings } = form;
  const primColor = branding.primaryColor || "#1B4332";
  const accColor = branding.accentColor || "#C9A96E";
  const professionalFont =
    "\"Aptos\", \"Segoe UI Variable Text\", \"Segoe UI\", \"Helvetica Neue\", Arial, sans-serif";
  const fontFam =
    branding.fontFamily === "Aptos"
      ? "\"Aptos\", \"Segoe UI Variable Text\", \"Segoe UI\", sans-serif"
      : branding.fontFamily === "Segoe UI"
      ? "\"Segoe UI Variable Text\", \"Segoe UI\", sans-serif"
      : branding.fontFamily === "Helvetica Neue"
      ? "\"Helvetica Neue\", Arial, sans-serif"
      : professionalFont;

  // Check if a specific routing action is triggered
  const hasAction = (actionName: string) => triggeredActions.some(a => a.action === actionName);

  // General styled inputs matching LivePreview style variables
  const iStyle: React.CSSProperties = {
    width: "100%", padding: "10px 13px",
    background: "#FFFFFF", border: "1.5px solid #E4DDD4",
    borderRadius: "10px", fontSize: "13px", color: "#1A2B4A",
    fontFamily: fontFam,
    outline: "none", resize: "vertical" as const, boxSizing: "border-box" as const,
    lineHeight: 1.5,
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: branding.bgColor || "#FAF8F5",
      fontFamily: fontFam,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      boxSizing: "border-box",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "480px",
        minHeight: "100vh",
        background: branding.bgColor || "#FAF8F5",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        boxSizing: "border-box",
        boxShadow: "0 0 40px rgba(0,0,0,0.03)",
      }}>
        {/* ── Submission Thank You Panel ── */}
        {submitted ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            flex: 1, padding: "48px 24px", textAlign: "center",
            boxSizing: "border-box",
          }}>
            <div style={{
              width: "72px", height: "72px", borderRadius: "50%",
              background: `linear-gradient(135deg, ${primColor} 0%, ${primColor}aa 100%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: "20px",
              boxShadow: `0 8px 32px ${primColor}50`,
            }}>
              <CheckCircle size={32} color={accColor} strokeWidth={2} />
            </div>
            
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1A2B4A", margin: "0 0 10px", lineHeight: 1.3 }}>
              {branding.thankYouTitle}
            </h2>
            <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.6, margin: "0 0 28px" }}>
              {branding.thankYouMessage}
            </p>

            {/* Smart Review redirect (Promoters star rating >= 4 redirect) */}
            {hasAction("show_review_link") && formattedReviewLink && (
              <div style={{
                background: "#ECFDF5", border: "1px solid #A7F3D0",
                borderRadius: "12px", padding: "14px 16px", width: "100%",
                textAlign: "left", boxSizing: "border-box", marginBottom: "16px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "8px" }}>
                  <Star size={14} color="#059669" fill="#059669" />
                  <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#065F46" }}>Love your experience?</span>
                </div>
                <p style={{ fontSize: "11.5px", color: "#059669", margin: "0 0 10px", lineHeight: 1.4 }}>
                  Share your thoughts on Google — it helps other travellers find us!
                </p>
                <a href={formattedReviewLink} target="_blank" rel="noopener noreferrer" style={{
                  display: "block", width: "100%", padding: "9px", borderRadius: "9px", border: "none",
                  background: "#059669", color: "#FFFFFF", textAlign: "center", textDecoration: "none",
                  fontSize: "12.5px", fontWeight: 700, cursor: "pointer", boxSizing: "border-box"
                }}>
                  Write a Google Review ★
                </a>
              </div>
            )}

            {/* Escalation alert info (detractor alerts) */}
            {(hasAction("alert_gm") || hasAction("alert_md") || hasAction("alert_gm_md")) && (
              <div style={{
                background: "#FFFBEB", border: "1px solid #F59E0B50",
                borderRadius: "12px", padding: "14px 16px", width: "100%",
                textAlign: "left", boxSizing: "border-box",
              }}>
                <h5 style={{ fontSize: "12.5px", fontWeight: 700, color: "#B45309", margin: "0 0 4px" }}>
                  🛎️ Care Escalation Raised
                </h5>
                <p style={{ fontSize: "11.5px", color: "#78350F", lineHeight: 1.5, margin: 0 }}>
                  We sincerely apologize that some aspects did not meet your expectations. Our General Manager has been notified directly, and we are working to address your comments immediately.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* ── Core Guest Form filling page ── */
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            
            {/* Form Header (Matches LivePreview exactly) */}
            <div style={{
              background: `linear-gradient(160deg, ${primColor} 0%, ${primColor}dd 100%)`,
              padding: "24px 18px 20px",
            }}>
              {branding.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={branding.logoUrl} alt="Logo" style={{ height: "36px", marginBottom: "10px", objectFit: "contain" }} />
              )}
              {!branding.logoUrl && (
                <div style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: accColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Star size={13} color={primColor} fill={primColor} />
                  </div>
                  <span style={{ fontSize: "12.5px", fontWeight: 700, color: accColor }}>
                    {branding.headerText}
                  </span>
                </div>
              )}
              <h1 style={{ fontSize: "18px", fontWeight: 800, color: "#FFFFFF", margin: 0, lineHeight: 1.3 }}>
                {settings.title}
              </h1>
              {settings.description && (
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", margin: "6px 0 0", lineHeight: 1.5 }}>
                  {settings.description}
                </p>
              )}
              {branding.showPropertyName && (
                <div style={{ marginTop: "8px", display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 9px", borderRadius: "20px", background: "rgba(201,169,110,0.2)", border: "1px solid rgba(201,169,110,0.3)" }}>
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: accColor, flexShrink: 0 }} />
                  <span style={{ fontSize: "10.5px", fontWeight: 600, color: accColor }}>{settings.propertyName}</span>
                </div>
              )}
            </div>

            {/* Guest info card (Matches LivePreview exactly) */}
            {(settings.collectGuestName || settings.collectGuestEmail || settings.collectRoomNumber) && (
              <div style={{ padding: "16px 16px 0" }}>
                <div style={{
                  background: "#FFFFFF", borderRadius: "12px",
                  border: "1px solid #E4DDD4",
                  padding: "14px",
                  marginBottom: "4px",
                }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
                    Guest Details
                  </div>
                  {settings.collectGuestName && (
                    <div style={{ marginBottom: "12px" }}>
                      <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: "4px" }}>Full Name</div>
                      <input 
                        type="text" 
                        placeholder="Your name…"
                        value={guestName}
                        onChange={e => setGuestName(e.target.value)}
                        style={iStyle}
                        onFocus={e => (e.currentTarget.style.borderColor = primColor)}
                        onBlur={e => (e.currentTarget.style.borderColor = "#E4DDD4")}
                      />
                    </div>
                  )}
                  {settings.collectGuestEmail && (
                    <div style={{ marginBottom: "12px" }}>
                      <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: "4px" }}>Email</div>
                      <input 
                        type="email" 
                        placeholder="name@email.com"
                        value={guestEmail}
                        onChange={e => setGuestEmail(e.target.value)}
                        style={{
                          ...iStyle,
                          borderColor: validationErrors["guestEmail"] ? "#EF4444" : "#E4DDD4"
                        }}
                        onFocus={e => (e.currentTarget.style.borderColor = primColor)}
                        onBlur={e => (e.currentTarget.style.borderColor = validationErrors["guestEmail"] ? "#EF4444" : "#E4DDD4")}
                      />
                      {validationErrors["guestEmail"] && (
                        <div style={{ color: "#EF4444", fontSize: "10.5px", marginTop: "3px" }}>{validationErrors["guestEmail"]}</div>
                      )}
                    </div>
                  )}
                  {settings.collectRoomNumber && (
                    <div>
                      <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: "4px" }}>Room Number</div>
                      <input 
                        type="text" 
                        placeholder="e.g. 204…"
                        value={roomNumber}
                        onChange={e => setRoomNumber(e.target.value)}
                        style={iStyle}
                        onFocus={e => (e.currentTarget.style.borderColor = primColor)}
                        onBlur={e => (e.currentTarget.style.borderColor = "#E4DDD4")}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Questions container (Matches LivePreview exactly) */}
            <div style={{ padding: "12px 16px 16px" }}>
              <div style={{ background: "#FFFFFF", borderRadius: "12px", border: "1px solid #E4DDD4", padding: "16px" }}>
                {form.questions.map((q: Question, i: number) => {
                  const errorMsg = validationErrors[q.id];
                  const answer = answers[q.id];

                  return (
                    <div key={q.id} id={`q-container-${q.id}`} style={{ marginBottom: "20px" }}>
                      
                      {/* Question Label */}
                      <div style={{ display: "flex", gap: "4px", marginBottom: "8px", alignItems: "baseline" }}>
                        <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#1A2B4A", lineHeight: 1.4, flex: 1 }}>
                          {q.label}
                        </div>
                        {q.required && (
                          <span style={{ color: "#DC2626", fontSize: "14px", flexShrink: 0 }}>*</span>
                        )}
                      </div>

                      {/* ── QUESTION TYPE: RATING (1-5 Stars) ── */}
                      {q.type === "rating" && (
                        <div>
                          <StarRating 
                            max={q.maxRating ?? 5} 
                            value={answer ?? 0} 
                            onChange={v => handleAnswerChange(q.id, v)} 
                          />
                          {(q.lowLabel || q.highLabel) && (
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", width: "200px" }}>
                              <span style={{ fontSize: "10.5px", color: "#9CA3AF" }}>{q.lowLabel}</span>
                              <span style={{ fontSize: "10.5px", color: "#9CA3AF" }}>{q.highLabel}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ── QUESTION TYPE: NPS (0-10 pills) ── */}
                      {q.type === "nps" && (
                        <NPSRow 
                          value={answer ?? -1} 
                          onChange={v => handleAnswerChange(q.id, v)} 
                        />
                      )}

                      {/* ── QUESTION TYPE: SHORT TEXT ── */}
                      {q.type === "text" && (
                        <input 
                          type="text" 
                          value={answer ?? ""} 
                          onChange={e => handleAnswerChange(q.id, e.target.value)}
                          placeholder={q.placeholder ?? "Your answer…"} 
                          style={iStyle}
                          onFocus={e => (e.currentTarget.style.borderColor = primColor)}
                          onBlur={e => (e.currentTarget.style.borderColor = "#E4DDD4")}
                        />
                      )}

                      {/* ── QUESTION TYPE: LONG TEXT / TEXTAREA ── */}
                      {q.type === "textarea" && (
                        <textarea 
                          value={answer ?? ""} 
                          onChange={e => handleAnswerChange(q.id, e.target.value)} 
                          rows={3}
                          placeholder={q.placeholder ?? "Your answer…"} 
                          style={iStyle}
                          onFocus={e => (e.currentTarget.style.borderColor = primColor)}
                          onBlur={e => (e.currentTarget.style.borderColor = "#E4DDD4")}
                        />
                      )}

                      {/* ── QUESTION TYPE: DROPDOWN SELECT ── */}
                      {q.type === "select" && (
                        <select 
                          value={answer ?? ""} 
                          onChange={e => handleAnswerChange(q.id, e.target.value)}
                          style={{ ...iStyle, cursor: "pointer" }}
                        >
                          <option value="">Choose an option…</option>
                          {(q.options ?? []).map(o => (
                            <option key={o.id} value={o.label}>{o.label}</option>
                          ))}
                        </select>
                      )}

                      {/* ── QUESTION TYPE: MULTISELECT CHECKBOXES ── */}
                      {q.type === "multiselect" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          {(q.options ?? []).map(o => {
                            const list = (answer as string[]) || [];
                            const checked = list.includes(o.label);
                            return (
                              <div 
                                key={o.id} 
                                onClick={() => {
                                  let updated: string[];
                                  if (checked) {
                                    updated = list.filter(v => v !== o.label);
                                  } else {
                                    updated = [...list, o.label];
                                  }
                                  handleAnswerChange(q.id, updated);
                                }}
                                style={{ 
                                  display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "9px 12px",
                                  borderRadius: "9px", border: `1.5px solid ${checked ? primColor + "60" : "#E4DDD4"}`,
                                  background: checked ? primColor + "0A" : "#FAFAFA",
                                  transition: "all 150ms",
                                }}
                              >
                                <div style={{ 
                                  width: "18px", height: "18px", borderRadius: "5px", flexShrink: 0,
                                  border: `2px solid ${checked ? primColor : "#D1D5DB"}`,
                                  background: checked ? primColor : "transparent",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  transition: "all 150ms",
                                }}>
                                  {checked && <div style={{ width: "6px", height: "6px", borderRadius: "2px", background: "#FFFFFF" }} />}
                                </div>
                                <span style={{ fontSize: "13px", color: "#374151" }}>{o.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* ── QUESTION TYPE: YES/NO BUTTONS ── */}
                      {q.type === "yesno" && (
                        <div style={{ display: "flex", gap: "8px" }}>
                          {["Yes", "No"].map(opt => {
                            const active = answer === opt;
                            return (
                              <button 
                                key={opt} 
                                type="button"
                                onClick={() => handleAnswerChange(q.id, opt)} 
                                style={{
                                  flex: 1, padding: "10px", borderRadius: "10px", border: "none", cursor: "pointer",
                                  background: active ? primColor : "#F3F4F6",
                                  color: active ? "#FFFFFF" : "#374151",
                                  fontSize: "14px", fontWeight: 600,
                                  transition: "all 150ms",
                                  boxShadow: active ? `0 2px 8px ${primColor}40` : "none",
                                }}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* ── QUESTION TYPE: DATE ── */}
                      {q.type === "date" && (
                        <input 
                          type="date" 
                          value={answer ?? ""}
                          onChange={e => handleAnswerChange(q.id, e.target.value)}
                          style={{ ...iStyle, cursor: "pointer" }} 
                          onFocus={e => (e.currentTarget.style.borderColor = primColor)}
                          onBlur={e => (e.currentTarget.style.borderColor = "#E4DDD4")}
                        />
                      )}

                      {/* ── QUESTION TYPE: EMAIL ── */}
                      {q.type === "email" && (
                        <input 
                          type="email" 
                          placeholder="name@email.com" 
                          value={answer ?? ""}
                          onChange={e => handleAnswerChange(q.id, e.target.value)}
                          style={iStyle}
                          onFocus={e => (e.currentTarget.style.borderColor = primColor)}
                          onBlur={e => (e.currentTarget.style.borderColor = "#E4DDD4")}
                        />
                      )}

                      {/* ── QUESTION TYPE: PHONE ── */}
                      {q.type === "phone" && (
                        <input 
                          type="tel" 
                          placeholder="+91 98765 43210" 
                          value={answer ?? ""}
                          onChange={e => handleAnswerChange(q.id, e.target.value)}
                          style={iStyle}
                          onFocus={e => (e.currentTarget.style.borderColor = primColor)}
                          onBlur={e => (e.currentTarget.style.borderColor = "#E4DDD4")}
                        />
                      )}

                      {/* Error message */}
                      {errorMsg && (
                        <div style={{ color: "#EF4444", fontSize: "11px", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                          <span style={{ fontSize: "12px" }}>⚠️</span>
                          {errorMsg}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>

              {/* Submit Button */}
              {form.questions.length > 0 && (
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: "100%", marginTop: "14px", padding: "14px",
                    borderRadius: "12px", border: "none", cursor: submitting ? "not-allowed" : "pointer",
                    background: submitting ? "rgba(0,0,0,0.15)" : `linear-gradient(135deg, ${primColor} 0%, ${primColor}cc 100%)`,
                    color: accColor, fontSize: "14px", fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                    boxShadow: `0 4px 16px ${primColor}50`,
                    transition: "opacity 150ms",
                    fontFamily: fontFam,
                  }}
                >
                  {submitting ? "Submitting…" : "Submit Feedback"}
                  {!submitting && <ChevronRight size={16} />}
                </button>
              )}
            </div>

          </form>
        )}
      </div>
    </div>
  );
}
