import React, { useState, useMemo } from 'react';
import { Card } from '../ui/Card';
import { Tabs } from '../ui/Tabs';
import { Machine, HistoricalMachineData } from '../../types/machine';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Legend 
} from 'recharts';
import { formatDateShort } from '../../utils/formatting';

interface ComparisonChartProps {
  selectedMachines: Machine[];
  historyMap: Record<string, HistoricalMachineData>;
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({ selectedMachines, historyMap }) => {
  const [metricKey, setMetricKey] = useState<string>('production');

  const metricTabs = [
    { id: 'production', label: 'Production' },
    { id: 'utilization', label: 'Utilization' },
    { id: 'temperature', label: 'Temperature' },
    { id: 'vibration', label: 'Vibration' },
  ];

  const colors = ['#16A34A', '#2563EB', '#D97706', '#DC2626', '#8B5CF6'];

  const chartData = useMemo(() => {
    if (selectedMachines.length === 0) return [];

    const firstId = selectedMachines[0].id;
    const firstHist = historyMap[firstId];
    if (!firstHist || !firstHist.hourlyPoints) return [];

    const samplePts = firstHist.hourlyPoints.slice(-24); // Last 24 hours

    return samplePts.map((pt, idx) => {
      const dataPoint: Record<string, any> = {
        time: formatDateShort(pt.timestamp)
      };

      selectedMachines.forEach(m => {
        const hist = historyMap[m.id];
        if (hist && hist.hourlyPoints) {
          const targetPt = hist.hourlyPoints[hist.hourlyPoints.length - 24 + idx];
          if (targetPt) {
            dataPoint[m.id] = (targetPt as any)[metricKey] || 0;
          }
        }
      });

      return dataPoint;
    });
  }, [selectedMachines, historyMap, metricKey]);

  return (
    <Card className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <h3 className="text-base font-bold text-txt-primary">Multi-Asset Comparative Timeseries</h3>
          <p className="text-xs text-txt-secondary font-mono">Simultaneous telemetry comparison across selected machines</p>
        </div>

        <Tabs tabs={metricTabs} activeTab={metricKey} onChange={setMetricKey} />
      </div>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} opacity={0.5} />
            <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
            <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
                borderRadius: '6px'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            {selectedMachines.map((m, idx) => (
              <Line
                key={m.id}
                type="monotone"
                name={`${m.id} (${m.name})`}
                dataKey={m.id}
                stroke={colors[idx % colors.length]}
                strokeWidth={2}
                dot={{ r: 2 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
