import React, { useState, useMemo } from 'react';
import { Card } from '../ui/Card';
import { Tabs } from '../ui/Tabs';
import { Select } from '../ui/Select';
import { HistoricalMachineData } from '../../types/machine';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  ReferenceLine
} from 'recharts';
import { formatMetricValue, formatDateShort } from '../../utils/formatting';

interface SensorChartProps {
  history?: HistoricalMachineData;
  tempWarningThreshold?: number;
  vibWarningThreshold?: number;
}

export const SensorChart: React.FC<SensorChartProps> = ({
  history,
  tempWarningThreshold = 75,
  vibWarningThreshold = 4.5
}) => {
  const [metricKey, setMetricKey] = useState<string>('temperature');
  const [timeRange, setTimeRange] = useState<string>('24H');

  const metricTabs = [
    { id: 'temperature', label: 'Temperature (°C)' },
    { id: 'vibration', label: 'Vibration (mm/s)' },
    { id: 'rpm', label: 'RPM' },
    { id: 'current', label: 'Current (A)' },
    { id: 'production', label: 'Production (u/h)' },
    { id: 'utilization', label: 'Utilization (%)' },
  ];

  const rangeOptions = [
    { label: '1 Hour', value: '1H' },
    { label: '6 Hours', value: '6H' },
    { label: '24 Hours', value: '24H' },
  ];

  // Process data points and stats
  const { chartData, stats } = useMemo(() => {
    if (!history || !history.hourlyPoints) {
      return { chartData: [], stats: { current: 0, min: 0, max: 0, avg: 0 } };
    }

    const hoursLimit = timeRange === '1H' ? 1 : timeRange === '6H' ? 6 : 24;
    const pts = history.hourlyPoints.slice(-hoursLimit);

    const values = pts.map(p => (p as any)[metricKey] || 0);
    const current = values.length > 0 ? values[values.length - 1] : 0;
    const min = values.length > 0 ? Math.min(...values) : 0;
    const max = values.length > 0 ? Math.max(...values) : 0;
    const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;

    const formattedData = pts.map(p => ({
      time: formatDateShort(p.timestamp),
      val: (p as any)[metricKey]
    }));

    return {
      chartData: formattedData,
      stats: { current, min, max, avg }
    };
  }, [history, metricKey, timeRange]);

  const thresholdValue = metricKey === 'temperature' ? tempWarningThreshold : metricKey === 'vibration' ? vibWarningThreshold : null;

  return (
    <Card className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <h3 className="text-base font-bold text-txt-primary">Live Sensor Data Stream</h3>
          <p className="text-xs text-txt-secondary font-mono">High-frequency telemetry time series</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Tabs
            tabs={metricTabs}
            activeTab={metricKey}
            onChange={(m) => setMetricKey(m)}
          />

          <Select
            options={rangeOptions}
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          />
        </div>
      </div>

      {/* Stats Summary Strip (Current / Min / Max / Avg) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-bg-primary/80 border border-surface-border/60 p-3 rounded-lg font-mono text-xs">
        <div>
          <span className="text-[10px] text-txt-muted uppercase">Current Value</span>
          <span className="font-bold text-txt-primary block text-sm mt-0.5">
            {formatMetricValue(stats.current, metricKey)}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-txt-muted uppercase">Min (Period)</span>
          <span className="font-semibold text-txt-secondary block text-sm mt-0.5">
            {formatMetricValue(stats.min, metricKey)}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-txt-muted uppercase">Max (Period)</span>
          <span className="font-semibold text-txt-secondary block text-sm mt-0.5">
            {formatMetricValue(stats.max, metricKey)}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-txt-muted uppercase">Average (Period)</span>
          <span className="font-semibold text-accent block text-sm mt-0.5">
            {formatMetricValue(stats.avg, metricKey)}
          </span>
        </div>
      </div>

      {/* Recharts Line Stream */}
      <div className="h-64 w-full pt-2">
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
            {thresholdValue && (
              <ReferenceLine
                y={thresholdValue}
                stroke="#D97706"
                strokeDasharray="4 4"
                label={{ value: `Warning Limit (${thresholdValue})`, fill: '#D97706', fontSize: 10 }}
              />
            )}
            <Line
              type="monotone"
              dataKey="val"
              stroke="#16A34A"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
