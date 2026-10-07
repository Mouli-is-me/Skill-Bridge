import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Machine } from '../../types/machine';
import { formatNumber, formatMetricValue } from '../../utils/formatting';
import { clsx } from 'clsx';

interface ComparisonTableProps {
  selectedMachines: Machine[];
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ selectedMachines }) => {
  if (selectedMachines.length === 0) {
    return (
      <Card className="p-8 text-center text-xs font-mono text-txt-muted">
        Select at least one machine above to generate comparison matrix.
      </Card>
    );
  }

  const metricsRow = [
    { label: 'Status', render: (m: Machine) => <Badge status={m.status} size="sm" /> },
    { label: 'Asset Type', render: (m: Machine) => m.type },
    { label: 'Location', render: (m: Machine) => `${m.location} (${m.section})` },
    { label: 'Utilization Rate', render: (m: Machine) => <span className="font-bold text-accent">{m.metrics.utilization.toFixed(1)}%</span> },
    { label: 'Production Rate', render: (m: Machine) => <span className="font-bold">{formatNumber(m.metrics.production)} u/h</span> },
    { label: 'Motor Speed (RPM)', render: (m: Machine) => formatNumber(m.metrics.rpm) },
    { label: 'Bearing Temp (°C)', render: (m: Machine) => (
      <span className={clsx(m.metrics.temperature >= m.thresholds.tempWarning && "text-amber-600 dark:text-amber-400 font-bold")}>
        {m.metrics.temperature.toFixed(1)} °C
      </span>
    )},
    { label: 'Vibration (mm/s)', render: (m: Machine) => (
      <span className={clsx(m.metrics.vibration >= m.thresholds.vibWarning && "text-amber-600 dark:text-amber-400 font-bold")}>
        {m.metrics.vibration.toFixed(2)} mm/s
      </span>
    )},
    { label: 'Current Draw (A)', render: (m: Machine) => `${m.metrics.current} A` },
    { label: 'OEE Rating', render: (m: Machine) => `${m.metrics.oee.toFixed(1)}%` },
  ];

  return (
    <Card className="space-y-4">
      <div className="border-b border-surface-border pb-3">
        <h3 className="text-base font-bold text-txt-primary">Cross-Asset Metric Comparison Table</h3>
        <p className="text-xs text-txt-secondary font-mono">Side-by-side technical specification & live sensor reading matrix</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr className="bg-bg-primary border-b border-surface-border uppercase text-[10px] font-bold text-txt-secondary tracking-wider">
              <th className="py-3 px-4 min-w-[160px]">Metric Parameter</th>
              {selectedMachines.map(m => (
                <th key={m.id} className="py-3 px-4 min-w-[150px] bg-surface-hover/50">
                  <div className="flex flex-col">
                    <span className="font-extrabold text-txt-primary text-sm">{m.id}</span>
                    <span className="text-[10px] text-txt-secondary font-sans truncate font-medium">{m.name}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border/60">
            {metricsRow.map((row, idx) => (
              <tr key={idx} className="hover:bg-surface-hover transition-colors">
                <td className="py-3 px-4 font-sans font-bold text-txt-secondary">
                  {row.label}
                </td>
                {selectedMachines.map(m => (
                  <td key={m.id} className="py-3 px-4">
                    {row.render(m)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
