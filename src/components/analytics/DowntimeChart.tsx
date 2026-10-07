import React from 'react';
import { Card } from '../ui/Card';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';

export const DowntimeChart: React.FC = () => {
  // Downtime categories breakdown
  const data = [
    { category: 'Mechanical Failure', hours: 4.2 },
    { category: 'Material Starvation', hours: 2.8 },
    { category: 'Scheduled Doffing', hours: 2.1 },
    { category: 'Operator Pause', hours: 1.5 },
    { category: 'Quality Inspection', hours: 0.9 },
  ];

  return (
    <Card className="space-y-4">
      <div className="border-b border-surface-border pb-3">
        <h3 className="text-base font-bold text-txt-primary">Downtime Loss Category Distribution</h3>
        <p className="text-xs text-txt-secondary font-mono">Aggregated lost production time (hours)</p>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 10, left: 30, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} opacity={0.5} />
            <XAxis type="number" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
            <YAxis dataKey="category" type="category" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
                borderRadius: '6px'
              }}
              formatter={(val: any) => [`${val} hours`, 'Lost Time']}
            />
            <Bar dataKey="hours" fill="#DC2626" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
