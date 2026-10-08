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
    { id: 'temperature', label: 'Temp (°C)' },
    { id: 'vibration', label: 'Vib (mm/s)' },
    { id: 'rpm', label: 'RPM' },
    { id: 'current', label: 'Current (A)' },
    { id: 'production', label: 'Output (u/h)' },
    { id: 'utilization', label: 'Util (%)' },
  ];

  const rangeOptions = [
    { label: '1 Hour', value: '1H' },
    { label: '6 Hours', value: '6H' },
    { label: '24 Hours', value: '24H' },
  ];

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
    <Card className="space-y-3 font-sans" padding="md">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-3">
        <div>
          <h3 className="text-xs font-semibold text-txt-primary">Live Telemetry Stream</h3>
          <p className="text-[11px] text-txt-secondary font-mono">Continuous sensor values</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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

      {/* Stats Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-bg-secondary/60 border border-surface-border p-2.5 rounded-xs font-mono text-xs">
        <div>
          <span className="text-[10px] text-txt-muted uppercase">Current</span>
          <span className="font-bold text-txt-primary block text-xs mt-0.5">
            {formatMetricValue(stats.current, metricKey)}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-txt-muted uppercase">Min</span>
          <span className="font-semibold text-txt-secondary block text-xs mt-0.5">
            {formatMetricValue(stats.min, metricKey)}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-txt-muted uppercase">Max</span>
          <span className="font-semibold text-txt-secondary block text-xs mt-0.5">
            {formatMetricValue(stats.max, metricKey)}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-txt-muted uppercase">Average</span>
          <span className="font-semibold text-accent block text-xs mt-0.5">
            {formatMetricValue(stats.avg, metricKey)}
          </span>
        </div>
      </div>

      {/* Recharts Stream */}
      <div className="h-60 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} opacity={0.6} />
            <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
            <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
                borderRadius: '4px',
                fontSize: '11px'
              }}
            />
            {thresholdValue && (
              <ReferenceLine
                y={thresholdValue}
                stroke="#D97706"
                strokeDasharray="4 4"
                label={{ value: `Limit (${thresholdValue})`, fill: '#D97706', fontSize: 10 }}
              />
            )}
            <Line
              type="monotone"
              dataKey="val"
              stroke="#0F766E"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
