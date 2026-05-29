"use client";

import { useEffect, useRef, useState } from "react";
import { type LucideIcon, ArrowUpRight, ArrowDownRight, ArrowRight } from "lucide-react";

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

const ICON_STYLE: Record<string, string> = {
  gold:  "bg-brand-green-900 text-brand-gold",
  green: "bg-brand-green-800 text-white",
  amber: "bg-brand-gold text-brand-ink",
  red:   "bg-red-800 text-white",
};

const TREND_GOOD = "badge-emerald";
const TREND_BAD  = "badge-red";

export default function StatCard({
  title, value, subtitle, icon: Icon,
  accent = "gold", trend,
  animateNumber = true, delay = 0,
}: StatCardProps) {
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
    ? ArrowUpRight
    : trend?.direction === "down"
    ? ArrowDownRight
    : ArrowRight;

  return (
    <div
      className="glass-card flex flex-col justify-between overflow-hidden cursor-default group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[15px] font-medium text-brand-text-2 mb-3">
              {title}
            </p>
            <div className="flex items-baseline gap-1 leading-none">
              <span className="text-4xl xl:text-[42px] font-bold text-brand-text-1 tabular-nums tracking-tight">
                {typeof value === "number"
                  ? (animateNumber ? animated : value).toLocaleString()
                  : animated.toLocaleString()
                }
              </span>
              {suffix && (
                <span className="text-xl font-bold text-brand-text-1 ml-0.5">
                  {suffix}
                </span>
              )}
            </div>
          </div>
          <div className={`w-[46px] h-[46px] rounded-[14px] flex items-center justify-center shrink-0 ${iconClass} shadow-sm group-hover:shadow-md transition-shadow`}>
            <Icon className="w-5 h-5" strokeWidth={2.5} />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          {trend ? (
            <>
              <span className={trendClass}>
                <TrendIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
                {trend.label.split(" ")[0]}
              </span>
              <span className="text-[13px] text-brand-text-3 truncate font-medium">
                {trend.label.split(" ").slice(1).join(" ")}
              </span>
            </>
          ) : subtitle ? (
            <span className="text-[13px] text-brand-text-3 font-medium truncate">
              {subtitle.startsWith("Last") ? subtitle : `Last month: ${subtitle}`}
            </span>
          ) : (
            <span className="text-[13px] text-brand-text-3">— No data</span>
          )}
        </div>
      </div>
    </div>
  );
}
