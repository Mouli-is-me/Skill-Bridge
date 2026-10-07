import React, { useState, useMemo } from 'react';
import { Card } from '../ui/Card';
import { Tabs } from '../ui/Tabs';
import { HistoricalMachineData } from '../../types/machine';
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

interface HistoricalOverlayChartProps {
  history?: HistoricalMachineData;
}

export const HistoricalOverlayChart: React.FC<HistoricalOverlayChartProps> = ({ history }) => {
  const [preset, setPreset] = useState<string>('7D');
  const [metricKey, setMetricKey] = useState<string>('production');

  const presetTabs = [
    { id: 'Today', label: 'Today' },
    { id: 'Yesterday', label: 'Yesterday' },
    { id: '7D', label: '7 Days' },
    { id: '30D', label: '30 Days' },
  ];

  const metricTabs = [
    { id: 'production', label: 'Production' },
    { id: 'utilization', label: 'Utilization' },
    { id: 'temperature', label: 'Temperature' },
    { id: 'vibration', label: 'Vibration' },
  ];

  const chartData = useMemo(() => {
    if (!history || !history.dailySummary) return [];

    const daysLimit = preset === 'Today' || preset === 'Yesterday' ? 2 : preset === '7D' ? 7 : 30;
    const summaries = history.dailySummary.slice(-daysLimit * 2);

    // Split into Current Period vs Previous Period overlay
    const half = Math.floor(summaries.length / 2);
    const prevSlice = summaries.slice(0, half);
    const currSlice = summaries.slice(half);

    return currSlice.map((item, idx) => {
      const prevItem = prevSlice[idx];
      const keyName = metricKey === 'production' ? 'totalProduction' : metricKey === 'utilization' ? 'avgUtilization' : 'avgUtilization';
      
      return {
        label: `Day ${idx + 1}`,
        current: (item as any)[keyName] || item.totalProduction,
        previous: prevItem ? (prevItem as any)[keyName] || prevItem.totalProduction : item.totalProduction * 0.95
      };
    });
  }, [history, preset, metricKey]);

  return (
    <Card className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <h3 className="text-base font-bold text-txt-primary">Historical Performance & Period Overlay</h3>
          <p className="text-xs text-txt-secondary font-mono">Current period trend vs. Prior period benchmark</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Tabs tabs={metricTabs} activeTab={metricKey} onChange={setMetricKey} />
          <Tabs tabs={presetTabs} activeTab={preset} onChange={setPreset} />
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} opacity={0.5} />
            <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
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
            <Line
              type="monotone"
              name="Current Period"
              dataKey="current"
              stroke="#16A34A"
              strokeWidth={2.5}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              name="Previous Period"
              dataKey="previous"
              stroke="#9CA3AF"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
