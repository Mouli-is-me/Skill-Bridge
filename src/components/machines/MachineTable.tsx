import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Machine } from '../../types/machine';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatNumber } from '../../utils/formatting';
import { ArrowRight, Thermometer, Activity } from 'lucide-react';
import { clsx } from 'clsx';

interface MachineTableProps {
  machines: Machine[];
}

export const MachineTable: React.FC<MachineTableProps> = ({ machines }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-surface border border-surface-border rounded-xl overflow-hidden shadow-subtle">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-bg-primary/80 border-b border-surface-border text-[11px] font-bold text-txt-secondary font-mono uppercase tracking-wider">
              <th className="py-3 px-4">Machine Asset</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">RPM</th>
              <th className="py-3 px-4 text-right">Temp (°C)</th>
              <th className="py-3 px-4 text-right">Vib (mm/s)</th>
              <th className="py-3 px-4 text-right">Util (%)</th>
              <th className="py-3 px-4 text-right">Output (u/h)</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border/60 text-xs font-mono">
            {machines.map((m) => {
              const isTempWarn = m.metrics.temperature >= m.thresholds.tempWarning;
              const isVibWarn = m.metrics.vibration >= m.thresholds.vibWarning;

              return (
                <tr
                  key={m.id}
                  className={clsx(
                    "hover:bg-surface-hover transition-colors",
                    m.id === 'M-03' && (m.status === 'WARNING' || m.status === 'ERROR') && "bg-amber-500/5"
                  )}
                >
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-txt-primary">{m.id}</span>
                        {m.isHardware || m.id === 'M-01' || m.id === 'M01' ? (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            REAL HARDWARE
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-bg-tertiary text-txt-muted border border-surface-border">
                            DEMO
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-txt-secondary font-sans truncate max-w-[140px]">{m.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-bg-tertiary text-txt-secondary text-[10px] uppercase font-bold">
                      {m.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-txt-secondary font-sans">
                    {m.location} • {m.section}
                  </td>
                  <td className="py-3 px-4">
                    <Badge status={m.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-txt-primary">
                    {formatNumber(m.metrics.rpm)}
                  </td>
                  <td className={clsx("py-3 px-4 text-right font-bold", isTempWarn ? "text-amber-600 dark:text-amber-400 font-extrabold" : "text-txt-primary")}>
                    {m.metrics.temperature.toFixed(1)}
                  </td>
                  <td className={clsx("py-3 px-4 text-right font-bold", isVibWarn ? "text-amber-600 dark:text-amber-400 font-extrabold" : "text-txt-primary")}>
                    {m.metrics.vibration.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-accent">
                    {m.metrics.utilization.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-txt-primary">
                    {formatNumber(m.metrics.production)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Button
                      size="sm"
                      variant={m.id === 'M-03' ? "primary" : "outline"}
                      onClick={() => navigate(`/machines/${m.id}`)}
                      icon={<ArrowRight className="w-3 h-3" />}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
