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
        return <Activity className="w-3.5 h-3.5 text-txt-secondary" />;
      case 'DS18B20':
        return <Thermometer className="w-3.5 h-3.5 text-txt-secondary" />;
      case 'LM393':
        return <Radio className="w-3.5 h-3.5 text-txt-secondary" />;
      default:
        return <Cpu className="w-3.5 h-3.5 text-txt-secondary" />;
    }
  };

  const getModuleDescription = () => {
    switch (module.type) {
      case 'MPU6050':
        return '6-Axis Accelerometer & Vibration';
      case 'DS18B20':
        return '1-Wire Digital Temp Sensor';
      case 'LM393':
        return 'Digital Vibration Sensor Module';
      default:
        return 'Hardware Sensor';
    }
  };

  const displayName = module.type === 'LM393' ? 'Digital Vibration Sensor' : module.name;

  return (
    <div
      className={clsx(
        "bg-surface border rounded-md p-3 flex flex-col justify-between transition-all",
        isFault ? "border-rose-500/30 bg-rose-500/5" :
        isWarning ? "border-amber-500/30 bg-amber-500/5" :
        "border-surface-border hover:border-surface-border/80"
      )}
    >
      <div>
        {/* Module Header */}
        <div className="flex items-start justify-between pb-2 border-b border-surface-border">
          <div className="flex items-start gap-2">
            <div className="p-1 rounded-xs bg-bg-secondary border border-surface-border mt-0.5">
              {getModuleIcon()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-txt-primary">
                  {displayName}
                </h4>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded-xs bg-bg-secondary text-txt-muted border border-surface-border">
                  HW
                </span>
              </div>
              <div className="text-[10px] font-mono text-txt-muted mt-0.5">
                ID: <span className="font-semibold text-txt-secondary">{module.id}</span>
              </div>
            </div>
          </div>

          <Badge status={statusLabel} size="sm">
            {statusLabel}
          </Badge>
        </div>

        <div className="text-[10px] font-mono text-txt-muted mt-1.5">
          {getModuleDescription()}
        </div>

        {/* Live Sensor Readings */}
        <div className="py-2 space-y-1 font-mono text-xs">
          {module.sensors.map((sensor) => {
            const isSensorWarn = sensor.status === 'WARNING';
            const isSensorFault = sensor.status === 'FAULT';

            return (
              <div
                key={sensor.id}
                className="flex items-center justify-between py-0.5 px-1 rounded-xs hover:bg-bg-primary/50 transition-colors"
              >
                <span className="text-txt-secondary text-[11px] truncate max-w-[130px]">
                  {sensor.name}
                </span>

                <span className={clsx(
                  "font-bold text-[11px]",
                  isSensorFault ? "text-rose-600 dark:text-rose-400" :
                  isSensorWarn ? "text-amber-600 dark:text-amber-400" :
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

      {/* Footer */}
      <div className="pt-2 border-t border-surface-border flex items-center justify-between font-mono text-xs">
        <span className="text-[10px] text-txt-muted">
          Updated {formatTimeAgo(module.lastUpdated)}
        </span>

        <button
          onClick={() => navigate(`/machines/${machineId}/modules/${module.id}`)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover transition-colors px-2 py-0.5 rounded-xs hover:bg-surface-hover"
        >
          <span>Details</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
