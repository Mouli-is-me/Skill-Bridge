import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Machine } from '../../types/machine';
import { Badge } from '../ui/Badge';
import { getMachineModuleStats } from '../../utils/moduleHelpers';
import { formatTimeAgo } from '../../utils/formatting';
import { ArrowRight, Thermometer, Activity, Gauge, Zap } from 'lucide-react';
import { clsx } from 'clsx';

interface DashboardMachineCardProps {
  machine: Machine;
}

export const DashboardMachineCard: React.FC<DashboardMachineCardProps> = ({ machine }) => {
  const navigate = useNavigate();
  const modules = machine.modules || [];
  const stats = getMachineModuleStats(modules);

  const isHealthy = stats.faults === 0 && stats.warnings === 0 && machine.isOnline;
  const isWarning = stats.warnings > 0 && stats.faults === 0;
  const isFault = stats.faults > 0;
  const isOffline = !machine.isOnline || machine.status === 'IDLE';

  const statusLabel = isFault 
    ? 'FAULT' 
    : isWarning 
    ? 'WARNING' 
    : isOffline 
    ? 'OFFLINE' 
    : 'HEALTHY';

  return (
    <div
      className={clsx(
        "bg-surface border rounded-lg p-4 flex flex-col justify-between transition-all hover:border-txt-muted/40 shadow-subtle",
        isFault ? "border-status-fault-border bg-status-fault-bg/10" :
        isWarning ? "border-status-warning-border bg-status-warning-bg/10" :
        "border-surface-border"
      )}
    >
      {/* Top row: ID, Name, Status */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-txt-primary">
                {machine.id}
              </span>
              <span className="text-[10px] font-mono text-txt-muted">
                {machine.type}
              </span>
            </div>
            <h4 className="text-xs font-semibold text-txt-secondary mt-0.5 truncate max-w-[180px]">
              {machine.name}
            </h4>
          </div>

          <Badge status={statusLabel} size="sm">
            {statusLabel}
          </Badge>
        </div>

        {/* Module Health Summary */}
        <div className="mt-3 py-1.5 px-2.5 rounded bg-bg-primary/70 border border-surface-border/50 flex items-center justify-between text-xs font-mono">
          <span className="text-txt-secondary text-[11px]">Modules</span>
          <span className={clsx(
            "font-bold text-[11px]",
            isFault ? "text-status-fault" : isWarning ? "text-status-warning" : "text-status-healthy"
          )}>
            {stats.healthy} / {stats.total} healthy
          </span>
        </div>

        {/* Live Telemetry Preview Chips */}
        <div className="grid grid-cols-2 gap-2 mt-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-txt-secondary">
            <Thermometer className="w-3.5 h-3.5 text-txt-muted shrink-0" />
            <span className={machine.metrics.temperature >= machine.thresholds.tempWarning ? "text-status-warning font-bold" : "text-txt-primary"}>
              {machine.metrics.temperature.toFixed(1)} °C
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-txt-secondary">
            <Activity className="w-3.5 h-3.5 text-txt-muted shrink-0" />
            <span className={machine.metrics.vibration >= machine.thresholds.vibWarning ? "text-status-warning font-bold" : "text-txt-primary"}>
              {machine.metrics.vibration.toFixed(2)} mm/s
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-txt-secondary">
            <Gauge className="w-3.5 h-3.5 text-txt-muted shrink-0" />
            <span className="text-txt-primary">
              {machine.metrics.rpm} RPM
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-txt-secondary">
            <Zap className="w-3.5 h-3.5 text-txt-muted shrink-0" />
            <span className="text-txt-primary">
              {machine.metrics.current.toFixed(1)} A
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Action & Timestamp */}
      <div className="mt-4 pt-3 border-t border-surface-border/60 flex items-center justify-between">
        <span className="text-[10px] font-mono text-txt-muted">
          {formatTimeAgo(machine.lastUpdated)}
        </span>

        <button
          onClick={() => navigate(`/machines/${machine.id}`)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover font-mono transition-colors"
        >
          <span>Open Machine</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
