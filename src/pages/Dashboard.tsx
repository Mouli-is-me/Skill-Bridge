import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMachineStore } from "../store/machineStore";
import { useSimulationStore } from "../store/simulationStore";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { formatTimeAgo } from "../utils/formatting";
import { getMachineModuleStats } from "../utils/moduleHelpers";
import {
  ArrowRight,
  RefreshCw,
  Pause,
  Play,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Wifi,
  WifiOff,
  Clock,
} from "lucide-react";
import { clsx } from "clsx";
import { Machine } from "../types/machine";

const getNormalizedStatus = (machine: Machine): "HEALTHY" | "WARNING" | "FAULT" | "OFFLINE" => {
  if (!machine.isOnline) return "OFFLINE";
  const stats = getMachineModuleStats(machine.modules || []);
  if (stats.faults > 0 || machine.status === "ERROR" || machine.status === "FAULT") return "FAULT";
  if (stats.warnings > 0 || machine.status === "WARNING") return "WARNING";
  return "HEALTHY";
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { machines, events } = useMachineStore();
  const { isSimulating, toggleSimulation, lastSyncTime, updateSyncTime, connectionStatus } =
    useSimulationStore();
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const update = () =>
      setSecondsAgo(
        Math.max(
          0,
          Math.floor((Date.now() - new Date(lastSyncTime).getTime()) / 1000),
        ),
      );
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [lastSyncTime]);

  // Derived operational counts
  const totalMachines = machines.length;
  const runningCount = machines.filter(
    (m) => getNormalizedStatus(m) === "HEALTHY",
  ).length;
  const warningCount = machines.filter(
    (m) => getNormalizedStatus(m) === "WARNING",
  ).length;
  const faultCount = machines.filter(
    (m) => getNormalizedStatus(m) === "FAULT",
  ).length;
  const offlineCount = machines.filter(
    (m) => getNormalizedStatus(m) === "OFFLINE",
  ).length;

  // Machines requiring attention
  const attentionMachines = machines.filter(
    (m) => getNormalizedStatus(m) !== "HEALTHY",
  );

  // Connection indicator label
  const isConnected = connectionStatus === "LIVE" || connectionStatus === "DEGRADED";
  const connectionLabel = connectionStatus === "LIVE" ? "Connected" : connectionStatus === "DEGRADED" ? "Connecting" : "Disconnected";

  const recentEvents = events.slice(0, 5);

  return (
    <div className="space-y-5">
      {/* 1. Header */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-surface-border pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-txt-primary font-sans">
            Dashboard
          </h1>
          <p className="mt-0.5 text-xs text-txt-secondary font-mono">
            Real-time overview of factory machine health and activity.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* System Connectivity Badge */}
          <div
            className={clsx(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-xs border font-mono text-xs select-none",
              isConnected
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
            )}
          >
            {isConnected ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-rose-500" />
            )}
            <span className="font-semibold">{connectionLabel}</span>
            <span className="text-txt-muted text-[10px]">({secondsAgo}s)</span>
          </div>

          <Button
            size="sm"
            variant={isSimulating ? "outline" : "primary"}
            onClick={toggleSimulation}
            icon={
              isSimulating ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )
            }
          >
            {isSimulating ? "Pause Stream" : "Resume Stream"}
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={updateSyncTime}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Sync
          </Button>
        </div>
      </section>

      {/* 2. Overview Metrics */}
      <section className="grid grid-cols-2 gap-px overflow-hidden border border-surface-border bg-surface-border rounded-md sm:grid-cols-5 font-mono">
        <div className="bg-surface p-3.5">
          <div className="text-[10px] uppercase tracking-wider text-txt-muted">
            Total Machines
          </div>
          <div className="mt-1 text-2xl font-bold text-txt-primary">
            {totalMachines}
          </div>
          <div className="mt-0.5 text-[11px] text-txt-secondary font-sans">
            Fleet count
          </div>
        </div>

        <div className="bg-surface p-3.5">
          <div className="text-[10px] uppercase tracking-wider text-txt-muted">
            Running (Healthy)
          </div>
          <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {runningCount}
          </div>
          <div className="mt-0.5 text-[11px] text-txt-secondary font-sans">
            Nominal operation
          </div>
        </div>

        <div className="bg-surface p-3.5">
          <div className="text-[10px] uppercase tracking-wider text-txt-muted">
            Warning
          </div>
          <div className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {warningCount}
          </div>
          <div className="mt-0.5 text-[11px] text-txt-secondary font-sans">
            Threshold warnings
          </div>
        </div>

        <div className="bg-surface p-3.5">
          <div className="text-[10px] uppercase tracking-wider text-txt-muted">
            Fault
          </div>
          <div className="mt-1 text-2xl font-bold text-rose-600 dark:text-rose-400">
            {faultCount}
          </div>
          <div className="mt-0.5 text-[11px] text-txt-secondary font-sans">
            Critical alarms
          </div>
        </div>

        <div className="bg-surface p-3.5">
          <div className="text-[10px] uppercase tracking-wider text-txt-muted">
            Offline
          </div>
          <div className="mt-1 text-2xl font-bold text-slate-500 dark:text-slate-400">
            {offlineCount}
          </div>
          <div className="mt-0.5 text-[11px] text-txt-secondary font-sans">
            Disconnected
          </div>
        </div>
      </section>

      {/* Grid Layout: Machine Health Overview Table + Attention & Activity Sidebars */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* 3. Machine Health Overview Table */}
        <section className="bg-surface border border-surface-border rounded-md overflow-hidden space-y-0">
          <div className="flex items-center justify-between border-b border-surface-border px-4 py-3 bg-bg-secondary/40">
            <div>
              <h2 className="text-xs font-bold text-txt-primary uppercase font-mono tracking-wider">
                Machine Health Overview
              </h2>
              <p className="text-[11px] text-txt-secondary font-mono">
                Real-time status and sensor readings across all machines
              </p>
            </div>
            <button
              onClick={() => navigate("/machines")}
              className="text-xs font-semibold text-accent hover:underline font-mono"
            >
              View Directory →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-bg-secondary/60 border-b border-surface-border font-mono text-txt-muted text-[10px] uppercase tracking-wider">
                  <th className="py-2.5 px-3.5 font-semibold">Machine</th>
                  <th className="py-2.5 px-3.5 font-semibold">Status</th>
                  <th className="py-2.5 px-3.5 font-semibold">State</th>
                  <th className="py-2.5 px-3.5 font-semibold">Temperature</th>
                  <th className="py-2.5 px-3.5 font-semibold">Vibration</th>
                  <th className="py-2.5 px-3.5 font-semibold">Last Update</th>
                  <th className="py-2.5 px-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border font-mono">
                {machines.map((machine) => {
                  const normStatus = getNormalizedStatus(machine);
                  const isWarn = normStatus === "WARNING";
                  const isFlt = normStatus === "FAULT";

                  return (
                    <tr
                      key={machine.id}
                      onClick={() => navigate(`/machines/${machine.id}`)}
                      className={clsx(
                        "hover:bg-surface-hover transition-colors cursor-pointer",
                        isFlt
                          ? "bg-rose-500/5"
                          : isWarn
                            ? "bg-amber-500/5"
                            : "",
                      )}
                    >
                      <td className="py-2.5 px-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-txt-primary">
                            {machine.id}
                          </span>
                          <span className="text-[10px] text-txt-muted truncate max-w-[120px] font-sans">
                            {machine.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3.5">
                        <Badge status={normStatus} size="sm">
                          {normStatus}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3.5 font-sans font-medium text-txt-secondary">
                        {machine.metrics.machineState || (machine.isOnline ? "Running" : "Offline")}
                      </td>
                      <td
                        className={clsx(
                          "py-2.5 px-3.5 font-bold",
                          machine.metrics.temperature >= machine.thresholds.tempWarning
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-txt-primary",
                        )}
                      >
                        {machine.metrics.temperature.toFixed(1)}°C
                      </td>
                      <td
                        className={clsx(
                          "py-2.5 px-3.5 font-bold",
                          machine.metrics.vibration >= machine.thresholds.vibWarning
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-txt-primary",
                        )}
                      >
                        {machine.metrics.vibration.toFixed(3)}
                      </td>
                      <td className="py-2.5 px-3.5 text-txt-muted text-[11px]">
                        {formatTimeAgo(machine.lastUpdated)}
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/machines/${machine.id}`);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover px-2 py-0.5 rounded-xs hover:bg-surface-active transition-colors"
                        >
                          <span>Open</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Attention Section & Recent Activity */}
        <aside className="space-y-4">
          {/* 4. Attention Section */}
          <section className="bg-surface border border-surface-border rounded-md overflow-hidden">
            <div className="flex items-center justify-between border-b border-surface-border px-3.5 py-2.5 bg-bg-secondary/40">
              <h2 className="text-xs font-bold text-txt-primary uppercase font-mono tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>Machines Requiring Attention</span>
              </h2>
              <span className="text-[10px] font-mono text-txt-muted">
                {attentionMachines.length} Asset{attentionMachines.length !== 1 ? "s" : ""}
              </span>
            </div>

            {attentionMachines.length === 0 ? (
              <div className="p-4 text-center text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>No machines require attention</span>
              </div>
            ) : (
              <div className="divide-y divide-surface-border">
                {attentionMachines.map((m) => {
                  const normStatus = getNormalizedStatus(m);
                  return (
                    <div
                      key={m.id}
                      onClick={() => navigate(`/machines/${m.id}`)}
                      className="p-3 hover:bg-surface-hover transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className="font-bold text-txt-primary">
                            {m.id}
                          </span>
                          <Badge status={normStatus} size="sm">
                            {normStatus}
                          </Badge>
                        </div>
                        <div className="text-[11px] font-sans text-txt-secondary mt-0.5">
                          Temp: {m.metrics.temperature.toFixed(1)}°C • Vib: {m.metrics.vibration.toFixed(2)}
                        </div>
                      </div>

                      <ArrowRight className="w-3.5 h-3.5 text-accent" />
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* 5. Recent Activity */}
          <section className="bg-surface border border-surface-border rounded-md overflow-hidden">
            <div className="flex items-center justify-between border-b border-surface-border px-3.5 py-2.5 bg-bg-secondary/40">
              <h2 className="text-xs font-bold text-txt-primary uppercase font-mono tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-txt-muted" />
                <span>Recent Activity</span>
              </h2>
              <button
                onClick={() => navigate("/events")}
                className="text-[10px] font-mono text-accent hover:underline uppercase"
              >
                View Log
              </button>
            </div>

            {recentEvents.length === 0 ? (
              <div className="p-4 text-center text-xs font-mono text-txt-muted">
                No recent activity recorded.
              </div>
            ) : (
              <div className="divide-y divide-surface-border">
                {recentEvents.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => navigate(`/machines/${evt.machineId}`)}
                    className="p-3 hover:bg-surface-hover transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] text-txt-muted">
                      <span className="font-bold text-txt-primary">
                        {evt.machineId}
                      </span>
                      <span>{formatTimeAgo(evt.timestamp)}</span>
                    </div>
                    <p className="text-xs text-txt-secondary mt-0.5 truncate font-sans">
                      {evt.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
};
