import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMachineStore } from '../store/machineStore';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { formatTimeAgo } from '../utils/formatting';
import { downloadCSV } from '../utils/csvExport';
import { Search, Download, AlertOctagon, AlertTriangle, Info, ArrowRight, ShieldAlert } from 'lucide-react';
import { clsx } from 'clsx';

export const AlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const { events, machines } = useMachineStore();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [machineFilter, setMachineFilter] = useState<string>('ALL');

  const filteredAlerts = useMemo(() => {
    return events.filter((e) => {
      const matchesSearch =
        e.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.machineId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.moduleName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.moduleId || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSeverity = severityFilter === 'ALL' || e.severity === severityFilter;
      const matchesMachine = machineFilter === 'ALL' || e.machineId === machineFilter;

      return matchesSearch && matchesSeverity && matchesMachine;
    });
  }, [events, searchQuery, severityFilter, machineFilter]);

  const severityOptions = [
    { label: 'All Severities', value: 'ALL' },
    { label: 'CRITICAL FAULT', value: 'ERROR' },
    { label: 'WARNING', value: 'WARNING' },
    { label: 'INFORMATIONAL', value: 'INFO' },
  ];

  const machineOptions = [
    { label: 'All Machines', value: 'ALL' },
    ...machines.map((m) => ({ label: `${m.id} (${m.name})`, value: m.id }))
  ];

  const handleExportCSV = () => {
    const rows = filteredAlerts.map(e => ({
      AlertID: e.id,
      Timestamp: e.timestamp,
      Severity: e.severity,
      MachineID: e.machineId,
      MachineName: e.machineName,
      ModuleID: e.moduleId || '',
      ModuleName: e.moduleName || '',
      Message: e.message,
      Value: e.value || '',
      Threshold: e.threshold || '',
      Unit: e.unit || ''
    }));
    downloadCSV(`skill_bridge_alerts_${Date.now()}.csv`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border border-surface-border p-4 rounded-lg shadow-subtle">
        <div>
          <h2 className="text-base font-bold text-txt-primary tracking-tight font-mono">
            SYSTEM ALERTS & FAULTS
          </h2>
          <p className="text-xs text-txt-secondary font-mono">
            Real-time operational warnings and threshold violations audit log
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
      <div className="flex flex-wrap items-center gap-2.5 bg-surface border border-surface-border p-3 rounded-lg shadow-subtle">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-txt-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search alerts by message, module, machine..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bg-primary text-txt-primary border border-surface-border rounded text-xs font-mono pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <Select
          options={severityOptions}
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="text-xs"
        />

        <Select
          options={machineOptions}
          value={machineFilter}
          onChange={(e) => setMachineFilter(e.target.value)}
          className="text-xs max-w-[200px]"
        />
      </div>

      <div className="flex items-center justify-between text-xs font-mono text-txt-muted">
        <span>Showing {filteredAlerts.length} of {events.length} total events</span>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <div className="bg-surface border border-surface-border rounded-lg p-12 text-center font-mono text-xs text-txt-muted">
          No alerts or warnings match the specified criteria.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const isFault = alert.severity === 'ERROR';
            const isWarning = alert.severity === 'WARNING';

            return (
              <div
                key={alert.id}
                className={clsx(
                  "bg-surface border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors shadow-subtle",
                  isFault ? "border-status-fault-border bg-status-fault-bg/20" :
                  isWarning ? "border-status-warning-border bg-status-warning-bg/20" :
                  "border-surface-border"
                )}
              >
                {/* Left side details */}
                <div className="flex items-start gap-3.5">
                  <div className="mt-1 shrink-0">
                    {isFault ? (
                      <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-fault opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-status-fault"></span>
                      </span>
                    ) : isWarning ? (
                      <span className="inline-block w-3 h-3 rounded-full bg-status-warning"></span>
                    ) : (
                      <span className="inline-block w-3 h-3 rounded-full bg-status-info"></span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                      <span className="font-bold text-txt-primary px-1.5 py-0.5 rounded bg-bg-primary border border-surface-border">
                        {alert.machineId}
                      </span>
                      <span className="text-txt-muted">•</span>
                      <span className="font-semibold text-txt-secondary">
                        {alert.moduleName || (alert.metricName ? `${alert.metricName.toUpperCase()} Module` : 'Component')}
                      </span>
                      {alert.moduleId && (
                        <span className="text-[11px] text-txt-muted">
                          ({alert.moduleId})
                        </span>
                      )}
                      <Badge status={isFault ? 'FAULT' : isWarning ? 'WARNING' : 'INFO'} size="sm">
                        {isFault ? 'FAULT' : isWarning ? 'WARNING' : 'INFO'}
                      </Badge>
                    </div>

                    <p className="text-sm font-medium text-txt-primary">
                      {alert.message}
                    </p>

                    {alert.value !== undefined && (
                      <div className="text-xs font-mono text-txt-secondary flex items-center gap-3">
                        <span>
                          Measured: <strong className={isFault ? "text-status-fault font-bold" : isWarning ? "text-status-warning font-bold" : "text-txt-primary"}>{alert.value} {alert.unit || ''}</strong>
                        </span>
                        {alert.threshold !== undefined && (
                          <span className="text-txt-muted">
                            Threshold: {alert.threshold} {alert.unit || ''}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side timestamp and navigation */}
                <div className="flex items-center justify-between md:justify-end gap-4 md:shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-surface-border/50 font-mono text-xs">
                  <span className="text-[11px] text-txt-muted">
                    {formatTimeAgo(alert.timestamp)}
                  </span>

                  <button
                    onClick={() => {
                      if (alert.moduleId) {
                        navigate(`/machines/${alert.machineId}/modules/${alert.moduleId}`);
                      } else {
                        navigate(`/machines/${alert.machineId}`);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 font-semibold text-accent hover:text-accent-hover bg-bg-primary hover:bg-surface-hover px-3 py-1.5 rounded border border-surface-border transition-colors shadow-subtle"
                  >
                    <span>View Module</span>
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
