import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MachineModule } from '../../types/module';
import { Badge } from '../ui/Badge';
import { formatTimeAgo } from '../../utils/formatting';
import { ArrowRight, Activity, Thermometer, Gauge, Zap, Wind } from 'lucide-react';
import { clsx } from 'clsx';

interface MachineModuleCardProps {
  module: MachineModule;
  machineId: string;
}

export const MachineModuleCard: React.FC<MachineModuleCardProps> = ({ module, machineId }) => {
  const navigate = useNavigate();

  const isFault = module.status === 'FAULT';
  const isWarning = module.status === 'WARNING';
  const isOffline = module.status === 'OFFLINE' || !module.config.enabled;

  const statusLabel = isFault 
    ? 'FAULT' 
    : isWarning 
    ? 'WARNING' 
    : isOffline 
    ? 'OFFLINE' 
    : 'HEALTHY';

  const getModuleIcon = () => {
    switch (module.type) {
      case 'Motor':
      case 'Spindle':
        return <Gauge className="w-4 h-4 text-txt-secondary" />;
      case 'Vibration':
        return <Activity className="w-4 h-4 text-txt-secondary" />;
      case 'Temperature':
        return <Thermometer className="w-4 h-4 text-txt-secondary" />;
      case 'Drive':
      case 'Drafting':
        return <Zap className="w-4 h-4 text-txt-secondary" />;
      default:
        return <Wind className="w-4 h-4 text-txt-secondary" />;
    }
  };

  return (
    <div
      className={clsx(
        "bg-surface border rounded-lg p-4 flex flex-col justify-between transition-all shadow-subtle hover:border-txt-muted/50",
        isFault ? "border-status-fault-border bg-status-fault-bg/10" :
        isWarning ? "border-status-warning-border bg-status-warning-bg/10" :
        "border-surface-border"
      )}
    >
      <div>
        {/* Module Header */}
        <div className="flex items-start justify-between pb-3 border-b border-surface-border/60">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded bg-bg-primary border border-surface-border/70 mt-0.5">
              {getModuleIcon()}
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-txt-primary">
                {module.name}
              </h4>
              <div className="text-[11px] font-mono text-txt-muted mt-0.5">
                Module: <span className="font-semibold text-txt-secondary">{module.id}</span>
              </div>
            </div>
          </div>

          <Badge status={statusLabel} size="sm">
            {statusLabel}
          </Badge>
        </div>

        {/* Live Sensor Readings Table */}
        <div className="py-3 space-y-2 font-mono text-xs">
          {module.sensors.slice(0, 4).map((sensor) => {
            const isSensorWarn = sensor.status === 'WARNING';
            const isSensorFault = sensor.status === 'FAULT';

            return (
              <div
                key={sensor.id}
                className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-bg-primary/50 transition-colors"
              >
                <span className="text-txt-secondary text-[11px] truncate max-w-[140px]">
                  {sensor.name}
                </span>

                <span className={clsx(
                  "font-bold text-[11px]",
                  isSensorFault ? "text-status-fault" :
                  isSensorWarn ? "text-status-warning" :
                  "text-txt-primary"
                )}>
                  {sensor.value} {sensor.unit}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer: Last Update & View Details */}
      <div className="pt-3 border-t border-surface-border/60 flex items-center justify-between font-mono text-xs">
        <span className="text-[10px] text-txt-muted">
          Last update {formatTimeAgo(module.lastUpdated)}
        </span>

        <button
          onClick={() => navigate(`/machines/${machineId}/modules/${module.id}`)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover transition-colors px-2.5 py-1 rounded hover:bg-surface-active"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
