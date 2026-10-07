import React from 'react';
import { Machine } from '../../types/machine';
import { getMachineModuleStats } from '../../utils/moduleHelpers';
import { Cpu, Layers, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

interface DashboardSummaryProps {
  machines: Machine[];
}

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({ machines }) => {
  const totalMachines = machines.length;
  const allModules = machines.flatMap(m => m.modules || []);
  const totalModules = allModules.length;

  const stats = getMachineModuleStats(allModules);

  const summaryItems = [
    {
      label: 'Machines',
      value: totalMachines,
      subtext: `${machines.filter(m => m.isOnline).length} Active Online`,
      icon: Cpu,
      color: 'text-txt-primary',
      bg: 'bg-bg-primary',
      border: 'border-surface-border'
    },
    {
      label: 'Hardware Sensors',
      value: totalModules,
      subtext: 'MPU6050 • DS18B20 • LM393',
      icon: Layers,
      color: 'text-txt-primary',
      bg: 'bg-bg-primary',
      border: 'border-surface-border'
    },
    {
      label: 'Healthy',
      value: stats.healthy,
      subtext: `${((stats.healthy / (totalModules || 1)) * 100).toFixed(0)}% Normal`,
      icon: CheckCircle2,
      color: 'text-status-healthy',
      bg: 'bg-status-healthy-bg/50',
      border: 'border-status-healthy-border/60'
    },
    {
      label: 'Warnings',
      value: stats.warnings,
      subtext: stats.warnings > 0 ? 'Action Recommended' : 'Zero Warning',
      icon: AlertTriangle,
      color: 'text-status-warning',
      bg: 'bg-status-warning-bg/50',
      border: 'border-status-warning-border/60'
    },
    {
      label: 'Faults',
      value: stats.faults,
      subtext: stats.faults > 0 ? 'Requires Inspection' : 'No Critical Faults',
      icon: AlertOctagon,
      color: 'text-status-fault',
      bg: 'bg-status-fault-bg/50',
      border: 'border-status-fault-border/60'
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {summaryItems.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className={`bg-surface border ${item.border} rounded-lg p-3.5 flex flex-col justify-between shadow-subtle transition-all`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-txt-secondary uppercase tracking-wider">
                {item.label}
              </span>
              <div className={`p-1.5 rounded ${item.bg}`}>
                <Icon className={`w-3.5 h-3.5 ${item.color}`} />
              </div>
            </div>

            <div className="mt-2 flex items-baseline justify-between">
              <span className={`text-2xl sm:text-3xl font-mono font-bold tracking-tight ${item.color}`}>
                {item.value}
              </span>
            </div>

            <div className="mt-1 pt-1.5 border-t border-surface-border/40">
              <span className="text-[10px] font-mono text-txt-muted">
                {item.subtext}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
