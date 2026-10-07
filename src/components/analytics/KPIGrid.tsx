import React from 'react';
import { Card } from '../ui/Card';
import { DeltaBadge } from '../ui/DeltaBadge';
import { Award, CheckCircle, Zap, ShieldCheck } from 'lucide-react';

export const KPIGrid: React.FC = () => {
  const kpis = [
    {
      title: 'Overall Equipment Effectiveness (OEE)',
      val: '86.4%',
      metricKey: 'oee',
      current: 86.4,
      prev: 84.8,
      icon: Award,
      subtext: 'Availability x Performance x Quality'
    },
    {
      title: 'Fleet Availability Rate',
      val: '94.2%',
      metricKey: 'availability',
      current: 94.2,
      prev: 92.0,
      icon: CheckCircle,
      subtext: 'Uptime / Planned Production'
    },
    {
      title: 'Operating Performance Rate',
      val: '89.6%',
      metricKey: 'performance',
      current: 89.6,
      prev: 88.5,
      icon: Zap,
      subtext: 'Actual Speed / Ideal Target Speed'
    },
    {
      title: 'Quality Output Yield',
      val: '98.4%',
      metricKey: 'quality',
      current: 98.4,
      prev: 98.1,
      icon: ShieldCheck,
      subtext: 'First Pass Yield (Zero Defects)'
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <Card key={idx} padding="sm" className="flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-txt-secondary uppercase tracking-wider block font-mono">
                  {kpi.title}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-txt-primary tracking-tight block mt-1">
                  {kpi.val}
                </span>
              </div>
              <div className="p-2 bg-bg-tertiary rounded-lg text-txt-secondary shrink-0">
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-2 border-t border-surface-border/60 text-xs">
              <DeltaBadge metricKey={kpi.metricKey} current={kpi.current} previous={kpi.prev} />
              <span className="text-[10px] text-txt-muted font-mono">{kpi.subtext}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
