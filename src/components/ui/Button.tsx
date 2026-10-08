import React from "react";
import { clsx } from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "secondary",
  size = "md",
  icon,
  className,
  disabled,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-sm transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-40 disabled:cursor-not-allowed select-none active:scale-[0.98]";

  const variantClasses = {
    primary:
      "bg-accent text-white hover:bg-accent-hover border border-transparent shadow-subtle",
    secondary:
      "bg-surface text-txt-primary hover:bg-surface-hover border border-surface-border active:bg-surface-active",
    outline:
      "bg-transparent text-txt-primary border border-surface-border hover:bg-surface-hover active:bg-surface-active",
    ghost:
      "bg-transparent text-txt-secondary hover:text-txt-primary hover:bg-surface-hover active:bg-surface-active",
    danger:
      "bg-status-fault text-white hover:opacity-90 border border-transparent shadow-subtle",
  }[variant];

  const sizeClasses = {
    sm: "text-xs px-2.5 py-1 gap-1.5 h-7",
    md: "text-xs font-semibold px-3 py-1.5 gap-2 h-8",
    lg: "text-xs font-semibold px-4 py-2 gap-2 h-9",
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
