import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMachineStore } from "../store/machineStore";
import { Badge } from "../components/ui/Badge";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";
import { formatTimeAgo } from "../utils/formatting";
import { downloadCSV } from "../utils/csvExport";
import {
  Search,
  Download,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { clsx } from "clsx";

export const AlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const { events, machines } = useMachineStore();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [machineFilter, setMachineFilter] = useState<string>("ALL");

  const filteredAlerts = useMemo(() => {
    return events.filter((e) => {
      const matchesSearch =
        e.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.machineId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.moduleName || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (e.moduleId || "").toLowerCase().includes(searchQuery.toLowerCase());

      const targetMachine = machines.find((m) => m.id === e.machineId);
      const isMachineOffline = targetMachine ? !targetMachine.isOnline : false;

      let matchesSeverity = true;
      if (severityFilter === "WARNING") matchesSeverity = e.severity === "WARNING";
      else if (severityFilter === "FAULT") matchesSeverity = e.severity === "ERROR";
      else if (severityFilter === "OFFLINE") matchesSeverity = isMachineOffline;

      const matchesMachine =
        machineFilter === "ALL" || e.machineId === machineFilter;

      return matchesSearch && matchesSeverity && matchesMachine;
    });
  }, [events, machines, searchQuery, severityFilter, machineFilter]);

  const severityOptions = [
    { label: "All Severities", value: "ALL" },
    { label: "Warning", value: "WARNING" },
    { label: "Fault", value: "FAULT" },
    { label: "Offline", value: "OFFLINE" },
  ];

  const machineOptions = [
    { label: "All Machines", value: "ALL" },
    ...machines.map((m) => ({ label: `${m.id} (${m.name})`, value: m.id })),
  ];

  const handleExportCSV = () => {
    const rows = filteredAlerts.map((e) => ({
      AlertID: e.id,
      Timestamp: e.timestamp,
      Severity: e.severity,
      MachineID: e.machineId,
      MachineName: e.machineName,
      ModuleID: e.moduleId || "",
      ModuleName: e.moduleName || "",
      Message: e.message,
      Value: e.value || "",
      Threshold: e.threshold || "",
      Unit: e.unit || "",
    }));
    downloadCSV(`skill_bridge_alerts_${Date.now()}.csv`, rows);
  };

  return (
    <div className="space-y-4">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface border border-surface-border p-3.5 rounded-md">
        <div>
          <h1 className="text-sm font-bold text-txt-primary tracking-tight font-mono">
            ACTIVE ALERTS & FAULTS
          </h1>
          <p className="text-[11px] text-txt-secondary font-mono">
            Operational warnings, threshold alarms, and hardware connectivity events
          </p>
        </div>

        <Button
          size="sm"
          variant="secondary"
          onClick={handleExportCSV}
          icon={<Download className="w-3.5 h-3.5" />}
          className="font-mono text-xs"
        >
          Export CSV
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-2 bg-surface border border-surface-border p-3 rounded-md">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-3.5 h-3.5 text-txt-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search alerts by message, module, machine..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface text-txt-primary border border-surface-border rounded-xs text-xs font-mono pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <Select
          options={severityOptions}
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
        />

        <Select
          options={machineOptions}
          value={machineFilter}
          onChange={(e) => setMachineFilter(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-txt-muted">
        <span>
          Showing {filteredAlerts.length} of {events.length} total events
        </span>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <div className="bg-surface border border-surface-border rounded-md p-8 text-center font-mono text-xs text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>No active alerts</span>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAlerts.map((alert) => {
            const isFault = alert.severity === "ERROR";
            const isWarning = alert.severity === "WARNING";

            const targetMachine = machines.find((m) => m.id === alert.machineId);
            const isOffline = targetMachine ? !targetMachine.isOnline : false;
            const currentState = targetMachine?.metrics.machineState || (targetMachine?.isOnline ? "Running" : "Offline");

            const statusLabel = isOffline
              ? "OFFLINE"
              : isFault
                ? "FAULT"
                : isWarning
                  ? "WARNING"
                  : "INFO";

            return (
              <div
                key={alert.id}
                className={clsx(
                  "bg-surface border rounded-md p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors",
                  isFault
                    ? "border-rose-500/30 bg-rose-500/5"
                    : isWarning
                      ? "border-amber-500/30 bg-amber-500/5"
                      : "border-surface-border",
                )}
              >
                {/* Left side details */}
                <div className="flex items-start gap-3">
                  <div className="mt-1 shrink-0">
                    {isFault ? (
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500" />
                    ) : isWarning ? (
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500" />
                    ) : isOffline ? (
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-400" />
                    ) : (
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500" />
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                      <Badge status={statusLabel} size="sm">
                        {statusLabel}
                      </Badge>
                      <span className="font-bold text-txt-primary">
                        {alert.machineId}
                      </span>
                      <span className="text-txt-muted">•</span>
                      <span className="font-semibold text-txt-secondary">
                        {alert.moduleName ||
                          (alert.metricName
                            ? `${alert.metricName.toUpperCase()} Module`
                            : "Component")}
                      </span>
                      {alert.moduleId && (
                        <span className="text-[10px] text-txt-muted">
                          ({alert.moduleId})
                        </span>
                      )}
                      <span className="text-txt-muted">•</span>
                      <span className="text-txt-muted text-[10px] font-sans">
                        State: {currentState}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-txt-primary">
                      {alert.message}
                    </p>

                    {alert.value !== undefined && (
                      <div className="text-[11px] font-mono text-txt-secondary flex items-center gap-3">
                        <span>
                          Measured:{" "}
                          <strong
                            className={
                              isFault
                                ? "text-rose-600 dark:text-rose-400 font-bold"
                                : isWarning
                                  ? "text-amber-600 dark:text-amber-400 font-bold"
                                  : "text-txt-primary"
                            }
                          >
                            {alert.value} {alert.unit || ""}
                          </strong>
                        </span>
                        {alert.threshold !== undefined && (
                          <span className="text-txt-muted">
                            (Limit: {alert.threshold} {alert.unit || ""})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side */}
                <div className="flex items-center justify-between md:justify-end gap-3 md:shrink-0 pt-1 md:pt-0 border-t md:border-t-0 border-surface-border font-mono text-xs">
                  <span className="text-[10px] text-txt-muted">
                    {formatTimeAgo(alert.timestamp)}
                  </span>

                  <button
                    onClick={() => {
                      if (alert.moduleId) {
                        navigate(
                          `/machines/${alert.machineId}/modules/${alert.moduleId}`,
                        );
                      } else {
                        navigate(`/machines/${alert.machineId}`);
                      }
                    }}
                    className="inline-flex items-center gap-1 font-semibold text-accent hover:text-accent-hover transition-colors px-2.5 py-1 rounded-xs hover:bg-surface-hover"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
