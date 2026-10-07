import React from 'react';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';

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
        <label className="text-xs font-semibold text-txt-secondary uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative inline-block">
        <select
          value={value}
          onChange={onChange}
          className={clsx(
            "appearance-none bg-surface text-txt-primary border border-surface-border rounded-md text-xs font-medium pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-accent/40 shadow-subtle cursor-pointer",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-txt-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
};
