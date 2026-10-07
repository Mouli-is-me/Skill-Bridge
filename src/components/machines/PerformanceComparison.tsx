import React from 'react';
import { Card } from '../ui/Card';
import { DeltaBadge } from '../ui/DeltaBadge';
import { Machine } from '../../types/machine';
import { formatMetricValue } from '../../utils/formatting';

interface PerformanceComparisonProps {
  machine: Machine;
}

export const PerformanceComparison: React.FC<PerformanceComparisonProps> = ({ machine }) => {
  const { metrics } = machine;

  // Comparison metrics: Current Shift vs Previous Shift (seeded baseline)
  const comparisonRows = [
    {
      name: 'Production Output',
      key: 'production',
      current: metrics.production,
      previous: Math.round(metrics.production * 0.94),
    },
    {
      name: 'Operating Speed (RPM)',
      key: 'rpm',
      current: metrics.rpm,
      previous: Math.round(metrics.rpm * 0.98),
    },
    {
      name: 'Bearing Temperature',
      key: 'temperature',
      current: metrics.temperature,
      previous: machine.id === 'M-03' ? 69.5 : metrics.temperature * 0.97,
    },
    {
      name: 'Vibration Amplitude',
      key: 'vibration',
      current: metrics.vibration,
      previous: machine.id === 'M-03' ? 2.4 : metrics.vibration * 0.96,
    },
    {
      name: 'Asset Utilization',
      key: 'utilization',
      current: metrics.utilization,
      previous: machine.id === 'M-03' ? 88.0 : metrics.utilization * 0.97,
    },
    {
      name: 'Estimated Downtime',
      key: 'downtime',
      current: machine.id === 'M-03' ? 1.8 : 0.4,
      previous: 0.5,
    },
  ];

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between border-b border-surface-border pb-3">
        <div>
          <h3 className="text-base font-bold text-txt-primary">Shift-over-Shift Performance Comparison</h3>
          <p className="text-xs text-txt-secondary font-mono">Current Shift vs. Previous Shift Baseline</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr className="bg-bg-primary border-b border-surface-border uppercase text-[10px] font-bold text-txt-secondary tracking-wider">
              <th className="py-2.5 px-3">Performance Metric</th>
              <th className="py-2.5 px-3 text-right">Current Shift</th>
              <th className="py-2.5 px-3 text-right">Previous Shift</th>
              <th className="py-2.5 px-3 text-center">Variance Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border/60">
            {comparisonRows.map((row) => (
              <tr key={row.key} className="hover:bg-surface-hover transition-colors">
                <td className="py-2.5 px-3 font-sans font-semibold text-txt-primary">
                  {row.name}
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-txt-primary">
                  {formatMetricValue(row.current, row.key)}
                </td>
                <td className="py-2.5 px-3 text-right text-txt-secondary">
                  {formatMetricValue(row.previous, row.key)}
                </td>
                <td className="py-2.5 px-3 text-center">
                  <DeltaBadge metricKey={row.key} current={row.current} previous={row.previous} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
