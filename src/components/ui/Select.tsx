import React from "react";
import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { label: string; value: string }[];
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  className,
  value,
  onChange,
  ...props
}) => {
  return (
    <div className="inline-flex flex-col gap-1">
      {label && (
        <label className="text-[11px] font-medium text-txt-secondary uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative inline-block">
        <select
          value={value}
          onChange={onChange}
          className={clsx(
            "appearance-none bg-surface text-txt-primary border border-surface-border rounded-sm text-xs font-medium pl-2.5 pr-7 py-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 cursor-pointer transition-colors hover:bg-surface-hover",
            className,
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-txt-muted absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
};
