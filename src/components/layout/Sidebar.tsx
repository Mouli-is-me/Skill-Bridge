import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Cpu,
  Layers,
  BarChart3,
  GitCompare,
  FileText,
  AlertTriangle,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
  Calendar,
} from "lucide-react";
import { clsx } from "clsx";
import { useUIStore } from "../../store/uiStore";
import { useMachineStore } from "../../store/machineStore";
import { useSimulationStore } from "../../store/simulationStore";

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badgeCount?: number;
}

export const Sidebar: React.FC = () => {
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();
  const events = useMachineStore((s) => s.events);
  const connectionStatus = useSimulationStore((s) => s.connectionStatus);

  const activeAlertsCount = events.filter(
    (e) => e.severity === "ERROR" || e.severity === "WARNING",
  ).length;

  const primaryNavItems: NavItem[] = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Machines", path: "/machines", icon: Cpu },
    { name: "Modules", path: "/modules", icon: Layers },
    {
      name: "Alerts",
      path: "/alerts",
      icon: AlertTriangle,
      badgeCount: activeAlertsCount,
    },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  const secondaryNavItems: NavItem[] = [
    { name: "Event Audit", path: "/events", icon: Calendar },
    { name: "Performance", path: "/analytics", icon: BarChart3 },
    { name: "Compare", path: "/compare", icon: GitCompare },
    { name: "Reports", path: "/reports", icon: FileText },
  ];

  const isConnected = connectionStatus === "LIVE" || connectionStatus === "DEGRADED";

  return (
    <aside
      className={clsx(
        "bg-surface border-r border-surface-border flex flex-col transition-all duration-150 z-30 shrink-0 select-none",
        isSidebarCollapsed ? "w-14" : "w-56",
      )}
    >
      {/* Brand Header */}
      <div className="h-13 flex items-center justify-between px-3 border-b border-surface-border">
        <NavLink
          to="/dashboard"
          className="flex items-center gap-2 overflow-hidden"
        >
          <div className="w-6 h-6 rounded-xs bg-accent flex items-center justify-center text-white shrink-0 font-bold shadow-subtle">
            <Activity className="w-3.5 h-3.5 stroke-[2.2]" />
          </div>
          {!isSidebarCollapsed && (
            <div className="flex flex-col leading-none">
              <span className="font-semibold text-xs tracking-tight text-txt-primary">
                Skill Bridge
              </span>
              <span className="text-[9px] text-txt-muted font-mono tracking-wider uppercase mt-0.5">
                Industrial Monitor
              </span>
            </div>
          )}
        </NavLink>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-xs text-txt-muted hover:text-txt-primary hover:bg-surface-hover hidden md:block transition-colors"
          title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 py-3 px-2 space-y-4 overflow-y-auto">
        {/* Primary Navigation */}
        <div>
          {!isSidebarCollapsed && (
            <p className="px-2.5 mb-1 text-[10px] font-mono font-medium tracking-wider text-txt-muted uppercase">
              Main Menu
            </p>
          )}
          <nav className="space-y-0.5">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    clsx(
                      "flex items-center gap-2.5 px-2.5 py-1.5 rounded-xs text-xs font-medium transition-all relative group select-none",
                      isActive
                        ? "bg-bg-secondary text-txt-primary font-semibold border-l-2 border-accent"
                        : "text-txt-secondary hover:text-txt-primary hover:bg-surface-hover border-l-2 border-transparent",
                    )
                  }
                >
                  <Icon className="w-3.5 h-3.5 shrink-0 stroke-[1.8]" />
                  {!isSidebarCollapsed && (
                    <span className="truncate">{item.name}</span>
                  )}

                  {item.badgeCount && item.badgeCount > 0 ? (
                    <span
                      className={clsx(
                        "ml-auto text-[10px] font-mono font-medium px-1.5 py-0.2 rounded-xs",
                        isSidebarCollapsed
                          ? "absolute top-1 right-1 px-1 py-0 text-[9px] bg-rose-600 text-white"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
                      )}
                    >
                      {item.badgeCount}
                    </span>
                  ) : null}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Secondary Navigation */}
        <div>
          {!isSidebarCollapsed && (
            <p className="px-2.5 mb-1 text-[10px] font-mono font-medium tracking-wider text-txt-muted uppercase">
              Analytics & Logs
            </p>
          )}
          <nav className="space-y-0.5">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    clsx(
                      "flex items-center gap-2.5 px-2.5 py-1.5 rounded-xs text-xs font-medium transition-all select-none",
                      isActive
                        ? "bg-bg-secondary text-txt-primary font-semibold border-l-2 border-accent"
                        : "text-txt-muted hover:text-txt-primary hover:bg-surface-hover border-l-2 border-transparent",
                    )
                  }
                >
                  <Icon className="w-3.5 h-3.5 shrink-0 stroke-[1.8]" />
                  {!isSidebarCollapsed && (
                    <span className="truncate">{item.name}</span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer System Status Indicator */}
      {!isSidebarCollapsed && (
        <div className="p-2.5 border-t border-surface-border bg-bg-primary/50 text-[10px] text-txt-muted font-mono flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className={clsx(
                "w-1.5 h-1.5 rounded-full inline-block",
                isConnected ? "bg-emerald-500" : "bg-rose-500",
              )}
            />
            <span className="text-txt-secondary font-medium">
              System: {isConnected ? "Connected" : "Offline"}
            </span>
          </div>
          <span className="text-[9px]">v2.4.0</span>
        </div>
      )}
    </aside>
  );
};
