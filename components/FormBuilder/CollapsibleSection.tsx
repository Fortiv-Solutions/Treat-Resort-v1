"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface Props {
  icon: ReactNode;
  label: string;
  subtitle: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  index: number;
}

export default function CollapsibleSection({ icon, label, subtitle, isOpen, onToggle, children, index }: Props) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">(isOpen ? "auto" : 0);

  useEffect(() => {
    if (!bodyRef.current) return;
    if (isOpen) {
      const h = bodyRef.current.scrollHeight;
      setHeight(h);
      const t = setTimeout(() => setHeight("auto"), 350);
      return () => clearTimeout(t);
    } else {
      if (height === "auto") {
        setHeight(bodyRef.current.scrollHeight);
        requestAnimationFrame(() => setHeight(0));
      } else {
        setHeight(0);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <div
      className="anim-fade-up"
      style={{
        background: "rgba(255,255,255,0.06)",
        border: `1px solid ${isOpen ? "rgba(201,169,110,0.3)" : "rgba(255,255,255,0.08)"}`,
        borderLeft: isOpen ? "3px solid #C9A96E" : "3px solid transparent",
        borderRadius: "14px",
        overflow: "hidden",
        transition: "border-color 250ms ease, border-left-color 250ms ease",
        animationDelay: `${index * 60}ms`,
      }}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          gap: "12px", padding: "14px 18px",
          background: "transparent", border: "none", cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{
          width: "32px", height: "32px", borderRadius: "9px", flexShrink: 0,
          background: isOpen ? "rgba(201,169,110,0.18)" : "rgba(255,255,255,0.07)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: isOpen ? "#C9A96E" : "rgba(255,255,255,0.5)",
          transition: "background 200ms, color 200ms",
        }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: "13px", fontWeight: 600,
            color: isOpen ? "#FFFFFF" : "rgba(255,255,255,0.75)",
            lineHeight: 1.2, transition: "color 200ms",
          }}>
            {label}
          </div>
          <div style={{
            fontSize: "11px",
            color: isOpen ? "rgba(201,169,110,0.7)" : "rgba(255,255,255,0.35)",
            marginTop: "2px", transition: "color 200ms",
          }}>
            {subtitle}
          </div>
        </div>
        <ChevronDown
          size={15}
          color={isOpen ? "#C9A96E" : "rgba(255,255,255,0.35)"}
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 280ms var(--ease-out-expo)", flexShrink: 0 }}
        />
      </button>

      {/* Body */}
      <div
        ref={bodyRef}
        style={{
          height: height === "auto" ? "auto" : `${height}px`,
          overflow: height === "auto" ? "visible" : "hidden",
          transition: "height 300ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div style={{
          padding: "0 18px 18px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: "16px",
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}
