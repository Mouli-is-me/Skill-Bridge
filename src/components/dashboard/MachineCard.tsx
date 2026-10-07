import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Machine } from '../../types/machine';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { formatNumber } from '../../utils/formatting';
import { Thermometer, Activity, Gauge, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

interface MachineCardProps {
  machine: Machine;
}

export const MachineCard: React.FC<MachineCardProps> = ({ machine }) => {
  const navigate = useNavigate();

  const isWarningOrError = machine.status === 'WARNING' || machine.status === 'ERROR';

  return (
    <Card
      padding="sm"
      className={clsx(
        "flex flex-col justify-between hover:shadow-panel transition-all border",
        isWarningOrError && machine.id === 'M-03' 
          ? "border-amber-400 dark:border-amber-700 bg-amber-500/5" 
          : "border-surface-border hover:border-accent/40"
      )}
    >
      <div>
        {/* Header: ID, Type, Badge */}
        <div className="flex items-start justify-between gap-2 pb-2 border-b border-surface-border/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-txt-primary">{machine.id}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-bg-tertiary text-txt-secondary rounded">
                {machine.type}
              </span>
            </div>
            <h4 className="text-xs font-medium text-txt-secondary truncate max-w-[130px]" title={machine.name}>
              {machine.name}
            </h4>
          </div>
          <Badge status={machine.status} size="sm" />
        </div>

        {/* Telemetry Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 my-3 text-xs">
          {/* Temperature */}
          <div className="bg-bg-primary p-2 rounded-md border border-surface-border/40">
            <div className="flex items-center gap-1 text-[10px] text-txt-muted uppercase font-mono">
              <Thermometer className="w-3 h-3 text-rose-500" />
              <span>Temp</span>
            </div>
            <span className={clsx(
              "font-mono font-bold text-sm block mt-0.5",
              machine.metrics.temperature >= machine.thresholds.tempWarning ? "text-amber-600 dark:text-amber-400 font-extrabold" : "text-txt-primary"
            )}>
              {machine.metrics.temperature.toFixed(1)} °C
            </span>
          </div>

          {/* Vibration */}
          <div className="bg-bg-primary p-2 rounded-md border border-surface-border/40">
            <div className="flex items-center gap-1 text-[10px] text-txt-muted uppercase font-mono">
              <Activity className="w-3 h-3 text-blue-500" />
              <span>Vib</span>
            </div>
            <span className={clsx(
              "font-mono font-bold text-sm block mt-0.5",
              machine.metrics.vibration >= machine.thresholds.vibWarning ? "text-amber-600 dark:text-amber-400 font-extrabold" : "text-txt-primary"
            )}>
              {machine.metrics.vibration.toFixed(2)} mm/s
            </span>
          </div>

          {/* RPM */}
          <div className="bg-bg-primary p-2 rounded-md border border-surface-border/40">
            <div className="flex items-center gap-1 text-[10px] text-txt-muted uppercase font-mono">
              <Gauge className="w-3 h-3 text-emerald-500" />
              <span>RPM</span>
            </div>
            <span className="font-mono font-bold text-sm text-txt-primary block mt-0.5">
              {formatNumber(machine.metrics.rpm)}
            </span>
          </div>

          {/* Utilization */}
          <div className="bg-bg-primary p-2 rounded-md border border-surface-border/40">
            <div className="flex items-center gap-1 text-[10px] text-txt-muted uppercase font-mono">
              <span>Util</span>
            </div>
            <span className="font-mono font-bold text-sm text-accent block mt-0.5">
              {machine.metrics.utilization.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="pt-2 border-t border-surface-border/60 flex items-center justify-between">
        <span className="text-[10px] font-mono text-txt-muted">{machine.location}</span>
        <Button
          size="sm"
          variant={machine.id === 'M-03' && isWarningOrError ? "primary" : "outline"}
          onClick={() => navigate(`/machines/${machine.id}`)}
          icon={<ArrowRight className="w-3 h-3" />}
        >
          View
        </Button>
      </div>
    </Card>
  );
};
