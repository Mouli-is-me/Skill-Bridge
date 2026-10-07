import React from 'react';
import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
  height?: string;
  width?: string;
  circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  height,
  width,
  circle = false
}) => {
  return (
    <div
      style={{ height, width }}
      className={clsx(
        "animate-pulse bg-bg-tertiary/70 dark:bg-surface-hover/70 rounded",
        circle && "rounded-full",
        className
      )}
    />
  );
};

export const CardSkeleton: React.FC = () => (
  <div className="bg-surface border border-surface-border rounded-xl p-5 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton height="14px" width="40%" />
      <Skeleton height="20px" width="25%" circle={false} />
    </div>
    <Skeleton height="32px" width="60%" />
    <div className="flex justify-between items-center pt-2">
      <Skeleton height="12px" width="30%" />
      <Skeleton height="12px" width="20%" />
    </div>
  </div>
);

export const ChartSkeleton: React.FC = () => (
  <div className="bg-surface border border-surface-border rounded-xl p-6 space-y-6">
    <div className="flex items-center justify-between">
      <Skeleton height="18px" width="30%" />
      <Skeleton height="28px" width="120px" />
    </div>
    <div className="h-64 flex items-end gap-3 pt-4">
      {[40, 65, 80, 50, 90, 75, 60, 85, 95, 70, 55, 80].map((h, idx) => (
        <Skeleton key={idx} height={`${h}%`} className="flex-1 rounded-t-sm" />
      ))}
    </div>
  </div>
);
