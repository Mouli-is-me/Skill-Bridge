import React, { useState, useMemo } from 'react';
import { Card } from '../ui/Card';
import { Tabs } from '../ui/Tabs';
import { Select } from '../ui/Select';
import { HistoricalMachineData } from '../../types/machine';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { formatDateShort } from '../../utils/formatting';

interface ProductionChartProps {
  historyMap: Record<string, HistoricalMachineData>;
}

export const ProductionChart: React.FC<ProductionChartProps> = ({ historyMap }) => {
  const [activeTab, setActiveTab] = useState<'production' | 'utilization' | 'downtime'>('production');
  const [timeRange, setTimeRange] = useState<string>('24H');
  const [selectedMachineId, setSelectedMachineId] = useState<string>('ALL');

  const chartTabs = [
    { id: 'production', label: 'Production Output (u/h)' },
    { id: 'utilization', label: 'Utilization Rate (%)' },
    { id: 'downtime', label: 'Downtime (min)' }
  ];

  const rangeOptions = [
    { label: '1 Hour', value: '1H' },
    { label: '6 Hours', value: '6H' },
    { label: '12 Hours', value: '12H' },
    { label: '24 Hours', value: '24H' },
    { label: '7 Days', value: '7D' },
  ];

  const machineOptions = [
    { label: 'All Fleet Aggregate', value: 'ALL' },
    ...Object.keys(historyMap).map(id => ({ label: `Machine ${id}`, value: id }))
  ];

  // Process data points for Recharts based on controls
  const chartData = useMemo(() => {
    const hoursLimit = timeRange === '1H' ? 1 : timeRange === '6H' ? 6 : timeRange === '12H' ? 12 : timeRange === '24H' ? 24 : 168;

    if (selectedMachineId !== 'ALL' && historyMap[selectedMachineId]) {
      const pts = historyMap[selectedMachineId].hourlyPoints.slice(-hoursLimit);
      return pts.map(p => ({
        time: formatDateShort(p.timestamp),
        production: p.production,
        utilization: p.utilization,
        downtime: p.utilization < 70 ? Math.round((70 - p.utilization) * 0.6) : 0,
      }));
    }

    // Aggregate across all machines
    const machineIds = Object.keys(historyMap);
    if (machineIds.length === 0) return [];

    const samplePoints = historyMap[machineIds[0]].hourlyPoints.slice(-hoursLimit);
    return samplePoints.map((samplePoint, index) => {
      let sumProd = 0;
      let sumUtil = 0;
      let count = 0;

      machineIds.forEach(id => {
        const pts = historyMap[id].hourlyPoints;
        const targetPoint = pts[pts.length - hoursLimit + index];
        if (targetPoint) {
          sumProd += targetPoint.production;
          sumUtil += targetPoint.utilization;
          count++;
        }
      });

      const avgUtil = count > 0 ? sumUtil / count : 0;
      return {
        time: formatDateShort(samplePoint.timestamp),
        production: sumProd,
        utilization: Number(avgUtil.toFixed(1)),
        downtime: avgUtil < 80 ? Math.round((80 - avgUtil) * 1.5) : 0,
      };
    });
  }, [historyMap, selectedMachineId, timeRange]);

  const getSeriesColor = () => {
    if (activeTab === 'production') return { stroke: '#16A34A', fill: 'rgba(22, 163, 74, 0.15)' };
    if (activeTab === 'utilization') return { stroke: '#2563EB', fill: 'rgba(37, 99, 235, 0.15)' };
    return { stroke: '#DC2626', fill: 'rgba(220, 38, 38, 0.15)' };
  };

  const colorConfig = getSeriesColor();

  return (
    <Card className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <h3 className="text-base font-bold text-txt-primary">Production & Fleet Performance Trend</h3>
          <p className="text-xs text-txt-secondary font-mono">Real-time aggregated sensor telemetry timeseries</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Tabs
            tabs={chartTabs}
            activeTab={activeTab}
            onChange={(tab) => setActiveTab(tab as any)}
          />

          <Select
            options={machineOptions}
            value={selectedMachineId}
            onChange={(e) => setSelectedMachineId(e.target.value)}
          />

          <Select
            options={rangeOptions}
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          />
        </div>
      </div>

      {/* Recharts Area */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colorConfig.stroke} stopOpacity={0.3} />
                <stop offset="95%" stopColor={colorConfig.stroke} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} opacity={0.5} />
            <XAxis
              dataKey="time"
              stroke="var(--text-muted)"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'var(--border-color)' }}
            />
            <YAxis
              stroke="var(--text-muted)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
                borderRadius: '6px'
              }}
            />
            <Area
              type="monotone"
              dataKey={activeTab}
              stroke={colorConfig.stroke}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#chartGradient)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
