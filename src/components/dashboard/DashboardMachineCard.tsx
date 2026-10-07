import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Machine } from '../../types/machine';
import { Badge } from '../ui/Badge';
import { getMachineModuleStats } from '../../utils/moduleHelpers';
import { formatTimeAgo } from '../../utils/formatting';
import { ArrowRight, Thermometer, Activity, Radio } from 'lucide-react';
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

  // Extract the 3 physical sensor modules
  const mpu = modules.find(m => m.type === 'MPU6050');
  const ds18 = modules.find(m => m.type === 'DS18B20');
  const lm393 = modules.find(m => m.type === 'LM393');

  const tempSensor = ds18?.sensors.find(s => s.key === 'temperature');
  const accelXSensor = mpu?.sensors.find(s => s.key === 'accelX');
  const accelYSensor = mpu?.sensors.find(s => s.key === 'accelY');
  const accelZSensor = mpu?.sensors.find(s => s.key === 'accelZ');
  const pulseFreqSensor = lm393?.sensors.find(s => s.key === 'pulseFrequency');
  const detectionSensor = lm393?.sensors.find(s => s.key === 'detectionState');

  return (
    <div
      className={clsx(
        "bg-surface border rounded-lg p-4 flex flex-col justify-between transition-all hover:border-txt-muted/40 shadow-subtle",
        isFault ? "border-status-fault-border bg-status-fault-bg/10" :
        isWarning ? "border-status-warning-border bg-status-warning-bg/10" :
        "border-surface-border"
      )}
    >
      <div>
        {/* Machine ID, Name & Status */}
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

        {/* 3 Hardware Sensors Strip */}
        <div className="mt-3 py-1.5 px-2.5 rounded bg-bg-primary/70 border border-surface-border/50 flex items-center justify-between text-xs font-mono">
          <span className="text-txt-secondary text-[11px]">3 Physical Sensors</span>
          <span className={clsx(
            "font-bold text-[11px]",
            isFault ? "text-status-fault" : isWarning ? "text-status-warning" : "text-status-healthy"
          )}>
            {stats.healthy} / {stats.total} healthy
          </span>
        </div>

        {/* Real Hardware Sensor Telemetry Preview */}
        <div className="mt-3 space-y-2 font-mono text-xs">
          {/* DS18B20 */}
          <div className="flex items-center justify-between py-1 px-1.5 rounded bg-bg-primary/40 border border-surface-border/40">
            <div className="flex items-center gap-1.5 text-txt-secondary">
              <Thermometer className="w-3.5 h-3.5 text-txt-muted shrink-0" />
              <span className="text-[11px] font-bold">DS18B20</span>
            </div>
            <span className={clsx(
              "font-bold text-[11px]",
              (tempSensor?.value || 0) >= (tempSensor?.warningThreshold || 75) ? "text-status-warning" : "text-txt-primary"
            )}>
              {tempSensor?.value.toFixed(1)} °C
            </span>
          </div>

          {/* MPU6050 */}
          <div className="flex items-center justify-between py-1 px-1.5 rounded bg-bg-primary/40 border border-surface-border/40">
            <div className="flex items-center gap-1.5 text-txt-secondary">
              <Activity className="w-3.5 h-3.5 text-txt-muted shrink-0" />
              <span className="text-[11px] font-bold">MPU6050</span>
            </div>
            <div className="text-[11px] text-right font-medium">
              <span className={(accelXSensor?.value || 0) >= (accelXSensor?.warningThreshold || 2.0) ? "text-status-warning font-bold" : "text-txt-primary"}>
                X:{accelXSensor?.value.toFixed(2)} Y:{accelYSensor?.value.toFixed(2)} g
              </span>
            </div>
          </div>

          {/* LM393 */}
          <div className="flex items-center justify-between py-1 px-1.5 rounded bg-bg-primary/40 border border-surface-border/40">
            <div className="flex items-center gap-1.5 text-txt-secondary">
              <Radio className="w-3.5 h-3.5 text-txt-muted shrink-0" />
              <span className="text-[11px] font-bold">LM393</span>
            </div>
            <div className="text-[11px] text-right font-medium text-txt-primary">
              <span className="text-txt-muted text-[10px] mr-1">
                {detectionSensor?.displayState || (detectionSensor?.value === 1 ? 'Detected' : 'Clear')}
              </span>
              <span>{pulseFreqSensor?.value.toFixed(1)} Hz</span>
            </div>
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
