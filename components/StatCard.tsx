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
  gold:  "bg-brand-gold",
  green: "bg-emerald-600",
  amber: "bg-amber-600",
  red:   "bg-red-600",
};

const ICON_STYLE: Record<string, string> = {
  gold:  "bg-brand-green-800 text-brand-gold",
  green: "bg-emerald-800 text-white",
  amber: "bg-amber-800 text-white",
  red:   "bg-red-800 text-white",
};

const TREND_GOOD = "badge-emerald";
const TREND_BAD  = "badge-red";

export default function StatCard({
  title, value, subtitle, icon: Icon,
  accent = "gold", trend,
  animateNumber = true, delay = 0,
}: StatCardProps) {
  const accentLineClass = ACCENT_LINE[accent];
  const iconClass = ICON_STYLE[accent];

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
  const trendClass = trend ? (trendIsGood ? TREND_GOOD : TREND_BAD) : TREND_GOOD;

  const TrendIcon = trend?.direction === "up"
    ? TrendingUp
    : trend?.direction === "down"
    ? TrendingDown
    : Minus;

  return (
    <div
      className="relative flex flex-col justify-between overflow-hidden border-r border-brand-border-soft last:border-r-0 hover:bg-brand-gold/5 transition-colors duration-200 cursor-default group"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Accent top line */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${accentLineClass}`} />

      {/* Cell body */}
      <div className="p-5 pb-4">
        {/* Label + icon row */}
        <div className="flex justify-between items-start gap-3 mb-4">
          <p className="text-[10.5px] font-semibold tracking-[0.08em] uppercase text-brand-text-3 leading-none pt-1">
            {title}
          </p>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconClass} shadow-sm group-hover:shadow-md transition-shadow`}>
            <Icon className="w-4 h-4" strokeWidth={2} />
          </div>
        </div>

        {/* Value */}
        <div className="flex items-baseline gap-1 leading-none">
          <span className="text-4xl lg:text-[40px] xl:text-[44px] font-bold text-brand-text-1 tabular-nums tracking-tight">
            {typeof value === "number"
              ? (animateNumber ? animated : value).toLocaleString()
              : animated.toLocaleString()
            }
          </span>
          {suffix && (
            <span className="text-xl font-semibold text-brand-text-3 ml-0.5">
              {suffix}
            </span>
          )}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-xs text-brand-text-3 mt-1.5 font-medium leading-snug line-clamp-1">
            {subtitle}
          </p>
        )}
      </div>

      {/* Trend row */}
      <div className="mx-5 pt-3 pb-4 border-t border-brand-border-soft flex items-center gap-2">
        {trend ? (
          <>
            <span className={trendClass}>
              <TrendIcon className="w-3 h-3" strokeWidth={2.5} />
              {trend.label.split(" ")[0]}
            </span>
            <span className="text-xs text-brand-text-3 truncate">
              {trend.label.split(" ").slice(1).join(" ")}
            </span>
          </>
        ) : (
          <span className="text-xs text-brand-text-3">— No data</span>
        )}
      </div>
    </div>
  );
}
