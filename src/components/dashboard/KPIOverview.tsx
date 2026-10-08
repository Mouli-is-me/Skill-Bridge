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
  
  const errorCount = machines.filter(m => m.status === 'ERROR').length;
  const idleCount = machines.filter(m => m.status === 'IDLE').length;
  const downtimeHours = Number((errorCount * 2.5 + idleCount * 1.2).toFixed(1));

  const kpis = [
    {
      title: 'Fleet Status',
      value: `${running}/${total}`,
      unit: 'Active',
      metricKey: 'utilization',
      current: running,
      previous: total - 1,
      icon: Cpu,
      subtext: `${((running / total) * 100).toFixed(0)}% Available`
    },
    {
      title: 'Fleet Utilization',
      value: `${avgUtil.toFixed(1)}%`,
      unit: 'Nominal',
      metricKey: 'utilization',
      current: avgUtil,
      previous: 88.5,
      icon: Zap,
      subtext: 'Target >= 90.0%'
    },
    {
      title: 'Production Rate',
      value: formatNumber(totalProd),
      unit: 'u / h',
      metricKey: 'production',
      current: totalProd,
      previous: totalProd * 0.96,
      icon: Factory,
      subtext: 'Combined Output'
    },
    {
      title: 'Shift Downtime',
      value: `${downtimeHours}h`,
      unit: 'Capacity',
      metricKey: 'downtime',
      current: downtimeHours,
      previous: 4.8,
      icon: Clock,
      subtext: 'Includes stops'
    },
    {
      title: 'OEE Score',
      value: `${avgOee.toFixed(1)}%`,
      unit: 'Score',
      metricKey: 'oee',
      current: avgOee,
      previous: 84.5,
      icon: Award,
      subtext: 'World Class >= 85%'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <Card key={idx} padding="sm" className="flex flex-col justify-between border-surface-border hover:border-surface-border/80 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono text-txt-muted uppercase tracking-wider block">
                  {kpi.title}
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl font-bold font-mono text-txt-primary tracking-tight">
                    {kpi.value}
                  </span>
                  <span className="text-[10px] text-txt-muted">{kpi.unit}</span>
                </div>
              </div>
              <div className="p-1.5 bg-bg-secondary rounded-xs text-txt-muted shrink-0">
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-surface-border text-xs">
              <DeltaBadge metricKey={kpi.metricKey} current={kpi.current} previous={kpi.previous} />
              <span className="text-[10px] font-mono text-txt-muted truncate">{kpi.subtext}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
