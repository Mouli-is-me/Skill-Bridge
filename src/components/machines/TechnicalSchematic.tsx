import React from 'react';
import { Card } from '../ui/Card';
import { Machine } from '../../types/machine';
import { Cpu, Activity, Thermometer, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

interface TechnicalSchematicProps {
  machine: Machine;
}

export const TechnicalSchematic: React.FC<TechnicalSchematicProps> = ({ machine }) => {
  const isTempWarn = machine.metrics.temperature >= machine.thresholds.tempWarning;
  const isVibWarn = machine.metrics.vibration >= machine.thresholds.vibWarning;

  const components = [
    {
      id: 'sub-1',
      name: 'Main Drive Motor & Inverter',
      status: machine.metrics.rpm > 0 ? 'NOMINAL' : 'IDLE',
      metric: `${machine.metrics.rpm} RPM • ${machine.metrics.current} A`,
      isAlert: false
    },
    {
      id: 'sub-2',
      name: 'Main Bearing Assembly (Drive Side)',
      status: isTempWarn ? 'OVERHEATING' : 'NOMINAL',
      metric: `${machine.metrics.temperature.toFixed(1)} °C (Threshold: ${machine.thresholds.tempWarning}°C)`,
      isAlert: isTempWarn
    },
    {
      id: 'sub-3',
      name: 'Loom Frame & Dampener Assembly',
      status: isVibWarn ? 'HIGH VIBRATION' : 'NOMINAL',
      metric: `${machine.metrics.vibration.toFixed(2)} mm/s (Threshold: ${machine.thresholds.vibWarning}mm/s)`,
      isAlert: isVibWarn
    },
    {
      id: 'sub-4',
      name: 'Warp Thread Feed & Tensioner',
      status: machine.metrics.utilization > 50 ? 'ACTIVE' : 'IDLE',
      metric: `Util: ${machine.metrics.utilization.toFixed(1)}%`,
      isAlert: false
    }
  ];

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between border-b border-surface-border pb-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-accent" />
          <h3 className="text-base font-bold text-txt-primary">Technical Sub-System Schematic</h3>
        </div>
        <span className="text-xs font-mono text-txt-muted uppercase">Flat Topology Schematic</span>
      </div>

      {/* Flat Industrial 2D Component Topology Box */}
      <div className="bg-bg-primary/80 border border-surface-border/80 rounded-xl p-4 sm:p-6 space-y-4">
        {/* Machine Outer Frame Representation */}
        <div className="border-2 border-dashed border-surface-border/80 rounded-lg p-4 bg-surface/40 relative">
          <div className="absolute -top-3 left-4 bg-surface px-2 text-[10px] font-mono font-bold text-txt-secondary border border-surface-border rounded">
            ASSET CHASSIS: {machine.id} [{machine.model}]
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-2">
            {components.map((comp) => (
              <div
                key={comp.id}
                className={clsx(
                  "p-3 rounded-lg border flex flex-col justify-between transition-all font-mono",
                  comp.isAlert
                    ? "bg-amber-500/10 border-amber-500/50 text-amber-900 dark:text-amber-200"
                    : "bg-surface border-surface-border text-txt-primary"
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold text-txt-muted uppercase">Sub-System</span>
                    {comp.isAlert ? (
                      <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold font-sans text-txt-primary leading-tight">{comp.name}</h4>
                </div>

                <div className="mt-3 pt-2 border-t border-surface-border/40 text-[11px]">
                  <span className={clsx(
                    "font-bold block text-xs",
                    comp.isAlert ? "text-amber-600 dark:text-amber-400 font-extrabold" : "text-emerald-600 dark:text-emerald-400"
                  )}>
                    ● {comp.status}
                  </span>
                  <span className="text-[10px] text-txt-secondary block mt-0.5">{comp.metric}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
