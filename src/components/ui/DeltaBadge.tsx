import React from 'react';
import { calculateMetricDelta } from '../../utils/calculations';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { clsx } from 'clsx';

interface DeltaBadgeProps {
  metricKey: string;
  current: number;
  previous: number;
  showPercentOnly?: boolean;
  className?: string;
}

export const DeltaBadge: React.FC<DeltaBadgeProps> = ({
  metricKey,
  current,
  previous,
  className
}) => {
  const delta = calculateMetricDelta(metricKey, current, previous);

  if (delta.direction === 'neutral') {
    return (
      <span className={clsx(
        "inline-flex items-center gap-1 text-[11px] font-mono text-txt-muted bg-bg-secondary px-1.5 py-0.5 rounded-xs border border-surface-border select-none",
        className
      )}>
        <Minus className="w-3 h-3 text-txt-muted" />
        <span>0.0%</span>
      </span>
    );
  }

  const isUp = delta.direction === 'up';

  const badgeStyle = delta.isGood
    ? "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    : "text-rose-700 dark:text-rose-400 bg-rose-500/10 border-rose-500/20";

  return (
    <span className={clsx(
      "inline-flex items-center gap-1 text-[11px] font-mono font-medium px-1.5 py-0.5 rounded-xs border select-none transition-colors",
      badgeStyle,
      className
    )}>
      {isUp ? (
        <TrendingUp className="w-3 h-3 stroke-[2]" />
      ) : (
        <TrendingDown className="w-3 h-3 stroke-[2]" />
      )}
      <span>{isUp ? '+' : ''}{delta.percentageChange.toFixed(1)}%</span>
    </span>
  );
};
