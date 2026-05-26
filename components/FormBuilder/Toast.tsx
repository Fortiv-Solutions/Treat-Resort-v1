"use client";

import type { Toast } from "@/lib/formBuilderTypes";
import { Check, AlertTriangle, Info, X } from "lucide-react";

interface Props {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const TOAST_STYLES: Record<Toast["type"], { bg: string; border: string; icon: typeof Check; iconColor: string; textColor: string }> = {
  success: { bg: "#ECFDF5", border: "#A7F3D0", icon: Check,         iconColor: "#059669", textColor: "#065F46" },
  error:   { bg: "#FEF2F2", border: "#FECACA", icon: AlertTriangle, iconColor: "#DC2626", textColor: "#991B1B" },
  info:    { bg: "#EFF6FF", border: "#BFDBFE", icon: Info,          iconColor: "#3B82F6", textColor: "#1D4ED8" },
};

export default function ToastContainer({ toasts, onDismiss }: Props) {
  return (
    <div style={{
      position: "fixed", bottom: "24px", right: "24px",
      display: "flex", flexDirection: "column", gap: "8px",
      zIndex: 9000, pointerEvents: "none",
    }}>
      {toasts.map(toast => {
        const s = TOAST_STYLES[toast.type];
        const Icon = s.icon;
        return (
          <div
            key={toast.id}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "12px 14px 12px 12px",
              background: s.bg, border: `1px solid ${s.border}`,
              borderRadius: "12px", boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
              minWidth: "240px", maxWidth: "360px",
              animation: "slideRight 220ms cubic-bezier(0.16,1,0.3,1) both",
              pointerEvents: "all",
            }}
          >
            <div style={{
              width: "26px", height: "26px", borderRadius: "50%",
              background: s.iconColor + "22",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Icon size={13} color={s.iconColor} strokeWidth={2.5} />
            </div>
            <span style={{ flex: 1, fontSize: "13px", fontWeight: 500, color: s.textColor, lineHeight: 1.4 }}>
              {toast.message}
            </span>
            <button
              onClick={() => onDismiss(toast.id)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "2px", borderRadius: "4px",
                color: s.iconColor, opacity: 0.6, flexShrink: 0,
              }}
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
