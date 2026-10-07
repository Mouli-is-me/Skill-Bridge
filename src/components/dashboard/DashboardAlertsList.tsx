import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MachineEvent } from '../../types/event';
import { formatTimeAgo } from '../../utils/formatting';
import { AlertOctagon, AlertTriangle, Info, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

interface DashboardAlertsListProps {
  events: MachineEvent[];
  maxCount?: number;
}

export const DashboardAlertsList: React.FC<DashboardAlertsListProps> = ({ events, maxCount = 5 }) => {
  const navigate = useNavigate();

  // Filter for warning, error, info
  const displayEvents = events.slice(0, maxCount);

  if (displayEvents.length === 0) {
    return (
      <div className="bg-surface border border-surface-border rounded-lg p-6 text-center text-xs text-txt-muted font-mono">
        No active system alerts. All machines operating normally.
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {displayEvents.map((evt) => {
        const isFault = evt.severity === 'ERROR';
        const isWarning = evt.severity === 'WARNING';

        return (
          <div
            key={evt.id}
            className={clsx(
              "bg-surface border rounded-lg p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors shadow-subtle",
              isFault ? "border-status-fault-border/80 bg-status-fault-bg/20" :
              isWarning ? "border-status-warning-border/80 bg-status-warning-bg/20" :
              "border-surface-border"
            )}
          >
            {/* Left side: Icon, Machine/Module info, Message */}
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {isFault ? (
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-fault opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-status-fault"></span>
                  </span>
                ) : isWarning ? (
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-status-warning"></span>
                ) : (
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-status-info"></span>
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                  <span className="font-mono font-bold text-txt-primary">
                    {evt.machineId}
                  </span>
                  <span className="text-txt-muted font-mono">·</span>
                  <span className="font-semibold text-txt-secondary">
                    {evt.moduleName || (evt.metricName ? `${evt.metricName.toUpperCase()} Module` : 'Component')}
                  </span>
                  {evt.moduleId && (
                    <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-bg-tertiary text-txt-muted">
                      {evt.moduleId}
                    </span>
                  )}
                </div>

                <p className="text-xs text-txt-primary font-medium mt-0.5">
                  {evt.message}
                </p>

                {evt.value !== undefined && (
                  <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-txt-secondary">
                    <span>Measured: <strong className={isFault ? "text-status-fault" : isWarning ? "text-status-warning" : "text-txt-primary"}>{evt.value} {evt.unit || ''}</strong></span>
                    {evt.threshold !== undefined && (
                      <span className="text-txt-muted">(Threshold: {evt.threshold} {evt.unit || ''})</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right side: Timestamp & Action */}
            <div className="flex items-center justify-between sm:justify-end gap-3 sm:shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-surface-border/40 font-mono text-xs">
              <span className="text-[11px] text-txt-muted">
                {formatTimeAgo(evt.timestamp)}
              </span>

              <button
                onClick={() => {
                  if (evt.moduleId) {
                    navigate(`/machines/${evt.machineId}/modules/${evt.moduleId}`);
                  } else {
                    navigate(`/machines/${evt.machineId}`);
                  }
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover transition-colors px-2 py-1 rounded hover:bg-surface-hover"
              >
                <span>View Module</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
