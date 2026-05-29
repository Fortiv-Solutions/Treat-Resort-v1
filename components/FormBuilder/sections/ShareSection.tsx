"use client";

import { useState, useSyncExternalStore } from "react";
import type { FormConfig, Toast } from "@/lib/formBuilderTypes";
import { Copy, Check, ExternalLink, QrCode, Code2 } from "lucide-react";

interface Props {
  form: FormConfig;
  updateForm?: (updater: (prev: FormConfig) => FormConfig) => void;
  addToast: (msg: string, type?: Toast["type"]) => void;
}

const subscribeToOrigin = () => () => {};
const getClientOrigin = () => window.location.origin;
const getServerOrigin = () => "";

export default function ShareSection({ form, updateForm, addToast }: Props) {
  const [copied, setCopied] = useState<"link" | "embed" | null>(null);
  const origin = useSyncExternalStore(subscribeToOrigin, getClientOrigin, getServerOrigin);

  const slug = form.slug ?? "";
  const hasSavedLink = Boolean(slug && form.id !== "new");
  const formPath = `/forms/${slug || "save-form-first"}`;
  const formLink = origin ? `${origin}${formPath}` : formPath;

  const embedCode = `<iframe src="${formLink}" width="100%" height="600" style="border:none;border-radius:16px;" title="Feedback Form"></iframe>`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(formLink)}&bgcolor=FAF8F5&color=1B4332`;

  function copyText(text: string, field: "link" | "embed") {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(field);
      setTimeout(() => setCopied(null), 1800);
      addToast(field === "link" ? "Form link copied!" : "Embed code copied!", "success");
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* Form link */}
      <div>
        <div style={{ fontSize: "10.5px", fontWeight: 600, color: "rgba(0,0,0,0.5)", marginBottom: "7px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
          Form Link
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <div style={{
            flex: 1, padding: "9px 12px",
            background: "#ffffff",
            border: "1.5px solid rgba(0,0,0,0.1)",
            borderRadius: "9px", fontSize: "12px",
            color: "#111827",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {hasSavedLink ? formLink : "Save the form to generate a working link"}
          </div>
          <button disabled={!hasSavedLink} onClick={() => copyText(formLink, "link")} style={{
            padding: "9px 14px", borderRadius: "9px", flexShrink: 0,
            background: copied === "link" ? "rgba(5,150,105,0.15)" : "rgba(0,0,0,0.02)",
            border: `1.5px solid ${copied === "link" ? "rgba(5,150,105,0.2)" : "rgba(0,0,0,0.1)"}`,
            color: copied === "link" ? "#059669" : "#064e3b",
            cursor: hasSavedLink ? "pointer" : "not-allowed", display: "flex", alignItems: "center", gap: "6px",
            fontSize: "12px", fontWeight: 600, transition: "all 150ms",
            opacity: hasSavedLink ? 1 : 0.55,
          }}>
            {copied === "link" ? <Check size={13} /> : <Copy size={13} />}
            {copied === "link" ? "Copied!" : "Copy"}
          </button>
        </div>
        <p style={{ fontSize: "10.5px", color: "rgba(0,0,0,0.5)", marginTop: "5px" }}>
          {hasSavedLink ? "Share this link via WhatsApp 30 min after checkout" : "The final public URL is created after the first successful save."}
        </p>
      </div>

      {/* QR Code */}
      <div>
        <div style={{ fontSize: "10.5px", fontWeight: 600, color: "rgba(0,0,0,0.5)", marginBottom: "8px", letterSpacing: "0.04em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
          <QrCode size={12} />
          QR Code
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: "16px",
          padding: "12px 14px", borderRadius: "12px",
          background: "rgba(0,0,0,0.02)",
          border: "1px solid rgba(0,0,0,0.08)",
        }}>
          <div style={{ background: "#FAF8F5", borderRadius: "10px", padding: "8px", flexShrink: 0 }}>
            {hasSavedLink ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrUrl}
              alt="Form QR Code"
              width={90}
              height={90}
              style={{ display: "block", borderRadius: "4px" }}
            />
            ) : (
              <div style={{ width: "90px", height: "90px", display: "grid", placeItems: "center", color: "#1B4332", fontSize: "11px", fontWeight: 700, textAlign: "center" }}>
                Save first
              </div>
            )}
          </div>
          <div>
            <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#111827", marginBottom: "4px" }}>
              Scan to open form
            </div>
            <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.5)", marginBottom: "10px", lineHeight: 1.4 }}>
              Print and display at reception or in rooms for instant access
            </div>
            <a
              href={hasSavedLink ? qrUrl : "#"}
              download={`qr-${slug}.png`}
              style={{
                display: "inline-flex", alignItems: "center", gap: "5px",
                padding: "6px 12px", borderRadius: "8px",
                background: "rgba(0,0,0,0.02)",
                border: "1px solid rgba(0,0,0,0.1)",
                color: "#064e3b", fontSize: "11.5px", fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <ExternalLink size={11} />
              {hasSavedLink ? "Download QR" : "QR Pending"}
            </a>
          </div>
        </div>
      </div>

      {/* Embed code */}
      <div>
        <div style={{ fontSize: "10.5px", fontWeight: 600, color: "rgba(0,0,0,0.5)", marginBottom: "7px", letterSpacing: "0.04em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
          <Code2 size={12} />
          Website Embed
        </div>
        <div style={{ position: "relative" }}>
          <textarea
            readOnly
            value={embedCode}
            rows={3}
            style={{
              width: "100%", padding: "9px 12px",
              background: "#ffffff",
              border: "1.5px solid rgba(0,0,0,0.1)",
              borderRadius: "9px", fontSize: "11px",
              color: "rgba(0,0,0,0.6)",
              fontFamily: "monospace", resize: "none",
              outline: "none", boxSizing: "border-box",
              lineHeight: 1.6,
            }}
          />
          <button
            disabled={!hasSavedLink}
            onClick={() => copyText(embedCode, "embed")}
            style={{
              position: "absolute", top: "8px", right: "8px",
              padding: "5px 10px", borderRadius: "7px",
              background: copied === "embed" ? "rgba(5,150,105,0.15)" : "rgba(0,0,0,0.04)",
              border: "1px solid rgba(0,0,0,0.1)",
              color: copied === "embed" ? "#059669" : "rgba(0,0,0,0.6)",
              fontSize: "11px", cursor: hasSavedLink ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", gap: "5px",
              opacity: hasSavedLink ? 1 : 0.55,
            }}
          >
            {copied === "embed" ? <Check size={11} /> : <Copy size={11} />}
            {copied === "embed" ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
        {[
          ["Questions", form.questions.length.toString()],
          ["Required", form.questions.filter(q => q.required).length.toString()],
          ["Status", form.settings.isActive ? "Active" : "Inactive"],
        ].map(([label, value]) => (
          <div key={label} style={{
            padding: "10px 12px", borderRadius: "9px",
            background: "#ffffff",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#064e3b", fontVariantNumeric: "tabular-nums" }}>{value}</div>
            <div style={{ fontSize: "10px", color: "rgba(0,0,0,0.5)", marginTop: "2px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Automation connection */}
      <div style={{
        marginTop: "12px",
        padding: "16px",
        borderRadius: "12px",
        background: "rgba(0,0,0,0.02)",
        border: "1px solid rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>🔌</span>
          <div>
            <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#111827", margin: 0 }}>Automation Connection</h4>
            <p style={{ fontSize: "10.5px", color: "rgba(0,0,0,0.5)", margin: "1px 0 0" }}>Send completed forms to your guest operations flow</p>
          </div>
        </div>

        {/* Submission connection input */}
        <div>
          <div style={{ fontSize: "10.5px", fontWeight: 600, color: "rgba(0,0,0,0.5)", marginBottom: "5px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Submission Automation URL
          </div>
          <input
            type="text"
            value={form.settings.n8nSubmitWebhook ?? ""}
            onChange={e => {
              updateForm?.(prev => ({
                ...prev,
                settings: { ...prev.settings, n8nSubmitWebhook: e.target.value }
              }));
            }}
            placeholder="https://automation.yourdomain.com/..."
            style={{
              padding: "9px 12px",
              background: "#ffffff",
              border: "1.5px solid rgba(0,0,0,0.1)",
              borderRadius: "8px", fontSize: "12px",
              color: "#111827", outline: "none",
              fontFamily: "'Inter', sans-serif",
              width: "100%",
              boxSizing: "border-box"
            }}
          />
        </div>

        {/* Interactive Blueprint Drawer */}
        <div style={{
          background: "#ffffff",
          borderRadius: "8px",
          border: "1px solid rgba(0,0,0,0.08)",
          padding: "10px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#064e3b" }}>Submission Details Sample</span>
            <button
              onClick={() => {
                const payloadSchema = {
                  event: "guest_feedback_submitted",
                  submissionId: "<uuid-from-submissions>",
                  formId: form.id,
                  propertyName: form.settings.propertyName,
                  propertyId: form.settings.propertyId,
                  guestName: "<guest_name>",
                  guestEmail: "<guest_email>",
                  guestPhone: "<guest_phone>",
                  roomNumber: "<room_number>",
                  answers: [
                    { questionId: "<question_id>", questionLabel: "<question_label>", questionType: "<question_type>", value: "<answer_value>" }
                  ],
                  routingActions: [
                    { action: "<routing_action>", triggered: true, reason: "<routing_reason>" }
                  ],
                  timestamp: "<iso_timestamp>"
                };
                navigator.clipboard.writeText(JSON.stringify(payloadSchema, null, 2)).then(() => {
                  addToast("Submission sample copied to clipboard!", "success");
                });
              }}
              style={{
                background: "rgba(0,0,0,0.04)",
                border: "1px solid rgba(0,0,0,0.1)",
                color: "#111827",
                fontSize: "9px",
                padding: "3px 6px",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Copy Sample
            </button>
          </div>
          <p style={{ fontSize: "10px", color: "rgba(0,0,0,0.5)", marginTop: "4px", marginBottom: "8px", lineHeight: "1.3" }}>
            Copy this sample to align your operations flow with the form data.
          </p>
          <pre style={{
            margin: 0,
            fontSize: "10.5px",
            color: "rgba(0,0,0,0.7)",
            background: "rgba(0,0,0,0.03)",
            padding: "8px",
            borderRadius: "6px",
            overflowX: "auto",
            maxHeight: "140px",
            fontFamily: "'Inter', sans-serif",
          }}>
{`Property: ${form.settings.propertyName}
Guest details: name, email, phone, room
Answers: all submitted question responses
Routing: manager alerts and review-link actions
Submitted time: included with every response`}
          </pre>
        </div>
      </div>
    </div>
  );
}
