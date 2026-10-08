import React from "react";
import { clsx } from "clsx";
import { MachineStatus } from "../../types/machine";
import { EventSeverity } from "../../types/event";

interface BadgeProps {
  status?:
    | MachineStatus
    | EventSeverity
    | "LIVE"
    | "DEGRADED"
    | "CONNECTION_LOST"
    | "OFFLINE"
    | string;
  variant?: "status" | "severity" | "outline" | "subtle";
  size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  size = "md",
  children,
  className,
  dot = true,
}) => {
  const normStatus = (status || "").toUpperCase();

  let colorClasses = "bg-bg-secondary text-txt-secondary border-surface-border";
  let dotColor = "bg-txt-muted";

  if (
    [
      "RUNNING",
      "LIVE",
      "HEALTHY",
      "NORMAL",
      "ONLINE",
      "SUCCESS",
      "GOOD",
    ].includes(normStatus)
  ) {
    colorClasses =
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
    dotColor = "bg-emerald-500";
  } else if (["WARNING", "DEGRADED", "MEDIUM"].includes(normStatus)) {
    colorClasses =
      "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
    dotColor = "bg-amber-500";
  } else if (
    ["FAULT", "ERROR", "DOWN", "CRITICAL", "CONNECTION_LOST", "HIGH"].includes(
      normStatus,
    )
  ) {
    colorClasses =
      "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20";
    dotColor = "bg-rose-500";
  } else if (["OFFLINE", "IDLE", "PAUSED", "DISABLED"].includes(normStatus)) {
    colorClasses =
      "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20";
    dotColor = "bg-slate-400";
  } else if (["INFO", "LOW", "SYSTEM"].includes(normStatus)) {
    colorClasses =
      "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
    dotColor = "bg-blue-500";
  }

  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5 font-medium rounded-xs",
    md: "text-[11px] px-2 py-0.5 font-medium rounded-xs",
    lg: "text-xs px-2.5 py-1 font-semibold rounded-xs",
  }[size];

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 border font-mono tracking-tight transition-colors leading-none select-none",
        sizeClasses,
        colorClasses,
        className,
      )}
    >
      {dot && (
        <span className={clsx("w-1.5 h-1.5 rounded-full shrink-0", dotColor)} />
      )}
      <span>{children || normStatus}</span>
    </span>
  );
};
