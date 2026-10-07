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
  showPercentOnly = true,
  className
}) => {
  const delta = calculateMetricDelta(metricKey, current, previous);

  if (delta.direction === 'neutral') {
    return (
      <span className={clsx(
        "inline-flex items-center gap-1 text-xs font-mono font-medium text-txt-secondary bg-bg-tertiary px-2 py-0.5 rounded",
        className
      )}>
        <Minus className="w-3 h-3 text-txt-muted" />
        <span>0.0%</span>
      </span>
    );
  }

  const isUp = delta.direction === 'up';

  // Badge background & text styling based on IS_GOOD:
  // Good -> green text & light green bg
  // Bad -> red text & light red bg
  const badgeStyle = delta.isGood
    ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40"
    : "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/40";

  return (
    <span className={clsx(
      "inline-flex items-center gap-1 text-xs font-mono font-semibold px-2 py-0.5 rounded border transition-colors",
      badgeStyle,
      className
    )}>
      {isUp ? (
        <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
      ) : (
        <TrendingDown className="w-3.5 h-3.5 stroke-[2.5]" />
      )}
      <span>{isUp ? '+' : ''}{delta.percentageChange.toFixed(1)}%</span>
    </span>
  );
};
