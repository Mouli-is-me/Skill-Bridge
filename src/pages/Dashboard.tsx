import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronRight,
  CircleSlash,
  Gauge,
  Pause,
  Play,
  RefreshCw,
  Thermometer,
  Workflow,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMachineStore } from "../store/machineStore";
import { useSimulationStore } from "../store/simulationStore";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { formatTimeAgo } from "../utils/formatting";
import { getMachineModuleStats } from "../utils/moduleHelpers";
import { clsx } from "clsx";
import { Machine } from "../types/machine";

const getStatus = (machine: Pick<Machine, "isOnline" | "modules">) => {
  const stats = getMachineModuleStats(machine.modules || []);
  if (!machine.isOnline) return "OFFLINE";
  if (stats.faults > 0) return "FAULT";
  if (stats.warnings > 0) return "WARNING";
  return "RUNNING";
};

const stateSurface = (status: string) =>
  ({
    RUNNING: "border-status-healthy-border bg-status-healthy-bg",
    WARNING: "border-status-warning-border bg-status-warning-bg",
    FAULT: "border-status-fault-border bg-status-fault-bg",
    OFFLINE: "border-status-offline-border bg-status-offline-bg",
  })[status] || "border-surface-border bg-surface";

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const machines = useMachineStore((s) => s.machines);
  const events = useMachineStore((s) => s.events);
  const { isSimulating, toggleSimulation, lastSyncTime, updateSyncTime } =
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

  const onlineCount = machines.filter((machine) => machine.isOnline).length;
  const warningCount = machines.filter(
    (machine) => getStatus(machine) === "WARNING",
  ).length;
  const faultCount = machines.filter(
    (machine) => getStatus(machine) === "FAULT",
  ).length;
  const throughput = Math.round(
    machines.reduce((total, machine) => total + machine.metrics.production, 0),
  );
  const utilization = Math.round(
    machines.reduce(
      (total, machine) => total + machine.metrics.utilization,
      0,
    ) / Math.max(machines.length, 1),
  );
  const bottleneck = useMemo(
    () =>
      [...machines].sort(
        (a, b) => b.metrics.utilization - a.metrics.utilization,
      )[0],
    [machines],
  );
  const recentEvents = events.slice(0, 5);

  return (
    <div className="max-w-[1600px] mx-auto space-y-5">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between border-b border-surface-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold tracking-[0.2em] text-accent uppercase">
            <Workflow className="w-3.5 h-3.5" /> Live production line
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-txt-primary">
            Control room
          </h2>
          <p className="mt-1 text-sm text-txt-secondary">
            Line 01 operational overview and current asset condition.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="mr-2 hidden text-right sm:block">
            <div className="text-[10px] font-mono uppercase tracking-wider text-txt-muted">
              Telemetry sync
            </div>
            <div className="text-xs font-mono text-txt-secondary">
              {secondsAgo === 0 ? "just now" : `${secondsAgo}s ago`}
            </div>
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
            {isSimulating ? "Pause stream" : "Resume stream"}
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
      <section className="grid grid-cols-2 gap-px overflow-hidden border border-surface-border bg-surface-border sm:grid-cols-4 lg:grid-cols-6">
        {[
          [
            "Line status",
            `${onlineCount}/${machines.length}`,
            "assets online",
            "text-status-healthy",
          ],
          ["Throughput", `${throughput}`, "units / hour", "text-txt-primary"],
          [
            "Utilization",
            `${utilization}%`,
            "current average",
            "text-txt-primary",
          ],
          [
            "Bottleneck",
            bottleneck?.id || "--",
            bottleneck
              ? `${Math.round(bottleneck.metrics.utilization)}% utilization`
              : "no data",
            "text-status-warning",
          ],
          [
            "Warnings",
            `${warningCount}`,
            "requiring review",
            "text-status-warning",
          ],
          [
            "Faults",
            `${faultCount}`,
            "active faults",
            faultCount ? "text-status-fault" : "text-txt-primary",
          ],
        ].map(([label, value, detail, tone]) => (
          <div key={label} className="bg-surface px-4 py-3.5">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-txt-muted">
              {label}
            </div>
            <div
              className={clsx(
                "mt-1 text-xl font-semibold font-mono tracking-tight",
                tone,
              )}
            >
              {value}
            </div>
            <div className="mt-0.5 text-[11px] text-txt-secondary">
              {detail}
            </div>
          </div>
        ))}
      </section>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        <section className="border border-surface-border bg-surface">
          <div className="flex flex-col gap-3 border-b border-surface-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-txt-primary">
                  Production line
                </h3>
                <Badge status="LIVE" size="sm">
                  LIVE
                </Badge>
              </div>
              <p className="mt-1 text-xs text-txt-secondary">
                Material flow, buffer pressure, and machine state
              </p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-wider text-txt-muted">
              <span className="flex items-center gap-1.5">
                <i className="h-2 w-2 rounded-full bg-status-healthy" /> running
              </span>
              <span className="flex items-center gap-1.5">
                <i className="h-2 w-2 rounded-full bg-status-warning" />{" "}
                attention
              </span>
              <span className="flex items-center gap-1.5">
                <i className="h-2 w-2 rounded-full bg-status-fault" /> fault
              </span>
            </div>
          </div>
          <div className="industrial-grid overflow-x-auto p-5 sm:p-8">
            <div className="flex min-w-[760px] items-stretch gap-0">
              {machines.map((machine, index) => {
                const status = getStatus(machine);
                return (
                  <React.Fragment key={machine.id}>
                    <button
                      onClick={() => navigate(`/machines/${machine.id}`)}
                      className={clsx(
                        "group relative w-[132px] shrink-0 border p-3 text-left transition-colors hover:border-accent",
                        stateSurface(status),
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-mono text-xs font-bold text-txt-primary">
                          {machine.id}
                        </span>
                        <span
                          className={clsx(
                            "h-2 w-2 rounded-full",
                            status === "RUNNING"
                              ? "bg-status-healthy"
                              : status === "WARNING"
                                ? "bg-status-warning"
                                : status === "FAULT"
                                  ? "bg-status-fault"
                                  : "bg-status-offline",
                          )}
                        />
                      </div>
                      <div className="mt-2 truncate text-xs font-semibold text-txt-primary">
                        {machine.name
                          .replace("Air-Jet ", "")
                          .replace("Compact ", "")}
                      </div>
                      <div className="mt-4 space-y-1.5 font-mono text-[10px] text-txt-secondary">
                        <div className="flex justify-between">
                          <span>UTIL</span>
                          <strong className="text-txt-primary">
                            {Math.round(machine.metrics.utilization)}%
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span>OUT</span>
                          <strong className="text-txt-primary">
                            {machine.metrics.production}/h
                          </strong>
                        </div>
                        <div className="mt-2 h-1 bg-black/10 dark:bg-white/10">
                          <div
                            className={clsx(
                              "h-full",
                              status === "FAULT"
                                ? "bg-status-fault"
                                : status === "WARNING"
                                  ? "bg-status-warning"
                                  : "bg-status-healthy",
                            )}
                            style={{
                              width: `${Math.min(100, machine.metrics.utilization)}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="mt-3 text-[9px] font-mono font-bold uppercase tracking-wider text-txt-secondary">
                        {status}
                      </div>
                    </button>
                    {index < machines.length - 1 && (
                      <div className="flex w-[68px] shrink-0 flex-col items-center justify-center">
                        <div className="h-px w-full bg-accent/50" />
                        <div className="-mt-1 flex items-center gap-1 text-[9px] font-mono text-txt-muted">
                          <span className="h-2 w-2 border border-accent bg-surface" />{" "}
                          BUF {index + 1}
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          <div className="grid border-t border-surface-border sm:grid-cols-3">
            <div className="border-b border-surface-border px-4 py-3 sm:border-b-0 sm:border-r">
              <div className="text-[10px] font-mono uppercase tracking-wider text-txt-muted">
                Line input
              </div>
              <div className="mt-1 font-mono text-sm font-semibold">
                {throughput + 18} units/h
              </div>
            </div>
            <div className="border-b border-surface-border px-4 py-3 sm:border-b-0 sm:border-r">
              <div className="text-[10px] font-mono uppercase tracking-wider text-txt-muted">
                Flow condition
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm font-semibold">
                <span className="h-2 w-2 rounded-full bg-status-warning" /> M-03
                constraining
              </div>
            </div>
            <div className="px-4 py-3">
              <div className="text-[10px] font-mono uppercase tracking-wider text-txt-muted">
                Last event
              </div>
              <div className="mt-1 truncate text-sm font-semibold">
                {events[0]?.message || "No active events"}
              </div>
            </div>
          </div>
        </section>
        <aside className="space-y-5">
          <section className="border border-surface-border bg-surface">
            <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
              <h3 className="text-sm font-semibold">Line condition</h3>
              <Gauge className="h-4 w-4 text-accent" />
            </div>
            <div className="space-y-4 p-4">
              <div>
                <div className="flex justify-between text-xs">
                  <span className="text-txt-secondary">
                    Overall utilization
                  </span>
                  <strong className="font-mono">{utilization}%</strong>
                </div>
                <div className="mt-2 h-1.5 bg-bg-tertiary">
                  <div
                    className="h-full bg-accent"
                    style={{ width: `${utilization}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs">
                  <span className="text-txt-secondary">
                    Bottleneck pressure
                  </span>
                  <strong className="font-mono text-status-warning">
                    {bottleneck
                      ? Math.round(bottleneck.metrics.utilization)
                      : 0}
                    %
                  </strong>
                </div>
                <div className="mt-2 h-1.5 bg-bg-tertiary">
                  <div
                    className="h-full bg-status-warning"
                    style={{
                      width: `${bottleneck?.metrics.utilization || 0}%`,
                    }}
                  />
                </div>
              </div>
              <div className="border-t border-surface-border pt-3">
                <div className="flex items-start gap-2">
                  <Thermometer className="mt-0.5 h-4 w-4 text-status-warning" />
                  <div>
                    <div className="text-xs font-semibold">
                      M-03 thermal rise
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-txt-secondary">
                      Temperature is above the warning threshold and reducing
                      available capacity.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate("/machines/M-03")}
              className="flex w-full items-center justify-between border-t border-surface-border px-4 py-3 text-xs font-semibold text-accent hover:bg-surface-hover"
            >
              Inspect bottleneck <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </section>
          +{" "}
          <section className="border border-surface-border bg-surface">
            <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
              <h3 className="text-sm font-semibold">Recent events</h3>
              <button
                onClick={() => navigate("/events")}
                className="text-[10px] font-mono uppercase tracking-wider text-accent"
              >
                View log
              </button>
            </div>
            <div className="divide-y divide-surface-border">
              {recentEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => navigate(`/machines/${event.machineId}`)}
                  className="flex w-full gap-3 px-4 py-3 text-left hover:bg-surface-hover"
                >
                  <span
                    className={clsx(
                      "mt-1 h-2 w-2 shrink-0 rounded-full",
                      event.severity === "ERROR"
                        ? "bg-status-fault"
                        : event.severity === "WARNING"
                          ? "bg-status-warning"
                          : "bg-status-info",
                    )}
                  />
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 text-[10px] font-mono text-txt-muted">
                      <strong className="text-txt-primary">
                        {event.machineId}
                      </strong>
                      {formatTimeAgo(event.timestamp)}
                    </span>
                    <span className="mt-1 block truncate text-xs text-txt-secondary">
                      {event.message}
                    </span>
                  </span>
                </button>
              ))}
              {!recentEvents.length && (
                <div className="p-5 text-xs text-txt-muted">
                  No events recorded.
                </div>
              )}
            </div>
          </section>
        </aside>
        +{" "}
      </div>
      + +{" "}
      <section className="flex flex-col gap-3 border border-surface-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <CircleSlash className="h-4 w-4 text-txt-muted" />
          <div>
            <div className="text-xs font-semibold">Need a deeper view?</div>
            <div className="text-[11px] text-txt-secondary">
              Open the fleet table for sensor-level condition and module
              availability.
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate("/machines")}
          className="flex items-center gap-1 text-xs font-semibold text-accent"
        >
          Open fleet directory <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </section>
      +{" "}
    </div>
  );
};
