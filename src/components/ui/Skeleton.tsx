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
        "animate-pulse bg-bg-tertiary/60 dark:bg-surface-hover/60 rounded-sm",
        circle && "rounded-full",
        className
      )}
    />
  );
};

export const CardSkeleton: React.FC = () => (
  <div className="bg-surface border border-surface-border rounded-md p-4 space-y-3">
    <div className="flex items-center justify-between">
      <Skeleton height="12px" width="40%" />
      <Skeleton height="18px" width="25%" circle={false} />
    </div>
    <Skeleton height="28px" width="50%" />
    <div className="flex justify-between items-center pt-1">
      <Skeleton height="10px" width="30%" />
      <Skeleton height="10px" width="20%" />
    </div>
  </div>
);

export const ChartSkeleton: React.FC = () => (
  <div className="bg-surface border border-surface-border rounded-md p-5 space-y-5">
    <div className="flex items-center justify-between">
      <Skeleton height="16px" width="30%" />
      <Skeleton height="24px" width="100px" />
    </div>
    <div className="h-56 flex items-end gap-2 pt-4">
      {[40, 65, 80, 50, 90, 75, 60, 85, 95, 70, 55, 80].map((h, idx) => (
        <Skeleton key={idx} height={`${h}%`} className="flex-1 rounded-xs" />
      ))}
    </div>
  </div>
);
