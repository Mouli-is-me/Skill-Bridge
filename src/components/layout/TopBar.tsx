import React, { useState, useEffect } from "react";
import { useLocation, NavLink } from "react-router-dom";
import { Bell, Sun, Moon, Radio } from "lucide-react";
import { Badge } from "../ui/Badge";
import { useSimulationStore } from "../../store/simulationStore";
import { useMachineStore } from "../../store/machineStore";
import { useUIStore } from "../../store/uiStore";

export const TopBar: React.FC = () => {
  const location = useLocation();
  const { connectionStatus, lastSyncTime } = useSimulationStore();
  const { theme, toggleTheme } = useUIStore();
  const machines = useMachineStore((s) => s.machines);
  const events = useMachineStore((s) => s.events);

  const m01Hardware = machines.find((m) => m.id === "M-01" || m.id === "M01");

  // Real-time seconds counter since last sync
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
      return { section: "Overview", title: "Control room" };
    if (path.includes("/modules/"))
      return { section: "Machines", title: "Module Details & Management" };
    if (path.startsWith("/modules"))
      return { section: "Monitoring", title: "All Modules" };
    if (path.startsWith("/machines/"))
      return { section: "Fleet", title: "Machine Details" };
    if (path.startsWith("/machines"))
      return { section: "Fleet", title: "Machines Directory" };
    if (path.startsWith("/alerts"))
      return { section: "System", title: "Alerts" };
    if (path.startsWith("/events"))
      return { section: "System", title: "Event log" };
    if (path.startsWith("/analytics"))
      return { section: "Analysis", title: "Performance" };
    if (path.startsWith("/compare"))
      return { section: "Analysis", title: "Compare assets" };
    if (path.startsWith("/reports"))
      return { section: "Analysis", title: "Reports" };
    if (path.startsWith("/settings"))
      return { section: "System", title: "Settings" };
    return { section: "Monitoring", title: "Industrial System" };
  };

  const breadcrumb = getBreadcrumb(location.pathname);

  return (
    <header className="h-16 bg-surface border-b border-surface-border px-4 sm:px-6 lg:px-8 flex items-center justify-between z-20 shrink-0">
      {/* Page Title & Breadcrumb */}
      <div className="flex items-center gap-2.5">
        <span className="text-[10px] font-mono font-bold text-txt-muted uppercase tracking-wider hidden sm:inline">
          {breadcrumb.section} /
        </span>
        <h1 className="text-base sm:text-lg font-semibold text-txt-primary tracking-tight">
          {breadcrumb.title}
        </h1>
      </div>

      {/* Right Live Status & Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Real Hardware Connection Chain Indicators */}
        <div className="hidden sm:flex items-center gap-3 bg-bg-primary px-3 py-1.5 rounded-sm border border-surface-border font-mono text-[10px]">
          {/* ESP32 Indicator */}
          <div
            className="flex items-center gap-1.5"
            title="Physical ESP32 Microcontroller Status"
          >
            <span
              className={`inline-block h-2 w-2 rounded-full ${m01Hardware?.hardwareState?.espConnected ? "bg-status-healthy animate-pulse" : "bg-status-fault"}`}
            />
            <span className="text-txt-secondary">ESP32</span>
            <span
              className={
                m01Hardware?.hardwareState?.espConnected
                  ? "text-status-healthy font-bold"
                  : "text-txt-muted"
              }
            >
              {m01Hardware?.hardwareState?.espConnected
                ? "Connected"
                : "Disconnected"}
            </span>
          </div>

          <span className="text-txt-muted opacity-50">│</span>

          {/* Backend Indicator */}
          <div
            className="flex items-center gap-1.5"
            title="FastAPI Backend WebSocket Connection"
          >
            <span
              className={`inline-block h-2 w-2 rounded-full ${m01Hardware?.hardwareState?.backendConnected ? "bg-status-healthy animate-pulse" : "bg-status-fault"}`}
            />
            <span className="text-txt-secondary">Backend</span>
            <span
              className={
                m01Hardware?.hardwareState?.backendConnected
                  ? "text-status-healthy font-bold"
                  : "text-txt-muted"
              }
            >
              {m01Hardware?.hardwareState?.backendConnected
                ? "Connected"
                : "Disconnected"}
            </span>
          </div>

          <span className="text-txt-muted opacity-50">│</span>

          {/* M01 Status Indicator */}
          <div
            className="flex items-center gap-1.5"
            title="Machine M01 Hardware Telemetry Status"
          >
            <span
              className={`inline-block h-2 w-2 rounded-full ${m01Hardware?.isOnline ? "bg-status-healthy animate-pulse" : "bg-status-fault"}`}
            />
            <span className="text-txt-secondary">M01</span>
            <span
              className={
                m01Hardware?.isOnline
                  ? "text-status-healthy font-bold"
                  : "text-status-fault font-bold"
              }
            >
              {m01Hardware?.isOnline ? "Live" : "Offline"}
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-txt-secondary">
          <Radio className="w-3.5 h-3.5 text-status-healthy" /> LIVE TELEMETRY
        </div>
        <div className="h-4 w-[1px] bg-surface-border hidden sm:block" />

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded text-txt-secondary hover:text-txt-primary hover:bg-surface-hover transition-colors"
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        {/* Alerts Bell Link */}
        <NavLink
          to="/alerts"
          className="relative p-1.5 rounded text-txt-secondary hover:text-txt-primary hover:bg-surface-hover transition-colors"
          title="View Alerts"
        >
          <Bell className="w-4 h-4" />
          {activeAlertsCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 bg-status-fault text-white text-[9px] font-mono font-bold rounded-full flex items-center justify-center border border-surface">
              {activeAlertsCount > 99 ? "99+" : activeAlertsCount}
            </span>
          )}
        </NavLink>
      </div>
    </header>
  );
};
