import { TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import { Sparkline } from "./charts/Sparkline";

interface KpiCardProps {
  icon: ReactNode;
  iconClass: string;
  label: string;
  value?: number | string;
  spark?: number[] | null;
  sparkColor?: string;
  deltaText?: string;
  deltaUp?: boolean;
}

/** KPI tile: icon chip + sparkline, big value, and an optional delta line. */
export function KpiCard({
  icon,
  iconClass,
  label,
  value,
  spark,
  sparkColor = "#3B82F6",
  deltaText,
  deltaUp = false,
}: KpiCardProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 transition-shadow duration-150 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div
          className={`inline-flex items-center justify-center rounded-lg p-2.5 ${iconClass}`}
        >
          {icon}
        </div>
        {spark && spark.length > 0 && (
          <Sparkline values={spark} color={sparkColor} />
        )}
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold tracking-tight tabular-nums">
        {value === undefined ? "--" : value}
      </p>
      {deltaText && (
        <p
          className={`mt-1 flex items-center gap-1 text-xs font-medium ${
            deltaUp ? "text-emerald-600" : "text-muted-foreground"
          }`}
        >
          {deltaUp && <TrendingUp className="h-3.5 w-3.5" />}
          {deltaText}
        </p>
      )}
    </div>
  );
}
