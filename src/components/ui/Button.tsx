import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const variantClasses = {
    primary: "bg-accent text-white hover:bg-accent-hover shadow-subtle border border-accent",
    secondary: "bg-surface text-txt-primary hover:bg-surface-hover border border-surface-border shadow-subtle",
    outline: "bg-transparent text-txt-primary border border-surface-border hover:bg-surface-hover",
    ghost: "bg-transparent text-txt-secondary hover:text-txt-primary hover:bg-surface-hover",
    danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-subtle border border-rose-600"
  }[variant];

  const sizeClasses = {
    sm: "text-xs px-2.5 py-1.5 gap-1.5",
    md: "text-xs font-semibold px-3.5 py-2 gap-2",
    lg: "text-sm font-semibold px-4 py-2.5 gap-2"
  }[size];

  return (
    <button
      className={clsx(baseClasses, variantClasses, sizeClasses, className)}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
