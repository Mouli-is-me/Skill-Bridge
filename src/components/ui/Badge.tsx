import React from 'react';
import { clsx } from 'clsx';
import { MachineStatus } from '../../types/machine';
import { EventSeverity } from '../../types/event';

interface BadgeProps {
  status?: MachineStatus | EventSeverity | 'LIVE' | 'DEGRADED' | 'CONNECTION_LOST' | 'OFFLINE' | string;
  variant?: 'status' | 'severity' | 'outline' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  variant = 'status',
  size = 'md',
  children,
  className,
  dot = true
}) => {
  const normStatus = (status || '').toUpperCase();

  let colorClasses = "bg-bg-tertiary text-txt-primary border-surface-border";
  let dotColor = "bg-txt-muted";

  if (['RUNNING', 'LIVE', 'HEALTHY', 'NORMAL', 'ONLINE', 'SUCCESS', 'GOOD'].includes(normStatus)) {
    colorClasses = "bg-status-healthy-bg text-status-healthy border-emerald-300/40 dark:border-emerald-800/40";
    dotColor = "bg-status-healthy";
  } else if (['WARNING', 'DEGRADED', 'MEDIUM'].includes(normStatus)) {
    colorClasses = "bg-status-warning-bg text-status-warning border-amber-300/40 dark:border-amber-800/40";
    dotColor = "bg-status-warning";
  } else if (['FAULT', 'ERROR', 'DOWN', 'CRITICAL', 'CONNECTION_LOST', 'HIGH'].includes(normStatus)) {
    colorClasses = "bg-status-fault-bg text-status-fault border-rose-300/40 dark:border-rose-800/40";
    dotColor = "bg-status-fault";
  } else if (['OFFLINE', 'IDLE', 'PAUSED', 'DISABLED'].includes(normStatus)) {
    colorClasses = "bg-status-offline-bg text-status-offline border-gray-300/40 dark:border-gray-700/40";
    dotColor = "bg-status-offline";
  } else if (['INFO', 'LOW', 'SYSTEM'].includes(normStatus)) {
    colorClasses = "bg-status-info-bg text-status-info border-blue-300/40 dark:border-blue-800/40";
    dotColor = "bg-status-info";
  }

  const sizeClasses = {
    sm: "text-[11px] px-1.5 py-0.5 font-medium rounded",
    md: "text-xs px-2.5 py-1 font-semibold rounded-md",
    lg: "text-sm px-3 py-1.5 font-bold rounded-lg"
  }[size];

  return (
    <span className={clsx(
      "inline-flex items-center gap-1.5 border font-mono tracking-tight transition-colors",
      sizeClasses,
      colorClasses,
      className
    )}>
      {dot && (
        <span className={clsx("w-1.5 h-1.5 rounded-full shrink-0", dotColor)} />
      )}
      <span>{children || normStatus}</span>
    </span>
  );
};
