import React from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  bordered?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = 'md',
  bordered = true,
  ...props
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4 sm:p-5',
    lg: 'p-6'
  }[padding];

  return (
    <div
      className={clsx(
        "bg-surface rounded-xl shadow-subtle transition-colors",
        bordered && "border border-surface-border",
        paddingClasses,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
