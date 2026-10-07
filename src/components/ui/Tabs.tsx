import React from 'react';
import { clsx } from 'clsx';

interface TabOption {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: TabOption[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'pills' | 'underline';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'pills',
  className
}) => {
  if (variant === 'underline') {
    return (
      <div className={clsx("flex border-b border-surface-border gap-6", className)}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={clsx(
                "pb-2.5 text-xs font-semibold transition-all relative",
                isActive
                  ? "text-accent border-b-2 border-accent"
                  : "text-txt-secondary hover:text-txt-primary"
              )}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={clsx(
                  "ml-1.5 px-1.5 py-0.5 text-[10px] font-mono rounded-full",
                  isActive ? "bg-accent/15 text-accent" : "bg-bg-tertiary text-txt-secondary"
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={clsx("inline-flex bg-bg-tertiary p-1 rounded-lg border border-surface-border/60", className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              "px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 select-none",
              isActive
                ? "bg-surface text-txt-primary shadow-subtle font-bold"
                : "text-txt-secondary hover:text-txt-primary"
            )}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={clsx(
                "ml-1.5 px-1.5 py-0.5 text-[10px] font-mono rounded",
                isActive ? "bg-accent/15 text-accent" : "bg-bg-primary text-txt-secondary"
              )}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
