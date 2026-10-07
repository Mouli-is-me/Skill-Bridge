import React from 'react';
import { Card } from '../ui/Card';
import { Machine } from '../../types/machine';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Cell 
} from 'recharts';

interface UtilizationChartProps {
  machines: Machine[];
}

export const UtilizationChart: React.FC<UtilizationChartProps> = ({ machines }) => {
  const data = machines.map(m => ({
    id: m.id,
    utilization: m.metrics.utilization,
    isWarning: m.status === 'WARNING' || m.status === 'ERROR'
  }));

  return (
    <Card className="space-y-4">
      <div className="border-b border-surface-border pb-3">
        <h3 className="text-base font-bold text-txt-primary">Fleet Asset Utilization Distribution</h3>
        <p className="text-xs text-txt-secondary font-mono">Current shift utilization rating (%) per machine</p>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} opacity={0.5} />
            <XAxis dataKey="id" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
            <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
                borderRadius: '6px'
              }}
              formatter={(val: any) => [`${val}%`, 'Utilization']}
            />
            <Bar dataKey="utilization" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isWarning ? '#D97706' : '#16A34A'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
