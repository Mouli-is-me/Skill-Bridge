import React from 'react';
import { Card } from '../ui/Card';
import { DeltaBadge } from '../ui/DeltaBadge';
import { formatNumber } from '../../utils/formatting';
import { Cpu, Zap, Factory, Clock, Award } from 'lucide-react';
import { Machine } from '../../types/machine';

interface KPIOverviewProps {
  machines: Machine[];
}

export const KPIOverview: React.FC<KPIOverviewProps> = ({ machines }) => {
  const total = machines.length;
  const running = machines.filter(m => m.status === 'RUNNING').length;
  
  const avgUtil = machines.reduce((acc, m) => acc + m.metrics.utilization, 0) / (total || 1);
  const totalProd = machines.reduce((acc, m) => acc + m.metrics.production, 0);
  const avgOee = machines.reduce((acc, m) => acc + m.metrics.oee, 0) / (total || 1);
  
  // Downtime calculation: count of non-running machines * estimated hours
  const errorCount = machines.filter(m => m.status === 'ERROR').length;
  const idleCount = machines.filter(m => m.status === 'IDLE').length;
  const downtimeHours = Number((errorCount * 2.5 + idleCount * 1.2).toFixed(1));

  const kpis = [
    {
      title: 'Fleet Operational Status',
      value: `${running}/${total}`,
      unit: 'Active Assets',
      metricKey: 'utilization',
      current: running,
      previous: total - 1,
      icon: Cpu,
      subtext: `${((running / total) * 100).toFixed(0)}% Fleet Availability`
    },
    {
      title: 'Average Fleet Utilization',
      value: `${avgUtil.toFixed(1)}%`,
      unit: 'Nominal Rating',
      metricKey: 'utilization',
      current: avgUtil,
      previous: 88.5,
      icon: Zap,
      subtext: 'Target >= 90.0%'
    },
    {
      title: 'Total Production Rate',
      value: formatNumber(totalProd),
      unit: 'Units / Hour',
      metricKey: 'production',
      current: totalProd,
      previous: totalProd * 0.96,
      icon: Factory,
      subtext: 'Combined Weaving & Spinning'
    },
    {
      title: 'Shift Downtime',
      value: `${downtimeHours}h`,
      unit: 'Lost Capacity',
      metricKey: 'downtime',
      current: downtimeHours,
      previous: 4.8, // Previous was 4.8 hours
      icon: Clock,
      subtext: 'Includes stops & idle'
    },
    {
      title: 'Overall OEE Score',
      value: `${avgOee.toFixed(1)}%`,
      unit: 'Combined Efficiency',
      metricKey: 'oee',
      current: avgOee,
      previous: 84.5,
      icon: Award,
      subtext: 'World Class >= 85.0%'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <Card key={idx} padding="sm" className="flex flex-col justify-between hover:border-accent/40 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-semibold text-txt-secondary uppercase tracking-wider block font-mono">
                  {kpi.title}
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-txt-primary tracking-tight">
                    {kpi.value}
                  </span>
                  <span className="text-[11px] font-medium text-txt-muted">{kpi.unit}</span>
                </div>
              </div>
              <div className="p-2 bg-bg-tertiary rounded-lg text-txt-secondary shrink-0">
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-surface-border/60 text-xs">
              <DeltaBadge metricKey={kpi.metricKey} current={kpi.current} previous={kpi.previous} />
              <span className="text-[10px] text-txt-muted truncate pl-1 font-mono">{kpi.subtext}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
