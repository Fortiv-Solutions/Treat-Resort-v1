"use client";

import { useState } from "react";
import type { FormConfig, Toast } from "@/lib/formBuilderTypes";
import { Copy, Check, ExternalLink, QrCode, Code2 } from "lucide-react";

interface Props {
  form: FormConfig;
  addToast: (msg: string, type?: Toast["type"]) => void;
}

export default function ShareSection({ form, addToast }: Props) {
  const [copied, setCopied] = useState<"link" | "embed" | null>(null);

  const slug = `${form.settings.propertyId}-${form.id}`;
  const formLink = typeof window !== "undefined"
    ? `${window.location.origin}/forms/${slug}`
    : `https://forms.fortiv.in/${slug}`;

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
        <div style={{ fontSize: "10.5px", fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: "7px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
          Form Link
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <div style={{
            flex: 1, padding: "9px 12px",
            background: "rgba(255,255,255,0.06)",
            border: "1.5px solid rgba(255,255,255,0.1)",
            borderRadius: "9px", fontSize: "12px",
            color: "rgba(255,255,255,0.6)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {formLink}
          </div>
          <button onClick={() => copyText(formLink, "link")} style={{
            padding: "9px 14px", borderRadius: "9px", flexShrink: 0,
            background: copied === "link" ? "rgba(5,150,105,0.2)" : "rgba(201,169,110,0.12)",
            border: `1.5px solid ${copied === "link" ? "rgba(5,150,105,0.3)" : "rgba(201,169,110,0.2)"}`,
            color: copied === "link" ? "#6EE7B7" : "#C9A96E",
            cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
            fontSize: "12px", fontWeight: 600, transition: "all 150ms",
          }}>
            {copied === "link" ? <Check size={13} /> : <Copy size={13} />}
            {copied === "link" ? "Copied!" : "Copy"}
          </button>
        </div>
        <p style={{ fontSize: "10.5px", color: "rgba(255,255,255,0.3)", marginTop: "5px" }}>
          Share this link via WhatsApp 30 min after checkout
        </p>
      </div>

      {/* QR Code */}
      <div>
        <div style={{ fontSize: "10.5px", fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: "8px", letterSpacing: "0.04em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
          <QrCode size={12} />
          QR Code
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: "16px",
          padding: "12px 14px", borderRadius: "12px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{ background: "#FAF8F5", borderRadius: "10px", padding: "8px", flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl}
              alt="Form QR Code"
              width={90}
              height={90}
              style={{ display: "block", borderRadius: "4px" }}
            />
          </div>
          <div>
            <div style={{ fontSize: "12.5px", fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: "4px" }}>
              Scan to open form
            </div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginBottom: "10px", lineHeight: 1.4 }}>
              Print and display at reception or in rooms for instant access
            </div>
            <a
              href={qrUrl}
              download={`qr-${slug}.png`}
              style={{
                display: "inline-flex", alignItems: "center", gap: "5px",
                padding: "6px 12px", borderRadius: "8px",
                background: "rgba(201,169,110,0.1)",
                border: "1px solid rgba(201,169,110,0.2)",
                color: "#C9A96E", fontSize: "11.5px", fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <ExternalLink size={11} />
              Download QR
            </a>
          </div>
        </div>
      </div>

      {/* Embed code */}
      <div>
        <div style={{ fontSize: "10.5px", fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: "7px", letterSpacing: "0.04em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
          <Code2 size={12} />
          Embed Code
        </div>
        <div style={{ position: "relative" }}>
          <textarea
            readOnly
            value={embedCode}
            rows={3}
            style={{
              width: "100%", padding: "9px 12px",
              background: "rgba(0,0,0,0.25)",
              border: "1.5px solid rgba(255,255,255,0.08)",
              borderRadius: "9px", fontSize: "11px",
              color: "rgba(255,255,255,0.5)",
              fontFamily: "monospace", resize: "none",
              outline: "none", boxSizing: "border-box",
              lineHeight: 1.6,
            }}
          />
          <button
            onClick={() => copyText(embedCode, "embed")}
            style={{
              position: "absolute", top: "8px", right: "8px",
              padding: "5px 10px", borderRadius: "7px",
              background: copied === "embed" ? "rgba(5,150,105,0.25)" : "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: copied === "embed" ? "#6EE7B7" : "rgba(255,255,255,0.6)",
              fontSize: "11px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "5px",
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
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#C9A96E", fontVariantNumeric: "tabular-nums" }}>{value}</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", marginTop: "2px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
