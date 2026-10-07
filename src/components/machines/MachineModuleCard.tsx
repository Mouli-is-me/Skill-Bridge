import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MachineModule } from '../../types/module';
import { Badge } from '../ui/Badge';
import { formatTimeAgo } from '../../utils/formatting';
import { ArrowRight, Activity, Thermometer, Radio, Cpu } from 'lucide-react';
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
      case 'MPU6050':
        return <Activity className="w-4 h-4 text-txt-secondary" />;
      case 'DS18B20':
        return <Thermometer className="w-4 h-4 text-txt-secondary" />;
      case 'LM393':
        return <Radio className="w-4 h-4 text-txt-secondary" />;
      default:
        return <Cpu className="w-4 h-4 text-txt-secondary" />;
    }
  };

  const getModuleDescription = () => {
    switch (module.type) {
      case 'MPU6050':
        return '6-Axis Acceleration & Gyroscope';
      case 'DS18B20':
        return '1-Wire Digital Temperature';
      case 'LM393':
        return 'Opto-Pulse Comparator';
      default:
        return 'Hardware Sensor';
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
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold font-mono uppercase tracking-wider text-txt-primary">
                  {module.name}
                </h4>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-bg-tertiary text-txt-muted">
                  HARDWARE
                </span>
              </div>
              <div className="text-[11px] font-mono text-txt-muted mt-0.5">
                Module: <span className="font-semibold text-txt-secondary">{module.id}</span>
              </div>
            </div>
          </div>

          <Badge status={statusLabel} size="sm">
            {statusLabel}
          </Badge>
        </div>

        <div className="text-[10px] font-mono text-txt-muted mt-2">
          {getModuleDescription()}
        </div>

        {/* Live Sensor Readings Table */}
        <div className="py-2.5 space-y-1.5 font-mono text-xs">
          {module.sensors.map((sensor) => {
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
                  {sensor.displayState ? (
                    sensor.displayState
                  ) : (
                    `${sensor.value} ${sensor.unit}`
                  )}
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
