import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMachineStore } from "../store/machineStore";
import { useSimulationStore } from "../store/simulationStore";
import { Badge } from "../components/ui/Badge";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";
import { getMachineModuleStats } from "../utils/moduleHelpers";
import { formatTimeAgo } from "../utils/formatting";
import {
  Search,
  LayoutGrid,
  Table as TableIcon,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { clsx } from "clsx";

export const MachinesPage: React.FC = () => {
  const navigate = useNavigate();
  const machines = useMachineStore((s) => s.machines);
  const updateSyncTime = useSimulationStore((s) => s.updateSyncTime);

  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [stateFilter, setStateFilter] = useState<string>("ALL");

  const filteredMachines = useMemo(() => {
    return machines.filter((m) => {
      const matchesSearch =
        m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.model.toLowerCase().includes(searchQuery.toLowerCase());

      const modules = m.modules || [];
      const stats = getMachineModuleStats(modules);

      let machineStatusCategory = "HEALTHY";
      if (!m.isOnline) machineStatusCategory = "OFFLINE";
      else if (stats.faults > 0 || m.status === "FAULT" || m.status === "ERROR") machineStatusCategory = "FAULT";
      else if (stats.warnings > 0 || m.status === "WARNING") machineStatusCategory = "WARNING";

      const matchesStatus =
        statusFilter === "ALL" || machineStatusCategory === statusFilter;

      const currentState = m.metrics.machineState || (m.isOnline ? "RUNNING" : "OFFLINE");
      const matchesState =
        stateFilter === "ALL" || currentState.toUpperCase() === stateFilter.toUpperCase();

      return matchesSearch && matchesStatus && matchesState;
    });
  }, [machines, searchQuery, statusFilter, stateFilter]);

  const statusOptions = [
    { label: "All Statuses", value: "ALL" },
    { label: "HEALTHY", value: "HEALTHY" },
    { label: "WARNING", value: "WARNING" },
    { label: "FAULT", value: "FAULT" },
    { label: "OFFLINE", value: "OFFLINE" },
  ];

  const stateOptions = [
    { label: "All States", value: "ALL" },
    { label: "Running", value: "RUNNING" },
    { label: "Idle", value: "IDLE" },
    { label: "Offline", value: "OFFLINE" },
  ];

  return (
    <div className="space-y-4">
      {/* Header & Controls Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface border border-surface-border p-3.5 rounded-md">
        <div>
          <h1 className="text-base font-bold text-txt-primary tracking-tight font-mono">
            FLEET MACHINES ({machines.length})
          </h1>
          <p className="text-[11px] text-txt-secondary font-mono">
            Real-time telemetry and module status for all factory machines
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-txt-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search ID, name, bay..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface text-txt-primary border border-surface-border rounded-xs text-xs font-mono pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />

          <Select
            options={stateOptions}
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
          />

          <Button
            size="sm"
            variant="secondary"
            onClick={updateSyncTime}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>

          {/* View Toggle */}
          <div className="flex bg-bg-secondary p-0.5 rounded-xs border border-surface-border">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1 rounded-xs text-xs transition-colors ${
                viewMode === "table"
                  ? "bg-surface text-txt-primary font-bold shadow-subtle"
                  : "text-txt-muted hover:text-txt-primary"
              }`}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1 rounded-xs text-xs transition-colors ${
                viewMode === "grid"
                  ? "bg-surface text-txt-primary font-bold shadow-subtle"
                  : "text-txt-muted hover:text-txt-primary"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Counter strip */}
      <div className="flex items-center justify-between text-[11px] font-mono text-txt-muted">
        <span>
          Showing {filteredMachines.length} of {machines.length} machines
        </span>
      </div>

      {filteredMachines.length === 0 ? (
        <div className="bg-surface border border-surface-border rounded-md p-8 text-center font-mono text-xs text-txt-muted">
          No machines match your search criteria.
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="bg-surface border border-surface-border rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-bg-secondary/60 border-b border-surface-border font-mono text-txt-muted text-[10px] uppercase tracking-wider">
                  <th className="py-2.5 px-3.5 font-semibold">Machine</th>
                  <th className="py-2.5 px-3.5 font-semibold">Status</th>
                  <th className="py-2.5 px-3.5 font-semibold">State</th>
                  <th className="py-2.5 px-3.5 font-semibold">Modules</th>
                  <th className="py-2.5 px-3.5 font-semibold">Temperature</th>
                  <th className="py-2.5 px-3.5 font-semibold">Vibration</th>
                  <th className="py-2.5 px-3.5 font-semibold">Last Update</th>
                  <th className="py-2.5 px-3.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border font-mono">
                {filteredMachines.map((m) => {
                  const modules = m.modules || [];
                  const stats = getMachineModuleStats(modules);
                  const isFault = stats.faults > 0 || m.status === "FAULT" || m.status === "ERROR";
                  const isWarning = stats.warnings > 0 && !isFault;
                  const isOffline = !m.isOnline;
                  const statusLabel = isOffline
                    ? "OFFLINE"
                    : isFault
                      ? "FAULT"
                      : isWarning
                        ? "WARNING"
                        : "HEALTHY";

                  const currentState = m.metrics.machineState || (m.isOnline ? "Running" : "Offline");

                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-surface-hover transition-colors cursor-pointer"
                      onClick={() => navigate(`/machines/${m.id}`)}
                    >
                      <td className="py-2.5 px-3.5 font-bold text-txt-primary">
                        <div className="flex items-center gap-1.5">
                          <span>{m.id}</span>
                          <span className="text-[10px] font-sans text-txt-muted font-normal">
                            ({m.name})
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3.5">
                        <Badge status={statusLabel} size="sm">
                          {statusLabel}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3.5 font-sans font-medium text-txt-secondary">
                        {currentState}
                      </td>
                      <td className="py-2.5 px-3.5 text-txt-secondary font-semibold">
                        {stats.healthy} / {stats.total}
                      </td>
                      <td
                        className={clsx(
                          "py-2.5 px-3.5 font-bold",
                          m.metrics.temperature >= m.thresholds.tempWarning
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-txt-primary",
                        )}
                      >
                        {m.metrics.temperature.toFixed(1)}°C
                      </td>
                      <td
                        className={clsx(
                          "py-2.5 px-3.5 font-bold",
                          m.metrics.vibration >= m.thresholds.vibWarning
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-txt-primary",
                        )}
                      >
                        {m.metrics.vibration.toFixed(3)}
                      </td>
                      <td className="py-2.5 px-3.5 text-txt-muted text-[11px]">
                        {formatTimeAgo(m.lastUpdated)}
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/machines/${m.id}`);
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
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredMachines.map((m) => {
            const modules = m.modules || [];
            const stats = getMachineModuleStats(modules);
            const isFault = stats.faults > 0 || m.status === "FAULT" || m.status === "ERROR";
            const isWarning = stats.warnings > 0 && !isFault;
            const isOffline = !m.isOnline;
            const statusLabel = isOffline
              ? "OFFLINE"
              : isFault
                ? "FAULT"
                : isWarning
                  ? "WARNING"
                  : "HEALTHY";

            return (
              <div
                key={m.id}
                className={clsx(
                  "bg-surface border rounded-md p-3.5 flex flex-col justify-between transition-all hover:border-surface-border/80",
                  isFault
                    ? "border-rose-500/30 bg-rose-500/5"
                    : isWarning
                      ? "border-amber-500/30 bg-amber-500/5"
                      : "border-surface-border",
                )}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono font-bold text-xs text-txt-primary">
                        {m.id}
                      </span>
                      <h4 className="text-xs font-semibold text-txt-secondary mt-0.5 truncate max-w-[160px]">
                        {m.name}
                      </h4>
                    </div>
                    <Badge status={statusLabel} size="sm">
                      {statusLabel}
                    </Badge>
                  </div>

                  <div className="mt-3 space-y-1 font-mono text-xs border-t border-b border-surface-border py-2">
                    <div className="flex justify-between text-txt-secondary">
                      <span>State</span>
                      <span className="font-semibold text-txt-primary font-sans">
                        {m.metrics.machineState || (m.isOnline ? "Running" : "Offline")}
                      </span>
                    </div>
                    <div className="flex justify-between text-txt-secondary">
                      <span>Modules</span>
                      <span className="font-semibold text-txt-primary">
                        {stats.healthy} / {stats.total} Healthy
                      </span>
                    </div>
                    <div className="flex justify-between text-txt-secondary">
                      <span>Temp</span>
                      <span className="font-semibold text-txt-primary">
                        {m.metrics.temperature.toFixed(1)}°C
                      </span>
                    </div>
                    <div className="flex justify-between text-txt-secondary">
                      <span>Vibration</span>
                      <span className="font-semibold text-txt-primary">
                        {m.metrics.vibration.toFixed(3)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 pt-1.5 flex items-center justify-between text-xs font-mono">
                  <span className="text-[10px] text-txt-muted">
                    {formatTimeAgo(m.lastUpdated)}
                  </span>
                  <button
                    onClick={() => navigate(`/machines/${m.id}`)}
                    className="inline-flex items-center gap-1 font-semibold text-accent hover:text-accent-hover transition-colors"
                  >
                    <span>Open</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
