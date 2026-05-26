"use client";

import { useEffect, useRef, useState } from "react";
import { type LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface TrendData {
  label: string;
  direction: "up" | "down" | "neutral";
  positive: boolean;
}

export interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  accent?: "gold" | "red" | "amber" | "green";
  trend?: TrendData;
  animateNumber?: boolean;
  delay?: number;
}

function useCountUp(target: number, duration = 1000, delay = 0) {
  const [count, setCount] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    const t = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        const e = 1 - Math.pow(1 - p, 3);
        setCount(Math.round(e * target));
        if (p < 1) raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
    }, delay);
    return () => { clearTimeout(t); if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration, delay]);
  return count;
}

const ACCENT_LINE: Record<string, string> = {
  gold:  "#C9A96E",
  green: "#059669",
  amber: "#D97706",
  red:   "#DC2626",
};

const ICON_STYLE: Record<string, { bg: string; color: string }> = {
  gold:  { bg: "#1B4332", color: "#C9A96E" },
  green: { bg: "#065F46", color: "#FFFFFF" },
  amber: { bg: "#92400E", color: "#FFFFFF" },
  red:   { bg: "#991B1B", color: "#FFFFFF" },
};

const TREND_GOOD = { bg: "#ECFDF5", text: "#065F46" };
const TREND_BAD  = { bg: "#FEF2F2", text: "#991B1B" };

export default function StatCard({
  title, value, subtitle, icon: Icon,
  accent = "gold", trend,
  animateNumber = true, delay = 0,
}: StatCardProps) {
  const accentColor = ACCENT_LINE[accent];
  const iconStyle   = ICON_STYLE[accent];

  const numTarget = typeof value === "number"
    ? value
    : parseFloat(String(value).replace(/[^0-9.]/g, "")) || 0;
  const suffix = typeof value === "string"
    ? String(value).replace(/[0-9.,]/g, "")
    : "";
  const animated = useCountUp(numTarget, 1000, delay);

  const trendIsGood = trend
    ? (trend.direction === "up" && trend.positive) || (trend.direction === "down" && !trend.positive)
    : true;
  const trendStyle = trend ? (trendIsGood ? TREND_GOOD : TREND_BAD) : TREND_GOOD;

  const TrendIcon = trend?.direction === "up"
    ? TrendingUp
    : trend?.direction === "down"
    ? TrendingDown
    : Minus;

  return (
    <div
      className="stat-cell anim-fade-up"
      style={{ position: "relative", animationDelay: `${delay}ms` }}
    >
      {/* Accent top line */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "2px",
        background: accentColor,
      }} />

      {/* Cell body */}
      <div style={{ padding: "18px 20px 12px" }}>

        {/* Label + icon row */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          gap: "10px", marginBottom: "14px",
        }}>
          <p style={{
            fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.08em",
            textTransform: "uppercase", color: "var(--text-3)", lineHeight: 1,
            paddingTop: "4px", margin: 0,
          }}>
            {title}
          </p>
          <div style={{
            width: "34px", height: "34px", borderRadius: "8px",
            background: iconStyle.bg,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <Icon size={16} color={iconStyle.color} strokeWidth={2} />
          </div>
        </div>

        {/* Value */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "2px", lineHeight: 1 }}>
          <span style={{
            fontSize: "48px", fontWeight: 700, color: "var(--text-1)",
            fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em",
            fontFamily: "'Inter', sans-serif",
            lineHeight: 1,
          }}>
            {typeof value === "number"
              ? (animateNumber ? animated : value).toLocaleString()
              : animated.toLocaleString()
            }
          </span>
          {suffix && (
            <span style={{
              fontSize: "20px", fontWeight: 600, color: "var(--text-3)", marginLeft: "2px",
            }}>
              {suffix}
            </span>
          )}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p style={{
            fontSize: "12px", color: "var(--text-3)", marginTop: "5px",
            fontWeight: 400, lineHeight: 1.4,
          }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Trend row */}
      <div style={{
        margin: "0 20px",
        paddingTop: "10px",
        paddingBottom: "14px",
        borderTop: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: "6px",
      }}>
        {trend ? (
          <>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "3px",
              padding: "2px 8px", borderRadius: "4px",
              fontSize: "11px", fontWeight: 600,
              background: trendStyle.bg,
              color: trendStyle.text,
            }}>
              <TrendIcon size={11} strokeWidth={2.5} />
              {trend.label.split(" ")[0]}
            </span>
            <span style={{ fontSize: "11px", color: "var(--text-3)" }}>
              {trend.label.split(" ").slice(1).join(" ")}
            </span>
          </>
        ) : (
          <span style={{ fontSize: "11px", color: "var(--text-3)" }}>— No data</span>
        )}
      </div>
    </div>
  );
}
