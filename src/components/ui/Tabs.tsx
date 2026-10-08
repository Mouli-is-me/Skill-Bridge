import React from "react";
import { clsx } from "clsx";

interface TabOption {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: TabOption[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: "pills" | "underline";
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = "pills",
  className,
}) => {
  if (variant === "underline") {
    return (
      <div
        className={clsx("flex border-b border-surface-border gap-5", className)}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={clsx(
                "pb-2 text-xs font-medium transition-all relative select-none",
                isActive
                  ? "text-txt-primary font-semibold border-b-2 border-accent"
                  : "text-txt-secondary hover:text-txt-primary",
              )}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={clsx(
                    "ml-1.5 px-1.5 py-0.2 text-[10px] font-mono rounded-xs",
                    isActive
                      ? "bg-accent/10 text-accent font-semibold"
                      : "bg-bg-secondary text-txt-muted",
                  )}
                >
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
    <div
      className={clsx(
        "inline-flex bg-bg-secondary p-0.5 rounded-sm border border-surface-border",
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              "px-2.5 py-1 text-xs font-medium rounded-xs transition-colors duration-150 select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/40",
              isActive
                ? "bg-surface text-txt-primary font-semibold border border-surface-border shadow-subtle"
                : "text-txt-secondary hover:text-txt-primary border border-transparent",
            )}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={clsx(
                  "ml-1.5 px-1.5 py-0.2 text-[10px] font-mono rounded-xs",
                  isActive
                    ? "bg-accent/10 text-accent font-semibold"
                    : "bg-bg-primary text-txt-muted",
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
