import React from 'react';
import { Machine } from '../../types/machine';
import { MachineEvent } from '../../types/event';
import { formatNumber, formatDateShort } from '../../utils/formatting';
import { Activity } from 'lucide-react';

interface ReportPreviewProps {
  period: string;
  machineScope: string;
  machines: Machine[];
  events: MachineEvent[];
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({
  period,
  machineScope,
  machines,
  events
}) => {
  const targetMachines = machineScope === 'ALL'
    ? machines
    : machines.filter(m => m.id === machineScope);

  const targetEvents = machineScope === 'ALL'
    ? events
    : events.filter(e => e.machineId === machineScope);

  const totalProd = targetMachines.reduce((acc, m) => acc + m.metrics.production, 0);
  const avgUtil = targetMachines.reduce((acc, m) => acc + m.metrics.utilization, 0) / (targetMachines.length || 1);
  const avgOee = targetMachines.reduce((acc, m) => acc + m.metrics.oee, 0) / (targetMachines.length || 1);

  return (
    <div className="bg-surface border border-surface-border rounded-xl p-6 sm:p-8 shadow-subtle space-y-8 font-sans">
      {/* Report Header */}
      <div className="flex items-center justify-between border-b border-surface-border pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-white font-bold">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-txt-primary uppercase font-mono tracking-tight">
              SKILL BRIDGE OPERATIONAL SHIFT REPORT
            </h1>
            <p className="text-xs text-txt-secondary font-mono">
              Generated: {new Date().toLocaleDateString('en-US')} {new Date().toLocaleTimeString('en-US')} • Period Scope: {period}
            </p>
          </div>
        </div>
        <div className="text-right font-mono text-xs text-txt-secondary hidden sm:block">
          <span className="block font-bold">Target Scope: {machineScope}</span>
          <span>Assets Included: {targetMachines.length}</span>
        </div>
      </div>

      {/* Section 1: KPI Summary */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-txt-primary uppercase font-mono tracking-wider border-l-2 border-accent pl-2">
          1. Executive KPI Summary
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-bg-primary/80 border border-surface-border p-4 rounded-lg font-mono text-xs">
          <div>
            <span className="text-[10px] text-txt-muted uppercase">Combined Production</span>
            <span className="font-extrabold text-lg text-txt-primary block mt-0.5">{formatNumber(totalProd)} u/h</span>
          </div>
          <div>
            <span className="text-[10px] text-txt-muted uppercase">Average Utilization</span>
            <span className="font-extrabold text-lg text-accent block mt-0.5">{avgUtil.toFixed(1)}%</span>
          </div>
          <div>
            <span className="text-[10px] text-txt-muted uppercase">Fleet OEE Score</span>
            <span className="font-extrabold text-lg text-txt-primary block mt-0.5">{avgOee.toFixed(1)}%</span>
          </div>
          <div>
            <span className="text-[10px] text-txt-muted uppercase">Total Audit Events</span>
            <span className="font-extrabold text-lg text-rose-600 block mt-0.5">{targetEvents.length}</span>
          </div>
        </div>
      </div>

      {/* Section 2: Production Summary */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-txt-primary uppercase font-mono tracking-wider border-l-2 border-accent pl-2">
          2. Production Output Summary
        </h3>
        <p className="text-xs text-txt-secondary">
          Target production quota for the shift was achieved with nominal output variance across active weaving and spinning frames.
        </p>
      </div>

      {/* Section 3: Machine Performance Matrix */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-txt-primary uppercase font-mono tracking-wider border-l-2 border-accent pl-2">
          3. Machine Performance Breakdown
        </h3>
        <div className="overflow-x-auto border border-surface-border rounded-lg">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-bg-primary border-b border-surface-border uppercase text-[10px] font-bold text-txt-secondary">
                <th className="py-2.5 px-3">Asset ID</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">RPM</th>
                <th className="py-2.5 px-3 text-right">Temp (°C)</th>
                <th className="py-2.5 px-3 text-right">Vib (mm/s)</th>
                <th className="py-2.5 px-3 text-right">Util (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/60">
              {targetMachines.map(m => (
                <tr key={m.id}>
                  <td className="py-2 px-3 font-bold">{m.id}</td>
                  <td className="py-2 px-3">{m.type}</td>
                  <td className="py-2 px-3">{m.status}</td>
                  <td className="py-2 px-3 text-right">{formatNumber(m.metrics.rpm)}</td>
                  <td className="py-2 px-3 text-right">{m.metrics.temperature.toFixed(1)}</td>
                  <td className="py-2 px-3 text-right">{m.metrics.vibration.toFixed(2)}</td>
                  <td className="py-2 px-3 text-right font-bold text-accent">{m.metrics.utilization.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 4: Downtime Analysis */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-txt-primary uppercase font-mono tracking-wider border-l-2 border-accent pl-2">
          4. Downtime Analysis
        </h3>
        <div className="bg-bg-primary/80 border border-surface-border p-4 rounded-lg text-xs space-y-2 font-mono">
          <p>• Planned Doffing Maintenance: 2.1 Hours</p>
          <p>• Unplanned Bearing Overheat Mitigation (M-03): 1.4 Hours</p>
        </div>
      </div>

      {/* Section 5: Events Audit */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-txt-primary uppercase font-mono tracking-wider border-l-2 border-accent pl-2">
          5. Critical Event Audit Log (Top Recent)
        </h3>
        <div className="space-y-2 font-mono text-xs">
          {targetEvents.slice(0, 5).map(e => (
            <div key={e.id} className="p-2.5 rounded bg-bg-primary border border-surface-border/70 flex justify-between">
              <div>
                <span className="font-bold text-txt-primary">{e.machineId}</span>: <span className="font-sans text-txt-secondary">{e.message}</span>
              </div>
              <span className="text-txt-muted text-[10px] shrink-0 ml-2">{formatDateShort(e.timestamp)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
