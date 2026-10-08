import React, { useState, useEffect } from "react";
import { useLocation, NavLink } from "react-router-dom";
import { Bell, Sun, Moon, Radio } from "lucide-react";
import { useSimulationStore } from "../../store/simulationStore";
import { useMachineStore } from "../../store/machineStore";
import { useUIStore } from "../../store/uiStore";

export const TopBar: React.FC = () => {
  const location = useLocation();
  const { lastSyncTime } = useSimulationStore();
  const { theme, toggleTheme } = useUIStore();
  const machines = useMachineStore((s) => s.machines);
  const events = useMachineStore((s) => s.events);

  const m01Hardware = machines.find((m) => m.id === "M-01" || m.id === "M01");

  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const updateTimeAgo = () => {
      const diffMs = Date.now() - new Date(lastSyncTime).getTime();
      setSecondsAgo(Math.max(0, Math.floor(diffMs / 1000)));
    };

    updateTimeAgo();
    const timer = setInterval(updateTimeAgo, 1000);
    return () => clearInterval(timer);
  }, [lastSyncTime]);

  const activeAlertsCount = events.filter(
    (e) => e.severity === "ERROR" || e.severity === "WARNING",
  ).length;

  const getBreadcrumb = (path: string) => {
    if (path.startsWith("/dashboard"))
      return { section: "Overview", title: "Control Room" };
    if (path.includes("/modules/"))
      return { section: "Machines", title: "Module Inspection" };
    if (path.startsWith("/modules"))
      return { section: "Monitoring", title: "All Sub-Systems" };
    if (path.startsWith("/machines/"))
      return { section: "Fleet", title: "Machine Intelligence" };
    if (path.startsWith("/machines"))
      return { section: "Fleet", title: "Machine Directory" };
    if (path.startsWith("/alerts"))
      return { section: "System", title: "Active Alerts" };
    if (path.startsWith("/events"))
      return { section: "System", title: "Event Audit Log" };
    if (path.startsWith("/analytics"))
      return { section: "Analysis", title: "OEE Intelligence" };
    if (path.startsWith("/compare"))
      return { section: "Analysis", title: "Multi-Asset Compare" };
    if (path.startsWith("/reports"))
      return { section: "Analysis", title: "Shift Reports" };
    if (path.startsWith("/settings"))
      return { section: "System", title: "Platform Settings" };
    return { section: "Monitoring", title: "Industrial System" };
  };

  const breadcrumb = getBreadcrumb(location.pathname);

  return (
    <header className="h-13 bg-surface border-b border-surface-border px-4 sm:px-6 flex items-center justify-between z-20 shrink-0 select-none">
      {/* Page Title & Breadcrumb */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-mono text-txt-muted hidden sm:inline">
          {breadcrumb.section} /
        </span>
        <h1 className="text-sm font-semibold text-txt-primary tracking-tight">
          {breadcrumb.title}
        </h1>
      </div>

      {/* Right Live Telemetry & Quick Action Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Connection Chain Indicators */}
        <div className="hidden lg:flex items-center gap-2.5 bg-bg-primary px-2.5 py-1 rounded-xs border border-surface-border font-mono text-[10px]">
          <div className="flex items-center gap-1.5" title="ESP32 Microcontroller Link">
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                m01Hardware?.hardwareState?.espConnected ? "bg-emerald-500" : "bg-slate-400"
              }`}
            />
            <span className="text-txt-muted">ESP32</span>
          </div>

          <span className="text-surface-border">│</span>

          <div className="flex items-center gap-1.5" title="Backend WebSocket Connection">
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                m01Hardware?.hardwareState?.backendConnected ? "bg-emerald-500" : "bg-slate-400"
              }`}
            />
            <span className="text-txt-muted">Backend</span>
          </div>

          <span className="text-surface-border">│</span>

          <div className="flex items-center gap-1.5" title="M01 Telemetry">
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                m01Hardware?.isOnline ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
            <span className="text-txt-secondary font-medium">M01</span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-txt-muted">
          <Radio className="w-3 h-3 text-emerald-500" />
          <span>SYNC {secondsAgo}s</span>
        </div>

        <div className="h-3.5 w-[1px] bg-surface-border hidden sm:block" />

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-xs text-txt-secondary hover:text-txt-primary hover:bg-surface-hover transition-colors"
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
        >
          {theme === "dark" ? (
            <Sun className="w-3.5 h-3.5" />
          ) : (
            <Moon className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Alerts Bell Link */}
        <NavLink
          to="/alerts"
          className="relative p-1.5 rounded-xs text-txt-secondary hover:text-txt-primary hover:bg-surface-hover transition-colors"
          title="View Active Alerts"
        >
          <Bell className="w-3.5 h-3.5" />
          {activeAlertsCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-1 bg-rose-600 text-white text-[8px] font-mono font-bold rounded-full flex items-center justify-center">
              {activeAlertsCount > 99 ? "99+" : activeAlertsCount}
            </span>
          )}
        </NavLink>
      </div>
    </header>
  );
};
