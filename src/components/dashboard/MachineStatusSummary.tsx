import React from 'react';
import { Machine } from '../../types/machine';
import { Activity, AlertTriangle, AlertOctagon, PauseCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface MachineStatusSummaryProps {
  machines: Machine[];
  onFilterStatus?: (status: string | null) => void;
  activeFilter?: string | null;
}

export const MachineStatusSummary: React.FC<MachineStatusSummaryProps> = ({
  machines,
  onFilterStatus,
  activeFilter
}) => {
  const running = machines.filter(m => m.status === 'RUNNING').length;
  const warning = machines.filter(m => m.status === 'WARNING').length;
  const error = machines.filter(m => m.status === 'ERROR').length;
  const idle = machines.filter(m => m.status === 'IDLE').length;

  const statuses = [
    {
      id: 'RUNNING',
      label: 'RUNNING',
      count: running,
      icon: Activity,
      color: 'border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10'
    },
    {
      id: 'WARNING',
      label: 'WARNING',
      count: warning,
      icon: AlertTriangle,
      color: 'border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-500/10'
    },
    {
      id: 'ERROR',
      label: 'ERROR / DOWN',
      count: error,
      icon: AlertOctagon,
      color: 'border-rose-500/30 text-rose-700 dark:text-rose-400 bg-rose-500/10'
    },
    {
      id: 'IDLE',
      label: 'IDLE',
      count: idle,
      icon: PauseCircle,
      color: 'border-gray-500/30 text-gray-700 dark:text-gray-400 bg-gray-500/10'
    }
  ];

  return (
    <div className="bg-surface border border-surface-border rounded-xl p-3 sm:p-4 shadow-subtle flex flex-wrap items-center justify-between gap-3">
      <span className="text-xs font-bold font-mono text-txt-secondary uppercase tracking-wider">
        Fleet Status Breakdown:
      </span>

      <div className="flex flex-wrap items-center gap-2 sm:gap-4 flex-1 justify-end">
        {statuses.map(st => {
          const Icon = st.icon;
          const isSelected = activeFilter === st.id;
          return (
            <button
              key={st.id}
              onClick={() => onFilterStatus && onFilterStatus(isSelected ? null : st.id)}
              className={clsx(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all select-none",
                st.color,
                isSelected && "ring-2 ring-accent ring-offset-1"
              )}
            >
              <Icon className="w-4 h-4 stroke-[2]" />
              <span>{st.label}</span>
              <span className="px-1.5 py-0.5 rounded bg-surface/80 text-txt-primary border border-surface-border text-[11px]">
                {st.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
